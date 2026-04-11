"""
LatticeVote 计票模块
实现同态加密选票的计票功能
"""

import time
from typing import List, Dict, Any, Optional

try:
    from . import crypto, utils
except ImportError:
    import crypto
    import utils


class TallySystem:
    """
    计票系统类
    负责对加密选票进行同态累加、解密和验证
    """
    
    def __init__(self, crypto_context: crypto.BFVContext):
        """
        初始化计票系统
        
        参数:
            crypto_context: BFV 加密上下文
        """
        if not isinstance(crypto_context, crypto.BFVContext):
            raise TypeError("crypto_context 必须是 BFVContext 类型")
        
        self.crypto_context = crypto_context
        self.tally_time = None
        self.aggregated_ciphertext = None
        self.vote_count = None
    
    def aggregate_votes(self, encrypted_choices: List[Any]) -> Any:
        """
        对加密选票进行同态累加
        
        参数:
            encrypted_choices: 加密选票列表（每个是 BFVVector）
            
        返回:
            累加后的密文向量
            
        异常:
            ValueError: 当选票列表为空时抛出
            TypeError: 当选票类型错误时抛出
        """
        if not encrypted_choices:
            raise ValueError("加密选票列表不能为空")
        
        if not isinstance(encrypted_choices, list):
            raise TypeError("encrypted_choices 必须是列表类型")
        
        try:
            aggregated = encrypted_choices[0]
            
            for i, ciphertext in enumerate(encrypted_choices[1:], start=1):
                aggregated = self.crypto_context.homomorphic_add(aggregated, ciphertext)
            
            self.aggregated_ciphertext = aggregated
            return aggregated
            
        except Exception as e:
            raise RuntimeError(f"同态累加失败: {str(e)}")
    
    def decrypt_tally(self, aggregated_ciphertext: Any = None) -> List[int]:
        """
        解密累加结果
        
        参数:
            aggregated_ciphertext: 累加后的密文向量（可选，默认使用之前累加的结果）
            
        返回:
            明文得票数列表
            
        异常:
            ValueError: 当没有可解密的密文时抛出
        """
        if aggregated_ciphertext is None:
            aggregated_ciphertext = self.aggregated_ciphertext
        
        if aggregated_ciphertext is None:
            raise ValueError("没有可解密的密文，请先进行同态累加")
        
        try:
            plaintext = self.crypto_context.decrypt(aggregated_ciphertext)
            self.vote_count = plaintext
            return plaintext
        except Exception as e:
            raise RuntimeError(f"解密失败: {str(e)}")
    
    def verify_tally(self, vote_count: List[int], num_voters: int) -> Dict:
        """
        验证计票结果
        
        参数:
            vote_count: 得票数列表
            num_voters: 选民总数
            
        返回:
            包含验证结果的字典
        """
        if vote_count is None:
            return {
                "valid": False,
                "reason": "得票数列表为空"
            }
        
        if not isinstance(vote_count, list):
            return {
                "valid": False,
                "reason": "得票数列表类型错误"
            }
        
        if not isinstance(num_voters, int) or num_voters < 0:
            return {
                "valid": False,
                "reason": "选民总数必须是非负整数"
            }
        
        total_votes = sum(vote_count)
        
        if total_votes != num_voters:
            return {
                "valid": False,
                "reason": f"总票数 ({total_votes}) 不等于选民数 ({num_voters})",
                "total_votes": total_votes,
                "expected_votes": num_voters
            }
        
        for i, count in enumerate(vote_count):
            if count < 0:
                return {
                    "valid": False,
                    "reason": f"候选人 {i+1} 的得票数为负数: {count}"
                }
        
        return {
            "valid": True,
            "reason": "计票结果验证通过",
            "total_votes": total_votes,
            "num_candidates": len(vote_count)
        }
    
    def tally_votes(self, bulletin_board: Any, num_candidates: int) -> Dict:
        """
        执行完整计票流程
        
        参数:
            bulletin_board: 公告板对象
            num_candidates: 候选人数量
            
        返回:
            包含完整计票结果的字典
        """
        self.tally_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        
        try:
            encrypted_choices = bulletin_board.get_encrypted_choices()
            
            if not encrypted_choices:
                return {
                    "success": False,
                    "error": "公告板上没有选票",
                    "tally_time": self.tally_time
                }
            
            num_voters = bulletin_board.vote_count()
            
            aggregated = self.aggregate_votes(encrypted_choices)
            
            vote_count = self.decrypt_tally(aggregated)
            
            vote_count_trimmed = vote_count[:num_candidates]
            
            verification = self.verify_tally(vote_count_trimmed, num_voters)
            
            candidate_names = utils.generate_candidate_names(num_candidates)
            result_str = utils.format_results(vote_count_trimmed, candidate_names)
            
            winner_idx, winner_name = utils.get_winner(vote_count_trimmed, candidate_names)
            
            return {
                "success": True,
                "tally_time": self.tally_time,
                "num_voters": num_voters,
                "num_candidates": num_candidates,
                "vote_count": vote_count_trimmed,
                "verification": verification,
                "winner_index": winner_idx,
                "winner_name": winner_name,
                "result_string": result_str
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "tally_time": self.tally_time
            }


