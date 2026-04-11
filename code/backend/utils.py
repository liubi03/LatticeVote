"""
LatticeVote 项目辅助工具模块
提供投票系统的通用辅助函数
"""

import numpy as np
from typing import List, Optional, Tuple


def one_hot_encode(choice: int, num_candidates: int) -> np.ndarray:
    """
    将投票选择编码为 one-hot 向量
    
    参数:
        choice: 投票选择（候选人索引，从0开始）
        num_candidates: 候选人总数
    
    返回:
        one-hot 编码的 numpy 向量
    
    异常:
        ValueError: 当选择无效时抛出
    
    示例:
        >>> one_hot_encode(1, 3)
        array([0., 1., 0.])
    """
    if not validate_vote_choice(choice, num_candidates):
        raise ValueError(f"无效的投票选择: choice={choice}, num_candidates={num_candidates}")
    
    vector = np.zeros(num_candidates, dtype=np.float64)
    vector[choice] = 1.0
    return vector


def validate_vote_choice(choice: int, num_candidates: int) -> bool:
    """
    验证投票选择是否有效
    
    参数:
        choice: 投票选择（候选人索引）
        num_candidates: 候选人总数
    
    返回:
        True 如果选择有效，False 否则
    
    示例:
        >>> validate_vote_choice(1, 3)
        True
        >>> validate_vote_choice(5, 3)
        False
    """
    if not isinstance(choice, int):
        return False
    
    if not isinstance(num_candidates, int) or num_candidates <= 0:
        return False
    
    return 0 <= choice < num_candidates


def generate_candidate_names(num_candidates: int, prefix: str = "候选人") -> List[str]:
    """
    生成候选人名称列表
    
    参数:
        num_candidates: 候选人数量
        prefix: 名称前缀（默认为"候选人"）
    
    返回:
        候选人名称列表
    
    异常:
        ValueError: 当候选人数量无效时抛出
    
    示例:
        >>> generate_candidate_names(3)
        ['候选人1', '候选人2', '候选人3']
    """
    if not isinstance(num_candidates, int) or num_candidates <= 0:
        raise ValueError(f"无效的候选人数量: {num_candidates}")
    
    return [f"{prefix}{i+1}" for i in range(num_candidates)]


def format_results(vote_counts: np.ndarray, candidate_names: Optional[List[str]] = None) -> str:
    """
    格式化投票结果为易读的字符串
    
    参数:
        vote_counts: 每个候选人的得票数数组
        candidate_names: 候选人名称列表（可选）
    
    返回:
        格式化的结果字符串，包含得票数和百分比
    
    示例:
        >>> counts = np.array([10, 20, 15])
        >>> names = ['候选人1', '候选人2', '候选人3']
        >>> print(format_results(counts, names))
        ========== 投票结果 ==========
        候选人1: 10 票 (22.22%)
        候选人2: 20 票 (44.44%)
        候选人3: 15 票 (33.33%)
        ==============================
        总票数: 45
    """
    if not isinstance(vote_counts, np.ndarray):
        vote_counts = np.array(vote_counts)
    
    num_candidates = len(vote_counts)
    
    if candidate_names is None:
        candidate_names = generate_candidate_names(num_candidates)
    
    if len(candidate_names) != num_candidates:
        raise ValueError("候选人名称数量与得票数数组长度不匹配")
    
    total_votes = np.sum(vote_counts)
    
    result_lines = []
    result_lines.append("=" * 30)
    result_lines.append("投票结果")
    result_lines.append("=" * 30)
    
    if total_votes == 0:
        for i, name in enumerate(candidate_names):
            result_lines.append(f"{name}: 0 票 (0.00%)")
        result_lines.append("=" * 30)
        result_lines.append("总票数: 0")
    else:
        for i, name in enumerate(candidate_names):
            votes = int(vote_counts[i])
            percentage = (votes / total_votes) * 100
            result_lines.append(f"{name}: {votes} 票 ({percentage:.2f}%)")
        
        result_lines.append("=" * 30)
        result_lines.append(f"总票数: {int(total_votes)}")
        
        winner_idx = np.argmax(vote_counts)
        result_lines.append(f"获胜者: {candidate_names[winner_idx]}")
    
    return "\n".join(result_lines)


