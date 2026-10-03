import uuid
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: UserRole = UserRole.bidder

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    username: str
    role: UserRole

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class UserLogin(BaseModel):
    email: EmailStr
    password: str