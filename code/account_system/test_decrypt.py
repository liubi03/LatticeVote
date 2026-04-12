"""测试选票解密"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import crypto
import tenseal as ts
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
context_path = os.path.join(current_dir, 'data', 'crypto_project_005')
bfv = crypto.BFVContext.load_context(context_path)

with open(os.path.join(current_dir, 'data', 'ballots_project_005.json'), 'r') as f:
    data = json.load(f)

ballots = data['ballots']
print(f'共有 {len(ballots)} 张选票')

print('\n解密每张选票:')
for i, ballot in enumerate(ballots):
    encrypted_bytes = bytes.fromhex(ballot['encrypted_choice'])
    encrypted_vector = ts.bfv_vector_from(bfv.context, encrypted_bytes)
    decrypted = bfv.decrypt(encrypted_vector)
    voter_id = ballot['voter_id']
    choice = ballot['choice']
    print(f'  选票 {i+1} ({voter_id}): choice={choice}, 解密结果前2个: {decrypted[:2]}')

print('\n同态加法...')
aggregated = None
for i, ballot in enumerate(ballots):
    encrypted_bytes = bytes.fromhex(ballot['encrypted_choice'])
    encrypted_vector = ts.bfv_vector_from(bfv.context, encrypted_bytes)
    if aggregated is None:
        aggregated = encrypted_vector
    else:
        aggregated = aggregated + encrypted_vector

result = bfv.decrypt(aggregated)
print(f'累加结果前5个: {result[:5]}')

plain_modulus = bfv.plain_modulus
print(f'plain_modulus: {plain_modulus}')

final_result = []
for r in result[:2]:
    if r < 0:
        r = r + plain_modulus
    final_result.append(r)
print(f'处理后结果: {final_result}')
print(f'预期结果: [2, 3] (萝卜2票, 纸巾3票)')
