from datetime import datetime
from uuid import UUID

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, func, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class TelegramNotification(Base):
    __tablename__ = "telegram_notifications"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'sending', 'sent', 'failed')",
            name="ck_telegram_notifications_status",
        ),
        CheckConstraint("attempts >= 0", name="ck_telegram_notifications_attempts"),
        Index(
            "ix_telegram_notifications_available",
            "available_at",
            "lead_id",
            postgresql_where=text("status IN ('pending', 'sending')"),
        ),
    )

    lead_id: Mapped[UUID] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"), primary_key=True
    )
    status: Mapped[str] = mapped_column(String(8), server_default=text("'pending'"))
    attempts: Mapped[int] = mapped_column(server_default=text("0"))
    available_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    lease_id: Mapped[UUID | None]
    last_error: Mapped[str | None] = mapped_column(String(32))
