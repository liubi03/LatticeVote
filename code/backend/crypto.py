"""
LatticeVote 同态加密核心模块
基于 TenSEAL 库实现 BFV 同态加密方案
"""

import tenseal as ts
from typing import Union, List, Optional
import os
import pickle


class BFVContext:
    """
    BFV 同态加密上下文管理类
    提供密钥生成、加密、解密和同态运算功能
    """
    
    def __init__(self, poly_modulus_degree: int = 8192, plain_modulus: int = 1032193):
        """
        初始化 BFV 上下文并生成密钥对
        
        参数:
            poly_modulus_degree: 多项式模次数，影响安全性和性能
            plain_modulus: 明文模数，需满足特定条件
        """
        self.poly_modulus_degree = poly_modulus_degree
        self.plain_modulus = plain_modulus
        self.context = None
        self.public_key = None
        self.secret_key = None
        
        self._initialize_context()
    
    def _initialize_context(self):
        """
        初始化 TenSEAL BFV 上下文
        """
        try:
            self.context = ts.context(
                ts.SCHEME_TYPE.BFV,
                poly_modulus_degree=self.poly_modulus_degree,
                plain_modulus=self.plain_modulus
            )
            self.context.generate_galois_keys()
            self.secret_key = self.context.secret_key()
            self.public_key = self.context.public_key()
            print(f"BFV 上下文初始化成功:")
            print(f"  - 多项式模次数: {self.poly_modulus_degree}")
            print(f"  - 明文模数: {self.plain_modulus}")
        except Exception as e:
            raise RuntimeError(f"BFV 上下文初始化失败: {str(e)}")
    
    def encrypt_int(self, value: int) -> ts.BFVVector:
        """
        加密单个整数
        
        参数:
            value: 要加密的整数值
            
        返回:
            BFVVector 密文对象
        """
        if not isinstance(value, int):
            raise TypeError("输入必须是整数类型")
        
        try:
            ciphertext = ts.bfv_vector(self.context, [value])
            return ciphertext
        except Exception as e:
            raise RuntimeError(f"加密整数失败: {str(e)}")
    
    def encrypt_vector(self, vector: List[int]) -> ts.BFVVector:
        """
        加密整数向量
        
        参数:
            vector: 要加密的整数列表
            
        返回:
            BFVVector 密文对象
        """
        if not isinstance(vector, list):
            raise TypeError("输入必须是列表类型")
        
        if not all(isinstance(x, int) for x in vector):
            raise TypeError("向量中的所有元素必须是整数类型")
        
        try:
            ciphertext = ts.bfv_vector(self.context, vector)
            return ciphertext
        except Exception as e:
            raise RuntimeError(f"加密向量失败: {str(e)}")
    
    def homomorphic_add(self, ciphertext1: ts.BFVVector, 
                       ciphertext2: ts.BFVVector) -> ts.BFVVector:
        """
        对两个密文进行同态加法运算
        
        参数:
            ciphertext1: 第一个密文
            ciphertext2: 第二个密文
            
        返回:
            同态加法结果的密文
        """
        if not isinstance(ciphertext1, ts.BFVVector) or not isinstance(ciphertext2, ts.BFVVector):
            raise TypeError("输入必须是 BFVVector 类型")
        
        try:
            result = ciphertext1 + ciphertext2
            return result
        except Exception as e:
            raise RuntimeError(f"同态加法运算失败: {str(e)}")
    
    def decrypt(self, ciphertext: ts.BFVVector) -> List[int]:
        """
        解密密文得到明文
        
        参数:
            ciphertext: 要解密的密文
            
        返回:
            解密后的明文列表
        """
        if not isinstance(ciphertext, ts.BFVVector):
            raise TypeError("输入必须是 BFVVector 类型")
        
        try:
            plaintext = ciphertext.decrypt()
            return plaintext
        except Exception as e:
            raise RuntimeError(f"解密失败: {str(e)}")
    
    def save_context(self, path: str):
        """
        保存上下文和密钥到文件
        
        参数:
            path: 保存路径（不含扩展名）
        """
        try:
            os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
            
            context_data = {
                'poly_modulus_degree': self.poly_modulus_degree,
                'plain_modulus': self.plain_modulus,
                'context_bytes': self.context.serialize(save_secret_key=True)
            }
            
            with open(path, 'wb') as f:
                pickle.dump(context_data, f)
            
            print(f"上下文已保存至: {path}")
        except Exception as e:
            raise RuntimeError(f"保存上下文失败: {str(e)}")
    
    @staticmethod
    def load_context(path: str) -> 'BFVContext':
        """
        从文件加载上下文和密钥
        
        参数:
            path: 文件路径
            
        返回:
            BFVContext 实例
        """
        try:
            with open(path, 'rb') as f:
                context_data = pickle.load(f)
            
            bfv_ctx = BFVContext.__new__(BFVContext)
            bfv_ctx.poly_modulus_degree = context_data['poly_modulus_degree']
            bfv_ctx.plain_modulus = context_data['plain_modulus']
            bfv_ctx.context = ts.context_from(context_data['context_bytes'])
            bfv_ctx.secret_key = bfv_ctx.context.secret_key()
            bfv_ctx.public_key = bfv_ctx.context.public_key()
            
            print(f"上下文已从 {path} 加载成功")
            return bfv_ctx
        except Exception as e:
            raise RuntimeError(f"加载上下文失败: {str(e)}")


