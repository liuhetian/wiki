// XP gems (pooled, three tiers, merged when there are too many), coins, healing fruit and magnets. Within the pickup
// radius things accelerate toward the player; a magnet pulls every gem on the map.

import { Fx } from '../art/fx';
import type { Game } from './game';

const GEM_CAP = 900;
export type ItemKind = 'coin' | 'fruit' | 'magnet';

export class Pickups {
  private gx = new Float32Array(GEM_CAP);
  private gy = new Float32Array(GEM_CAP);
  private gz = new Float32Array(GEM_CAP);
  private gv = new Float32Array(GEM_CAP);
  private gs = new Float32Array(GEM_CAP); // pull speed (0 = idle)
  private gn = 0;
  private items: { kind: ItemKind; x: number; y: number; z: number; s: number; t: number }[] = [];
  private pullAll = 0;

  dropGem(x: number, y: number, z: number, v: number): void {
    if (this.gn >= GEM_CAP) {
      // Too many on the ground: fold the value into an existing gem.
      const j = Math.floor(Math.random() * this.gn);
      this.gv[j] += v;
      return;
    }
    const i = this.gn++;
    this.gx[i] = x + (Math.random() - 0.5) * 0.6;
    this.gy[i] = y;
    this.gz[i] = z + (Math.random() - 0.5) * 0.6;
    this.gv[i] = v;
    this.gs[i] = 0;
  }

  drop(kind: ItemKind, x: number, z: number, y?: number): void {
    this.items.push({ kind, x, y: y ?? Number.NaN, z, s: 0, t: Math.random() * 6 });
  }

  magnet(): void {
    this.pullAll = 3;
  }

  update(dt: number, g: Game): void {
    const p = g.player;
    const R = 3.8 * p.stats.magnet;
    const px = p.x,
      py = p.y + 0.6,
      pz = p.z;
    this.pullAll = Math.max(0, this.pullAll - dt);
    let levels = 0;
    for (let i = 0; i < this.gn; i++) {
      const dx = px - this.gx[i],
        dy = py - this.gy[i],
        dz = pz - this.gz[i];
      const d = Math.hypot(dx, dz);
      if (this.gs[i] === 0 && (d < R || this.pullAll > 0)) this.gs[i] = this.pullAll > 0 ? 6 : 2;
      if (this.gs[i] > 0) {
        this.gs[i] = Math.min(40, this.gs[i] + dt * 40);
        const step = Math.min(d, this.gs[i] * dt);
        const l = Math.hypot(dx, dy, dz) || 1;
        this.gx[i] += (dx / l) * step;
        this.gy[i] += (dy / l) * step;
        this.gz[i] += (dz / l) * step;
        if (Math.hypot(dx, dy, dz) < 0.7) {
          levels += p.gainXp(this.gv[i]);
          g.fx.particle(px, py + 0.4, pz, 0, 2, 0, 0.25, 0.35, Fx.Spark, 0.5, 1.2, 2, 0);
          const last = --this.gn;
          this.gx[i] = this.gx[last];
          this.gy[i] = this.gy[last];
          this.gz[i] = this.gz[last];
          this.gv[i] = this.gv[last];
          this.gs[i] = this.gs[last];
          i--;
        }
      } else this.gy[i] = g.terrain.height(this.gx[i], this.gz[i]);
    }
    if (levels) g.onLevelUp(levels);
    for (let k = this.items.length - 1; k >= 0; k--) {
      const it = this.items[k];
      it.t += dt;
      if (Number.isNaN(it.y)) it.y = g.terrain.height(it.x, it.z);
      const dx = px - it.x,
        dz = pz - it.z;
      const d = Math.hypot(dx, dz);
      if (it.s === 0 && d < R * 0.8) it.s = 3;
      if (it.s > 0) {
        it.s = Math.min(30, it.s + dt * 30);
        const st = Math.min(d, it.s * dt);
        it.x += (dx / (d || 1)) * st;
        it.z += (dz / (d || 1)) * st;
        it.y += (py - it.y) * Math.min(1, dt * 8);
        if (d < 0.8) {
          this.items.splice(k, 1);
          if (it.kind === 'coin') {
            p.coins += 1;
            g.fx.particle(px, py + 0.6, pz, 0, 3, 0, 0.3, 0.4, Fx.Star, 2, 1.6, 0.4, 0);
          } else if (it.kind === 'fruit') {
            p.heal(25);
            g.fx.popText(px, py + 1.6, pz, '+25', '#7dff8a');
          } else {
            this.magnet();
            g.fx.popText(px, py + 1.6, pz, '磁力！', '#ff8a8a');
          }
        }
      }
    }
  }

  render(g: Game, time: number): void {
    const solid = g.fx.solid,
      sh = g.fx.shadows;
    for (let i = 0; i < this.gn; i++) {
      if (!g.inView(this.gx[i], this.gy[i], this.gz[i], 1)) continue;
      const v = this.gv[i];
      const cell = v >= 10 ? Fx.GemRed : v >= 3 ? Fx.GemGreen : Fx.GemBlue;
      const bob = this.gs[i] > 0 ? 0.35 : 0.42 + Math.sin(time * 3 + i) * 0.1;
      const size = v >= 10 ? 0.95 : v >= 3 ? 0.8 : 0.66;
      solid.push(this.gx[i], this.gy[i] + bob, this.gz[i], size, cell, 1.15, 1.15, 1.15);
      if (this.gs[i] === 0) sh.push(this.gx[i], this.gy[i], this.gz[i], 0.45);
    }
    for (const it of this.items) {
      if (Number.isNaN(it.y)) continue;
      const cell = it.kind === 'coin' ? Fx.Coin : it.kind === 'fruit' ? Fx.Fruit : Fx.Magnet;
      solid.push(it.x, it.y + 0.5 + Math.sin(it.t * 3) * 0.1, it.z, it.kind === 'magnet' ? 1.1 : 0.8, cell, 1.1, 1.1, 1.1);
      sh.push(it.x, it.y, it.z, 0.5);
    }
  }

  get gemCount(): number {
    return this.gn;
  }
}
