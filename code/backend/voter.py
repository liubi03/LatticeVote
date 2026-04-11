"""
选民管理模块
实现选民注册、身份验证和选民列表管理功能
投票流程模块：选票创建、加密、提交和验证
"""

import time
from typing import Dict, List, Optional, Any

try:
    from . import crypto, utils
except ImportError:
    import crypto
    import utils


class VoterInfo:
    """选民信息类"""
    
    def __init__(self, voter_id: str):
        self.voter_id = voter_id
        self.registration_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        self.has_voted = False
    
    def to_dict(self) -> Dict:
        """将选民信息转换为字典"""
        return {
            "voter_id": self.voter_id,
            "registration_time": self.registration_time,
            "has_voted": self.has_voted
        }
    
    def __repr__(self) -> str:
        return f"VoterInfo(voter_id='{self.voter_id}', has_voted={self.has_voted})"


class VoterRegistry:
    """选民注册管理类"""
    
    def __init__(self):
        self._voters: Dict[str, VoterInfo] = {}
    
    def register_voter(self, voter_id: str) -> Dict:
        """
        注册新选民
        
        参数:
            voter_id: 选民唯一标识符
            
        返回:
            包含选民信息的字典
            
        异常:
            ValueError: 如果选民ID已存在
        """
        if not voter_id or not isinstance(voter_id, str):
            raise ValueError("选民ID必须是非空字符串")
        
        if voter_id in self._voters:
            raise ValueError(f"选民 '{voter_id}' 已注册")
        
        voter_info = VoterInfo(voter_id)
        self._voters[voter_id] = voter_info
        
        return voter_info.to_dict()
    
    def get_voter(self, voter_id: str) -> Optional[Dict]:
        """
        获取选民信息
        
        参数:
            voter_id: 选民唯一标识符
            
        返回:
            选民信息字典，如果选民不存在则返回 None
        """
        if voter_id in self._voters:
            return self._voters[voter_id].to_dict()
        return None
    
    def get_all_voters(self) -> List[Dict]:
        """
        获取所有注册选民列表
        
        返回:
            所有选民信息的列表
        """
        return [voter.to_dict() for voter in self._voters.values()]
    
    def is_registered(self, voter_id: str) -> bool:
        """
        检查选民是否已注册
        
        参数:
            voter_id: 选民唯一标识符
            
        返回:
            如果选民已注册返回 True，否则返回 False
        """
        return voter_id in self._voters
    
    def voter_count(self) -> int:
        """
        获取选民总数
        
        返回:
            已注册选民的数量
        """
        return len(self._voters)
    
    def authenticate_voter(self, voter_id: str) -> Dict:
        """
        验证选民身份
        
        参数:
            voter_id: 选民唯一标识符
            
        返回:
            包含验证结果和选民信息的字典
            
        异常:
            ValueError: 如果选民未注册或已投票
        """
        if not self.is_registered(voter_id):
            raise ValueError(f"选民 '{voter_id}' 未注册")
        
        voter = self._voters[voter_id]
        
        if voter.has_voted:
            raise ValueError(f"选民 '{voter_id}' 已完成投票")
        
        return {
            "authenticated": True,
            "voter_id": voter_id,
            "message": "身份验证成功"
        }
    
    def mark_voted(self, voter_id: str) -> None:
        """
        标记选民已完成投票
        
        参数:
            voter_id: 选民唯一标识符
            
        异常:
            ValueError: 如果选民未注册
        """
        if not self.is_registered(voter_id):
            raise ValueError(f"选民 '{voter_id}' 未注册")
        
        self._voters[voter_id].has_voted = True
    
    def clear_all(self) -> None:
        """清除所有选民信息（用于测试）"""
        self._voters.clear()


