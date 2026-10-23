"""把实跑输出打包进 wiki：原始记录压成几份 JSON，正文的「效果」块生成成 txt。只做截取和排版，不改内容。"""
import json, os, shutil, glob

OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out'
HARNESS = os.path.dirname(os.path.abspath(__file__))
DST = '/data2/work/lht/study/26.06/zensical-wiki/docs/projects/sillytavern/assets/sim'
TXT = f'{DST}/txt'
REC = f'{DST}/out'
for d in (TXT, REC, f'{DST}/harness', f'{DST}/material'):
    os.makedirs(d, exist_ok=True)

j = lambda p: json.load(open(f'{OUT}/{p}'))
def w(name, text):
    open(f'{TXT}/{name}.txt', 'w').write(text.rstrip('\n') + '\n')
def cut(s, n):
    s = s.replace('\r\n', '\n')
    return s if len(s) <= n else s[:n] + '……'
def one(s, n):
    return cut(s.replace('\n', '⏎'), n)

# ---------------- 原始记录 ----------------
def record(path_glob_order, tag_of):
    recs = []
    for p in path_glob_order:
        d = json.load(open(p))
        g = d['generate']
        msg = d['response']['choices'][0]['message']
        recs.append({
            'step': tag_of(p), 'type': g['type'], 'user': d.get('user', ''),
            'speaker': d.get('speaker'),
            'worldInfoActivated': [a['comment'] for a in g['wi']['activated']],
            'request': g['deepseek'],
            'response': {'finish_reason': d['response']['choices'][0]['finish_reason'], 'reasoning_content': msg.get('reasoning_content'), 'content': msg.get('content'), 'usage': d['response'].get('usage')},
            'saved': (d['received'].get('message') or {}).get('mes', d['received'].get('getMessage')),
        })
    return recs

main_steps = ['r1', 'r2', 'r2-swipe', 'r3', 'r3-continue', 'r4-impersonate', 'r4', 'r4-continue', 'r5']
recs = record([f'{OUT}/main/{s}.json' for s in main_steps], lambda p: os.path.basename(p)[:-5])
for s in ['summary-factory', 'summary']:
    d = j(f'main/{s}.json')
    msg = d['response']['choices'][0]['message']
    recs.append({'step': s, 'type': 'quiet', 'overrideResponseLength': d['overrideResponseLength'], 'request': d['generate']['deepseek'],
                 'response': {'finish_reason': d['response']['choices'][0]['finish_reason'], 'reasoning_content': msg.get('reasoning_content'), 'content': msg.get('content'), 'usage': d['response'].get('usage')},
                 'summary': d['summary']})
json.dump([r for r in recs if r['type'] != 'quiet'], open(f'{REC}/main-record.json', 'w'), ensure_ascii=False, indent=1)
json.dump([r for r in recs if r['type'] == 'quiet'], open(f'{REC}/summary-record.json', 'w'), ensure_ascii=False, indent=1)
gfiles = sorted(glob.glob(f'{OUT}/group/g-r*-*.json'))
gfiles = [p for p in gfiles if not p.endswith('-chat.json')]
json.dump(record(gfiles, lambda p: os.path.basename(p)[2:-5]), open(f'{REC}/group-record.json', 'w'), ensure_ascii=False, indent=1)
for sub in ['lorebook', 'adapt', 'rules']:
    for p in glob.glob(f'{OUT}/{sub}/*.json'):
        shutil.copy(p, f'{REC}/{sub}-{os.path.basename(p)}')
for name in ['card-png', 'card-slots', 'card-greetings', 'persona', 'macros', 'order', 'injections', 'budget']:
    shutil.copy(f'{OUT}/assembly/{name}.json', f'{REC}/assembly-{name}.json')
for name in ['swipe', 'edit', 'branch']:
    shutil.copy(f'{OUT}/branch/{name}.json', f'{REC}/branch-{name}.json')
shutil.copy(f'{OUT}/branch/branch.jsonl', f'{REC}/branch-branch.jsonl')
shutil.copy(f'{OUT}/branch/data/chats/seraphina/塞拉菲娜 - 实跑.jsonl', f'{REC}/branch-parent.jsonl')
for name in ['scheduler', 'join']:
    shutil.copy(f'{OUT}/group/{name}.json', f'{REC}/group-{name}.json')
