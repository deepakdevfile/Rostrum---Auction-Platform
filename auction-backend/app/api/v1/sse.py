import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.api.deps import get_redis
from app.db.session import get_db
from app.sse.ticker import price_tick_event_stream

router = APIRouter(tags=["sse"])

@router.get("/rooms/{room_id}/ticker")
async def price_ticker(room_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    redis = get_redis()
    return EventSourceResponse(price_tick_event_stream(str(room_id), db, redis))