// Map interactables. Chests cost gold (rising with each one opened; elites drop free ones) and grant an upgrade
// choice. Shrines charge while the player stands in their circle and then grant a permanent buff.

import { Group, type Mesh, type MeshToonMaterial } from 'three';
import { Fx } from '../art/fx';
import { makeChest, makeShrine } from '../render/toonModel';
import { pickSpots } from '../world/scatter';
import type { Game } from './game';
import type { Stats } from './player';

type BuffKey = 'damage' | 'speed' | 'cooldown' | 'maxHp' | 'xpGain' | 'area';
const BUFFS: { key: BuffKey; name: string; color: number; apply: (b: Partial<Stats>) => void }[] = [
  { key: 'damage', name: '力量神坛：伤害 +10%', color: 0xff5a5a, apply: (b) => (b.damage = (b.damage ?? 1) * 1.1) },
  { key: 'speed', name: '疾风神坛：移速 +8%', color: 0x5af0ff, apply: (b) => (b.speed = (b.speed ?? 1) * 1.08) },
  { key: 'cooldown', name: '时光神坛：冷却 -6%', color: 0xb07aff, apply: (b) => (b.cooldown = (b.cooldown ?? 1) * 0.94) },
  { key: 'maxHp', name: '生命神坛：最大生命 +15', color: 0x6aff7a, apply: (b) => (b.maxHp = (b.maxHp ?? 0) + 15) },
  { key: 'xpGain', name: '智慧神坛：经验 +15%', color: 0xffd05a, apply: (b) => (b.xpGain = (b.xpGain ?? 1) * 1.15) },
  { key: 'area', name: '广域神坛：范围 +10%', color: 0xff9a3a, apply: (b) => (b.area = (b.area ?? 1) * 1.1) },
];

interface Chest {
  x: number;
  y: number;
  z: number;
  root: Group;
  lid: Group;
  free: boolean;
  opened: boolean;
  openT: number;
}
interface Shrine {
  x: number;
  y: number;
  z: number;
  root: Group;
  crystal: Mesh;
  buff: (typeof BUFFS)[number];
  charge: number;
  used: boolean;
}

export const CHEST_BASE = 8;

export class Interact {
  readonly group = new Group();
  private chests: Chest[] = [];
  private shrines: Shrine[] = [];
  opened = 0;
  prompt = '';

  constructor(private g: Game) {
    const t = g.terrain;
    const chestSpots = pickSpots(t, g.seed ^ 77, 12, 30, []);
    for (const s of chestSpots) this.addChest(s.x, s.z, false);
    const shrineSpots = pickSpots(t, g.seed ^ 99, 6, 40, chestSpots);
    shrineSpots.forEach((s, k) => {
      const buff = BUFFS[k % BUFFS.length];
      const { root, crystal } = makeShrine(buff.color);
      const y = t.height(s.x, s.z);
      root.position.set(s.x, y - 0.1, s.z);
      this.group.add(root);
      for (let q = 0; q < 4; q++) {
        const a = (q / 4) * Math.PI * 2 + Math.PI / 4;
        t.addCollider(s.x + Math.cos(a) * 2, s.z + Math.sin(a) * 2, 0.4);
      }
      this.shrines.push({ x: s.x, y, z: s.z, root, crystal, buff, charge: 0, used: false });
    });
  }

  get chestCost(): number {
    return Math.round(CHEST_BASE * Math.pow(1.45, this.opened));
  }

  private addChest(x: number, z: number, free: boolean): void {
    const { root, lid } = makeChest();
    const y = this.g.terrain.height(x, z);
    root.position.set(x, y, z);
    root.rotation.y = Math.random() * Math.PI * 2;
    this.group.add(root);
    this.g.terrain.addCollider(x, z, 0.8);
    this.chests.push({ x, y, z, root, lid, free, opened: false, openT: 0 });
  }

  freeChest(x: number, z: number): void {
    this.addChest(x, z, true);
  }

