// 酒馆前端到处 console.debug/log，实跑时关掉；脚本自己的输出用 process.stdout.write
const noop = () => {};
console.debug = noop; console.log = noop; console.info = noop; console.trace = noop;
