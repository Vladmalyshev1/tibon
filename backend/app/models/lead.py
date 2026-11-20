from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    FetchedValue,
    Index,
    String,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class LeadFormat(StrEnum):
    ADULTS = "adults"
    KIDS = "kids"
    CORPORATE = "corporate"
    BIRTHDAY = "birthday"
    ROMANTIC = "romantic"
    RENTAL = "rental"
    EXTRAS = "extras"


class LeadStatus(StrEnum):
    NEW = "new"
    CONTACTED = "contacted"
    CONFIRMED = "confirmed"
    DECLINED = "declined"
    ARCHIVED = "archived"


class Lead(Base):
    __tablename__ = "leads"
    __table_args__ = (
        CheckConstraint("char_length(btrim(name)) >= 2", name="ck_leads_name"),
        CheckConstraint("phone ~ '^[+]7[0-9]{10}$'", name="ck_leads_phone"),
        CheckConstraint("consent IS TRUE", name="ck_leads_consent"),
        UniqueConstraint("idempotency_key", name="uq_leads_idempotency_key"),
        Index("ix_leads_status_created_at", "status", "created_at"),
    )
    __mapper_args__ = {"eager_defaults": True}

    id: Mapped[UUID] = mapped_column(
        Uuid, primary_key=True, server_default=func.gen_random_uuid()
    )
    name: Mapped[str] = mapped_column(String(80))
    phone: Mapped[str] = mapped_column(String(12))
    format: Mapped[LeadFormat] = mapped_column(
        Enum(
            LeadFormat,
            name="ck_leads_format",
            native_enum=False,
            create_constraint=True,
            values_callable=lambda members: [member.value for member in members],
            length=16,
        ),
    )
    event_date: Mapped[date | None] = mapped_column(Date)
    comment: Mapped[str | None] = mapped_column(String(1000))
    consent: Mapped[bool]
    idempotency_key: Mapped[UUID | None] = mapped_column(Uuid)
    status: Mapped[LeadStatus] = mapped_column(
        Enum(
            LeadStatus,
            name="ck_leads_status",
            native_enum=False,
            create_constraint=True,
            values_callable=lambda members: [member.value for member in members],
            length=16,
        ),
        server_default=text("'new'"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        server_onupdate=FetchedValue(),
    )
