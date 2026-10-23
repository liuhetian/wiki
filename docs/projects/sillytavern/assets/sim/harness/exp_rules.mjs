// 用户自己加规则（第 8 条线）：正则把显示、存储、发给模型拆开；变量存在聊天文件头；事件总线可以原地改 prompt。
import fs from 'node:fs';
console.error = (...a) => process.stderr.write('ERR ' + a.map(x => x?.stack ?? String(x)).join(' ').slice(0, 1500) + '\n');
const L = await import('./lib.mjs');
const OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out/rules';
const M = '/data2/work/lht/study/26.06/_ext/st-lab/out/material/';
const MAIN = '/data2/work/lht/study/26.06/_ext/st-lab/out/main/';
fs.mkdirSync(OUT, { recursive: true });
const save = (name, obj) => fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(obj, null, 1));
const card = JSON.parse(fs.readFileSync(M + 'seraphina.zh.json'));
const eldoria = JSON.parse(fs.readFileSync(M + 'eldoria.zh.json'));
const CONN = { chat_completion_source: 'deepseek', deepseek_model: 'deepseek-flash', stream_openai: false };
const init = () => L.init({ card, books: { '埃尔多利亚': eldoria }, name1: '旅人', oaiPatch: CONN });

// ---------- 1. 正则：状态栏只给人看渲染后的样子；发给模型时只留最新一条的状态栏 ----------
{
    await init();
    // 构造：前两轮的回复末尾各带一个状态栏（相当于卡要求模型每条输出一段状态）
    const chat = JSON.parse(fs.readFileSync(MAIN + 'r2-chat.json')).chat.slice(0, 5);
    const bars = { 0: '好感：20｜伤势：昏迷刚醒', 2: '好感：30｜伤势：左腿未愈', 4: '好感：35｜伤势：左腿未愈' };
    for (const [i, bar] of Object.entries(bars)) {
        chat[i].mes += `\n<状态>${bar}</状态>`;
        if (Array.isArray(chat[i].swipes)) chat[i].swipes[chat[i].swipe_id ?? 0] = chat[i].mes;
    }
    L.S.__set('chat', chat);
    // 脚本字段照 regex 扩展新建脚本的默认值（regex/index.js），只改名字、正则、替换串和三个开关
    const base = { disabled: false, trimStrings: [], placement: [2], substituteRegex: 0, runOnEdit: true, minDepth: null, maxDepth: null, markdownOnly: false, promptOnly: false };
    L.EXT.extension_settings.regex = [
        { ...base, id: 'r1', scriptName: '状态栏渲染', findRegex: '/<状态>([\\s\\S]*?)<\\/状态>/g', replaceString: '<div class="status">$1</div>', markdownOnly: true },
        { ...base, id: 'r2', scriptName: '旧状态栏不发给模型', findRegex: '/\\n?<状态>[\\s\\S]*?<\\/状态>/g', replaceString: '', promptOnly: true, minDepth: 1 },
    ];
    const n = chat.length;
    // 显示：messageFormatting 里按「倒数第几条」算 depth、isMarkdown（script.js:1851-1860）
    const display = Object.keys(bars).map(i => ({ index: Number(i), depth: n - 1 - Number(i), shown: L.RX.getRegexedString(chat[i].mes, L.RX.regex_placement.AI_OUTPUT, { isMarkdown: true, depth: n - 1 - Number(i) }).slice(-40) }));
    const stored = Object.keys(bars).map(i => ({ index: Number(i), stored: chat[i].mes.slice(-30) }));
    const g = await L.generate({ type: 'normal', dryRun: true });
    const sent = g.prompt.filter(m => m.role === 'assistant').map(m => m.content.slice(-40));
    save('regex', { scripts: L.EXT.extension_settings.regex.map(({ scriptName, findRegex, replaceString, markdownOnly, promptOnly, minDepth }) => ({ scriptName, findRegex, replaceString, markdownOnly, promptOnly, minDepth })), stored, display, sentToModel: sent });
}

// ---------- 2. 变量：宏读写，存进 chat_metadata.variables ----------
{
    await init();
    const a = L.S.substituteParams('{{setvar::好感::35}}好感是 {{getvar::好感}}');
    const b = L.S.substituteParams('{{addvar::好感::5}}现在是 {{getvar::好感}}');
    save('variables', { first: a, second: b, chat_metadata_variables: L.S.chat_metadata.variables });
}

// ---------- 3. 事件总线：监听 CHAT_COMPLETION_PROMPT_READY，原地往消息数组里塞一条 ----------
{
    await init();
    L.S.__set('chat', JSON.parse(fs.readFileSync(MAIN + 'r2-chat.json')).chat);
    const handler = (data) => {
        data.chat.splice(data.chat.length - 1, 0, { role: 'system', content: '（扩展插入：外面下起了雨。）' });
    };
    L.S.eventSource.on(L.S.event_types.CHAT_COMPLETION_PROMPT_READY, handler);
    const g = await L.generate({ type: 'normal', dryRun: true });
    L.S.eventSource.removeListener(L.S.event_types.CHAT_COMPLETION_PROMPT_READY, handler);
    save('event', { tail: g.deepseek.body.messages.slice(-3).map(m => ({ role: m.role, content: m.content.slice(0, 50) })) });
}

process.stdout.write('done\n');
process.exit(0);
