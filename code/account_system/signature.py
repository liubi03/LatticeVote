"""
数字签名模块
实现基于 RSA 的数字签名功能
"""

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature
import base64
from typing import Tuple, Optional


class DigitalSignature:
    """数字签名类"""
    
    def __init__(self, key_size: int = 2048):
        self.key_size = key_size
        self.private_key = None
        self.public_key = None
    
    def generate_key_pair(self) -> Tuple[str, str]:
        """生成 RSA 密钥对"""
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=self.key_size,
            backend=default_backend()
        )
        self.public_key = self.private_key.public_key()
        
        private_pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return private_pem.decode('utf-8'), public_pem.decode('utf-8')
    
    def load_private_key(self, private_key_pem: str):
        """加载私钥"""
        self.private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        self.public_key = self.private_key.public_key()
    
    def load_public_key(self, public_key_pem: str):
        """加载公钥"""
        self.public_key = serialization.load_pem_public_key(
            public_key_pem.encode('utf-8'),
            backend=default_backend()
        )
    
    def sign(self, message: str) -> str:
        """对消息进行签名"""
        if not self.private_key:
            raise ValueError("私钥未加载")
        
        signature = self.private_key.sign(
            message.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        
        return base64.b64encode(signature).decode('utf-8')
    
    def verify(self, message: str, signature: str) -> bool:
        """验证签名"""
        if not self.public_key:
            raise ValueError("公钥未加载")
        
        try:
            signature_bytes = base64.b64decode(signature.encode('utf-8'))
            
            self.public_key.verify(
                signature_bytes,
                message.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            return True
        except InvalidSignature:
            return False
    
    @staticmethod
    def serialize_key(key_pem: str) -> str:
        """序列化密钥（用于存储）"""
        return key_pem
    
    @staticmethod
    def deserialize_key(key_str: str) -> str:
        """反序列化密钥"""
        return key_str


def test_digital_signature():
    """测试数字签名模块"""
    print("=" * 60)
    print("数字签名模块测试")
    print("=" * 60)
    
    ds = DigitalSignature()
    
    print("\n[1] 生成密钥对")
    private_key, public_key = ds.generate_key_pair()
    print(f"  ✓ 私钥长度: {len(private_key)} 字节")
    print(f"  ✓ 公钥长度: {len(public_key)} 字节")
    
    print("\n[2] 测试签名")
    message = "这是一条测试消息"
    signature = ds.sign(message)
    print(f"  ✓ 消息: {message}")
    print(f"  ✓ 签名: {signature[:50]}...")
    
    print("\n[3] 测试签名验证（正确消息）")
    is_valid = ds.verify(message, signature)
    if is_valid:
        print("  ✓ 签名验证成功")
    else:
        print("  ✗ 签名验证失败")
    
    print("\n[4] 测试签名验证（错误消息）")
    wrong_message = "这是错误的消息"
    is_valid = ds.verify(wrong_message, signature)
    if not is_valid:
        print("  ✓ 正确识别错误消息")
    else:
        print("  ✗ 未能识别错误消息")
    
    print("\n[5] 测试加载密钥")
    ds2 = DigitalSignature()
    ds2.load_private_key(private_key)
    signature2 = ds2.sign(message)
    is_valid = ds2.verify(message, signature2)
    if is_valid:
        print("  ✓ 加载私钥后签名验证成功")
    else:
        print("  ✗ 加载私钥后签名验证失败")
    
    print("\n[6] 测试加载公钥")
    ds3 = DigitalSignature()
    ds3.load_public_key(public_key)
    is_valid = ds3.verify(message, signature)
    if is_valid:
        print("  ✓ 加载公钥后验证成功")
    else:
        print("  ✗ 加载公钥后验证失败")
    
    print("\n" + "=" * 60)
    print("数字签名模块测试完成")
    print("=" * 60)


if __name__ == "__main__":
    test_digital_signature()
