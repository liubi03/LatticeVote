"""
加密相关路由
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class EncryptRequest(BaseModel):
    vote: int
    public_key: str


class EncryptResponse(BaseModel):
    encrypted_vote: str


class SignRequest(BaseModel):
    data: str
    private_key: str


class SignResponse(BaseModel):
    signature: str


@router.post("/encrypt", response_model=EncryptResponse)
async def encrypt_vote(request: EncryptRequest):
    encrypted = f"encrypted_{request.vote}_{request.public_key[:16]}"
    return EncryptResponse(encrypted_vote=encrypted)


@router.post("/sign", response_model=SignResponse)
async def sign_data(request: SignRequest):
    signature = f"signature_{hash(request.data) % 1000000}_{request.private_key[:16]}"
    return SignResponse(signature=signature)


@router.get("/keypair")
async def generate_keypair():
    import secrets
    public_key = secrets.token_hex(32)
    private_key = secrets.token_hex(64)
    return {
        "public_key": public_key,
        "private_key": private_key
    }
