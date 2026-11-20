import asyncio

from sqlalchemy.engine import Connection

from alembic import context
from app.config import Settings
from app.database import create_database_engine
from app.models import Base

target_metadata = Base.metadata


def run_offline() -> None:
    context.configure(
        dialect_name="postgresql", target_metadata=target_metadata, literal_binds=True
    )
    with context.begin_transaction():
        context.run_migrations()


def run_with_connection(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_online() -> None:
    engine = create_database_engine(Settings())
    try:
        async with engine.connect() as connection:
            await connection.run_sync(run_with_connection)
    finally:
        await engine.dispose()


if context.is_offline_mode():
    run_offline()
elif (connection := context.config.attributes.get("connection")) is not None:
    run_with_connection(connection)
else:
    asyncio.run(run_online())
