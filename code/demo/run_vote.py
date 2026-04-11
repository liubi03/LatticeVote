"""
LatticeVote 投票系统演示脚本
演示完整的电子投票流程：初始化 -> 注册 -> 投票 -> 计票 -> 结果展示
"""

import sys
import os
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import crypto, voter, tally, utils


def print_header(title: str):
    """打印带分隔线的标题"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_subheader(title: str):
    """打印子标题"""
    print("\n" + "-" * 40)
    print(f"  {title}")
    print("-" * 40)


def main():
    """主演示函数"""
    
    print_header("LatticeVote 电子投票系统演示")
    print("\n本演示展示基于格密码的同态加密电子投票系统")
    print("支持隐私保护的投票和同态计票功能")
    
    print_header("阶段 1: 系统初始化")
    
    print_subheader("初始化 BFV 加密上下文")
    print("正在创建 BFV 同态加密上下文...")
    bfv = crypto.BFVContext(poly_modulus_degree=8192, plain_modulus=1032193)
    print("加密上下文初始化完成")
    
    print_subheader("创建选民注册表")
    registry = voter.VoterRegistry()
    print("选民注册表创建成功")
    
    print_subheader("创建公告板")
    bulletin_board = voter.BulletinBoard()
    print("公告板创建成功")
    
    print_subheader("设置候选人信息")
    num_candidates = 4
    candidate_names = utils.generate_candidate_names(num_candidates)
    print(f"候选人数量: {num_candidates}")
    print("候选人列表:")
    for i, name in enumerate(candidate_names):
        print(f"  [{i}] {name}")
    
    print_header("阶段 2: 选民注册")
    
    num_voters = 7
    voter_ids = [f"V{i:03d}" for i in range(1, num_voters + 1)]
    
    print(f"\n开始注册 {num_voters} 位选民...")
    print()
    
    for voter_id in voter_ids:
        try:
            voter_info = registry.register_voter(voter_id)
            print(f"  [OK] 选民 {voter_id} 注册成功")
            print(f"       注册时间: {voter_info['registration_time']}")
        except ValueError as e:
            print(f"  [FAIL] 注册失败: {e}")
    
    print(f"\n注册完成，共 {registry.voter_count()} 位选民")
    
    print_header("阶段 3: 投票阶段")
    
    print("\n每位选民将随机选择一位候选人进行投票")
    print("选票将使用 BFV 同态加密进行加密保护")
    print()
    
    random.seed(42)
    choices = [random.randint(0, num_candidates - 1) for _ in range(num_voters)]
    
    print("投票过程:")
    print()
    
    for i, (voter_id, choice) in enumerate(zip(voter_ids, choices), 1):
        print(f"  [{i}/{num_voters}] 选民 {voter_id} 正在投票...")
        
        try:
            vote = voter.create_vote(voter_id, choice, num_candidates, bfv)
            print(f"       选择: {candidate_names[choice]} (索引 {choice})")
            print(f"       选票已加密")
            
            result = bulletin_board.submit_vote(vote, registry)
            print(f"       提交结果: {result['message']}")
            
        except ValueError as e:
            print(f"       投票失败: {e}")
        
        print()
    
    print(f"投票完成，公告板共收到 {bulletin_board.vote_count()} 张选票")
    
    print_header("阶段 4: 计票阶段")
    
    print_subheader("执行同态计票")
    print("正在对加密选票进行同态累加...")
    
    tally_system = tally.TallySystem(bfv)
    tally_result = tally_system.tally_votes(bulletin_board, num_candidates)
    
    if tally_result["success"]:
        print("同态计票完成")
        print(f"计票时间: {tally_result['tally_time']}")
        
        print_subheader("解密计票结果")
        print("正在解密累加后的密文...")
        vote_count = tally_result["vote_count"]
        print(f"解密完成，得票统计: {vote_count}")
        
        print_subheader("验证计票结果")
        verification = tally_result["verification"]
        print(f"验证状态: {verification['reason']}")
        print(f"总票数: {verification.get('total_votes', 'N/A')}")
        print(f"候选人数: {verification.get('num_candidates', 'N/A')}")
        
    else:
        print(f"计票失败: {tally_result.get('error', '未知错误')}")
        return
    
    print_header("阶段 5: 结果展示")
    
    print_subheader("投票结果统计")
    print()
    print(tally_result["result_string"])
    
    print_subheader("获胜者信息")
    winner_idx = tally_result["winner_index"]
    winner_name = tally_result["winner_name"]
    winner_votes = vote_count[winner_idx]
    winner_percentage = (winner_votes / sum(vote_count)) * 100
    
    print(f"\n  [WINNER] 获胜者: {winner_name}")
    print(f"     得票数: {winner_votes} 票")
    print(f"     得票率: {winner_percentage:.2f}%")
    
    print_header("演示完成")
    
    print("\n投票系统演示成功完成！")
    print("\n系统特性:")
    print("  [+] 基于 BFV 同态加密的隐私保护")
    print("  [+] 选票在加密状态下进行计票")
    print("  [+] 支持选民身份验证和防重复投票")
    print("  [+] 计票结果可验证")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
