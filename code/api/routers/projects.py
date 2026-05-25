"""
投票项目路由
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_project_manager, get_user_manager
from ..schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    AssignTrusteesRequest, AssignVotersRequest, UpdateStatusRequest
)
from ..utils.deps import get_current_admin, get_current_trustee, get_current_active_user
from account_system.voting_project import ProjectManager, ProjectStatus
from account_system.users import UserManager, User

router = APIRouter()


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_admin),
    project_manager: ProjectManager = Depends(get_project_manager)
):
    project = project_manager.create_project(
        name=project_data.name,
        description=project_data.description,
        candidates=project_data.candidates,
        created_by=current_user.user_id,
        voters=project_data.voters
    )
    
    return ProjectResponse(
        project_id=project.project_id,
        name=project.name,
        description=project.description,
        candidates=project.candidates,
        status=project.status,
        created_at=project.created_at,
        created_by=project.created_by,
        trustees=project.trustees,
        voters=project.voters,
        start_time=project.start_time,
        end_time=project.end_time
    )


@router.get("/", response_model=List[ProjectResponse])
async def get_all_projects(
    current_user: User = Depends(get_current_active_user),
    project_manager: ProjectManager = Depends(get_project_manager)
):
    projects = project_manager.get_all_projects()
    
    return [
        ProjectResponse(
            project_id=p.project_id,
            name=p.name,
            description=p.description,
            candidates=p.candidates,
            status=p.status,
            created_at=p.created_at,
            created_by=p.created_by,
            trustees=p.trustees,
            voters=p.voters,
            start_time=p.start_time,
            end_time=p.end_time
        )
        for p in projects
    ]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_active_user),
    project_manager: ProjectManager = Depends(get_project_manager)
):
    project = project_manager.get_project(project_id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="项目不存在"
        )
    
    return ProjectResponse(
        project_id=project.project_id,
        name=project.name,
        description=project.description,
        candidates=project.candidates,
        status=project.status,
        created_at=project.created_at,
        created_by=project.created_by,
        trustees=project.trustees,
        voters=project.voters,
        start_time=project.start_time,
        end_time=project.end_time
    )


@router.put("/{project_id}/status", response_model=ProjectResponse)
async def update_project_status(
    project_id: str,
    status_data: UpdateStatusRequest,
    current_user: User = Depends(get_current_admin),
    project_manager: ProjectManager = Depends(get_project_manager)
):
    try:
        project = project_manager.update_project_status(project_id, status_data.status)
        
        return ProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            candidates=project.candidates,
            status=project.status,
            created_at=project.created_at,
            created_by=project.created_by,
            trustees=project.trustees,
            voters=project.voters,
            start_time=project.start_time,
            end_time=project.end_time
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{project_id}/trustees", response_model=ProjectResponse)
async def assign_trustees(
    project_id: str,
    trustees_data: AssignTrusteesRequest,
    current_user: User = Depends(get_current_admin),
    project_manager: ProjectManager = Depends(get_project_manager)
):
    try:
        project = project_manager.assign_trustees(project_id, trustees_data.trustee_ids)
        
        return ProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            candidates=project.candidates,
            status=project.status,
            created_at=project.created_at,
            created_by=project.created_by,
            trustees=project.trustees,
            voters=project.voters,
            start_time=project.start_time,
            end_time=project.end_time
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{project_id}/voters", response_model=ProjectResponse)
async def assign_voters(
    project_id: str,
    voters_data: AssignVotersRequest,
    current_user: User = Depends(get_current_admin),
    project_manager: ProjectManager = Depends(get_project_manager)
):
    try:
        project = project_manager.assign_voters(project_id, voters_data.voter_ids)
        
        return ProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            candidates=project.candidates,
            status=project.status,
            created_at=project.created_at,
            created_by=project.created_by,
            trustees=project.trustees,
            voters=project.voters,
            start_time=project.start_time,
            end_time=project.end_time
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/status/{status}", response_model=List[ProjectResponse])
async def get_projects_by_status(
    status: str,
    current_user: User = Depends(get_current_active_user),
    project_manager: ProjectManager = Depends(get_project_manager)
):
    projects = project_manager.get_projects_by_status(status)
    
    return [
        ProjectResponse(
            project_id=p.project_id,
            name=p.name,
            description=p.description,
            candidates=p.candidates,
            status=p.status,
            created_at=p.created_at,
            created_by=p.created_by,
            trustees=p.trustees,
            voters=p.voters,
            start_time=p.start_time,
            end_time=p.end_time
        )
        for p in projects
    ]


@router.get("/my/voter", response_model=List[ProjectResponse])
async def get_my_voting_projects(
    current_user: User = Depends(get_current_active_user),
    project_manager: ProjectManager = Depends(get_project_manager)
):
    projects = project_manager.get_projects_by_voter(current_user.user_id)
    
    return [
        ProjectResponse(
            project_id=p.project_id,
            name=p.name,
            description=p.description,
            candidates=p.candidates,
            status=p.status,
            created_at=p.created_at,
            created_by=p.created_by,
            trustees=p.trustees,
            voters=p.voters,
            start_time=p.start_time,
            end_time=p.end_time
        )
        for p in projects
    ]


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_admin),
    project_manager: ProjectManager = Depends(get_project_manager)
):
    try:
        project_manager.delete_project(project_id)
        return {"message": "项目已删除"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
