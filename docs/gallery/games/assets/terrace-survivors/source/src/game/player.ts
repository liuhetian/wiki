// The hero: camera-relative WASD movement with acceleration, jump + gravity, ground snapping, cliffs that block
// climbing (but not falling), static collider push-out, invulnerability frames and stats.

import type { Input } from '../core/input';
import { MAX_STEP, type Terrain } from '../world/terrain';
import { xpForLevel, type PassiveId, type WeaponId } from './data';

export interface Stats {
  speed: number;
  magnet: number;
  cooldown: number;
  damage: number;
  maxHp: number;
  regen: number;
  xpGain: number;
  area: number;
}

export class Player {
  x = 0;
  y = 0;
  z = 0;
  vx = 0;
  vz = 0;
  vy = 0;
  grounded = true;
  fx = 0;
  fz = 1;
  moving = false;
  animT = 0;
  attackT = 0;
  hurtT = 0;
  hp = 120;
  invuln = 0;
  flash = 0;
  level = 1;
  xp = 0;
  xpNext = xpForLevel(1);
  coins = 0;
  kills = 0;
  dead = false;
  deadT = 0;
  god = false;
  readonly radius = 0.45;
  readonly weapons = new Map<WeaponId, number>();
  readonly passives = new Map<PassiveId, number>();
  readonly stats: Stats = { speed: 1, magnet: 1, cooldown: 1, damage: 1, maxHp: 120, regen: 0, xpGain: 1, area: 1 };
  private push = { x: 0, z: 0 };

  spawnAt(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  update(dt: number, input: Input, yaw: number, t: Terrain): void {
    this.animT += dt;
    this.attackT = Math.max(0, this.attackT - dt);
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.flash = Math.max(0, this.flash - dt * 5);
    if (this.dead) {
      this.deadT += dt;
      return;
    }
    if (this.stats.regen > 0) this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.regen * dt);

    const ix = input.axis(['KeyA', 'ArrowLeft'], ['KeyD', 'ArrowRight']);
    const iz = input.axis(['KeyS', 'ArrowDown'], ['KeyW', 'ArrowUp']);
    // Camera basis on the ground plane.
    const fwdX = -Math.sin(yaw),
      fwdZ = -Math.cos(yaw);
    const rgtX = Math.cos(yaw),
      rgtZ = -Math.sin(yaw);
    let mx = fwdX * iz + rgtX * ix,
      mz = fwdZ * iz + rgtZ * ix;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) {
      mx /= ml;
      mz /= ml;
    }
    const speed = 6.4 * this.stats.speed;
    const k = 1 - Math.exp(-(this.grounded ? 14 : 4) * dt);
    this.vx += (mx * speed - this.vx) * k;
    this.vz += (mz * speed - this.vz) * k;
    this.moving = ml > 0.1;
    if (this.moving) {
      this.fx = mx;
      this.fz = mz;
    }

    if (this.grounded && input.hit('Space')) {
      this.vy = 9.2;
      this.grounded = false;
    }

    // Horizontal move with cliff blocking; slide along the free axis when blocked.
    const nx = this.x + this.vx * dt,
      nz = this.z + this.vz * dt;
    const can = (x: number, z: number) => {
      if (!t.inBounds(x, z, 1.5)) return false;
      const h = t.height(x, z);
      return h - this.y <= MAX_STEP;
    };
    if (can(nx, nz)) {
      this.x = nx;
      this.z = nz;
    } else if (can(nx, this.z)) {
      this.x = nx;
      this.vz *= 0.5;
    } else if (can(this.x, nz)) {
      this.z = nz;
      this.vx *= 0.5;
    } else {
      this.vx = this.vz = 0;
    }
    t.pushOut(this.x, this.z, this.radius, this.push);
    if (can(this.push.x, this.push.z)) {
      this.x = this.push.x;
      this.z = this.push.z;
    }

    // Vertical: gravity, landing, stepping down slopes without leaving the ground.
    const g = t.height(this.x, this.z);
    if (this.grounded) {
      if (g < this.y - 0.6) {
        this.grounded = false;
        this.vy = 0;
      } else this.y = g;
    }
    if (!this.grounded) {
      this.vy -= 26 * dt;
      this.y += this.vy * dt;
      if (this.y <= g) {
        this.y = g;
        this.vy = 0;
        this.grounded = true;
      }
    }
  }

  /** Returns true when the hit landed. */
  hit(dmg: number): boolean {
    if (this.invuln > 0 || this.dead || this.god) return false;
    this.hp -= dmg;
    this.invuln = 0.6;
    this.flash = 1;
    this.hurtT = 0.3;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.deadT = 0;
    }
    return true;
  }

  heal(v: number): void {
    this.hp = Math.min(this.stats.maxHp, this.hp + v);
  }

  /** Adds XP; returns how many levels were gained. */
  gainXp(v: number): number {
    this.xp += v * this.stats.xpGain;
    let n = 0;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = xpForLevel(this.level);
      n++;
    }
    return n;
  }

  recomputeStats(buffs: Partial<Stats>): void {
    const p = (id: PassiveId) => this.passives.get(id) ?? 0;
    const s = this.stats;
    const oldMax = s.maxHp;
    s.speed = (1 + 0.08 * p('speed')) * (buffs.speed ?? 1);
    s.magnet = (1 + 0.35 * p('magnet')) * (buffs.magnet ?? 1);
    s.cooldown = Math.pow(0.93, p('haste')) * (buffs.cooldown ?? 1);
    s.damage = (1 + 0.12 * p('power')) * (buffs.damage ?? 1);
    s.maxHp = 120 + 20 * p('vitality') + (buffs.maxHp ?? 0);
    s.regen = 0.3 * p('vitality') + (buffs.regen ?? 0);
    s.xpGain = buffs.xpGain ?? 1;
    s.area = buffs.area ?? 1;
    if (s.maxHp > oldMax) this.hp += s.maxHp - oldMax;
  }
}
