"""Allow callback requests in the existing leads table."""

from alembic import op

revision = "0004_callback_leads"
down_revision = "0003_telegram_notifications"
branch_labels = None
depends_on = None

EVENT_FORMATS = "'adults', 'kids', 'corporate', 'birthday', 'romantic', 'rental', 'extras'"


def upgrade() -> None:
    op.drop_constraint("ck_leads_format", "leads", type_="check")
    op.create_check_constraint(
        "ck_leads_format", "leads", f"format IN ({EVENT_FORMATS}, 'callback')"
    )
    op.create_check_constraint(
        "ck_leads_callback_details",
        "leads",
        "format <> 'callback' OR (event_date IS NULL AND guests IS NULL "
        "AND source IS NULL AND comment IS NULL)",
    )


def downgrade() -> None:
    # If callback rows exist, PostgreSQL rejects the old constraint and rolls back.
    op.drop_constraint("ck_leads_callback_details", "leads", type_="check")
    op.drop_constraint("ck_leads_format", "leads", type_="check")
    op.create_check_constraint("ck_leads_format", "leads", f"format IN ({EVENT_FORMATS})")
