import * as THREE from 'three';

/**
 * Endless road centre line. Everything along the road is placed in (s, d): s = arc length from
 * the generator's origin, d = signed distance to the left (+) or right (-) of the centre line.
 *
 * The line is integrated forward block by block from a smooth curvature signal, with the heading
 * pulled back toward +Z so the road keeps heading the same general way and never loops onto itself.
 * Blocks far behind are dropped with `discardBefore`.
 */
export const ROAD = {
  halfWidth: 4.2, // painted asphalt half width
  sidewalk: 1.25, // curb strip outside the asphalt
  step: 0.25, // sampling step
  block: 64, // arc length per stored block
};

const PER = ROAD.block / ROAD.step; // samples per block (plus one shared end sample)

export class RoadPath {
  constructor(seed = 1) {
    // three incommensurate waves: S bends of different sizes that never repeat exactly
    const r = (k) => ((Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
    this.waves = [
      [0.0085, (Math.PI * 2) / 210, r(1) * 6.283],
      [0.006, (Math.PI * 2) / 97, r(2) * 6.283],
      [0.003, (Math.PI * 2) / 53, r(3) * 6.283],
    ];
    this.blocks = new Map(); // block index → { px, pz, tx, tz }
    this.first = 0;
    this.next = 0; // index of the next block to generate
    this.state = { x: 0, z: 0, theta: 0 };
  }

  curvature(s, theta) {
    let k = 0;
    for (const [a, w, p] of this.waves) k += a * Math.sin(s * w + p);
    return k - 0.006 * theta; // pull the heading back toward +Z
  }

  /** Make sure the line exists up to arc length s. */
  ensure(s) {
    while (this.next * ROAD.block <= s + ROAD.block) this.generate();
  }

  generate() {
    const b = this.next++;
    const px = new Float64Array(PER + 1);
    const pz = new Float64Array(PER + 1);
    const tx = new Float64Array(PER + 1);
    const tz = new Float64Array(PER + 1);
    let { x, z, theta } = this.state;
    const h = ROAD.step;
    for (let i = 0; i <= PER; i++) {
      px[i] = x;
      pz[i] = z;
      tx[i] = Math.sin(theta);
      tz[i] = Math.cos(theta);
      if (i === PER) break;
      const s = b * ROAD.block + i * h;
      // midpoint integration keeps the line smooth at this step size
      const th2 = theta + 0.5 * h * this.curvature(s, theta);
      x += Math.sin(th2) * h;
      z += Math.cos(th2) * h;
      theta += h * this.curvature(s + 0.5 * h, th2);
    }
    this.state = { x, z, theta };
    this.blocks.set(b, { px, pz, tx, tz });
  }

  /** Forget blocks that end before arc length s. */
  discardBefore(s) {
    while (this.first < this.next - 1 && (this.first + 1) * ROAD.block < s) {
      this.blocks.delete(this.first);
      this.first++;
    }
  }

  get minS() { return this.first * ROAD.block; }
  get maxS() { return this.next * ROAD.block; }

  /** Point, unit tangent and left normal at arc length s (clamped to the stored range). */
  frame(s, out = {}) {
    s = Math.min(Math.max(s, this.minS), this.maxS - 1e-6);
    const bi = Math.floor(s / ROAD.block);
    const blk = this.blocks.get(bi);
    const f = (s - bi * ROAD.block) / ROAD.step;
    const i = Math.min(Math.floor(f), PER - 1);
    const k = f - i;
    out.x = blk.px[i] + (blk.px[i + 1] - blk.px[i]) * k;
    out.z = blk.pz[i] + (blk.pz[i + 1] - blk.pz[i]) * k;
    let tx = blk.tx[i] + (blk.tx[i + 1] - blk.tx[i]) * k;
    let tz = blk.tz[i] + (blk.tz[i + 1] - blk.tz[i]) * k;
    const l = Math.hypot(tx, tz);
    tx /= l;
    tz /= l;
    out.tx = tx;
    out.tz = tz;
    // left normal = up × tangent
    out.nx = tz;
    out.nz = -tx;
    return out;
  }

  /** World XZ of road coordinates (s, d). */
  toWorld(s, d, out = new THREE.Vector3()) {
    const f = this.frame(s, _f);
    return out.set(f.x + f.nx * d, 0, f.z + f.nz * d);
  }

  /** Heading angle (rotation about +Y) that turns local +Z onto the tangent at s. */
  heading(s) {
    const f = this.frame(s, _f);
    return Math.atan2(f.tx, f.tz);
  }

  /** Nearest arc length to world (x, z), searched in [from, to]. */
  project(x, z, from, to) {
    from = Math.max(from, this.minS);
    to = Math.min(to, this.maxS - ROAD.step);
    let best = from;
    let bd = Infinity;
    for (let s = from; s <= to; s += ROAD.step) {
      const f = this.frame(s, _f);
      const d = (f.x - x) ** 2 + (f.z - z) ** 2;
      if (d < bd) { bd = d; best = s; }
    }
    return best;
  }
}

const _f = {};
