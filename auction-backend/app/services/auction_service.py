
import uuid
from dataclasses import dataclass

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.events.schemas import bid_placed_payload
from app.models.bid import Bid
from app.models.misc import PriceTick
from app.models.outbox import OutboxEvent
from app.models.room import AuctionRoom, RoomStatus

MAX_OPTIMISTIC_RETRIES = 8

class BidError(Exception):
    def __int__(self,  reason: str, current_price: float, min_next_bid: float):
        self.reason = reason
        self.current_price = current_price
        self.min_next_bid = min_next_bid
        super().__init__(reason)

@dataclass
class BidResult:
    bid: Bid
    room: AuctionRoom
    duplicate: bool = False

async def place_bid(
        db: AsyncSession,
        room_id: uuid.UUID,
        bidder_id: uuid.UUID,
        amount: float,
        client_ref: uuid.UUID
) -> BidResult: 
    for _attempt in range(MAX_OPTIMISTIC_RETRIES):
        room = await db.get(AuctionRoom, room_id)
        if room is None: 
            raise BidError("room_not_found", 0, 0)
        if room.status != RoomStatus.live:
            raise BidError("room_not_live", float(room.current_price), 0)

        min_next_bid = float(room.current_price) + float(room.bid_increment)
        if amount < min_next_bid:
            raise BidError("bid_too_low", float(room.current_price), min_next_bid)

        expected_version = room.version
        new_version = expected_version + 1
        previous_price = float(room.current_price)

        result = await db.execute(
            update(AuctionRoom)
            .where(
                AuctionRoom.id == room_id,
                AuctionRoom.version == expected_version,
            )
            .values(current_price = amount, version = new_version)
        )

        if result.rowcount == 0:
            continue

        bid = Bid(
            room_id = room_id,
            bidder_id = bidder_id,
            amount = amount,
            room_version = new_version,
            client_ref = client_ref,
        )
        db.add(bid)
        db.add(PriceTick(room_id = room_id, price = amount))
        db.add(OutboxEvent(
            aggregate_type = "auction_room",
            aggregate_id = room_id,
            partition_key = room_id,
            event_type = "BidPlaced",
            payload = bid_placed_payload(room_id, bid.id, bidder_id, amount, previous_price, new_version),
        ))

        try: 
            await db.commit()
        except IntegrityError:
            await db.rollback()
            existing = await db.execute(
                select(Bid).where(Bid.room_id == room_id, Bid.client_ref == client_ref)
            )
            existing_bid = existing.scalar_one_or_none()
            if existing_bid is None: 
                raise
            refreshed_room = await db.get(AuctionRoom, room_id)
            return BidResult(bid = existing_bid, room = refreshed_room, duplicate=True)

        await db.refresh(room)
        await db.refresh(bid)
        return BidResult(bid=bid, room=room)

    raise BidError("too_much_contention", float(room.current_price), min_next_bid)
