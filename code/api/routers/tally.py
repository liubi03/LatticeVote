"""
计票路由
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_project_manager, get_ballot_manager
from ..utils.deps import get_current_trustee, get_current_admin, get_current_active_user
from account_system.voting_project import ProjectManager, ProjectStatus
from account_system.ballot import BallotManager
from account_system.users import User

router = APIRouter()


@router.post("/{project_id}", response_model=Dict[str, Any])
async def tally_project(
    project_id: str,
    current_user: User = Depends(get_current_trustee),
    project_manager: ProjectManager = Depends(get_project_manager),
    ballot_manager: BallotManager = Depends(get_ballot_manager)
):
    project = project_manager.get_project(project_id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    if current_user.role != "admin" and current_user.user_id not in project.trustees:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是该项目的受托人"
        )
    
    if project.status != "finished":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="项目尚未结束，无法计票"
        )
    
    try:
        results = ballot_manager.tally_ballots(
            project_id=project_id,
            crypto_context_path=project.crypto_context_path,
            num_candidates=len(project.candidates)
        )
        
        total_votes = sum(results)
        
        max_votes = max(results)
        winner_indices = [i for i, v in enumerate(results) if v == max_votes]
        winners = [project.candidates[i] for i in winner_indices]
        
        project_manager.update_project_status(project_id, ProjectStatus.TALLIED.value)
        
        return {
            "success": True,
            "project_id": project_id,
            "project_name": project.name,
            "candidates": project.candidates,
            "results": results,
            "total_votes": total_votes,
            "winners": winners,
            "winner_indices": winner_indices,
            "detailed_results": [
                {
                    "candidate": project.candidates[i],
                    "votes": results[i],
                    "percentage": round(results[i] / total_votes * 100, 2) if total_votes > 0 else 0
                }
                for i in range(len(project.candidates))
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"计票失败: {str(e)}"
        )


@router.get("/{project_id}/results", response_model=Dict[str, Any])
async def get_tally_results(
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
    
    if project.status != "tallied":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="项目尚未完成计票"
        )
    
    try:
        results = ballot_manager.tally_ballots(
            project_id=project_id,
            crypto_context_path=project.crypto_context_path,
            num_candidates=len(project.candidates)
        )
        
        total_votes = sum(results)
        
        max_votes = max(results)
        winner_indices = [i for i, v in enumerate(results) if v == max_votes]
        winners = [project.candidates[i] for i in winner_indices]
        
        return {
            "success": True,
            "project_id": project_id,
            "project_name": project.name,
            "candidates": project.candidates,
            "results": results,
            "total_votes": total_votes,
            "winners": winners,
            "winner_indices": winner_indices,
            "detailed_results": [
                {
                    "candidate": project.candidates[i],
                    "votes": results[i],
                    "percentage": round(results[i] / total_votes * 100, 2) if total_votes > 0 else 0
                }
                for i in range(len(project.candidates))
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取结果失败: {str(e)}"
        )


@router.get("/{project_id}/preview", response_model=Dict[str, Any])
async def preview_tally(
    project_id: str,
    current_user: User = Depends(get_current_admin),
    project_manager: ProjectManager = Depends(get_project_manager),
    ballot_manager: BallotManager = Depends(get_ballot_manager)
):
    project = project_manager.get_project(project_id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    ballot_count = ballot_manager.get_ballot_count(project_id)
    
    return {
        "project_id": project_id,
        "project_name": project.name,
        "status": project.status,
        "total_voters": len(project.voters),
        "ballots_submitted": ballot_count,
        "participation_rate": round(ballot_count / len(project.voters) * 100, 2) if project.voters else 0,
        "can_tally": project.status == "finished" and ballot_count > 0
    }
