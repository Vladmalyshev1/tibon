import asyncio
import os
from pathlib import Path
from uuid import UUID, uuid4

import pytest
from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.schema import CreateSchema, DropSchema

from alembic import command
from app.config import Settings
from app.database import create_database_engine
from app.models.lead import Lead, LeadFormat, LeadStatus

ALEMBIC_INI = Path(__file__).resolve().parents[1] / "alembic.ini"


def test_migration_sql_can_be_generated_without_database(capsys):
    config = Config(str(ALEMBIC_INI))
    assert (
        ScriptDirectory.from_config(config).get_current_head()
        == "0003_telegram_notifications"
    )
    command.upgrade(config, "head", sql=True)
    sql = capsys.readouterr().out
    assert "CREATE TABLE leads" in sql
    assert "CREATE TRIGGER leads_set_updated_at" in sql
    assert "UNIQUE (idempotency_key)" in sql
    assert "CREATE TABLE telegram_notifications" in sql


@pytest.mark.skipif(
    os.environ.get("TIBON_TEST_POSTGRES") != "1", reason="requires PostgreSQL"
)
def test_postgres_migration_round_trip_and_model():
    asyncio.run(check_migrations())


async def check_migrations():
    settings = Settings()
    schema = f"test_m61_{uuid4().hex}"
    bootstrap = create_database_engine(settings)
    try:
        async with bootstrap.begin() as connection:
            await connection.execute(CreateSchema(schema))

        try:
            await check_schema(settings, schema)
        finally:
            async with bootstrap.begin() as connection:
                await connection.execute(DropSchema(schema, cascade=True))
    finally:
        await bootstrap.dispose()


async def check_schema(settings, schema):
    engine = create_async_engine(
        settings.database_url,
        hide_parameters=True,
        connect_args={"server_settings": {"search_path": schema}},
    )
    config = Config(str(ALEMBIC_INI))

    def migrate(connection, action, *args):
        config.attributes["connection"] = connection
        action(config, *args)

    try:
        async with engine.connect() as connection:
            await connection.run_sync(migrate, command.upgrade, "0001_create_leads")
            existing_id = await connection.scalar(
                text(
                    "INSERT INTO leads (name, phone, format, consent) "
                    "VALUES ('Synthetic', '+70000000000', 'kids', true) RETURNING id"
                )
            )
            await connection.commit()
            await connection.run_sync(migrate, command.upgrade, "head")
            await connection.run_sync(migrate, command.check)
            row = (
                await connection.execute(
                    text(
                        "SELECT id, idempotency_key, guests, source FROM leads WHERE id = :id"
                    ),
                    {"id": existing_id},
                )
            ).one()
            assert row == (existing_id, None, None, None)
            assert (
                await connection.scalar(
                    text("SELECT count(*) FROM telegram_notifications")
                )
                == 0
            )
            await connection.rollback()

        async with AsyncSession(engine) as session, session.begin():
            lead = Lead(
                name="Тест", phone="+70000000000", format=LeadFormat.KIDS, consent=True
            )
            session.add(lead)
            await session.flush()
            assert isinstance(lead.id, UUID)
            assert lead.status == LeadStatus.NEW
            assert lead.created_at == lead.updated_at
            assert lead.created_at.utcoffset() is not None
            assert lead.event_date is None and lead.comment is None
            await session.execute(text("SELECT pg_sleep(0.01)"))
            lead.status = LeadStatus.CONTACTED
            await session.flush()
            assert lead.updated_at > lead.created_at

        async with engine.begin() as connection:
            for invalid in (
                {"name": " "},
                {"phone": "invalid"},
                {"format": "unknown"},
                {"consent": False},
                {"status": "unknown"},
            ):
                values = {
                    "name": "Test",
                    "phone": "+70000000000",
                    "format": "kids",
                    "consent": True,
                    "status": "new",
                    **invalid,
                }
                with pytest.raises(IntegrityError):
                    async with connection.begin_nested():
                        await connection.execute(
                            text(
                                "INSERT INTO leads (name, phone, format, consent, status) "
                                "VALUES (:name, :phone, :format, :consent, :status)"
                            ),
                            values,
                        )

        async with engine.connect() as connection:
            await connection.run_sync(migrate, command.downgrade, "base")
            assert not await connection.run_sync(
                lambda conn: inspect(conn).has_table("leads")
            )
            assert (
                await connection.scalar(
                    text("SELECT to_regprocedure('set_lead_updated_at()')")
                )
                is None
            )
            await connection.rollback()
            await connection.run_sync(migrate, command.upgrade, "head")
            assert await connection.run_sync(
                lambda conn: inspect(conn).has_table("leads")
            )
    finally:
        await engine.dispose()
