import logging
from dataclasses import dataclass
from datetime import timedelta
from uuid import UUID, uuid4

from sqlalchemy import event, func, insert, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Lead, TelegramNotification

MAX_ATTEMPTS = 5
LEASE_DURATION = timedelta(seconds=60)
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class NotificationClaim:
    lead: Lead
    attempt: int
    lease_id: UUID


async def enqueue_notification(session: AsyncSession, lead_id: UUID) -> None:
    await session.execute(insert(TelegramNotification).values(lead_id=lead_id).inline())


async def claim_notification(session: AsyncSession) -> NotificationClaim | None:
    queue = TelegramNotification
    expired = (
        select(queue.lead_id)
        .where(
            text("telegram_notifications.status = 'sending'"),
            queue.attempts >= MAX_ATTEMPTS,
            queue.available_at <= func.now(),
        )
        .limit(32)
        .with_for_update(skip_locked=True)
    )
    expired_jobs = await session.execute(
        update(queue)
        .where(queue.lead_id.in_(expired))
        .values(status="failed", last_error="lease_expired", lease_id=None)
    )
    if expired_jobs.rowcount > 0:

        @event.listens_for(session.sync_session, "after_commit", once=True)
        def log_expired_jobs(_session) -> None:
            logger.warning("Notification permanently failed")

    result = await session.execute(
        select(queue, Lead)
        .join(Lead, Lead.id == queue.lead_id)
        .where(
            text("telegram_notifications.status IN ('pending', 'sending')"),
            queue.available_at <= func.now(),
            queue.attempts < MAX_ATTEMPTS,
        )
        .order_by(queue.available_at, queue.lead_id)
        .limit(1)
        .with_for_update(of=queue, skip_locked=True)
    )
    row = result.one_or_none()
    if row is None:
        return None
    job, lead = row
    lease_id = uuid4()
    job.status = "sending"
    job.attempts += 1
    job.lease_id = lease_id
    job.available_at = func.now() + LEASE_DURATION
    return NotificationClaim(lead, job.attempts, lease_id)


async def finish_notification(
    session: AsyncSession,
    claim: NotificationClaim,
    *,
    error: str | None = None,
    retry_after: timedelta | None = None,
) -> str | None:
    queue = TelegramNotification
    values = {"status": "sent", "sent_at": func.now(), "last_error": None}
    if error is not None:
        can_retry = retry_after is not None and claim.attempt < MAX_ATTEMPTS
        values = {
            "status": "pending" if can_retry else "failed",
            "last_error": error,
        }
        if can_retry:
            values["available_at"] = func.now() + retry_after
    return await session.scalar(
        update(queue)
        .where(
            queue.lead_id == claim.lead.id,
            queue.status == "sending",
            queue.lease_id == claim.lease_id,
        )
        .values(**values, lease_id=None)
        .returning(queue.status)
    )


async def retry_failed_notification(session: AsyncSession, lead_id: UUID) -> bool:
    queue = TelegramNotification
    retried = await session.scalar(
        update(queue)
        .where(queue.lead_id == lead_id, queue.status == "failed")
        .values(status="pending", attempts=0, available_at=func.now(), last_error=None)
        .returning(queue.lead_id)
    )
    return retried is not None
