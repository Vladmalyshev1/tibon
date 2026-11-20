import asyncio
from datetime import timedelta
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, update

from app.main import create_app
from app.models import Lead

PAYLOAD = {
    "name": "Synthetic Menu",
    "phone": "+70000000000",
    "format": "kids",
    "consent": True,
}


@pytest.mark.parametrize("kind", ["adults", "kids"])
def test_download_is_bound_to_committed_menu_type_and_submission_key(
    postgres_schema, tmp_path, kind
):
    settings, scoped_engine = postgres_schema
    (tmp_path / "adults.pdf").write_bytes(b"%PDF-1.4\nAdult fixture")
    (tmp_path / "kids.pdf").write_bytes(b"%PDF-1.4\nKids fixture")
    key = {"Idempotency-Key": str(uuid4())}
    settings.menu_pdf_dir = tmp_path
    with TestClient(create_app(settings)) as client:
        payload = PAYLOAD | {"source": f"menu_{kind}", "format": kind}
        assert client.post("/api/v1/leads", json=payload).status_code == 422
        created = client.post("/api/v1/leads", json=payload, headers=key)
        assert created.status_code == 201
        lead_id = UUID(created.json()["id"])
        url = f"/api/v1/leads/{lead_id}/menu"
        assert client.get(url).status_code == 404
        assert (
            client.get(url, headers={"Idempotency-Key": str(uuid4())}).status_code
            == 404
        )
        pdf = client.get(url, headers=key)
        assert (
            pdf.status_code == 200
            and pdf.content == (tmp_path / f"{kind}.pdf").read_bytes()
        )
        assert pdf.headers["cache-control"] == "no-store"
        assert (
            pdf.headers["content-disposition"] == f'attachment; filename="{kind}.pdf"'
        )
        replay = client.post("/api/v1/leads", json=payload, headers=key)
        assert replay.status_code == 200 and replay.json() == created.json()

        async def expire():
            engine = scoped_engine(settings)
            try:
                async with engine.begin() as connection:
                    await connection.execute(
                        update(Lead)
                        .where(Lead.id == lead_id)
                        .values(
                            created_at=func.now() - timedelta(hours=25),
                        )
                    )
            finally:
                await engine.dispose()

        asyncio.run(expire())
        assert client.get(url, headers=key).status_code == 404


def test_event_lead_cannot_download_menu_and_missing_file_can_be_retried(
    postgres_schema, tmp_path
):
    settings, _ = postgres_schema
    settings.menu_pdf_dir = tmp_path
    with TestClient(create_app(settings)) as client:
        event_key = {"Idempotency-Key": str(uuid4())}
        event = client.post("/api/v1/leads", json=PAYLOAD, headers=event_key)
        assert event.status_code == 201
        assert (
            client.get(
                f"/api/v1/leads/{event.json()['id']}/menu", headers=event_key
            ).status_code
            == 404
        )
        key = {"Idempotency-Key": str(uuid4())}
        menu = client.post(
            "/api/v1/leads", json=PAYLOAD | {"source": "menu_kids"}, headers=key
        )
        assert menu.status_code == 201
        url = f"/api/v1/leads/{menu.json()['id']}/menu"
        assert client.get(url, headers=key).status_code == 503
        (tmp_path / "kids.pdf").write_bytes(b"%PDF-1.4\nReplaced fixture")
        assert client.get(url, headers=key).status_code == 200
