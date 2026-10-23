// MacroDiagnostics.js 的桩：只把诊断打到 stderr（原文件要拉弹窗）。
const err = (tag) => (o) => process.stderr.write(`[Macro ${tag}] ${o?.message ?? ''} ${o?.macroName ?? ''} ${o?.error?.message ?? ''}\n`);
export const logMacroRegisterError = err('register error');
export const logMacroRegisterWarning = err('register warning');
export const logMacroGeneralError = err('error');
export const logMacroInternalError = err('internal error');
export const logMacroRuntimeWarning = err('runtime warning');
export const logMacroSyntaxWarning = err('syntax warning');
export function createMacroRuntimeError({ message }) { return new Error(message); }
