"""
依赖注入模块
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from account_system.users import UserManager
from account_system.voting_project import ProjectManager
from account_system.ballot import BallotManager


_user_manager_instance = None
_project_manager_instance = None
_ballot_manager_instance = None


def get_user_manager() -> UserManager:
    global _user_manager_instance
    if _user_manager_instance is None:
        _user_manager_instance = UserManager()
    return _user_manager_instance


def get_project_manager() -> ProjectManager:
    global _project_manager_instance
    if _project_manager_instance is None:
        _project_manager_instance = ProjectManager()
    return _project_manager_instance


def get_ballot_manager() -> BallotManager:
    global _ballot_manager_instance
    if _ballot_manager_instance is None:
        _ballot_manager_instance = BallotManager()
    return _ballot_manager_instance
