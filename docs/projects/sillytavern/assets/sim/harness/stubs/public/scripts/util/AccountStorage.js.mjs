// util/AccountStorage.js 的桩：按用户隔离的 localStorage 包装，这里直接用内存版 localStorage。
export const accountStorage = {
    getItem: (k) => globalThis.localStorage.getItem(k),
    setItem: (k, v) => globalThis.localStorage.setItem(k, v),
    removeItem: (k) => globalThis.localStorage.removeItem(k),
};
