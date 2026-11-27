import asyncio
import json
import logging
from datetime import date, timedelta
from urllib.parse import parse_qs
from uuid import uuid4

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import NotificationSettings
from app.main import create_app
from app.models import Lead, TelegramNotification
from app.models.lead import LeadFormat, LeadSource, LeadStatus
from app.notifications import delivery_status, run_command
from app.repositories.notifications import (
    MAX_ATTEMPTS,
    claim_notification,
    finish_notification,
    retry_failed_notification,
)
from app.schemas.lead import LeadCreate
from app.services import notifications as worker_service
from app.services.leads import SubmissionUnavailable, submit_lead
from app.services.notification_providers import (
    MAX_API,
    VK_API,
    MaxNotificationProvider,
    NotificationConfigurationError,
    NotificationDeliveryError,
    create_notification_provider,
    notification_http_client,
)
from app.services.notifications import deliver_next, notification_text

TOKEN = "synthetic-secret-token"
CHAT_ID = -123456
MAX_SUCCESS = {"message": {"body": {"mid": "mid.test"}}}
PAYLOAD = LeadCreate(
    name="Synthetic record",
    phone="+70000000701",
    format="kids",
    consent=True,
    consent_version="lead-consent-v2",
)


def provider_settings(name):
    return NotificationSettings(
        _env_file=None,
        notification_provider=name,
        vk_community_token=TOKEN,
        vk_peer_id="2000000001",
        max_bot_token=TOKEN,
        max_chat_id=str(CHAT_ID),
    )


@pytest.mark.parametrize(
    ("name", "settings", "variable"),
    [
        ("vk", {}, "VK_COMMUNITY_TOKEN"),
        ("vk", {"vk_community_token": TOKEN}, "VK_PEER_ID"),
        ("max", {}, "MAX_BOT_TOKEN"),
        ("max", {"max_bot_token": TOKEN, "max_chat_id": "0"}, "MAX_CHAT_ID"),
    ],
)
def test_only_selected_provider_requires_token_and_id(name, settings, variable):
    config = NotificationSettings(
        _env_file=None, notification_provider=name, **settings
    )
    assert TOKEN not in repr(config)
    with pytest.raises(NotificationConfigurationError, match=variable):
        create_notification_provider(config, None)


def test_unknown_provider_does_not_echo_settings():
    with pytest.raises(ValidationError) as invalid:
        NotificationSettings(_env_file=None, notification_provider=TOKEN)
    assert TOKEN not in str(invalid.value)


def test_event_notification_includes_contact_and_filled_details():
    lead = Lead(
        id=uuid4(),
        name="Анна",
        phone="+79821176990",
        format=LeadFormat.CORPORATE,
        status=LeadStatus.CONFIRMED,
        event_date=date(2026, 12, 15),
        guests=12,
        comment="Хотим мастер-класс\n\nи ужин",
    )
    message = notification_text(lead)
    assert message.splitlines() == [
        "Новая заявка — TIBON",
        "Имя: Анна",
        "Телефон: +7 (982) 117-69-90",
        "Формат: Корпоратив",
        "Желаемая дата: 15.12.2026",
        "Количество гостей: 12",
        "Комментарий: Хотим мастер-класс и ужин",
    ]
    assert str(lead.id) not in message
    assert "Статус:" not in message


@pytest.mark.parametrize(
    ("source", "format", "format_label", "menu_label"),
    [
        (LeadSource.MENU_ADULTS, LeadFormat.ADULTS, "Для взрослых", "Взрослое"),
        (LeadSource.MENU_KIDS, LeadFormat.KIDS, "Для детей", "Детское"),
    ],
)
def test_menu_notification_shows_menu_type_and_omits_blank_fields(
    source, format, format_label, menu_label
):
    lead = Lead(
        name="Анна",
        phone="+79821176990",
        format=format,
        source=source,
        comment=" \n ",
    )
    assert notification_text(lead).splitlines() == [
        "Запрос меню — TIBON",
        "Имя: Анна",
        "Телефон: +7 (982) 117-69-90",
        f"Формат: {format_label}",
        f"Тип меню: {menu_label}",
    ]


