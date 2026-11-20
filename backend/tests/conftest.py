import asyncio
import os
from pathlib import Path
from uuid import uuid4

import pytest
from alembic.config import Config
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.schema import CreateSchema, DropSchema

from alembic import command
from app.config import Settings
from app.database import create_database_engine


@pytest.fixture
def postgres_schema(monkeypatch):
    if os.environ.get("TIBON_TEST_POSTGRES") != "1":
        pytest.skip("requires PostgreSQL")
    settings = Settings()
    schema = f"test_tibon_{uuid4().hex}"

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
