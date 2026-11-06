// Weapon behaviour. Levels and numbers live in data.ts; this file decides targets and spawns the effects.

import { Fx } from '../art/fx';
import { WEAPONS, type WeaponId } from './data';
import type { Game } from './game';

interface Slot {
  id: WeaponId;
  cd: number;
  phase: number;
}

export class Weapons {
  readonly slots: Slot[] = [];
  private orbPos: number[] = [];

  add(id: WeaponId): void {
    if (!this.slots.some((s) => s.id === id)) this.slots.push({ id, cd: 0.4, phase: 0 });
  }

  clear(): void {
    this.slots.length = 0;
  }

  private lv(g: Game, id: WeaponId) {
    const l = g.player.weapons.get(id) ?? 1;
    return WEAPONS[id].levels[l - 1];
  }

  update(dt: number, g: Game): void {
    const p = g.player,
      e = g.enemies;
    if (p.dead) return;
    const dm = p.stats.damage;
    this.orbPos.length = 0;
    for (const s of this.slots) {
      const L = this.lv(g, s.id);
      s.cd -= dt;
      const ready = s.cd <= 0;
      const reset = () => (s.cd = L.cd * p.stats.cooldown);
      const cy = p.y + 1.1;
      switch (s.id) {
        case 'bolt': {
          if (!ready) break;
          const skip = new Set<number>();
          let fired = 0;
          for (let n = 0; n < L.n; n++) {
            const t = e.nearest(p.x, p.z, 24, skip);
            if (t < 0) break;
            skip.add(t);
            g.projectiles.bolt(p.x, cy, p.z, t, L.dmg * dm, L.extra, g);
            fired++;
          }
          if (fired) {
            reset();
            g.fx.burst(p.x, cy, p.z, 4, 2, Fx.Spark, 0.8, 1.6, 2.6, 0.4, 0.2);
          } else s.cd = 0.15;
          break;
        }
        case 'orbit': {
          s.phase += dt * L.extra;
          const R = L.r * p.stats.area;
          for (let k = 0; k < L.n; k++) {
            const a = s.phase + (k / L.n) * Math.PI * 2;
            const ox = p.x + Math.cos(a) * R,
              oz = p.z + Math.sin(a) * R,
              oy = p.y + 1 + Math.sin(a * 2) * 0.15;
            this.orbPos.push(ox, oy, oz);
            e.grid.query(ox, oz, 1.4, (i) => {
              if (!e.isAlive(i) || e.orbHit[i] > 0) return;
              if (Math.hypot(e.x[i] - ox, e.z[i] - oz) < 0.75 + e.rad[i]) {
                e.orbHit[i] = L.cd;
                const dx = e.x[i] - p.x,
                  dz = e.z[i] - p.z,
                  l = Math.hypot(dx, dz) || 1;
                e.damage(g, i, L.dmg * dm, (dx / l) * 6, (dz / l) * 6);
                g.fx.burst(ox, oy, oz, 4, 3, Fx.Spark, 2.4, 1.2, 2.6, 0.4, 0.2);
              }
            });
          }
          break;
        }
        case 'blast': {
          if (!ready) break;
          let any = false;
          for (let n = 0; n < L.n; n++) {
            // A random enemy near the player, biased toward groups.
            const t = this.randomEnemy(g, 15);
            if (t < 0) break;
            g.projectiles.fireball(p.x, cy + 0.4, p.z, e.x[t], e.z[t], L.dmg * dm, L.r * p.stats.area, g);
            any = true;
          }
          if (any) reset();
          else s.cd = 0.3;
          break;
        }
        case 'chain': {
          if (!ready) break;
          let cur = e.nearest(p.x, p.z, 16);
          if (cur < 0) {
            s.cd = 0.2;
            break;
          }
          const pts = [p.x, cy + 0.3, p.z];
          const seen = new Set<number>();
          for (let j = 0; j <= L.n && cur >= 0; j++) {
            seen.add(cur);
            const ty = e.y[cur] + 0.8 * e.scale[cur];
            pts.push(e.x[cur], ty, e.z[cur]);
            const crit = Math.random() < 0.1;
            e.damage(g, cur, L.dmg * dm * (crit ? 2 : 1), 0, 0, crit);
            g.fx.burst(e.x[cur], ty, e.z[cur], 4, 3, Fx.Spark, 2, 2.2, 1, 0.4, 0.2);
            cur = e.nearest(e.x[cur], e.z[cur], L.r, seen);
          }
          g.fx.lightning(pts, [2.2, 2.4, 1.2]);
          reset();
          break;
        }
        case 'slash': {
          if (!ready) break;
          const reach = L.r * p.stats.area;
          const dirs = L.extra ? [1, -1] : [1];
          for (const sgn of dirs) {
            const fx = p.fx * sgn,
              fz = p.fz * sgn;
            const fl = Math.hypot(fx, fz) || 1;
            const ux = fx / fl,
              uz = fz / fl;
            e.grid.query(p.x, p.z, reach + 1, (i) => {
              if (!e.isAlive(i)) return;
              const dx = e.x[i] - p.x,
                dz = e.z[i] - p.z;
              const d = Math.hypot(dx, dz);
              if (d > reach + e.rad[i] || Math.abs(e.y[i] - p.y) > 2.5) return;
              if ((dx * ux + dz * uz) / (d || 1) < Math.cos(1.0) && d > 0.8) return;
              const crit = Math.random() < 0.12;
              e.damage(g, i, L.dmg * dm * (crit ? 2 : 1), (dx / (d || 1)) * 12, (dz / (d || 1)) * 12, crit);
            });
            // Crescent made of sparks sweeping across the arc.
            for (let k = -6; k <= 6; k++) {
              const a = Math.atan2(uz, ux) + (k / 6) * 1.0;
              const rr = reach * 0.8;
              g.fx.particle(p.x + Math.cos(a) * rr, p.y + 0.9, p.z + Math.sin(a) * rr, Math.cos(a) * 2, 0.5, Math.sin(a) * 2, 0.18, 0.7, Fx.Square, 1.8, 2.2, 2.6, 0);
            }
          }
          p.attackT = 0.3;
          reset();
          break;
        }
        case 'meteor': {
          if (!ready) break;
          for (let n = 0; n < L.n; n++) {
            const t = this.randomEnemy(g, 20);
            const a = Math.random() * Math.PI * 2,
              r = 4 + Math.random() * 10;
            const tx = t >= 0 ? e.x[t] : p.x + Math.cos(a) * r,
              tz = t >= 0 ? e.z[t] : p.z + Math.sin(a) * r;
            g.projectiles.meteor(tx, tz, L.dmg * dm, L.r * p.stats.area, 0.9 + n * 0.15, g);
          }
          reset();
          break;
        }
      }
    }
  }

  private randomEnemy(g: Game, r: number): number {
    const e = g.enemies,
      p = g.player;
    const cand: number[] = [];
    e.grid.query(p.x, p.z, r, (i) => {
      if (e.isAlive(i) && Math.hypot(e.x[i] - p.x, e.z[i] - p.z) < r) cand.push(i);
    });
    return cand.length ? cand[Math.floor(Math.random() * cand.length)] : -1;
  }

  render(g: Game, time: number): void {
    for (let k = 0; k < this.orbPos.length; k += 3) {
      const x = this.orbPos[k],
        y = this.orbPos[k + 1],
        z = this.orbPos[k + 2];
      g.fx.glow.push(x, y, z, 0.95, Fx.Orb, 2.4, 1.1, 2.6);
      g.fx.glow.push(x, y, z, 1.6, Fx.Orb, 0.8, 0.3, 0.9, 0.45, time);
    }
  }
}
