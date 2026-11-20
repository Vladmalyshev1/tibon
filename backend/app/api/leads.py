from collections.abc import Callable, Coroutine
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Header, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from starlette.exceptions import HTTPException
from starlette.types import Message

from app.schemas.lead import LeadCreate, LeadCreated
from app.services.leads import SubmissionConflict, SubmissionUnavailable, submit_lead

MAX_BODY_BYTES = 8192
NO_STORE = {"Cache-Control": "no-store"}


class LeadSubmissionRoute(APIRoute):
    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        handle = super().get_route_handler()

        async def guarded(request: Request) -> Response:
            client = request.client.host if request.client else "unknown"
            retry_after = request.app.state.lead_rate_limit.retry_after(client)
            if retry_after is not None:
                raise HTTPException(
                    429,
                    "Too many requests",
                    {**NO_STORE, "Retry-After": str(retry_after)},
                )
            if (
                request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
                != "application/json"
            ):
                raise HTTPException(
                    415, "Content-Type must be application/json", NO_STORE
                )

            received_bytes = 0

            async def receive() -> Message:
                nonlocal received_bytes
                message = await request.receive()
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


router = APIRouter(tags=["leads"], route_class=LeadSubmissionRoute)


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


@router.post(
    "/leads",
    status_code=201,
    responses={
        200: {
            "model": LeadCreated,
            "description": "The same submission was already saved",
        },
        409: {"description": "Submission key reused with a different payload"},
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
) -> LeadCreated:
    try:
        lead_id, created = await submit_lead(
            request.app.state.database_engine, payload, idempotency_key
        )
    except SubmissionConflict:
        raise HTTPException(409, "Submission key already used", NO_STORE) from None
    except SubmissionUnavailable:
        raise HTTPException(503, "Service unavailable", NO_STORE) from None

    response.headers.update(NO_STORE)
    if not created:
        response.status_code = 200
    return LeadCreated(id=lead_id)