def aggregate_votes(vote_vectors: List[np.ndarray]) -> np.ndarray:
    """
    聚合多个投票向量
    
    参数:
        vote_vectors: one-hot 投票向量列表
    
    返回:
        聚合后的得票数数组
    
    示例:
        >>> votes = [one_hot_encode(0, 3), one_hot_encode(1, 3), one_hot_encode(1, 3)]
        >>> aggregate_votes(votes)
        array([1., 2., 0.])
    """
    if not vote_vectors:
        raise ValueError("投票向量列表不能为空")
    
    return np.sum(vote_vectors, axis=0)


def get_winner(vote_counts: np.ndarray, candidate_names: Optional[List[str]] = None) -> Tuple[int, str]:
    """
    获取获胜者信息
    
    参数:
        vote_counts: 得票数数组
        candidate_names: 候选人名称列表（可选）
    
    返回:
        (获胜者索引, 获胜者名称) 元组
    
    示例:
        >>> counts = np.array([10, 20, 15])
        >>> get_winner(counts, ['A', 'B', 'C'])
        (1, 'B')
    """
    winner_idx = int(np.argmax(vote_counts))
    
    if candidate_names is None:
        candidate_names = generate_candidate_names(len(vote_counts))
    
    return winner_idx, candidate_names[winner_idx]


def test_utils():
    """
    测试辅助工具模块的所有功能
    """
    print("=" * 50)
    print("LatticeVote 辅助工具模块测试")
    print("=" * 50)
    
    print("\n【测试1】one-hot 编码功能")
    print("-" * 50)
    num_candidates = 4
    for choice in range(num_candidates):
        encoded = one_hot_encode(choice, num_candidates)
        print(f"选择 {choice} -> {encoded}")
    
    print("\n【测试2】投票选择验证")
    print("-" * 50)
    test_cases = [(0, 3), (2, 3), (3, 3), (-1, 3), (1.5, 3)]
    for choice, num in test_cases:
        valid = validate_vote_choice(choice, num)
        print(f"choice={choice}, num_candidates={num} -> 有效: {valid}")
    
    print("\n【测试3】候选人名称生成")
    print("-" * 50)
    names = generate_candidate_names(5)
    print(f"生成的候选人名称: {names}")
    
    print("\n【测试4】投票结果格式化")
    print("-" * 50)
    vote_counts = np.array([15, 28, 12, 8])
    candidate_names = ['张三', '李四', '王五', '赵六']
    result_str = format_results(vote_counts, candidate_names)
    print(result_str)
    
    print("\n【测试5】投票聚合功能")
    print("-" * 50)
    num_candidates = 3
    votes = [
        one_hot_encode(0, num_candidates),
        one_hot_encode(1, num_candidates),
        one_hot_encode(1, num_candidates),
        one_hot_encode(2, num_candidates),
        one_hot_encode(1, num_candidates),
    ]
    aggregated = aggregate_votes(votes)
    print(f"投票向量数量: {len(votes)}")
    print(f"聚合结果: {aggregated}")
    print(f"得票数: {[int(x) for x in aggregated]}")
    
    print("\n【测试6】获取获胜者")
    print("-" * 50)
    winner_idx, winner_name = get_winner(aggregated, ['候选人A', '候选人B', '候选人C'])
    print(f"获胜者索引: {winner_idx}")
    print(f"获胜者名称: {winner_name}")
    
    print("\n【测试7】错误处理")
    print("-" * 50)
    try:
        one_hot_encode(5, 3)
    except ValueError as e:
        print(f"捕获预期错误: {e}")
    
    try:
        generate_candidate_names(-1)
    except ValueError as e:
        print(f"捕获预期错误: {e}")
    
    print("\n" + "=" * 50)
    print("所有测试完成！")
    print("=" * 50)


if __name__ == "__main__":
    test_utils()