def aggregate_votes(encrypted_choices: List[Any], crypto_context: crypto.BFVContext) -> Any:
    """
    对加密选票进行同态累加（函数式接口）
    
    参数:
        encrypted_choices: 加密选票列表（每个是 BFVVector）
        crypto_context: BFV 加密上下文
        
    返回:
        累加后的密文向量
    """
    if not encrypted_choices:
        raise ValueError("加密选票列表不能为空")
    
    if not isinstance(crypto_context, crypto.BFVContext):
        raise TypeError("crypto_context 必须是 BFVContext 类型")
    
    try:
        aggregated = encrypted_choices[0]
        
        for ciphertext in encrypted_choices[1:]:
            aggregated = crypto_context.homomorphic_add(aggregated, ciphertext)
        
        return aggregated
        
    except Exception as e:
        raise RuntimeError(f"同态累加失败: {str(e)}")


def decrypt_tally(aggregated_ciphertext: Any, crypto_context: crypto.BFVContext) -> List[int]:
    """
    解密累加结果（函数式接口）
    
    参数:
        aggregated_ciphertext: 累加后的密文向量
        crypto_context: BFV 加密上下文
        
    返回:
        明文得票数列表
    """
    if not isinstance(crypto_context, crypto.BFVContext):
        raise TypeError("crypto_context 必须是 BFVContext 类型")
    
    try:
        plaintext = crypto_context.decrypt(aggregated_ciphertext)
        return plaintext
    except Exception as e:
        raise RuntimeError(f"解密失败: {str(e)}")


def verify_tally(vote_count: List[int], num_voters: int) -> Dict:
    """
    验证计票结果（函数式接口）
    
    参数:
        vote_count: 得票数列表
        num_voters: 选民总数
        
    返回:
        包含验证结果的字典
    """
    if vote_count is None:
        return {
            "valid": False,
            "reason": "得票数列表为空"
        }
    
    if not isinstance(vote_count, list):
        return {
            "valid": False,
            "reason": "得票数列表类型错误"
        }
    
    if not isinstance(num_voters, int) or num_voters < 0:
        return {
            "valid": False,
            "reason": "选民总数必须是非负整数"
        }
    
    total_votes = sum(vote_count)
    
    if total_votes != num_voters:
        return {
            "valid": False,
            "reason": f"总票数 ({total_votes}) 不等于选民数 ({num_voters})",
            "total_votes": total_votes,
            "expected_votes": num_voters
        }
    
    for i, count in enumerate(vote_count):
        if count < 0:
            return {
                "valid": False,
                "reason": f"候选人 {i+1} 的得票数为负数: {count}"
            }
    
    return {
        "valid": True,
        "reason": "计票结果验证通过",
        "total_votes": total_votes,
        "num_candidates": len(vote_count)
    }


def tally_votes(bulletin_board: Any, crypto_context: crypto.BFVContext, 
                num_candidates: int) -> Dict:
    """
    执行完整计票流程（函数式接口）
    
    参数:
        bulletin_board: 公告板对象
        crypto_context: BFV 加密上下文
        num_candidates: 候选人数量
        
    返回:
        包含完整计票结果的字典
    """
    tally_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    
    try:
        encrypted_choices = bulletin_board.get_encrypted_choices()
        
        if not encrypted_choices:
            return {
                "success": False,
                "error": "公告板上没有选票",
                "tally_time": tally_time
            }
        
        num_voters = bulletin_board.vote_count()
        
        aggregated = aggregate_votes(encrypted_choices, crypto_context)
        
        vote_count = decrypt_tally(aggregated, crypto_context)
        
        vote_count_trimmed = vote_count[:num_candidates]
        
        verification = verify_tally(vote_count_trimmed, num_voters)
        
        candidate_names = utils.generate_candidate_names(num_candidates)
        result_str = utils.format_results(vote_count_trimmed, candidate_names)
        
        winner_idx, winner_name = utils.get_winner(vote_count_trimmed, candidate_names)
        
        return {
            "success": True,
            "tally_time": tally_time,
            "num_voters": num_voters,
            "num_candidates": num_candidates,
            "vote_count": vote_count_trimmed,
            "verification": verification,
            "winner_index": winner_idx,
            "winner_name": winner_name,
            "result_string": result_str
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "tally_time": tally_time
        }