def test_voter_registry():
    """测试选民注册管理功能"""
    print("=" * 50)
    print("选民管理模块测试")
    print("=" * 50)
    
    registry = VoterRegistry()
    
    print("\n1. 测试选民注册")
    print("-" * 30)
    try:
        voter1 = registry.register_voter("V001")
        print(f"注册成功: {voter1}")
        
        voter2 = registry.register_voter("V002")
        print(f"注册成功: {voter2}")
        
        voter3 = registry.register_voter("V003")
        print(f"注册成功: {voter3}")
        
    except ValueError as e:
        print(f"注册失败: {e}")
    
    print("\n2. 测试重复注册")
    print("-" * 30)
    try:
        registry.register_voter("V001")
    except ValueError as e:
        print(f"预期错误: {e}")
    
    print("\n3. 测试获取选民信息")
    print("-" * 30)
    voter_info = registry.get_voter("V001")
    print(f"V001 信息: {voter_info}")
    
    voter_info = registry.get_voter("V999")
    print(f"V999 信息: {voter_info}")
    
    print("\n4. 测试选民总数")
    print("-" * 30)
    count = registry.voter_count()
    print(f"已注册选民总数: {count}")
    
    print("\n5. 测试选民是否注册")
    print("-" * 30)
    print(f"V001 已注册: {registry.is_registered('V001')}")
    print(f"V999 已注册: {registry.is_registered('V999')}")
    
    print("\n6. 测试获取所有选民")
    print("-" * 30)
    all_voters = registry.get_all_voters()
    for voter in all_voters:
        print(f"  - {voter['voter_id']}: 注册时间={voter['registration_time']}, 已投票={voter['has_voted']}")
    
    print("\n7. 测试身份验证")
    print("-" * 30)
    try:
        result = registry.authenticate_voter("V001")
        print(f"验证结果: {result}")
    except ValueError as e:
        print(f"验证失败: {e}")
    
    try:
        registry.authenticate_voter("V999")
    except ValueError as e:
        print(f"预期错误: {e}")
    
    print("\n8. 测试投票标记")
    print("-" * 30)
    registry.mark_voted("V001")
    print("V001 已标记为已投票")
    
    voter_info = registry.get_voter("V001")
    print(f"V001 当前状态: has_voted={voter_info['has_voted']}")
    
    print("\n9. 测试已投票选民的身份验证")
    print("-" * 30)
    try:
        registry.authenticate_voter("V001")
    except ValueError as e:
        print(f"预期错误: {e}")
    
    print("\n" + "=" * 50)
    print("测试完成!")
    print("=" * 50)


class Vote:
    """
    选票类
    表示一张加密的选票，包含选民ID、加密的投票向量和时间戳
    """
    
    def __init__(self, voter_id: str, encrypted_choice: Any, timestamp: str = None):
        """
        初始化选票
        
        参数:
            voter_id: 选民唯一标识符
            encrypted_choice: 加密的投票向量（BFVVector 密文）
            timestamp: 时间戳（可选，默认为当前时间）
        """
        self.voter_id = voter_id
        self.encrypted_choice = encrypted_choice
        self.timestamp = timestamp if timestamp else time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    
    def to_dict(self) -> Dict:
        """
        将选票信息转换为字典（不包含密文，密文无法直接序列化）
        
        返回:
            包含选票元数据的字典
        """
        return {
            "voter_id": self.voter_id,
            "timestamp": self.timestamp,
            "has_encrypted_data": self.encrypted_choice is not None
        }
    
    def __repr__(self) -> str:
        return f"Vote(voter_id='{self.voter_id}', timestamp='{self.timestamp}')"


def create_vote(voter_id: str, choice: int, num_candidates: int, 
                crypto_context: crypto.BFVContext) -> Vote:
    """
    创建加密选票
    
    参数:
        voter_id: 选民唯一标识符
        choice: 投票选择（候选人索引，从0开始）
        num_candidates: 候选人总数
        crypto_context: BFV 加密上下文
        
    返回:
        Vote 对象，包含加密的投票向量
        
    异常:
        ValueError: 当参数无效时抛出
        TypeError: 当加密上下文类型错误时抛出
    """
    if not voter_id or not isinstance(voter_id, str):
        raise ValueError("选民ID必须是非空字符串")
    
    if not isinstance(crypto_context, crypto.BFVContext):
        raise TypeError("crypto_context 必须是 BFVContext 类型")
    
    try:
        choice_vector = utils.one_hot_encode(choice, num_candidates)
        choice_vector_int = [int(x) for x in choice_vector]
        encrypted_vector = crypto_context.encrypt_vector(choice_vector_int)
        vote = Vote(voter_id, encrypted_vector)
        
        return vote
    except Exception as e:
        raise RuntimeError(f"创建选票失败: {str(e)}")


