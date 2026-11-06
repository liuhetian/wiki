// Pooled projectiles: homing arcane bolts (pierce), lobbed fireballs and meteors (explode on landing), and the boss's
// falling rocks (hurt the player). Explosions deal area damage through the enemy grid.

import { Fx } from '../art/fx';
import type { Game } from './game';

const enum Kind {
  Bolt,
  Fireball,
  Meteor,
  BossRock,
}

interface Proj {
  kind: Kind;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  dmg: number;
  pierce: number;
  r: number;
  target: number;
  hit: number[];
  tx: number;
  tz: number;
}

export class Projectiles {
  private list: Proj[] = [];
  private pool: Proj[] = [];

  private make(kind: Kind): Proj {
    const p = this.pool.pop() ?? ({ hit: [] } as unknown as Proj);
    p.kind = kind;
    p.hit.length = 0;
    p.target = -1;
    this.list.push(p);
    return p;
  }

  bolt(x: number, y: number, z: number, target: number, dmg: number, pierce: number, g: Game): void {
    const p = this.make(Kind.Bolt);
    const e = g.enemies;
    const dx = e.x[target] - x,
      dz = e.z[target] - z,
      dy = e.y[target] + 0.8 - y;
    const l = Math.hypot(dx, dy, dz) || 1;
    Object.assign(p, { x, y, z, vx: (dx / l) * 20, vy: (dy / l) * 20, vz: (dz / l) * 20, life: 1.6, dmg, pierce, r: 0.7, target });
  }

  /** Lobbed shot landing on (tx,tz) after `time` seconds. */
  fireball(x: number, y: number, z: number, tx: number, tz: number, dmg: number, r: number, g: Game): void {
    const p = this.make(Kind.Fireball);
    const time = 0.75;
    const ty = g.terrain.height(tx, tz);
    Object.assign(p, { x, y, z, vx: (tx - x) / time, vz: (tz - z) / time, vy: (ty - y) / time + 0.5 * 22 * time, life: 3, dmg, pierce: 0, r, tx, tz });
  }

  meteor(tx: number, tz: number, dmg: number, r: number, delay: number, g: Game): void {
    const p = this.make(Kind.Meteor);
    const ty = g.terrain.height(tx, tz);
    // Falls along a slanted line; starts above and behind so it reads as coming from the sky.
    Object.assign(p, { x: tx - 6, y: ty + 22, z: tz - 3, vx: 6 / delay, vy: -22 / delay, vz: 3 / delay, life: delay, dmg, pierce: 0, r, tx, tz });
    g.fx.telegraph(tx, tz, r, delay);
  }

  bossRock(tx: number, tz: number, delay: number): void {
    const p = this.make(Kind.BossRock);
    Object.assign(p, { x: tx, y: Number.NaN, z: tz, vx: 0, vy: 0, vz: 0, life: delay, dmg: 18, pierce: 0, r: 2.2, tx, tz });
  }

  clear(): void {
    this.pool.push(...this.list);
    this.list.length = 0;
  }

  private explode(g: Game, x: number, z: number, r: number, dmg: number, color: [number, number, number], shake: number): void {
    const y = g.terrain.height(x, z);
    const e = g.enemies;
    e.grid.query(x, z, r + 1, (i) => {
      if (!e.isAlive(i)) return;
      const dx = e.x[i] - x,
        dz = e.z[i] - z;
      const d = Math.hypot(dx, dz);
      if (d > r + e.rad[i]) return;
      const crit = Math.random() < 0.08;
      e.damage(g, i, dmg * (crit ? 2 : 1), (dx / (d || 1)) * 9, (dz / (d || 1)) * 9, crit);
    });
    g.fx.ring(x, z, r * 0.3, r, 0.35, color);
    g.fx.burst(x, y + 0.4, z, 18, 7, Fx.Flame, color[0], color[1], color[2], 0.9, 0.5);
    g.fx.burst(x, y + 0.2, z, 8, 3, Fx.Puff, 0.9, 0.85, 0.8, 1.2, 0.7);
    if (shake) g.camera.shake(shake);
  }

