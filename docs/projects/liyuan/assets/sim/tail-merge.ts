import { classifyTag, scanTaggedBlocks } from "file:///tmp/liyuan-src/Liyuan/src/postprocess.ts";
// 原样摘自 src/stage/engine.ts:461-599（钉 1e9448e），引擎文件依赖未安装的包，不能整体导入
const TAG_NAME_SRC = "[A-Za-z_\\u4e00-\\u9fff][\\w\\u4e00-\\u9fff.\\-]*";
const FENCE_LINE_RE = /^```/m;
const FENCE_BLOCK_RE = /```[\s\S]*?```/g;
/** 逐个扫标签名，用于跳过 fold/strip 类（它们不是格式内容） */
const TAG_SCAN_RE = new RegExp(`<(${TAG_NAME_SRC})(?:\\s[^>]*)?\\/?\\s*>`, "g");
/** 成对块，用于把 fold/strip 类整块从尾巴里剔掉 */
const SELF_CLOSING_RE = new RegExp(`<(${TAG_NAME_SRC})(?:\\s[^>]*)?\\/\\s*>`, "g");

/**
 * 尾巴里格式内容的起点（第一个尖括号标签或行首 ``` 围栏）；没有 → -1。
 *
 * 8/10 实弹收口：旧口径整串检验、整串拼接——元话语（收笔自检逐条、ask 开场白
 * 起了又劝退）挂在格式块前面时跟着一起进定稿（HK 5 会话 11 拍：7 个裸尾巴段
 * 里 3 个带元话语，41 个稿段 0 违约）。改为**只取格式内容**：从第一个标签/围栏
 * 起切，之前的自由文本一律丢弃；纯自由文本尾巴（闲聊收笔）仍整段不进正文。
 */
export const formatTailStart = (tail: string): number => {
	TAG_SCAN_RE.lastIndex = 0;
	let tag = -1;
	for (let m = TAG_SCAN_RE.exec(tail); m; m = TAG_SCAN_RE.exec(tail)) {
		if (classifyTag(m[1]!) === "unwrap") {
			tag = m.index;
			break;
		}
	}
	const fence = FENCE_LINE_RE.exec(tail)?.index ?? -1;
	if (tag < 0) return fence;
	return fence < 0 ? tag : Math.min(tag, fence);
};



/**
 * 尾巴 → **只留格式内容**：格式类标签块 + ``` 围栏块，按原序拼回；块之外的自由文本
 * 一律丢弃。
 *
 * 8/10 只挡了「格式块之前」的自由文本（起点切一刀）。8/16 实弹暴露另一半：模型在
 * 尾巴里把**整段正文重述了一遍**，夹在 `<time_format>` 与 `<options>` 之间——起点切
 * 不到它（它在第一个格式块之后），`trimContentBodyRepeat` 也管不到（它只认
 * `<content>` 包裹的重述）。于是定稿里正文出现两遍。
 *
 * 判据仍是「块 vs 非块」，不认名字：块＝成对标签（policy 由 classifyTag 定，fold/strip
 * 类不算格式内容）或 ``` 围栏。
 */
