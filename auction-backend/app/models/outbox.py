import enum
import uuid
from datetime import datetime

from sqlalchemy import Integer, String, JSON, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base

class OutboxStatus(str, enum.Enum):
    pending = "pending"
    published = "published"
    failed = "failed"

class OutboxEvent(Base):
    __tablename__ = "outbox_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    aggregate_type: Mapped[str] = mapped_column(String(50))
    aggregate_id: Mapped[str] = mapped_column(UUID(as_uuid=True))
    partition_key: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    event_type: Mapped[uuid.UUID] = mapped_column(String(50))
    payload: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"))
    status: Mapped[OutboxStatus] = mapped_column(Enum(OutboxStatus, name = "outbox_status"), default=OutboxStatus.pending)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)