"""
初始化预设账户
创建选民账户（liubi01-05）和受托人账户（liubi11-12）
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from account_system.users import UserManager, UserRole
from account_system.signature import DigitalSignature


def init_preset_accounts():
    """初始化预设账户"""
    user_manager = UserManager()
    ds = DigitalSignature()
    
    voter_accounts = ["liubi01", "liubi02", "liubi03", "liubi04", "liubi05"]
    trustee_accounts = ["liubi11", "liubi12"]
    
    password = "123456"
    
    print("=" * 60)
    print("初始化预设账户")
    print("=" * 60)
    
    created_voters = []
    created_trustees = []
    
    for username in voter_accounts:
        existing = user_manager.get_user_by_username(username)
        if existing:
            print(f"  选民账户 {username} 已存在")
            created_voters.append(existing)
            continue
        
        private_key, public_key = ds.generate_key_pair()
        
        user = user_manager.register_user(
            username=username,
            password=password,
            role=UserRole.VOTER.value,
            public_key=public_key,
            private_key=private_key
        )
        
        user_manager.approve_user(user.user_id, "system")
        
        created_voters.append(user)
        print(f"  ✓ 创建选民账户: {username}")
        print(f"    公钥已保存，私钥长度: {len(private_key)} 字符")
    
    for username in trustee_accounts:
        existing = user_manager.get_user_by_username(username)
        if existing:
            print(f"  受托人账户 {username} 已存在")
            created_trustees.append(existing)
            continue
        
        user = user_manager.register_user(
            username=username,
            password=password,
            role=UserRole.TRUSTEE.value
        )
        
        user_manager.approve_user(user.user_id, "system")
        
        created_trustees.append(user)
        print(f"  ✓ 创建受托人账户: {username}")
    
    print("\n" + "=" * 60)
    print("预设账户初始化完成")
    print("=" * 60)
    print(f"\n选民账户: {', '.join([u.username for u in created_voters])}")
    print(f"受托人账户: {', '.join([u.username for u in created_trustees])}")
    print(f"统一密码: {password}")
    
    return created_voters, created_trustees


def print_voter_private_keys():
    """打印选民私钥（用于演示）"""
    user_manager = UserManager()
    
    print("\n" + "=" * 60)
    print("选民私钥信息（用于投票演示）")
    print("=" * 60)
    
    voter_accounts = ["liubi01", "liubi02", "liubi03", "liubi04", "liubi05"]
    
    for username in voter_accounts:
        user = user_manager.get_user_by_username(username)
        if user and user.private_key:
            print(f"\n{username} 的私钥:")
            print("-" * 40)
            print(user.private_key[:100] + "...")
            print("-" * 40)


if __name__ == "__main__":
    init_preset_accounts()
    print_voter_private_keys()
