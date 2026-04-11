"""
LatticeVote Web 界面
基于 Streamlit 实现的交互式电子投票演示系统
"""

import sys
import os
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import crypto, voter, tally, utils

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


def init_session_state():
    if 'system_initialized' not in st.session_state:
        st.session_state.system_initialized = False
    if 'crypto_context' not in st.session_state:
        st.session_state.crypto_context = None
    if 'voter_registry' not in st.session_state:
        st.session_state.voter_registry = None
    if 'bulletin_board' not in st.session_state:
        st.session_state.bulletin_board = None
    if 'num_candidates' not in st.session_state:
        st.session_state.num_candidates = 0
    if 'num_voters' not in st.session_state:
        st.session_state.num_voters = 0
    if 'registered_voters' not in st.session_state:
        st.session_state.registered_voters = []
    if 'tally_result' not in st.session_state:
        st.session_state.tally_result = None
    if 'current_voting_voter' not in st.session_state:
        st.session_state.current_voting_voter = None


def render_system_init():
    st.header("1. 系统初始化")
    
    with st.sidebar:
        st.subheader("系统参数设置")
        num_candidates = st.slider("候选人数量", min_value=2, max_value=10, value=3)
        num_voters = st.slider("选民数量", min_value=1, max_value=20, value=5)
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.info(f"""
        **当前配置：**
        - 候选人数量：{num_candidates} 人
        - 选民数量：{num_voters} 人
        """)
        
        if st.button("初始化系统", type="primary", use_container_width=True):
            with st.spinner("正在初始化加密上下文..."):
                try:
                    bfv_context = crypto.BFVContext(
                        poly_modulus_degree=8192,
                        plain_modulus=1032193
                    )
                    
                    st.session_state.crypto_context = bfv_context
                    st.session_state.voter_registry = voter.VoterRegistry()
                    st.session_state.bulletin_board = voter.BulletinBoard()
                    st.session_state.num_candidates = num_candidates
                    st.session_state.num_voters = num_voters
                    st.session_state.system_initialized = True
                    st.session_state.registered_voters = []
                    st.session_state.tally_result = None
                    
                    st.success("系统初始化成功！")
                    time.sleep(0.5)
                    st.rerun()
                    
                except Exception as e:
                    st.error(f"初始化失败：{str(e)}")
    
    with col2:
        if st.session_state.system_initialized:
            st.success("系统状态：已初始化")
            st.info(f"候选人：{st.session_state.num_candidates}")
            st.info(f"选民上限：{st.session_state.num_voters}")
        else:
            st.warning("系统状态：未初始化")


def render_voter_registration():
    st.header("2. 选民注册")
    
    if not st.session_state.system_initialized:
        st.warning("请先完成系统初始化")
        return
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        current_count = len(st.session_state.registered_voters)
        remaining = st.session_state.num_voters - current_count
        
        st.info(f"已注册选民：{current_count} / {st.session_state.num_voters}")
        
        if remaining > 0:
            if st.button("批量注册选民", type="primary", use_container_width=True):
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                for i in range(remaining):
                    voter_id = f"V{str(current_count + i + 1).zfill(3)}"
                    try:
                        st.session_state.voter_registry.register_voter(voter_id)
                        st.session_state.registered_voters.append(voter_id)
                    except Exception as e:
                        st.error(f"注册 {voter_id} 失败：{str(e)}")
                    
                    progress = (i + 1) / remaining
                    progress_bar.progress(progress)
                    status_text.text(f"正在注册: {voter_id}")
                    time.sleep(0.05)
                
                progress_bar.empty()
                status_text.empty()
                st.success(f"成功注册 {remaining} 位选民！")
                st.rerun()
        else:
            st.info("所有选民已注册完成")
    
    with col2:
        st.subheader("已注册选民列表")
        if st.session_state.registered_voters:
            voters_df = pd.DataFrame({
                '选民ID': st.session_state.registered_voters,
                '状态': ['待投票' if not st.session_state.bulletin_board.has_voted(v) 
                        else '已投票' for v in st.session_state.registered_voters]
            })
            st.dataframe(voters_df, use_container_width=True, hide_index=True)
        else:
            st.info("暂无注册选民")


