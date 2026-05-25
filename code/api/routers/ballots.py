"""
选票路由
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_project_manager, get_ballot_manager
from ..schemas.ballot import BallotCreate, BallotResponse, BallotCheckResponse, BallotCountResponse
from ..utils.deps import get_current_voter, get_current_active_user
from account_system.voting_project import ProjectManager
from account_system.ballot import BallotManager
from account_system.users import User

router = APIRouter()


@router.post("/", response_model=BallotResponse)
async def submit_ballot(
    ballot_data: BallotCreate,
    current_user: User = Depends(get_current_voter),
    project_manager: ProjectManager = Depends(get_project_manager),
    ballot_manager: BallotManager = Depends(get_ballot_manager)
):
    project = project_manager.get_project(ballot_data.project_id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    if project.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="项目未激活，无法投票"
        )
    
    if current_user.user_id not in project.voters:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该项目的选民"
        )
    
    if ballot_data.choice < 0 or ballot_data.choice >= len(project.candidates):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的选择: {ballot_data.choice}"
        )
    
    try:
        ballot = ballot_manager.create_ballot(
            project_id=ballot_data.project_id,
            voter_id=current_user.user_id,
            choice=ballot_data.choice,
            num_candidates=len(project.candidates),
            private_key_pem=ballot_data.private_key_pem,
            public_key_pem=ballot_data.public_key_pem,
            crypto_context_path=project.crypto_context_path
        )
        
        ballot_manager.submit_ballot(ballot, ballot_data.public_key_pem)
        
        return BallotResponse(
            ballot_id=ballot.ballot_id,
            project_id=ballot.project_id,
            voter_id=ballot.voter_id,
            timestamp=ballot.timestamp
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/check/{project_id}", response_model=BallotCheckResponse)
async def check_has_voted(
    project_id: str,
    current_user: User = Depends(get_current_active_user),
    ballot_manager: BallotManager = Depends(get_ballot_manager)
):
    has_voted = ballot_manager.has_voted(project_id, current_user.user_id)
    
    return BallotCheckResponse(
        has_voted=has_voted,
        voter_id=current_user.user_id,
        project_id=project_id
    )


@router.get("/count/{project_id}", response_model=BallotCountResponse)
async def get_ballot_count(
    project_id: str,
    current_user: User = Depends(get_current_active_user),
    ballot_manager: BallotManager = Depends(get_ballot_manager)
):
    count = ballot_manager.get_ballot_count(project_id)
    
    return BallotCountResponse(
        project_id=project_id,
        count=count
    )


@router.get("/{project_id}", response_model=List[BallotResponse])
async def get_project_ballots(
    project_id: str,
    current_user: User = Depends(get_current_active_user),
    project_manager: ProjectManager = Depends(get_project_manager),
    ballot_manager: BallotManager = Depends(get_ballot_manager)
):
    project = project_manager.get_project(project_id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    if current_user.role not in ["admin", "trustee"]:
        if current_user.user_id not in project.trustees:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权查看该项目的选票"
            )
    
    ballots = ballot_manager.get_ballots(project_id)
    
    return [
        BallotResponse(
            ballot_id=b.ballot_id,
            project_id=b.project_id,
            voter_id=b.voter_id,
            timestamp=b.timestamp
        )
        for b in ballots
    ]
