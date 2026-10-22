import asyncio
import logging

from redis.asyncio import Redis

from app.core.config import get_settings
from app.events.consumer_base import build_consumer
from app.events.topics import TOPIC_AUCTION_WON, TOPIC_BID_PLACED, TOPIC_PAYMENT_FAILED


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worker.analytics_service")
settings = get_settings()

async def handle_event(redis: Redis, topic: str, event: dict) -> None:
    pipe = redis.pipeline()
    if topic == TOPIC_BID_PLACED:
        pipe.incr("analytics:bids:total")
        pipe.incr(f"analytics:room:{event['room_id']}:bid_count")
        pipe.set(f"analytics:room:{event['room_id']}:last_price", event["amount"])
    elif topic == TOPIC_AUCTION_WON:
        pipe.incr("analytics:auctions:won_total")
        pipe.incrbyfloat("analytics:gmv_total", event["final_price"])
    elif topic == TOPIC_PAYMENT_FAILED:
        pipe.incr("analytics:payments:failed_total")
    await pipe.execute()

async def run() -> None:
    topics = [TOPIC_BID_PLACED, TOPIC_AUCTION_WON, TOPIC_PAYMENT_FAILED]
    consumer = build_consumer(topics, settings.KAFKA_CONSUMER_GROUP_ANALYTICS)
    redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    await consumer.start()
    logger.info("analytics_service consumer started")
    try: 
        async for msg in consumer:
            try:
                await handle_event(redis, msg.topic, msg.value)
                await consumer.commit()
            except Exception:
                logger.exception("failed processing message offset=%s", msg.offset)
    finally:
        await consumer.stop()
        await redis.close()


if __name__ == "__main__":
    asyncio.run(run())