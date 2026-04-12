"""
创建演示投票项目并自动投票
萝卜得2票，纸巾得3票
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from account_system.users import UserManager, UserRole
from account_system.voting_project import ProjectManager, ProjectStatus
from account_system.ballot import BallotManager
from account_system.signature import DigitalSignature


def create_demo_project():
    """创建演示项目并自动投票"""
    print("=" * 60)
    print("创建演示投票项目")
    print("=" * 60)
    
    user_manager = UserManager()
    project_manager = ProjectManager()
    ballot_manager = BallotManager()
    
    print("\n[1] 创建投票项目...")
    project = project_manager.create_project(
        name="中期展示",
        description="后量子密码投票系统中期展示演示项目",
        candidates=["萝卜", "纸巾"],
        created_by="admin",
        voters=["liubi01", "liubi02", "liubi03", "liubi04", "liubi05"]
    )
    
    project_manager.assign_trustees(project.project_id, ["liubi11", "liubi12"])
    print(f"  项目创建成功: {project.project_id}")
    print(f"  项目名称: {project.name}")
    print(f"  候选人: {', '.join(project.candidates)}")
    
    print("\n[2] 启动投票项目...")
    project_manager.update_project_status(project.project_id, ProjectStatus.ACTIVE.value)
    print("  项目已启动")
    
    print("\n[3] 自动投票...")
    
    voters = [
        ("liubi01", 0),
        ("liubi02", 0),
        ("liubi03", 1),
        ("liubi04", 1),
        ("liubi05", 1),
    ]
    
    for voter_id, choice in voters:
        user = user_manager.get_user(voter_id)
        if not user:
            print(f"  警告: 用户 {voter_id} 不存在")
            continue
        
        candidate = project.candidates[choice]
        
        try:
            ballot = ballot_manager.create_ballot(
                project_id=project.project_id,
                voter_id=voter_id,
                choice=choice,
                num_candidates=len(project.candidates),
                private_key_pem=user.private_key,
                public_key_pem=user.public_key,
                crypto_context_path=project.crypto_context_path
            )
            
            ballot_manager.submit_ballot(ballot, user.public_key)
            print(f"  {voter_id} 投票给 {candidate} - 成功")
        except Exception as e:
            print(f"  {voter_id} 投票失败: {str(e)}")
    
    print("\n[4] 结束投票...")
    project_manager.update_project_status(project.project_id, ProjectStatus.FINISHED.value)
    print("  投票已结束")
    
    print("\n[5] 计票...")
    results = ballot_manager.tally_ballots(
        project.project_id,
        project.crypto_context_path,
        len(project.candidates)
    )
    
    print("\n" + "=" * 60)
    print("投票结果")
    print("=" * 60)
    
    total = sum(results)
    for i, candidate in enumerate(project.candidates):
        percentage = (results[i] / total * 100) if total > 0 else 0
        print(f"  {candidate}: {results[i]} 票 ({percentage:.1f}%)")
    
    print(f"\n  总票数: {total}")
    
    winner_idx = results.index(max(results))
    print(f"  获胜者: {project.candidates[winner_idx]}")
    
    print("\n" + "=" * 60)
    print("演示项目创建完成!")
    print("=" * 60)
    print(f"\n项目ID: {project.project_id}")
    print("现在可以在管理员界面查看投票演示")


if __name__ == "__main__":
    create_demo_project()