for name in ['usage', 'stub-hits']:
    shutil.copy(f'{OUT}/main/{name}.json', f'{REC}/main-{name}.json')
shutil.copy(f'{OUT}/group/usage.json', f'{REC}/group-usage.json')
# 素材
for p in glob.glob(f'{OUT}/material/*.json'):
    shutil.copy(p, f'{DST}/material/')
shutil.copy(f'{OUT}/assembly/card-full.zh.json', f'{DST}/material/seraphina-full.constructed.json')
shutil.copy(f'{OUT}/assembly/seraphina.zh.png', f'{DST}/material/seraphina.zh.png')
# 手写的实跑脚本（生成的桩不存，make-stubs.mjs 能重新生成）
for f in ['hooks.mjs', 'shims.mjs', 'quiet.mjs', 'register.mjs', 'extract.mjs', 'make-stubs.mjs', 'lib.mjs', 'server.mjs', 'stlab.py',
          'run_main.py', 'run_memory.py', 'run_group.py', 'run_all.sh', 'exp_lorebook.mjs', 'exp_card_assembly.mjs', 'exp_adapt.mjs',
          'exp_branch.mjs', 'exp_group.mjs', 'exp_rules.mjs', 'real.txt', 'package.json', 'pack.py']:
    shutil.copy(f'{HARNESS}/{f}', f'{DST}/harness/{f}')
shutil.copy(f'{HARNESS}/material/translate.py', f'{DST}/harness/translate.py')
for p in ['stubs/public/lib.js.mjs', 'stubs/public/scripts/extensions.js.mjs', 'stubs/public/scripts/personas.js.mjs',
          'stubs/public/scripts/RossAscends-mods.js.mjs', 'stubs/public/scripts/tool-calling.js.mjs', 'stubs/public/scripts/i18n.js.mjs',
          'stubs/public/scripts/util/AccountStorage.js.mjs', 'stubs/public/scripts/macros/engine/MacroDiagnostics.js.mjs', 'stubs/src/util.js.mjs']:
    os.makedirs(os.path.dirname(f'{DST}/harness/{p}'), exist_ok=True)
    shutil.copy(f'{HARNESS}/{p}', f'{DST}/harness/{p}')

# ---------------- 效果块 ----------------
def ledger_lines(rows, n=40, tokens=True):
    out = []
    for x in rows:
        t = f"{x.get('tokens', ''):>4}  " if tokens else ''
        out.append(f"{t}{x.get('identifier', ''):<22} {x['role']:<9} {one(x['content'], n) if x['content'] else '（空）'}")
    return '\n'.join(out)

# 第 1 条线：角色卡
d = j('assembly/card-png.json')
lines = []
for c in d['chunks']:
    if c['name'] == 'tEXt':
        lines.append(f"tEXt  keyword={c['keyword']:<5}  base64 {c['base64Chars']} 字符  → spec={c['spec']} {c['spec_version']}，name={c['name_in_card']}")
    else:
        lines.append(f"{c['name']}  {c['bytes']} 字节")
lines.append(f"\n读回：spec={d['readBack']['spec']}，name={d['readBack']['name']}\n字段：{', '.join(d['readBack']['fields'])}")
w('card-png', '\n'.join(lines))
w('card-slots', ledger_lines(j('assembly/card-slots.json')['ledger'], 46))
g = j('assembly/card-greetings.json')
w('card-greetings', f"swipe_id = {g['swipe_id']}\n" + '\n'.join(f"swipes[{i}] = {one(s, 70)}" for i, s in enumerate(g['swipes'])))
w('card-original', j('assembly/card-slots.json')['ledger'][0]['content'])
p = j('assembly/persona.json')
w('persona', '\n\n'.join(f"== 位置 {k}\n" + '\n'.join(f"{x.get('identifier', ''):<22} {x['role']:<9} {one(x['content'], 40) if x['content'] else '（空）'}" for x in v if x.get('identifier', '') in ('personaDescription', 'charDescription') or x.get('identifier', '').startswith('chatHistory')) for k, v in p.items()))
m = j('assembly/macros.json')
ml = [f"{{{{char}}}} 对 {{{{user}}}} 说话  →  {m['names']}", '', '同一局，各算 4 次：']
for k, v in m['sameChat'].items():
    ml.append(f"  {{{{{k}::金发::红发::银发}}}}  →  {' '.join(v)}")
