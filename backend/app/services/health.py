from asyncio import timeout

from asyncpg import PostgresError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine

from app.repositories.health import ping_database


async def database_is_available(engine: AsyncEngine) -> bool:
    try:
        async with timeout(2):
            await ping_database(engine)
    except (PostgresError, SQLAlchemyError, OSError):
        return False
    return True
