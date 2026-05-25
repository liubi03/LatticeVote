"""
选票相关 Schema
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class BallotCreate(BaseModel):
    project_id: str
    voter_id: str
    choice: int
    public_key_pem: str
    private_key_pem: str


class BallotResponse(BaseModel):
    ballot_id: str
    project_id: str
    voter_id: str
    timestamp: str
    
    class Config:
        from_attributes = True


class BallotCheckResponse(BaseModel):
    has_voted: bool
    voter_id: str
    project_id: str


class BallotCountResponse(BaseModel):
    project_id: str
    count: int
