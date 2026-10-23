// 按名字从酒馆源码里原样切出顶层声明（函数、常量），返回 { name, start, end, text }。
// 切的时候跳过字符串、模板串、注释里的括号；切出来的文本一字不改。
import fs from 'node:fs';

function findEnd(src, from, untilSemicolon = false) {
    let i = from, depth = 0, started = false;
    const stack = [];
    while (i < src.length) {
        const c = src[i], n = src[i + 1];
        if (c === '/' && n === '/') { i = src.indexOf('\n', i); if (i < 0) return src.length; continue; }
        if (c === '/' && n === '*') { i = src.indexOf('*/', i + 2) + 2; continue; }
        if (c === '/') {
            // 正则字面量：斜杠前是运算符、开括号、逗号等，按正则跳过（含字符类里的斜杠）
            let k = i - 1;
            while (k >= 0 && /\s/.test(src[k])) k--;
            if (k < 0 || '(,=:[!&|?{};+-*%<>~^'.includes(src[k]) || /\b(return|typeof|case|in|of)$/.test(src.slice(Math.max(0, k - 6), k + 1))) {
                i++;
                let inClass = false;
                while (i < src.length) {
                    if (src[i] === '\\') { i += 2; continue; }
                    if (src[i] === '[') inClass = true;
                    else if (src[i] === ']') inClass = false;
                    else if (src[i] === '/' && !inClass) break;
                    else if (src[i] === '\n') break;
                    i++;
                }
                i++;
                continue;
            }
        }
        if (c === '\'' || c === '"') {
            i++;
            while (i < src.length && src[i] !== c) { if (src[i] === '\\') i++; i++; }
            i++; continue;
        }
        if (c === '`') {
            i++;
            while (i < src.length && src[i] !== '`') {
                if (src[i] === '\\') { i += 2; continue; }
                if (src[i] === '$' && src[i + 1] === '{') {
                    // 模板里的 ${...}：递归找配对
                    const end = findEnd(src, i + 1);
                    i = end; continue;
                }
                i++;
            }
            i++; continue;
        }
        if (c === '{' || c === '(' || c === '[') { depth++; started = true; stack.push(c); }
        else if (c === '}' || c === ')' || c === ']') {
            depth--; stack.pop();
            if (started && depth === 0 && !untilSemicolon) {
                // 声明到 } 为止；常量声明要吃掉结尾的分号
                let j = i + 1;
                if (src[j] === ';') j++;
                return j;
            }
        } else if (c === ';' && depth === 0 && (untilSemicolon || !started)) { return i + 1; }
        i++;
    }
    return src.length;
}

export function extractDecls(file, names) {
    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split('\n');
    const out = [];
    for (const name of names) {
        const re = new RegExp(`^(export\\s+)?(async\\s+)?(function\\*?\\s+${name}\\s*\\(|(const|let|var)\\s+${name}\\s*=)`, 'm');
        const m = re.exec(src);
        if (!m) throw new Error(`没找到 ${name}`);
        const start = m.index;
        let end;
        if (m[3].startsWith('function')) {
            // 跳过参数表，再找函数体
            const paren = src.indexOf('(', start);
            const afterParams = findEnd(src, paren);
            const brace = src.indexOf('{', afterParams);
            end = findEnd(src, brace);
        } else {
            end = findEnd(src, start + m[0].length, true);
        }
        const startLine = src.slice(0, start).split('\n').length;
        const endLine = src.slice(0, end).split('\n').length;
        out.push({ name, startLine, endLine, text: lines.slice(startLine - 1, endLine).join('\n') });
    }
    return out;
}
