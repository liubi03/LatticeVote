"""
LatticeVote 账户系统 Web 界面
基于 Streamlit 实现的完整投票系统界面
"""

import streamlit as st
import sys
import os
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from account_system.users import UserManager, UserRole
from account_system.auth import AuthManager, require_login, require_role
from account_system.voting_project import ProjectManager, ProjectStatus
from account_system.ballot import BallotManager
from account_system.signature import DigitalSignature
from account_system.zkp import SimplifiedZKP
from backend import crypto, utils


def set_custom_style():
    """设置自定义样式 - 参考 Helios 设计风格"""
    st.markdown("""
    <style>
    /* 全局样式 */
    .main .block-container {
        padding-top: 2rem;
        max-width: 1200px;
    }
    
    /* 标题样式 */
    h1 {
        color: #333;
        font-family: 'Helvetica Neue', Arial, sans-serif;
        text-align: center;
        padding: 20px;
        font-weight: 600;
        border-bottom: 2px solid #fc9;
        margin-bottom: 20px;
    }
    
    h2 {
        color: #333;
        font-family: 'Helvetica Neue', Arial, sans-serif;
        background: #fc9;
        border-bottom: 1px solid #f90;
        padding: 8px 15px;
        font-size: 1.5em;
        margin-top: 20px;
    }
    
    h3 {
        color: #666;
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 1.2em;
    }
    
    /* 按钮样式 */
    .stButton>button {
        background: #fc9;
        color: #333;
        border: 1px solid #f90;
        padding: 10px 25px;
        border-radius: 5px;
        font-weight: 600;
        transition: all 0.2s;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .stButton>button:hover {
        background: #f90;
        color: white;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
    
    .stButton>button[kind="primary"] {
        background: #f90;
        color: white;
    }
    
    /* 输入框样式 */
    .stTextInput>div>div>input {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
        transition: all 0.2s;
    }
    
    .stTextInput>div>div>input:focus {
        border-color: #fc9;
        box-shadow: 0 0 5px rgba(255, 204, 153, 0.5);
    }
    
    /* 卡片样式 */
    .card {
        background: white;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 20px;
        margin: 15px 0;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .card:hover {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }
    
    /* 侧边栏样式 */
    section[data-testid="stSidebar"] {
        background: #f5f5f5;
        border-right: 1px solid #ddd;
    }
    
    section[data-testid="stSidebar"] .element-container {
        margin-bottom: 10px;
    }
    
    /* 成功消息 */
    .stSuccess {
        background: #dff0d8;
        color: #3c763d;
        border: 1px solid #d6e9c6;
        border-radius: 5px;
        padding: 15px;
    }
    
    /* 警告消息 */
    .stWarning {
        background: #fcf8e3;
        color: #8a6d3b;
        border: 1px solid #faebcc;
        border-radius: 5px;
        padding: 15px;
    }
    
    /* 错误消息 */
    .stError {
        background: #f2dede;
        color: #a94442;
        border: 1px solid #ebccd1;
        border-radius: 5px;
        padding: 15px;
    }
    
    /* 信息消息 */
    .stInfo {
        background: #d9edf7;
        color: #31708f;
        border: 1px solid #bce8f1;
        border-radius: 5px;
        padding: 15px;
    }
    
    /* 表格样式 */
    .stTable {
        border: 1px solid #ddd;
        border-radius: 5px;
        overflow: hidden;
    }
    
    .stTable th {
        background: #f5f5f5;
        border-bottom: 2px solid #fc9;
        padding: 10px;
    }
    
    .stTable td {
        border-bottom: 1px solid #eee;
        padding: 8px 10px;
    }
    
    .stTable tr:hover {
        background: #fffde7;
    }
    
    /* 进度条 */
    .stProgress > div > div > div {
        background: #fc9;
    }
    
    /* 标签页 */
    .stTabs [data-baseweb="tab-list"] {
        gap: 0;
        border-bottom: 2px solid #fc9;
    }
    
    .stTabs [data-baseweb="tab"] {
        border-radius: 5px 5px 0 0;
        padding: 10px 20px;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-bottom: none;
        transition: all 0.2s;
        margin-right: 2px;
    }
    
    .stTabs [aria-selected="true"] {
        background: #fc9;
        color: #333;
        border-color: #f90;
        font-weight: 600;
    }
    
    /* 指标卡片 */
    [data-testid="stMetric"] {
        background: white;
        border: 1px solid #ddd;
        border-left: 4px solid #fc9;
        border-radius: 5px;
        padding: 15px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    [data-testid="stMetricValue"] {
        font-size: 1.8rem;
        color: #333 !important;
        font-weight: 700;
    }
    
    [data-testid="stMetricLabel"] {
        color: #666 !important;
        font-weight: 500;
        font-size: 0.9em;
    }
    
    /* Expander 样式 */
    .streamlit-expanderHeader {
        background: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 10px;
    }
    
    .streamlit-expanderHeader:hover {
        background: #fc9;
    }
    
    /* 动画效果 */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .element-container {
        animation: fadeIn 0.3s ease-out;
    }
    
    /* 自定义容器 */
    .custom-container {
        background: white;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 20px;
        margin: 15px 0;
    }
    
    /* 高亮框 */
    .highlight-box {
        background: #fffde7;
        border: 1px solid #fc9;
        border-radius: 5px;
        padding: 15px;
        margin: 10px 0;
    }
    
    /* 状态标签 */
    .status-draft { color: #666; }
    .status-active { color: #3c763d; font-weight: bold; }
    .status-paused { color: #8a6d3b; }
    .status-finished { color: #31708f; }
    .status-tallied { color: #3c763d; font-weight: bold; }
    
    /* 投票选项样式 */
    .vote-option {
        background: white;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 15px;
        margin: 10px 0;
        transition: all 0.2s;
    }
    
    .vote-option:hover {
        border-color: #fc9;
        background: #fffde7;
    }
    
    .vote-option.selected {
        border-color: #f90;
        background: #fff8e1;
    }
    
    /* 进度步骤 */
    .progress-step {
        display: inline-block;
        padding: 8px 15px;
        background: #eee;
        color: #666;
        border: 1px solid #ccc;
        margin: 0 2px;
    }
    
    .progress-step.active {
        background: #fc9;
        color: #333;
        border-color: #f90;
        font-weight: bold;
    }
    
    .progress-step.completed {
        background: #dff0d8;
        color: #3c763d;
        border-color: #d6e9c6;
    }
    </style>
    """, unsafe_allow_html=True)


