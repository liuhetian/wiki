// 生成三个桩模块，里面的函数全部从酒馆源码按名字原样切出（extract.mjs），一字不改：
//   stubs/public/script-state.mjs      script.js 的常量和模块级状态（单独成模块，没有 import，循环依赖时先初始化）
//   stubs/public/script.js.mjs         script.js 里用得到的函数；纯界面的几个（渲染消息、图片附件）换成空函数
//   stubs/public/scripts/group-chats.js.mjs  群聊调度函数（原文件没有导出它们）
// script.js / group-chats.js 一加载就要整个前端（顶层等 document ready、操作 DOM），所以不能直接 import。
import fs from 'node:fs';
import path from 'node:path';
import { extractDecls } from './extract.mjs';

const ST = process.env.ST_ROOT;
const PUB = path.join(ST, 'public');
const HERE = path.dirname(new URL(import.meta.url).pathname);
const P = (rel) => JSON.stringify(path.join(PUB, rel));
const listing = (file, decls) => `// 原样切自 ${file}（行号是原文件的）：\n` + decls.map(d => `//   ${d.name}  ${d.startLine}-${d.endLine}`).join('\n');

// ---------- script-state.mjs ----------
const CONSTS = ['neutralCharacterName', 'extension_prompt_types', 'extension_prompt_roles', 'MAX_INJECTION_DEPTH', 'talkativeness_default',
    'depth_prompt_depth_default', 'depth_prompt_role_default', 'default_avatar', 'system_avatar'];
const constDecls = [
    ...extractDecls(path.join(PUB, 'scripts/system-messages.js'), ['system_message_types']),
    ...extractDecls(path.join(PUB, 'script.js'), CONSTS),
];
const STATE = {
    name1: '\'User\'', name2: '\'SillyTavern System\'', chat: '[]', characters: '[]', this_chid: 'undefined',
    chat_metadata: '{}', extension_prompts: '{}', main_api: '\'openai\'', online_status: '\'no_connection\'',
    user_avatar: '\'user-default.png\'', is_send_press: 'false', generation_started: 'new Date()',
    max_context: '8192', amount_gen: '350',
};
fs.writeFileSync(path.join(HERE, 'stubs/public/script-state.mjs'),
    `// 自动生成，勿手改。script.js 的常量和模块级状态；实跑脚本用 __set 改状态。\n${listing('public/script.js 与 public/scripts/system-messages.js', constDecls)}\n`
    + constDecls.map(d => d.text).join('\n') + '\n\n'
    + Object.entries(STATE).map(([k, v]) => `export let ${k} = ${v};`).join('\n') + '\n'
    + `export function __set(key, value) {\n    switch (key) {\n${Object.keys(STATE).map(k => `        case '${k}': ${k} = value; break;`).join('\n')}\n        default: throw new Error('unknown key ' + key);\n    }\n}\n`);

// ---------- script.js.mjs ----------
const fromScript = extractDecls(path.join(PUB, 'script.js'), [
    'getCurrentChatId', 'substituteParams', 'addPersonaDescriptionExtensionPrompt', 'getAllExtensionPrompts',
    'getExtensionPromptByName', 'getExtensionPromptMaxDepth', 'getExtensionPrompt', 'baseChatReplace',
    'createLazyFields', 'getCharacterCardFieldsLazy', 'getCharacterCardFields', 'parseMesExamples',
    'extractMessageBias', 'getBiasStrings', 'flushWIInjections', 'setExtensionPrompt',
    'getExtensionPromptRoleByName', 'removeDepthPrompts', 'syncMesToSwipe', 'syncSwipeToMes', 'ensureSwipes',
    'getMaxContextTokens', 'getMaxResponseTokens', 'getMaxPromptTokens',
    'saveReply', 'cleanUpMessage', 'cleanGroupMessage', 'getStoppingStrings', 'extractMessageFromData',
    'getGeneratingApi', 'getGeneratingModel', 'doChatInject', 'getFirstMessage',
    'substituteParamsExtended', 'getMediaDisplay', 'getMediaIndex', 'substituteParamsLegacy',
    'saveChat', 'getCurrentChatDetails', 'updateMessage', 'removeMacros',
]);
const scriptHeader = `// 自动生成，勿手改。
${listing('public/script.js', fromScript)}
export * from './script-state.mjs';
import { ${[...CONSTS, 'system_message_types', ...Object.keys(STATE)].join(', ')} } from './script-state.mjs';
import { Handlebars } from ${P('lib.js')};
import { power_user, collapseNewlines, fixMarkdown, getCustomStoppingStrings } from ${P('scripts/power-user.js')};
import { persona_description_positions } from ${P('scripts/personas.js')};
import { NOTE_MODULE_NAME, metadata_keys, shouldWIAddPrompt } from ${P('scripts/authors-note.js')};
import { extension_settings } from ${P('scripts/extensions.js')};
import { selected_group, groups, getGroupCharacterCardsLazy, getGroupNames, group_generation_id } from ${P('scripts/group-chats.js')};
import { inject_ids, MEDIA_DISPLAY } from ${P('scripts/constants.js')};
import { MacroEnvBuilder } from ${P('scripts/macros/engine/MacroEnvBuilder.js')};
import { MacroEngine } from ${P('scripts/macros/engine/MacroEngine.js')};
import { getChatCompletionModel, oai_settings } from ${P('scripts/openai.js')};
import { getRegexedString, regex_placement } from ${P('scripts/extensions/regex/engine.js')};
import { escapeRegex, trimToEndSentence } from ${P('scripts/utils.js')};
import { PromptReasoning, parseReasoningInSwipes } from ${P('scripts/reasoning.js')};
import { getInstructStoppingSequences } from ${P('scripts/instruct-mode.js')};
import { getMessageTimeStamp } from ${P('scripts/RossAscends-mods.js')};
import { getTokenCountAsync } from ${P('scripts/tokenizers.js')};
import { eventSource, event_types } from ${P('scripts/events.js')};
import { evaluateMacros } from ${P('scripts/macros.js')};
import { compressRequest } from ${P('scripts/request-compression.js')};
import { uuidv4 } from ${P('scripts/utils.js')};
export { eventSource, event_types };

// ---- 纯界面的函数换成空函数：渲染消息、图片附件、头像缩略图 ----
function addOneMessage() {}
async function processImageAttachment() {}
function getThumbnailUrl() { return ''; }
function statMesProcess() {}
// ---- 其余 script.js 导出，实跑用不到具体行为 ----
export function getRequestHeaders() { return { 'Content-Type': 'application/json' }; }
export function saveSettingsDebounced() {}
export async function saveChatConditional() {}
export async function saveMetadata() {}
export function getCharacterAvatar() { return ''; }
`;
fs.writeFileSync(path.join(HERE, 'stubs/public/script.js.mjs'), scriptHeader + '\n'
    + fromScript.map(d => d.text).join('\n\n')
    + '\nexport { flushWIInjections, addPersonaDescriptionExtensionPrompt, getAllExtensionPrompts, cleanGroupMessage, doChatInject, getFirstMessage, updateMessage };\n');

