// 世界书实验：全部直接调 world-info.js 的 checkWorldInfo / getWorldInfoPrompt，不调模型。
// 判定过程取自酒馆自己打的 [WI] 调试日志（world-info.js 的 console.debug），这里只是接住、去掉条目对象本身。
// 随机数（概率、互斥组）换成带种子的 seedrandom，结果可复现。
import fs from 'node:fs';
import seedrandom from 'seedrandom';
console.error = (...a) => process.stderr.write('ERR ' + a.map(x => x?.stack ?? (typeof x === 'object' ? JSON.stringify(x)?.slice(0,300) : String(x))).join(' ').slice(0, 2000) + '\n');
const L = await import('./lib.mjs');
const OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out/lorebook';
const M = '/data2/work/lht/study/26.06/_ext/st-lab/out/material/';
fs.mkdirSync(OUT, { recursive: true });
const card = JSON.parse(fs.readFileSync(M + 'seraphina.zh.json'));
const eldoria = JSON.parse(fs.readFileSync(M + 'eldoria.zh.json'));
const TEMPLATE = eldoria.entries['0'];
const CONN = { chat_completion_source: 'deepseek', deepseek_model: 'deepseek-flash', stream_openai: false };

function entry(uid, o) {
    return { ...structuredClone(TEMPLATE), uid, displayIndex: uid, key: [], keysecondary: [], comment: '', content: '', ...o };
}
function book(entries) { return { entries: Object.fromEntries(entries.map(e => [String(e.uid), e])) }; }

// 接住 [WI] 调试日志：只留字符串部分
async function traced(fn) {
    const lines = [];
    const prev = console.debug;
    const prevLog = console.log;
    const fmt = (args) => args.filter(a => typeof a !== 'object' || a === null).map(String).join(' ');
    console.debug = (...a) => { if (String(a[0]).startsWith('[WI]')) lines.push(fmt(a)); };
    console.log = (...a) => { if (String(a[0]).startsWith('[WI]')) lines.push(fmt(a)); };
    try { return { result: await fn(), trace: lines }; } finally { console.debug = prev; console.log = prevLog; }
}
function seeded(seed) { const rng = seedrandom(seed); Math.random = rng; }

// 构造演示用解绑了世界书的卡，只让演示书生效
const bareCard = structuredClone(card); bareCard.data.extensions.world = '';
async function setup({ books, globalBooks = [], wiPatch = {}, chat = null, chatMetadata = {} }) {
    await L.init({ card: globalBooks.length ? bareCard : card, books, name1: '旅人', oaiPatch: CONN, wiPatch, globalBooks, chatMetadata });
    if (chat) L.S.__set('chat', structuredClone(chat));
}
// 用和 Generate 相同的方式取扫描文本（script.js:4624）
const chatForWI = () => L.S.chat.filter(x => !x.is_system).map(x => L.WI.world_info_include_names ? `${x.name}: ${x.mes}` : x.mes).reverse();
async function check({ dry = true } = {}) {
    const max = L.S.getMaxPromptTokens();
    return traced(() => L.WI.checkWorldInfo(chatForWI(), max, dry, { trigger: 'normal' }));
}
const names = (r) => [...r.allActivatedEntries.values()].map(e => e.comment);
const save = (name, obj) => fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(obj, null, 1));
const userMsg = (mes) => ({ name: '旅人', is_user: true, is_system: false, send_date: '', mes, extra: {} });
const charMsg = (mes) => ({ name: '塞拉菲娜', is_user: false, is_system: false, send_date: '', mes, extra: {}, swipe_id: 0, swipes: [mes], swipe_info: [{}] });

// ---------- A. 真实输入：第一轮，扫描最近 2 条（开场白 + 用户这句） ----------
const main = JSON.parse(fs.readFileSync('/data2/work/lht/study/26.06/_ext/st-lab/out/main/r1.json'));
const r1chat = JSON.parse(fs.readFileSync('/data2/work/lht/study/26.06/_ext/st-lab/out/main/00-init.json')).chat;
r1chat.push(userMsg(main.user));
{
    await setup({ books: { '埃尔多利亚': eldoria }, chat: r1chat });
    const on = await check();
    await setup({ books: { '埃尔多利亚': eldoria }, chat: r1chat, wiPatch: { world_info_recursive: false } });
    const off = await check();
    save('A-real-r1', { scanText: chatForWI().slice(0, 2), recursiveOn: { activated: names(on.result), trace: on.trace }, recursiveOff: { activated: names(off.result), trace: off.trace } });
}

