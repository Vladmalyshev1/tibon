from asyncio import timeout
from uuid import UUID

from asyncpg import PostgresError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.models.lead import Lead
from app.repositories.leads import get_by_submission_key, insert_lead
from app.schemas.lead import LeadCreate


class SubmissionConflict(Exception):
    pass


class SubmissionUnavailable(Exception):
    pass


async def submit_lead(
    engine: AsyncEngine, payload: LeadCreate, key: UUID | None
) -> tuple[UUID, bool]:
    try:
        async with timeout(8), AsyncSession(engine) as session, session.begin():
            fields = payload.model_dump(exclude={"date"}) | {"event_date": payload.date}
            lead_id = await insert_lead(session, Lead(**fields, idempotency_key=key))
            if lead_id is not None:
                return lead_id, True
            if key is None:
                raise SubmissionUnavailable
            existing = await get_by_submission_key(session, key)
            if existing is None:
                raise SubmissionUnavailable
            if any(
                getattr(existing, field) != value for field, value in fields.items()
            ):
                raise SubmissionConflict
            return existing.id, False
    except (PostgresError, SQLAlchemyError, OSError):
        raise SubmissionUnavailable from None
