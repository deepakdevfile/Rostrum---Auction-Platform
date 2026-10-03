from fastapi import APIRouter, Depends, status, HTTPException
from app.schemas.user import UserCreate, Token, UserOut, UserLogin
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from sqlalchemy import select
from app.models.user import User
from app.core.security import hash_password, create_access_token, verify_password

router = APIRouter(prefix = "/auth", tags=["auth"])

@router.post("/register", response_model = Token, status_code = status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(User).where(
            (User.email == payload.email) | (User.username == payload.username)
        )
    )

    if existing.scalar_one_or_none():
        raise HTTPException(400, "email_or_username_taken")

    user = User(
        email = payload.email,
        username = payload.username,
        hashed_password = hash_password(payload.password),
        role = payload.role,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id, user.role.value)
    return Token(access_token = token, user = UserOut.model_validate(user))

@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "invalid_credentials")
    token = create_access_token(user.id, user.role.value)
    return Token(access_token=token, user=UserOut.model_validate(user))