// 建（或复用）加速区域为中国大陆的 Makers 项目，写环境变量，部署一个目录
// 用法：node scripts/deploy.mjs <项目名> <目录> [环境变量名…]
// 列出的变量从本机环境读出写进项目；建项目时另随机生成一次 COOKIE_SECRET，之后不动
// 主账号密钥 TENCENTCLOUD_SECRET_ID / TENCENTCLOUD_SECRET_KEY 只在本机调接口，不进项目
import { randomBytes } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { Makers } from '@edgeone/makers-sdk';
import { credentials, tc3 } from './tencentcloud.mjs';

// Makers 站点 ID：开通 Makers 时自动建的那个 pages 站点；有多个时用 MAKERS_ZONE_ID 指定
export async function zoneId() {
  if (process.env.MAKERS_ZONE_ID) return process.env.MAKERS_ZONE_ID;
  const r = await tc3('teo', '2022-09-01', 'DescribeZones', { Filters: [{ Name: 'zone-type', Values: ['pages'] }] });
  if (r.Error) throw new Error(`DescribeZones: ${r.Error.Code} ${r.Error.Message}`);
  const zones = r.Zones || [];
  if (zones.length === 0) throw new Error('账号还没开通 EdgeOne Makers，请用户去控制台开通');
  if (zones.length > 1) throw new Error(`有 ${zones.length} 个 Makers 站点（${zones.map((z) => z.ZoneId).join('、')}），用 MAKERS_ZONE_ID 指定一个`);
  return zones[0].ZoneId;
}

// 传主账号 SecretId/Key 加站点 ID，SDK 走云 API 通道，不用控制台的 API Token
export async function client() {
  return new Makers({ credentials: credentials(), zoneId: await zoneId(), region: 'china' });
}

export async function findProject(makers, name) {
  for await (const p of makers.projects.listAll()) if (p.name === name) return p;
  return null;
}

async function main() {
  const [name, dir, ...keys] = process.argv.slice(2);
  if (!name || !dir) throw new Error('用法：node scripts/deploy.mjs <项目名> <目录> [环境变量名…]');
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Error(`没有目录 ${dir}`);
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`本机环境缺：${missing.join('、')}`);
  const envVars = keys.map((key) => ({ key, value: process.env[key] }));

  const makers = await client();
  let project = await findProject(makers, name);
  if (!project) {
    const { projectId } = await makers.projects.create({
      name,
      area: 'mainland',
      initialEnvVars: [...envVars, { key: 'COOKIE_SECRET', value: randomBytes(32).toString('hex') }],
    });
    project = await makers.projects.get({ projectId });
    console.log(`新建项目 ${name}（${projectId}），加速区域：中国大陆`);
  } else {
    if (envVars.length) await makers.projects.setEnvs({ projectId: project.projectId, envVars });
    console.log(`复用项目 ${name}（${project.projectId}），改了：${keys.join('、') || '无'}`);
  }
  const { projectId } = project;
  console.log('项目环境变量：', (await makers.projects.listEnvs({ projectId })).map((e) => e.key).sort().join('、'));

  const d = await makers.deployments.deploy({
    projectId,
    artifact: { directory: resolve(dir) },
    wait: true,
    onStatusChange: (e) => console.log('  部署状态：', e.deployment.status),
  });
  if (d.status !== 'Success') {
    const { logUrl } = await makers.deployments.getLog({ projectId, deploymentId: d.deploymentId });
    throw new Error(`部署 ${d.status}，构建日志：${logUrl}`);
  }
  console.log(`部署成功 ${d.deploymentId}，默认域名 ${project.presetDomain}；生效要几十秒`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error('❌', e.message); process.exit(1); });
}
