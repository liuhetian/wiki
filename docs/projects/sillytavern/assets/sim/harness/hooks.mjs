// Node 模块加载钩子：原样加载酒馆的源码文件，只把指定的依赖模块换成桩。
// 桩模块的导出名 = 全仓库实际 import 了它哪些名字；stubs/<相对 public 的路径>.mjs 里手写了的用手写的，其余给空桩。
import { pathToFileURL, fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const HARNESS = path.dirname(fileURLToPath(import.meta.url));
const ST = process.env.ST_ROOT;
const PUB = path.join(ST, 'public');
const SRC = path.join(ST, 'src');
const STUB_DIR = path.join(HARNESS, 'stubs');
const SHIMS_URL = pathToFileURL(path.join(HARNESS, 'shims.mjs')).href;
const BARE_PARENT = pathToFileURL(path.join(HARNESS, 'package.json')).href;

// public/ 下只有 ST_REAL 列出的模块原样加载，其余一律换成桩；src/ 下只有 ST_STUBS 列出的换成桩
const REAL_FILE = path.join(HARNESS, 'real.txt');
const REAL = new Set([
    ...(process.env.ST_REAL || '').split(','),
    ...(fs.existsSync(REAL_FILE) ? fs.readFileSync(REAL_FILE, 'utf8').split('\n').map(s => s.replace(/#.*$/, '').trim()) : []),
].filter(Boolean));
const SRC_STUBS = new Set(['src/util.js', ...(process.env.ST_STUBS || '').split(',').filter(Boolean)]);
const STUBBED = {
    has(rel) {
        if (rel.startsWith('public' + path.sep)) return !REAL.has(rel);
        return SRC_STUBS.has(rel);
    },
};

function isBare(s) {
    return !(s.startsWith('.') || s.startsWith('/') || s.startsWith('node:') || s.startsWith('file:') || s.startsWith('data:'));
}

// ---------- 扫描：每个模块被 import 了哪些名字 ----------
let importMap = null;
function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.js')) out.push(p);
    }
    return out;
}
function resolveSpec(fromFile, spec) {
    if (spec.startsWith('/')) return path.join(PUB, spec);
    if (spec.startsWith('.')) return path.resolve(path.dirname(fromFile), spec);
    return null;
}
function buildImportMap() {
    const map = new Map();
    const add = (target, name) => {
        if (!map.has(target)) map.set(target, new Set());
        map.get(target).add(name);
    };
    const files = [...walk(path.join(PUB, 'scripts')), path.join(PUB, 'script.js'), ...walk(SRC)];
    const re = /(?:import|export)\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
    for (const f of files) {
        const text = fs.readFileSync(f, 'utf8');
        for (const m of text.matchAll(re)) {
            const clause = m[1];
            const target = resolveSpec(f, m[2]);
            if (!target) continue;
            if (/^[\s\S]*\*\s+as\s+\w+/.test(clause) && !clause.includes('{')) { add(target, '*'); continue; }
            const braces = clause.match(/\{([\s\S]*?)\}/);
            if (braces) {
                for (let part of braces[1].split(',')) {
                    part = part.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
                    if (!part) continue;
                    part = part.replace(/^type\s+/, '');
                    const name = part.split(/\s+as\s+/)[0].trim();
                    if (/^[A-Za-z_$][\w$]*$/.test(name)) add(target, name === 'default' ? 'default' : name);
                }
            }
            const head = clause.replace(/\{[\s\S]*?\}/, '').replace(/,/g, ' ').trim();
            if (/^[A-Za-z_$][\w$]*$/.test(head) && !clause.startsWith('*') && m[0].startsWith('import')) add(target, 'default');
        }
    }
    return map;
}

function exportedNames(file, seen = new Set()) {
    const names = new Set();
    if (!fs.existsSync(file) || seen.has(file)) return names;
    seen.add(file);
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
    for (const m of text.matchAll(/export\s*\{([^}]*)\}(?!\s*from)/g)) {
        for (const p of m[1].split(',')) {
            const n = p.trim().split(/\s+as\s+/).pop().trim();
            if (n) names.add(n);
        }
    }
    for (const m of text.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
        for (const p of m[1].split(',')) {
            const n = p.trim().split(/\s+as\s+/).pop().trim();
            if (n) names.add(n);
        }
    }
    for (const m of text.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g)) {
        const target = m[1].startsWith('.') ? path.resolve(path.dirname(file), m[1]) : m[1];
        for (const n of exportedNames(target, seen)) if (n !== 'default') names.add(n);
    }
    if (/export\s+default\s/.test(text)) names.add('default');
    return names;
}

function wantedMissing(target) {
    importMap ??= buildImportMap();
    const rel = path.relative(ST, target);
    const overrideFile = path.join(STUB_DIR, rel + '.mjs');
    const have = exportedNames(overrideFile);
    const wanted = importMap.get(target) || new Set();
    return { rel, overrideFile, have, missing: [...wanted].filter(n => n !== '*' && n !== 'default' && !have.has(n)), wantsDefault: wanted.has('default') };
}

function genStub(target) {
    const { rel, overrideFile, have, wantsDefault } = wantedMissing(target);
    const lines = [];
    if (fs.existsSync(overrideFile)) lines.push(`export * from ${JSON.stringify(pathToFileURL(overrideFile).href)};`);
    lines.push(`export * from ${JSON.stringify('ststub-auto:' + target)};`);
    if (have.has('default')) lines.push(`export { default } from ${JSON.stringify(pathToFileURL(overrideFile).href)};`);
    else if (wantsDefault) lines.push(`export { default } from ${JSON.stringify('ststub-auto:' + target)};`);
    return lines.join('\n');
}

// 自动空桩单独成模块，只依赖 shims：循环依赖里先被读到也不会卡在初始化之前
function genAuto(target) {
    const { rel, have, missing, wantsDefault } = wantedMissing(target);
    const lines = [`import { anyStub as __any } from ${JSON.stringify(SHIMS_URL)};`];
    for (const n of missing) lines.push(`export const ${n} = __any(${JSON.stringify(rel + ':' + n)});`);
    if (wantsDefault && !have.has('default')) lines.push(`export default __any(${JSON.stringify(rel + ':default')});`);
    return lines.join('\n');
}

export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('ststub-auto:')) return { url: specifier, shortCircuit: true, format: 'module' };
    const parent = context.parentURL?.startsWith('file:') ? fileURLToPath(context.parentURL) : '';
    const inST = parent.startsWith(ST);
    if (inST && specifier.startsWith('/') && !specifier.startsWith(ST)) {
        specifier = pathToFileURL(path.join(PUB, specifier)).href;
    }
    if ((inST || parent.startsWith(STUB_DIR)) && isBare(specifier)) {
        return nextResolve(specifier, { ...context, parentURL: BARE_PARENT });
    }
    const r = await nextResolve(specifier, context);
    if (r.url.startsWith('file:')) {
        const file = fileURLToPath(r.url);
        if (file.startsWith(ST) && STUBBED.has(path.relative(ST, file))) {
            return { url: 'ststub:' + file, shortCircuit: true, format: 'module' };
        }
    }
    return r;
}

export async function load(url, context, nextLoad) {
    if (url.startsWith('ststub-auto:')) {
        return { format: 'module', source: genAuto(url.slice('ststub-auto:'.length)), shortCircuit: true };
    }
    if (url.startsWith('ststub:')) {
        return { format: 'module', source: genStub(url.slice('ststub:'.length)), shortCircuit: true };
    }
    return nextLoad(url, context);
}
