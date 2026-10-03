from uuid import UUID
from datetime import datetime, timezone, timedelta
from app.core.config import get_settings
from jose import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

settings = get_settings()
password_hash = PasswordHash((BcryptHasher(), ))

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def create_access_token(user_id: UUID, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm = "HS256")