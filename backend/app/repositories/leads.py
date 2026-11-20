from uuid import UUID

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead


async def insert_lead(session: AsyncSession, lead: Lead) -> UUID | None:
    statement = insert(Lead).values(
        name=lead.name,
        phone=lead.phone,
        format=lead.format,
        event_date=lead.event_date,
        comment=lead.comment,
        consent=lead.consent,
        idempotency_key=lead.idempotency_key,
    )
    if lead.idempotency_key is not None:
        statement = statement.on_conflict_do_nothing(
            index_elements=[Lead.idempotency_key]
        )
    return await session.scalar(statement.returning(Lead.id))


async def get_by_submission_key(session: AsyncSession, key: UUID) -> Lead | None:
    return await session.scalar(select(Lead).where(Lead.idempotency_key == key))
