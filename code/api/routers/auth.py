"""
认证路由
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ..dependencies import get_user_manager
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenWithUser
from ..utils.jwt import create_access_token
from ..utils.deps import get_current_active_user
from account_system.users import UserManager, User, UserRole

router = APIRouter()


@router.post("/login", response_model=TokenWithUser)
async def login(
    user_data: UserLogin,
    user_manager: UserManager = Depends(get_user_manager)
):
    user = user_manager.authenticate_user(user_data.username, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.user_id, role=user.role)
    
    return TokenWithUser(
        access_token=access_token,
        user=UserResponse(
            user_id=user.user_id,
            username=user.username,
            role=user.role,
            status=user.status,
            created_at=user.created_at,
            approved_at=user.approved_at,
            approved_by=user.approved_by,
            public_key=user.public_key,
            private_key=user.private_key
        )
    )


@router.post("/login/form", response_model=Token)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_manager: UserManager = Depends(get_user_manager)
):
    user = user_manager.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.user_id, role=user.role)
    
    return Token(access_token=access_token)


@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    user_manager: UserManager = Depends(get_user_manager)
):
    try:
        user = user_manager.register_user(
            username=user_data.username,
            password=user_data.password,
            role=user_data.role,
            public_key=user_data.public_key,
            private_key=user_data.private_key
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
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/logout")
async def logout():
    return {"message": "登出成功"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    return UserResponse(
        user_id=current_user.user_id,
        username=current_user.username,
        role=current_user.role,
        status=current_user.status,
        created_at=current_user.created_at,
        approved_at=current_user.approved_at,
        approved_by=current_user.approved_by,
        public_key=current_user.public_key,
        private_key=current_user.private_key
    )
