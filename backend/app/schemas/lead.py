import re
from datetime import date as CalendarDate
from typing import Annotated, Literal
from uuid import UUID
from zoneinfo import ZoneInfo

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictBool,
    StringConstraints,
    ValidationInfo,
    field_validator,
)

from app.models.lead import LeadFormat, LeadSource

STUDIO_TIMEZONE = ZoneInfo("Europe/Samara")
MENU_FORMATS = {
    LeadSource.MENU_ADULTS: LeadFormat.ADULTS,
    LeadSource.MENU_KIDS: LeadFormat.KIDS,
}


class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", hide_input_in_errors=True)

    name: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=2, max_length=80)
    ]
    phone: Annotated[str, Field(pattern=r"^\+7[0-9]{10}$")]
    format: LeadFormat
    date: CalendarDate | None = None
    guests: Annotated[int, Field(strict=True, ge=1, le=10000)] | None = None
    source: LeadSource | None = None
    comment: (
        Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)] | None
    ) = None
    consent: StrictBool
    consent_version: Literal["lead-consent-v1", "lead-consent-v2"] | None = None

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

    @field_validator("comment")
    @classmethod
    def normalize_comment(cls, value: str | None) -> str | None:
        return value or None

    @field_validator("date", "guests", "comment")
    @classmethod
    def reject_callback_details(cls, value: object, info: ValidationInfo) -> object:
        if value is not None and info.data.get("format") == LeadFormat.CALLBACK:
            raise ValueError("Callback requests do not accept event or menu details")
        return value

    @field_validator("source")
    @classmethod
    def require_matching_menu_format(
        cls, source: LeadSource | None, info: ValidationInfo
    ) -> LeadSource | None:
        if source is not None and info.data.get("format") != MENU_FORMATS[source]:
            raise ValueError("Menu source must match the request format")
        return source

    @field_validator("consent")
    @classmethod
    def require_consent(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Consent is required")
        return value


class LeadCreated(BaseModel):
    id: UUID
