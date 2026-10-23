"""扮演主线：中文版塞拉菲娜，4 轮，中间做一次 swipe、一次 continue、一次 impersonate，最后用摘要扩展的提示词跑一次摘要。

每一步存三样：酒馆拼出的中间产物（世界书结果、注入表、每条消息的 token 数、发往服务端的 generate_data）、
服务端发给 DeepSeek 的请求体、DeepSeek 的回包。全部拼接都在 server.mjs 里调酒馆的函数，本进程只发请求。
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stlab import Lab, send

OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out/main'
M = '/data2/work/lht/study/26.06/_ext/st-lab/out/material/'
os.makedirs(OUT, exist_ok=True)

CONNECTION = {  # 用户在连接面板上改的：换成 DeepSeek、关流式；其余全是出厂设置
    'chat_completion_source': 'deepseek',
    'deepseek_model': 'deepseek-flash',
    'stream_openai': False,
}

lab = Lab()
card = json.load(open(M + 'seraphina.zh.json'))
book = json.load(open(M + 'eldoria.zh.json'))
lab.call('init', card=card, books={'埃尔多利亚': book}, name1='旅人', oaiPatch=CONNECTION)
json.dump(lab.call('snapshot'), open(f'{OUT}/00-init.json', 'w'), ensure_ascii=False, indent=1)

usage = []


def step(tag, type_, text=''):
    g = lab.call('generate', type=type_, text=text)
    log = []
    resp, sec = send(g['deepseek'], log)
    rec = lab.call('receive', type=type_, data=resp, continueMag=g.get('continueMag', ''))
    usage.append({'step': tag, 'type': type_, 'seconds': sec, 'usage': resp.get('usage')})
    json.dump({'user': text, 'generate': g, 'response': resp, 'received': rec}, open(f'{OUT}/{tag}.json', 'w'), ensure_ascii=False, indent=1)
    snap = lab.call('snapshot')
    json.dump(snap, open(f'{OUT}/{tag}-chat.json', 'w'), ensure_ascii=False, indent=1)
    msg = resp['choices'][0]['message']
    print(f'== {tag} [{type_}] {sec}s finish={resp["choices"][0]["finish_reason"]} usage={resp.get("usage", {}).get("completion_tokens")}')
    print('WI:', [a['comment'] for a in g['wi']['activated']])
    print((rec.get('getMessage') or '')[:400])
    return g, resp, rec


step('r1', 'normal', '*我撑起身子，接过茶杯* 谢谢你……这片森林里到底有什么怪物？')
step('r2', 'normal', '你的魔法真厉害。我的伤要多久才能好？我还得赶去北边的镇子。')

# swipe：右滑到头生成新候选。界面上的 swipe()（script.js:9954 起）对数据只做三步：syncMesToSwipe 把当前候选写回
# swipes（10340）；swipe_id 指到新槽位（10396-10400）；clearMessageData 清掉消息上的附加数据（10411、10134-10150）。
# 然后 Generate('swipe')。这里照这三步改数据，syncMesToSwipe 是原样切出的。
lab.eval('''
const chat = L.S.chat; const mesId = chat.length - 1; const m = chat[mesId];
L.S.syncMesToSwipe(mesId);
m.swipe_id = m.swipes.length;
for (const k of ['memory', 'display_text', 'media', 'inline_image', 'files', 'fileLength', 'generationType', 'negative', 'title', 'append_title']) delete m.extra?.[k];
delete m.gen_started; delete m.gen_finished;
''')
step('r2-swipe', 'swipe')

step('r3', 'normal', '你一个人守在这里多久了？给我讲讲你是怎么成为森林守护者的吧。')
step('r3-continue', 'continue')
g, resp, rec = step('r4-impersonate', 'impersonate')
step('r4', 'normal', rec['getMessage'])
step('r4-continue', 'continue')     # r4 顶到了 300 token 的回复上限，点「继续」
step('r5', 'normal', '……谢谢你愿意跟我说这些。等伤好了，我想陪你去点亮更多的灯。')

json.dump(lab.call('stubHits'), open(f'{OUT}/stub-hits.json', 'w'), ensure_ascii=False, indent=1)
json.dump(usage, open(f'{OUT}/usage.json', 'w'), ensure_ascii=False, indent=1)
lab.close()
