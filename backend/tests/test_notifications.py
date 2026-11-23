import asyncio
import json
import logging
from datetime import date, timedelta
from uuid import uuid4

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, TelegramSettings
from app.main import create_app
from app.models import Lead, TelegramNotification
from app.models.lead import LeadFormat, LeadSource
from app.notifications import delivery_status
from app.repositories.notifications import (
    MAX_ATTEMPTS,
    claim_notification,
    finish_notification,
    retry_failed_notification,
)
from app.schemas.lead import LeadCreate
from app.services.leads import SubmissionUnavailable, submit_lead
from app.services.notifications import deliver_next
from app.services.telegram import (
    TelegramClient,
    TelegramDeliveryError,
    notification_text,
    telegram_http_client,
)

TOKEN = "12345:mock-token"
CHAT_ID = -123456
PAYLOAD = LeadCreate(
    name="Synthetic record", phone="+70000000701", format="kids", consent=True
)


def test_telegram_settings_can_be_empty_and_malformed_secrets_are_hidden():
    assert (
        TelegramSettings(
            _env_file=None, telegram_bot_token="", telegram_chat_id=""
        ).telegram_bot_token
        is None
    )
    with pytest.raises(ValidationError) as invalid:
        TelegramSettings(
            _env_file=None, telegram_bot_token="synthetic-secret-without-colon"
        )
    assert "synthetic-secret-without-colon" not in str(invalid.value)
    assert TOKEN not in repr(
        TelegramSettings(
            _env_file=None, telegram_bot_token=TOKEN, telegram_chat_id=CHAT_ID
        )
    )
    assert Settings(
        _env_file=None, postgres_password="example", telegram_bot_token="ignored"
    ).postgres_password


def test_message_omits_unfilled_fields_and_formats_plain_text():
    lead = Lead(
        id=uuid4(),
        name=PAYLOAD.name,
        phone=PAYLOAD.phone,
        format=LeadFormat.KIDS,
        consent=True,
    )
    plain = notification_text(lead)
    for value in (str(lead.id), PAYLOAD.name, PAYLOAD.phone, "Для детей"):
        assert value in plain
    for label in ("Дата:", "Гостей:", "Комментарий:", "Источник:"):
        assert label not in plain

    lead.event_date = date(2099, 2, 3)
    lead.guests = 12
    lead.comment = "Пример <b>\n новой строки"
    lead.source = LeadSource.MENU_KIDS
    full = notification_text(lead)
    assert "Дата: 03.02.2099" in full
    assert "Гостей: 12" in full
    assert "Комментарий: Пример <b> новой строки" in full
    assert "Источник: Запрос детского меню" in full


def test_telegram_sender_uses_only_configured_chat_and_disables_preview_and_logs(
    caplog,
):
    caplog.set_level(logging.DEBUG)

    def mock(request):
        assert request.url.host == "api.telegram.org"
        assert request.url.path == f"/bot{TOKEN}/sendMessage"
        assert json.loads(request.content) == {
            "chat_id": CHAT_ID,
            "text": "Synthetic message",
            "protect_content": True,
            "link_preview_options": {"is_disabled": True},
        }
        return httpx.Response(200, json={"ok": True, "result": {"message_id": 7}})

    async def run():
        async with telegram_http_client(transport=httpx.MockTransport(mock)) as http:
            await TelegramClient(http, TOKEN).send_message(CHAT_ID, "Synthetic message")

    asyncio.run(run())
    assert TOKEN not in caplog.text and "Synthetic message" not in caplog.text


