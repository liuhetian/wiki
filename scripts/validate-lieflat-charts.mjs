import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const wikiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = path.join(wikiRoot, 'docs/skills/data-visualization/lieflat-charts');
const referenceDir = path.join(docsRoot, 'reference');
const assetsDir = path.join(docsRoot, 'assets');
const mkdocs = fs.readFileSync(path.join(wikiRoot, 'mkdocs.yml'), 'utf8');
const index = fs.readFileSync(path.join(docsRoot, 'index.md'), 'utf8');
const failures = [];

const expectedCodes = [
  ...Array.from({ length: 12 }, (_, i) => `F${i + 1}`),
  ...Array.from({ length: 15 }, (_, i) => `L${i + 1}`),
  ...Array.from({ length: 18 }, (_, i) => `G${i + 1}`),
  ...Array.from({ length: 3 }, (_, i) => `B${i + 1}`),
];

const referenceFiles = fs.readdirSync(referenceDir).filter(name => name.endsWith('.md')).sort();
const assetFiles = fs.readdirSync(assetsDir).filter(name => name.endsWith('.html')).sort();

if (referenceFiles.length !== 48) failures.push(`reference 应为 48 个，实际 ${referenceFiles.length}`);
if (assetFiles.length !== 48) failures.push(`assets 应为 48 个，实际 ${assetFiles.length}`);

for (const code of expectedCodes) {
  const lower = code.toLowerCase();
  const refs = referenceFiles.filter(name => name.startsWith(`${lower}-`));
  const assets = assetFiles.filter(name => name.startsWith(`${lower}-`));
  if (refs.length !== 1) failures.push(`${code} reference 数量为 ${refs.length}`);
  if (assets.length !== 1) failures.push(`${code} asset 数量为 ${assets.length}`);
  if (!new RegExp(`\\b${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(index)) {
    failures.push(`总目录缺少 ${code}`);
  }
  if (!new RegExp(`- ${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} ·`).test(mkdocs)) {
    failures.push(`mkdocs 导航缺少 ${code}`);
  }
}

for (const referenceFile of referenceFiles) {
  const source = fs.readFileSync(path.join(referenceDir, referenceFile), 'utf8');
  const iframe = source.match(/<iframe src="([^"]+\.html)"/)?.[1];
  const snippet = source.match(/--8<-- "([^"]+\.html)"/)?.[1];
  if (!iframe) failures.push(`${referenceFile} 缺少 iframe`);
  if (!snippet) failures.push(`${referenceFile} 缺少源码折叠引用`);
  if (iframe && snippet && !iframe.endsWith(snippet.replace(/^skills/, '/skills'))) {
    failures.push(`${referenceFile} 的 iframe 与源码引用不一致`);
  }
  if (snippet && !fs.existsSync(path.join(wikiRoot, 'docs', snippet))) {
    failures.push(`${referenceFile} 引用了不存在的 ${snippet}`);
  }
}

for (const assetFile of assetFiles) {
  const source = fs.readFileSync(path.join(assetsDir, assetFile), 'utf8');
  const ids = [...source.matchAll(/\sid=(["'])([^"']+)\1/g)].map(match => match[2]);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicateIds.length) failures.push(`${assetFile} 存在重复 id：${[...new Set(duplicateIds)].join(', ')}`);

  for (const match of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
    if (!match[1].trim()) continue;
    try {
      new vm.Script(match[1], { filename: assetFile });
    } catch (error) {
      failures.push(error.message);
    }
  }

  for (const match of source.matchAll(/(?:obsReveal|eReveal|cReveal)\(\s*['"]([^'"]+)['"]/g)) {
    if (!ids.includes(match[1])) failures.push(`${assetFile} 渲染目标 #${match[1]} 不存在`);
  }
}

if (failures.length) {
  console.error(`Lieflat Charts 检查失败（${failures.length} 项）：`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Lieflat Charts 检查通过：48 个页面、48 个演示、48 组导航，脚本与引用完整。');
