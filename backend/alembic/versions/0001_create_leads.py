"""Create the leads table."""

import sqlalchemy as sa

from alembic import op

revision = "0001_create_leads"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "leads",
        sa.Column(
            "id",
            sa.Uuid(),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("phone", sa.String(12), nullable=False),
        sa.Column("format", sa.String(16), nullable=False),
        sa.Column("event_date", sa.Date(), nullable=True),
        sa.Column("comment", sa.String(1000), nullable=True),
        sa.Column("consent", sa.Boolean(), nullable=False),
        sa.Column(
            "status", sa.String(16), server_default=sa.text("'new'"), nullable=False
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint("char_length(btrim(name)) >= 2", name="ck_leads_name"),
        sa.CheckConstraint("phone ~ '^[+]7[0-9]{10}$'", name="ck_leads_phone"),
        sa.CheckConstraint("consent IS TRUE", name="ck_leads_consent"),
        sa.CheckConstraint(
            "format IN ('adults', 'kids', 'corporate', 'birthday', 'romantic', 'rental', 'extras')",
            name="ck_leads_format",
        ),
        sa.CheckConstraint(
            "status IN ('new', 'contacted', 'confirmed', 'declined', 'archived')",
            name="ck_leads_status",
        ),
    )
    op.create_index("ix_leads_status_created_at", "leads", ["status", "created_at"])
    op.execute("""
        CREATE FUNCTION set_lead_updated_at() RETURNS trigger
        LANGUAGE plpgsql AS $$
        BEGIN
            NEW.updated_at := clock_timestamp();
            RETURN NEW;
        END;
        $$
    """)
    op.execute("""
        CREATE TRIGGER leads_set_updated_at BEFORE UPDATE ON leads
        FOR EACH ROW EXECUTE FUNCTION set_lead_updated_at()
    """)


def downgrade() -> None:
    op.drop_table("leads")
    op.execute("DROP FUNCTION set_lead_updated_at()")