def test_chat_discovery_returns_ids_for_start_commands_only():
    def mock(request):
        assert request.url.path.endswith("/getUpdates")
        return httpx.Response(
            200,
            json={
                "ok": True,
                "result": [
                    {"message": {"text": "/start", "chat": {"id": 29}}},
                    {"message": {"text": "/start@TestBot", "chat": {"id": CHAT_ID}}},
                    {"message": {"text": "/start", "chat": {"id": 29}}},
                    {"message": {"text": "Synthetic text", "chat": {"id": 7}}},
                    {"message": {"chat": {"id": 11}}},
                ],
            },
        )

    async def run():
        async with telegram_http_client(transport=httpx.MockTransport(mock)) as http:
            assert await TelegramClient(http, TOKEN).chat_ids() == [CHAT_ID, 29]

    asyncio.run(run())


@pytest.mark.parametrize(
    ("result", "code", "retry", "delay"),
    [
        (
            httpx.Response(429, json={"ok": False, "parameters": {"retry_after": 75}}),
            "rate_limited",
            True,
            75,
        ),
        (
            httpx.Response(503, text="Synthetic upstream content"),
            "telegram_unavailable",
            True,
            0,
        ),
        (
            httpx.Response(200, json={"ok": False, "error_code": 403}),
            "telegram_rejected",
            False,
            0,
        ),
        (httpx.Response(401, json={"ok": False}), "telegram_rejected", False, 0),
        (
            httpx.Response(200, json={"ok": True, "result": {}}),
            "invalid_response",
            True,
            0,
        ),
        (
            httpx.Response(200, text="Synthetic upstream content"),
            "invalid_response",
            True,
            0,
        ),
        (httpx.ConnectError("Synthetic upstream content"), "network", True, 0),
        (httpx.ReadTimeout("Synthetic upstream content"), "network", True, 0),
    ],
)
def test_telegram_failure_is_classified_without_upstream_details(
    result, code, retry, delay
):
    def mock(_request):
        if isinstance(result, Exception):
            raise result
        return result

    async def run():
        async with telegram_http_client(transport=httpx.MockTransport(mock)) as http:
            with pytest.raises(TelegramDeliveryError) as error:
                await TelegramClient(http, TOKEN).send_message(
                    CHAT_ID, "Synthetic message"
                )
        assert (error.value.code, error.value.retry, error.value.retry_after) == (
            code,
            retry,
            delay,
        )
        assert str(error.value) == code

    asyncio.run(run())


def test_worker_claims_once_across_concurrent_consumers(postgres_schema):
    settings, scoped_engine = postgres_schema

    async def run():
        engine = scoped_engine(settings)
        in_flight = asyncio.Event()
        finish_send = asyncio.Event()
        calls = []

        async def mock(request):
            calls.append(json.loads(request.content)["text"])
            in_flight.set()
            await finish_send.wait()
            return httpx.Response(200, json={"ok": True, "result": {"message_id": 12}})

        try:
            lead_id, created = await submit_lead(engine, PAYLOAD, uuid4())
            assert created
            async with telegram_http_client(
                transport=httpx.MockTransport(mock)
            ) as http:
                telegram = TelegramClient(http, TOKEN)
                async with asyncio.TaskGroup() as tasks:
                    first = tasks.create_task(deliver_next(engine, telegram, CHAT_ID))
                    await asyncio.wait_for(in_flight.wait(), 3)
                    try:
                        assert not await deliver_next(engine, telegram, CHAT_ID)
                        assert (await delivery_status(engine, lead_id))[
                            "status"
                        ] == "sending"
                    finally:
                        finish_send.set()
                assert first.result()
            assert len(calls) == 1 and str(lead_id) in calls[0]
            status = await delivery_status(engine, lead_id)
            assert (
                status["status"] == "sent"
                and status["sent_at"]
                and status["attempts"] == 1
            )
            assert await delivery_status(engine, None) == {
                "pending": 0,
                "sending": 0,
                "sent": 1,
                "failed": 0,
            }
            assert PAYLOAD.phone not in str(status) and PAYLOAD.name not in str(status)
        finally:
            await engine.dispose()

    asyncio.run(run())