ml.append('')
ml.append('换三局，各算 3 次：')
for chatname, vv in m['otherChat'].items():
    ml.append(f"  {chatname}：random → {' '.join(vv['random'])}；pick → {' '.join(vv['pick'])}")
w('macros', '\n'.join(ml))

# 第 2 条线：世界书
A = j('lorebook/A-real-r1.json')
keep = lambda l: any(k in l for k in ['START WI SCAN', 'Context size', 'LOOP #', 'activated by', 'activation successful', 'Successfully activated', 'new entries for recursion', 'No new entries', 'Hypothetically', 'suppressed', 'budget of', 'Stopping', 'DONE'])
w('lb-scan-text', '\n'.join(f"[{i}] {one(t, 90)}" for i, t in enumerate(A['scanText'])))
w('lb-real-trace', '\n'.join(l for l in A['recursiveOn']['trace'] if keep(l)))
w('lb-real-norecursion', f"关掉递归后激活：{'、'.join(A['recursiveOff']['activated'])}\n打开递归（出厂）激活：{'、'.join(A['recursiveOn']['activated'])}")
B = j('lorebook/B-secondary.json')
logic = {0: 'AND_ANY（次关键词任一命中）', 2: 'NOT_ANY（次关键词全都没命中）'}
bl = [f"条目「{e['comment']}」：主关键词 {e['key']}，次关键词 {e['keysecondary']}，{logic[e['selectiveLogic']]}" for e in B['entries']] + ['']
bl += [f"「{t}」→ 激活：{'、'.join(v['activated']) or '（无）'}" for t, v in B['runs'].items()]
w('lb-secondary', '\n'.join(bl))
C = j('lorebook/C-recursion.json')
cl = []
for t, v in C['runs'].items():
    cl.append(f"== {t}  →  激活：{'、'.join(v['activated']) or '（无）'}")
    cl += ['   ' + l for l in v['trace'] if keep(l) and 'Context size' not in l and 'START' not in l and 'Hypothetically' not in l and 'DONE' not in l]
w('lb-recursion', '\n'.join(cl))
D = j('lorebook/D-budget.json')
w('lb-budget', '\n\n'.join(f"== 世界书预算 {k}  →  激活：{'、'.join(v['activated'])}\n" + '\n'.join('   ' + l for l in v['trace'] if 'LOOP #' not in l) for k, v in D.items()))
E = j('lorebook/E-group.json')
w('lb-group', f"互斥组「天气」权重：晴 60 / 雨 30 / 雾 10；「偶遇商队」概率 30%\n" + '\n'.join(f"{r['seed']:>6}  →  {'、'.join(r['activated'])}" for r in E['runs']))
F = j('lorebook/F-timed.json')
fl = ['条目「地牢规则」：关键词「地牢」，sticky 2，cooldown 3；条目「伏兵」：关键词「走廊」，delay 6', '扫描深度 2（看最近两条）', '']
for s in F['steps']:
    sticky = s['timed'].get('sticky', {}).get('演示·定时.0')
    cool = s['timed'].get('cooldown', {}).get('演示·定时.0')
    st = f"sticky {sticky['start']}→{sticky['end']}" if sticky else 'sticky —'
    co = f"cooldown {cool['start']}→{cool['end']}{'（保护）' if cool.get('protected') else ''}" if cool else 'cooldown —'
    fl.append(f"第 {s['chatLength']} 条「{s['last']}」  激活：{'、'.join(s['activated']) or '（无）'}   [{st}；{co}]")
w('lb-timed', '\n'.join(fl))
sw = F['swipe']
w('lb-timed-swipe', '第 1 条之后：' + json.dumps(sw['first']['timed'], ensure_ascii=False) + '\n同样长度再扫一次（swipe / regenerate，聊天没有前进）：\n' + '\n'.join('   ' + l for l in sw['again']['trace']))
G = j('lorebook/G-positions.json')
w('lb-positions', ledger_lines(G['ledger'], 40, tokens=False))