def render_voting():
    st.header("3. 投票")
    
    if not st.session_state.system_initialized:
        st.warning("请先完成系统初始化")
        return
    
    if not st.session_state.registered_voters:
        st.warning("请先注册选民")
        return
    
    available_voters = [
        v for v in st.session_state.registered_voters 
        if not st.session_state.bulletin_board.has_voted(v)
    ]
    
    if not available_voters:
        st.info("所有选民已完成投票")
        return
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        selected_voter = st.selectbox(
            "选择选民ID",
            available_voters,
            index=0
        )
        
        candidate_names = utils.generate_candidate_names(st.session_state.num_candidates)
        
        st.subheader("选择候选人")
        choice = st.radio(
            "请投票给：",
            range(st.session_state.num_candidates),
            format_func=lambda x: candidate_names[x],
            horizontal=True
        )
        
        if st.button("提交投票", type="primary", use_container_width=True):
            try:
                with st.spinner("正在加密并提交选票..."):
                    vote = voter.create_vote(
                        voter_id=selected_voter,
                        choice=choice,
                        num_candidates=st.session_state.num_candidates,
                        crypto_context=st.session_state.crypto_context
                    )
                    
                    result = st.session_state.bulletin_board.submit_vote(
                        vote, 
                        st.session_state.voter_registry
                    )
                    
                    st.success(f"投票成功！选民 {selected_voter} 的选票已提交")
                    time.sleep(0.5)
                    st.rerun()
                    
            except Exception as e:
                st.error(f"投票失败：{str(e)}")
    
    with col2:
        st.subheader("投票进度")
        total_voters = len(st.session_state.registered_voters)
        voted_count = st.session_state.bulletin_board.vote_count()
        
        progress = voted_count / total_voters if total_voters > 0 else 0
        st.progress(progress)
        st.info(f"已投票：{voted_count} / {total_voters}")
        
        st.subheader("投票状态")
        status_data = []
        for v in st.session_state.registered_voters:
            status_data.append({
                '选民': v,
                '状态': '已投票' if st.session_state.bulletin_board.has_voted(v) else '待投票'
            })
        
        status_df = pd.DataFrame(status_data)
        st.dataframe(status_df, use_container_width=True, hide_index=True)


def render_tally_results():
    st.header("4. 计票与结果")
    
    if not st.session_state.system_initialized:
        st.warning("请先完成系统初始化")
        return
    
    if st.session_state.bulletin_board.vote_count() == 0:
        st.warning("暂无选票，请先进行投票")
        return
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        if st.button("开始计票", type="primary", use_container_width=True):
            with st.spinner("正在执行同态计票..."):
                tally_system = tally.TallySystem(st.session_state.crypto_context)
                
                progress_text = st.empty()
                
                progress_text.text("步骤 1/3: 获取加密选票...")
                time.sleep(0.3)
                
                progress_text.text("步骤 2/3: 执行同态累加...")
                result = tally_system.tally_votes(
                    st.session_state.bulletin_board,
                    st.session_state.num_candidates
                )
                time.sleep(0.3)
                
                progress_text.text("步骤 3/3: 解密计票结果...")
                time.sleep(0.3)
                
                progress_text.empty()
                
                if result['success']:
                    st.session_state.tally_result = result
                    st.success("计票完成！")
                    time.sleep(0.5)
                    st.rerun()
                else:
                    st.error(f"计票失败：{result.get('error', '未知错误')}")
    
    with col2:
        st.subheader("计票状态")
        st.info(f"选票总数：{st.session_state.bulletin_board.vote_count()}")
        st.info(f"候选人数：{st.session_state.num_candidates}")
    
    if st.session_state.tally_result:
        result = st.session_state.tally_result
        
        st.divider()
        st.subheader("计票结果")
        
        candidate_names = utils.generate_candidate_names(st.session_state.num_candidates)
        vote_counts = result['vote_count']
        
        col_chart, col_table = st.columns([1, 1])
        
        with col_chart:
            df = pd.DataFrame({
                '候选人': candidate_names,
                '得票数': vote_counts
            })
            
            fig = go.Figure(data=[
                go.Bar(
                    x=df['候选人'],
                    y=df['得票数'],
                    marker_color=['#FF6B6B' if i == result['winner_index'] else '#4ECDC4' 
                                 for i in range(len(vote_counts))],
                    text=df['得票数'],
                    textposition='auto'
                )
            ])
            
            fig.update_layout(
                title='投票结果柱状图',
                xaxis_title='候选人',
                yaxis_title='得票数',
                showlegend=False,
                height=400
            )
            
            st.plotly_chart(fig, use_container_width=True)
        
        with col_table:
            st.subheader("详细统计")
            
            total_votes = sum(vote_counts)
            table_data = []
            for i, (name, count) in enumerate(zip(candidate_names, vote_counts)):
                percentage = (count / total_votes * 100) if total_votes > 0 else 0
                is_winner = i == result['winner_index']
                table_data.append({
                    '候选人': name,
                    '得票数': count,
                    '得票率': f"{percentage:.2f}%",
                    '状态': '获胜者' if is_winner else '-'
                })
            
            df_table = pd.DataFrame(table_data)
            st.dataframe(df_table, use_container_width=True, hide_index=True)
        
        st.divider()
        
        winner_col, info_col = st.columns([1, 1])
        
        with winner_col:
            st.success(f"获胜者：{result['winner_name']}")
            st.balloons()
        
        with info_col:
            verification = result['verification']
            if verification['valid']:
                st.success(f"验证通过：总票数 {verification['total_votes']}")
            else:
                st.error(f"验证失败：{verification['reason']}")


def main():
    st.set_page_config(
        page_title="LatticeVote - 同态加密电子投票系统",
        page_icon="🗳️",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    init_session_state()
    
    st.title("🗳️ LatticeVote - 同态加密电子投票系统")
    st.markdown("""
    基于 BFV 同态加密方案的安全电子投票演示系统。
    支持加密投票、同态计票和隐私保护。
    """)
    
    st.divider()
    
    render_system_init()
    st.divider()
    
    render_voter_registration()
    st.divider()
    
    render_voting()
    st.divider()
    
    render_tally_results()
    
    st.divider()
    st.markdown("""
    ---
    **LatticeVote** - 基于格密码的同态加密电子投票系统 | 演示版本
    """)


if __name__ == "__main__":
    main()
