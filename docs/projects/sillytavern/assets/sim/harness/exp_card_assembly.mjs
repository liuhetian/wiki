// 角色卡（第 1 条线）和每轮现拼（第 3 条线）的实验：全部调酒馆的函数，不调模型。
import fs from 'node:fs';
import path from 'node:path';
import seedrandom from 'seedrandom';
console.error = (...a) => process.stderr.write('ERR ' + a.map(x => x?.stack ?? String(x)).join(' ').slice(0, 1500) + '\n');
const L = await import('./lib.mjs');
const ST = process.env.ST_ROOT;
const OUT = '/data2/work/lht/study/26.06/_ext/st-lab/out/assembly';
const M = '/data2/work/lht/study/26.06/_ext/st-lab/out/material/';
const MAIN = '/data2/work/lht/study/26.06/_ext/st-lab/out/main/';
fs.mkdirSync(OUT, { recursive: true });
const save = (name, obj) => fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(obj, null, 1));
const card = JSON.parse(fs.readFileSync(M + 'seraphina.zh.json'));
const eldoria = JSON.parse(fs.readFileSync(M + 'eldoria.zh.json'));
const CONN = { chat_completion_source: 'deepseek', deepseek_model: 'deepseek-flash', stream_openai: false };
const books = { '埃尔多利亚': eldoria };
const chatOf = (f) => JSON.parse(fs.readFileSync(MAIN + f)).chat;
const ledger = (g) => g.ledger.map(x => ({ identifier: x.identifier, role: x.role, tokens: x.tokens, content: x.content }));

// ---------- 构造的「完整版」卡：在译本上补齐各字段，一次看清每个字段落进哪个槽 ----------
const full = structuredClone(card);
const [traits, ...rest] = card.data.description.split('<START>');
const examplesBlock = '<START>' + rest.join('<START>');
const exampleOnly = examplesBlock.slice(0, examplesBlock.lastIndexOf('\r\n[类型'));
for (const o of [full, full.data]) {
    o.description = traits.trim();
    o.personality = '温柔、护短，总觉得是自己没把人照顾好。';
    o.scenario = '旅人在塞拉菲娜的林间空地里养伤，窗外的森林被影牙占据。';
    o.mes_example = exampleOnly.trim();
}
full.data.system_prompt = '{{original}}\n塞拉菲娜说话时常带一点歉意。';
full.data.post_history_instructions = '用第三人称描写{{char}}的动作，不替{{user}}说话或行动。';
full.data.extensions.depth_prompt = { prompt: '（夜里塞拉菲娜的魔法会变弱，她不愿让人知道。）', depth: 4, role: 'system' };
full.data.alternate_greetings = ['*你醒来时，屋里只有炉火的噼啪声。门口站着一个粉发的身影，背对着你望向黑暗的林子。* “醒了？别急着起身。”'];
fs.writeFileSync(`${OUT}/card-full.zh.json`, JSON.stringify(full, null, 2));

// ---------- 1. 卡是一张 PNG：用服务端的 character-card-parser.js 把中文卡写进随包头像，再读回来 ----------
{
    const parser = await import(path.join(ST, 'src/character-card-parser.js'));
    const { default: extract } = await import('png-chunks-extract');
    const { default: PNGtext } = await import('png-chunk-text');
    const png = fs.readFileSync(path.join(ST, 'default/content/default_Seraphina.png'));
    const out = parser.write(png, JSON.stringify(card));
    fs.writeFileSync(`${OUT}/seraphina.zh.png`, out);
    const chunks = extract(new Uint8Array(out)).map(c => {
        if (c.name !== 'tEXt') return { name: c.name, bytes: c.data.length };
        const t = PNGtext.decode(c.data);
        const json = JSON.parse(Buffer.from(t.text, 'base64').toString('utf8'));
        return { name: c.name, keyword: t.keyword, base64Chars: t.text.length, spec: json.spec, spec_version: json.spec_version, name_in_card: json.data?.name };
    });
    const back = JSON.parse(parser.read(out));
    save('card-png', { chunks, readBack: { spec: back.spec, name: back.data.name, fields: Object.keys(back.data) } });
}

// ---------- 2. 字段落进哪个槽：完整版卡，第二轮的真实聊天，dry run ----------
{
    await L.init({ card: full, books, name1: '旅人', oaiPatch: CONN });
    L.S.__set('chat', chatOf('r2-chat.json'));
    const g = await L.generate({ type: 'normal', dryRun: true });
    save('card-slots', { ledger: ledger(g), extensionPrompts: g.extensionPrompts });
}

// ---------- 3. 备选开场白：开场白和 alternate_greetings 一起成为第 0 条消息的候选 ----------
{
    await L.init({ card: full, books, name1: '旅人', oaiPatch: CONN });
    const m = L.S.chat[0];
    save('card-greetings', { swipe_id: m.swipe_id, swipes: m.swipes, mes: m.mes });
}

// ---------- 4. 用户人设：放在 prompt 里 vs 深度 2 ----------
{
    const persona = '{{user}}是二十出头的猎人，左腿被影牙咬伤，说话直来直去。';
    const out = {};
    for (const [tag, pos] of [['IN_PROMPT', 0], ['AT_DEPTH', 4]]) {
        await L.init({ card, books, name1: '旅人', persona, oaiPatch: CONN, powerUserPatch: { persona_description_position: pos, persona_description_depth: 2, persona_description_role: 0 } });
        L.S.__set('chat', chatOf('r2-chat.json'));
        const g = await L.generate({ type: 'normal', dryRun: true });
        out[tag] = ledger(g).map(x => ({ identifier: x.identifier, role: x.role, content: x.content.slice(0, 60) }));
    }
    save('persona', out);
}