def test_callback_api_persists_once_and_worker_sends_only_contact(postgres_schema):
    settings, scoped_engine = postgres_schema
    body = {
        "name": "Synthetic Callback",
        "phone": "+70000000703",
        "format": "callback",
        "consent": True,
    }
    headers = {"Idempotency-Key": str(uuid4())}
    with TestClient(create_app(settings)) as client:
        details = {
            "date": "2099-01-01", "guests": 10, "comment": "Synthetic", "source": "menu_kids"
        }
        invalid = client.post("/api/v1/leads", json=body | details, headers=headers)
        assert invalid.status_code == 422
        assert invalid.json() == {"errors": dict.fromkeys(details, "invalid")}
        saved = client.post("/api/v1/leads", json=body, headers=headers)
        assert saved.status_code == 201
        replay = client.post("/api/v1/leads", json=body, headers=headers)
        assert replay.status_code == 200 and replay.json() == saved.json()
        assert client.get(f"/api/v1/leads/{saved.json()['id']}/menu", headers=headers).status_code == 404

    async def run():
        engine = scoped_engine(settings)
        calls = []

        def mock(request):
            calls.append(json.loads(request.content))
            return httpx.Response(200, json={"ok": True, "result": {"message_id": 12}})

        try:
            async with AsyncSession(engine) as session:
                lead = (await session.scalars(select(Lead))).one()
                assert str(lead.id) == saved.json()["id"]
                assert lead.format == LeadFormat.CALLBACK and lead.consent
                assert (lead.name, lead.phone) == (body["name"], body["phone"])
                assert (lead.event_date, lead.guests, lead.comment, lead.source) == (None,) * 4
                notification = (await session.scalars(select(TelegramNotification))).one()
                assert notification.lead_id == lead.id and notification.status == "pending"

            async with telegram_http_client(transport=httpx.MockTransport(mock)) as http:
                telegram = TelegramClient(http, TOKEN)
                assert await deliver_next(engine, telegram, CHAT_ID)
                assert not await deliver_next(engine, telegram, CHAT_ID)
            assert (await delivery_status(engine, lead.id))["status"] == "sent"
            assert len(calls) == 1 and calls[0]["chat_id"] == CHAT_ID
            assert calls[0]["text"] == (
                "Новая заявка: обратный звонок\n"
                "Имя: Synthetic Callback\n"
                "Телефон: +70000000703"
            )
        finally:
            await engine.dispose()

    asyncio.run(run())


def test_outbox_insert_failure_rolls_back_the_lead(postgres_schema):
    settings, scoped_engine = postgres_schema

    async def run():
        engine = scoped_engine(settings)
        try:
            async with engine.begin() as connection:
                await connection.execute(
                    text("ALTER TABLE telegram_notifications ADD CHECK (attempts < 0)")
                )
            with pytest.raises(SubmissionUnavailable):
                await submit_lead(engine, PAYLOAD, uuid4())
            async with engine.connect() as connection:
                assert (
                    await connection.scalar(select(func.count()).select_from(Lead)) == 0
                )
        finally:
            await engine.dispose()

    asyncio.run(run())


async def make_due(engine, lead_id):
    async with engine.begin() as connection:
        await connection.execute(
            update(TelegramNotification)
            .where(TelegramNotification.lead_id == lead_id)
            .values(available_at=func.now())
        )