// ---------- B. 次关键词：同一个「苹果」，按次关键词分开 ----------
{
    const b = book([
        entry(0, { comment: '苹果公司', key: ['苹果'], keysecondary: ['手机', '发布会'], selectiveLogic: 0, content: '苹果是一家做手机和电脑的公司。' }),       // AND_ANY
        entry(1, { comment: '苹果树', key: ['苹果'], keysecondary: ['手机', '发布会'], selectiveLogic: 2, content: '院子里那棵苹果树是外婆种的。' }),          // NOT_ANY
    ]);
    const out = {};
    for (const text of ['新款苹果手机什么时候发布？', '院子里的苹果熟了，摘几个吧。']) {
        await setup({ books: { '演示·次关键词': b }, globalBooks: ['演示·次关键词'], chat: [userMsg(text)] });
        const r = await check();
        out[text] = { activated: names(r.result), trace: r.trace };
    }
    save('B-secondary', { entries: Object.values(b.entries).map(e => ({ comment: e.comment, key: e.key, keysecondary: e.keysecondary, selectiveLogic: e.selectiveLogic })), runs: out });
}

// ---------- C. 递归：条目内容里的词再去触发别的条目；preventRecursion、delayUntilRecursion ----------
{
    const mk = (prevent = false) => book([
        entry(0, { comment: '银溪谷', key: ['银溪谷'], content: '银溪谷在空地北边，如今荆棘魔盘踞在谷口。', order: 100, preventRecursion: prevent }),
        entry(1, { comment: '荆棘魔', key: ['荆棘魔'], content: '荆棘魔是被影牙诅咒的树精，怕火。', order: 90 }),
        entry(2, { comment: '影牙的来历', key: ['影牙'], content: '影牙来自森林深处的裂谷，三十年前第一次出现。', order: 80, delayUntilRecursion: true }),
    ]);
    const chat = [userMsg('明天我想从银溪谷绕过去。')];
    const out = {};
    for (const [tag, b] of [['默认', mk(false)], ['银溪谷设 preventRecursion', mk(true)]]) {
        await setup({ books: { '演示·递归': b }, globalBooks: ['演示·递归'], chat });
        const r = await check();
        out[tag] = { activated: names(r.result), trace: r.trace };
    }
    // 延迟到递归：用户直接说「影牙」，第一轮扫描不放行这条
    await setup({ books: { '演示·递归': mk(false) }, globalBooks: ['演示·递归'], chat: [userMsg('影牙到底是什么东西？')] });
    const d = await check();
    out['直接提到影牙'] = { activated: names(d.result), trace: d.trace };
    save('C-recursion', { runs: out });
}