// ---------- group-chats.js.mjs ----------
const fromGroup = extractDecls(path.join(PUB, 'scripts/group-chats.js'), [
    'group_activation_strategy', 'group_generation_mode',
    'getGroupNames', 'getGroupDepthPrompts', 'getGroupCharacterCardsLazy',
    'activateImpersonate', 'activateSwipe', 'activateListOrder', 'activatePooledOrder', 'activateNaturalOrder',
    'getFirstCharacterMessage',
]);
fs.mkdirSync(path.join(HERE, 'stubs/public/scripts'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'stubs/public/scripts/group-chats.js.mjs'), `// 自动生成，勿手改。
${listing('public/scripts/group-chats.js', fromGroup)}
import { characters, chat, substituteParams, baseChatReplace, getExtensionPromptRoleByName, talkativeness_default, depth_prompt_depth_default, depth_prompt_role_default, createLazyFields, chat_metadata, name1, name2, eventSource, event_types, default_avatar } from ${P('script.js')};
import { getMessageTimeStamp } from ${P('scripts/RossAscends-mods.js')};
const getThumbnailUrl = () => '';
import { shuffle, extractAllWords, onlyUnique } from ${P('scripts/utils.js')};
import { power_user } from ${P('scripts/power-user.js')};
import { extension_settings } from ${P('scripts/extensions.js')};
export let groups = [];
export let selected_group = null;
export function __setGroup(list, id) { groups = list; selected_group = id; }
export let group_generation_id = null;
export function __setGroupGenId(v) { group_generation_id = v; }

` + fromGroup.map(d => d.text).join('\n\n')
    + '\nexport { activateImpersonate, activateSwipe, activateListOrder, activatePooledOrder, activateNaturalOrder, getFirstCharacterMessage };\n');
// ---------- server-count.mjs：服务端按 DeepSeek 分词器数 token 的那几行 ----------
const fromTok = extractDecls(path.join(ST, 'src/endpoints/tokenizers.js'), ['countWebTokenizerTokens']);
fs.writeFileSync(path.join(HERE, 'stubs/server-count.mjs'), `// 自动生成，勿手改。\n${listing('src/endpoints/tokenizers.js', fromTok)}\n`
    + `function guesstimate(str) { return Math.ceil(new TextEncoder().encode(str).length / 3.35); }\n` + fromTok.map(d => d.text).join('\n') + '\n');
console.log('ok', constDecls.length, fromScript.length, fromGroup.length);

// ---------- memory-ext.mjs：摘要扩展里决定「何时摘要、提示词是什么、摘要放哪」的几段 ----------
const MEM = path.join(PUB, 'scripts/extensions/memory/index.js');
const fromMem = extractDecls(MEM, ['MODULE_NAME', 'summary_sources', 'prompt_builders', 'defaultPrompt', 'defaultTemplate', 'defaultSettings',
    'formatMemoryValue', 'getSummaryPromptForNow', 'setMemoryContext']);
fs.writeFileSync(path.join(HERE, 'stubs/memory-ext.mjs'), `// 自动生成，勿手改。\n${listing('public/scripts/extensions/memory/index.js', fromMem)}
import { substituteParamsExtended, setExtensionPrompt, extension_prompt_types, extension_prompt_roles, is_send_press } from ${P('script.js')};
import { extension_settings, getContext } from ${P('scripts/extensions.js')};
import { selected_group, is_group_generating } from ${P('scripts/group-chats.js')};
import { waitUntilCondition, extractAllWords } from ${P('scripts/utils.js')};
const saveChatDebounced = () => {};
` + fromMem.map(d => d.text).join('\n\n') + '\nexport { MODULE_NAME, defaultSettings, formatMemoryValue, getSummaryPromptForNow, setMemoryContext };\n');
