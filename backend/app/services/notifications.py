import asyncio
import logging
from datetime import timedelta

from asyncpg import PostgresError
from sqlalchemy import event
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.repositories.notifications import claim_notification, finish_notification
from app.services.telegram import (
    TelegramClient,
    TelegramDeliveryError,
    notification_text,
)

logger = logging.getLogger(__name__)


async def deliver_next(
    engine: AsyncEngine, telegram: TelegramClient, chat_id: int
) -> bool:
    async with (
        asyncio.timeout(8),
        AsyncSession(engine, expire_on_commit=False) as session,
        session.begin(),
    ):
        claim = await claim_notification(session)
    if claim is None:
        return False

    error = None
    retry_after = None
    try:
        await telegram.send_message(chat_id, notification_text(claim.lead))
    except TelegramDeliveryError as failure:
        error = failure.code
        if failure.exception_class is None:
            logger.error("Notification failed: %s", error)
        else:
            logger.error("Notification failed: %s (%s)", error, failure.exception_class)
        if failure.retry:
            retry_after = timedelta(
                seconds=max(15 * 2 ** (claim.attempt - 1), failure.retry_after)
            )

    async with asyncio.timeout(8), AsyncSession(engine) as session, session.begin():
        status = await finish_notification(
            session, claim, error=error, retry_after=retry_after
        )
    if status == "sent":
        logger.info("Notification sent")
    elif status == "failed":
        logger.warning("Notification permanently failed")
    return True


async def run_worker(
    engine: AsyncEngine, telegram: TelegramClient, chat_id: int
) -> None:
    logger.info("Telegram Worker started")

    @event.listens_for(engine.sync_engine, "connect", once=True)
    def log_database_connection(_connection, _record) -> None:
        logger.info("Database connected")

    try:
        while True:
            try:
                delivered = await deliver_next(engine, telegram, chat_id)
                await asyncio.sleep(1 if delivered else 2)
            except (OSError, PostgresError, SQLAlchemyError):
                logger.warning("Telegram notification queue database operation failed")
                await asyncio.sleep(5)
    except asyncio.CancelledError:
        logger.info("Worker stopped")
        raise