  update(dt: number, g: Game): void {
    const e = g.enemies;
    for (let k = this.list.length - 1; k >= 0; k--) {
      const p = this.list[k];
      p.life -= dt;
      let dead = false;
      if (p.kind === Kind.Bolt) {
        if (p.target >= 0 && e.isAlive(p.target)) {
          // Gentle homing.
          const dx = e.x[p.target] - p.x,
            dy = e.y[p.target] + 0.8 - p.y,
            dz = e.z[p.target] - p.z;
          const l = Math.hypot(dx, dy, dz) || 1;
          const k2 = 1 - Math.exp(-9 * dt);
          p.vx += ((dx / l) * 20 - p.vx) * k2;
          p.vy += ((dy / l) * 20 - p.vy) * k2;
          p.vz += ((dz / l) * 20 - p.vz) * k2;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        e.grid.query(p.x, p.z, p.r + 1, (i) => {
          if (!e.isAlive(i) || p.hit.includes(i)) return;
          const ty = e.y[i] + 0.8 * e.scale[i];
          if (Math.hypot(e.x[i] - p.x, e.z[i] - p.z) < p.r + e.rad[i] && Math.abs(ty - p.y) < 1.4 * e.scale[i]) {
            const crit = Math.random() < 0.1;
            const l = Math.hypot(p.vx, p.vz) || 1;
            e.damage(g, i, p.dmg * (crit ? 2 : 1), (p.vx / l) * 4, (p.vz / l) * 4, crit);
            g.fx.burst(p.x, p.y, p.z, 5, 4, Fx.Spark, 0.8, 1.6, 2.6, 0.45, 0.25);
            p.hit.push(i);
            if (--p.pierce < 0) {
              dead = true;
              return true;
            }
            p.target = e.nearest(p.x, p.z, 12, new Set(p.hit));
          }
        });
        if (Math.random() < 0.6) g.fx.particle(p.x, p.y, p.z, 0, 0, 0, 0.18, 0.35, Fx.Orb, 0.6, 1.2, 2.4, 0);
        if (p.y < g.terrain.height(p.x, p.z)) dead = true;
      } else if (p.kind === Kind.Fireball || p.kind === Kind.Meteor) {
        if (p.kind === Kind.Fireball) p.vy -= 22 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        g.fx.particle(p.x, p.y, p.z, (Math.random() - 0.5) * 1.5, 1, (Math.random() - 0.5) * 1.5, 0.35, p.kind === Kind.Meteor ? 1.1 : 0.7, Fx.Flame, 2.4, 1.1, 0.3, -2);
        const ground = g.terrain.height(p.x, p.z);
        if ((p.vy < 0 && p.y <= ground + 0.1) || p.life <= 0) {
          const meteor = p.kind === Kind.Meteor;
          this.explode(g, meteor ? p.tx : p.x, meteor ? p.tz : p.z, p.r, p.dmg, meteor ? [2.6, 1.2, 0.4] : [2.6, 1.0, 0.25], meteor ? 0.25 : 0);
          dead = true;
        }
      } else {
        // Boss rock: telegraph first, then drop.
        if (Number.isNaN(p.y)) {
          p.y = g.terrain.height(p.tx, p.tz) + 18;
          g.fx.telegraph(p.tx, p.tz, p.r, p.life);
          p.vy = -18 / p.life;
        }
        p.y += p.vy * dt;
        if (p.life <= 0) {
          const pl = g.player;
          if (Math.hypot(pl.x - p.tx, pl.z - p.tz) < p.r + pl.radius && pl.hit(p.dmg)) g.onPlayerHit();
          g.fx.ring(p.tx, p.tz, 0.5, p.r, 0.3, [1.4, 1.2, 1]);
          g.fx.burst(p.tx, g.terrain.height(p.tx, p.tz) + 0.3, p.tz, 10, 5, Fx.Square, 0.7, 0.62, 0.55, 0.6, 0.6);
          g.camera.shake(0.15);
          dead = true;
        }
      }
      if (p.life <= -0.01 && p.kind === Kind.Bolt) dead = true;
      if (p.life <= 0 && p.kind === Kind.Bolt) dead = true;
      if (dead) {
        this.list.splice(k, 1);
        this.pool.push(p);
      }
    }
  }

  render(g: Game): void {
    for (const p of this.list) {
      if (p.kind === Kind.Bolt) g.fx.glow.push(p.x, p.y, p.z, 0.75, Fx.Orb, 0.9, 1.6, 2.8);
      else if (p.kind === Kind.Fireball) g.fx.glow.push(p.x, p.y, p.z, 1.1, Fx.Orb, 2.8, 1.3, 0.4);
      else if (p.kind === Kind.Meteor) {
        g.fx.solid.push(p.x, p.y, p.z, 1.8, Fx.Rock, 1.2, 1, 0.9);
        g.fx.glow.push(p.x, p.y, p.z, 2.4, Fx.Orb, 2.4, 1.0, 0.3, 0.6);
      } else if (!Number.isNaN(p.y)) g.fx.solid.push(p.tx, p.y, p.tz, 2.2, Fx.Rock, 1, 0.95, 0.9);
    }
  }
}
