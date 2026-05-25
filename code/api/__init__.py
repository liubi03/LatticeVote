"""
LatticeVote FastAPI 后端服务
基于格密码的同态加密电子投票系统
"""

from .main import app
from .config import settings

__all__ = ["app", "settings"]
