// 重来、分叉、改历史（第 5 条线）：swipe 的数据形状、编辑、隐藏、开分支。分支用 bookmarks.js 的 createBranch 原样跑，
// 它调的 saveChat 是从 script.js 原样切出的；落盘那一步由 lib.mjs 里的 fetch 拦截按服务端写法写成 JSONL。
import fs from 'node:fs';
import path from 'node:path';
console.error = (...a) => process.stderr.write('ERR ' + a.map(x => x?.stack ?? String(x)).join(' ').slice(0, 1500) + '\n');
const OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out/branch';
process.env.ST_DATA = OUT + '/data';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const L = await import('./lib.mjs');
const ST = process.env.ST_ROOT;
const M = '/data2/work/lht/study/26.06/_ext/st-lab/out/material/';
const MAIN = '/data2/work/lht/study/26.06/_ext/st-lab/out/main/';
const save = (name, obj) => fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(obj, null, 1));
const card = JSON.parse(fs.readFileSync(M + 'seraphina.zh.json'));
const eldoria = JSON.parse(fs.readFileSync(M + 'eldoria.zh.json'));
const CONN = { chat_completion_source: 'deepseek', deepseek_model: 'deepseek-flash', stream_openai: false };
const BM = await import(path.join(ST, 'public/scripts/bookmarks.js'));
const brief = (g) => g.ledger.filter(x => x.identifier.startsWith('chatHistory')).map(x => `${x.role}: ${x.content.slice(0, 30)}`);

// 主线最后的状态（摘要之后）
const final = JSON.parse(fs.readFileSync(MAIN + 'summary-chat.json'));
async function load() {
    await L.init({ card, books: { '埃尔多利亚': eldoria }, name1: '旅人', oaiPatch: CONN });
    L.S.__set('chat', structuredClone(final.chat));
    L.S.__set('chat_metadata', structuredClone(final.chat_metadata));
    // 打开聊天时没有 integrity 就补一个（script.js:7665-7667）；再放一个本地变量，看分支会不会带走（构造：相当于 /setvar key=好感 35）
    L.S.chat_metadata.integrity ??= 'parent-integrity-uuid';
    L.S.chat_metadata.variables = { 好感: 35 };
}

// ---------- 1. swipe：第 4 条消息有两个候选，下一轮只带选中的那个 ----------
{
    const r3 = JSON.parse(fs.readFileSync(MAIN + 'r3.json'));
    const m = final.chat[4];
    const sent = r3.generate.prompt.map(x => x.content);
    save('swipe', {
        message4: { swipe_id: m.swipe_id, swipes: m.swipes.map(s => s.slice(0, 40)), swipe_info: m.swipe_info.map(i => ({ send_date: i.send_date, model: i.extra?.model })), mes: m.mes.slice(0, 40) },
        nextRoundHasSwipe0: sent.some(c => c === m.swipes[0]),
        nextRoundHasSwipe1: sent.some(c => c === m.swipes[1]),
    });
}

// ---------- 2. 编辑：改第 2 条（塞拉菲娜的回复）里的一句，updateMessage 原样跑 ----------
{
    await load();
    const mesId = 2;
    const before = L.S.chat[mesId].mes;
    const edited = before.replace('影牙……它们是这片森林里最危险的怪物。', '影牙……它们是这片森林里最危险的怪物，怕光。');
    // updateMessage 从界面元素上取编辑框文字和消息序号；给它一个只回答这两样的替身
    const div = { closest: (sel) => sel === '.mes_block' ? { find: () => ({ val: () => edited, text: () => before }) } : { attr: () => String(mesId) } };
    L.S.updateMessage(div);
    const m = L.S.chat[mesId];
    const g = await L.generate({ type: 'normal', dryRun: true });
    save('edit', { mes: m.mes.slice(0, 60), swipeSynced: m.swipes[m.swipe_id] === m.mes, tainted: L.S.chat_metadata.tainted, inPrompt: g.prompt.some(x => x.content.includes('怕光')) });
}

// ---------- 3. 开分支：存主聊天，再从第 4 条开分支，并选它被放弃的那个候选（swipe 0） ----------
{
    await load();
    await L.S.saveChat({});                                   // 主聊天落盘
    const name = await BM.createBranch(4, { swipeId: 0 });   // bookmarks.js:187-245
    const dir = path.join(OUT, 'data/chats/seraphina');
    const read = (f) => fs.readFileSync(path.join(dir, f + '.jsonl'), 'utf8').split('\n').map(l => JSON.parse(l));
    const parent = read(L.S.characters[0].chat);
    const branch = read(name);
    const head = branch[0];
    save('branch', {
        files: fs.readdirSync(dir),
        branchName: name,
        parentLines: parent.length, branchLines: branch.length,
        branchHeader: head,
        branchMessage4: branch[5].mes.slice(0, 60),
        parentMessage4: parent[5].mes.slice(0, 60),
        parentBranchesField: L.S.chat[4].extra.branches,
    });
    fs.copyFileSync(path.join(dir, name + '.jsonl'), path.join(OUT, 'branch.jsonl'));
}

process.stdout.write('done\n');
process.exit(0);
