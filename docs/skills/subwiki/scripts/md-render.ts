/**
 * 服务端占位符渲染（TypeScript 版），语义与 live.js、placeholders.py 一致。
 *
 * Markdown 里的 {{ api("/path").a.b }} 会被替换成接口返回 JSON 里对应字段的值：
 *   - 同一文档里相同 URL 只请求一次；
 *   - ``` / ~~~ 围栏代码块和 `行内代码` 里的占位符保持原样（对应 live.js 跳过 code/pre）；
 *   - 取值和格式化直接沿用 live.js 的写法（obj?.[key]、JSON.stringify、String(value ?? "")）；
 *   - 请求失败或返回非 JSON 时输出「加载失败」。
 *
 * 共享测试用例：placeholder_cases.json。
 */

export type FetchJson = (url: string) => Promise<unknown>;

// 与 live.js 的 PATTERN 相同
const PATTERN = /\{\{\s*api\(\s*(["'])(.+?)\1\s*\)((?:\.[\w$]+)*)\s*\}\}/g;
const FENCE_OPEN = /^\s*(`{3,}|~{3,})/;
const INLINE_CODE = /(?<!`)(`+)(?!`)(.*?)(?<!`)\1(?!`)/g;
const LINES = /[^\n]*\n|[^\n]+/g; // 只按 \n 切行（保留换行符），与 Python 版一致
const FAILED = "加载失败";

type Segment = { replaceable: boolean; text: string };

/** 把 Markdown 切成片段：代码块和行内代码不可替换。 */
function splitSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let fence: { char: string; size: number } | null = null;
  for (const line of text.match(LINES) ?? []) {
    if (fence !== null) {
      segments.push({ replaceable: false, text: line });
      const stripped = line.trim();
      if (
        stripped.length >= fence.size &&
        [...stripped].every((ch) => ch === fence!.char)
      ) {
        fence = null;
      }
      continue;
    }
    const open = FENCE_OPEN.exec(line);
    if (open) {
      fence = { char: open[1][0], size: open[1].length };
      segments.push({ replaceable: false, text: line });
      continue;
    }
    let last = 0;
    for (const code of line.matchAll(INLINE_CODE)) {
      segments.push({ replaceable: true, text: line.slice(last, code.index) });
      segments.push({ replaceable: false, text: code[0] });
      last = code.index + code[0].length;
    }
    segments.push({ replaceable: true, text: line.slice(last) });
  }
  return segments;
}

/** 文档中（代码块以外）出现的占位符 URL，按出现顺序去重。 */
export function findPlaceholders(text: string): string[] {
  const urls: string[] = [];
  for (const seg of splitSegments(text)) {
    if (!seg.replaceable) continue;
    for (const m of seg.text.matchAll(PATTERN)) {
      if (!urls.includes(m[2])) urls.push(m[2]);
    }
  }
  return urls;
}

/** 与 live.js 相同的取值和格式化。 */
function formatValue(data: unknown, keys: string[]): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = keys.reduce((obj: any, key) => obj?.[key], data);
  return value !== null && typeof value === "object"
    ? JSON.stringify(value)
    : String(value ?? "");
}

/** 把文档里的占位符替换成实时数据。fetchJson(url) 返回解析后的 JSON，失败时抛异常。 */
export async function renderMarkdown(text: string, fetchJson: FetchJson): Promise<string> {
  const segments = splitSegments(text);
  const urls = findPlaceholders(text);
  const settled = await Promise.allSettled(urls.map((url) => fetchJson(url)));
  const results = new Map(urls.map((url, i) => [url, settled[i]]));

  return segments
    .map((seg) =>
      seg.replaceable
        ? seg.text.replace(PATTERN, (_whole, _quote, url: string, path: string) => {
            const result = results.get(url)!;
            if (result.status === "rejected") return FAILED;
            return formatValue(result.value, path.split(".").filter(Boolean));
          })
        : seg.text
    )
    .join("");
}
