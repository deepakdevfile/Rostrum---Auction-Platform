import asyncio
import logging

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.events.producer import publish
from app.events.topics import TOPIC_AUCTION_WON, TOPIC_BID_PLACED, TOPIC_PAYMENT_FAILED
from app.models.outbox import OutboxEvent, OutboxStatus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("outbox.relay")

EVENT_TYPE_TO_TOPIC = {
    "BidPlaced": TOPIC_BID_PLACED,
    "AuctionWon": TOPIC_AUCTION_WON,
    "PaymentFailed": TOPIC_PAYMENT_FAILED,
}

POLL_INTERVAL_SECONDS = 0.5
BATCH_SIZE = 50

async def _process_batch(session: AsyncSession) -> int:
    result = await session.execute(
        select(OutboxEvent)
        .where(OutboxEvent.status == OutboxStatus.pending)
        .order_by(OutboxEvent.id)
        .limit(BATCH_SIZE)
        .with_for_update(skip_locked=True)
    )

    rows = result.scalars().all()
    if not rows:
        return 0

    for row in rows:
        topic = EVENT_TYPE_TO_TOPIC.get(row.event_type)
        if topic is None:
            logger.warning("no topic mapped for event_type=%s", row.event_type)
            continue
        try:
            await publish(topic, key=str(row.partition_key), payload=row.payload)
            await session.execute(
                update(OutboxEvent)
                .where(OutboxEvent.id == row.id)
                .values(status=OutboxStatus.pulished)
            )
        except Exception:
            logger.exception("failed to publish outbox row id=%s", row.id)
            await session.execute(
                update(OutboxEvent)
                .where(OutboxEvent.id == row.id)
                .values(attempts=OutboxEvent.attempts + 1)
            )
    await session.commit()
    return len(rows)

async def run_forever() -> None:
    logger.info("outbox relay starting")
    while True:
        async with AsyncSessionLocal() as session:
            try:
                processed = await _process_batch(session)
            except Exception: 
                logger.exception("relay batch failed")
                await session.rollback()
                processed = 0
        if processed == 0:
            await asyncio.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    asyncio.run(run_forever())