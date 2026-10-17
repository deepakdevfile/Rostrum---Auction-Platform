from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from fastapi.security import OAuth2PasswordBearer

from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User
from app.core.security import decode_access_token

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/api/v1/auth/login")

_redis: Redis | None = None

def get_redis() -> Redis:
    global _redis
    if _redis is None: 
        _redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis

async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        db: Annotated[AsyncSession, Depends(get_db)],
) -> User: 
    payload = decode_access_token(token)
    if payload is None: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_token"
        )
    try:
        user_id = UUID(payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_token"
        )
    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="user_not_found"
        )
    return user

async def get_current_user_ws(token: str, db: AsyncSession) -> User | None:
    payload = decode_access_token(token)
    if payload is None:
        return None
    try: 
        user_id = UUID(payload["sub"])
    except(KeyError, ValueError):
        return None
    return await db.get(User, user_id)