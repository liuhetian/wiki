// 一份内容喂各种模型（第 4 条线）：服务端各供应商的转换函数、后处理几档、continue 的两种写法、Text Completion 的 instruct 拼法。
import fs from 'node:fs';
import path from 'node:path';
console.error = (...a) => process.stderr.write('ERR ' + a.map(x => x?.stack ?? String(x)).join(' ').slice(0, 1500) + '\n');
const L = await import('./lib.mjs');
const ST = process.env.ST_ROOT;
const OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out/adapt';
const M = '/data2/work/lht/study/26.06/_ext/st-lab/out/material/';
const MAIN = '/data2/work/lht/study/26.06/_ext/st-lab/out/main/';
fs.mkdirSync(OUT, { recursive: true });
const save = (name, obj) => fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(obj, null, 1));
const card = JSON.parse(fs.readFileSync(M + 'seraphina.zh.json'));
const eldoria = JSON.parse(fs.readFileSync(M + 'eldoria.zh.json'));
const CONN = { chat_completion_source: 'deepseek', deepseek_model: 'deepseek-flash', stream_openai: false };
const PC = L.PC;
const brief = (msgs) => msgs.map(m => ({ role: m.role, ...(m.name ? { name: m.name } : {}), ...(m.prefix ? { prefix: m.prefix } : {}), content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }));

// 第二轮前端拼好的消息数组（发往服务端之前），加上服务端从请求里取的名字
const r2 = JSON.parse(fs.readFileSync(MAIN + 'r2.json'));
const msgs = r2.generate.prompt;
const names = PC.getPromptNames({ body: r2.generate.generate_data });

// ---------- 1. 后处理几档：同一份消息数组 ----------
{
    const out = { input: brief(msgs) };
    for (const t of ['', 'merge', 'semi', 'strict', 'single']) {
        out[t || 'none'] = brief(PC.postProcessPrompt(structuredClone(msgs), t, names));
    }
    save('postprocess', out);
}

// ---------- 2. Claude、Gemini 的转换函数（只跑转换，不发请求） ----------
{
    const claude = PC.convertClaudeMessages(structuredClone(msgs), '', true, false, names);
    const gemini = PC.convertGooglePrompt(structuredClone(msgs), 'gemini-2.5-pro', true, names);
    save('providers', { claude, gemini });
}

// ---------- 3. continue 的两种写法：出厂的「续写提示」vs 打开 continue_prefill ----------
{
    const r3chat = JSON.parse(fs.readFileSync(MAIN + 'r3-chat.json')).chat;
    const out = {};
    for (const [tag, prefill] of [['nudge（出厂）', false], ['continue_prefill', true]]) {
        await L.init({ card, books: { '埃尔多利亚': eldoria }, name1: '旅人', oaiPatch: { ...CONN, continue_prefill: prefill } });
        L.S.__set('chat', structuredClone(r3chat));
        const g = await L.generate({ type: 'continue', dryRun: true });
        out[tag] = { frontend: brief(g.prompt).slice(-3), deepseek: brief(g.deepseek.body.messages).slice(-3) };
    }
    save('continue', out);
}

// ---------- 4. 主线里实际发出的几种请求的末尾（真实请求体） ----------
{
    const tail = (f, n = 3) => brief(JSON.parse(fs.readFileSync(MAIN + f)).generate.deepseek.body.messages).slice(-n);
    save('tails', { 'r3-continue': tail('r3-continue.json'), 'r4-impersonate': tail('r4-impersonate.json'), 'r1': tail('r1.json', 3), r1Params: Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(MAIN + 'r1.json')).generate.deepseek.body).filter(([k]) => k !== 'messages')) });
}

// ---------- 5. Text Completion 一瞥：同一段聊天按 ChatML 模板拼成一条字符串 ----------
{
    await L.init({ card, books: { '埃尔多利亚': eldoria }, name1: '旅人', oaiPatch: CONN });
    const r2chat = JSON.parse(fs.readFileSync(MAIN + 'r2-chat.json')).chat;
    L.S.__set('chat', structuredClone(r2chat));
    L.S.__set('main_api', 'textgenerationwebui');
    const IM = await import(path.join(ST, 'public/scripts/instruct-mode.js'));
    const instruct = JSON.parse(fs.readFileSync(path.join(ST, 'default/content/presets/instruct/ChatML.json')));
    const context = JSON.parse(fs.readFileSync(path.join(ST, 'default/content/presets/context/ChatML.json')));
    Object.assign(L.PU.power_user.instruct, instruct, { enabled: true });
    Object.assign(L.PU.power_user.context, context);
    const f = L.S.getCharacterCardFields();
    const story = L.PU.renderStoryString({ description: f.description, personality: f.personality, scenario: f.scenario, system: L.PU.power_user.sysprompt?.content ? L.S.substituteParams(L.PU.power_user.sysprompt.content) : '', persona: '', char: L.S.name2, user: L.S.name1, wiBefore: '', wiAfter: '', loreBefore: '', loreAfter: '', anchorBefore: '', anchorAfter: '', mesExamples: '', mesExamplesRaw: '' });
    const storyWrapped = IM.formatInstructModeStoryString(story);
    const history = r2chat.map(m => IM.formatInstructModeChat(m.name, m.mes, m.is_user, false, '', L.S.name1, L.S.name2, false));
    const lastLine = IM.formatInstructModePrompt(L.S.name2, false, '', L.S.name1, L.S.name2, false, false);
    const stops = IM.getInstructStoppingSequences();
    save('textcompletion', { instructPreset: instruct, storyWrapped, history, lastLine, stops, joined: storyWrapped + history.join('') + lastLine });
    L.S.__set('main_api', 'openai');
}

process.stdout.write('done\n');
process.exit(0);
