"""
用户相关 Schema
"""

from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):
    username: str
    role: str = "voter"


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "voter"
    public_key: Optional[str] = None
    private_key: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    user_id: str
    username: str
    role: str
    status: str
    created_at: str
    approved_at: Optional[str] = None
    approved_by: Optional[str] = None
    public_key: Optional[str] = None
    private_key: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    role: Optional[str] = None
    status: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenWithUser(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: str
    exp: int
    role: str
