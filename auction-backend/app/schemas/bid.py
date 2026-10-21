import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

class BidOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    room_id: uuid.UUID
    bidder_id: uuid.UUID
    amount: float
    room_version: int
    created_at: datetime