def run_test():
    """
    运行测试示例，演示同态加密的核心功能
    """
    print("=" * 60)
    print("LatticeVote 同态加密模块测试")
    print("=" * 60)
    
    print("\n[1] 初始化 BFV 上下文")
    bfv = BFVContext(poly_modulus_degree=8192, plain_modulus=1032193)
    
    print("\n[2] 测试单整数加密和解密")
    value = 42
    print(f"  原始值: {value}")
    ciphertext = bfv.encrypt_int(value)
    print(f"  加密成功，密文类型: {type(ciphertext).__name__}")
    decrypted = bfv.decrypt(ciphertext)
    print(f"  解密结果: {decrypted[0]}")
    assert decrypted[0] == value, "单整数加密解密测试失败"
    print("  [PASS] 单整数加密解密测试通过")
    
    print("\n[3] 测试向量加密和解密")
    vector = [1, 2, 3, 4, 5]
    print(f"  原始向量: {vector}")
    ciphertext_vec = bfv.encrypt_vector(vector)
    print(f"  加密成功，密文类型: {type(ciphertext_vec).__name__}")
    decrypted_vec = bfv.decrypt(ciphertext_vec)
    print(f"  解密结果: {decrypted_vec}")
    assert decrypted_vec == vector, "向量加密解密测试失败"
    print("  [PASS] 向量加密解密测试通过")
    
    print("\n[4] 测试同态加法运算")
    a = 15
    b = 27
    print(f"  数值 A: {a}, 数值 B: {b}")
    ct_a = bfv.encrypt_int(a)
    ct_b = bfv.encrypt_int(b)
    ct_sum = bfv.homomorphic_add(ct_a, ct_b)
    result = bfv.decrypt(ct_sum)
    print(f"  同态加法结果: {result[0]} (期望: {a + b})")
    assert result[0] == a + b, "同态加法测试失败"
    print("  [PASS] 同态加法测试通过")
    
    print("\n[5] 测试向量同态加法")
    vec_a = [10, 20, 30]
    vec_b = [5, 15, 25]
    print(f"  向量 A: {vec_a}")
    print(f"  向量 B: {vec_b}")
    ct_vec_a = bfv.encrypt_vector(vec_a)
    ct_vec_b = bfv.encrypt_vector(vec_b)
    ct_vec_sum = bfv.homomorphic_add(ct_vec_a, ct_vec_b)
    result_vec = bfv.decrypt(ct_vec_sum)
    expected = [a + b for a, b in zip(vec_a, vec_b)]
    print(f"  同态加法结果: {result_vec}")
    print(f"  期望结果: {expected}")
    assert result_vec == expected, "向量同态加法测试失败"
    print("  [PASS] 向量同态加法测试通过")
    
    print("\n[6] 测试上下文序列化和反序列化")
    save_path = "test_context.bin"
    bfv.save_context(save_path)
    loaded_bfv = BFVContext.load_context(save_path)
    test_value = 100
    ct_loaded = loaded_bfv.encrypt_int(test_value)
    result_loaded = loaded_bfv.decrypt(ct_loaded)
    print(f"  加载后加密解密测试: {result_loaded[0]}")
    assert result_loaded[0] == test_value, "序列化测试失败"
    print("  [PASS] 序列化和反序列化测试通过")
    
    if os.path.exists(save_path):
        os.remove(save_path)
        print(f"  清理测试文件: {save_path}")
    
    print("\n" + "=" * 60)
    print("所有测试通过！同态加密模块工作正常。")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    run_test()
