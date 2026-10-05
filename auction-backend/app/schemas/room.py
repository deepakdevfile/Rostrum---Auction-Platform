import uuid
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict

class ItemIn(BaseModel):
    name: str 
    description: str | None = None
    image_url: str | None = None

class ItemOut(ItemIn):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID

class RoomCreate(BaseModel):
    title: str
    description: str | None = None
    starting_price: float = Field(gt=0)
    bid_increment: float = Field(default=1.0, gt=0)
    starts_at: datetime
    ends_at: datetime
    item: ItemIn

class RoomOut(BaseModel):
    model_config = ConfigDict(from_attributes = True)

    id: uuid.UUID
    seller_id: uuid.UUID
    title: str
    description: str | None
    starting_price: float
    current_price: float
    bid_increment: float
    starts_at: datetime
    ends_at: datetime

class RoomDetail(RoomOut):
    items: list[ItemOut] = []
