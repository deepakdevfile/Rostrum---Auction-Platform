
from redis.asyncio import Redis

from app.models.bid import Bid
from app.models.room import AuctionRoom
from app.ws.connection_manager import room_manager

async def announce_bid(redis: Redis, room: AuctionRoom, bid: Bid) -> None:
    room_message = {
        "type": "bid_accepted",
        "room_id": str(room.id),
        "bid": {
            "id": str(bid.id),
            "bidder_id": str(bid.bidder_id),
            "amount": float(bid.amount),
            "created_at": bid.created_at.isoformat(),
        },
        "current_price": float(room.current_price),
        "version": room.version,
    }
    await room_manager.broadcast(str(room.id), room_message)

async def announce_room_status(redis: Redis, room: AuctionRoom, extra: dict) -> None:
    message = {
        "type": "room_status",
        "room_id": str(room.id),
        "status": room.status.value,
        **extra,
    }
    await room_manager.broadcast(str(room.id), message)