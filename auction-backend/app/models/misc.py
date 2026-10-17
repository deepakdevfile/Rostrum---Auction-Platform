import enum
import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base

class ParticipantRole(str, enum.Enum):
    seller = "seller"
    bidder = "bidder"
    observer = "observer"

class WebRTCSession(Base):
    __tablename__ = "webrtc_session"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("auction_rooms.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    role: Mapped[ParticipantRole] = mapped_column(Enum(ParticipantRole, name="participant_role"), default=ParticipantRole.bidder)
    joined_at: Mapped[datetime | None] = mapped_column(server_default=func.now())
    left_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)