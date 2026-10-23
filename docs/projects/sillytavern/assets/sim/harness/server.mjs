// 常驻的酒馆进程：stdin 每行一条 {id, cmd, args}，stdout 每行回 {id, ok, result|error}。进程里没有 API key。
import readline from 'node:readline';
const L = await import('./lib.mjs');
const out = (o) => process.stdout.write(JSON.stringify(o) + '\n');
const cmds = {
    init: (a) => L.init(a),
    generate: (a) => L.generate(a),
    receive: (a) => L.receive(a),
    snapshot: () => L.snapshot(),
    stubHits: () => L.stubHits(),
    // 实验用：在酒馆会话里跑一段代码（可访问 L 和 args），返回它的结果
    eval: async ({ code, args }) => new Function('L', 'args', `return (async () => { ${code} })();`)(L, args),
};
const rl = readline.createInterface({ input: process.stdin });
out({ id: 0, ok: true, result: 'ready' });
for await (const line of rl) {
    if (!line.trim()) continue;
    const { id, cmd, args } = JSON.parse(line);
    try { out({ id, ok: true, result: await cmds[cmd](args ?? {}) }); }
    catch (e) { out({ id, ok: false, error: String(e?.stack ?? e) }); }
}
process.exit(0);
