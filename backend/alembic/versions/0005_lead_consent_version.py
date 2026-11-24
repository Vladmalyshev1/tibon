"""Record the submitted consent version and the server receipt time."""

import sqlalchemy as sa

from alembic import op

revision = "0005_lead_consent_version"
down_revision = "0004_callback_leads"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("consent_version", sa.String(64)))
    op.add_column("leads", sa.Column("consented_at", sa.DateTime(timezone=True)))
    # Set the default after adding the column so existing rows stay unversioned
    # and retain an unknown consent receipt time.
    op.alter_column("leads", "consented_at", server_default=sa.func.now())


def downgrade() -> None:
    op.drop_column("leads", "consented_at")
    op.drop_column("leads", "consent_version")
