// 实跑用的酒馆会话。照 public/script.js 里 Generate() 在 Chat Completion（main_api = 'openai'）路径上的顺序，
// 依次调酒馆自己的函数：世界书、作者注释、Prompt Manager、预算、服务端的 DeepSeek 后处理。
// 这里只有「按顺序调用」的胶水，拼接、筛选、预算、清洗全是酒馆的原函数。注释里的行号都指 public/script.js，另注明的除外。
// 进程里没有 API key：generate() 只产出请求体，由另一个进程发给模型，回包再交给 receive()。
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ST = process.env.ST_ROOT;
const PUB = path.join(ST, 'public');
const HERE = path.dirname(fileURLToPath(import.meta.url));

export const S = await import(path.join(PUB, 'script.js'));
export const OAI = await import(path.join(PUB, 'scripts/openai.js'));
export const PM = await import(path.join(PUB, 'scripts/PromptManager.js'));
export const WI = await import(path.join(PUB, 'scripts/world-info.js'));
export const PU = await import(path.join(PUB, 'scripts/power-user.js'));
export const AN = await import(path.join(PUB, 'scripts/authors-note.js'));
export const MS = await import(path.join(PUB, 'scripts/macros/macro-system.js'));
export const C = await import(path.join(PUB, 'scripts/constants.js'));
export const RX = await import(path.join(PUB, 'scripts/extensions/regex/engine.js'));
export const RS = await import(path.join(PUB, 'scripts/reasoning.js'));
export const G = await import(path.join(PUB, 'scripts/group-chats.js'));
export const EXT = await import(path.join(PUB, 'scripts/extensions.js'));
export const PC = await import(path.join(ST, 'src/prompt-converters.js'));
const { countWebTokenizerTokens } = await import(path.join(HERE, 'stubs/server-count.mjs'));
export const MEM = await import(path.join(HERE, 'stubs/memory-ext.mjs'));

// ---------- token 计数：前端 countTokensOpenAIAsync 发 /api/tokenizers/openai/count，这里在本进程里答 ----------
// 服务端对 DeepSeek 用 SillyTavern-Tokenizers 仓库的 deepseek.json（src/endpoints/tokenizers.js:264、990-995）
const tokenizerFile = path.join(HERE, '../tokenizers/deepseek.json.gz');
// 这个包看到全局有 window/document 就按浏览器加载 wasm，建分词器时临时移开前端的全局桩
const dsTokenizer = await (async () => {
    const saved = { window: globalThis.window, document: globalThis.document };
    delete globalThis.window; delete globalThis.document;
    try {
        const { Tokenizer } = await import('@agnai/web-tokenizers');
        return await Tokenizer.fromJSON(zlib.gunzipSync(fs.readFileSync(tokenizerFile)));
    } finally { Object.assign(globalThis, saved); }
})();
globalThis.__ajax = async (opts) => {
    if (String(opts.url).startsWith('/api/tokenizers/openai/count')) {
        const messages = JSON.parse(opts.data);
        return { token_count: countWebTokenizerTokens(dsTokenizer, messages) };
    }
    throw new Error('unexpected ajax ' + opts.url);
};
// ---------- 服务端的两个聊天接口：前端 fetch 到这里，按服务端的写法落盘 ----------
// /api/chats/save：src/endpoints/chats.js:545-575 → trySaveChat（532-543）把数组逐条 JSON.stringify、按行拼成 JSONL
// /api/characters/chats：列出这张卡已有的聊天文件名
export const DATA_DIR = process.env.ST_DATA || path.join(HERE, '../out/data');
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u === '/api/chats/save') {
        const body = JSON.parse(init.body);
        const cardName = String(body.avatar_url).replace('.png', '');
        const dir = path.join(DATA_DIR, 'chats', cardName);
        fs.mkdirSync(dir, { recursive: true });
        const jsonlData = body.chat?.map(m => JSON.stringify(m)).join('\n');
        fs.writeFileSync(path.join(dir, `${body.file_name}.jsonl`), jsonlData);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    if (u === '/api/characters/chats') {
        const body = JSON.parse(init.body);
        const dir = path.join(DATA_DIR, 'chats', String(body.avatar_url).replace('.png', ''));
        const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.jsonl')) : [];
        return new Response(JSON.stringify(files.map(f => ({ file_name: f }))), { status: 200 });
    }
    if (u.startsWith('/')) throw new Error('unexpected fetch ' + u);
    return realFetch(url, init);
};