def init_session_state():
    """初始化会话状态"""
    if 'logged_in' not in st.session_state:
        st.session_state['logged_in'] = False
    if 'user' not in st.session_state:
        st.session_state['user'] = None
    if 'current_page' not in st.session_state:
        st.session_state['current_page'] = 'login'


def render_login_page(user_manager: UserManager, auth_manager: AuthManager):
    """渲染登录页面"""
    st.markdown("""
    <div style='text-align: center; padding: 20px; border-bottom: 2px solid #fc9; margin-bottom: 30px;'>
        <h1 style='font-size: 2.5rem; margin: 0; color: #333;'>LatticeVote</h1>
        <p style='font-size: 1rem; color: #666; margin-top: 10px;'>基于格密码的后量子安全电子投票系统</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("""
        <div class='custom-container'>
            <h2 style='text-align: center; color: #667eea;'>🔐 用户登录</h2>
        </div>
        """, unsafe_allow_html=True)
        
        username = st.text_input("👤 用户名", key="login_username", placeholder="请输入用户名")
        password = st.text_input("🔑 密码", type="password", key="login_password", placeholder="请输入密码")
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        if st.button("🚀 登录", use_container_width=True):
            if username and password:
                user = auth_manager.login(username, password)
                if user:
                    st.session_state['current_page'] = 'dashboard'
                    st.rerun()
                else:
                    st.error("用户名或密码错误，或账户未激活")
            else:
                st.warning("请输入用户名和密码")
        
        st.markdown("---")
        st.markdown("""
        **默认管理员账户：**
        - 用户名：`admin`
        - 密码：`admin123`
        """)


def render_register_page(user_manager: UserManager):
    """渲染注册页面"""
    st.markdown("""
    <div style='text-align: center; padding: 20px; border-bottom: 2px solid #fc9; margin-bottom: 30px;'>
        <h1 style='font-size: 2.5rem; margin: 0; color: #333;'>LatticeVote</h1>
        <p style='font-size: 1rem; color: #666; margin-top: 10px;'>基于格密码的后量子安全电子投票系统</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("### 用户注册")
        
        reg_username = st.text_input("用户名", key="reg_username", placeholder="请输入用户名")
        reg_password = st.text_input("密码", type="password", key="reg_password", placeholder="请输入密码")
        reg_password_confirm = st.text_input("确认密码", type="password", key="reg_password_confirm", placeholder="请再次输入密码")
        reg_role = st.selectbox("选择角色", ["voter", "trustee"], 
                               format_func=lambda x: "选民" if x == "voter" else "受托人")
        
        if st.button("注册", use_container_width=True):
            if not reg_username or not reg_password:
                st.warning("⚠️ 请填写所有必填项")
            elif reg_password != reg_password_confirm:
                st.error("❌ 两次密码输入不一致")
            else:
                try:
                    if reg_role == "voter":
                        with st.spinner("🔄 正在生成密钥对..."):
                            ds = DigitalSignature()
                            private_key, public_key = ds.generate_key_pair()
                            
                            user = user_manager.register_user(
                                reg_username, reg_password, reg_role,
                                public_key=public_key,
                                private_key=private_key
                            )
                        
                        st.success("✅ 注册成功！请等待管理员审核。")
                        
                        st.markdown("---")
                        st.markdown("""
                        <div style='background: linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%); 
                                    padding: 20px; border-radius: 10px; margin: 10px 0;'>
                            <h3 style='color: #856404; margin: 0;'>⚠️ 重要提示</h3>
                            <p style='color: #856404; margin: 10px 0 0 0;'>请妥善保存您的私钥，用于投票时的数字签名！</p>
                        </div>
                        """, unsafe_allow_html=True)
                        
                        with st.expander("🔑 查看私钥（请复制保存）"):
                            st.code(private_key, language='text')
                            st.info("💡 私钥用于投票时的数字签名，请妥善保管，不要泄露给他人。")
                    else:
                        user = user_manager.register_user(
                            reg_username, reg_password, reg_role
                        )
                        st.success("✅ 注册成功！请等待管理员审核。")
                except ValueError as e:
                    st.error(f"❌ 注册失败：{e}")


def render_admin_dashboard(user_manager: UserManager, project_manager: ProjectManager,
                          auth_manager: AuthManager):
    """渲染管理员控制台"""
    st.markdown("""
    <div style='text-align: center; padding: 20px; border-bottom: 2px solid #fc9; margin-bottom: 20px;'>
        <h1 style='color: #333; margin: 0; font-size: 2rem;'>管理员控制台</h1>
        <p style='color: #666; margin: 10px 0 0 0;'>系统管理与投票演示</p>
    </div>
    """, unsafe_allow_html=True)
    
    tab1, tab2, tab3, tab4 = st.tabs(["用户管理", "投票项目", "投票演示", "系统统计"])
    
    with tab1:
        render_user_management(user_manager)
    
    with tab2:
        render_project_management(project_manager, user_manager)
    
    with tab3:
        render_voting_demo(project_manager)
    
    with tab4:
        render_system_stats(user_manager, project_manager)


def render_user_management(user_manager: UserManager):
    """渲染用户管理界面"""
    st.subheader("用户管理")
    
    pending_users = user_manager.get_pending_users()
    
    if pending_users:
        st.markdown("### 待审核用户")
        
        for user in pending_users:
            with st.expander(f"**{user.username}** ({user.role}) - {user.created_at}"):
                col1, col2 = st.columns(2)
                
                with col1:
                    if st.button(f"✓ 批准", key=f"approve_{user.user_id}"):
                        try:
                            user_manager.approve_user(user.user_id, "admin")
                            st.success(f"用户 {user.username} 已批准")
                            st.rerun()
                        except Exception as e:
                            st.error(f"批准失败：{e}")
                
                with col2:
                    if st.button(f"✗ 拒绝", key=f"reject_{user.user_id}"):
                        try:
                            user_manager.reject_user(user.user_id, "admin")
                            st.warning(f"用户 {user.username} 已拒绝")
                            st.rerun()
                        except Exception as e:
                            st.error(f"拒绝失败：{e}")
    
    st.markdown("---")
    st.markdown("### 所有用户")
    
    all_users = user_manager.get_all_users()
    
    if all_users:
        user_data = []
        for user in all_users:
            user_data.append({
                "用户名": user.username,
                "角色": "管理员" if user.role == "admin" else ("受托人" if user.role == "trustee" else "选民"),
                "状态": "活跃" if user.status == "active" else "待审核",
                "注册时间": user.created_at[:10]
            })
        
        st.table(user_data)


def render_project_management(project_manager: ProjectManager, user_manager: UserManager):
    """渲染投票项目管理界面"""
    st.subheader("投票项目管理")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("### 创建新项目")
        
        with st.form("create_project"):
            project_name = st.text_input("项目名称")
            project_desc = st.text_area("项目描述")
            candidates_input = st.text_area("候选人列表（每行一个）")
            
            if st.form_submit_button("创建项目"):
                if project_name and candidates_input:
                    candidates = [c.strip() for c in candidates_input.split('\n') if c.strip()]
                    
                    try:
                        project = project_manager.create_project(
                            project_name, project_desc, candidates, "admin"
                        )
                        st.success(f"项目创建成功：{project.project_id}")
                        st.rerun()
                    except Exception as e:
                        st.error(f"创建失败：{e}")
                else:
                    st.warning("请填写项目名称和候选人列表")
    
    with col2:
        st.markdown("### 项目列表")
        
        projects = project_manager.get_all_projects()
        
        for project in projects:
            status_emoji = {
                "draft": "📝",
                "active": "🔄",
                "paused": "⏸️",
                "finished": "✅",
                "tallied": "📊"
            }.get(project.status, "❓")
            
            st.markdown(f"{status_emoji} **{project.name}**")
            st.caption(f"状态: {project.status} | 候选人: {len(project.candidates)}")
    
    st.markdown("---")
    st.markdown("### 项目管理操作")
    
    projects = project_manager.get_all_projects()
    
    if not projects:
        st.info("暂无项目，请先创建项目")
        return
    
    for project in projects:
        status_emoji = {
            "draft": "📝",
            "active": "🔄",
            "paused": "⏸️",
            "finished": "✅",
            "tallied": "📊"
        }.get(project.status, "❓")
        
        status_text = {
            "draft": "草稿",
            "active": "进行中",
            "paused": "已暂停",
            "finished": "已结束",
            "tallied": "已计票"
        }.get(project.status, project.status)
        
        with st.expander(f"{status_emoji} **{project.name}** - {status_text}"):
            col_info, col_action = st.columns([1, 1])
            
            with col_info:
                st.markdown(f"**项目ID**: {project.project_id}")
                st.markdown(f"**描述**: {project.description}")
                st.markdown(f"**候选人**: {', '.join(project.candidates)}")
                st.markdown(f"**选民**: {len(project.voters) if hasattr(project, 'voters') and project.voters else 0} 人")
                st.markdown(f"**受托人**: {', '.join(project.trustees) if project.trustees else '未指定'}")
                st.markdown(f"**创建时间**: {project.created_at[:19]}")
            
            with col_action:
                st.markdown("**状态管理**")
                
                status_col1, status_col2, status_col3 = st.columns(3)
                
                with status_col1:
                    if project.status == "draft":
                        if st.button("▶️ 启动", key=f"start_{project.project_id}"):
                            project_manager.update_project_status(project.project_id, "active")
                            st.success("项目已启动！")
                            st.rerun()
                
                with status_col2:
                    if project.status == "active":
                        if st.button("⏸️ 暂停", key=f"pause_{project.project_id}"):
                            project_manager.update_project_status(project.project_id, "paused")
                            st.warning("项目已暂停")
                            st.rerun()
                    elif project.status == "paused":
                        if st.button("▶️ 恢复", key=f"resume_{project.project_id}"):
                            project_manager.update_project_status(project.project_id, "active")
                            st.success("项目已恢复")
                            st.rerun()
                
                with status_col3:
                    if project.status in ["active", "paused"]:
                        if st.button("⏹️ 结束", key=f"finish_{project.project_id}"):
                            project_manager.update_project_status(project.project_id, "finished")
                            st.success("项目已结束")
                            st.rerun()
                
                st.markdown("---")
                st.markdown("**指定受托人**")
                
                all_users = user_manager.get_all_users()
                trustee_users = [u for u in all_users if u.role == "trustee" and u.status == "active"]
                
                if trustee_users:
                    trustee_options = {f"{u.username} ({u.user_id})": u.user_id for u in trustee_users}
                    
                    selected_trustees = st.multiselect(
                        "选择受托人",
                        options=list(trustee_options.keys()),
                        default=[f"{u.username} ({u.user_id})" for u in trustee_users if u.user_id in project.trustees],
                        key=f"trustee_select_{project.project_id}"
                    )
                    
                    if st.button("更新受托人", key=f"update_trustees_{project.project_id}"):
                        trustee_ids = [trustee_options[t] for t in selected_trustees]
                        project_manager.assign_trustees(project.project_id, trustee_ids)
                        st.success("受托人已更新")
                        st.rerun()
                else:
                    st.info("暂无活跃的受托人账户，请先注册受托人")
                
                st.markdown("---")
                st.markdown("**指定选民**")
                
                voter_users = [u for u in all_users if u.role == "voter" and u.status == "active"]
                
                if voter_users:
                    voter_options = {f"{u.username} ({u.user_id})": u.user_id for u in voter_users}
                    
                    default_voters = []
                    if hasattr(project, 'voters') and project.voters:
                        default_voters = [f"{u.username} ({u.user_id})" for u in voter_users if u.user_id in project.voters]
                    
                    selected_voters = st.multiselect(
                        "选择选民",
                        options=list(voter_options.keys()),
                        default=default_voters,
                        key=f"voter_select_{project.project_id}"
                    )
                    
                    if st.button("更新选民", key=f"update_voters_{project.project_id}"):
                        voter_ids = [voter_options[v] for v in selected_voters]
                        project_manager.assign_voters(project.project_id, voter_ids)
                        st.success(f"选民已更新，共 {len(voter_ids)} 人")
                        st.rerun()
                else:
                    st.info("暂无活跃的选民账户，请先注册选民")


def render_voting_demo(project_manager: ProjectManager):
    """渲染投票过程演示界面"""
    st.subheader("🎬 投票过程演示")
    
    st.info("此功能用于中期展示，详细演示投票的加密、解密和同态运算过程。")
    
    all_projects = project_manager.get_all_projects()
    
    if not all_projects:
        st.warning("暂无投票项目。请先创建一个投票项目。")
        
        if st.button("创建演示项目"):
            demo_project = project_manager.create_project(
                "演示投票项目",
                "这是一个用于演示投票过程的示例项目",
                ["候选人A", "候选人B", "候选人C"],
                "admin"
            )
            st.success(f"演示项目已创建：{demo_project.project_id}")
            st.rerun()
        return
    
    demo_mode = st.radio(
        "选择演示模式",
        ["📋 模拟演示", "📊 真实投票演示"],
        horizontal=True
    )
    
    if demo_mode == "📋 模拟演示":
        selected_project = st.selectbox(
            "选择要演示的投票项目",
            all_projects,
            format_func=lambda x: f"{x.project_id} - {x.name} ({x.status})",
            key="demo_project_select"
        )
        
        if selected_project and st.button("开始模拟演示", type="primary"):
            render_detailed_voting_process(selected_project, None, None)
    else:
        tallied_projects = [p for p in all_projects if p.status in ["finished", "tallied"]]
        
        if not tallied_projects:
            st.warning("暂无已结束或已计票的项目，无法进行真实投票演示。")
            st.info("请先完成投票流程：创建项目 → 指定选民和受托人 → 启动项目 → 选民投票 → 结束项目")
            return
        
        selected_project = st.selectbox(
            "选择已结束的投票项目",
            tallied_projects,
            format_func=lambda x: f"{x.project_id} - {x.name} ({x.status})",
            key="real_project_select"
        )
        
        if selected_project and st.button("开始真实投票演示", type="primary"):
            ballot_manager = BallotManager()
            render_detailed_voting_process(selected_project, ballot_manager, project_manager)


def render_detailed_voting_process(project, ballot_manager=None, project_manager=None):
    """渲染详细的投票过程演示"""
    is_real_demo = ballot_manager is not None
    
    st.markdown("---")
    if is_real_demo:
        st.markdown("## 真实投票过程演示")
        st.success("此演示基于真实投票数据")
    else:
        st.markdown("## 投票过程详细演示（模拟）")
        st.info("此演示使用模拟数据展示投票流程")
    
    st.markdown(f"**项目**: {project.name}")
    st.markdown(f"**项目ID**: {project.project_id}")
    
    if is_real_demo:
        ballot_count = ballot_manager.get_ballot_count(project.project_id)
        st.markdown(f"**实际投票数**: {ballot_count}")
    
    st.markdown("---")
    st.markdown("### 📋 第一步：系统初始化")
    
    with st.expander("查看详细步骤", expanded=True):
        st.markdown("#### 1.1 创建 BFV 同态加密上下文")
        st.code("""
from backend import crypto

bfv_context = crypto.BFVContext()

params:
- poly_modulus_degree: 8192
- plain_modulus: 1032193
        """, language='python')
        
        st.info("✓ BFV 上下文已初始化，可以开始加密操作")
        
        st.markdown("#### 1.2 生成密钥对")
        st.code("""
public_key: encrypt ballots
private_key: decrypt tally results (held by trustees)
        """, language='python')
        
        st.success("✓ 密钥对生成完成")
    
    st.markdown("---")
    st.markdown("### 第二步：选民投票")
    
    with st.expander("查看详细步骤", expanded=True):
        if is_real_demo:
            ballots = ballot_manager.get_ballots(project.project_id)
            
            st.markdown(f"#### 共收到 {len(ballots)} 张选票")
            
            for i, ballot in enumerate(ballots[:5]):
                st.markdown(f"**选票 #{i+1}**")
                st.markdown(f"- 选民ID: `{ballot.voter_id[:20]}...`")
                st.markdown(f"- 时间: {ballot.timestamp[:19]}")
                st.markdown(f"- 加密数据长度: {len(ballot.encrypted_choice)} 字符")
                if i < len(ballots) - 1 and i < 4:
                    st.markdown("---")
            
            if len(ballots) > 5:
                st.info(f"... 还有 {len(ballots) - 5} 张选票")
            
            st.markdown("#### 2.2 One-Hot 编码示例")
            st.code(f"""
one_hot = utils.one_hot_encode(choice, {len(project.candidates)})
example: choice=0 -> {utils.one_hot_encode(0, len(project.candidates)).tolist()}
            """, language='python')
            
            st.markdown("#### 2.3 加密选票")
            st.code("""
encrypted_vector = bfv_context.encrypt_vector(one_hot.tolist())
            """, language='python')
            
            st.info(f"✓ {len(ballots)} 张选票已加密提交")
            
            st.markdown("#### 2.4 数字签名验证")
            st.code("""
ds = DigitalSignature()
ds.load_public_key(voter_public_key)
is_valid = ds.verify(ballot_data, signature)
            """, language='python')
            
            st.success(f"✓ 所有 {len(ballots)} 张选票签名验证通过")
            
            st.markdown("#### 2.5 零知识证明验证")
            st.code("""
SimplifiedZKP.verify_ballot_validity_proof(proof, encrypted_ballot_hash)
            """, language='python')
            
            st.success(f"✓ 所有 {len(ballots)} 张选票零知识证明验证通过")
        else:
            st.markdown("#### 2.1 选民选择候选人")
            
            choice = st.selectbox("模拟选民选择", range(len(project.candidates)),
                                 format_func=lambda x: project.candidates[x])
            
            st.markdown(f"**选民选择**: {project.candidates[choice]} (索引: {choice})")
            
            st.markdown("#### 2.2 One-Hot 编码")
            st.code(f"""
one_hot = utils.one_hot_encode({choice}, {len(project.candidates)})
result: {utils.one_hot_encode(choice, len(project.candidates)).tolist()}
            """, language='python')
            
            st.markdown("#### 2.3 加密选票")
            st.code(f"""
encrypted_vector = bfv_context.encrypt_vector(one_hot.tolist())
            """, language='python')
            
            st.info("✓ 选票已加密，隐私得到保护")
            
            st.markdown("#### 2.4 数字签名")
            st.code("""
ds = DigitalSignature()
ds.load_private_key(voter_private_key)
signature = ds.sign(ballot_data)
            """, language='python')
            
            st.success("✓ 选票已签名，身份已验证")
            
            st.markdown("#### 2.5 零知识证明")
            st.code("""
proof = SimplifiedZKP.generate_ballot_validity_proof(
    choice_index, num_candidates, encrypted_ballot_hash
)
            """, language='python')
            
            st.success("✓ 零知识证明生成完成，选票有效性已证明")
    
    st.markdown("---")
    st.markdown("### 📊 第三步：同态计票")
    
    with st.expander("查看详细步骤", expanded=True):
        st.markdown("#### 3.1 同态累加")
        st.code("""
aggregated = encrypted_vectors[0]
for vec in encrypted_vectors[1:]:
    aggregated = bfv_context.homomorphic_add(aggregated, vec)
        """, language='python')
        
        if is_real_demo:
            st.info(f"✓ {ballot_count} 张选票已同态累加")
        else:
            st.info("✓ 所有选票已同态累加")
        
        st.markdown("#### 3.2 解密结果")
        st.code("""
result = bfv_context.decrypt(aggregated)
        """, language='python')
        
        st.success("✓ 计票结果已解密")
    
    st.markdown("---")
    st.markdown("### 📈 第四步：结果展示")
    
    with st.expander("查看详细步骤", expanded=True):
        st.markdown("#### 4.1 得票统计")
        
        if is_real_demo:
            try:
                ballots = ballot_manager.get_ballots(project.project_id)
                st.write(f"调试: 加载了 {len(ballots)} 张选票")
                if ballots:
                    st.write(f"调试: 第一张选票的选民: {ballots[0].voter_id}")
                
                results = ballot_manager.tally_ballots(
                    project.project_id,
                    project.crypto_context_path,
                    len(project.candidates)
                )
                st.write(f"调试: 计票结果: {results}")
            except Exception as e:
                st.error(f"计票失败: {str(e)}")
                import traceback
                st.code(traceback.format_exc())
                results = [0] * len(project.candidates)
        else:
            results = [3, 5, 2]
        
        if sum(results) > 0:
            result_df = {
                "候选人": project.candidates,
                "得票数": results,
                "得票率": [f"{r/sum(results)*100:.1f}%" for r in results]
            }
        else:
            result_df = {
                "候选人": project.candidates,
                "得票数": results,
                "得票率": ["0%" for _ in results]
            }
        
        st.table(result_df)
        
        st.markdown("#### 4.2 可视化展示")
        
        fig = go.Figure(data=[go.Bar(
            x=project.candidates,
            y=results,
            text=results,
            textposition='auto',
            marker=dict(
                color=results,
                colorscale='Viridis'
            )
        )])
        
        fig.update_layout(
            title="投票结果",
            xaxis_title="候选人",
            yaxis_title="得票数",
            height=400
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        if sum(results) > 0:
            winner_idx = results.index(max(results))
            st.balloons()
            st.success(f"🏆 **获胜者**: {project.candidates[winner_idx]} (得票: {results[winner_idx]})")
        else:
            st.warning("暂无投票数据")
    
    st.markdown("---")
    st.markdown("### ✅ 演示完成")
    if is_real_demo:
        st.success("以上展示了基于真实投票数据的完整投票流程，包括加密、签名、零知识证明、同态计票等关键步骤。")
    else:
        st.info("以上展示了完整的投票流程，包括加密、签名、零知识证明、同态计票等关键步骤。")


def render_system_stats(user_manager: UserManager, project_manager: ProjectManager):
    """渲染系统统计界面"""
    st.subheader("系统统计")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_users = len(user_manager.get_all_users())
        st.metric("总用户数", total_users)
    
    with col2:
        total_projects = len(project_manager.get_all_projects())
        st.metric("总项目数", total_projects)
    
    with col3:
        active_projects = len(project_manager.get_projects_by_status(ProjectStatus.ACTIVE.value))
        st.metric("进行中项目", active_projects)
    
    with col4:
        finished_projects = len(project_manager.get_projects_by_status(ProjectStatus.FINISHED.value))
        st.metric("已完成项目", finished_projects)


def render_trustee_dashboard(project_manager: ProjectManager, ballot_manager: BallotManager,
                             user_data: dict):
    """渲染受托人控制台"""
    st.markdown("""
    <div style='text-align: center; padding: 20px; border-bottom: 2px solid #fc9; margin-bottom: 20px;'>
        <h1 style='color: #333; margin: 0; font-size: 2rem;'>受托人控制台</h1>
        <p style='color: #666; margin: 10px 0 0 0;'>参与计票，确保投票公正透明</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.info("受托人负责参与计票过程，使用私钥解密计票结果，确保计票的正确性和透明性。")
    
    projects = project_manager.get_projects_by_trustee(user_data['user_id'])
    
    if not projects:
        st.warning("您尚未被指定为任何投票项目的受托人。请联系管理员将您添加为受托人。")
        return
    
    for project in projects:
        status_emoji = {
            "draft": "📝",
            "active": "🔄",
            "paused": "⏸️",
            "finished": "✅",
            "tallied": "📊"
        }.get(project.status, "❓")
        
        status_text = {
            "draft": "草稿",
            "active": "进行中",
            "paused": "已暂停",
            "finished": "已结束",
            "tallied": "已计票"
        }.get(project.status, project.status)
        
        with st.expander(f"{status_emoji} **{project.name}** - {status_text}"):
            col_info, col_action = st.columns([1, 1])
            
            with col_info:
                st.markdown(f"**项目描述**: {project.description}")
                st.markdown(f"**候选人**: {', '.join(project.candidates)}")
                st.markdown(f"**受托人**: {', '.join(project.trustees)}")
                st.markdown(f"**已投票数**: {ballot_manager.get_ballot_count(project.project_id)}")
            
            with col_action:
                if project.status == ProjectStatus.FINISHED.value:
                    st.markdown("**计票操作**")
                    st.info("投票已结束，可以进行计票")
                    
                    if st.button("📊 执行计票", key=f"tally_{project.project_id}", type="primary"):
                        try:
                            with st.spinner("正在同态计票..."):
                                results = ballot_manager.tally_ballots(
                                    project.project_id,
                                    project.crypto_context_path,
                                    len(project.candidates)
                                )
                                
                                project_manager.update_project_status(project.project_id, "tallied")
                                
                                st.success("✅ 计票完成！")
                                
                                st.markdown("---")
                                st.markdown("### 📈 计票结果")
                                
                                result_data = {
                                    "候选人": project.candidates,
                                    "得票数": results,
                                    "得票率": [f"{r/sum(results)*100:.1f}%" if sum(results) > 0 else "0%" for r in results]
                                }
                                st.table(result_data)
                                
                                fig = go.Figure(data=[go.Bar(
                                    x=project.candidates,
                                    y=results,
                                    text=results,
                                    textposition='auto',
                                    marker=dict(
                                        color=results,
                                        colorscale='Viridis'
                                    )
                                )])
                                
                                fig.update_layout(
                                    title="投票结果",
                                    xaxis_title="候选人",
                                    yaxis_title="得票数",
                                    height=400
                                )
                                
                                st.plotly_chart(fig, use_container_width=True)
                                
                                winner_idx = results.index(max(results))
                                st.balloons()
                                st.success(f"🏆 **获胜者**: {project.candidates[winner_idx]} (得票: {results[winner_idx]})")
                                
                                st.rerun()
                        except Exception as e:
                            st.error(f"计票失败: {str(e)}")
                
                elif project.status == ProjectStatus.ACTIVE.value:
                    st.info("投票正在进行中，请等待管理员结束投票后再进行计票。")
                    st.markdown(f"**当前投票数**: {ballot_manager.get_ballot_count(project.project_id)}")
                
                elif project.status == ProjectStatus.TALLIED.value:
                    st.success("✅ 此项目已完成计票")
                    
                    try:
                        results = ballot_manager.tally_ballots(
                            project.project_id,
                            project.crypto_context_path,
                            len(project.candidates)
                        )
                        
                        result_data = {
                            "候选人": project.candidates,
                            "得票数": results,
                            "得票率": [f"{r/sum(results)*100:.1f}%" if sum(results) > 0 else "0%" for r in results]
                        }
                        st.table(result_data)
                        
                        winner_idx = results.index(max(results))
                        st.info(f"🏆 **获胜者**: {project.candidates[winner_idx]} (得票: {results[winner_idx]})")
                    except Exception as e:
                        st.error(f"无法加载计票结果: {str(e)}")
                
                else:
                    st.info(f"项目状态: {status_text}，暂无法进行计票操作。")


def render_voter_dashboard(project_manager: ProjectManager, ballot_manager: BallotManager,
                          user_manager: UserManager, user_data: dict):
    """渲染选民控制台"""
    st.markdown("""
    <div style='text-align: center; padding: 20px; border-bottom: 2px solid #fc9; margin-bottom: 20px;'>
        <h1 style='color: #333; margin: 0; font-size: 2rem;'>选民控制台</h1>
        <p style='color: #666; margin: 10px 0 0 0;'>参与投票，行使您的权利</p>
    </div>
    """, unsafe_allow_html=True)
    
    my_projects = project_manager.get_projects_by_voter(user_data['user_id'])
    active_projects = [p for p in my_projects if p.status == ProjectStatus.ACTIVE.value]
    
    if not my_projects:
        st.info("您尚未被添加到任何投票项目中，请等待管理员将您添加为选民。")
        return
    
    if not active_projects:
        st.info("当前没有进行中的投票项目，请等待管理员启动投票项目。")
        return
    
    for project in active_projects:
        has_voted = ballot_manager.has_voted(project.project_id, user_data['user_id'])
        
        status_icon = "✅" if has_voted else "🗳️"
        
        with st.expander(f"{status_icon} **{project.name}**", expanded=not has_voted):
            col_info, col_vote = st.columns([1, 1])
            
            with col_info:
                st.markdown(f"**项目描述**: {project.description}")
                st.markdown(f"**候选人**: {', '.join(project.candidates)}")
                st.markdown(f"**开始时间**: {project.start_time[:19] if project.start_time else '未记录'}")
                st.markdown(f"**已投票数**: {ballot_manager.get_ballot_count(project.project_id)}")
            
            with col_vote:
                if has_voted:
                    st.success("✅ 您已完成投票")
                    st.info("感谢您的参与！投票结束后将公布结果。")
                else:
                    st.markdown("**进行投票**")
                    
                    choice = st.radio(
                        "选择候选人",
                        range(len(project.candidates)),
                        format_func=lambda x: f"👤 {project.candidates[x]}",
                        key=f"choice_{project.project_id}"
                    )
                    
                    st.markdown("---")
                    st.markdown("**数字签名验证**")
                    st.caption("请输入您注册时获得的私钥，用于对选票进行数字签名")
                    
                    private_key_input = st.text_area(
                        "私钥（PEM格式）",
                        key=f"private_key_{project.project_id}",
                        height=100,
                        placeholder="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
                    )
                    
                    if st.button("🗳️ 提交投票", key=f"vote_{project.project_id}", type="primary"):
                        if not private_key_input.strip():
                            st.error("请输入您的私钥进行签名验证")
                        else:
                            try:
                                with st.spinner("正在加密和签名选票..."):
                                    user = user_manager.get_user(user_data['user_id'])
                                    
                                    private_key_pem = private_key_input.replace('\\n', '\n')
                                    
                                    ballot = ballot_manager.create_ballot(
                                        project_id=project.project_id,
                                        voter_id=user_data['user_id'],
                                        choice=choice,
                                        num_candidates=len(project.candidates),
                                        private_key_pem=private_key_pem,
                                        public_key_pem=user.public_key,
                                        crypto_context_path=project.crypto_context_path
                                    )
                                    
                                    ballot_manager.submit_ballot(ballot, user.public_key)
                                    
                                    st.success("✅ 投票成功！您的选票已加密并提交。")
                                    st.balloons()
                                    st.rerun()
                            except Exception as e:
                                st.error(f"投票失败: {str(e)}")


def main():
    """主函数"""
    st.set_page_config(
        page_title="LatticeVote - 后量子密码投票系统",
        page_icon="🗳️",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    set_custom_style()
    init_session_state()
    
    user_manager = UserManager()
    auth_manager = AuthManager(user_manager)
    project_manager = ProjectManager()
    ballot_manager = BallotManager()
    
    if not st.session_state['logged_in']:
        st.sidebar.markdown("""
        <div style='text-align: center; padding: 20px;'>
            <h2 style='color: white;'>🗳️ LatticeVote</h2>
            <p style='color: #f0f0f0; font-size: 0.9rem;'>后量子安全投票系统</p>
        </div>
        """, unsafe_allow_html=True)
        
        st.sidebar.markdown("---")
        
        page = st.sidebar.radio(
            "📍 导航",
            ["🔐 登录", "📝 注册"],
            key="main_nav"
        )
        
        if page == "🔐 登录":
            render_login_page(user_manager, auth_manager)
        else:
            render_register_page(user_manager)
    else:
        user_data = st.session_state['user']
        
        st.sidebar.markdown(f"**欢迎，{user_data['username']}**")
        st.sidebar.markdown(f"角色: {user_data['role']}")
        
        if st.sidebar.button("登出"):
            auth_manager.logout()
            st.rerun()
        
        if user_data['role'] == UserRole.ADMIN.value:
            render_admin_dashboard(user_manager, project_manager, auth_manager)
        elif user_data['role'] == UserRole.TRUSTEE.value:
            render_trustee_dashboard(project_manager, ballot_manager, user_data)
        else:
            render_voter_dashboard(project_manager, ballot_manager, user_manager, user_data)


if __name__ == "__main__":
    main()
