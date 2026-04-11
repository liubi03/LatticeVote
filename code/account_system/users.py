"""
用户管理模块
实现用户注册、登录验证和用户数据管理功能
"""

import json
import hashlib
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum


class UserRole(Enum):
    """用户角色枚举"""
    ADMIN = "admin"
    TRUSTEE = "trustee"
    VOTER = "voter"


class UserStatus(Enum):
    """用户状态枚举"""
    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


@dataclass
class User:
    """用户信息类"""
    user_id: str
    username: str
    password_hash: str
    role: str
    status: str
    created_at: str
    public_key: Optional[str] = None
    private_key: Optional[str] = None
    approved_at: Optional[str] = None
    approved_by: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """从字典创建用户对象"""
        return cls(**data)


class UserManager:
    """用户管理类"""
    
    def __init__(self, data_file: str = None):
        if data_file is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_file = os.path.join(current_dir, "data", "users.json")
        self.data_file = data_file
        self.users: Dict[str, User] = {}
        self.pending_users: Dict[str, User] = {}
        self._load_data()
    
    def _hash_password(self, password: str) -> str:
        """哈希密码"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _load_data(self):
        """从文件加载用户数据"""
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            for user_data in data.get('users', []):
                user = User.from_dict(user_data)
                self.users[user.user_id] = user
            
            for user_data in data.get('pending_users', []):
                user = User.from_dict(user_data)
                self.pending_users[user.user_id] = user
                
        except FileNotFoundError:
            self._save_data()
    
    def _save_data(self):
        """保存用户数据到文件"""
        data = {
            'users': [user.to_dict() for user in self.users.values()],
            'pending_users': [user.to_dict() for user in self.pending_users.values()]
        }
        
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def register_user(self, username: str, password: str, role: str, 
                     public_key: Optional[str] = None, 
                     private_key: Optional[str] = None) -> User:
        """注册新用户（待审核状态）"""
        if role not in [UserRole.ADMIN.value, UserRole.TRUSTEE.value, UserRole.VOTER.value]:
            raise ValueError(f"无效的角色: {role}")
        
        if username in self.users or username in self.pending_users:
            raise ValueError(f"用户名已存在: {username}")
        
        user_id = username
        password_hash = self._hash_password(password)
        created_at = datetime.now().isoformat()
        
        user = User(
            user_id=user_id,
            username=username,
            password_hash=password_hash,
            role=role,
            status=UserStatus.PENDING.value,
            created_at=created_at,
            public_key=public_key,
            private_key=private_key
        )
        
        self.pending_users[user_id] = user
        self._save_data()
        
        return user
    
    def approve_user(self, user_id: str, admin_id: str) -> User:
        """批准用户注册"""
        if user_id not in self.pending_users:
            raise ValueError(f"待审核用户不存在: {user_id}")
        
        user = self.pending_users.pop(user_id)
        user.status = UserStatus.ACTIVE.value
        user.approved_at = datetime.now().isoformat()
        user.approved_by = admin_id
        
        self.users[user_id] = user
        self._save_data()
        
        return user
    
    def reject_user(self, user_id: str, admin_id: str) -> User:
        """拒绝用户注册"""
        if user_id not in self.pending_users:
            raise ValueError(f"待审核用户不存在: {user_id}")
        
        user = self.pending_users.pop(user_id)
        user.status = UserStatus.REJECTED.value
        user.approved_at = datetime.now().isoformat()
        user.approved_by = admin_id
        
        self._save_data()
        
        return user
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """验证用户登录"""
        if username not in self.users:
            return None
        
        user = self.users[username]
        password_hash = self._hash_password(password)
        
        if user.password_hash != password_hash:
            return None
        
        if user.status != UserStatus.ACTIVE.value:
            return None
        
        return user
    
    def get_user(self, user_id: str) -> Optional[User]:
        """获取用户信息"""
        return self.users.get(user_id)
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """通过用户名获取用户"""
        for user in self.users.values():
            if user.username == username:
                return user
        return None
    
    def get_all_users(self) -> List[User]:
        """获取所有用户"""
        return list(self.users.values())
    
    def get_pending_users(self) -> List[User]:
        """获取待审核用户"""
        return list(self.pending_users.values())
    
    def get_users_by_role(self, role: str) -> List[User]:
        """按角色获取用户"""
        return [user for user in self.users.values() if user.role == role]
    
    def update_user(self, user_id: str, **kwargs) -> User:
        """更新用户信息"""
        if user_id not in self.users:
            raise ValueError(f"用户不存在: {user_id}")
        
        user = self.users[user_id]
        
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        self._save_data()
        return user
    
    def delete_user(self, user_id: str):
        """删除用户"""
        if user_id in self.users:
            del self.users[user_id]
            self._save_data()
        elif user_id in self.pending_users:
            del self.pending_users[user_id]
            self._save_data()
        else:
            raise ValueError(f"用户不存在: {user_id}")


def test_user_manager():
    """测试用户管理模块"""
    print("=" * 60)
    print("用户管理模块测试")
    print("=" * 60)
    
    manager = UserManager()
    
    print("\n[1] 测试管理员登录")
    admin = manager.authenticate_user("admin", "admin123")
    if admin:
        print(f"  ✓ 管理员登录成功: {admin.username}")
    else:
        print("  ✗ 管理员登录失败")
    
    print("\n[2] 测试注册受托人")
    try:
        trustee = manager.register_user("trustee1", "password123", UserRole.TRUSTEE.value)
        print(f"  ✓ 受托人注册成功: {trustee.username} (状态: {trustee.status})")
    except Exception as e:
        print(f"  ✗ 注册失败: {e}")
    
    print("\n[3] 测试注册选民")
    try:
        voter = manager.register_user("voter1", "password456", UserRole.VOTER.value, 
                                     public_key="mock_public_key", 
                                     private_key="mock_private_key")
        print(f"  ✓ 选民注册成功: {voter.username} (状态: {voter.status})")
    except Exception as e:
        print(f"  ✗ 注册失败: {e}")
    
    print("\n[4] 测试待审核用户列表")
    pending = manager.get_pending_users()
    print(f"  待审核用户数: {len(pending)}")
    for user in pending:
        print(f"    - {user.username} ({user.role})")
    
    print("\n[5] 测试批准用户")
    if pending:
        approved = manager.approve_user(pending[0].user_id, "admin")
        print(f"  ✓ 用户已批准: {approved.username} (状态: {approved.status})")
    
    print("\n[6] 测试用户登录")
    if pending and len(pending) > 1:
        user = manager.authenticate_user(pending[1].username, "password456")
        if user:
            print(f"  ✗ 用户未批准，不应能登录")
        else:
            print(f"  ✓ 未批准用户无法登录")
    
    print("\n[7] 测试获取所有用户")
    all_users = manager.get_all_users()
    print(f"  总用户数: {len(all_users)}")
    for user in all_users:
        print(f"    - {user.username} ({user.role}, {user.status})")
    
    print("\n" + "=" * 60)
    print("用户管理模块测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_user_manager()
