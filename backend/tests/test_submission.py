import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from uuid import UUID, uuid4

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.main import create_app
from app.models import TelegramNotification
from app.models.lead import Lead, LeadStatus
from app.schemas.lead import STUDIO_TIMEZONE
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
        ({"consent_version": "unknown"}, None, {"consent_version": "invalid"}),
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


@pytest.mark.parametrize("version", [None, "lead-consent-v1", "lead-consent-v2"])
def test_preserves_submitted_consent_version(client, monkeypatch, version):
    lead_id = uuid4()

    async def save(_engine, payload, _idempotency_key):
        assert payload.consent_version == version
        return lead_id, True

    monkeypatch.setattr("app.api.leads.submit_lead", save)
    data = DRAFT if version is None else DRAFT | {"consent_version": version}
    response = client.post(PATH, json=data)
    assert response.status_code == 201
    assert response.json() == {"id": str(lead_id)}


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

    async def configure(*_args):
        pass

    monkeypatch.setattr(lead_service, "bound_lead_transaction", configure)
    monkeypatch.setattr(lead_service, "insert_lead", fail)
    response = client.post(PATH, json=DRAFT)
    assert response.status_code == 503
    assert response.json() == {"detail": "Service unavailable"}
    assert "private" not in caplog.text and DRAFT["phone"] not in caplog.text


def test_past_date_without_key_is_rejected_before_database_access(client):
    previous_day = datetime.now(STUDIO_TIMEZONE).date() - timedelta(days=1)
    response = client.post(PATH, json=DRAFT | {"date": previous_day.isoformat()})
    assert response.status_code == 422
    assert response.json() == {"errors": {"date": "invalid"}}


@pytest.mark.parametrize(
    ("format", "source"),
    [
        ("kids", "menu_adults"),
        ("adults", "menu_kids"),
        ("corporate", "menu_adults"),
        ("callback", "menu_kids"),
    ],
)
def test_rejects_mismatched_menu_format_before_saving(
    client, monkeypatch, format, source
):
    async def unexpected_save(*_args):
        pytest.fail("Invalid menu classification reached persistence")

    monkeypatch.setattr("app.api.leads.submit_lead", unexpected_save)
    response = client.post(
        PATH,
        json=DRAFT | {"format": format, "source": source},
        headers={"Idempotency-Key": str(uuid4())},
    )
    assert response.status_code == 422
    assert response.json() == {"errors": {"source": "invalid"}}
    assert response.headers["cache-control"] == "no-store"


def test_concurrent_retries_persist_a_single_lead(postgres_schema):
    settings, scoped_engine = postgres_schema
    headers = {"Idempotency-Key": str(uuid4())}
    body = DRAFT | {
        "name": "O'Neil",
        "date": "2099-01-01",
        "guests": 15,
        "source": "menu_kids",
        "consent_version": "lead-consent-v1",
        "comment": "Synthetic 'note'; literal text",
    }

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
        legacy_body = body.copy()
        legacy_body.pop("consent_version")
        assert client.post(PATH, json=legacy_body, headers=headers).status_code == 409

    async def verify():
        engine = scoped_engine(settings)
        try:
            async with AsyncSession(engine) as session:
                lead = (await session.scalars(select(Lead))).one()
                notification = (
                    await session.scalars(select(TelegramNotification))
                ).one()
                assert notification.lead_id == lead_id
                assert notification.status == "pending" and notification.attempts == 0
                assert lead.guests == 15 and lead.source == "menu_kids"
                assert lead.id == lead_id and lead.status is LeadStatus.NEW
                assert lead.consent_version == body["consent_version"]
                assert lead.consented_at == lead.created_at
                assert lead.consented_at.utcoffset() is not None
                assert (
                    lead.phone == DRAFT["phone"]
                    and lead.consent
                    and lead.name == body["name"]
                )
                assert (
                    lead.event_date.isoformat() == body["date"]
                    and lead.comment == body["comment"]
                )
        finally:
            await engine.dispose()

    asyncio.run(verify())