def test_tally():
    """
    测试计票模块
    演示完整的计票流程：选民注册 -> 投票 -> 同态计票 -> 解密 -> 验证
    """
    print("=" * 60)
    print("LatticeVote 计票模块测试")
    print("=" * 60)
    
    print("\n[1] 初始化加密上下文")
    print("-" * 40)
    bfv = crypto.BFVContext(poly_modulus_degree=8192, plain_modulus=1032193)
    
    print("\n[2] 创建选民注册表和公告板")
    print("-" * 40)
    
    try:
        from .voter import VoterRegistry, BulletinBoard, create_vote
    except ImportError:
        from voter import VoterRegistry, BulletinBoard, create_vote
    
    registry = VoterRegistry()
    bulletin_board = BulletinBoard()
    
    print("\n[3] 注册选民")
    print("-" * 40)
    voters = ["V001", "V002", "V003", "V004", "V005"]
    for voter_id in voters:
        registry.register_voter(voter_id)
        print(f"  注册选民: {voter_id}")
    print(f"  已注册选民总数: {registry.voter_count()}")
    
    print("\n[4] 创建并提交选票")
    print("-" * 40)
    num_candidates = 3
    choices = [0, 1, 1, 2, 1]
    
    for voter_id, choice in zip(voters, choices):
        vote = create_vote(voter_id, choice, num_candidates, bfv)
        result = bulletin_board.submit_vote(vote, registry)
        print(f"  选民 {voter_id} 投票给候选人 {choice+1}: {result['message']}")
    
    print(f"\n  已提交选票总数: {bulletin_board.vote_count()}")
    
    print("\n[5] 测试 TallySystem 类")
    print("-" * 40)
    tally_system = TallySystem(bfv)
    
    print("  获取加密选票...")
    encrypted_choices = bulletin_board.get_encrypted_choices()
    print(f"  加密选票数量: {len(encrypted_choices)}")
    
    print("  执行同态累加...")
    aggregated = tally_system.aggregate_votes(encrypted_choices)
    print(f"  同态累加完成")
    
    print("  解密计票结果...")
    vote_count = tally_system.decrypt_tally()
    print(f"  解密结果: {vote_count[:num_candidates]}")
    
    print("  验证计票结果...")
    verification = tally_system.verify_tally(vote_count[:num_candidates], len(voters))
    print(f"  验证结果: {verification}")
    
    print("\n[6] 测试函数式接口")
    print("-" * 40)
    
    print("  使用 aggregate_votes() 函数...")
    aggregated_func = aggregate_votes(encrypted_choices, bfv)
    print(f"  同态累加完成")
    
    print("  使用 decrypt_tally() 函数...")
    vote_count_func = decrypt_tally(aggregated_func, bfv)
    print(f"  解密结果: {vote_count_func[:num_candidates]}")
    
    print("  使用 verify_tally() 函数...")
    verification_func = verify_tally(vote_count_func[:num_candidates], len(voters))
    print(f"  验证结果: {verification_func}")
    
    print("\n[7] 测试完整计票流程")
    print("-" * 40)
    result = tally_votes(bulletin_board, bfv, num_candidates)
    
    if result["success"]:
        print(f"  计票时间: {result['tally_time']}")
        print(f"  选民总数: {result['num_voters']}")
        print(f"  候选人数: {result['num_candidates']}")
        print(f"  得票统计: {result['vote_count']}")
        print(f"  验证结果: {result['verification']['reason']}")
        print(f"  获胜者: {result['winner_name']} (索引: {result['winner_index']})")
        print(f"\n{result['result_string']}")
    else:
        print(f"  计票失败: {result['error']}")
    
    print("\n[8] 测试错误处理")
    print("-" * 40)
    
    print("  测试空选票列表...")
    try:
        aggregate_votes([], bfv)
    except ValueError as e:
        print(f"  捕获预期错误: {e}")
    
    print("  测试票数不匹配...")
    verification_error = verify_tally([1, 2, 3], 10)
    print(f"  验证结果: {verification_error}")
    
    print("  测试负票数...")
    verification_negative = verify_tally([1, -2, 3], 2)
    print(f"  验证结果: {verification_negative}")
    
    print("\n[9] 验证计票正确性")
    print("-" * 40)
    expected_counts = [1, 3, 1]
    actual_counts = result['vote_count']
    
    print(f"  预期得票: {expected_counts}")
    print(f"  实际得票: {actual_counts}")
    
    if expected_counts == actual_counts:
        print("  [PASS] 计票结果正确！")
    else:
        print("  [FAIL] 计票结果不匹配！")
    
    print("\n" + "=" * 60)
    print("计票模块测试完成！")
    print("=" * 60)
    
    return result


if __name__ == "__main__":
    test_tally()
