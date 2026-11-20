from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.api.health import router as health_router
from app.api.leads import router as leads_router
from app.api.leads import validation_error
from app.config import Settings
from app.database import create_database_engine
from app.services.rate_limit import LeadRateLimit


def create_app(settings: Settings | None = None) -> FastAPI:
    if settings is None:
        settings = Settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        engine = create_database_engine(settings)
        app.state.database_engine = engine
        app.state.menu_pdf_dir = settings.menu_pdf_dir
        app.state.lead_rate_limit = LeadRateLimit()
        try:
            yield
        finally:
            await engine.dispose()

    app = FastAPI(title="TIBON API", version="1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Idempotency-Key"],
        expose_headers=["Retry-After"],
    )
    if settings.trusted_proxy_ips:
        app.add_middleware(
            ProxyHeadersMiddleware,
            trusted_hosts=[str(address) for address in settings.trusted_proxy_ips],
        )
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(leads_router, prefix="/api/v1")
    app.add_exception_handler(RequestValidationError, validation_error)
    return app