export function countTokens(text) { return dsTokenizer.encode(text).length; }

// 世界书每轮激活了哪些条目：getWorldInfoPrompt 发 WORLD_INFO_ACTIVATED（world-info.js:900-903），这里接住
let lastActivated = [];
let lastPromptReasoning = null;   // receive 里 continue 要用它切掉思考前缀（5509-5512）
S.eventSource.on(S.event_types.WORLD_INFO_ACTIVATED, (entries) => { lastActivated = entries; });

const settingsJson = () => JSON.parse(fs.readFileSync(path.join(ST, 'default/content/settings.json'), 'utf8'));
let initialized = false;
let wiInitialized = false;
let baseOai = null;

/**
 * 新装酒馆 + 一张卡 + 若干本世界书，开一段新聊天。
 * oaiPatch：用户在连接面板上改的设置（换成 DeepSeek、关流式）；其余全是 default/content/settings.json 的出厂值。
 */
export async function init({ card, books = {}, name1 = 'User', persona = '', oaiPatch = {}, wiPatch = {}, powerUserPatch = {}, chatMetadata = {}, globalBooks = [] }) {
    const settings = settingsJson();
    // power_user：出厂设置覆盖模块里的默认值（power-user.js 的 loadPowerUserSettings 做的是同一件事）
    Object.assign(PU.power_user, structuredClone(settings.power_user), powerUserPatch);
    PU.power_user.persona_description = persona;
    if (!initialized) {
        MS.initRegisterMacros();                        // 新宏引擎注册内置宏（macro-system.js:66）
        AN.initAuthorsNote();                           // 作者注释：CHAT_CHANGED 时载入默认值（authors-note.js:476、582）
        initialized = true;
    }
    // 聊天补全设置：Default 预设 + 出厂设置，再叠用户在连接面板上的改动（openai.js:4320 loadOpenAISettings）
    // loadOpenAISettings 和 Prompt Manager 的初始化都是启动时调一次的；之后每次 init 从第一次的快照还原，再叠这次的改动
    if (!baseOai) {
        const preset = fs.readFileSync(path.join(ST, 'default/content/presets/openai/Default.json'), 'utf8');
        OAI.loadOpenAISettings({ openai_setting_names: ['Default'], openai_settings: [preset] }, { ...settings.oai_settings });
        OAI.setupChatCompletionPromptManager(OAI.oai_settings);
        baseOai = structuredClone(OAI.oai_settings);
    }
    for (const [k, v] of Object.entries(baseOai)) OAI.oai_settings[k] = structuredClone(v);
    Object.assign(OAI.oai_settings, structuredClone(oaiPatch));
    // 扩展设置回到出厂（作者注释、摘要、正则）
    EXT.extension_settings.note = { default: '', chara: [], wiAddition: [], allowWIScan: false };
    EXT.extension_settings.memory = {};
    EXT.extension_settings.regex = [];
    // 世界书：出厂设置 + 已有的书（world-info.js:917 setWorldInfoSettings）
    // setWorldInfoSettings 是启动时调一次的（会追加已选的书、注册事件），之后换设置用 updateWorldInfoSettings（world-info.js:819）
    const wiSettings = { ...structuredClone(settings.world_info_settings), ...wiPatch };
    if (!wiInitialized) {
        WI.setWorldInfoSettings({ ...wiSettings, world_info: { globalSelect: [] } }, { world_names: Object.keys(books) });
        wiInitialized = true;
    }
    WI.updateWorldInfoSettings(wiSettings, globalBooks);
    WI.worldInfoCache.clear?.();
    for (const [name, book] of Object.entries(books)) WI.worldInfoCache.set(name, structuredClone(book));
    // 角色和聊天
    S.__set('characters', [{ ...structuredClone(card), avatar: 'seraphina.png', chat: `${card.name} - 实跑` }]);
    S.__set('this_chid', 0);
    S.__set('name1', name1);
    S.__set('name2', card.name);
    S.__set('chat_metadata', structuredClone(chatMetadata));
    S.__set('chat', []);
    S.__set('extension_prompts', {});
    G.__setGroup([], null);
    // getChatResult（7684-7706）：空聊天先放开场白
    const first = S.getFirstMessage();
    if (first.mes) S.chat.push(first);
    await S.eventSource.emit(S.event_types.CHAT_CHANGED, S.getCurrentChatId());
}

