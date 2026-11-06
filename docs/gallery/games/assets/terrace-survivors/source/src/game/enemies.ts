// Enemies stored as struct-of-arrays (hundreds at 60 Hz without GC churn). Steering: seek the player + separation
// from the spatial grid + knockback; walkers cannot climb cliffs and slide along them, flyers hover. Dying enemies
// play their faint animation and dissolve. The boss (golem) adds a charge and a rock rain on top of the chase.

import { ENEMY_TYPES, type EnemyType } from './data';
import { SpatialGrid } from './grid';
import { MAX_STEP } from '../world/terrain';
import type { Game } from './game';
import { Fx } from '../art/fx';

const CAP = 1400;
const TYPE_IDS = Object.keys(ENEMY_TYPES);

export class Enemies {
  readonly type = new Uint8Array(CAP);
  readonly x = new Float32Array(CAP);
  readonly y = new Float32Array(CAP);
  readonly z = new Float32Array(CAP);
  readonly vy = new Float32Array(CAP);
  readonly hp = new Float32Array(CAP);
  readonly maxHp = new Float32Array(CAP);
  readonly speed = new Float32Array(CAP);
  readonly dmg = new Float32Array(CAP);
  readonly rad = new Float32Array(CAP);
  readonly scale = new Float32Array(CAP);
  readonly fx = new Float32Array(CAP);
  readonly fz = new Float32Array(CAP);
  readonly kx = new Float32Array(CAP);
  readonly kz = new Float32Array(CAP);
  readonly flash = new Float32Array(CAP);
  readonly hurtT = new Float32Array(CAP);
  readonly atkT = new Float32Array(CAP);
  readonly animT = new Float32Array(CAP);
  readonly dieT = new Float32Array(CAP); // < 0 alive
  readonly elite = new Uint8Array(CAP);
  readonly orbHit = new Float32Array(CAP); // per-enemy cooldown for the orbit weapon
  readonly active = new Int32Array(CAP);
  count = 0;
  private free: number[] = [];
  readonly grid: SpatialGrid;
  boss = -1;
  private bossT = { charge: 4, rain: 7, state: 0, stateT: 0, dx: 0, dz: 0 };
  private fd = { x: 0, z: 0 };

  constructor(world: number) {
    for (let i = CAP - 1; i >= 0; i--) this.free.push(i);
    this.grid = new SpatialGrid(world, 3, CAP);
  }

  get alive(): number {
    return this.count;
  }

  typeOf(i: number): EnemyType {
    return ENEMY_TYPES[TYPE_IDS[this.type[i]]];
  }

  isAlive(i: number): boolean {
    return this.dieT[i] < 0 && this.hp[i] > 0;
  }

  spawn(g: Game, id: string, x: number, z: number, hpMul: number, elite = false): number {
    const i = this.free.pop();
    if (i === undefined) return -1;
    const T = ENEMY_TYPES[id];
    const b = g.sprites.get(id);
    this.type[i] = TYPE_IDS.indexOf(id);
    this.x[i] = x;
    this.z[i] = z;
    this.y[i] = g.terrain.height(x, z) + (T.fly ? 1.4 : 0);
    this.vy[i] = 0;
    const em = elite ? 3.5 : 1;
    this.hp[i] = this.maxHp[i] = T.hp * hpMul * em;
    this.speed[i] = T.speed * (elite ? 0.9 : 1) * (0.92 + Math.random() * 0.16);
    this.dmg[i] = T.dmg * (elite ? 1.5 : 1) * (1 + (hpMul - 1) * 0.35);
    this.scale[i] = T.scale * (elite ? 1.35 : 1);
    this.rad[i] = Math.max(0.35, b.bodyWidth * this.scale[i] * 0.42);
    this.fx[i] = 0;
    this.fz[i] = 1;
    this.kx[i] = this.kz[i] = 0;
    this.flash[i] = this.hurtT[i] = this.atkT[i] = 0;
    this.animT[i] = Math.random() * 3;
    this.dieT[i] = -1;
    this.elite[i] = elite ? 1 : 0;
    this.orbHit[i] = 0;
    this.active[this.count++] = i;
    if (id === 'golem') this.boss = i;
    return i;
  }

  damage(g: Game, i: number, amount: number, kbx = 0, kbz = 0, crit = false): void {
    if (!this.isAlive(i)) return;
    this.hp[i] -= amount;
    this.flash[i] = 1;
    this.hurtT[i] = 0.16;
    const res = 1 - this.typeOf(i).knockRes;
    this.kx[i] += kbx * res;
    this.kz[i] += kbz * res;
    g.fx.number(this.x[i], this.y[i] + 1.4 * this.scale[i], this.z[i], amount, crit);
    if (this.hp[i] <= 0) this.kill(g, i);
  }

