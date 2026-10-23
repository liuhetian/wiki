// RossAscends-mods.js 的桩：只要时间戳函数（原样照抄 RossAscends-mods.js:192-195）。
export function getMessageTimeStamp(timestamp = Date.now()) {
    const date = new Date(timestamp);
    return date.toISOString();
}
export function isMobile() { return false; }
