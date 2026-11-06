// Flow field toward the player over the terrain grid. A BFS from the player's cell expands to neighbours an enemy
// could walk FROM (climb ≤ 0.9 per cell, any drop is fine), so walkers route around cliffs and up the ramps instead
// of piling at the foot of a wall. Rebuilt a few times per second or when the player changes cell.

import type { Terrain } from '../world/terrain';

const MAX_CLIMB = 0.9;
const RANGE = 95; // cells (~106 units) — beyond that enemies just seek directly

export class FlowField {
  readonly dist: Int32Array;
  private queue: Int32Array;
  private lastCell = -1;
  private timer = 0;
  private N: number;

  constructor(private t: Terrain) {
    this.N = t.N;
    this.dist = new Int32Array(this.N * this.N).fill(-1);
    this.queue = new Int32Array(this.N * this.N);
  }

  private cellOf(x: number, z: number): number {
    const half = this.t.world / 2;
    const ix = Math.min(this.N - 1, Math.max(0, Math.round((x + half) / this.t.cell)));
    const iz = Math.min(this.N - 1, Math.max(0, Math.round((z + half) / this.t.cell)));
    return iz * this.N + ix;
  }

  update(dt: number, px: number, pz: number): void {
    this.timer -= dt;
    const c = this.cellOf(px, pz);
    if (c === this.lastCell && this.timer > 0) return;
    this.lastCell = c;
    this.timer = 0.4;
    const N = this.N,
      H = this.t.heights,
      D = this.dist,
      Q = this.queue;
    D.fill(-1);
    let head = 0,
      tail = 0;
    D[c] = 0;
    Q[tail++] = c;
    while (head < tail) {
      const i = Q[head++];
      const d = D[i];
      if (d >= RANGE) continue;
      const x = i % N,
        z = (i - x) / N;
      const hi = H[i];
      // j can step into i when the climb from j to i is small.
      if (x > 0) {
        const j = i - 1;
        if (D[j] < 0 && hi - H[j] <= MAX_CLIMB) {
          D[j] = d + 1;
          Q[tail++] = j;
        }
      }
      if (x < N - 1) {
        const j = i + 1;
        if (D[j] < 0 && hi - H[j] <= MAX_CLIMB) {
          D[j] = d + 1;
          Q[tail++] = j;
        }
      }
      if (z > 0) {
        const j = i - N;
        if (D[j] < 0 && hi - H[j] <= MAX_CLIMB) {
          D[j] = d + 1;
          Q[tail++] = j;
        }
      }
      if (z < N - 1) {
        const j = i + N;
        if (D[j] < 0 && hi - H[j] <= MAX_CLIMB) {
          D[j] = d + 1;
          Q[tail++] = j;
        }
      }
    }
  }

  /** Unit direction to walk from (x,z), or null when the cell is unreached (fall back to direct seek). */
  dir(x: number, z: number, out: { x: number; z: number }): boolean {
    const N = this.N,
      D = this.dist,
      H = this.t.heights;
    const i = this.cellOf(x, z);
    const d = D[i];
    if (d < 0) return false;
    if (d <= 2) return false; // close enough: seek the player directly
    const ix = i % N,
      iz = (i - ix) / N;
    let best = d,
      bx = 0,
      bz = 0;
    for (let dz = -1; dz <= 1; dz++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dz) continue;
        const nx = ix + dx,
          nz = iz + dz;
        if (nx < 0 || nz < 0 || nx >= N || nz >= N) continue;
        const j = nz * N + nx;
        const dj = D[j];
        if (dj < 0 || H[j] - H[i] > MAX_CLIMB) continue;
        // Prefer straight moves on ties; diagonals only when they are strictly better.
        const score = dj + (dx && dz ? 0.4 : 0);
        if (score < best) {
          best = score;
          bx = dx;
          bz = dz;
        }
      }
    if (!bx && !bz) return false;
    const l = Math.hypot(bx, bz);
    out.x = bx / l;
    out.z = bz / l;
    return true;
  }
}
