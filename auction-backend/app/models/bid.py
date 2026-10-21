import uuid
from datetime import datetime

from sqlalchemy import UniqueConstraint, ForeignKey, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base

class Bid(Base):
    __tablename__ = "bids"
    __table_args__ = (UniqueConstraint("room_id", "client_ref"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("auction_rooms.id", ondelete="CASCADE"))
    bidder_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    amount: Mapped[float] = mapped_column(Numeric(14, 2))
    room_version: Mapped[int] = mapped_column()
    client_ref: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    accepted: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())