// ---------- 5. 宏：{{random}} 每次重抽，{{pick}} 同一个聊天里不变；换个聊天再抽 ----------
{
    await L.init({ card, books, name1: '旅人', oaiPatch: CONN });
    Math.random = seedrandom('macro');
    const tpl = { random: '{{random::金发::红发::银发}}', pick: '{{pick::金发::红发::银发}}' };
    const out = { names: L.S.substituteParams('{{char}} 对 {{user}} 说话'), sameChat: {}, otherChat: {} };
    for (const k of Object.keys(tpl)) out.sameChat[k] = [1, 2, 3, 4].map(() => L.S.substituteParams(tpl[k]));
    for (const other of ['塞拉菲娜 - 第二局', '塞拉菲娜 - 第三局', '塞拉菲娜 - 第四局']) {
        L.S.characters[0].chat = other;
        L.S.__set('chat_metadata', {});
        out.otherChat[other] = {};
        for (const k of Object.keys(tpl)) out.otherChat[other][k] = [1, 2, 3].map(() => L.S.substituteParams(tpl[k]));
    }
    Math.random = seedrandom();
    save('macros', out);
}

// ---------- 6. 槽位的顺序和「放进聊天里」：加一条自定义提示词，先按顺序放，再改成 In-Chat 深度 1 ----------
{
    const out = {};
    for (const [tag, pos] of [['relative', 0], ['in-chat@1', 1]]) {
        await L.init({ card, books, name1: '旅人', oaiPatch: CONN });
        L.S.__set('chat', chatOf('r2-chat.json'));
        const s = L.OAI.oai_settings;
        s.prompts.push({ identifier: 'writing-rules', name: '写作规则', role: 'system', content: '每次回复不超过三段。', system_prompt: false, marker: false, injection_position: pos, injection_depth: 1, injection_order: 100 });
        const order = s.prompt_order.find(x => String(x.character_id) === '100001').order;
        order.splice(order.findIndex(x => x.identifier === 'main') + 1, 0, { identifier: 'writing-rules', enabled: true });
        const g = await L.generate({ type: 'normal', dryRun: true });
        out[tag] = ledger(g).map(x => ({ identifier: x.identifier, role: x.role, content: x.content.slice(0, 40) }));
    }
    save('order', { defaultOrder: L.OAI.oai_settings.prompt_order.find(x => String(x.character_id) === '100001').order.map(x => `${x.identifier}${x.enabled ? '' : '（关）'}`), runs: out });
}

// ---------- 7. 深度注入：同一深度几样东西怎么排；完整版卡 + 作者注释 + 世界书 @深度 + /inject + 人设 @深度 ----------
{
    const wiBook = structuredClone(eldoria);
    wiBook.entries['9'] = { ...structuredClone(eldoria.entries['0']), uid: 9, displayIndex: 9, comment: '天色', key: [], constant: true, position: 4, depth: 4, role: 0, content: '（世界书 @深度 4：天快黑了。）' };
    wiBook.entries['10'] = { ...structuredClone(eldoria.entries['0']), uid: 10, displayIndex: 10, comment: '旅人的念头', key: [], constant: true, position: 4, depth: 4, role: 1, content: '（世界书 @深度 4，user：我得早点上路。）' };
    await L.init({
        card: full, books: { '埃尔多利亚': wiBook }, name1: '旅人', oaiPatch: CONN,
        persona: '{{user}}是二十出头的猎人。', powerUserPatch: { persona_description_position: 4, persona_description_depth: 2, persona_description_role: 0 },
        chatMetadata: { note_prompt: '（作者注释：塞拉菲娜这几轮话少一些。）' },
    });
    L.S.__set('chat', chatOf('r5-chat.json'));
    // /inject id=伏笔 position=chat depth=4 role=assistant（slash-commands.js:3780-3846 最终也是调 setExtensionPrompt）
    const { generate } = L;
    const origSet = L.S.setExtensionPrompt;
    const g0 = await (async () => {
        L.S.setExtensionPrompt('script_inject_伏笔', '（/inject：窗外有什么东西在看着这间屋子。）', L.S.extension_prompt_types.IN_CHAT, 4, false, L.S.extension_prompt_roles.ASSISTANT);
        return generate({ type: 'normal', dryRun: true });
    })();
    save('injections', { ledger: ledger(g0).map(x => ({ identifier: x.identifier, role: x.role, content: x.content })), extensionPrompts: g0.extensionPrompts });
}

// ---------- 8. 预算：最后的真实聊天，出厂 4095 / 用户调成 2048；完整版卡带示范对话 ----------
{
    const out = {};
    for (const ctx of [4095, 2048, 1400]) {
        await L.init({ card: full, books, name1: '旅人', oaiPatch: { ...CONN, openai_max_context: ctx } });
        L.S.__set('chat', chatOf('r5-chat.json'));
        const g = await L.generate({ type: 'normal', dryRun: true });
        const lg = ledger(g);
        out[ctx] = {
            budget: ctx - L.OAI.oai_settings.openai_max_tokens,
            total: lg.reduce((a, x) => a + (x.tokens || 0), 0),
            messagesInContext: L.OAI.openai_messages_count,
            chatLength: L.S.chat.length,
            rows: lg.map(x => ({ identifier: x.identifier, role: x.role, tokens: x.tokens, head: x.content.slice(0, 24) })),
        };
    }
    save('budget', out);
}

process.stdout.write('done\n');
process.exit(0);
