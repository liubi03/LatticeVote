"""
投票项目管理模块
实现投票项目的创建、管理和状态管理功能
"""

import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend import crypto


class ProjectStatus(Enum):
    """投票项目状态枚举"""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    FINISHED = "finished"
    TALLIED = "tallied"


@dataclass
class VotingProject:
    """投票项目类"""
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
    crypto_context_path: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'VotingProject':
        """从字典创建项目对象"""
        if 'voters' not in data:
            data['voters'] = []
        return cls(**data)


class ProjectManager:
    """投票项目管理类"""
    
    def __init__(self, data_file: str = None):
        if data_file is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_file = os.path.join(current_dir, "data", "projects.json")
        self.data_file = data_file
        self.projects: Dict[str, VotingProject] = {}
        self.project_counter: int = 0
        self._load_data()
    
    def _load_data(self):
        """从文件加载项目数据"""
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            self.project_counter = data.get('project_counter', 0)
            
            for project_data in data.get('projects', []):
                project = VotingProject.from_dict(project_data)
                self.projects[project.project_id] = project
                
        except FileNotFoundError:
            self._save_data()
    
    def _save_data(self):
        """保存项目数据到文件"""
        data = {
            'projects': [project.to_dict() for project in self.projects.values()],
            'project_counter': self.project_counter
        }
        
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def create_project(self, name: str, description: str, candidates: List[str],
                      created_by: str, voters: List[str] = None) -> VotingProject:
        """
        创建新的投票项目
        
        Args:
            name: 项目名称
            description: 项目描述
            candidates: 候选人列表
            created_by: 创建者ID
            voters: 选民ID列表
        
        Returns:
            创建的投票项目对象
        """
        self.project_counter += 1
        project_id = f"project_{self.project_counter:03d}"
        created_at = datetime.now().isoformat()
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        crypto_path = os.path.join(current_dir, "data", f"crypto_{project_id}")
        bfv_context = crypto.BFVContext()
        bfv_context.save_context(crypto_path)
        
        relative_crypto_path = f"code/account_system/data/crypto_{project_id}"
        
        project = VotingProject(
            project_id=project_id,
            name=name,
            description=description,
            candidates=candidates,
            status=ProjectStatus.DRAFT.value,
            created_at=created_at,
            created_by=created_by,
            trustees=[],
            voters=voters if voters else [],
            crypto_context_path=relative_crypto_path
        )
        
        self.projects[project_id] = project
        self._save_data()
        
        return project
    
    def get_project(self, project_id: str) -> Optional[VotingProject]:
        """获取投票项目"""
        return self.projects.get(project_id)
    
    def get_all_projects(self) -> List[VotingProject]:
        """获取所有投票项目"""
        return list(self.projects.values())
    
    def get_projects_by_status(self, status: str) -> List[VotingProject]:
        """按状态获取投票项目"""
        return [p for p in self.projects.values() if p.status == status]
    
    def get_projects_by_creator(self, creator_id: str) -> List[VotingProject]:
        """按创建者获取投票项目"""
        return [p for p in self.projects.values() if p.created_by == creator_id]
    
    def get_projects_by_trustee(self, trustee_id: str) -> List[VotingProject]:
        """按受托人获取投票项目"""
        return [p for p in self.projects.values() if trustee_id in p.trustees]
    
    def update_project_status(self, project_id: str, status: str) -> VotingProject:
        """更新项目状态"""
        if project_id not in self.projects:
            raise ValueError(f"项目不存在: {project_id}")
        
        project = self.projects[project_id]
        project.status = status
        
        if status == ProjectStatus.ACTIVE.value:
            project.start_time = datetime.now().isoformat()
        elif status == ProjectStatus.FINISHED.value:
            project.end_time = datetime.now().isoformat()
        
        self._save_data()
        return project
    
    def assign_trustees(self, project_id: str, trustee_ids: List[str]) -> VotingProject:
        """指定受托人"""
        if project_id not in self.projects:
            raise ValueError(f"项目不存在: {project_id}")
        
        project = self.projects[project_id]
        project.trustees = trustee_ids
        self._save_data()
        
        return project
    
    def assign_voters(self, project_id: str, voter_ids: List[str]) -> VotingProject:
        """指定选民"""
        if project_id not in self.projects:
            raise ValueError(f"项目不存在: {project_id}")
        
        project = self.projects[project_id]
        project.voters = voter_ids
        self._save_data()
        
        return project
    
    def get_projects_by_voter(self, voter_id: str) -> List[VotingProject]:
        """按选民获取投票项目"""
        return [p for p in self.projects.values() if voter_id in p.voters]
    
    def delete_project(self, project_id: str):
        """删除投票项目"""
        if project_id in self.projects:
            del self.projects[project_id]
            self._save_data()
        else:
            raise ValueError(f"项目不存在: {project_id}")


def test_project_manager():
    """测试投票项目管理模块"""
    print("=" * 60)
    print("投票项目管理模块测试")
    print("=" * 60)
    
    manager = ProjectManager()
    
    print("\n[1] 创建投票项目")
    project = manager.create_project(
        name="2026年班长选举",
        description="选举2026年度班长",
        candidates=["张三", "李四", "王五"],
        created_by="admin"
    )
    print(f"  ✓ 项目创建成功: {project.project_id}")
    print(f"  ✓ 项目名称: {project.name}")
    print(f"  ✓ 候选人: {project.candidates}")
    print(f"  ✓ 状态: {project.status}")
    
    print("\n[2] 获取所有项目")
    projects = manager.get_all_projects()
    print(f"  项目总数: {len(projects)}")
    for p in projects:
        print(f"    - {p.project_id}: {p.name} ({p.status})")
    
    print("\n[3] 更新项目状态")
    updated = manager.update_project_status(project.project_id, ProjectStatus.ACTIVE.value)
    print(f"  ✓ 状态已更新: {updated.status}")
    print(f"  ✓ 开始时间: {updated.start_time}")
    
    print("\n[4] 指定受托人")
    updated = manager.assign_trustees(project.project_id, ["trustee1", "trustee2"])
    print(f"  ✓ 受托人: {updated.trustees}")
    
    print("\n[5] 按状态获取项目")
    active_projects = manager.get_projects_by_status(ProjectStatus.ACTIVE.value)
    print(f"  进行中的项目数: {len(active_projects)}")
    
    print("\n" + "=" * 60)
    print("投票项目管理模块测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_project_manager()
