import uuid

from datetime import datetime, timezone
from typing import Any, TypedDict, Literal

class BidPlacedEvent(TypedDict):
    event_type: Literal["BidPlaced"]
    room_id: str
    bid_id: str
    bidder_id: str
    amount: str
    previous_price: float
    room_version: int 
    occured_at: str

class AuctionWonEvent(TypedDict):
    event_type: Literal["AuctionWon"]
    room_id: str
    order_id: str
    winner_id: str
    reason: str
    occurred_at: str

class PaymentFailedEvent(TypedDict):
    event_type: Literal["PaymentFailed"]
    room_id: str
    winner_id: str
    final_price: float
    seller_id: str
    occurred_at: str

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def bid_placed_payload(
    room_id: uuid.UUID,
    bid_id: uuid.UUID,
    bidder_id: uuid.UUID,
    amount: float,
    previous_price: float,
    room_version: int,
) -> dict[str, Any]:
    return BidPlacedEvent(
        event_type = "BidPlaced",
        room_id = str(room_id),
        bid_id = str(bid_id),
        bidder_id = str(bidder_id),
        amount = float(amount),
        previous_price = float(previous_price),
        room_version = room_version,
        occured_at = now_iso(),
    )

def auction_won_payload(
        room_id: uuid.UUID, 
        winner_id: uuid.UUID, 
        final_price: float, 
        seller_id: uuid.UUID
) -> dict[str, Any]:
    return AuctionWonEvent(
        event_type="AuctionWon",
        room_id=str(room_id),
        winner_id=str(winner_id),
        final_price=float(final_price),
        seller_id=str(seller_id),
        occurred_at=now_iso(),
    )

def payment_failed_payload(
        room_id: uuid.UUID,
        order_id: uuid.UUID,
        winner_id: uuid.UUID,
        reason: str
) -> dict[str, Any]:
    return PaymentFailedEvent(
        event_type="PaymentFailed",
        room_id=str(room_id),
        order_id = str(order_id),
        winner_id = str(winner_id),
        reason = reason,
        occurred_at=now_iso(),
    )