@pytest.mark.parametrize("name", ["vk", "max"])
def test_sends_only_to_selected_provider_with_configured_destination(name, caplog):
    caplog.set_level(logging.DEBUG)
    calls = []
    notification_id = uuid4()
    message = notification_text(
        Lead(
            id=notification_id,
            name=PAYLOAD.name,
            phone=PAYLOAD.phone,
            format=PAYLOAD.format,
        )
    )

    def mock(request):
        assert request.method == "POST"
        if name == "vk":
            assert str(request.url) == VK_API
            form = {
                key: value[0]
                for key, value in parse_qs(request.content.decode()).items()
            }
            random_id = int(form.pop("random_id"))
            assert 0 < random_id <= 2**31 - 1
            assert form == {
                "access_token": TOKEN,
                "v": "5.199",
                "peer_id": "2000000001",
                "message": message,
            }
            calls.append(random_id)
            return httpx.Response(200, json={"response": 123})
        assert str(request.url) == f"{MAX_API}?chat_id={CHAT_ID}"
        assert request.headers["Authorization"] == TOKEN
        assert json.loads(request.content) == {
            "text": message,
            "notify": True,
        }
        calls.append(CHAT_ID)
        return httpx.Response(200, json=MAX_SUCCESS)

    async def run():
        async with notification_http_client(
            transport=httpx.MockTransport(mock)
        ) as http:
            provider = create_notification_provider(provider_settings(name), http)
            assert provider.name == name
            await provider.send_message(notification_id, message)
            if name == "vk":
                await provider.send_message(notification_id, message)

    asyncio.run(run())
    if name == "vk":
        assert len(calls) == 2 and calls[0] == calls[1]
    else:
        assert calls == [CHAT_ID]
    for private_value in (TOKEN, PAYLOAD.name, "+7 (000) 000-07-01", message):
        assert private_value not in caplog.text


@pytest.mark.parametrize("name", ["vk", "max"])
@pytest.mark.parametrize(
    ("result", "code", "retry", "delay"),
    [
        (httpx.Response(401, text=TOKEN), "authorization", False, 0),
        (httpx.Response(403), "authorization", False, 0),
        (httpx.Response(429, headers={"Retry-After": "75"}), "rate_limited", True, 75),
        (httpx.Response(503, text=TOKEN), "provider_unavailable", True, 0),
        (httpx.Response(200, json={"message": {}}), "invalid_response", True, 0),
        (httpx.ConnectError(TOKEN), "network", True, 0),
        (httpx.ReadTimeout(TOKEN), "network", True, 0),
    ],
)
def test_http_failure_sanitized(name, result, code, retry, delay):
    def mock(_request):
        if isinstance(result, Exception):
            raise result
        return result

    async def run():
        async with notification_http_client(
            transport=httpx.MockTransport(mock)
        ) as http:
            provider = create_notification_provider(provider_settings(name), http)
            with pytest.raises(NotificationDeliveryError) as error:
                await provider.send_message(uuid4(), "Synthetic message")
        assert (error.value.code, error.value.retry, error.value.retry_after) == (
            code,
            retry,
            delay,
        )
        assert str(error.value) == code

    asyncio.run(run())


@pytest.mark.parametrize(
    ("name", "payload", "code", "retry"),
    [
        (
            "vk",
            {"error": {"error_code": 5, "error_msg": TOKEN}},
            "authorization",
            False,
        ),
        ("vk", {"error": {"error_code": 901}}, "authorization", False),
        ("vk", {"error": {"error_code": 6}}, "rate_limited", True),
        ("vk", {"error": {"error_code": 10}}, "provider_unavailable", True),
        ("max", {"success": False, "message": TOKEN}, "provider_rejected", False),
    ],
)
def test_api_error_in_http_200(name, payload, code, retry):
    async def run():
        transport = httpx.MockTransport(lambda _: httpx.Response(200, json=payload))
        async with notification_http_client(transport=transport) as http:
            provider = create_notification_provider(provider_settings(name), http)
            with pytest.raises(NotificationDeliveryError, match=f"^{code}$") as failure:
                await provider.send_message(uuid4(), "Synthetic message")
            assert failure.value.retry == retry

    asyncio.run(run())


