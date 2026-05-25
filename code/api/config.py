"""
FastAPI 配置模块
"""

import os
from typing import List


class Settings:
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production-12345678"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    PROJECT_NAME: str = "LatticeVote API"
    
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    DATA_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "account_system", "data"
    )
    
    USERS_DATA_FILE: str = ""
    PROJECTS_DATA_FILE: str = ""
    
    def __init__(self):
        self.USERS_DATA_FILE = os.path.join(self.DATA_DIR, "users.json")
        self.PROJECTS_DATA_FILE = os.path.join(self.DATA_DIR, "projects.json")


settings = Settings()
