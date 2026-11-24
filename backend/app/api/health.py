from typing import Literal

from fastapi import APIRouter, Request, Response
from pydantic import BaseModel

from app.services.health import database_is_available

router = APIRouter(prefix="/health", tags=["health"])
database_router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok"]


class DatabaseHealthResponse(BaseModel):
    status: Literal["ok", "unavailable"]


@router.get("")
async def health(response: Response) -> HealthResponse:
    response.headers["Cache-Control"] = "no-store"
    return HealthResponse(status="ok")


@database_router.get("/db", responses={503: {"model": DatabaseHealthResponse}})
async def database_health(
    request: Request, response: Response
) -> DatabaseHealthResponse:
    response.headers["Cache-Control"] = "no-store"
    if await database_is_available(request.app.state.database_engine):
        return DatabaseHealthResponse(status="ok")
    response.status_code = 503
    return DatabaseHealthResponse(status="unavailable")
