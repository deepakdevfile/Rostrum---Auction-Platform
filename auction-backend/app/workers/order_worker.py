
import asyncio
import logging
import random

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.session import AsyncSessionLocal
from app.events.consumer_base import build_consumer
from app.events.schemas import payment_failed_payload
from app.models.order import Order, Payment, PaymentStatus, OrderStatus
from app.models.outbox import OutboxEvent
from app.core.config import get_settings
from app.events.topics import TOPIC_AUCTION_WON

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worker.order_service")
settings = get_settings()

SIMULATED_FAILURE_RATE = 0.15

async def handle_auction_won(event: dict) -> None:
    room_id = event["room_id"]
    winner_id = event["winner_id"]
    amount = event["final_price"]

    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(Order).where(Order.room_id == room_id))
        if existing.scalar_one_or_none() is not None:
            logger.info("order already exists for room=%s, skipping (idempotent)", room_id)
            return

        order = Order(room_id = room_id, winner_id = winner_id, amount = amount)
        db.add(order)
        try:
            await db.flush()
        except IntegrityError:
            await db.rollback()
            logger.info("order race list for room=%s, another instance won it", room_id)
            return 

        payment_succeeded = random.random() > SIMULATED_FAILURE_RATE
        payment = Payment(
            order_id = order.id,
            status = PaymentStatus.succeeded if payment_succeeded else PaymentStatus.failed,
            failure_reason = None if payment_succeeded else "card_declined_simulated",
        )
        db.add(payment)
        order.status = OrderStatus.paid if payment_succeeded else OrderStatus.failed

        if not payment_succeeded:
            db.add(
                OutboxEvent(
                    aggregate_type = "order",
                    aggregate_id = order.id,
                    partition_key = room_id,
                    event_type = "PaymentFailed",
                    payload = payment_failed_payload(
                        room_id, order.id, winner_id, "card_declined_simulated"
                    ),
                )
            )

        await db.commit()
        logger.info("order %s for room %s: %s", order.id, room_id, order.status.value)


async def run() -> None:
    consumer = build_consumer([TOPIC_AUCTION_WON], settings.KAFKA_CONSUMER_GROUP_ORDERS)
    await consumer.start()
    logger.info("order_service consumer started")
    try:
        async for msg in consumer:
            try:
                await handle_auction_won(msg.value)
                await consumer.commit()
            except Exception:
                logger.exception("failed processing AuctionWon offset=%s", msg.offset)
    finally:
        await consumer.stop()


if __name__ == "__main__":
    asyncio.run(run())