def test_test_send_never_opens_database(monkeypatch, capsys):
    from argparse import Namespace

    def mock(request):
        assert (
            json.loads(request.content)["text"] == "TIBON: тест доставки уведомлений."
        )
        return httpx.Response(200, json=MAX_SUCCESS)

    def unexpected_database(_settings):
        pytest.fail("test-send must not open the database")

    monkeypatch.setattr("app.notifications.create_database_engine", unexpected_database)
    monkeypatch.setattr(
        "app.notifications.NotificationSettings", lambda: provider_settings("max")
    )
    monkeypatch.setattr(
        "app.notifications.notification_http_client",
        lambda **_: notification_http_client(transport=httpx.MockTransport(mock)),
    )
    assert asyncio.run(run_command(Namespace(command="test-send"))) == 0
    assert "accepted by max" in capsys.readouterr().out


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
            return httpx.Response(200, json=MAX_SUCCESS)

        try:
            lead_id, created = await submit_lead(engine, PAYLOAD, uuid4())
            assert created
            async with notification_http_client(
                transport=httpx.MockTransport(mock)
            ) as http:
                provider = MaxNotificationProvider(http, TOKEN, CHAT_ID)
                async with asyncio.TaskGroup() as tasks:
                    first = tasks.create_task(deliver_next(engine, provider))
                    await asyncio.wait_for(in_flight.wait(), 3)
                    try:
                        assert not await deliver_next(engine, provider)
                        assert (await delivery_status(engine, lead_id))[
                            "status"
                        ] == "sending"
                    finally:
                        finish_send.set()
                assert first.result()
            assert len(calls) == 1 and str(lead_id) not in calls[0]
            assert f"Имя: {PAYLOAD.name}" in calls[0]
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


def test_switching_provider_leaves_sent_jobs_alone(postgres_schema):
    settings, scoped_engine = postgres_schema
    requests = []

    def mock(request):
        requests.append(request.url.host)
        if request.url.host == "api.vk.com":
            return httpx.Response(200, json={"response": 123})
        return httpx.Response(200, json=MAX_SUCCESS)

    async def run():
        engine = scoped_engine(settings)
        try:
            old_id, _ = await submit_lead(engine, PAYLOAD, None)
            transport = httpx.MockTransport(mock)
            async with notification_http_client(transport=transport) as http:
                vk = create_notification_provider(provider_settings("vk"), http)
                assert await deliver_next(engine, vk)
                old_status = await delivery_status(engine, old_id)
                assert old_status["status"] == "sent"

                new_id, _ = await submit_lead(engine, PAYLOAD, None)
                max_provider = create_notification_provider(
                    provider_settings("max"), http
                )
                assert await deliver_next(engine, max_provider)
                assert not await deliver_next(engine, max_provider)
                assert await delivery_status(engine, old_id) == old_status
                assert (await delivery_status(engine, new_id))["status"] == "sent"
        finally:
            await engine.dispose()

    asyncio.run(run())
    assert requests == ["api.vk.com", "platform-api2.max.ru"]


@pytest.mark.parametrize("version", [None, "lead-consent-v1"])
def test_vk_keeps_legacy_lead_without_sending_it(postgres_schema, version):
    settings, scoped_engine = postgres_schema

    def unexpected_request(_request):
        pytest.fail("VK must not receive legacy personal data")

    async def run():
        engine = scoped_engine(settings)
        try:
            lead_id, _ = await submit_lead(
                engine, PAYLOAD.model_copy(update={"consent_version": version}), None
            )
            async with notification_http_client(
                transport=httpx.MockTransport(unexpected_request)
            ) as http:
                provider = create_notification_provider(provider_settings("vk"), http)
                assert await deliver_next(engine, provider)

            job = await delivery_status(engine, lead_id)
            assert job["status"] == "failed"
            assert job["last_error"] == "vk_consent_required"
            async with AsyncSession(engine) as session:
                assert (await session.get(Lead, lead_id)).consent_version == version
        finally:
            await engine.dispose()

    asyncio.run(run())


