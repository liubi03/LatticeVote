"""检查选票数据"""
import json
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, 'data')
ballot_file = os.path.join(data_dir, 'ballots_project_005.json')

with open(ballot_file, 'r') as f:
    data = json.load(f)

print(f'选票数量: {len(data["ballots"])}')
for i, b in enumerate(data['ballots']):
    print(f'选票 {i+1}: voter={b["voter_id"]}, choice={b["choice"]}')
