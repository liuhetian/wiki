// 给项目绑已备案的自定义域名，一次走完：加域名 → TXT 归属校验 → CNAME → eofreecert 免费证书，每步轮询到位
// 用法：node scripts/domain.mjs <项目名> <域名>
// DNS 记录用本账号的 DNSPod API 加；域名不在本账号 DNSPod 时打印要加的记录，退出码 2，交给用户加完再重跑
// 重跑是幂等的：已经做完的步骤会跳过
import { client, findProject } from './deploy.mjs';
import { sleep, tc3 } from './tencentcloud.mjs';

const dnspod = (action, body) => tc3('dnspod', '2021-03-23', action, body);

async function poll(what, times, ms, fn) {
  for (let i = 0; i < times; i++) {
    const v = await fn();
    if (v) return v;
    await sleep(ms);
  }
  throw new Error(`${what}：等了 ${Math.round((times * ms) / 60000)} 分钟还没好，稍后重跑`);
}

async function upsert(zone, sub, type, value) {
  const list = await dnspod('DescribeRecordList', { Domain: zone, Subdomain: sub, RecordType: type });
  const old = (list.RecordList || []).find((r) => r.Name === sub && r.Type === type);
  if (old && old.Value.replace(/\.$/, '') === value.replace(/\.$/, '')) return console.log(`  DNS 已有 ${type} ${sub}.${zone}`);
  const body = { Domain: zone, SubDomain: sub, RecordType: type, RecordLine: '默认', Value: value, TTL: 600 };
  const r = old ? await dnspod('ModifyRecord', { ...body, RecordId: old.RecordId }) : await dnspod('CreateRecord', body);
  if (r.Error) throw new Error(`DNSPod ${type} ${sub}.${zone}：${r.Error.Code} ${r.Error.Message}`);
  console.log(`  DNS ${old ? '改' : '加'} ${type} ${sub}.${zone} → ${value}`);
}

async function main() {
  const [name, domain] = process.argv.slice(2);
  if (!name || !domain) throw new Error('用法：node scripts/domain.mjs <项目名> <域名>');
  const makers = await client();
  const project = await findProject(makers, name);
  if (!project) throw new Error(`没有项目 ${name}，先跑 deploy.mjs`);
  const projectId = project.projectId;
  const row = async () => (await makers.domains.list({ projectId, domain }))[0];

  let d = await row();
  if (!d) {
    await makers.domains.create({ projectId, domain });
    d = await row();
    console.log(`1. 加自定义域名 ${domain}`);
  } else console.log(`1. 域名已在项目里（${d.status}）`);

  const zone = d.mainDomain;
  const sub = domain === zone ? '@' : domain.slice(0, -(zone.length + 1));
  const onDnspod = !(await dnspod('DescribeDomain', { Domain: zone })).Error;
  const need = (type, rsub, value) => {
    if (onDnspod) return upsert(zone, rsub, type, value);
    console.log(`请用户在 ${zone} 的 DNS 加：${type} ${rsub} → ${value}，加完重跑`);
    process.exit(2);
  };

  const txt = d.ownershipVerification?.dnsVerification;
  if (d.status === 'init' && txt) {
    console.log('2. 归属校验');
    await need(txt.recordType, txt.subdomain, txt.recordValue);
    await poll('归属校验', 20, 15000, async () => (await makers.domains.verifyOwnership({ domain })).status === 'success');
    console.log('  通过');
  } else console.log('2. 归属校验已过');

  console.log('3. CNAME');
  const cname = await poll('平台分配 CNAME', 30, 10000, async () => (await row())?.cname);
  await need('CNAME', sub, cname);
  await poll('CNAME 生效', 20, 15000, async () =>
    (await makers.domains.checkCname({ recordNames: [domain] })).cnameStatus?.[0]?.status === 'active');
  console.log('  已生效');

  console.log('4. 免费证书');
  const cert = async () => {
    const r = await makers.domains.listHostCertificates({ filters: [{ name: 'host', values: [domain] }] });
    const c = r.certificates?.[0];
    return { mode: c?.mode, ...(c?.hostCertInfo?.[0] || {}) };
  };
  let c = await cert();
  if (!(c.mode === 'eofreecert' && c.status === 'deployed')) {
    if (c.mode !== 'eofreecert') await makers.domains.modifyCertificate({ hosts: [domain], mode: 'eofreecert' });
    c = await poll('证书签发', 40, 15000, async () => {
      const x = await cert();
      return x.status === 'deployed' ? x : null;
    });
  }
  console.log(`  已部署，到期 ${c.expireTime}`);
  console.log(`✅ https://${domain}/`);
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