def test_callback_api_persists_once_and_worker_sends_contact(postgres_schema):
    settings, scoped_engine = postgres_schema
    body = {
        "name": "Synthetic Callback",
        "phone": "+70000000703",
        "format": "callback",
        "consent": True,
        "consent_version": "lead-consent-v2",
    }
    headers = {"Idempotency-Key": str(uuid4())}
    with TestClient(create_app(settings)) as client:
        details = {
            "date": "2099-01-01",
            "guests": 10,
            "comment": "Synthetic",
            "source": "menu_kids",
        }
        invalid = client.post("/api/v1/leads", json=body | details, headers=headers)
        assert invalid.status_code == 422
        assert invalid.json() == {"errors": dict.fromkeys(details, "invalid")}
        saved = client.post("/api/v1/leads", json=body, headers=headers)
        assert saved.status_code == 201
        replay = client.post("/api/v1/leads", json=body, headers=headers)
        assert replay.status_code == 200 and replay.json() == saved.json()
        assert (
            client.get(
                f"/api/v1/leads/{saved.json()['id']}/menu", headers=headers
            ).status_code
            == 404
        )

    async def run():
        engine = scoped_engine(settings)
        calls = []

        def mock(request):
            calls.append(
                (request.url.params["chat_id"], json.loads(request.content)["text"])
            )
            return httpx.Response(200, json=MAX_SUCCESS)

        try:
            async with AsyncSession(engine) as session:
                lead = (await session.scalars(select(Lead))).one()
                assert str(lead.id) == saved.json()["id"]
                assert lead.format == LeadFormat.CALLBACK and lead.consent
                assert (lead.name, lead.phone) == (body["name"], body["phone"])
                assert (lead.event_date, lead.guests, lead.comment, lead.source) == (
                    None,
                ) * 4
                notification = (
                    await session.scalars(select(TelegramNotification))
                ).one()
                assert (
                    notification.lead_id == lead.id and notification.status == "pending"
                )

            async with notification_http_client(
                transport=httpx.MockTransport(mock)
            ) as http:
                provider = MaxNotificationProvider(http, TOKEN, CHAT_ID)
                assert await deliver_next(engine, provider)
                assert not await deliver_next(engine, provider)
            assert (await delivery_status(engine, lead.id))["status"] == "sent"
            assert len(calls) == 1 and calls[0][0] == str(CHAT_ID)
            assert calls[0][1].splitlines() == [
                "Новая заявка — TIBON",
                f"Имя: {body['name']}",
                "Телефон: +7 (000) 000-07-03",
                "Формат: Обратный звонок",
            ]
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


