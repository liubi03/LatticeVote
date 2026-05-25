"""
FastAPI 应用入口
LatticeVote 电子投票系统 API 服务
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth_router, users_router, projects_router, ballots_router, tally_router, crypto_router


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="基于格密码的同态加密电子投票系统 API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["认证"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["用户管理"])
app.include_router(projects_router, prefix=f"{settings.API_V1_STR}/projects", tags=["投票项目"])
app.include_router(ballots_router, prefix=f"{settings.API_V1_STR}/ballots", tags=["选票"])
app.include_router(tally_router, prefix=f"{settings.API_V1_STR}/tally", tags=["计票"])
app.include_router(crypto_router, prefix=f"{settings.API_V1_STR}/crypto", tags=["加密"])


@app.get("/")
async def root():
    return {
        "message": "LatticeVote API",
        "version": "1.0.0",
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
