"""
认证模块
实现登录验证、会话管理和权限控制功能
"""

from typing import Optional, Callable
from functools import wraps
import streamlit as st
from .users import UserManager, User, UserRole


class AuthManager:
    """认证管理类"""
    
    def __init__(self, user_manager: UserManager):
        self.user_manager = user_manager
    
    def login(self, username: str, password: str) -> Optional[User]:
        """
        用户登录
        
        Args:
            username: 用户名
            password: 密码
        
        Returns:
            登录成功返回用户对象，失败返回 None
        """
        user = self.user_manager.authenticate_user(username, password)
        
        if user:
            st.session_state['user'] = user.to_dict()
            st.session_state['logged_in'] = True
            return user
        
        return None
    
    def logout(self):
        """用户登出"""
        if 'user' in st.session_state:
            del st.session_state['user']
        if 'logged_in' in st.session_state:
            del st.session_state['logged_in']
    
    def get_current_user(self) -> Optional[User]:
        """获取当前登录用户"""
        if 'user' not in st.session_state:
            return None
        
        user_data = st.session_state['user']
        return User.from_dict(user_data)
    
    def is_logged_in(self) -> bool:
        """检查是否已登录"""
        return st.session_state.get('logged_in', False)
    
    def has_role(self, *roles: str) -> bool:
        """
        检查当前用户是否具有指定角色
        
        Args:
            roles: 角色列表
        
        Returns:
            是否具有指定角色
        """
        user = self.get_current_user()
        if not user:
            return False
        
        return user.role in roles
    
    def is_admin(self) -> bool:
        """检查是否是管理员"""
        return self.has_role(UserRole.ADMIN.value)
    
    def is_trustee(self) -> bool:
        """检查是否是受托人"""
        return self.has_role(UserRole.TRUSTEE.value)
    
    def is_voter(self) -> bool:
        """检查是否是选民"""
        return self.has_role(UserRole.VOTER.value)


def require_login(func: Callable) -> Callable:
    """
    登录验证装饰器
    
    Args:
        func: 被装饰的函数
    
    Returns:
        装饰后的函数
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'logged_in' not in st.session_state or not st.session_state['logged_in']:
            st.warning("请先登录")
            st.stop()
        return func(*args, **kwargs)
    return wrapper


def require_role(*roles: str) -> Callable:
    """
    角色验证装饰器
    
    Args:
        roles: 允许的角色列表
    
    Returns:
        装饰器函数
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            if 'logged_in' not in st.session_state or not st.session_state['logged_in']:
                st.warning("请先登录")
                st.stop()
            
            user_data = st.session_state.get('user')
            if not user_data or user_data.get('role') not in roles:
                st.error("权限不足")
                st.stop()
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def require_admin(func: Callable) -> Callable:
    """管理员权限装饰器"""
    return require_role(UserRole.ADMIN.value)(func)


def require_trustee(func: Callable) -> Callable:
    """受托人权限装饰器"""
    return require_role(UserRole.TRUSTEE.value)(func)


def require_voter(func: Callable) -> Callable:
    """选民权限装饰器"""
    return require_role(UserRole.VOTER.value)(func)


def test_auth_manager():
    """测试认证模块"""
    print("=" * 60)
    print("认证模块测试")
    print("=" * 60)
    
    user_manager = UserManager()
    auth_manager = AuthManager(user_manager)
    
    print("\n[1] 测试管理员登录")
    user = auth_manager.login("admin", "admin123")
    if user:
        print(f"  ✓ 管理员登录成功: {user.username}")
        print(f"  ✓ 角色: {user.role}")
    else:
        print("  ✗ 管理员登录失败")
    
    print("\n[2] 测试权限检查")
    if auth_manager.is_admin():
        print("  ✓ 管理员权限验证通过")
    else:
        print("  ✗ 管理员权限验证失败")
    
    print("\n[3] 测试错误密码")
    user = auth_manager.login("admin", "wrong_password")
    if not user:
        print("  ✓ 正确识别错误密码")
    else:
        print("  ✗ 未能识别错误密码")
    
    print("\n[4] 测试登出")
    auth_manager.logout()
    if not auth_manager.is_logged_in():
        print("  ✓ 登出成功")
    else:
        print("  ✗ 登出失败")
    
    print("\n" + "=" * 60)
    print("认证模块测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_auth_manager()
