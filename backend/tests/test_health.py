import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.config import Settings
from app.main import create_app
from app.services import health as health_service


@pytest.fixture
def client():
    settings = Settings(
        _env_file=None,
        postgres_password="fake-secret",
        cors_origins=["http://localhost:5173"],
    )
    with TestClient(create_app(settings)) as client:
        yield client


def test_liveness_is_independent_of_database(client, monkeypatch):
    async def unexpected_ping(engine):
        pytest.fail("Liveness queried PostgreSQL")

    monkeypatch.setattr(health_service, "ping_database", unexpected_ping)
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["cache-control"] == "no-store"


@pytest.mark.parametrize(
    "error",
    [
        None,
        OperationalError("SELECT 1", None, OSError("private database detail")),
        TimeoutError(),
    ],
)
def test_database_health_status(client, monkeypatch, error):
    async def ping(engine):
        if error is not None:
            raise error

    monkeypatch.setattr(health_service, "ping_database", ping)
    response = client.get("/api/v1/health/db")
    assert response.status_code == (200 if error is None else 503)
    assert response.json() == {"status": "ok" if error is None else "unavailable"}
    assert response.headers["cache-control"] == "no-store"


@pytest.mark.parametrize(
    ("origin", "expected"),
    [("http://localhost:5173", 200), ("https://example.test", 400)],
)
def test_cors_only_allows_configured_origins(client, origin, expected):
    response = client.options(
        "/api/v1/health/db",
        headers={"Origin": origin, "Access-Control-Request-Method": "GET"},
    )
    assert response.status_code == expected
    assert response.headers.get("access-control-allow-origin") == (
        origin if expected == 200 else None
    )
    assert "access-control-allow-credentials" not in response.headers


def test_public_lead_route_only_allows_post(client):
    paths = client.get("/openapi.json").json()["paths"]
    assert set(paths) == {"/api/v1/health", "/api/v1/health/db", "/api/v1/leads"}
    assert set(paths["/api/v1/leads"]) == {"post"}
    assert client.get("/api/v1/leads").status_code == 405
    assert (
        client.get("/api/v1/leads/00000000-0000-0000-0000-000000000000").status_code
        == 404
    )


@pytest.mark.skipif(
    os.environ.get("TIBON_TEST_POSTGRES") != "1", reason="requires PostgreSQL"
)
def test_live_database_health():
    with TestClient(create_app()) as client:
        assert client.get("/api/v1/health/db").json() == {"status": "ok"}
