import asyncio
import logging
from datetime import datetime, timezone

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.room import AuctionRoom, RoomStatus
from app.services.realtime import announce_room_status

logger = logging.getLogger("room.lifecycle")
POLL_INTERNAL_SECONDS = 2.0

async def _close_one_expired_room(db: AsyncSession, redis: Redis) -> bool:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(AuctionRoom)
        .where(AuctionRoom.status == RoomStatus.live, AuctionRoom.ends_at <= now)
        .limit(1)
        .with_for_update(skip_locked=True)
    )
    room = result.scalar_one_or_none()
    if room is None: 
        return False

    # latest_bid_result = await db.execute(
    #     select(Bid)
    #     .where(Bid.room_id == room.id)
    #     .order_by(Bid.created_at.desc())
    #     .limit(1)
    # )
    # latest_bid = latest_bid_result.scalar_one_or_none()

    room.status = RoomStatus.ended
    # if latest_bid is not None: 
    #     room_winner_id = latest_bid.bidder_id
    #     db.add(
    #         OutboxEvent(
    #             aggregate_type = "auction_room",
    #             aggregate_id = room.id,
    #             partition_key = room.id,
    #             event_type = "AuctionWon",
    #             payload = auction_won_payload(room.id, latest_bid.bidder_id, float(room.current_price), room.seller_id),
    #         ),
    #     )

    await db.commit()
    await db.refresh(room)

    await announce_room_status(
        redis, 
        room, 
        {"winner_id": str(room.winner_id) if room.winner_id else None},
    )
    logger.info("closed room %s, winner=%s", room.id, room.winner_id)
    return True

async def _open_one_scheduled_room(db: AsyncSession, redis: Redis) -> bool:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(AuctionRoom)
        .where(AuctionRoom.status == RoomStatus.scheduled, AuctionRoom.starts_at <= now)
        .limit(1)
        .with_for_update(skip_locked=True)
    )
    room = result.scalar_one_or_none()
    if room is None:
        return False

    room.status = RoomStatus.live
    await db.commit()
    await db.refresh(room)
    await announce_room_status(redis, room, {})
    logger.info("opened room %s", room.id)
    return True

async def run_forever(redis: Redis) -> None:
    logger.info("room lifecycle loop starting")
    while True:
        did_work = False
        try: 
            async with AsyncSessionLocal() as db:
                did_work = await _open_one_scheduled_room(db, redis) or did_work
            async with AsyncSessionLocal() as db: 
                did_work = await _close_one_expired_room(db, redis) or did_work
        except: 
            logger.exception("room lifecycle tick failed")
        if not did_work:
            await asyncio.sleep(POLL_INTERNAL_SECONDS)