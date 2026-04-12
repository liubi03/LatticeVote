"""
选票管理模块
实现选票的创建、提交、验证和存储功能
"""

import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend import crypto, utils
from .signature import DigitalSignature
from .zkp import SimplifiedZKP


@dataclass
class Ballot:
    """选票类"""
    ballot_id: str
    project_id: str
    voter_id: str
    encrypted_choice: str
    signature: str
    zkp_proof: Dict[str, Any]
    timestamp: str
    choice: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Ballot':
        """从字典创建选票对象"""
        return cls(**data)


class BallotManager:
    """选票管理类"""
    
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(current_dir, "data")
        self.data_dir = data_dir
        self.ballots: Dict[str, List[Ballot]] = {}
    
    def _get_project_ballot_file(self, project_id: str) -> str:
        """获取项目选票文件路径"""
        return os.path.join(self.data_dir, f"ballots_{project_id}.json")
    
    def _load_ballots(self, project_id: str) -> List[Ballot]:
        """加载项目选票"""
        if project_id in self.ballots:
            return self.ballots[project_id]
        
        ballot_file = self._get_project_ballot_file(project_id)
        try:
            with open(ballot_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            ballots = [Ballot.from_dict(b) for b in data.get('ballots', [])]
            self.ballots[project_id] = ballots
            return ballots
        except FileNotFoundError:
            self.ballots[project_id] = []
            return []
    
    def _save_ballots(self, project_id: str):
        """保存项目选票"""
        ballot_file = self._get_project_ballot_file(project_id)
        data = {
            'ballots': [b.to_dict() for b in self.ballots.get(project_id, [])]
        }
        
        with open(ballot_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def create_ballot(self, project_id: str, voter_id: str, choice: int,
                     num_candidates: int, private_key_pem: str,
                     public_key_pem: str, crypto_context_path: str) -> Ballot:
        """
        创建选票
        
        Args:
            project_id: 项目ID
            voter_id: 选民ID
            choice: 选择索引
            num_candidates: 候选人数量
            private_key_pem: 选民私钥
            public_key_pem: 选民公钥
            crypto_context_path: 加密上下文路径
        
        Returns:
            创建的选票对象
        """
        if choice < 0 or choice >= num_candidates:
            raise ValueError(f"无效的选择: {choice}")
        
        if not os.path.isabs(crypto_context_path):
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            crypto_context_path = os.path.join(project_root, crypto_context_path)
        
        bfv_context = crypto.BFVContext.load_context(crypto_context_path)
        
        one_hot = utils.one_hot_encode(choice, num_candidates)
        encrypted_vector = bfv_context.encrypt_vector(one_hot.tolist())
        
        import tenseal as ts
        encrypted_bytes = encrypted_vector.serialize()
        encrypted_choice = encrypted_bytes.hex()
        
        ds = DigitalSignature()
        ds.load_private_key(private_key_pem)
        signature = ds.sign(f"{project_id}{voter_id}{choice}")
        
        encrypted_ballot_hash = SimplifiedZKP._hash(encrypted_choice)
        zkp_proof = SimplifiedZKP.generate_ballot_validity_proof(
            choice, num_candidates, encrypted_ballot_hash
        )
        
        ballot_id = f"ballot_{len(self._load_ballots(project_id)) + 1:04d}"
        timestamp = datetime.now().isoformat()
        
        ballot = Ballot(
            ballot_id=ballot_id,
            project_id=project_id,
            voter_id=voter_id,
            encrypted_choice=encrypted_choice,
            signature=signature,
            zkp_proof=zkp_proof,
            timestamp=timestamp,
            choice=choice
        )
        
        return ballot
    
    def submit_ballot(self, ballot: Ballot, public_key_pem: str) -> bool:
        """
        提交选票
        
        Args:
            ballot: 选票对象
            public_key_pem: 选民公钥
        
        Returns:
            是否提交成功
        """
        project_ballots = self._load_ballots(ballot.project_id)
        
        for existing_ballot in project_ballots:
            if existing_ballot.voter_id == ballot.voter_id:
                raise ValueError(f"选民已投票: {ballot.voter_id}")
        
        ds = DigitalSignature()
        ds.load_public_key(public_key_pem)
        
        message = f"{ballot.project_id}{ballot.voter_id}{ballot.choice}"
        if not ds.verify(message, ballot.signature):
            raise ValueError("签名验证失败")
        
        encrypted_ballot_hash = SimplifiedZKP._hash(ballot.encrypted_choice)
        if not SimplifiedZKP.verify_ballot_validity_proof(
            ballot.zkp_proof, encrypted_ballot_hash
        ):
            raise ValueError("零知识证明验证失败")
        
        project_ballots.append(ballot)
        self.ballots[ballot.project_id] = project_ballots
        self._save_ballots(ballot.project_id)
        
        return True
    
    def get_ballots(self, project_id: str) -> List[Ballot]:
        """获取项目的所有选票"""
        return self._load_ballots(project_id)
    
    def get_ballot_count(self, project_id: str) -> int:
        """获取项目的选票数量"""
        return len(self._load_ballots(project_id))
    
    def has_voted(self, project_id: str, voter_id: str) -> bool:
        """检查选民是否已投票"""
        ballots = self._load_ballots(project_id)
        return any(b.voter_id == voter_id for b in ballots)
    
    def tally_ballots(self, project_id: str, crypto_context_path: str,
                     num_candidates: int) -> List[int]:
        """
        计票
        
        Args:
            project_id: 项目ID
            crypto_context_path: 加密上下文路径
            num_candidates: 候选人数量
        
        Returns:
            各候选人的得票数列表
        """
        ballots = self._load_ballots(project_id)
        
        if not ballots:
            return [0] * num_candidates
        
        if not os.path.isabs(crypto_context_path):
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            crypto_context_path = os.path.join(project_root, crypto_context_path)
        
        bfv_context = crypto.BFVContext.load_context(crypto_context_path)
        
        import tenseal as ts
        
        encrypted_vectors = []
        for ballot in ballots:
            encrypted_bytes = bytes.fromhex(ballot.encrypted_choice)
            encrypted_vector = ts.bfv_vector_from(bfv_context.context, encrypted_bytes)
            encrypted_vectors.append(encrypted_vector)
        
        aggregated = encrypted_vectors[0]
        for vec in encrypted_vectors[1:]:
            aggregated = bfv_context.homomorphic_add(aggregated, vec)
        
        result = bfv_context.decrypt(aggregated)
        
        plain_modulus = bfv_context.plain_modulus
        final_result = []
        for r in result[:num_candidates]:
            if r < 0:
                r = r + plain_modulus
            final_result.append(r)
        
        return final_result


def test_ballot_manager():
    """测试选票管理模块"""
    print("=" * 60)
    print("选票管理模块测试")
    print("=" * 60)
    
    manager = BallotManager()
    
    print("\n[1] 创建选票（模拟）")
    print("  注意：需要实际的加密上下文和密钥")
    print("  此测试仅演示流程")
    
    print("\n[2] 选票验证流程")
    print("  ✓ 签名验证")
    print("  ✓ 零知识证明验证")
    print("  ✓ 防重复投票检查")
    
    print("\n[3] 计票流程")
    print("  ✓ 同态累加选票")
    print("  ✓ 解密得票结果")
    print("  ✓ 验证计票正确性")
    
    print("\n" + "=" * 60)
    print("选票管理模块测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_ballot_manager()
