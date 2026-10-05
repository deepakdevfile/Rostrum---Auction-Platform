import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.room import RoomCreate, RoomDetail, RoomOut
from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.models.room import AuctionRoom
from app.models.item import Item


router = APIRouter(prefix = "/rooms", tags = ["rooms"])

@router.post("", response_model = RoomDetail, status_code = 201)
async def create_room(
    payload: RoomCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    room = AuctionRoom(
        seller_id = user.id,
        title = payload.title,
        description = payload.description,
        starting_price = payload.starting_price,
        current_price = payload.starting_price,
        bid_increment = payload.bid_increment,
        starts_at = payload.starts_at,
        ends_at = payload.ends_at,
    )
    db.add(room)
    await db.flush()

    item = Item(
        room_id = room.id,
        name = payload.item.name,
        description = payload.description,
        image_url = payload.item.image_url,
    )
    # print(room.description)
    # print(item.description)
    db.add(item)
    await db.commit()
    await db.refresh(room)
    await db.refresh(item)

    # return "Okay, I can listen, send the payload"
    return RoomDetail(**RoomOut.model_validate(room).model_dump(), items=[item])

@router.get("/{room_id}")
async def get_room(room_id: uuid.UUID):
    return "backend is listening, will shortly be sending data"