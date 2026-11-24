from datetime import timedelta
from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead, LeadSource


async def bound_lead_transaction(session: AsyncSession) -> None:
    await session.execute(
        text(
            "SELECT set_config('lock_timeout', '1500ms', true), "
            "set_config('statement_timeout', '4000ms', true)"
        )
    )


async def insert_lead(session: AsyncSession, lead: Lead) -> UUID | None:
    statement = insert(Lead).values(
        name=lead.name,
        phone=lead.phone,
        format=lead.format,
        event_date=lead.event_date,
        guests=lead.guests,
        source=lead.source,
        comment=lead.comment,
        consent=lead.consent,
        consent_version=lead.consent_version,
        idempotency_key=lead.idempotency_key,
    )
    if lead.idempotency_key is not None:
        statement = statement.on_conflict_do_nothing(
            index_elements=[Lead.idempotency_key]
        )
    return await session.scalar(statement.returning(Lead.id))


async def get_by_submission_key(session: AsyncSession, key: UUID) -> Lead | None:
    return await session.scalar(select(Lead).where(Lead.idempotency_key == key))


async def get_download_source(
    session: AsyncSession, lead_id: UUID, key: UUID
) -> LeadSource | None:
    return await session.scalar(
        select(Lead.source).where(
            Lead.id == lead_id,
            Lead.idempotency_key == key,
            Lead.source.is_not(None),
            Lead.created_at >= func.now() - timedelta(hours=24),
        )
    )