class BulletinBoard:
    """
    公告板类
    存储所有提交的选票，提供选票验证和查询功能
    """
    
    def __init__(self):
        """初始化公告板"""
        self._votes: List[Vote] = []
        self._voted_ids: set = set()
    
    def submit_vote(self, vote: Vote, voter_registry: VoterRegistry) -> Dict:
        """
        提交选票到公告板
        
        参数:
            vote: 要提交的选票
            voter_registry: 选民注册表，用于验证选民
            
        返回:
            包含提交结果的字典
            
        异常:
            ValueError: 当选票无效或选民不符合条件时抛出
            TypeError: 当参数类型错误时抛出
        """
        if not isinstance(vote, Vote):
            raise TypeError("vote 必须是 Vote 类型")
        
        if not isinstance(voter_registry, VoterRegistry):
            raise TypeError("voter_registry 必须是 VoterRegistry 类型")
        
        validation_result = self.validate_vote(vote, voter_registry)
        
        if not validation_result["valid"]:
            raise ValueError(f"选票验证失败: {validation_result['reason']}")
        
        self._votes.append(vote)
        self._voted_ids.add(vote.voter_id)
        voter_registry.mark_voted(vote.voter_id)
        
        return {
            "success": True,
            "message": "选票提交成功",
            "vote_info": vote.to_dict()
        }
    
    def validate_vote(self, vote: Vote, voter_registry: VoterRegistry) -> Dict:
        """
        验证选票有效性
        
        参数:
            vote: 要验证的选票
            voter_registry: 选民注册表
            
        返回:
            包含验证结果的字典，包括 valid 字段和可能的 reason 字段
        """
        if not isinstance(vote, Vote):
            return {"valid": False, "reason": "选票类型无效"}
        
        if not isinstance(voter_registry, VoterRegistry):
            return {"valid": False, "reason": "选民注册表类型无效"}
        
        if not voter_registry.is_registered(vote.voter_id):
            return {"valid": False, "reason": f"选民 '{vote.voter_id}' 未注册"}
        
        if vote.voter_id in self._voted_ids:
            return {"valid": False, "reason": f"选民 '{vote.voter_id}' 已投过票"}
        
        if vote.encrypted_choice is None:
            return {"valid": False, "reason": "选票缺少加密数据"}
        
        return {"valid": True, "reason": "验证通过"}
    
    def get_all_votes(self) -> List[Dict]:
        """
        获取所有选票的元数据列表
        
        返回:
            所有选票元数据的列表
        """
        return [vote.to_dict() for vote in self._votes]
    
    def get_encrypted_choices(self) -> List:
        """
        获取所有加密的投票向量（用于同态计票）
        
        返回:
            加密投票向量列表
        """
        return [vote.encrypted_choice for vote in self._votes]
    
    def vote_count(self) -> int:
        """
        获取选票总数
        
        返回:
            已提交选票的数量
        """
        return len(self._votes)
    
    def has_voted(self, voter_id: str) -> bool:
        """
        检查选民是否已投票
        
        参数:
            voter_id: 选民唯一标识符
            
        返回:
            如果选民已投票返回 True，否则返回 False
        """
        return voter_id in self._voted_ids
    
    def clear_all(self) -> None:
        """清除所有选票（用于测试）"""
        self._votes.clear()
        self._voted_ids.clear()


def test_voting_flow():
    """
    测试投票流程模块
    演示完整的投票流程：选民注册 -> 创建选票 -> 提交选票 -> 验证
    """
    print("=" * 60)
    print("投票流程模块测试")
    print("=" * 60)
    
    print("\n[1] 初始化加密上下文")
    print("-" * 40)
    bfv = crypto.BFVContext(poly_modulus_degree=8192, plain_modulus=1032193)
    
    print("\n[2] 创建选民注册表和公告板")
    print("-" * 40)
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
    
    for i, (voter_id, choice) in enumerate(zip(voters, choices)):
        try:
            vote = create_vote(voter_id, choice, num_candidates, bfv)
            print(f"  创建选票: {vote}")
            
            result = bulletin_board.submit_vote(vote, registry)
            print(f"  提交结果: {result['message']}")
        except Exception as e:
            print(f"  错误: {e}")
    
    print(f"\n  已提交选票总数: {bulletin_board.vote_count()}")
    
    print("\n[5] 测试重复投票")
    print("-" * 40)
    try:
        vote = create_vote("V001", 0, num_candidates, bfv)
        bulletin_board.submit_vote(vote, registry)
    except ValueError as e:
        print(f"  预期错误: {e}")
    
    print("\n[6] 测试未注册选民投票")
    print("-" * 40)
    try:
        vote = create_vote("V999", 0, num_candidates, bfv)
        bulletin_board.submit_vote(vote, registry)
    except ValueError as e:
        print(f"  预期错误: {e}")
    
    print("\n[7] 验证选票有效性")
    print("-" * 40)
    test_vote = create_vote("V006", 1, num_candidates, bfv)
    registry.register_voter("V006")
    validation = bulletin_board.validate_vote(test_vote, registry)
    print(f"  选票验证结果: {validation}")
    
    print("\n[8] 获取所有选票信息")
    print("-" * 40)
    all_votes = bulletin_board.get_all_votes()
    for v in all_votes:
        print(f"  - 选民: {v['voter_id']}, 时间: {v['timestamp']}")
    
    print("\n[9] 同态计票演示")
    print("-" * 40)
    encrypted_choices = bulletin_board.get_encrypted_choices()
    print(f"  加密选票数量: {len(encrypted_choices)}")
    
    encrypted_sum = encrypted_choices[0]
    for ct in encrypted_choices[1:]:
        encrypted_sum = bfv.homomorphic_add(encrypted_sum, ct)
    
    result = bfv.decrypt(encrypted_sum)
    print(f"  同态计票结果: {result[:num_candidates]}")
    
    candidate_names = utils.generate_candidate_names(num_candidates)
    result_str = utils.format_results(result[:num_candidates], candidate_names)
    print(f"\n{result_str}")
    
    print("\n" + "=" * 60)
    print("投票流程模块测试完成!")
    print("=" * 60)


if __name__ == "__main__":
    test_voter_registry()
    print("\n")
    test_voting_flow()