def test_worker_backoff_exhaustion_and_manual_recovery(postgres_schema, caplog):
    settings, scoped_engine = postgres_schema
    attempts = iter(range(1, MAX_ATTEMPTS + 2))
    caplog.set_level(logging.INFO, logger=worker_service.__name__)

    def mock(request):
        attempt = next(attempts)
        if attempt == 1:
            content = json.loads(request.content)["text"]
            raise httpx.ConnectError(f"{request.url} {content}", request=request)
        if attempt == 2:
            return httpx.Response(429, headers={"Retry-After": "75"})
        if attempt <= MAX_ATTEMPTS:
            return httpx.Response(503)
        return httpx.Response(200, json=MAX_SUCCESS)

    async def run():
        engine = scoped_engine(settings)
        try:
            lead_id, _ = await submit_lead(engine, PAYLOAD, None)
            async with notification_http_client(
                transport=httpx.MockTransport(mock)
            ) as http:
                provider = MaxNotificationProvider(http, TOKEN, CHAT_ID)
                for index in range(1, MAX_ATTEMPTS + 1):
                    assert await deliver_next(engine, provider)
                    status = await delivery_status(engine, lead_id)
                    assert status["attempts"] == index
                    assert not await deliver_next(engine, provider)
                    if index == MAX_ATTEMPTS:
                        assert (
                            status["status"] == "failed"
                            and status["last_error"] == "provider_unavailable"
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
                assert await deliver_next(engine, provider)
                assert (await delivery_status(engine, lead_id))["status"] == "sent"
        finally:
            await engine.dispose()

    asyncio.run(run())
    assert [
        (record.levelname, record.getMessage())
        for record in caplog.records
        if record.name == worker_service.__name__
    ] == [
        ("ERROR", "Notification delivery error (max): network"),
        ("WARNING", "Notification retry scheduled"),
        ("ERROR", "Notification delivery error (max): rate_limited"),
        ("WARNING", "Notification retry scheduled"),
        *[
            record
            for attempt in range(3, MAX_ATTEMPTS)
            for record in [
                ("ERROR", "Notification delivery error (max): provider_unavailable"),
                ("WARNING", "Notification retry scheduled"),
            ]
        ],
        ("ERROR", "Notification delivery error (max): provider_unavailable"),
        ("WARNING", "Notification permanently failed"),
        ("INFO", "Notification sent"),
    ]
    for private_value in (
        TOKEN,
        "platform-api2.max.ru",
        PAYLOAD.name,
        PAYLOAD.phone,
        "+7 (000) 000-07-01",
    ):
        assert private_value not in caplog.text


def test_worker_logs_lifecycle_without_logging_empty_polls(
    postgres_schema, monkeypatch, caplog
):
    settings, scoped_engine = postgres_schema
    caplog.set_level(logging.INFO, logger=worker_service.__name__)

    async def run():
        engine = scoped_engine(settings)
        two_polls = asyncio.Event()
        polls = 0

        async def observe_poll(*args):
            nonlocal polls
            assert not await deliver_next(*args)
            polls += 1
            if polls == 2:
                two_polls.set()
            return False

        def mock(_request):
            pytest.fail("An empty queue must not call MAX")

        monkeypatch.setattr(worker_service, "deliver_next", observe_poll)
        try:
            async with notification_http_client(
                transport=httpx.MockTransport(mock)
            ) as http:
                provider = MaxNotificationProvider(http, TOKEN, CHAT_ID)
                task = asyncio.create_task(worker_service.run_worker(engine, provider))
                try:
                    await asyncio.wait_for(two_polls.wait(), timeout=5)
                finally:
                    task.cancel()
                    with pytest.raises(asyncio.CancelledError):
                        await task
        finally:
            await engine.dispose()

    asyncio.run(run())
    assert [
        (record.levelname, record.getMessage())
        for record in caplog.records
        if record.name == worker_service.__name__
    ] == [
        ("INFO", "Notification worker started (max)"),
        ("INFO", "Database connected"),
        ("INFO", "Worker stopped"),
    ]


def test_transient_failure_recovers_automatically(postgres_schema):
    settings, scoped_engine = postgres_schema
    responses = iter(
        [
            httpx.Response(502),
            httpx.Response(200, json=MAX_SUCCESS),
        ]
    )

    async def run():
        engine = scoped_engine(settings)
        try:
            lead_id, _ = await submit_lead(engine, PAYLOAD, None)
            async with notification_http_client(
                transport=httpx.MockTransport(lambda _: next(responses))
            ) as http:
                provider = MaxNotificationProvider(http, TOKEN, CHAT_ID)
                assert await deliver_next(engine, provider)
                assert (await delivery_status(engine, lead_id))["status"] == "pending"
                await make_due(engine, lead_id)
                assert await deliver_next(engine, provider)
                status = await delivery_status(engine, lead_id)
                assert (
                    status["status"] == "sent"
                    and status["attempts"] == 2
                    and status["last_error"] is None
                )
        finally:
            await engine.dispose()

    asyncio.run(run())


def test_expired_lease_is_reclaimed_and_stale_worker_cannot_finish(
    postgres_schema, caplog
):
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
                assert await finish_notification(session, old) is None
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
    assert caplog.messages.count("Notification permanently failed") == 1
