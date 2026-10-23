// 群聊（第 7 条线）里不调模型的部分：发言调度函数（group-chats.js 原样切出）和 Join 模式的拼卡。随机数用带种子的 seedrandom。
import fs from 'node:fs';
import seedrandom from 'seedrandom';
console.error = (...a) => process.stderr.write('ERR ' + a.map(x => x?.stack ?? String(x)).join(' ').slice(0, 1500) + '\n');
const L = await import('./lib.mjs');
const OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out/group';
const M = '/data2/work/lht/study/26.06/_ext/st-lab/out/material/';
fs.mkdirSync(OUT, { recursive: true });
const save = (name, obj) => fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(obj, null, 1));
const sera = { ...JSON.parse(fs.readFileSync(M + 'seraphina.zh.json')), avatar: 'seraphina.png' };
const lorne = { ...JSON.parse(fs.readFileSync(M + 'lorne.constructed.json')), avatar: 'lorne.png' };
const CONN = { chat_completion_source: 'deepseek', deepseek_model: 'deepseek-flash', stream_openai: false };
const group = { id: '1', name: '林间空地', members: ['seraphina.png', 'lorne.png'], activation_strategy: 0, generation_mode: 0, disabled_members: [], allow_self_responses: false, chat_id: '林间空地 - 实跑', chats: ['林间空地 - 实跑'] };
await L.init({ card: sera, books: {}, name1: '旅人', oaiPatch: CONN });

function runNatural(cards, input, lastMessage, isUserInput, seeds = 6) {
    L.setGroup(cards, group);
    const out = [];
    for (let s = 1; s <= seeds; s++) {
        Math.random = seedrandom('group-' + s);
        const ids = L.G.activateNaturalOrder(group.members, input, lastMessage, false, isUserInput);
        out.push(ids.map(i => L.S.characters[i].name));
    }
    Math.random = seedrandom();
    return out;
}
const en = (c, name) => ({ ...structuredClone(c), name });
const mute = (c) => ({ ...structuredClone(c), talkativeness: '0' });
const runs = {
    '中文名点名：「洛恩，你怎么看？」': runNatural([sera, lorne], '洛恩，你怎么看？', null, true),
    '英文名点名：「Lorne, what do you think?」（构造：两人改用英文名）': runNatural([en(sera, 'Seraphina'), en(lorne, 'Lorne')], 'Lorne, what do you think?', null, true),
    '没点名：「你们两位认识很久了吗？」': runNatural([sera, lorne], '你们两位认识很久了吗？', null, true),
    '洛恩话痨度改成 0、也没点名（构造）': runNatural([sera, mute(lorne)], '你们两位认识很久了吗？', null, true),
    '自动模式、上一条是洛恩说的': runNatural([sera, lorne], '', { name: '洛恩', is_user: false, mes: '哼。' }, false),
};
save('scheduler', { talkativeness: { 塞拉菲娜: sera.talkativeness, 洛恩: lorne.talkativeness }, runs });

// Join 模式：几个成员的描述拼成一份（getGroupCharacterCardsLazy），dry run 看 charDescription 槽
{
    const out = {};
    for (const [tag, mode, prefix] of [['swap（出厂）', 0, ''], ['join', 1, ''], ['join + 前缀（构造）', 1, '【{{char}}】']]) {
        await L.init({ card: sera, books: {}, name1: '旅人', oaiPatch: CONN });
        L.setGroup([sera, lorne], { ...group, generation_mode: mode, generation_mode_join_prefix: prefix, generation_mode_join_suffix: '' });
        L.setCharacter(1);
        L.S.__set('chat', [L.S.chat[0] ?? { name: '塞拉菲娜', is_user: false, mes: '……', extra: {} }]);
        const g = await L.generate({ type: 'normal', dryRun: true });
        out[tag] = g.ledger.filter(x => ['charDescription', 'main', 'newMainChat'].includes(x.identifier) || x.identifier.startsWith('groupNudge') || x.identifier === 'chatHistory-1').map(x => ({ identifier: x.identifier, content: x.content }));
    }
    save('join', out);
}
process.stdout.write('done\n');
process.exit(0);
