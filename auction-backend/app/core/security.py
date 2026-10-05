from uuid import UUID
from datetime import datetime, timezone, timedelta
from app.core.config import get_settings
from jose import jwt, JWTError
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

def verify_password(plain: str, hashed: str) -> bool:
    return password_hash.verify(plain, hashed)

def decode_access_token(token: str) -> dict | None:
    try: 
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        return None