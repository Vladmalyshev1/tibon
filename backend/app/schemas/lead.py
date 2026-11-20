import re
from datetime import date as CalendarDate
from datetime import datetime
from typing import Annotated
from uuid import UUID
from zoneinfo import ZoneInfo

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictBool,
    StringConstraints,
    field_validator,
)

from app.models.lead import LeadFormat

STUDIO_TIMEZONE = ZoneInfo("Europe/Samara")


class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", hide_input_in_errors=True)

    name: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=2, max_length=80)
    ]
    phone: Annotated[str, Field(pattern=r"^\+7[0-9]{10}$")]
    format: LeadFormat
    date: CalendarDate | None = None
    comment: (
        Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)] | None
    ) = None
    consent: StrictBool

    @field_validator("name", "comment")
    @classmethod
    def require_storable_text(cls, value: str | None) -> str | None:
        if value is not None and re.search(r"[\x00\ud800-\udfff]", value):
            raise ValueError("Text contains unsupported characters")
        return value

    @field_validator("date", mode="before")
    @classmethod
    def require_iso_date(cls, value: object) -> object:
        if value is not None and (
            not isinstance(value, str)
            or re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value) is None
        ):
            raise ValueError("Use YYYY-MM-DD for the event date")
        return value

    @field_validator("date")
    @classmethod
    def require_available_date(cls, value: CalendarDate | None) -> CalendarDate | None:
        if value is not None and value < datetime.now(STUDIO_TIMEZONE).date():
            raise ValueError("The event date cannot be in the past")
        return value

    @field_validator("comment")
    @classmethod
    def normalize_comment(cls, value: str | None) -> str | None:
        return value or None

    @field_validator("consent")
    @classmethod
    def require_consent(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Consent is required")
        return value


class LeadCreated(BaseModel):
    id: UUID