# 第 3 条线：每轮现拼
r1 = j('main/r1.json')['generate']
w('as-r1-ledger', ledger_lines(r1['ledger'], 40))
rows = []
for s in main_steps:
    gg = j(f'main/{s}.json')['generate']
    wib = next((x['tokens'] for x in gg['ledger'] if x.get('identifier', '') == 'worldInfoBefore'), 0)
    hist = sum(1 for x in gg['ledger'] if x.get('identifier', '').startswith('chatHistory'))
    total = sum(x['tokens'] or 0 for x in gg['ledger'])
    rows.append(f"{s:<16} 世界书 {wib:>4} token（{'、'.join(a['comment'] for a in gg['wi']['activated']) or '无'}）  历史 {hist:>2} 条  合计 {total:>4} token")
w('as-rounds', '\n'.join(rows))
O = j('assembly/order.json')
w('as-order', f"出厂顺序（Default 预设，全局 100001）：\n  {' → '.join(O['defaultOrder'])}\n\n" + '\n\n'.join(f"== 「写作规则」{k}\n" + '\n'.join(f"  {x.get('identifier', ''):<22} {x['role']:<9} {one(x['content'], 30) if x['content'] else '（空）'}" for x in v) for k, v in O['runs'].items()))
I = j('assembly/injections.json')
w('as-injections', ledger_lines([x for x in I['ledger'] if x.get('identifier', '').startswith('chatHistory') or x.get('identifier', '') == 'jailbreak'], 60, tokens=False))
w('as-injection-table', '\n'.join(f"{k:<20} 位置={v['position']} 深度={v['depth']} 角色={v['role']}  {one(v['value'], 40)}" for k, v in sorted(I['extensionPrompts'].items()) if v['value']))
Bu = j('assembly/budget.json')
bl = []
for ctx in ['4095', '2048', '1400']:
    v = Bu[ctx]
    kept = [x.get('identifier', '') for x in v['rows'] if (x['tokens'] or 0) > 0]
    ex = sum(1 for k in kept if k.startswith('dialogueExamples'))
    hist = [k for k in kept if k.startswith('chatHistory')]
    bl.append(f"上下文 {ctx}（可用 {v['budget']}）：合计 {v['total']} token，示范对话 {ex} 段，进上下文的聊天消息 {v['messagesInContext']}/{v['chatLength']} 条")
    bl.append('   ' + ' '.join(f"{x.get('identifier', '').replace('chatHistory-', 'h').replace('dialogueExamples ', 'ex')}:{x['tokens']}" for x in v['rows'] if (x['tokens'] or 0) > 0))
w('as-budget', '\n'.join(bl))

# 第 4 条线：喂各种模型
P = j('adapt/postprocess.json')
pl = []
for k in ['input', 'none', 'merge', 'semi', 'strict', 'single']:
    pl.append(f"{k:<7} " + ' | '.join(f"{m['role']}:{one(m['content'], 10)}" for m in P[k]))
