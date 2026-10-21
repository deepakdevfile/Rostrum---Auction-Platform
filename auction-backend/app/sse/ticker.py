
import asyncio

import orjson
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.misc import PriceTick

settings = get_settings()
HISTORY_LIMIT = 100

async def price_tick_event_stream(room_id: str, db: AsyncSession, redis: Redis):
    result = await db.execute(
        select(PriceTick)
        .where(PriceTick.room_id == room_id)
        .order_by(PriceTick.ts.desc())
        .limit(HISTORY_LIMIT)
    )
    history = list(reversed(result.scalars().all()))
    for tick in history: 
        yield {
            "event": "tick",
            "id": str(tick.id),
            "data": orjson.dumps(
                {"price": float(tick.price), "ts": tick.ts.isoformat()}
            ).decode(),
        }

    pubsub = redis.pubsub()
    channel = f"{settings.REDIS_TICKER_CHANNEL_PREFIX}{room_id}"
    await pubsub.subscribe(channel)
    try: 
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=15.0)
            if message is None:
                yield {"comment": "keep-alive"}
                continue
            yield {"event": "tick", "data": message["data"]}
    finally: 
        await pubsub.unsubscribe(channel)
        asyncio.create_task(pubsub.aclose())