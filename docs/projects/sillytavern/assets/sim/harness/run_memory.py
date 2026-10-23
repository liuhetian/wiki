"""聊久了：接着扮演主线 r5 之后的状态，跑摘要扩展。

摘要扩展的 Classic 方式 = 带完整上下文做一次 quiet 生成，摘要指令放最后（extensions/memory/index.js:681-753 → generateQuietPrompt）。
先照出厂设置跑一次（摘要的回复长度跟主回复一样是 300）；再像用户那样把摘要的「覆盖回复长度」调到 1024 跑一次——
generateQuietPrompt 用 TempResponseLength（script.js:4153-4200）临时改 oai_settings.openai_max_tokens，跑完还原，这里照做。
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stlab import Lab, send

OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out/main'
M = '/data2/work/lht/study/26.06/_ext/st-lab/out/material/'
CONNECTION = {'chat_completion_source': 'deepseek', 'deepseek_model': 'deepseek-flash', 'stream_openai': False}

lab = Lab()
lab.call('init', card=json.load(open(M + 'seraphina.zh.json')), books={'埃尔多利亚': json.load(open(M + 'eldoria.zh.json'))}, name1='旅人', oaiPatch=CONNECTION)
state = json.load(open(f'{OUT}/r5-chat.json'))
lab.eval('L.S.__set("chat", args.chat); L.S.__set("chat_metadata", args.meta);', chat=state['chat'], meta=state['chat_metadata'])
usage = json.load(open(f'{OUT}/usage.json'))


def summarize(tag, override):
    # 用户在摘要扩展里把来源从 Extras 切到主模型（出厂是 extras，没装 Extras 时什么也不做），覆盖回复长度按参数设
    lab.eval('L.EXT.extension_settings.memory = { ...structuredClone(L.MEM.defaultSettings), source: "main", overrideResponseLength: args.o };', o=override)
    # 触发判断原样调 getSummaryPromptForNow（memory/index.js:565-626）：距上次摘要满 10 条才给提示词
    prompt = lab.eval('return await L.MEM.getSummaryPromptForNow(L.EXT.getContext(), false);')
    saved = lab.eval('const o = L.OAI.oai_settings.openai_max_tokens; if (args.o > 0) L.OAI.oai_settings.openai_max_tokens = args.o; return o;', o=override)
    g = lab.call('generate', type='quiet', quietPrompt=prompt)
    lab.eval('L.OAI.oai_settings.openai_max_tokens = args.v;', v=saved)
    resp, sec = send(g['deepseek'])
    rec = lab.call('receive', type='quiet', data=resp)
    summary = lab.eval('return L.RS.removeReasoningFromString(args.s);', s=rec['getMessage'])
    usage.append({'step': tag, 'type': 'quiet', 'seconds': sec, 'usage': resp.get('usage')})
    json.dump({'prompt': prompt, 'overrideResponseLength': override, 'generate': g, 'response': resp, 'received': rec, 'summary': summary},
              open(f'{OUT}/{tag}.json', 'w'), ensure_ascii=False, indent=1)
    print(f'== {tag} max_tokens={g["deepseek"]["body"]["max_tokens"]} finish={resp["choices"][0]["finish_reason"]} usage={resp.get("usage")}')
    print(summary)
    return summary


summarize('summary-factory', 0)
summary = summarize('summary', 1024)
# 存摘要：setMemoryContext（memory/index.js:964-985）——注册 1_memory 注入，并挂在倒数第二条消息的 extra.memory 上
lab.eval('L.MEM.setMemoryContext(args.s, true);', s=summary)
json.dump(lab.call('snapshot'), open(f'{OUT}/summary-chat.json', 'w'), ensure_ascii=False, indent=1)
# 摘要之后下一轮拼成什么样（dry run，不发请求）
json.dump(lab.call('generate', type='normal', dryRun=True), open(f'{OUT}/r6-dry.json', 'w'), ensure_ascii=False, indent=1)
# /hide 0-4：前 5 条只留给人看（chats.js:147-169 hideChatMessageRange 把 is_system 置 true）
lab.eval('for (let i = 0; i <= 4; i++) L.S.chat[i].is_system = true;')
json.dump(lab.call('generate', type='normal', dryRun=True), open(f'{OUT}/r6-hide-dry.json', 'w'), ensure_ascii=False, indent=1)
json.dump(usage, open(f'{OUT}/usage.json', 'w'), ensure_ascii=False, indent=1)
lab.close()
