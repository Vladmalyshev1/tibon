import argparse
import asyncio
import json
import logging
from uuid import UUID

from asyncpg import PostgresError
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.config import Settings, TelegramSettings
from app.database import create_database_engine
from app.models import TelegramNotification
from app.repositories.notifications import retry_failed_notification
from app.services.notifications import run_worker
from app.services.telegram import (
    TelegramClient,
    TelegramDeliveryError,
    telegram_http_client,
)


async def delivery_status(engine: AsyncEngine, lead_id: UUID | None) -> dict:
    queue = TelegramNotification
    async with asyncio.timeout(8), AsyncSession(engine) as session:
        if lead_id is None:
            counts = await session.execute(
                select(queue.status, func.count()).group_by(queue.status)
            )
            return {
                **dict.fromkeys(("pending", "sending", "sent", "failed"), 0),
                **dict(counts.all()),
            }
        job = await session.get(queue, lead_id)
        if job is None:
            return {"lead_id": str(lead_id), "status": "not_found"}
        return {
            "lead_id": str(lead_id),
            "status": job.status,
            "attempts": job.attempts,
            "available_at": job.available_at
            if job.status in {"pending", "sending"}
            else None,
            "sent_at": job.sent_at,
            "last_error": job.last_error,
        }


async def run_command(args: argparse.Namespace) -> int:
    if args.command in {"status", "retry"}:
        engine = create_database_engine(Settings())
        try:
            if args.command == "status":
                print(
                    json.dumps(await delivery_status(engine, args.lead_id), default=str)
                )
                return 0
            async with (
                asyncio.timeout(8),
                AsyncSession(engine) as session,
                session.begin(),
            ):
                retried = await retry_failed_notification(session, args.lead_id)
            print(
                "Queued for retry."
                if retried
                else "No failed notification with this lead ID."
            )
            return 0 if retried else 1
        finally:
            await engine.dispose()

    settings = TelegramSettings()
    if settings.telegram_bot_token is None or (
        args.command == "run" and settings.telegram_chat_id is None
    ):
        print("Set TELEGRAM_BOT_TOKEN and, for delivery, TELEGRAM_CHAT_ID.")
        return 2
    async with telegram_http_client() as http:
        telegram = TelegramClient(http, settings.telegram_bot_token.get_secret_value())
        if args.command == "chat-ids":
            print(json.dumps(await telegram.chat_ids()))
            return 0
        engine = create_database_engine(Settings())
        try:
            await run_worker(engine, telegram, settings.telegram_chat_id)
        finally:
            await engine.dispose()
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Manage TIBON Telegram delivery.")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("run", help="Run the delivery worker")
    status = commands.add_parser("status", help="Inspect delivery counts or one lead")
    status.add_argument("--lead-id", type=UUID)
    retry = commands.add_parser(
        "retry", help="Queue a failed notification for another delivery cycle"
    )
    retry.add_argument("--lead-id", type=UUID, required=True)
    commands.add_parser("chat-ids", help="List chat IDs with recent /start messages")
    args = parser.parse_args()
    logging.basicConfig(level=logging.WARNING)
    try:
        return asyncio.run(run_command(args))
    except KeyboardInterrupt:
        return 0
    except (
        ValidationError,
        OSError,
        PostgresError,
        SQLAlchemyError,
        TelegramDeliveryError,
    ):
        print(
            "Notification command failed. Check the configuration and service availability."
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