def test_committed_key_replays_after_event_date_passes(postgres_schema, monkeypatch):
    settings, _ = postgres_schema
    current_time = datetime(2099, 6, 1, 23, 59, tzinfo=STUDIO_TIMEZONE)

    class Clock:
        @staticmethod
        def now(tz):
            return current_time.astimezone(tz)

    monkeypatch.setattr(lead_service, "datetime", Clock)
    headers = {"Idempotency-Key": str(uuid4())}
    body = DRAFT | {"date": "2099-06-01"}
    with TestClient(create_app(settings)) as client:
        original = client.post(PATH, json=body, headers=headers)
        assert original.status_code == 201
        current_time += timedelta(minutes=2)
        replay = client.post(PATH, json=body, headers=headers)
        assert replay.status_code == 200 and replay.json() == original.json()
        assert (
            client.post(
                PATH, json=body | {"name": "Edited"}, headers=headers
            ).status_code
            == 409
        )
        new = client.post(PATH, json=body, headers={"Idempotency-Key": str(uuid4())})
        assert new.status_code == 422 and new.json() == {"errors": {"date": "invalid"}}


def test_failed_commit_rolls_back_and_same_key_can_be_retried(postgres_schema):
    settings, scoped_engine = postgres_schema
    key = uuid4()
    headers = {"Idempotency-Key": str(key)}

    async def run():
        engine = scoped_engine(settings)
        app = create_app(settings)
        try:
            async with engine.begin() as connection:
                await connection.execute(
                    text("CREATE TABLE permitted_keys (key uuid PRIMARY KEY)")
                )
                await connection.execute(
                    text(
                        "ALTER TABLE leads ADD FOREIGN KEY (idempotency_key) "
                        "REFERENCES permitted_keys(key) DEFERRABLE INITIALLY DEFERRED"
                    )
                )
            async with (
                app.router.lifespan_context(app),
                httpx.AsyncClient(
                    transport=httpx.ASGITransport(app=app), base_url="http://test"
                ) as client,
            ):
                failed = await client.post(PATH, json=DRAFT, headers=headers)
                assert failed.status_code == 503 and failed.json() == {
                    "detail": "Service unavailable"
                }
                async with engine.begin() as connection:
                    assert (
                        await connection.scalar(text("SELECT count(*) FROM leads")) == 0
                    )
                    assert (
                        await connection.scalar(
                            text("SELECT count(*) FROM telegram_notifications")
                        )
                        == 0
                    )
                    await connection.execute(
                        text("INSERT INTO permitted_keys VALUES (:key)"), {"key": key}
                    )
                created = await client.post(PATH, json=DRAFT, headers=headers)
                assert created.status_code == 201
                async with engine.connect() as connection:
                    assert (
                        await connection.scalar(text("SELECT count(*) FROM leads")) == 1
                    )
        finally:
            await engine.dispose()

    asyncio.run(run())


def test_database_lock_timeout_recovers_without_creating_a_duplicate(postgres_schema):
    settings, scoped_engine = postgres_schema
    headers = {"Idempotency-Key": str(uuid4())}

    async def run():
        engine = scoped_engine(settings)
        app = create_app(settings)
        try:
            async with (
                app.router.lifespan_context(app),
                httpx.AsyncClient(
                    transport=httpx.ASGITransport(app=app), base_url="http://test"
                ) as client,
            ):
                async with engine.begin() as connection:
                    await connection.execute(text("LOCK TABLE leads IN SHARE MODE"))
                    failed = await asyncio.wait_for(
                        client.post(PATH, json=DRAFT, headers=headers), 5
                    )
                    assert failed.status_code == 503 and failed.json() == {
                        "detail": "Service unavailable"
                    }
                    assert (
                        await connection.scalar(text("SELECT count(*) FROM leads")) == 0
                    )
                created = await client.post(PATH, json=DRAFT, headers=headers)
                replay = await client.post(PATH, json=DRAFT, headers=headers)
                assert created.status_code == 201
                assert replay.status_code == 200 and replay.json() == created.json()
                async with engine.connect() as connection:
                    assert (
                        await connection.scalar(text("SELECT count(*) FROM leads")) == 1
                    )
        finally:
            await engine.dispose()

    asyncio.run(run())


@pytest.mark.skipif(
    os.environ.get("TIBON_TEST_POSTGRES") != "1", reason="requires PostgreSQL"
)
def test_actual_unavailable_database_returns_503():
    config = Settings(postgres_db=f"missing_{uuid4().hex}")
    with TestClient(create_app(config)) as client:
        response = client.post(PATH, json=DRAFT)
        assert response.status_code == 503
        assert response.json() == {"detail": "Service unavailable"}
