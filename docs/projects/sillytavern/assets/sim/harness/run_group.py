"""群聊实跑：塞拉菲娜（译本）+ 洛恩（构造），Natural 调度、Swap 拼卡（出厂默认），两轮。

generateGroupWrapper（group-chats.js:945-1091）的流程：先用调度函数选出这轮发言的人，再逐个切换当前角色、调一次普通的 Generate；
用户这句只在第一个人生成时进聊天。这里照这个顺序调；调度用带种子的随机数，可复现。
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stlab import Lab, send

OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out/group'
M = '/data2/work/lht/study/26.06/_ext/st-lab/out/material/'
os.makedirs(OUT, exist_ok=True)
CONNECTION = {'chat_completion_source': 'deepseek', 'deepseek_model': 'deepseek-flash', 'stream_openai': False}

lab = Lab()
sera = json.load(open(M + 'seraphina.zh.json')); sera['avatar'] = 'seraphina.png'
lorne = json.load(open(M + 'lorne.constructed.json')); lorne['avatar'] = 'lorne.png'
book = json.load(open(M + 'eldoria.zh.json'))
GROUP = {'id': '1', 'name': '林间空地', 'members': ['seraphina.png', 'lorne.png'], 'activation_strategy': 0, 'generation_mode': 0,
         'disabled_members': [], 'allow_self_responses': False, 'chat_id': '林间空地 - 实跑', 'chats': ['林间空地 - 实跑']}

lab.call('init', card=sera, books={'埃尔多利亚': book}, name1='旅人', oaiPatch=CONNECTION)
# 新开的群聊：每个成员按顺序发一条开场白（group-chats.js:281-301 → getFirstCharacterMessage 572-608）
lab.eval('''
const seedrandom = (await import('seedrandom')).default;
L.setGroup(args.cards, args.group);
L.S.__set('chat', []);
Math.random = seedrandom('group-greeting');
for (const member of args.group.members) {
    const character = L.S.characters.find(x => x.avatar === member);
    const mes = await L.G.getFirstCharacterMessage(character);
    if (mes?.mes) L.S.chat.push(mes);
}
''', cards=[sera, lorne], group=GROUP)
json.dump(lab.call('snapshot'), open(f'{OUT}/g-00-greetings.json', 'w'), ensure_ascii=False, indent=1)

usage = []


def group_round(tag, text, seed):
    act = lab.eval('''
const seedrandom = (await import('seedrandom')).default;
Math.random = seedrandom(args.seed);
const g = L.G.groups[0];
const lastMessage = L.S.chat[L.S.chat.length - 1];
const enabled = g.members.filter(x => !g.disabled_members.includes(x));
const ids = L.G.activateNaturalOrder(enabled, args.text, lastMessage, g.allow_self_responses, true);
L.G.__setGroupGenId(Date.now());   // group-chats.js:992 group_generation_id = Date.now()
return ids.map(i => ({ id: i, name: L.S.characters[i].name }));
''', text=text, seed=seed)
    print(f'== {tag} activated:', [a['name'] for a in act])
    first = True
    for a in act:
        lab.eval('L.setCharacter(args.id);', id=a['id'])
        g = lab.call('generate', type='normal', text=text if first else '')
        first = False
        log = []
        resp, sec = send(g['deepseek'], log)
        rec = lab.call('receive', type='normal', data=resp)
        usage.append({'step': f'{tag}-{a["name"]}', 'seconds': sec, 'usage': resp.get('usage')})
        json.dump({'user': text, 'activated': act, 'speaker': a['name'], 'generate': g, 'response': resp, 'received': rec},
                  open(f'{OUT}/g-{tag}-{a["name"]}.json', 'w'), ensure_ascii=False, indent=1)
        print(f'  [{a["name"]}] {sec}s finish={resp["choices"][0]["finish_reason"]}')
        print('  ', (rec.get('getMessage') or '')[:300])
    json.dump(lab.call('snapshot'), open(f'{OUT}/g-{tag}-chat.json', 'w'), ensure_ascii=False, indent=1)


group_round('r1', '你们两位认识很久了吗？', 'group-r1-1')   # 种子挑过：让第一轮两人都开口
group_round('r2', '洛恩，你守在森林边上，见过影牙吗？', 'group-r2')
json.dump(usage, open(f'{OUT}/usage.json', 'w'), ensure_ascii=False, indent=1)
lab.close()