w('ad-postprocess', '\n'.join(pl))
PR = j('adapt/providers.json')
cl_ = PR['claude']
w('ad-claude', 'system（' + str(len(cl_['systemPrompt'])) + ' 块）：\n' + '\n'.join(f"  - {one(b['text'], 50)}" for b in cl_['systemPrompt']) + '\nmessages：\n' + '\n'.join(f"  {m['role']:<9} " + ' / '.join(one(c.get('text', ''), 40) for c in m['content']) for m in cl_['messages']))
ge = PR['gemini']
w('ad-gemini', 'system_instruction（' + str(len(ge['system_instruction']['parts'])) + ' 段）：\n' + '\n'.join(f"  - {one(p_['text'], 50)}" for p_ in ge['system_instruction']['parts']) + '\ncontents：\n' + '\n'.join(f"  {c['role']:<6} {one(c['parts'][0].get('text', ''), 50)}" for c in ge['contents']))
CO = j('adapt/continue.json')
w('ad-continue', '\n\n'.join(f"== {k}\n前端拼好的最后三条：\n" + '\n'.join(f"  {m['role']:<9} {one(m['content'], 50)}" for m in v['frontend']) + '\n发给 DeepSeek 的最后三条：\n' + '\n'.join(f"  {m['role']:<9}{' prefix=true' if m.get('prefix') else ''} {one(m['content'], 50)}" for m in v['deepseek']) for k, v in CO.items()))
r4 = j('main/r4.json'); r4c = j('main/r4-continue.json')
a = r4['received']['message']['mes']; b = r4c['received']['message']['mes']
w('ad-r4-continue', f"r4 回包 finish_reason = {r4['response']['choices'][0]['finish_reason']}，回复截在：\n  ……{a[-50:]}\n\ncontinue 之后，同一条消息变成：\n  ……{b[len(a)-50:len(a)]}【接缝】{cut(b[len(a):], 160)}")
imp = j('main/r4-impersonate.json')
w('ad-impersonate', '发给 DeepSeek 的最后两条：\n' + '\n'.join(f"  {m['role']:<9} {one(m['content'], 120)}" for m in imp['generate']['deepseek']['body']['messages'][-2:]) + f"\n\n回包（写回输入框，不进聊天）：\n  {one(imp['received']['getMessage'], 200)}")
TC = j('adapt/textcompletion.json')
def tc_item(x):
    head, rest = x.split('\n', 1)
    body, tail = (rest[:rest.rfind('<|im_end|>')], rest[rest.rfind('<|im_end|>'):]) if '<|im_end|>' in rest else (rest, '')
    return head + '\n' + cut(body, 36) + tail
w('ad-tc', tc_item(TC['storyWrapped']) + '……（中间几条聊天，格式同下）\n' + ''.join(tc_item(x) for x in TC['history'][-2:]) + TC['lastLine'] + '\n停止串：' + json.dumps(TC['stops'], ensure_ascii=False))
w('ad-r1-request', 'POST ' + r1['deepseek']['url'] + '\n' + json.dumps({k: v for k, v in r1['deepseek']['body'].items() if k != 'messages'}, ensure_ascii=False) + '\nmessages：\n' + '\n'.join(f"  {m['role']:<9} {len(m['content']):>5} 字  {one(m['content'], 40)}" for m in r1['deepseek']['body']['messages']))

# 第 5 条线：重来、分叉
S = j('branch/swipe.json')
w('br-swipe', f"第 4 条消息：swipe_id = {S['message4']['swipe_id']}\n" + '\n'.join(f"  swipes[{i}] = {s}……" for i, s in enumerate(S['message4']['swipes'])) + f"\n  mes = {S['message4']['mes']}……\n\n下一轮（r3）发出的 prompt 里：swipes[0] {'在' if S['nextRoundHasSwipe0'] else '不在'}，swipes[1] {'在' if S['nextRoundHasSwipe1'] else '不在'}")
Ed = j('branch/edit.json')
w('br-edit', f"mes = {Ed['mes']}……\nswipes[swipe_id] 同步改了：{Ed['swipeSynced']}\nchat_metadata.tainted = {Ed['tainted']}\n下一轮 prompt 里有「怕光」：{Ed['inPrompt']}")
d6 = j('main/r6-dry.json'); d6h = j('main/r6-hide-dry.json')
hcount = lambda g_: sum(1 for x in g_['ledger'] if x.get('identifier', '').startswith('chatHistory'))
w('br-hide', f"隐藏前：聊天历史 {hcount(d6)} 条进 prompt\n/hide 0-4 之后：{hcount(d6h)} 条，第一条是「{one(next(x['content'] for x in d6h['ledger'] if x.get('identifier', '') == 'chatHistory-1'), 30)}」")
Br = j('branch/branch.json')
w('br-branch', f"目录里：{'、'.join(Br['files'])}\n父聊天 {Br['parentLines']} 行，分支 {Br['branchLines']} 行（第一行是文件头）\n\n分支的文件头：\n{json.dumps(Br['branchHeader'], ensure_ascii=False, indent=1)}\n\n分支第 4 条：{Br['branchMessage4']}……\n父聊天第 4 条：{Br['parentMessage4']}……\n父聊天第 4 条的 extra.branches = {json.dumps(Br['parentBranchesField'], ensure_ascii=False)}")