// ---------- D. 预算：真实世界书 + 第一轮的真实聊天，用户把世界书预算从 25% 调到 10% ----------
{
    const out = {};
    for (const pct of [25, 10]) {
        await setup({ books: { '埃尔多利亚': eldoria }, chat: r1chat, wiPatch: { world_info_budget: pct } });
        const r = await check();
        out[`${pct}%`] = { activated: names(r.result), trace: r.trace.filter(l => /Budget|budget|activation successful|Context size|LOOP #|Successfully/.test(l)) };
    }
    save('D-budget', out);
}

// ---------- E. 互斥组和概率：同组只留一条，按权重抽；概率条目掷骰 ----------
{
    const b = book([
        entry(0, { comment: '天气·晴', key: ['出门', '天气'], group: '天气', groupWeight: 60, content: '今天是晴天。' }),
        entry(1, { comment: '天气·雨', key: ['出门', '天气'], group: '天气', groupWeight: 30, content: '今天在下雨。' }),
        entry(2, { comment: '天气·雾', key: ['出门', '天气'], group: '天气', groupWeight: 10, content: '林子里起了大雾。' }),
        entry(3, { comment: '偶遇商队', key: ['出门'], probability: 30, useProbability: true, content: '路上遇见一支往北走的商队。' }),
    ]);
    const runs = [];
    for (let seed = 1; seed <= 10; seed++) {
        await setup({ books: { '演示·互斥组': b }, globalBooks: ['演示·互斥组'], chat: [userMsg('我们出门走走吧。')] });
        seeded('wi-' + seed);
        const r = await check();
        runs.push({ seed: 'wi-' + seed, activated: names(r.result) });
    }
    Math.random = seedrandom();   // 恢复
    save('E-group', { weights: { 晴: 60, 雨: 30, 雾: 10 }, 商队概率: 30, runs });
}

// ---------- F. 定时效果：sticky / cooldown / delay，按聊天条数计时；swipe 时作废 ----------
{
    const b = book([
        entry(0, { comment: '地牢规则', key: ['地牢'], sticky: 2, cooldown: 3, content: '地牢里不能点火。' }),
        entry(1, { comment: '伏兵', key: ['走廊'], delay: 6, content: '走廊尽头埋伏着两个守卫。' }),
    ]);
    const lines = [
        userMsg('我们从这道暗门下到地牢。'),
        charMsg('石阶又湿又滑，她举着荧光走在前面。'),
        userMsg('前面有条走廊。'),
        charMsg('走廊很长，尽头隐约有火光。'),
        userMsg('继续往前，沿着地牢的走廊走。'),
        charMsg('脚步声在石壁间回荡。'),
        userMsg('还在地牢里吗？'),
        charMsg('是的，四周仍是潮湿的石墙。'),
    ];
    await setup({ books: { '演示·定时': b }, globalBooks: ['演示·定时'], chat: [] });
    const steps = [];
    for (let i = 0; i < lines.length; i++) {
        L.S.chat.push(structuredClone(lines[i]));
        const r = await check({ dry: false });
        steps.push({ chatLength: L.S.chat.length, last: lines[i].mes, activated: names(r.result), timed: structuredClone(L.S.chat_metadata.timedWorldInfo ?? {}) });
    }
    // swipe：最后一条重新生成——拼装时这条被去掉，扫描的聊天没有变长
    const swipeChat = L.S.chat.slice(0, 1);
    await setup({ books: { '演示·定时': b }, globalBooks: ['演示·定时'], chat: swipeChat });
    const s1 = await check({ dry: false });
    const after1 = structuredClone(L.S.chat_metadata.timedWorldInfo ?? {});
    // 同样长度再扫一次（swipe / regenerate 时聊天没有前进）
    L.S.chat.push(charMsg('（被 swipe 掉的这条回复）'));
    L.S.chat.pop();
    const s2 = await check({ dry: false });
    save('F-timed', { steps, swipe: { first: { activated: names(s1.result), timed: after1 }, again: { activated: names(s2.result), timed: structuredClone(L.S.chat_metadata.timedWorldInfo ?? {}), trace: s2.trace.filter(l => /sticky|Sticky|cooldown|delay|timed|Timed/.test(l)) } } });
}

// ---------- G. 插到哪：几条蓝灯条目各放一个位置，整轮拼一次（Generate 的真实流程，dry run） ----------
{
    const b = book([
        entry(0, { comment: '角色定义前', constant: true, position: 0, order: 100, content: '【位置 0：角色定义前】' }),
        entry(1, { comment: '角色定义后', constant: true, position: 1, order: 100, content: '【位置 1：角色定义后】' }),
        entry(2, { comment: '作者注释顶', constant: true, position: 2, order: 100, content: '【位置 2：作者注释顶部】' }),
        entry(3, { comment: '@深度 0 user', constant: true, position: 4, depth: 0, role: 1, order: 100, content: '【位置 4：@深度 0，user】' }),
        entry(4, { comment: '@深度 2 system', constant: true, position: 4, depth: 2, role: 0, order: 100, content: '【位置 4：@深度 2，system】' }),
        entry(5, { comment: '示范对话前', constant: true, position: 5, order: 100, content: '<START>\n{{user}}: 【位置 5：示范对话前】\n{{char}}: 好。' }),
    ]);
    const chat5 = JSON.parse(fs.readFileSync('/data2/work/lht/study/26.06/_ext/st-lab/out/main/r2-chat.json')).chat;
    await setup({ books: { '演示·位置': b }, globalBooks: ['演示·位置'], chat: chat5, chatMetadata: { note_prompt: '（作者注释）塞拉菲娜说话要简短。' } });
    const g = await L.generate({ type: 'normal', dryRun: true });
    save('G-positions', { ledger: g.ledger.map(x => ({ identifier: x.identifier, role: x.role, content: x.content })), prompt: g.prompt, extensionPrompts: g.extensionPrompts });
}

process.stdout.write('done\n');
process.exit(0);
