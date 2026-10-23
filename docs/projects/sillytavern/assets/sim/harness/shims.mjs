// 浏览器全局量的桩：酒馆前端模块在顶层或函数里会碰 $、toastr、document、localStorage。
// 空桩吞掉一切属性访问和调用，不做任何事；碰到哪些记进 globalThis.__stubHits，便于核对没有桩进主路径。
const hits = new Map();
globalThis.__stubHits = hits;

export function anyStub(name = '?') {
    const fn = function () {};
    return new Proxy(fn, {
        get(_t, p) {
            if (p === 'then') return undefined;
            if (p === Symbol.toPrimitive) return () => '';
            if (p === Symbol.iterator) return function* () {};
            if (p === 'length') return 0;
            if (p === 'toString' || p === 'valueOf') return () => '';
            return anyStub(`${name}.${String(p)}`);
        },
        apply() {
            hits.set(name, (hits.get(name) || 0) + 1);
            return anyStub(`${name}()`);
        },
        construct() {
            hits.set('new ' + name, (hits.get('new ' + name) || 0) + 1);
            return anyStub(`new ${name}`);
        },
        has() { return false; },
        set() { return true; },
    });
}

class MemStorage {
    #m = new Map();
    getItem(k) { return this.#m.has(k) ? this.#m.get(k) : null; }
    setItem(k, v) { this.#m.set(k, String(v)); }
    removeItem(k) { this.#m.delete(k); }
    clear() { this.#m.clear(); }
    get length() { return this.#m.size; }
    key(i) { return [...this.#m.keys()][i] ?? null; }
}

globalThis.window = globalThis;
// $：选择器返回空桩，只有 .val() 读写一张「输入框当前值」表（模拟用户在界面上填的内容）；$.ajax 交给实跑脚本接管
const domValues = new Map();
globalThis.__dom = domValues;
globalThis.__ajax = async () => { throw new Error('ajax not wired'); };
function $(selector) {
    const base = anyStub(`$(${String(selector)})`);
    return new Proxy(base, {
        get(t, p) {
            if (p === 'val') return (...a) => (a.length ? (domValues.set(selector, a[0]), base) : (domValues.get(selector) ?? ''));
            return t[p];
        },
    });
}
globalThis.$ = new Proxy($, {
    get(t, p) {
        if (p === 'ajax') return (opts) => globalThis.__ajax(opts);
        if (p === 'then') return undefined;
        return anyStub(`$.${String(p)}`);
    },
});
globalThis.jQuery = globalThis.$;
globalThis.getComputedStyle = () => anyStub('computedStyle');
globalThis.toastr = anyStub('toastr');
globalThis.document = anyStub('document');
globalThis.localStorage = new MemStorage();
globalThis.sessionStorage = new MemStorage();
globalThis.Popper = anyStub('Popper');
globalThis.hljs = anyStub('hljs');
globalThis.DOMPurify = anyStub('DOMPurify');
globalThis.SillyTavern = { getContext: () => globalThis.__stContext ?? {} };
