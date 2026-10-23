// extensions.js 的桩：扩展设置是普通对象，getContext 从 script.js 桩的活绑定现拼。
import * as S from '/data2/work/lht/study/26.06/_ext/st/SillyTavern/public/script.js';
import * as V from '/data2/work/lht/study/26.06/_ext/st/SillyTavern/public/scripts/variables.js';
import { selected_group } from '/data2/work/lht/study/26.06/_ext/st/SillyTavern/public/scripts/group-chats.js';
export const extension_settings = {
    note: { default: '', chara: [], wiAddition: [], allowWIScan: false },
    regex: [],
    memory: {},
    disabledExtensions: [],
    variables: { global: {} },
    character_allowed_regex: [],
    preset_allowed_regex: {},
};
export function getContext() {
    return {
        chat: S.chat,
        characters: S.characters,
        characterId: S.this_chid,
        groupId: selected_group,
        name1: S.name1,
        name2: S.name2,
        chatMetadata: S.chat_metadata,
        extensionPrompts: S.extension_prompts,
        setExtensionPrompt: S.setExtensionPrompt,
        substituteParams: S.substituteParams,
        eventSource: S.eventSource,
        eventTypes: S.event_types,
        extensionSettings: extension_settings,
        saveMetadata: async () => {},
        tagMap: {},
        // 照 st-context.js:258-277 的映射，读写函数用 variables.js 原样加载的
        variables: {
            local: { get: V.getLocalVariable, set: V.setLocalVariable, del: V.deleteLocalVariable, add: V.addLocalVariable, inc: V.incrementLocalVariable, dec: V.decrementLocalVariable, has: V.existsLocalVariable },
            global: { get: V.getGlobalVariable, set: V.setGlobalVariable, del: V.deleteGlobalVariable, add: V.addGlobalVariable, inc: V.incrementGlobalVariable, dec: V.decrementGlobalVariable, has: V.existsGlobalVariable },
        },
    };
}
globalThis.__stContext = undefined;
Object.defineProperty(globalThis, '__stContext', { get: getContext, configurable: true });
export function saveMetadataDebounced() {}
export async function renderExtensionTemplateAsync() { return ''; }
