import enum
import uuid
from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey, String, Text, Numeric, DateTime, Enum
from sqlalchemy.sql import func

from app.db.base import Base

class RoomStatus(str, enum.Enum):
    scheduled = "scheduled"
    live = "live"
    ended = "ended"
    cancelled = "cancelled"

class AuctionRoom(Base):
    __tablename__ = "auction_rooms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid = True), primary_key=True, default = uuid.uuid4)
    seller_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RoomStatus] = mapped_column(Enum(RoomStatus, name="room_status"), default=RoomStatus.scheduled)
    starting_price: Mapped[float] = mapped_column(Numeric(14, 2))
    current_price: Mapped[float] = mapped_column(Numeric(14, 2))
    bid_increment: Mapped[float] = mapped_column(Numeric(14, 2))
    winner_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    version: Mapped[int] = mapped_column(default=0)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())