# 第 6 条线：聊久了
for s in ['summary-factory', 'summary']:
    d = j(f'main/{s}.json')
    u = d['response']['usage']
    w(f'mem-{s}', f"摘要回复长度 {d['generate']['deepseek']['body']['max_tokens']}（overrideResponseLength = {d['overrideResponseLength']}）\nfinish_reason = {d['response']['choices'][0]['finish_reason']}，输出 {u['completion_tokens']} token，其中思考 {u['completion_tokens_details']['reasoning_tokens']}\n\n{d['summary']}")
d = j('main/summary.json')
w('mem-request-tail', '\n'.join(f"{m['role']:<9} {one(m['content'], 100)}" for m in d['generate']['deepseek']['body']['messages'][-2:]))
w('mem-r6', ledger_lines([x for x in d6['ledger'] if x.get('identifier', '') in ('main', 'summary', 'worldInfoBefore', 'charDescription', 'newMainChat', 'chatHistory-1')], 46))

# 第 7 条线：群聊
Sc = j('group/scheduler.json')
w('gr-scheduler', f"话痨度：塞拉菲娜 {Sc['talkativeness']['塞拉菲娜']}，洛恩 {Sc['talkativeness']['洛恩']}；每种情况用 6 个种子各抽一次\n\n" + '\n'.join(f"{k}\n   " + '  '.join('+'.join(r) for r in v) for k, v in Sc['runs'].items()))
gl = j('group/g-r1-洛恩.json')
w('gr-lorne-request', '\n'.join(f"{m['role']:<9} {one(m['content'], 90)}" for m in gl['generate']['deepseek']['body']['messages']))
rep = []
for p_ in sorted(glob.glob(f'{OUT}/group/g-r*-*.json')):
    if p_.endswith('-chat.json'):
        continue
    d = json.load(open(p_))
    rep.append(f"[{os.path.basename(p_)[2:4]}] 用户：{d['user']}  调度选中：{'、'.join(a['name'] for a in d['activated'])}\n  {d['speaker']}：{one(d['received']['message']['mes'], 160)}")
w('gr-replies', '\n'.join(rep))
Jn = j('group/join.json')
w('gr-join', '\n\n'.join(f"== {k}\n" + '\n'.join(f"  {x.get('identifier', ''):<16} {one(x['content'], 70)}" for x in v if x.get('identifier', '') in ('charDescription', 'newMainChat')) for k, v in Jn.items()))

# 第 8 条线：规则
R = j('rules/regex.json')
w('ru-regex', '脚本：\n' + '\n'.join(f"  「{s['scriptName']}」 {s['findRegex']} → {json.dumps(s['replaceString'], ensure_ascii=False)}  markdownOnly={s['markdownOnly']} promptOnly={s['promptOnly']} minDepth={s['minDepth']}" for s in R['scripts'])
  + '\n\n存在聊天文件里（三条都没动）：\n' + '\n'.join(f"  第 {x['index']} 条 ……{one(x['stored'], 40)}" for x in R['stored'])
  + '\n\n屏幕上显示：\n' + '\n'.join(f"  第 {x['index']} 条（深度 {x['depth']}）……{one(x['shown'], 50)}" for x in R['display'])
  + '\n\n发给模型（三条 assistant 消息的结尾）：\n' + '\n'.join(f"  ……{one(s, 50)}" for s in R['sentToModel']))
V = j('rules/variables.json')
w('ru-variables', f"{{{{setvar::好感::35}}}}好感是 {{{{getvar::好感}}}}  →  {V['first']}\n{{{{addvar::好感::5}}}}现在是 {{{{getvar::好感}}}}  →  {V['second']}\nchat_metadata.variables = {json.dumps(V['chat_metadata_variables'], ensure_ascii=False)}")
Ev = j('rules/event.json')
w('ru-event', '发给 DeepSeek 的最后三条：\n' + '\n'.join(f"  {m['role']:<9} {one(m['content'], 70)}" for m in Ev['tail']))
print('packed', len(os.listdir(TXT)), 'txt;', len(os.listdir(REC)), 'records')