def test_worker_backoff_exhaustion_and_manual_recovery(postgres_schema):
    settings, scoped_engine = postgres_schema
    attempts = iter(range(1, MAX_ATTEMPTS + 2))

    def mock(request):
        attempt = next(attempts)
        if attempt == 1:
            raise httpx.ConnectError("Synthetic network failure", request=request)
        if attempt == 2:
            return httpx.Response(
                429, json={"ok": False, "parameters": {"retry_after": 75}}
            )
        if attempt <= MAX_ATTEMPTS:
            return httpx.Response(503)
        return httpx.Response(200, json={"ok": True, "result": {"message_id": 99}})

    async def run():
        engine = scoped_engine(settings)
        try:
            lead_id, _ = await submit_lead(engine, PAYLOAD, None)
            async with telegram_http_client(
                transport=httpx.MockTransport(mock)
            ) as http:
                telegram = TelegramClient(http, TOKEN)
                for index in range(1, MAX_ATTEMPTS + 1):
                    assert await deliver_next(engine, telegram, CHAT_ID)
                    status = await delivery_status(engine, lead_id)
                    assert status["attempts"] == index
                    assert not await deliver_next(engine, telegram, CHAT_ID)
                    if index == MAX_ATTEMPTS:
                        assert (
                            status["status"] == "failed"
                            and status["last_error"] == "telegram_unavailable"
                        )
                    else:
                        assert status["status"] == "pending"
                        async with engine.connect() as connection:
                            now = await connection.scalar(select(func.now()))
                        backoff = 75 if index == 2 else 15 * 2 ** (index - 1)
                        assert status["available_at"] >= now + timedelta(
                            seconds=backoff - 2
                        )
                        await make_due(engine, lead_id)

                async with AsyncSession(engine) as session, session.begin():
                    assert await retry_failed_notification(session, lead_id)
                    assert not await retry_failed_notification(session, lead_id)
                assert await deliver_next(engine, telegram, CHAT_ID)
                assert (await delivery_status(engine, lead_id))["status"] == "sent"
        finally:
            await engine.dispose()

    asyncio.run(run())


def test_transient_failure_recovers_automatically(postgres_schema):
    settings, scoped_engine = postgres_schema
    responses = iter(
        [
            httpx.Response(502),
            httpx.Response(200, json={"ok": True, "result": {"message_id": 1}}),
        ]
    )

    async def run():
        engine = scoped_engine(settings)
        try:
            lead_id, _ = await submit_lead(engine, PAYLOAD, None)
            async with telegram_http_client(
                transport=httpx.MockTransport(lambda _: next(responses))
            ) as http:
                telegram = TelegramClient(http, TOKEN)
                assert await deliver_next(engine, telegram, CHAT_ID)
                assert (await delivery_status(engine, lead_id))["status"] == "pending"
                await make_due(engine, lead_id)
                assert await deliver_next(engine, telegram, CHAT_ID)
                status = await delivery_status(engine, lead_id)
                assert (
                    status["status"] == "sent"
                    and status["attempts"] == 2
                    and status["last_error"] is None
                )
        finally:
            await engine.dispose()

    asyncio.run(run())


def test_expired_lease_is_reclaimed_and_stale_worker_cannot_finish(postgres_schema):
    settings, scoped_engine = postgres_schema

    async def run():
        engine = scoped_engine(settings)
        try:
            lead_id, _ = await submit_lead(engine, PAYLOAD, None)
            async with (
                AsyncSession(engine, expire_on_commit=False) as session,
                session.begin(),
            ):
                old = await claim_notification(session)
            assert old is not None
            await make_due(engine, lead_id)
            async with (
                AsyncSession(engine, expire_on_commit=False) as session,
                session.begin(),
            ):
                current = await claim_notification(session)
            assert current is not None and current.attempt == 2
            assert current.lease_id != old.lease_id
            async with AsyncSession(engine) as session, session.begin():
                await finish_notification(session, old)
            assert (await delivery_status(engine, lead_id))["status"] == "sending"
            async with engine.begin() as connection:
                await connection.execute(
                    update(TelegramNotification)
                    .where(TelegramNotification.lead_id == lead_id)
                    .values(attempts=MAX_ATTEMPTS, available_at=func.now())
                )
            async with AsyncSession(engine) as session, session.begin():
                assert await claim_notification(session) is None
            status = await delivery_status(engine, lead_id)
            assert (
                status["status"] == "failed" and status["last_error"] == "lease_expired"
            )
        finally:
            await engine.dispose()

    asyncio.run(run())
