// src/util.js 的桩（它顶层拉一串 npm 包，没设 config 路径还会 process.exit）。
// getConfigValue 读新装酒馆的 default/config.yaml，按点号路径取值，取不到用调用方给的默认值；tryParse 原样照抄 util.js:571-577。
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
const config = yaml.parse(fs.readFileSync(path.join(process.env.ST_ROOT, 'default/config.yaml'), 'utf8'));
export function getConfigValue(key, defaultValue = null, typeConverter = null) {
    let v = key.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), config);
    if (v === undefined) v = defaultValue;
    if (typeConverter === 'number') return Number(v);
    if (typeConverter === 'boolean') return v === true || v === 'true';
    return v;
}
export function tryParse(str) {
    try {
        return JSON.parse(str);
    } catch {
        return undefined;
    }
}
export function color() { return ''; }