  private kill(g: Game, i: number): void {
    this.dieT[i] = 0;
    this.animT[i] = 0;
    const T = this.typeOf(i);
    g.player.kills++;
    const c = T.color;
    const r = ((c >> 16) & 255) / 255,
      gg = ((c >> 8) & 255) / 255,
      b = (c & 255) / 255;
    for (let k = 0; k < 7; k++)
      g.fx.particle(this.x[i], this.y[i] + 0.7, this.z[i], (Math.random() - 0.5) * 6, 3 + Math.random() * 4, (Math.random() - 0.5) * 6, 0.5, 0.35, Fx.Square, r * 1.4, gg * 1.4, b * 1.4, 14);
    if (i === this.boss) {
      g.onBossKilled(this.x[i], this.y[i], this.z[i]);
      return;
    }
    const xp = T.xp * (this.elite[i] ? 6 : 1);
    g.pickups.dropGem(this.x[i], this.y[i], this.z[i], xp);
    if (this.elite[i]) {
      for (let k = 0; k < 5; k++) g.pickups.drop('coin', this.x[i] + (Math.random() - 0.5) * 2, this.z[i] + (Math.random() - 0.5) * 2);
      g.interact.freeChest(this.x[i], this.z[i]);
    } else {
      if (Math.random() < 0.09) g.pickups.drop('coin', this.x[i], this.z[i]);
      if (Math.random() < 0.012) g.pickups.drop('fruit', this.x[i], this.z[i]);
      if (Math.random() < 0.0025) g.pickups.drop('magnet', this.x[i], this.z[i]);
    }
  }

