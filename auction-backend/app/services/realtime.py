
from redis.asyncio import Redis

from app.models.room import AuctionRoom
from app.ws.connection_manager import room_manager


async def announce_room_status(redis: Redis, room: AuctionRoom, extra: dict) -> None:
    message = {
        "type": "room_status",
        "room_id": str(room.id),
        "status": room.status.value,
        **extra,
    }
    await room_manager.broadcast(str(room.id), message)