const formatContentOnly = (tail: string): string => {
	type Span = { start: number; end: number; text: string };
	const spans: Span[] = [];
	// 先剥 HTML 注释再扫块（同 extractDraftBody）：注释里的 `<Prism>` 这类会被当成无闭合
	// 标签，一路吃到文末，把注释后面的裸重述正文整段包进「格式块」（8/16 实弹踩到）。
	const src = tail.replace(/<!--[\s\S]*?-->/g, "");
	FENCE_BLOCK_RE.lastIndex = 0;
	for (let m = FENCE_BLOCK_RE.exec(src); m; m = FENCE_BLOCK_RE.exec(src)) {
		spans.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
	}
	for (const b of scanTaggedBlocks(src)) {
		if (b.policy !== "unwrap") continue; // fold/strip 类不是格式内容
		if (b.hanging) continue; // 无闭合＝不是成形的格式块，别拿它当筐把正文装进来
		spans.push({ start: b.start, end: b.end, text: b.raw });
	}
	// 自闭合格式标签（`<StatusPlaceHolderImpl/>` 这类占位符）——scanTaggedBlocks 只找成对块
	SELF_CLOSING_RE.lastIndex = 0;
	for (let m = SELF_CLOSING_RE.exec(src); m; m = SELF_CLOSING_RE.exec(src)) {
		if (classifyTag(m[1]!) !== "unwrap") continue;
		spans.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
	}
	spans.sort((a, b) => a.start - b.start || b.end - a.end);
	const kept: Span[] = [];
	for (const s of spans) {
		const last = kept[kept.length - 1];
		if (last && s.start < last.end) continue; // 被前一块覆盖（嵌套/重叠）
		kept.push(s);
	}
	return kept
		.map((s) => s.text.trim())
		.filter(Boolean)
		.join("\n\n");
};

/**
 * 逐字相同的格式块去重（8/10 实弹：预设状态栏规则＋谢幕注入双指令源下，
 * 模型把同一份状态栏在一条尾巴里输出了两遍）。零名单零识别——块＝任意
 * `<Tag>…</Tag>`，只删与已见块**完全相同**的重复，内容有任何差异都不动。
 */
export const dedupeIdenticalBlocks = (s: string): string => {
	const seen = new Set<string>();
	return s
		.replace(/<([A-Za-z][\w-]*)>[\s\S]*?<\/\1>/g, (block) => {
			const key = block.trim();
			if (seen.has(key)) return "";
			seen.add(key);
			return block;
		})
		.replace(/\n{3,}/g, "\n\n")
		.trim();
};

/**
 * 尾巴里 `<content>` 块以正文结尾文字开头（模型按卡格式在 `<content>` 里重述正文）时，
 * 裁掉重复前缀——正文以稿件为准，定稿不得出现两遍。
 * （8/13 实弹：B1 的 `<content>` 以正文末段开头 + 新内容；B2 的 `<content>` 整段重述正文。）
 */
const trimContentBodyRepeat = (body: string, inner: string): string => {
	const d = body.trim();
	const i0 = inner.trimStart();
	if (!d || !i0) return inner;
	for (let n = Math.min(d.length, i0.length); n > 0; n--) {
		const suffix = d.slice(d.length - n);
		if (i0.startsWith(suffix)) {
			const rest = i0.slice(n).trim();
			return rest ? `\n${rest}` : "";
		}
	}
	return inner;
};

export const mergeFinalText = (draft: string, text: string): string => {
	const d = draft.trim();
	const t = text.trim();
	if (!d) return dedupeIdenticalBlocks(t);
	if (!t || d === t) return d;
	// 稿件已包含 text（模型边写边交，text 是半截）：稿件已是全量
	if (d.includes(t)) return d;
	// 只认「稿件在尾巴开头」的续写增量（正文在前、尾巴在后）；稿件出现在尾巴中段
	// 不切——格式块（state1/options 等）在正文之前，indexOf 会把它当「增量起点」把
	// 前面的格式块一起切掉（8/13 实弹：<state1>…<content>正文</content>，状态栏全丢）。
	let tail = t;
	if (t.startsWith(d)) tail = t.slice(d.length);
	const from = formatTailStart(tail);
	if (from < 0) return d;
	// 尾巴只留格式内容（块之外的自由文本／重述正文一律丢）；`<content>` 里重述的正文再裁一次
	const tailPart = formatContentOnly(tail.slice(from))
		.replace(/<content>([\s\S]*?)<\/content>/g, (whole, inner: string) => {
			const trimmed = trimContentBodyRepeat(d, inner);
			return trimmed ? `<content>${trimmed}</content>` : "";
		})
		.replace(/\n{3,}/g, "\n\n")
		.trim();
	return dedupeIdenticalBlocks([d, tailPart].filter(Boolean).join("\n\n"));
};
