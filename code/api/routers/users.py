"""
用户管理路由
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_user_manager
from ..schemas.user import UserResponse, UserUpdate
from ..utils.deps import get_current_admin, get_current_active_user
from account_system.users import UserManager, User, UserRole

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    current_user: User = Depends(get_current_admin),
    user_manager: UserManager = Depends(get_user_manager)
):
    users = user_manager.get_all_users()
    
    return [
        UserResponse(
            user_id=u.user_id,
            username=u.username,
            role=u.role,
            status=u.status,
            created_at=u.created_at,
            approved_at=u.approved_at,
            approved_by=u.approved_by
        )
        for u in users
    ]


@router.get("/pending", response_model=List[UserResponse])
async def get_pending_users(
    current_user: User = Depends(get_current_admin),
    user_manager: UserManager = Depends(get_user_manager)
):
    users = user_manager.get_pending_users()
    
    return [
        UserResponse(
            user_id=u.user_id,
            username=u.username,
            role=u.role,
            status=u.status,
            created_at=u.created_at,
            approved_at=u.approved_at,
            approved_by=u.approved_by
        )
        for u in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    user_manager: UserManager = Depends(get_user_manager)
):
    user = user_manager.get_user(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return UserResponse(
        user_id=user.user_id,
        username=user.username,
        role=user.role,
        status=user.status,
        created_at=user.created_at,
        approved_at=user.approved_at,
        approved_by=user.approved_by
    )


@router.post("/{user_id}/approve", response_model=UserResponse)
async def approve_user(
    user_id: str,
    current_user: User = Depends(get_current_admin),
    user_manager: UserManager = Depends(get_user_manager)
):
    try:
        user = user_manager.approve_user(user_id, current_user.user_id)
        
        return UserResponse(
            user_id=user.user_id,
            username=user.username,
            role=user.role,
            status=user.status,
            created_at=user.created_at,
            approved_at=user.approved_at,
            approved_by=user.approved_by
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{user_id}/reject", response_model=UserResponse)
async def reject_user(
    user_id: str,
    current_user: User = Depends(get_current_admin),
    user_manager: UserManager = Depends(get_user_manager)
):
    try:
        user = user_manager.reject_user(user_id, current_user.user_id)
        
        return UserResponse(
            user_id=user.user_id,
            username=user.username,
            role=user.role,
            status=user.status,
            created_at=user.created_at,
            approved_at=user.approved_at,
            approved_by=user.approved_by
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin),
    user_manager: UserManager = Depends(get_user_manager)
):
    try:
        user_manager.delete_user(user_id)
        return {"message": "用户已删除"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/role/{role}", response_model=List[UserResponse])
async def get_users_by_role(
    role: str,
    current_user: User = Depends(get_current_active_user),
    user_manager: UserManager = Depends(get_user_manager)
):
    users = user_manager.get_users_by_role(role)
    
    return [
        UserResponse(
            user_id=u.user_id,
            username=u.username,
            role=u.role,
            status=u.status,
            created_at=u.created_at,
            approved_at=u.approved_at,
            approved_by=u.approved_by
        )
        for u in users
    ]
