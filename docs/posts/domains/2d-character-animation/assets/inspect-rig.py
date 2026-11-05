"""从原始真乃 JSON 提取扭头证据；在本目录运行 python3 inspect-rig.py。"""
import json
from collections import Counter
from pathlib import Path

base = Path(__file__).resolve().parent
model = json.loads((base / 'mano/data.json').read_text(encoding='utf-8'))
face = model['skins']['default']['face']['face']
vertices = face['vertices']
vertex_count = len(face['uvs']) // 2
position = 0
influences = Counter()
for _ in range(vertex_count):
    count = int(vertices[position])
    position += 1
    for _ in range(count):
        index = int(vertices[position])
        influences[model['bones'][index]['name']] += 1
        position += 4
assert position == len(vertices), '加权网格数据长度不匹配'
constraints = [
    {key: constraint[key] for key in ['name', 'bones', 'target', 'translateMix']}
    for constraint in model['transform']
    if constraint['name'] in ['eyes', 'mouth', 'hair_F', 're']
]
evidence = {
    'source': 'mano/data.json',
    'spine': model['skeleton']['spine'],
    'bones': len(model['bones']),
    'animations': len(model['animations']),
    'no_animation': model['animations']['no'],
    'transform_constraints': constraints,
    'face_mesh': {
        'type': face['type'],
        'vertex_count': vertex_count,
        'bone_vertex_counts': dict(influences),
        'note': '统计某骨骼参与了多少个顶点，非权重百分比；同一顶点可受多个骨骼影响。',
    },
}
print(json.dumps(evidence, ensure_ascii=False, indent=2))