  /** Nearest living enemy to (x,z) within r, skipping ids in `skip`. */
  nearest(x: number, z: number, r: number, skip?: Set<number>): number {
    let best = -1,
      bd = r * r;
    this.grid.query(x, z, r, (i) => {
      if (!this.isAlive(i) || skip?.has(i)) return;
      const d = (this.x[i] - x) ** 2 + (this.z[i] - z) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }

  update(dt: number, g: Game): void {
    const p = g.player,
      t = g.terrain;
    this.grid.build(this.active, this.count, this.x, this.z);
    for (let k = 0; k < this.count; k++) {
      const i = this.active[k];
      this.animT[i] += dt;
      this.flash[i] = Math.max(0, this.flash[i] - dt * 6);
      this.hurtT[i] -= dt;
      this.atkT[i] -= dt;
      this.orbHit[i] -= dt;
      if (this.dieT[i] >= 0) {
        this.dieT[i] += dt;
        continue;
      }
      const T = this.typeOf(i);
      let dx = p.x - this.x[i],
        dz = p.z - this.z[i];
      const d = Math.hypot(dx, dz) || 1e-3;
      dx /= d;
      dz /= d;
      const sx0 = dx,
        sz0 = dz;
      // Walkers follow the flow field (around cliffs, up ramps); flyers go straight.
      if (!T.fly && g.flow.dir(this.x[i], this.z[i], this.fd)) {
        dx = this.fd.x;
        dz = this.fd.z;
      }
      let sp = this.speed[i] * (this.hurtT[i] > 0 ? 0.35 : 1);
      if (i === this.boss) {
        const r = this.bossAI(dt, g, i, dx, dz, sx0, sz0);
        dx = r.dx;
        dz = r.dz;
        sp = r.sp;
      }
      // Separation.
      let sx = 0,
        sz = 0;
      const ri = this.rad[i];
      this.grid.query(this.x[i], this.z[i], ri * 2.4, (j) => {
        if (j === i || this.dieT[j] >= 0) return;
        const ex = this.x[i] - this.x[j],
          ez = this.z[i] - this.z[j];
        const m = ri + this.rad[j];
        const dd = ex * ex + ez * ez;
        if (dd < m * m && dd > 1e-6) {
          const l = Math.sqrt(dd);
          sx += (ex / l) * (m - l);
          sz += (ez / l) * (m - l);
        }
      });
      let vx = dx * sp + sx * 5 + this.kx[i],
        vz = dz * sp + sz * 5 + this.kz[i];
      const kd = Math.exp(-7 * dt);
      this.kx[i] *= kd;
      this.kz[i] *= kd;
      let nx = this.x[i] + vx * dt,
        nz = this.z[i] + vz * dt;
      if (T.fly) {
        const ground = t.height(nx, nz);
        const want = Math.max(ground, p.y) + 1.5;
        this.y[i] += (want - this.y[i]) * (1 - Math.exp(-3 * dt));
      } else {
        const blocked = (x: number, z: number) => t.height(x, z) - this.y[i] > MAX_STEP;
        if (blocked(nx, nz)) {
          // Slide along the cliff: try turning left/right of the desired heading.
          let ok = false;
          for (const a of [1.1, -1.1, 1.9, -1.9]) {
            const c = Math.cos(a),
              s = Math.sin(a);
            const rx = (vx * c - vz * s) * 0.8,
              rz = (vx * s + vz * c) * 0.8;
            if (!blocked(this.x[i] + rx * dt, this.z[i] + rz * dt)) {
              vx = rx;
              vz = rz;
              nx = this.x[i] + rx * dt;
              nz = this.z[i] + rz * dt;
              ok = true;
              break;
            }
          }
          if (!ok) {
            nx = this.x[i];
            nz = this.z[i];
          }
        }
        const gh = t.height(nx, nz);
        if (gh < this.y[i] - 0.3 || this.vy[i] !== 0) {
          this.vy[i] -= 30 * dt;
          this.y[i] += this.vy[i] * dt;
          if (this.y[i] <= gh) {
            this.y[i] = gh;
            this.vy[i] = 0;
          }
        } else this.y[i] = gh;
      }
      if (!t.inBounds(nx, nz, 1)) {
        nx = this.x[i];
        nz = this.z[i];
      }
      this.x[i] = nx;
      this.z[i] = nz;
      if (Math.abs(vx) + Math.abs(vz) > 0.2) {
        this.fx[i] = vx;
        this.fz[i] = vz;
      }
      // Contact damage.
      if (d < ri + p.radius + 0.15 && Math.abs(this.y[i] - (T.fly ? p.y + 1.5 : p.y)) < 1.8) {
        if (this.atkT[i] <= 0) this.atkT[i] = g.sprites.get(T.id).animLength('attack');
        if (p.hit(this.dmg[i])) g.onPlayerHit();
      }
      // Stragglers far behind are recycled ahead of the player.
      if (d > 70 && i !== this.boss) g.director.relocate(i);
    }
    // Remove finished deaths (swap-remove keeps the active list compact).
    for (let k = this.count - 1; k >= 0; k--) {
      const i = this.active[k];
      if (this.dieT[i] > 0.75) {
        this.active[k] = this.active[--this.count];
        this.free.push(i);
        if (i === this.boss) this.boss = -1;
      }
    }
  }

  private bossAI(dt: number, g: Game, i: number, dx: number, dz: number, sx: number, sz: number): { dx: number; dz: number; sp: number } {
    const b = this.bossT;
    b.stateT -= dt;
    b.charge -= dt;
    b.rain -= dt;
    const rage = this.hp[i] < this.maxHp[i] * 0.5 ? 1.35 : 1;
    if (b.state === 0) {
      if (b.charge <= 0) {
        b.state = 1;
        b.stateT = 0.9;
        b.dx = sx;
        b.dz = sz;
        this.atkT[i] = 0.9;
        g.fx.telegraphLine(this.x[i], this.z[i], sx, sz, 16, 0.9);
      }
      if (b.rain <= 0) {
        b.rain = 9 / rage;
        this.atkT[i] = g.sprites.get('golem').animLength('attack');
        const n = Math.round(6 * rage);
        for (let k = 0; k < n; k++) {
          const a = Math.random() * Math.PI * 2,
            r = k === 0 ? 0 : 2 + Math.random() * 7;
          g.projectiles.bossRock(g.player.x + Math.cos(a) * r, g.player.z + Math.sin(a) * r, 1.2 + k * 0.12);
        }
      }
      return { dx, dz, sp: this.speed[i] * rage };
    }
    if (b.state === 1) {
      // Wind-up: stand still, shaking.
      if (b.stateT <= 0) {
        b.state = 2;
        b.stateT = 1.0;
        g.camera.shake(0.4, 0.3);
      }
      return { dx: b.dx, dz: b.dz, sp: 0 };
    }
    // Charging.
    if (b.stateT <= 0) {
      b.state = 0;
      b.charge = 6.5 / rage;
    }
    if (Math.random() < 0.5) g.fx.particle(this.x[i], this.y[i] + 0.3, this.z[i], (Math.random() - 0.5) * 3, 2, (Math.random() - 0.5) * 3, 0.5, 0.45, Fx.Puff, 0.9, 0.85, 0.75, 0);
    return { dx: b.dx, dz: b.dz, sp: 17 };
  }

  render(g: Game): void {
    const s = g.sprites,
      sh = g.fx.shadows;
    for (let k = 0; k < this.count; k++) {
      const i = this.active[k];
      const T = this.typeOf(i);
      if (!g.inView(this.x[i], this.y[i] + 1, this.z[i], 2.5 * this.scale[i])) continue;
      const b = s.get(T.id);
      const dying = this.dieT[i] >= 0;
      const anim = dying ? 'faint' : this.hurtT[i] > 0 ? 'hurt' : this.atkT[i] > 0 ? 'attack' : 'walk';
      const time = dying ? this.dieT[i] : anim === 'attack' ? b.animLength('attack') - this.atkT[i] : anim === 'hurt' ? 0.16 - this.hurtT[i] : this.animT[i];
      const diss = dying ? Math.min(1, Math.max(0, (this.dieT[i] - 0.3) / 0.45)) : 0;
      const outline = this.elite[i] ? 1 : i === this.boss && this.bossT.state === 1 ? 2 : 0;
      b.push(this.x[i], this.y[i], this.z[i], anim, time, s.dirRow(this.fx[i], this.fz[i]), this.scale[i], dying, this.flash[i], diss, outline, 0);
      if (!dying || diss < 0.5) {
        const gy = T.fly ? g.terrain.height(this.x[i], this.z[i]) : this.y[i];
        sh.push(this.x[i], gy, this.z[i], b.bodyWidth * this.scale[i] * 0.9);
      }
    }
  }
}
