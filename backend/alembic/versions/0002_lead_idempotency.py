"""Store optional submission keys for safe retries."""

import sqlalchemy as sa

from alembic import op

revision = "0002_lead_idempotency"
down_revision = "0001_create_leads"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("idempotency_key", sa.Uuid(), nullable=True))
    op.create_unique_constraint(
        "uq_leads_idempotency_key", "leads", ["idempotency_key"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_leads_idempotency_key", "leads", type_="unique")
    op.drop_column("leads", "idempotency_key")
