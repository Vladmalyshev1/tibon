from datetime import datetime
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.models.lead import Lead, LeadFormat, LeadStatus
from app.schemas.lead import STUDIO_TIMEZONE, LeadCreate, LeadCreated

LEAD_DRAFT = {
    "name": "  Тест  ",
    "phone": "+70000000000",
    "format": "kids",
    "consent": True,
}


def test_lead_contract_accepts_current_draft_shape():
    today = datetime.now(STUDIO_TIMEZONE).date()
    lead = LeadCreate.model_validate(
        {**LEAD_DRAFT, "date": today.isoformat(), "comment": "  "}
    )
    assert lead.name == "Тест"
    assert lead.phone == LEAD_DRAFT["phone"]
    assert lead.format == LeadFormat.KIDS
    assert lead.date == today
    assert lead.comment is None
    assert LeadCreate.model_validate(LEAD_DRAFT).date is None

    lead_id = uuid4()
    assert LeadCreated(id=lead_id).model_dump(mode="json") == {"id": str(lead_id)}


@pytest.mark.parametrize(
    "invalid",
    [
        {"name": " "},
        {"name": "x" * 81},
        {"phone": "80000000000"},
        {"phone": "+70000000000\n"},
        {"format": "unknown"},
        {"date": "2026-02-30"},
        {"date": 1800000000},
        {"comment": "x" * 1001},
        {"comment": "\x00"},
        {"consent": False},
        {"consent": "true"},
        {"consent": 1},
        {"status": "confirmed"},
        {"guests": "12"},
        {"guests": 0},
        {"guests": 10001},
        {"source": "unknown"},
    ],
)
def test_lead_contract_rejects_invalid_payload(invalid):
    with pytest.raises(ValidationError):
        LeadCreate.model_validate({**LEAD_DRAFT, **invalid})


def test_model_keeps_personal_data_out_of_default_repr():
    lead = Lead(
        name="Synthetic name",
        phone=LEAD_DRAFT["phone"],
        format=LeadFormat.KIDS,
        consent=True,
        status=LeadStatus.NEW,
    )
    for value in (lead.name, lead.phone):
        assert value not in repr(lead)
