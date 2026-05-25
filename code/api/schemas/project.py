"""
投票项目相关 Schema
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: str
    candidates: List[str]


class ProjectCreate(ProjectBase):
    voters: Optional[List[str]] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    project_id: str
    name: str
    description: str
    candidates: List[str]
    status: str
    created_at: str
    created_by: str
    trustees: List[str]
    voters: List[str]
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    
    class Config:
        from_attributes = True


class AssignTrusteesRequest(BaseModel):
    trustee_ids: List[str]


class AssignVotersRequest(BaseModel):
    voter_ids: List[str]


class UpdateStatusRequest(BaseModel):
    status: str