/** 群聊：多张卡，selected_group 指向一个群（group-chats.js 的数据形状） */
export function setGroup(cards, group) {
    S.__set('characters', cards.map(c => structuredClone(c)));
    G.__setGroup([group], group.id);
}

export function setCharacter(chid) {
    S.__set('this_chid', chid);
    S.__set('name2', S.characters[chid].name);
}

/**
 * Generate(type) 在 Chat Completion 路径上的拼装。返回发往服务端的 generate_data、服务端发给 DeepSeek 的请求体，
 * 以及这一轮的中间产物（世界书结果、注入表、每条消息的 token 数）。
 */
export async function generate({ type = 'normal', text = '', dryRun = false, quietPrompt = '', skipWIAN = false } = {}) {
    const isContinue = type == 'continue';
    const isImpersonate = type == 'impersonate';
    const chat = S.chat;

    // 4405-4412：regenerate 先删掉最后一条非用户消息
    if (type === 'regenerate' && chat.length && !chat[chat.length - 1].is_user) chat.pop();

    // 4433：bias
    const { messageBias, promptBias } = S.getBiasStrings(text, type);

    // 4447-4454 → sendMessageAsUser（5874-5923）：用户消息先进 chat
    if (text && !['regenerate', 'swipe', 'impersonate', 'quiet', 'continue'].includes(type) && !dryRun) {
        const messageText = RX.getRegexedString(text, RX.regex_placement.USER_INPUT);
        const message = {
            name: S.name1,
            is_user: true,
            is_system: false,
            send_date: new Date().toISOString(),
            mes: S.substituteParams(messageText),
            extra: { isSmallSys: false },
        };
        if (messageBias) message.extra.bias = messageBias;
        S.chat_metadata.tainted = true;
        chat.push(message);
    }

    // 4460-4470：卡字段
    let { description, personality, persona, scenario, mesExamples, system, jailbreak, charDepthPrompt, creatorNotes } = S.getCharacterCardFields();

    // 4472-4486：角色笔记（Character's Note）注册成 IN_CHAT 注入
    S.removeDepthPrompts();
    const groupDepthPrompts = G.getGroupDepthPrompts(G.selected_group, Number(S.this_chid));
    if (G.selected_group && Array.isArray(groupDepthPrompts) && groupDepthPrompts.length > 0) {
        groupDepthPrompts.forEach((value, index) => {
            const role = S.getExtensionPromptRoleByName(value.role);
            S.setExtensionPrompt(C.inject_ids.DEPTH_PROMPT_INDEX(index), value.text, S.extension_prompt_types.IN_CHAT, value.depth, EXT.extension_settings.note.allowWIScan, role);
        });
    } else {
        const depthPromptText = charDepthPrompt || '';
        const depthPromptDepth = S.characters[S.this_chid]?.data?.extensions?.depth_prompt?.depth ?? S.depth_prompt_depth_default;
        const depthPromptRole = S.getExtensionPromptRoleByName(S.characters[S.this_chid]?.data?.extensions?.depth_prompt?.role ?? S.depth_prompt_role_default);
        S.setExtensionPrompt(C.inject_ids.DEPTH_PROMPT, depthPromptText, S.extension_prompt_types.IN_CHAT, depthPromptDepth, EXT.extension_settings.note.allowWIScan, depthPromptRole);
    }

    // 4488-4491：开场白每轮重算宏
    if (chat.length) chat[0].mes = S.substituteParams(chat[0].mes);

    // 4493-4529：参与拼装的消息——隐藏的（is_system）去掉；swipe 时去掉当前这条
    let coreChat = chat.filter(x => !x.is_system);
    if (type === 'swipe') coreChat.pop();
    coreChat = coreChat.map((chatItem, index) => {
        const regexType = chatItem.is_user ? RX.regex_placement.USER_INPUT : RX.regex_placement.AI_OUTPUT;
        const options = { isPrompt: true, depth: (coreChat.length - index - (isContinue ? 2 : 1)) };
        return { ...chatItem, mes: RX.getRegexedString(chatItem.mes, regexType, options), index };
    });
    // 4530-4557：思考内容回放（默认 add_to_prompts 关，只是走一遍）
    const promptReasoning = new RS.PromptReasoning();
    lastPromptReasoning = promptReasoning;
    for (let i = coreChat.length - 1; i >= 0; i--) {
        const depth = coreChat.length - i - (isContinue ? 2 : 1);
        const isPrefix = isContinue && i === coreChat.length - 1;
        coreChat[i] = { ...coreChat[i], mes: promptReasoning.addToMessage(coreChat[i].mes, String(coreChat[i].extra?.reasoning ?? ''), isPrefix, coreChat[i].extra?.reasoning_duration) };
        if (promptReasoning.isLimitReached()) break;
    }

    // 4559-4560：上下文上限（Chat Completion 下 = openai_max_context − openai_max_tokens）
    const this_max_context = S.getMaxPromptTokens();
    // 4562-4573：生成拦截器——这次没装扩展，跳过

    // 4616：示范对话按 <START> 切块
    let mesExamplesArray = S.parseMesExamples(mesExamples, false);

    // 4619：作者注释
    AN.setFloatingPrompt();

    // 4621-4636：世界书
    S.setExtensionPrompt(C.inject_ids.QUIET_PROMPT, quietPrompt || '', S.extension_prompt_types.IN_PROMPT, 0, true);
    const chatForWI = coreChat.map(x => WI.world_info_include_names ? `${x.name}: ${x.mes}` : x.mes).reverse();
    const globalScanData = {
        personaDescription: persona,
        characterDescription: description,
        characterPersonality: personality,
        characterDepthPrompt: charDepthPrompt,
        scenario: scenario,
        creatorNotes: creatorNotes,
        trigger: C.GENERATION_TYPE_TRIGGERS.includes(type) ? type : 'normal',
    };
    lastActivated = [];
    const wiResult = await WI.getWorldInfoPrompt(chatForWI, this_max_context, dryRun, globalScanData);
    const { worldInfoBefore, worldInfoAfter, worldInfoExamples, worldInfoDepth, outletEntries } = wiResult;
    S.setExtensionPrompt(C.inject_ids.QUIET_PROMPT, '', S.extension_prompt_types.IN_PROMPT, 0, true);

    // 4638-4655：世界书里「示范对话前 / 后」的条目并进示范对话
    for (const example of worldInfoExamples) {
        const exampleMessage = example.content;
        if (exampleMessage.length === 0) continue;
        const cleanedExample = S.parseMesExamples(S.baseChatReplace(exampleMessage), false);
        if (example.position === WI.wi_anchor_position.before) mesExamplesArray.unshift(...cleanedExample);
        else mesExamplesArray.push(...cleanedExample);
    }

    // 4664-4681：世界书 @depth 条目注册成 IN_CHAT 注入
    if (skipWIAN !== true) {
        S.flushWIInjections();
        if (Array.isArray(worldInfoDepth)) {
            worldInfoDepth.forEach((e) => {
                const joinedEntries = e.entries.join('\n');
                S.setExtensionPrompt(C.inject_ids.CUSTOM_WI_DEPTH_ROLE(e.depth, e.role), joinedEntries, S.extension_prompt_types.IN_CHAT, e.depth, false, e.role);
            });
        }
        if (outletEntries && typeof outletEntries === 'object' && Object.keys(outletEntries).length > 0) {
            Object.entries(outletEntries).forEach(([key, value]) => {
                S.setExtensionPrompt(C.inject_ids.CUSTOM_WI_OUTLET(key), value.join('\n'), S.extension_prompt_types.NONE, 0);
            });
        }
    }

    // 4684：用户人设
    S.addPersonaDescriptionExtensionPrompt();

    // 4767-4780、4866-4871、4976-4980：continue 时被续写的那条单独拿出来
    let cyclePrompt = '';
    if (isContinue && coreChat.length) {
        cyclePrompt = coreChat[coreChat.length - 1].mes;
        if (!cyclePrompt.endsWith(' ')) cyclePrompt += OAI.oai_settings.continue_postfix;
    }

    // 4833-4836：转成 Chat Completion 的消息
    const oaiMessages = OAI.setOpenAIMessages(coreChat);
    const oaiMessageExamples = OAI.setOpenAIMessageExamples(mesExamplesArray);

    // 5288-5303 → openai.js:1542 prepareOpenAIMessages：槽位、注入、预算
    const extensionPromptsSnapshot = structuredClone(Object.fromEntries(Object.entries(S.extension_prompts).map(([k, v]) => [k, { ...v, filter: undefined }])));
    const [prompt, counts] = await OAI.prepareOpenAIMessages({
        name2: S.name2,
        charDescription: description,
        charPersonality: personality,
        scenario: scenario,
        worldInfoBefore: worldInfoBefore,
        worldInfoAfter: worldInfoAfter,
        extensionPrompts: S.extension_prompts,
        bias: promptBias,
        type: type,
        quietPrompt: quietPrompt,
        quietImage: null,
        cyclePrompt: cyclePrompt,
        systemPromptOverride: system,
        jailbreakPromptOverride: jailbreak,
        messages: oaiMessages,
        messageExamples: oaiMessageExamples,
    }, dryRun);

    // 每条进了上下文的消息的 identifier 和 token 数（ChatCompletion 记账，供 Prompt Manager 显示）
    const cc = OAI.promptManager.messages;
    const ledger = cc ? flattenLedger(cc) : null;

    // openai.js:3138 sendOpenAIRequest → 2691 createGenerationParameters
    const model = OAI.getChatCompletionModel(OAI.oai_settings);
    const { generate_data } = await OAI.createGenerationParameters(OAI.oai_settings, model, type, prompt);

    // 服务端 src/endpoints/backends/chat-completions.js:1071-1139 sendDeepSeekRequest 拼请求体
    const deepseek = buildDeepSeekRequest(generate_data);

    return {
        type, coreChatLength: coreChat.length, this_max_context,
        wi: summarizeWI(wiResult, lastActivated), chatForWI,
        extensionPrompts: extensionPromptsSnapshot,
        prompt, counts, ledger, generate_data, deepseek,
        continueMag: isContinue ? cyclePrompt : '',
    };
}

