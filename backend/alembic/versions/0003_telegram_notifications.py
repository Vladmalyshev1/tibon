"""Add optional lead details and the Telegram outbox."""

import sqlalchemy as sa

from alembic import op

revision = "0003_telegram_notifications"
down_revision = "0002_lead_idempotency"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("guests", sa.Integer(), nullable=True))
    op.add_column("leads", sa.Column("source", sa.String(16), nullable=True))
    op.create_check_constraint("ck_leads_guests", "leads", "guests BETWEEN 1 AND 10000")
    op.create_check_constraint(
        "ck_leads_source", "leads", "source IN ('menu_adults', 'menu_kids')"
    )
    op.create_table(
        "telegram_notifications",
        sa.Column("lead_id", sa.Uuid(), primary_key=True),
        sa.Column(
            "status", sa.String(8), nullable=False, server_default=sa.text("'pending'")
        ),
        sa.Column(
            "attempts", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "available_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lease_id", sa.Uuid(), nullable=True),
        sa.Column("last_error", sa.String(32), nullable=True),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE"),
        sa.CheckConstraint(
            "status IN ('pending', 'sending', 'sent', 'failed')",
            name="ck_telegram_notifications_status",
        ),
        sa.CheckConstraint("attempts >= 0", name="ck_telegram_notifications_attempts"),
    )
    op.create_index(
        "ix_telegram_notifications_available",
        "telegram_notifications",
        ["available_at", "lead_id"],
        postgresql_where=sa.text("status IN ('pending', 'sending')"),
    )


def downgrade() -> None:
    op.drop_table("telegram_notifications")
    op.drop_constraint("ck_leads_source", "leads", type_="check")
    op.drop_constraint("ck_leads_guests", "leads", type_="check")
    op.drop_column("leads", "source")
    op.drop_column("leads", "guests")
