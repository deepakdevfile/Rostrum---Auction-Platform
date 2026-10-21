import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.bid import Bid
from app.models.item import Item
from app.models.room import AuctionRoom, RoomStatus
from app.models.user import User
from app.schemas.bid import BidOut
from app.schemas.room import RoomCreate, RoomDetail, RoomOut

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

@router.get("", response_model=list[RoomOut])
async def list_rooms(status_filter: RoomStatus | None = None, db: AsyncSession = Depends(get_db)):
    query = select(AuctionRoom).order_by(AuctionRoom.created_at.desc())
    if status_filter: 
        query = query.where(AuctionRoom.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{room_id}", response_model=RoomDetail)
async def get_room(room_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuctionRoom).where(AuctionRoom.id == room_id))
    room = result.scalar_one_or_none()
    if room is None:
        raise HTTPException(404, "room_not_found")

    items_result = await db.execute(select(Item).where(Item.room_id == room_id))
    items = items_result.scalars().all()
    return RoomDetail(**RoomOut.model_validate(room).model_dump(), items = items)

@router.get("/{room_id}/bids", response_model=list[BidOut])
async def get_order_book(room_id: uuid.UUID, limit: int = 25, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Bid)
        .where(Bid.room_id == room_id)
        .order_by(Bid.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()