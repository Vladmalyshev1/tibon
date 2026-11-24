from asyncio import get_running_loop, timeout, timeout_at, to_thread
from collections.abc import Callable, Coroutine
from typing import Annotated, Any
from uuid import UUID

from asyncpg import PostgresError
from fastapi import APIRouter, Header, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import APIRoute
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.exceptions import HTTPException
from starlette.types import Message

from app.models.lead import LeadSource
from app.repositories.leads import get_download_source
from app.schemas.lead import LeadCreate, LeadCreated
from app.services.leads import (
    InvalidEventDate,
    SubmissionConflict,
    SubmissionUnavailable,
    submit_lead,
)
from app.services.rate_limit import LeadRateLimit

MAX_BODY_BYTES = 8192
BODY_TIMEOUT_SECONDS = 5
NO_STORE = {"Cache-Control": "no-store"}
MENU_FILES = {LeadSource.MENU_ADULTS: "adults.pdf", LeadSource.MENU_KIDS: "kids.pdf"}


def enforce_lead_rate_limit(request: Request, limiter: LeadRateLimit) -> None:
    client = request.client.host if request.client else None
    retry_after = limiter.retry_after(client)
    if retry_after is not None:
        raise HTTPException(
            429, "Too many requests", {**NO_STORE, "Retry-After": str(retry_after)}
        )


class LeadSubmissionRoute(APIRoute):
    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        handle = super().get_route_handler()

        async def guarded(request: Request) -> Response:
            enforce_lead_rate_limit(
                request, request.app.state.lead_submission_rate_limit
            )
            if (
                request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
                != "application/json"
            ):
                raise HTTPException(
                    415, "Content-Type must be application/json", NO_STORE
                )

            received_bytes = 0
            deadline = get_running_loop().time() + BODY_TIMEOUT_SECONDS

            async def receive() -> Message:
                nonlocal received_bytes
                try:
                    async with timeout_at(deadline):
                        message = await request.receive()
                except TimeoutError:
                    raise HTTPException(
                        408, "Request body timed out", NO_STORE
                    ) from None
                received_bytes += len(message.get("body", b""))
                if received_bytes > MAX_BODY_BYTES:
                    raise HTTPException(413, "Request body too large", NO_STORE)
                return message

            try:
                return await handle(Request(request.scope, receive))
            except HTTPException as error:
                if error.status_code != 400:
                    raise
                # FastAPI also uses 400 for body decoding errors such as invalid UTF-8.
                return JSONResponse(
                    {"errors": {"body": "invalid"}}, status_code=422, headers=NO_STORE
                )

        return guarded


router = APIRouter(tags=["leads"])
submission_router = APIRouter(route_class=LeadSubmissionRoute)


async def validation_error(
    _request: Request, error: RequestValidationError
) -> JSONResponse:
    errors: dict[str, str] = {}
    for issue in error.errors():
        source, *parts = issue["loc"]
        field = parts[0] if source == "body" and parts else None
        if field not in LeadCreate.model_fields:
            field = "body"
        errors[field] = (
            "required" if issue["type"] == "missing" and field != "body" else "invalid"
        )
    return JSONResponse({"errors": errors}, status_code=422, headers=NO_STORE)


@submission_router.post(
    "/leads",
    status_code=201,
    response_model=LeadCreated,
    responses={
        200: {
            "model": LeadCreated,
            "description": "The same submission was already saved",
        },
        409: {"description": "Submission key reused with a different payload"},
        408: {"description": "Request body timed out"},
        413: {"description": "Request body too large"},
        415: {"description": "Unsupported media type"},
        422: {
            "description": "Invalid request",
            "content": {
                "application/json": {
                    "example": {"errors": {"phone": "invalid"}},
                }
            },
        },
        429: {"description": "Too many requests"},
        503: {"description": "Service unavailable"},
    },
)
async def create_lead(
    payload: LeadCreate,
    request: Request,
    response: Response,
    idempotency_key: Annotated[UUID | None, Header()] = None,
) -> LeadCreated | Response:
    if payload.source is not None and (
        idempotency_key is None or idempotency_key.version != 4
    ):
        return JSONResponse(
            {"errors": {"body": "invalid"}}, status_code=422, headers=NO_STORE
        )
    try:
        lead_id, created = await submit_lead(
            request.app.state.database_engine, payload, idempotency_key
        )
    except SubmissionConflict:
        raise HTTPException(409, "Submission key already used", NO_STORE) from None
    except InvalidEventDate:
        return JSONResponse(
            {"errors": {"date": "invalid"}}, status_code=422, headers=NO_STORE
        )
    except SubmissionUnavailable:
        raise HTTPException(503, "Service unavailable", NO_STORE) from None

    response.headers.update(NO_STORE)
    if not created:
        response.status_code = 200
    return LeadCreated(id=lead_id)


router.include_router(submission_router)


@router.get(
    "/leads/{lead_id}/menu",
    response_class=FileResponse,
    responses={
        200: {
            "content": {
                "application/pdf": {"schema": {"type": "string", "format": "binary"}}
            }
        },
        404: {"description": "No authorized menu request"},
        503: {"description": "Menu download is unavailable"},
    },
)
async def download_menu(
    lead_id: UUID,
    request: Request,
    idempotency_key: Annotated[UUID | None, Header()] = None,
) -> FileResponse:
    enforce_lead_rate_limit(request, request.app.state.menu_download_rate_limit)
    if idempotency_key is None:
        raise HTTPException(404, "Menu request not found", NO_STORE)
    try:
        async with (
            timeout(5),
            AsyncSession(request.app.state.database_engine) as session,
        ):
            source = await get_download_source(session, lead_id, idempotency_key)
    except (PostgresError, SQLAlchemyError, OSError):
        raise HTTPException(503, "Service unavailable", NO_STORE) from None
    if source is None:
        raise HTTPException(404, "Menu request not found", NO_STORE)
    filename = MENU_FILES[source]
    path = request.app.state.menu_pdf_dir / filename
    try:
        if not await to_thread(path.is_file):
            raise HTTPException(503, "Menu file unavailable", NO_STORE)
    except OSError:
        raise HTTPException(503, "Menu file unavailable", NO_STORE) from None
    return FileResponse(
        path,
        media_type="application/pdf",
        filename=filename,
        headers={
            **NO_STORE,
            "X-Content-Type-Options": "nosniff",
        },
    )
