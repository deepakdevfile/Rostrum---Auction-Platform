import asyncio
import logging

from app.core.config import get_settings
from app.events.consumer_base import build_consumer
from app.events.topics import TOPIC_BID_PLACED, TOPIC_AUCTION_WON, TOPIC_PAYMENT_FAILED

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worker.notification_service")
settings = get_settings()

async def _send(channel: str, recipient_id: str, message: str) -> None:
    logger.info("[notify:%s] -> user=%s : %s", channel, recipient_id, message)

async def handle_event(topic: str, event: dict) -> None:
    if topic == TOPIC_BID_PLACED:
        await _send(
            "push",
            event["bidder_id"],
            f"Your bid of {event['amount']} on room {event['room_id']} was accepted.",
        )
    elif topic == TOPIC_AUCTION_WON:
        await _send(
            "email",
            event["winner_id"],
            f"You won room {event['room_id']} at {event['final_price']}!",
        )
        await _send(
            "email",
            event["seller_id"],
            f"Your item in room {event["room_id"]} sold for {event['final_price']}.",
        )
    elif topic == TOPIC_PAYMENT_FAILED:
        await _send(
            "email",
            event["winner_id"],
            f"Payment for the room {event['room_id']} failed: {event['reason']}. Please retry.",
        )

async def run() -> None:
    topics = [TOPIC_BID_PLACED, TOPIC_AUCTION_WON, TOPIC_PAYMENT_FAILED]
    consumer = build_consumer(topics, settings.KAFKA_CONSUMER_GROUP_NOTIFICATIONS)
    await consumer.start()
    logger.info("notification_service consumer started")
    try: 
        async for msg in consumer:
            try:
                await handle_event(msg.topic, msg.value)
                await consumer.commit()
            except Exception:
                logger.exception("failed processing message offset=%s", msg.offset)
    finally:
        await consumer.stop()


if __name__ == "__main__":
    asyncio.run(run())