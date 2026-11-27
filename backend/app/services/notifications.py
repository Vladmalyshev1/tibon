import asyncio
import logging
from datetime import timedelta

from asyncpg import PostgresError
from sqlalchemy import event
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.models.lead import Lead, LeadFormat, LeadSource
from app.repositories.notifications import claim_notification, finish_notification
from app.services.notification_providers import (
    NotificationDeliveryError,
    NotificationProvider,
)

logger = logging.getLogger(__name__)
FORMAT_LABELS = {
    LeadFormat.ADULTS: "Для взрослых",
    LeadFormat.KIDS: "Для детей",
    LeadFormat.CORPORATE: "Корпоратив",
    LeadFormat.BIRTHDAY: "День рождения",
    LeadFormat.ROMANTIC: "Романтический ужин",
    LeadFormat.RENTAL: "Аренда студии",
    LeadFormat.EXTRAS: "Дополнительные услуги",
    LeadFormat.CALLBACK: "Обратный звонок",
}
MENU_LABELS = {
    LeadSource.MENU_ADULTS: "Взрослое",
    LeadSource.MENU_KIDS: "Детское",
}


def notification_text(lead: Lead) -> str:
    menu = MENU_LABELS.get(lead.source) if lead.source else None
    phone = lead.phone
    lines = [
        "Запрос меню — TIBON" if menu else "Новая заявка — TIBON",
        f"Имя: {' '.join(lead.name.split())}",
        f"Телефон: +7 ({phone[2:5]}) {phone[5:8]}-{phone[8:10]}-{phone[10:]}",
        f"Формат: {FORMAT_LABELS[lead.format]}",
    ]
    if menu:
        lines.append(f"Тип меню: {menu}")
    if lead.event_date is not None:
        lines.append(f"Желаемая дата: {lead.event_date:%d.%m.%Y}")
    if lead.guests is not None:
        lines.append(f"Количество гостей: {lead.guests}")
    comment = " ".join((lead.comment or "").split())
    if comment:
        lines.append(f"Комментарий: {comment}")
    return "\n".join(lines)


async def deliver_next(engine: AsyncEngine, provider: NotificationProvider) -> bool:
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
    if provider.name == "vk" and claim.lead.consent_version != "lead-consent-v2":
        error = "vk_consent_required"
        logger.warning("VK notification skipped because the lead lacks VK consent")
    else:
        try:
            await provider.send_message(claim.lead.id, notification_text(claim.lead))
        except NotificationDeliveryError as failure:
            error = failure.code
            logger.error("Notification delivery error (%s): %s", provider.name, error)
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
    elif status == "pending":
        logger.warning("Notification retry scheduled")
    elif status == "failed":
        logger.warning("Notification permanently failed")
    return True


async def run_worker(engine: AsyncEngine, provider: NotificationProvider) -> None:
    logger.info("Notification worker started (%s)", provider.name)

    @event.listens_for(engine.sync_engine, "connect", once=True)
    def log_database_connection(_connection, _record) -> None:
        logger.info("Database connected")

    try:
        while True:
            try:
                delivered = await deliver_next(engine, provider)
                await asyncio.sleep(1 if delivered else 2)
            except (TimeoutError, OSError, PostgresError, SQLAlchemyError):
                logger.warning("Notification queue database operation failed")
                await asyncio.sleep(5)
    except asyncio.CancelledError:
        logger.info("Worker stopped")
        raise
