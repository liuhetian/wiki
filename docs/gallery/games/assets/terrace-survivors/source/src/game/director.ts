// Wave director: spawn rate and cap grow with time, the enemy mix unlocks per biome, elites appear after a minute,
// swarms ring the player every 75 s, and the boss arrives near the end of the run.

import type { Game } from './game';

export class Director {
  time = 0;
  bossSpawned = false;
  private acc = 0;
  private nextSwarm = 75;

  constructor(private g: Game, readonly runLength: number) {}

  get bossTime(): number {
    return this.runLength * 0.9;
  }

  private hpMul(): number {
    const m = this.time / 60;
    return 1 + m * 0.32 + m * m * 0.035;
  }

  private pickType(): string {
    const list = this.g.biome.enemies.filter((e) => e.from <= this.time);
    let total = 0;
    for (const e of list) total += e.w;
    let r = Math.random() * total;
    for (const e of list) if ((r -= e.w) <= 0) return e.id;
    return list[0].id;
  }

  /** A spot on a ring around the player, inside the map, preferably on a similar level. */
  private spot(rMin: number, rMax: number, ahead = false): { x: number; z: number } | null {
    const g = this.g,
      p = g.player,
      t = g.terrain;
    let best: { x: number; z: number } | null = null;
    for (let k = 0; k < 10; k++) {
      let a = Math.random() * Math.PI * 2;
      if (ahead && Math.hypot(p.vx, p.vz) > 0.5) a = Math.atan2(p.vz, p.vx) + (Math.random() - 0.5) * 1.8;
      const r = rMin + Math.random() * (rMax - rMin);
      const x = p.x + Math.cos(a) * r,
        z = p.z + Math.sin(a) * r;
      if (!t.inBounds(x, z, 3)) continue;
      best = { x, z };
      if (Math.abs(t.height(x, z) - p.y) < 5) return best;
    }
    return best;
  }

  spawnOne(type?: string, elite = false): void {
    const s = this.spot(28, 40);
    if (!s) return;
    this.g.enemies.spawn(this.g, type ?? this.pickType(), s.x, s.z, this.hpMul(), elite);
  }

  relocate(i: number): void {
    const e = this.g.enemies;
    const s = this.spot(30, 38, true);
    if (!s) return;
    e.x[i] = s.x;
    e.z[i] = s.z;
    e.y[i] = this.g.terrain.height(s.x, s.z) + (e.typeOf(i).fly ? 1.4 : 0);
  }

  update(dt: number): void {
    const g = this.g,
      e = g.enemies;
    this.time += dt;
    const t = this.time;
    const cap = Math.min(480, 45 + t * 0.85);
    const rate = (0.8 + t / 24) * (this.bossSpawned ? 0.35 : 1);
    this.acc += rate * dt;
    while (this.acc >= 1) {
      this.acc -= 1;
      if (e.alive < cap) {
        const elite = t > 60 && Math.random() < 0.012 + t / 30000;
        this.spawnOne(undefined, elite);
      }
    }
    if (t >= this.nextSwarm && !this.bossSpawned) {
      this.nextSwarm += 75;
      const n = Math.round(22 + t / 12);
      const type = this.pickType();
      const p = g.player;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const x = p.x + Math.cos(a) * 20,
          z = p.z + Math.sin(a) * 20;
        if (g.terrain.inBounds(x, z, 3)) e.spawn(g, type, x, z, this.hpMul());
      }
      g.hud.banner('怪物潮来袭！', '#ffb070');
    }
    if (!this.bossSpawned && t >= this.bossTime) {
      this.bossSpawned = true;
      const s = this.spot(22, 26) ?? { x: g.player.x + 20, z: g.player.z };
      e.spawn(g, 'golem', s.x, s.z, 1 + (this.hpMul() - 1) * 0.35);
      g.hud.banner('远古岩魔像 苏醒了！', '#ff6a5a');
      g.camera.shake(0.5, 0.6);
    }
  }
}
