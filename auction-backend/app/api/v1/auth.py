from fastapi import APIRouter, Depends
from app.schemas.user import UserCreate
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter(prefix = "/auth", tags=["auth"])

@router.post("/register")
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    return "okay"