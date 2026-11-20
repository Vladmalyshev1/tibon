import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from uuid import UUID, uuid4

import pytest
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.schema import CreateSchema, DropSchema

from alembic import command
from app.config import Settings
from app.database import create_database_engine
from app.main import create_app
from app.models.lead import Lead, LeadStatus
from app.services import leads as lead_service
from app.services import rate_limit

PATH = "/api/v1/leads"
DRAFT = {
    "name": "Synthetic",
    "phone": "+70000000000",
    "format": "kids",
    "consent": True,
}


@pytest.fixture
def client():
    config = Settings(
        _env_file=None,
        postgres_password="example",
        cors_origins=["http://localhost:5173"],
    )
    with TestClient(create_app(config)) as client:
        yield client


@pytest.mark.parametrize(
    ("changes", "missing", "errors"),
    [
        ({"phone": "private value"}, None, {"phone": "invalid"}),
        ({"consent": False}, None, {"consent": "invalid"}),
        ({}, "consent", {"consent": "required"}),
        ({"customer-supplied-field": "private value"}, None, {"body": "invalid"}),
    ],
)
def test_validation_errors_omit_submitted_input(client, changes, missing, errors):
    data = DRAFT | changes
    if missing:
        data.pop(missing)
    result = client.post(PATH, json=data)
    assert result.status_code == 422
    assert result.json() == {"errors": errors}
    assert result.headers["cache-control"] == "no-store"


def test_malformed_json_and_invalid_key_are_sanitized(client):
    malformed = client.post(
        PATH, content='{"private value":', headers={"Content-Type": "application/json"}
    )
    assert malformed.status_code == 422
    assert malformed.json() == {"errors": {"body": "invalid"}}
    bad_encoding = client.post(
        PATH, content=b'{"name":"\xff"}', headers={"Content-Type": "application/json"}
    )
    assert bad_encoding.status_code == 422
    assert bad_encoding.json() == {"errors": {"body": "invalid"}}
    invalid_key = client.post(
        PATH, json=DRAFT, headers={"Idempotency-Key": "private value"}
    )
    assert invalid_key.status_code == 422
    assert invalid_key.json() == {"errors": {"body": "invalid"}}


def test_rejects_oversize_and_non_json_requests(client):
    response = client.post(
        PATH,
        content=iter([b" " * 5000, b" " * 5000]),
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 413
    assert client.post(PATH, data=DRAFT).status_code == 415


def test_preflight_allows_only_configured_origin_and_submission_header(client):
    headers = {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type, idempotency-key",
    }
    accepted = client.options(
        PATH, headers=headers | {"Origin": "http://localhost:5173"}
    )
    assert accepted.status_code == 200
    assert accepted.headers["access-control-allow-origin"] == "http://localhost:5173"
    denied = client.options(PATH, headers=headers | {"Origin": "https://example.test"})
    assert denied.status_code == 400
    assert "access-control-allow-origin" not in denied.headers


def test_throttle_blocks_excess_attempts_until_window_expires(client, monkeypatch):
    now = 1.0
    monkeypatch.setattr(rate_limit, "monotonic", lambda: now)
    for _ in range(8):
        assert client.post(PATH, json={}).status_code == 422
    response = client.post(PATH, json={})
    assert response.status_code == 429 and response.headers["retry-after"] == "60"
    now += 60
    assert client.post(PATH, json={}).status_code == 422


def test_database_failure_does_not_echo_or_log_query_details(
    client, monkeypatch, caplog
):
    async def fail(*_args):
        raise OperationalError("private SQL", DRAFT, OSError("private DB error"))

    monkeypatch.setattr(lead_service, "insert_lead", fail)
    response = client.post(PATH, json=DRAFT)
    assert response.status_code == 503
    assert response.json() == {"detail": "Service unavailable"}
    assert "private" not in caplog.text and DRAFT["phone"] not in caplog.text


@pytest.fixture
def postgres_schema(monkeypatch):
    if os.environ.get("TIBON_TEST_POSTGRES") != "1":
        pytest.skip("requires PostgreSQL")
    settings = Settings()
    schema = f"test_m62_{uuid4().hex}"

    async def prepare():
        engine = create_database_engine(settings)
        try:
            async with engine.begin() as connection:
                await connection.execute(CreateSchema(schema))
        finally:
            await engine.dispose()

    def scoped_engine(_settings):
        return create_async_engine(
            settings.database_url,
            hide_parameters=True,
            connect_args={"server_settings": {"search_path": schema}},
        )

    async def migrate():
        engine = scoped_engine(settings)
        config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))

        def upgrade(connection):
            config.attributes["connection"] = connection
            command.upgrade(config, "head")

        try:
            async with engine.connect() as connection:
                await connection.run_sync(upgrade)
        finally:
            await engine.dispose()

    async def clean():
        engine = create_database_engine(settings)
        try:
            async with engine.begin() as connection:
                await connection.execute(DropSchema(schema, cascade=True))
        finally:
            await engine.dispose()

    asyncio.run(prepare())
    try:
        asyncio.run(migrate())
        monkeypatch.setattr("app.main.create_database_engine", scoped_engine)
        yield settings, scoped_engine
    finally:
        asyncio.run(clean())


def test_concurrent_retries_persist_a_single_lead(postgres_schema):
    settings, scoped_engine = postgres_schema
    headers = {"Idempotency-Key": str(uuid4())}
    body = DRAFT | {"date": "2099-01-01", "comment": "Synthetic note"}

    with TestClient(create_app(settings)) as client, ThreadPoolExecutor(2) as executor:
        responses = list(
            executor.map(
                lambda _: client.post(PATH, json=body, headers=headers), range(2)
            )
        )
        assert sorted(response.status_code for response in responses) == [200, 201]
        assert responses[0].json() == responses[1].json()
        assert set(responses[0].json()) == {"id"}
        lead_id = UUID(responses[0].json()["id"])
        conflict = client.post(
            PATH, json=body | {"comment": "Different"}, headers=headers
        )
        assert conflict.status_code == 409

    async def verify():
        engine = scoped_engine(settings)
        try:
            async with AsyncSession(engine) as session:
                lead = (await session.scalars(select(Lead))).one()
                assert lead.id == lead_id and lead.status is LeadStatus.NEW
                assert lead.phone == DRAFT["phone"] and lead.consent
                assert (
                    lead.event_date.isoformat() == body["date"]
                    and lead.comment == body["comment"]
                )
        finally:
            await engine.dispose()

    asyncio.run(verify())


@pytest.mark.skipif(
    os.environ.get("TIBON_TEST_POSTGRES") != "1", reason="requires PostgreSQL"
)
def test_actual_unavailable_database_returns_503():
    config = Settings(postgres_db=f"missing_{uuid4().hex}")
    with TestClient(create_app(config)) as client:
        response = client.post(PATH, json=DRAFT)
        assert response.status_code == 503
        assert response.json() == {"detail": "Service unavailable"}