function flattenLedger(collection) {
    const out = [];
    const walk = (item) => {
        if (item && Array.isArray(item.collection)) {
            for (const x of item.collection) walk(x);
            return;
        }
        if (item && item.role) out.push({ identifier: item.identifier, role: item.role, tokens: item.tokens, content: item.content });
    };
    walk(collection);
    return out;
}

function summarizeWI(r, activated) {
    return {
        before: r.worldInfoBefore, after: r.worldInfoAfter,
        examples: r.worldInfoExamples, depth: r.worldInfoDepth,
        anBefore: r.anBefore, anAfter: r.anAfter, outlets: r.outletEntries,
        activated: activated.map(e => ({ world: e.world, uid: e.uid, comment: e.comment, key: e.key, position: e.position, depth: e.depth, order: e.order })),
    };
}

/** chat-completions.js:1071-1139 里 sendDeepSeekRequest 拼请求体的部分，原样照抄；发请求那步交给别的进程 */
export function buildDeepSeekRequest(body) {
    const request = { body: structuredClone(body) };
    const API_DEEPSEEK = 'https://api.deepseek.com/beta';                              // chat-completions.js:86
    const apiUrl = new URL(request.body.reverse_proxy || API_DEEPSEEK).toString();
    let bodyParams = {};
    if (request.body.logprobs > 0) {
        bodyParams['top_logprobs'] = request.body.logprobs;
        bodyParams['logprobs'] = true;
    }
    const processedMessages = PC.addAssistantPrefix(PC.postProcessPrompt(request.body.messages, PC.PROMPT_PROCESSING_TYPE.SEMI_TOOLS, PC.getPromptNames(request)), bodyParams.tools, 'prefix');
    PC.addReasoningContentToToolCalls(processedMessages);
    if (request.body.include_reasoning && request.body.reasoning_effort) {
        bodyParams['reasoning_effort'] = request.body.reasoning_effort;
    }
    const requestBody = {
        'messages': processedMessages,
        'model': request.body.model,
        'temperature': request.body.temperature,
        'max_tokens': request.body.max_tokens,
        'stream': request.body.stream,
        'presence_penalty': request.body.presence_penalty,
        'frequency_penalty': request.body.frequency_penalty,
        'top_p': request.body.top_p,
        'stop': request.body.stop,
        'seed': request.body.seed,
        'thinking': { type: request.body.include_reasoning ? 'enabled' : 'disabled' },
        ...bodyParams,
    };
    return { url: apiUrl + '/chat/completions', body: JSON.parse(JSON.stringify(requestBody)) };
}

