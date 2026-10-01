from fastapi import APIRouter
from app.schemas.user import UserCreate

router = APIRouter(prefix = "/auth", tags=["auth"])

@router.post("/register")
async def register(payload: UserCreate):
    return "okay"