import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.order import Order, Payment
from app.models.user import User

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/by-room/{room_id}")
async def get_order_for_room(
    room_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.room_id == room_id))
    order = result.scalar_one_or_none()
    if order is None: 
        raise HTTPException(404, "order_not_created_yet")

    payments_result = await db.execute(
        select(Payment).where(Payment.order_id == order.id).order_by(Payment.created_at)
    )
    payments = payments_result.scalars().all()

    return {
        "id": str(order.id),
        "room_id": str(order.room_id),
        "winner_id": str(order.winner_id),
        "amount": str(order.amount),
        "status": order.status.value,
        "payments": [{
            "id": str(p.id),
            "status": p.status.value,
            "failure_reason": p.failure_reason,
            "created_at": p.created_at.isoformat(),
        } for p in payments],
    }
    