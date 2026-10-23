// tool-calling.js 的桩：新装酒馆的函数调用总开关 function_calling 默认关，ToolManager 一律回答「不调工具」。
export class ToolManager {
    static RECURSE_LIMIT = 5;
    static isToolCallingSupported() { return false; }
    static canPerformToolCalls() { return false; }
    static async registerFunctionToolsOpenAI() {}
    static parseToolCalls() {}
    static hasToolCalls() { return false; }
    static get tools() { return []; }
}
