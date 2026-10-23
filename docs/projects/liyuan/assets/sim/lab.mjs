// 只调梨园源码里的函数（钉 1e9448e），不发网络请求、进程里没有 API key。
// 用法：node lab.mjs <命令> < 输入.json > 输出.json
import { readFileSync } from "node:fs";
const R = process.env.LIYUAN_REPO, H = process.env.LAB_HOME;
const imp = (p) => import(`file://${R}/${p}`);
const { loadCardFile } = await imp("src/card.ts");
const { normalizeEntries, scanEntries, searchEntries, constantEntries } = await imp("src/lorebook.ts");
const { buildStageSystemPrompt, buildStageInjection, formatLoreIndex, rebuildHistory, stateFromBranch } = await imp("src/stage/assemble.ts");
const { defaultState, applyPatch, formatState, formatRosterIndex } = await imp("src/state.ts");
const { buildScribeTurnPrompt, parseScribeResult, buildRpSummaryPrompt } = await imp("src/scribe.ts");
const { stageTools, writeTools } = await imp("src/stage/tools.ts");
const { serializeForSummary } = await imp("src/stage/compact.ts");
const { buildRecapPrompt, buildConsolidatePrompt, parseConsolidateResult, fitResidentSummary } = await imp("src/card-memory.ts");
const { loadPresetDoc } = await imp("src/preset-doc.ts");
const { assembleForDeclare, declarePieces, buildDeclarePrompt, parseDeclareResponse, translatePresetWithDeclaration } = await imp("src/preset-declare.ts");
const { renderForModel } = await imp("src/prompt-entries.ts");
const { sandboxVerdict } = await imp("src/sandbox.ts");
const { parseDenylist } = await imp("src/bash-denylist.ts");
const { checkWriteGate } = await imp("src/tools/gate.ts");
const { agentSystemPrompt, buildAgentStateBlock } = await imp("src/stage/agent.ts");
const { StoryHistory, listStoryFiles } = await imp("src/stage/story-history.ts");
const { DEFAULT_CONFIG } = await imp("src/types.ts");
const { planNewSave } = await imp("src/worldline.ts");
const { mergeFinalText } = await import(`file://${H}/tail-merge.ts`);

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const card = loadCardFile(`${R}/assets/cards/default_Qingwu.json`);
const config = { ...DEFAULT_CONFIG };
const lore = normalizeEntries(JSON.parse(readFileSync(`${H}/demo-lorebook.json`, "utf8")).entries);
const st = (s) => s ?? defaultState();
let out = {};
switch (process.argv[2]) {
case "system": {
	const liyuan = buildStageSystemPrompt({ card, config, constantLore: constantEntries(lore),
		userRules: { global: readFileSync(`${R}/assets/APPEND_SYSTEM.md`, "utf8") }, tools: true });
	const base = `${readFileSync(`${R}/assets/SYSTEM.md`, "utf8")}\nCurrent working directory: ${input.cwd}\n`;
	const all = [...writeTools(config.language), ...stageTools(config.language)];
	out = { system: `${base}\n\n${liyuan}`, base, liyuan,
		greeting: `【开场 · ${card.name}】\n${card.firstMes.replaceAll("{{user}}", config.userName).replaceAll("{{char}}", card.name)}`,
		tools: all.map(({ name, description, parameters }) => ({ name, description, parameters })) };
	break; }
case "inject": {
	const activated = scanEntries(lore, input.windowText, config.maxLoreInjections);
	out = { injection: buildStageInjection({ state: st(input.state), activatedLore: activated, card, config, passiveLore: !!input.passiveLore,
		loreIndex: formatLoreIndex(lore), rosterIndex: formatRosterIndex(st(input.state)) }), activated: activated.map((e) => e.comment) };
	break; }
case "search": out = { hits: searchEntries(lore, input.query, 3).map((h) => ({ title: h.entry.comment, score: h.score, content: h.entry.content })) }; break;
case "state": out = { formatted: formatState(st(input.state)), roster: formatRosterIndex(st(input.state)) }; break;
case "scribe-prompt": out = buildScribeTurnPrompt({ state: st(input.state), userText: input.userText, assistantText: input.assistantText, charName: card.name, userName: config.userName }); break;
case "patch": {   // raw（模型原文）或 patch（直接给）
	const parsed = input.raw !== undefined ? parseScribeResult(input.raw) : { patch: input.patch };
	const r = parsed ? applyPatch(st(input.state), parsed.patch) : null;
	out = { parsed, applied: r?.applied, warnings: r?.warnings, state: r?.state ?? st(input.state), formatted: formatState(r?.state ?? st(input.state)), roster: formatRosterIndex(r?.state ?? st(input.state)) };
	break; }
case "gate": out = { verdicts: input.cases.map((c) => ({ ...c, verdict: checkWriteGate({ ...c, creationMode: "ask" }) })) }; break;
case "tail": out = { merged: mergeFinalText(input.draft, input.text) }; break;
case "branch": out = { branches: input.branches.map((b) => {
	const { history } = rebuildHistory(b); const s = stateFromBranch(b);
	return { history, state: formatState(s) }; }) }; break;
case "summary-prompt": {
	const conversationText = serializeForSummary(input.entries, config.userName, card.name);
	out = { conversationText, ...buildRpSummaryPrompt({ conversationText, stateSnapshot: JSON.stringify(st(input.state), null, 2), language: config.language, userName: config.userName }) };
	break; }
case "recap-prompt": out = buildRecapPrompt({ evidence: input.evidence, chatName: input.chatName, language: config.language, userName: config.userName, charName: card.name }); break;
case "consolidate-prompt": out = buildConsolidatePrompt({ diff: input.diff, handbook: input.handbook, resident: input.resident, language: config.language, userName: config.userName, charName: card.name }); break;
case "consolidate-parse": out = parseConsolidateResult(input.raw) ?? { error: "解析失败" }; break;
case "resident-fit": out = { fitted: fitResidentSummary(input.text, input.otherChars) ?? null }; break;
case "declare-prompt": {
	const doc = loadPresetDoc(JSON.parse(readFileSync(`${H}/sample-preset.json`, "utf8")), "演示预设");
	const pieces = declarePieces(assembleForDeclare(doc, { charName: card.name, userName: config.userName }));
	out = { pieces: pieces.map((p) => ({ id: p.id, name: p.name, role: p.role, where: p.where })), ...buildDeclarePrompt(pieces, { preset: "演示预设" }) };
	break; }
case "declare-apply": {
	const doc = loadPresetDoc(JSON.parse(readFileSync(`${H}/sample-preset.json`, "utf8")), "演示预设");
	const pieces = declarePieces(assembleForDeclare(doc, { charName: card.name, userName: config.userName }));
	const parsed = parseDeclareResponse(input.raw, pieces);
	const declaration = { version: 1, preset: "演示预设", createdAt: "2026-10-20", model: input.model, entries: parsed.entries };
	const t = translatePresetWithDeclaration(doc, declaration, { charName: card.name, userName: config.userName });
	out = { entries: parsed.entries.map(({ identifier, name, station }) => ({ identifier, name, station })), errors: parsed.errors,
		appendMarkdown: t.appendMarkdown, agentsSection: t.agentsSection };
	break; }
case "render": out = { rendered: renderForModel(readFileSync(`${H}/sample-agents.md`, "utf8")) }; break;
case "sandbox": {
	const W = `${H}/ws`;
	const scope = { cwd: W, cardDir: `${W}/cards/青梧`, chatDir: `${W}/cards/青梧/对话/局A`, roots: [`${W}/cards/青梧`, `${W}/cards/青梧/创作`],
		readRoots: [`${W}/assets/lorebooks`, `${W}/assets/presets`, `${W}/skills`], denyRules: parseDenylist(readFileSync(`${R}/assets/BASH_DENYLIST.txt`, "utf8")) };
	const grants = { dirs: [], bashAllow: ["ls", "cat"] };
	out = { cases: input.cases.map((c) => ({ ...c, verdict: sandboxVerdict(c.tool, c.input, scope, grants) })) };
	break; }
case "agent-system": {
	const macro = { charName: card.name, userName: config.userName };
	out = { system: agentSystemPrompt({ cwd: input.cwd, cardPath: input.cardPath, storyDir: input.storyDir, macro }),
		stateBlock: buildAgentStateBlock({ state: st(input.state), rosterIndex: formatRosterIndex(st(input.state)), files: listStoryFiles(input.storyAbs) }) };
	break; }
case "worldline": {
	// 树：g→u1→a1(存档「雨夜问名」)→u2→a2(主线存档)；回到 a1 换个走向：a1→u2b→a2b
	const parent = { u1: "g", a1: "u1", u2: "a1", a2: "u2", u2b: "a1", a2b: "u2b" };
	const anc = (id) => { const s = new Set(); for (let x = id; x; x = parent[x]) s.add(x); return s; };
	const S1 = { id: "s1", name: "雨夜问名", entryId: "a1", worldlineId: "w-main", worldlineName: "主线", createdAt: 1 };
	const S2 = { id: "s2", name: "直问生死", entryId: "a2", worldlineId: "w-main", worldlineName: "主线", createdAt: 2 };
	const plan = (leaf, prev) => planNewSave({ name: input.names[leaf], prevOnBranch: prev, branchEntryIds: anc(leaf), allSaves: [S1, S2], ancestorsOf: anc, now: 3 });
	out = { sameLine: plan("a2", S1), fork: plan("a2b", S1), first: planNewSave({ name: "开场", prevOnBranch: null, branchEntryIds: anc("g"), allSaves: [], ancestorsOf: anc, now: 0 }) };
	break; }
case "story-commit": {
	const h = new StoryHistory(input.chatDir);
	out = { checkpoint: h.commit({ author: input.author, message: input.message }) ?? null };
	break; }
}
process.stdout.write(JSON.stringify(out));
