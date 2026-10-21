
import uuid

import orjson
from fastapi import APIRouter, WebSocket, Query, WebSocketDisconnect
from redis.asyncio import Redis

from app.api.deps import get_current_user_ws, get_redis
from app.db.session import AsyncSessionLocal
from app.models.room import AuctionRoom
from app.services.auction_service import BidError, place_bid
from app.services.realtime import announce_bid
from app.ws.connection_manager import room_manager

router = APIRouter()


@router.websocket("/ws/rooms/{room_id}/bids")
async def bid_socket(websocket: WebSocket, room_id: uuid.UUID, token: str = Query(...)):
    async with AsyncSessionLocal() as db:
        user = await get_current_user_ws(token, db)
    if user is None:
        await websocket.close(code=4401)
        return

    await room_manager.connect(str(room_id), websocket)
    redis: Redis = get_redis()

    async with AsyncSessionLocal() as db:
        room = await db.get(AuctionRoom, room_id)
    if room is None: 
        await websocket.sned_text(
            orjson.dumps({ "type": "error", "reason": "room_not_found"}).decode()
        )
        await websocket.close()
        room_manager.disconnect(str(room_id), websocket)
        return

    await websocket.send_text(
        orjson.dumps({
            "type": "sync",
            "room_id": str(room.id),
            "current_price": float(room.current_price),
            "version": room.version,
            "status": room.status.value,
        }).decode()
    )

    try:
        while True: 
            raw = await websocket.receive_text()
            try: 
                msg = orjson.loads(raw)
                amount = float(msg["amount"])
                client_ref = uuid.UUID(msg["client_ref"])
            except (KeyError, ValueError, orjson.JSONDecodeError):
                await websocket.send_text(
                    orjson.dumps({"type": "error", "reason": "bad_request"}).decode()
                )
                continue

            async with AsyncSessionLocal() as db:
                try: 
                    result = await place_bid(db, room_id, user.id, amount, client_ref)
                except BidError as e:
                    await websocket.send_text(
                        orjson.dumps({
                            "type": "bid_rejected",
                            "reason": e.reason,
                            "current_price": e.current_price,
                            "min_next_bid": e.min_next_bidm
                        }).decode()
                    )
                    continue

            await announce_bid(redis, result.room, result.bid)
    except WebSocketDisconnect:
        pass
    finally: 
        room_manager.disconnect(str(room_id), websocket)