/** Generate 的 onSuccess（5486-5535）：取正文和思考、清洗、存进 chat */
export async function receive({ type = 'normal', data, continueMag = '' }) {
    const isImpersonate = type == 'impersonate';
    const isContinue = type == 'continue';
    let getMessage = S.extractMessageFromData(data);
    let reasoning = RS.extractReasoningFromData(data);
    getMessage = S.cleanUpMessage({ getMessage, isImpersonate, isContinue, displayIncompleteSentences: false });
    reasoning = RX.getRegexedString(reasoning, RX.regex_placement.REASONING);
    if (PU.power_user.trim_spaces) reasoning = reasoning.trim();
    if (isContinue) {
        continueMag = lastPromptReasoning ? lastPromptReasoning.removePrefix(continueMag) : continueMag;
        getMessage = continueMag + getMessage;
    }
    getMessage = S.cleanUpMessage({ getMessage, isImpersonate, isContinue, displayIncompleteSentences: type === 'quiet' });
    if (isImpersonate || type === 'quiet') return { type, getMessage, reasoning };
    const res = await S.saveReply({ type: isContinue ? 'appendFinal' : type, getMessage, reasoning });
    return { ...res, reasoning, message: S.chat[S.chat.length - 1] };
}

export function snapshot() {
    return { chat: structuredClone(S.chat), chat_metadata: structuredClone(S.chat_metadata) };
}

export function stubHits() {
    return Object.fromEntries([...globalThis.__stubHits.entries()].filter(([k]) => !k.startsWith('$(') && !k.startsWith('toastr')));
}
