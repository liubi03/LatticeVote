"""
零知识证明模块（简化版本）
实现选民身份证明、选票有效性证明和计票正确性证明
注意：这是简化实现，用于课程演示，不实现完整的 zk-SNARK
"""

import hashlib
import json
import random
from typing import Dict, Any, Tuple
from datetime import datetime


class SimplifiedZKP:
    """简化的零知识证明类"""
    
    @staticmethod
    def _hash(data: str) -> str:
        """计算哈希值"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    @staticmethod
    def generate_voter_identity_proof(voter_id: str, public_key: str, 
                                      voter_list_hash: str) -> Dict[str, Any]:
        """
        生成选民身份零知识证明
        证明选民是合法选民，但不透露具体身份
        
        Args:
            voter_id: 选民ID
            public_key: 选民公钥
            voter_list_hash: 合法选民列表的哈希值
        
        Returns:
            包含证明信息的字典
        """
        commitment = SimplifiedZKP._hash(f"{voter_id}{public_key}{random.random()}")
        
        challenge = SimplifiedZKP._hash(f"{commitment}{voter_list_hash}")
        
        response = SimplifiedZKP._hash(f"{voter_id}{challenge}{public_key}")
        
        proof = {
            "type": "voter_identity",
            "commitment": commitment,
            "challenge": challenge,
            "response": response,
            "public_key_hash": SimplifiedZKP._hash(public_key),
            "timestamp": datetime.now().isoformat()
        }
        
        return proof
    
    @staticmethod
    def verify_voter_identity_proof(proof: Dict[str, Any], voter_list_hash: str) -> bool:
        """
        验证选民身份零知识证明
        
        Args:
            proof: 证明信息
            voter_list_hash: 合法选民列表的哈希值
        
        Returns:
            验证结果
        """
        if proof.get("type") != "voter_identity":
            return False
        
        expected_challenge = SimplifiedZKP._hash(f"{proof['commitment']}{voter_list_hash}")
        
        return proof["challenge"] == expected_challenge
    
    @staticmethod
    def generate_ballot_validity_proof(choice_index: int, num_candidates: int,
                                       encrypted_ballot_hash: str) -> Dict[str, Any]:
        """
        生成选票有效性零知识证明
        证明选票是有效的 one-hot 编码，但不透露具体选择
        
        Args:
            choice_index: 选择的候选人索引
            num_candidates: 候选人数量
            encrypted_ballot_hash: 加密选票的哈希值
        
        Returns:
            包含证明信息的字典
        """
        commitment = SimplifiedZKP._hash(f"{choice_index}{num_candidates}{random.random()}")
        
        challenge = SimplifiedZKP._hash(f"{commitment}{encrypted_ballot_hash}")
        
        proof_value = 1 if 0 <= choice_index < num_candidates else 0
        
        response = SimplifiedZKP._hash(f"{proof_value}{challenge}{num_candidates}")
        
        proof = {
            "type": "ballot_validity",
            "commitment": commitment,
            "challenge": challenge,
            "response": response,
            "num_candidates": num_candidates,
            "proof_value_hash": SimplifiedZKP._hash(str(proof_value)),
            "timestamp": datetime.now().isoformat()
        }
        
        return proof
    
    @staticmethod
    def verify_ballot_validity_proof(proof: Dict[str, Any], 
                                     encrypted_ballot_hash: str) -> bool:
        """
        验证选票有效性零知识证明
        
        Args:
            proof: 证明信息
            encrypted_ballot_hash: 加密选票的哈希值
        
        Returns:
            验证结果
        """
        if proof.get("type") != "ballot_validity":
            return False
        
        expected_challenge = SimplifiedZKP._hash(f"{proof['commitment']}{encrypted_ballot_hash}")
        
        return proof["challenge"] == expected_challenge
    
    @staticmethod
    def generate_tally_correctness_proof(trustee_id: str, project_id: str,
                                        partial_decryption_hash: str) -> Dict[str, Any]:
        """
        生成计票正确性零知识证明
        证明受托人的解密操作是正确的，但不透露私钥
        
        Args:
            trustee_id: 受托人ID
            project_id: 投票项目ID
            partial_decryption_hash: 部分解密结果的哈希值
        
        Returns:
            包含证明信息的字典
        """
        commitment = SimplifiedZKP._hash(f"{trustee_id}{project_id}{random.random()}")
        
        challenge = SimplifiedZKP._hash(f"{commitment}{partial_decryption_hash}")
        
        response = SimplifiedZKP._hash(f"{trustee_id}{challenge}{project_id}")
        
        proof = {
            "type": "tally_correctness",
            "commitment": commitment,
            "challenge": challenge,
            "response": response,
            "trustee_id_hash": SimplifiedZKP._hash(trustee_id),
            "timestamp": datetime.now().isoformat()
        }
        
        return proof
    
    @staticmethod
    def verify_tally_correctness_proof(proof: Dict[str, Any], 
                                       partial_decryption_hash: str) -> bool:
        """
        验证计票正确性零知识证明
        
        Args:
            proof: 证明信息
            partial_decryption_hash: 部分解密结果的哈希值
        
        Returns:
            验证结果
        """
        if proof.get("type") != "tally_correctness":
            return False
        
        expected_challenge = SimplifiedZKP._hash(f"{proof['commitment']}{partial_decryption_hash}")
        
        return proof["challenge"] == expected_challenge


def test_zkp():
    """测试零知识证明模块"""
    print("=" * 60)
    print("零知识证明模块测试（简化版本）")
    print("=" * 60)
    
    print("\n[1] 测试选民身份零知识证明")
    voter_id = "voter001"
    public_key = "mock_public_key_data"
    voter_list_hash = SimplifiedZKP._hash("voter001,voter002,voter003")
    
    proof = SimplifiedZKP.generate_voter_identity_proof(voter_id, public_key, voter_list_hash)
    print(f"  ✓ 生成证明: {proof['type']}")
    print(f"  ✓ 承诺: {proof['commitment'][:20]}...")
    print(f"  ✓ 挑战: {proof['challenge'][:20]}...")
    
    is_valid = SimplifiedZKP.verify_voter_identity_proof(proof, voter_list_hash)
    if is_valid:
        print("  ✓ 选民身份证明验证成功")
    else:
        print("  ✗ 选民身份证明验证失败")
    
    print("\n[2] 测试选票有效性零知识证明")
    choice_index = 2
    num_candidates = 4
    encrypted_ballot_hash = SimplifiedZKP._hash("encrypted_ballot_data")
    
    proof = SimplifiedZKP.generate_ballot_validity_proof(
        choice_index, num_candidates, encrypted_ballot_hash
    )
    print(f"  ✓ 生成证明: {proof['type']}")
    print(f"  ✓ 候选人数量: {proof['num_candidates']}")
    
    is_valid = SimplifiedZKP.verify_ballot_validity_proof(proof, encrypted_ballot_hash)
    if is_valid:
        print("  ✓ 选票有效性证明验证成功")
    else:
        print("  ✗ 选票有效性证明验证失败")
    
    print("\n[3] 测试计票正确性零知识证明")
    trustee_id = "trustee001"
    project_id = "project001"
    partial_decryption_hash = SimplifiedZKP._hash("partial_decryption_data")
    
    proof = SimplifiedZKP.generate_tally_correctness_proof(
        trustee_id, project_id, partial_decryption_hash
    )
    print(f"  ✓ 生成证明: {proof['type']}")
    print(f"  ✓ 受托人哈希: {proof['trustee_id_hash'][:20]}...")
    
    is_valid = SimplifiedZKP.verify_tally_correctness_proof(proof, partial_decryption_hash)
    if is_valid:
        print("  ✓ 计票正确性证明验证成功")
    else:
        print("  ✗ 计票正确性证明验证失败")
    
    print("\n[4] 测试错误场景")
    wrong_voter_list_hash = SimplifiedZKP._hash("wrong_list")
    is_valid = SimplifiedZKP.verify_voter_identity_proof(proof, wrong_voter_list_hash)
    if not is_valid:
        print("  ✓ 正确识别错误的选民列表")
    else:
        print("  ✗ 未能识别错误的选民列表")
    
    print("\n" + "=" * 60)
    print("零知识证明模块测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_zkp()
