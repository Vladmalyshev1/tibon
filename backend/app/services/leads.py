from asyncio import timeout
from datetime import datetime
from logging import getLogger
from uuid import UUID

from asyncpg import PostgresError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.models.lead import Lead
from app.repositories.leads import (
    bound_lead_transaction,
    get_by_submission_key,
    insert_lead,
)
from app.repositories.notifications import enqueue_notification
from app.schemas.lead import STUDIO_TIMEZONE, LeadCreate

logger = getLogger(__name__)


class SubmissionConflict(Exception):
    pass


class SubmissionUnavailable(Exception):
    pass


class InvalidEventDate(Exception):
    pass


async def submit_lead(
    engine: AsyncEngine, payload: LeadCreate, key: UUID | None
) -> tuple[UUID, bool]:
    past_date = (
        payload.date is not None and payload.date < datetime.now(STUDIO_TIMEZONE).date()
    )
    if past_date and key is None:
        raise InvalidEventDate
    try:
        async with timeout(8), AsyncSession(engine) as session, session.begin():
            fields = payload.model_dump(exclude={"date"}) | {"event_date": payload.date}
            await bound_lead_transaction(session)
            if not past_date:
                lead_id = await insert_lead(
                    session, Lead(**fields, idempotency_key=key)
                )
                if lead_id is not None:
                    await enqueue_notification(session, lead_id)
                    return lead_id, True
            if key is not None:
                existing = await get_by_submission_key(session, key)
                if existing is not None:
                    if any(
                        getattr(existing, field) != value
                        for field, value in fields.items()
                    ):
                        raise SubmissionConflict
                    return existing.id, False
            if past_date:
                raise InvalidEventDate
            raise SubmissionUnavailable
    except (PostgresError, SQLAlchemyError, OSError):
        logger.warning("Lead submission database operation failed")
        raise SubmissionUnavailable from None