  update(dt: number): void {
    const g = this.g,
      p = g.player;
    this.prompt = '';
    let best: Chest | null = null,
      bd = 2.8;
    for (const c of this.chests) {
      if (c.opened) {
        c.openT += dt;
        continue;
      }
      const d = Math.hypot(c.x - p.x, c.z - p.z);
      if (d < bd && Math.abs(c.y - p.y) < 2) {
        bd = d;
        best = c;
      }
    }
    if (best) {
      const cost = best.free ? 0 : this.chestCost;
      this.prompt = cost ? `[E] 打开宝箱（${cost} 金币）` : '[E] 打开宝箱（免费）';
      if (g.input.hit('KeyE')) {
        if (p.coins >= cost) {
          p.coins -= cost;
          if (!best.free) this.opened++;
          best.opened = true;
          g.fx.burst(best.x, best.y + 1, best.z, 24, 6, Fx.Star, 2.6, 2.2, 0.6, 0.6, 0.7);
          g.openChest();
        } else g.fx.popText(p.x, p.y + 2, p.z, '金币不足', '#ff8a8a');
      }
    }
    for (const s of this.shrines) {
      if (s.used) continue;
      const inside = Math.hypot(s.x - p.x, s.z - p.z) < 2.3 && Math.abs(s.y - p.y) < 1.6;
      s.charge = inside ? s.charge + dt : Math.max(0, s.charge - dt * 0.5);
      if (inside) this.prompt = `神坛充能中… ${Math.min(100, Math.round((s.charge / 3.5) * 100))}%`;
      if (s.charge >= 3.5) {
        s.used = true;
        s.buff.apply(g.buffs);
        p.recomputeStats(g.buffs);
        g.fx.popText(s.x, s.y + 3.5, s.z, s.buff.name, '#ffe9a0', true);
        const c = s.buff.color;
        g.fx.burst(s.x, s.y + 2.2, s.z, 40, 8, Fx.Star, ((c >> 16) & 255) / 90, ((c >> 8) & 255) / 90, (c & 255) / 90, 0.6, 0.9);
        g.fx.ring(s.x, s.z, 0.5, 6, 0.6, [2, 2, 1.4]);
        const m = (s.crystal.material as MeshToonMaterial).clone();
        m.emissiveIntensity = 0.1;
        m.color.setHex(0x8a8a9a);
        s.crystal.material = m;
      }
    }
  }

  render(time: number): void {
    const g = this.g;
    for (const c of this.chests) {
      if (c.opened) c.lid.rotation.x = -Math.min(1.9, c.openT * 6);
      else if (Math.sin(time * 3 + c.x) > 0.6) g.fx.glow.push(c.x + Math.sin(time * 2) * 0.6, c.y + 1.3, c.z, 0.35, Fx.Spark, 2.4, 2, 0.8);
      if (c.opened && c.openT > 4) c.root.visible = false;
    }
    for (const s of this.shrines) {
      s.crystal.rotation.y = time * (s.used ? 0.2 : 1.2);
      s.crystal.position.y = 2.2 + Math.sin(time * 2 + s.x) * 0.15;
      if (s.used) continue;
      const c = s.buff.color;
      const r = ((c >> 16) & 255) / 255,
        gg = ((c >> 8) & 255) / 255,
        b = (c & 255) / 255;
      g.fx.ground.push(s.x, s.y + 0.48, s.z, 5, Fx.Ring, r * 1.6, gg * 1.6, b * 1.6, 0.55 + Math.sin(time * 3) * 0.2);
      if (s.charge > 0) g.fx.ground.push(s.x, s.y + 0.5, s.z, 5 * Math.min(1, s.charge / 3.5), Fx.Puff, r, gg, b, 0.5);
      if (Math.random() < 0.1) g.fx.particle(s.x + (Math.random() - 0.5) * 3, s.y + 0.6, s.z + (Math.random() - 0.5) * 3, 0, 1.5, 0, 0.8, 0.3, Fx.Spark, r * 2, gg * 2, b * 2, -0.5);
    }
  }

  /** Spots for the minimap/HUD. */
  markers(): { x: number; z: number; kind: 'chest' | 'shrine' }[] {
    return [
      ...this.chests.filter((c) => !c.opened).map((c) => ({ x: c.x, z: c.z, kind: 'chest' as const })),
      ...this.shrines.filter((s) => !s.used).map((s) => ({ x: s.x, z: s.z, kind: 'shrine' as const })),
    ];
  }
}
