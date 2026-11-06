// Level-up / chest choices: new weapons, weapon levels and passive levels, three distinct options weighted toward
// what the player already owns. When everything is maxed, fall back to healing and gold.

import { MAX_LEVEL, MAX_WEAPONS, PASSIVES, WEAPONS, type PassiveId, type WeaponId } from './data';
import type { Player } from './player';

export type Choice =
  | { kind: 'weapon'; id: WeaponId; level: number; name: string; desc: string; icon: string }
  | { kind: 'passive'; id: PassiveId; level: number; name: string; desc: string; icon: string }
  | { kind: 'heal' | 'gold'; name: string; desc: string; icon: string };

export function rollChoices(p: Player, n = 3): Choice[] {
  const pool: { w: number; c: Choice }[] = [];
  for (const id of Object.keys(WEAPONS) as WeaponId[]) {
    const cur = p.weapons.get(id) ?? 0;
    if (cur >= MAX_LEVEL) continue;
    if (cur === 0 && p.weapons.size >= MAX_WEAPONS) continue;
    const d = WEAPONS[id];
    pool.push({
      w: cur ? 3 : 2,
      c: { kind: 'weapon', id, level: cur + 1, name: d.name, desc: cur ? d.lvDesc[cur] : d.desc, icon: id },
    });
  }
  for (const id of Object.keys(PASSIVES) as PassiveId[]) {
    const cur = p.passives.get(id) ?? 0;
    if (cur >= MAX_LEVEL) continue;
    const d = PASSIVES[id];
    pool.push({ w: cur ? 2 : 1.5, c: { kind: 'passive', id, level: cur + 1, name: d.name, desc: d.desc, icon: id } });
  }
  const out: Choice[] = [];
  while (out.length < n && pool.length) {
    let total = 0;
    for (const e of pool) total += e.w;
    let r = Math.random() * total;
    let k = 0;
    for (; k < pool.length - 1; k++) {
      r -= pool[k].w;
      if (r <= 0) break;
    }
    out.push(pool[k].c);
    pool.splice(k, 1);
  }
  if (out.length < n) out.push({ kind: 'heal', name: '治愈之泉', desc: '回复 40 点生命', icon: 'vitality' });
  if (out.length < n) out.push({ kind: 'gold', name: '一袋金币', desc: '获得 25 金币', icon: 'magnet' });
  return out;
}

export function applyChoice(p: Player, c: Choice): void {
  if (c.kind === 'weapon') p.weapons.set(c.id, c.level);
  else if (c.kind === 'passive') p.passives.set(c.id, c.level);
  else if (c.kind === 'heal') p.heal(40);
  else p.coins += 25;
}
