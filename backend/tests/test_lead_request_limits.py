import asyncio

import httpx
import pytest
from fastapi.testclient import TestClient

from app.api import leads
from app.config import Settings
from app.main import create_app
from app.services import rate_limit

PATH = "/api/v1/leads"
MENU_PATH = f"{PATH}/00000000-0000-0000-0000-000000000000/menu"


def test_slow_body_times_out_without_echoing_input(monkeypatch):
    monkeypatch.setattr(leads, "BODY_TIMEOUT_SECONDS", 0.02)
    app = create_app(Settings(_env_file=None, postgres_password="example"))

    async def run():
        async def body():
            yield b'{"name":"private slow content'
            await asyncio.sleep(5)
            yield b'"}'

        async with (
            app.router.lifespan_context(app),
            httpx.AsyncClient(
                transport=httpx.ASGITransport(app=app), base_url="http://test"
            ) as client,
        ):
            response = await client.post(
                PATH, content=body(), headers={"Content-Type": "application/json"}
            )
        assert response.status_code == 408
        assert response.json() == {"detail": "Request body timed out"}
        assert response.headers["cache-control"] == "no-store"

    asyncio.run(run())


@pytest.mark.parametrize(
    ("peer", "can_forward"), [("192.0.2.5", True), ("192.0.2.99", False)]
)
def test_only_configured_proxy_can_supply_client_address(peer, can_forward):
    settings = Settings(
        _env_file=None, postgres_password="example", trusted_proxy_ips=["192.0.2.5"]
    )
    with TestClient(create_app(settings), client=(peer, 50000)) as client:
        forwarded = {"X-Forwarded-For": "198.51.100.1", "X-Forwarded-Proto": "https"}
        for _ in range(8):
            assert client.post(PATH, json={}, headers=forwarded).status_code == 422
        assert client.post(PATH, json={}, headers=forwarded).status_code == 429
        other = client.post(PATH, json={}, headers={"X-Forwarded-For": "198.51.100.2"})
        assert other.status_code == (422 if can_forward else 429)


def test_submission_and_menu_download_have_independent_quotas(monkeypatch):
    monkeypatch.setattr(rate_limit, "monotonic", lambda: 1)
    settings = Settings(_env_file=None, postgres_password="example")
    with TestClient(create_app(settings)) as client:
        for _ in range(8):
            assert client.post(PATH, json={}).status_code == 422
        assert client.post(PATH, json={}).status_code == 429

        for _ in range(8):
            assert client.get(MENU_PATH).status_code == 404
        limited = client.get(MENU_PATH)
        assert limited.status_code == 429
        assert limited.headers["retry-after"] == "60"
        assert limited.headers["cache-control"] == "no-store"


def test_sliding_limit_groups_ipv4_mapped_addresses_and_ipv6_networks(monkeypatch):
    now = 1
    monkeypatch.setattr(rate_limit, "monotonic", lambda: now)
    limiter = rate_limit.LeadRateLimit(limit=2)
    assert limiter.retry_after("192.0.2.1") is None
    assert limiter.retry_after("2001:db8:1:2::1") is None
    now = 60
    assert limiter.retry_after("::ffff:192.0.2.1") is None
    assert limiter.retry_after("2001:db8:1:2::2") is None
    assert limiter.retry_after("192.0.2.1") == 1
    assert limiter.retry_after("2001:db8:1:2::ffff") == 1
    now = 61
    assert limiter.retry_after("2001:0db8:1:2::1") is None
    assert limiter.retry_after("192.0.2.1") is None
    assert limiter.retry_after("192.0.2.1") == 59


def test_capacity_reuses_bounded_overflow_and_preserves_tracked_clients(monkeypatch):
    now = 1
    monkeypatch.setattr(rate_limit, "monotonic", lambda: now)
    limiter = rate_limit.LeadRateLimit(limit=2, max_clients=1)
    assert limiter.retry_after("192.0.2.1") is None
    assert limiter.retry_after("192.0.2.2") is None
    assert limiter.retry_after("192.0.2.3") is None
    assert limiter.retry_after("192.0.2.4") == 60
    assert limiter.retry_after("192.0.2.1") is None
    assert len(limiter.clients) == 1
    now += 60
    assert limiter.retry_after("192.0.2.4") is None
    assert set(limiter.clients) == {"192.0.2.4"}
