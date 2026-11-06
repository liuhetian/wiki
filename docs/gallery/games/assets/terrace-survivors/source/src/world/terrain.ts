// Procedural terraced terrain. Height = fbm + a few raised massifs, then QUANTISED into terraces with a narrow
// smoothstep between levels (flat plateaus, near-vertical cliffs). Winding dirt paths soften the quantisation into
// ramps; a BFS then makes sure every sizeable plateau is reachable from the spawn, carving ramps where needed.
// The play area is ringed by tall walls.

import {
  BufferAttribute,
  DataTexture,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  RedFormat,
  Vector3,
  type ShaderMaterial,
} from 'three';
import { Noise2, Rng, clamp, smoothstep } from '../core/rng';
import type { Biome } from './biomes';

export const MAX_STEP = 1.1; // walkers cannot climb more than this between two steps

export class Terrain {
  readonly world = 280;
  readonly res: number;
  readonly cell: number;
  readonly play: number;
  readonly N: number;
  readonly heights: Float32Array;
  readonly pathMask: Float32Array;
  readonly massifs: { x: number; z: number; r: number }[] = [];
  readonly paths: [number, number][][] = [];
  readonly spawn = new Vector3();
  mesh!: Mesh;
  private n1: Noise2;
  private n2: Noise2;
  // Static circle colliders (trees, rocks, interactables), bucketed on a coarse grid.
  private colCell = 4;
  private colDim: number;
  private colGrid: number[][];
  private cols: { x: number; z: number; r: number }[] = [];

  constructor(readonly biome: Biome, readonly seed: number) {
    this.res = Math.round(this.world / 1.12);
    this.cell = this.world / this.res;
    this.play = this.world / 2 - 12;
    this.N = this.res + 1;
    this.heights = new Float32Array(this.N * this.N);
    this.pathMask = new Float32Array(this.N * this.N);
    this.n1 = new Noise2(seed);
    this.n2 = new Noise2(seed ^ 0x5bd1e995);
    this.colDim = Math.ceil(this.world / this.colCell) + 1;
    this.colGrid = Array.from({ length: this.colDim * this.colDim }, () => []);
    this.generate();
    this.blur();
    this.connectPlateaus();
    this.spawn.set(0, this.height(0, 0), 0);
  }

  idx(ix: number, iz: number): number {
    return iz * this.N + ix;
  }

  private generate(): void {
    const { biome } = this;
    const rng = new Rng(this.seed ^ 0x51a7);
    const L = biome.levels,
      S = biome.stepH,
      half = this.world / 2;
    for (let i = 0, tries = 0; i < biome.massifs && tries < 100; tries++) {
      const x = rng.range(-this.play * 0.75, this.play * 0.75),
        z = rng.range(-this.play * 0.75, this.play * 0.75);
      if (Math.hypot(x, z) < 42 || this.massifs.some((m) => Math.hypot(m.x - x, m.z - z) < 50)) continue;
      this.massifs.push({ x, z, r: rng.range(16, 26) });
      i++;
    }
    const segs: number[] = [];
    for (let p = 0; p < 5; p++) {
      let a = (p / 5) * Math.PI * 2 + rng.range(-0.4, 0.4),
        x = 0,
        z = 0;
      const pts: [number, number][] = [[0, 0]];
      for (let k = 0; k < 28; k++) {
        a += rng.range(-0.42, 0.42);
        x += Math.cos(a) * 6;
        z += Math.sin(a) * 6;
        if (Math.max(Math.abs(x), Math.abs(z)) > this.play - 10) break;
        pts.push([x, z]);
        const q = pts[pts.length - 2];
        segs.push(q[0], q[1], x, z);
      }
      this.paths.push(pts);
    }
    const pathDist = (x: number, z: number) => {
      let best = 1e9;
      for (let i = 0; i < segs.length; i += 4) {
        const ax = segs[i],
          az = segs[i + 1],
          bx = segs[i + 2],
          bz = segs[i + 3];
        const dx = bx - ax,
          dz = bz - az;
        const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
        const d = Math.hypot(x - ax - dx * t, z - az - dz * t);
        if (d < best) best = d;
      }
      // Wobbly edges.
      return best + this.n2.get(x * 0.15, z * 0.15) * 0.8;
    };
    const { n1, n2 } = this;
    // Raw relief in [0,1] before terracing.
    const relief = (x: number, z: number) => {
      let i = n1.fbm(x * biome.freq, z * biome.freq, 4) * 0.62 + 0.5;
      i += n2.fbm(x * 0.03, z * 0.03, 2) * 0.04;
      for (const m of this.massifs) {
        const a = Math.hypot(x - m.x, z - m.z) + n2.get(x * 0.05, z * 0.05) * 6;
        const s = clamp((m.r - a) / (m.r * 0.85), 0, 1);
        i += s * ((L + 1.35) / L - i);
      }
      return clamp(i, 0, 1);
    };
    // The spawn clearing sits on the terrace level the noise gives it there (never the lowest), so it is not a pit.
    let avg = 0;
    for (let k = 0; k < 16; k++) avg += relief(Math.cos(k) * 10, Math.sin(k) * 10) / 16;
    const spawnH = clamp(Math.round(avg * L), 1, L - 1) * S;
    for (let iz = 0; iz < this.N; iz++)
      for (let ix = 0; ix < this.N; ix++) {
        const x = ix * this.cell - half,
          z = iz * this.cell - half;
        const i = relief(x, z);
        const c = smoothstep(0.25, 0.55, n2.get(x * 0.014 + 40, z * 0.014 - 17));
        const f = i * L,
          p = Math.floor(f),
          fr = f - p,
          k = 0.035 + c * 0.28;
        const terr = (p + smoothstep(0.5 - k, 0.5 + k, fr)) * S;
        const pd = pathDist(x, z);
        const soft = smoothstep(7, 2.5, pd) * (0.55 + 0.45 * smoothstep(-0.2, 0.3, n2.get(x * 0.02, z * 0.02)));
        let o = terr * (1 - soft * 0.92) + i * L * S * soft * 0.92;
        const sp = smoothstep(15, 7, Math.hypot(x, z));
        o = o * (1 - sp) + spawnH * sp;
        o += n2.get(x * 0.07, z * 0.07) * 0.12;
        const l = Math.max(Math.abs(x), Math.abs(z));
        o += smoothstep(this.play - 4, this.play + 10, l) * (20 + n1.get(x * 0.05, z * 0.05) * 8);
        const id = this.idx(ix, iz);
        this.heights[id] = o;
        this.pathMask[id] = smoothstep(2.7, 1.3, pd) * (l < this.play - 6 ? 1 : 0);
      }
  }

  private blur(): void {
    const e = this.heights.slice(),
      N = this.N;
    for (let z = 1; z < N - 1; z++)
      for (let x = 1; x < N - 1; x++) {
        let s = 0;
        for (let dz = -1; dz <= 1; dz++)
          for (let dx = -1; dx <= 1; dx++) s += e[(z + dz) * N + x + dx] * (dx === 0 && dz === 0 ? 4 : dx === 0 || dz === 0 ? 2 : 1);
        this.heights[z * N + x] = s / 16;
      }
  }

  /** BFS from the spawn over walkable steps; carves a ramp to the closest unreachable plateau, repeat. */
  private connectPlateaus(): void {
    const N = this.N,
      H = this.heights,
      half = this.world / 2;
    const hi = Math.floor((this.play - 3 + half) / this.cell),
      lo = N - 1 - hi;
    const inb = (x: number, z: number) => x >= lo && x <= hi && z >= lo && z <= hi;
    const start = this.idx(Math.round(half / this.cell), Math.round(half / this.cell));
    const D4 = [1, -1, N, -N];
    const step = (i: number, d: number) => {
      const x = i % N,
        nx = x + (d === 1 ? 1 : d === -1 ? -1 : 0);
      const z = (i - x) / N,
        nz = z + (d === N ? 1 : d === -N ? -1 : 0);
      return inb(nx, nz) ? nz * N + nx : -1;
    };
    for (let iter = 0; iter < 40; iter++) {
      const reach = new Uint8Array(N * N);
      const q = [start];
      reach[start] = 1;
      for (let h = 0; h < q.length; h++)
        for (const d of D4) {
          const j = step(q[h], d);
          if (j >= 0 && !reach[j] && Math.abs(H[j] - H[q[h]]) <= 0.9) {
            reach[j] = 1;
            q.push(j);
          }
        }
      // Unreached plateaus big enough to matter.
      const comp = new Int32Array(N * N).fill(-1);
      const sizes: number[] = [];
      for (let z = lo; z <= hi; z++)
        for (let x = lo; x <= hi; x++) {
          const i = z * N + x;
          if (reach[i] || comp[i] >= 0) continue;
          const id = sizes.length;
          const st = [i];
          comp[i] = id;
          let n = 0;
          while (st.length) {
            const c = st.pop()!;
            n++;
            for (const d of D4) {
              const j = step(c, d);
              if (j >= 0 && !reach[j] && comp[j] < 0 && Math.abs(H[j] - H[c]) <= 0.9) {
                comp[j] = id;
                st.push(j);
              }
            }
          }
          sizes.push(n);
        }
      if (!sizes.some((s) => s >= 60)) break;
      // Distance from the reachable set across everything (multi-source BFS) → closest big plateau.
      const dist = new Int32Array(N * N).fill(-1);
      const origin = new Int32Array(N * N);
      const bq: number[] = [];
      for (const i of q) {
        dist[i] = 0;
        origin[i] = i;
        bq.push(i);
      }
      let target = -1;
      for (let h = 0; h < bq.length && target < 0; h++) {
        const c = bq[h];
        for (const d of D4) {
          const j = step(c, d);
          if (j < 0 || dist[j] >= 0) continue;
          dist[j] = dist[c] + 1;
          origin[j] = origin[c];
          bq.push(j);
          if (comp[j] >= 0 && sizes[comp[j]] >= 60) {
            target = j;
            break;
          }
        }
      }
      if (target < 0) break;
      this.carveRamp(origin[target], target);
    }
  }

  private carveRamp(from: number, to: number): void {
    const N = this.N,
      H = this.heights;
    const fx = from % N,
      fz = (from - fx) / N,
      tx = to % N,
      tz = (to - tx) / N;
    const h0 = H[from],
      h1 = H[to];
    let dx = tx - fx,
      dz = tz - fz;
    const dl = Math.hypot(dx, dz) || 1;
    dx /= dl;
    dz /= dl;
    const len = Math.max(Math.abs(h1 - h0) / 0.42, 6);
    const mx = (fx + tx) / 2,
      mz = (fz + tz) / 2;
    const ax = mx - dx * len * 0.5,
      az = mz - dz * len * 0.5;
    const w = 2.2,
      fall = 2.5;
    const R = Math.ceil(len / 2 + w + fall + 1);
    for (let z = Math.max(1, Math.floor(mz - R)); z <= Math.min(N - 2, Math.ceil(mz + R)); z++)
      for (let x = Math.max(1, Math.floor(mx - R)); x <= Math.min(N - 2, Math.ceil(mx + R)); x++) {
        const px = x - ax,
          pz = z - az;
        const along = px * dx + pz * dz;
        const t = along / len;
        const perp = Math.abs(px * -dz + pz * dx);
        let wgt = perp <= w ? 1 : Math.max(0, 1 - (perp - w) / fall);
        if (t < 0) wgt *= Math.max(0, 1 + (t * len) / fall);
        if (t > 1) wgt *= Math.max(0, 1 - ((t - 1) * len) / fall);
        if (wgt <= 0) continue;
        const y = h0 + (h1 - h0) * clamp(t, 0, 1);
        const i = z * N + x;
        H[i] = H[i] * (1 - wgt) + y * wgt;
        if (perp < 1.6 && t > -0.1 && t < 1.1) this.pathMask[i] = Math.max(this.pathMask[i], 0.9);
      }
  }

  height(x: number, z: number): number {
    const half = this.world / 2;
    const r = clamp((x + half) / this.cell, 0, this.res - 0.001),
      i = clamp((z + half) / this.cell, 0, this.res - 0.001);
    const a = Math.floor(r),
      o = Math.floor(i),
      s = r - a,
      c = i - o;
    const H = this.heights,
      N = this.N;
    const u = H[o * N + a],
      d = H[o * N + a + 1],
      f = H[(o + 1) * N + a],
      p = H[(o + 1) * N + a + 1];
    return (u * (1 - s) + d * s) * (1 - c) + (f * (1 - s) + p * s) * c;
  }

  normal(x: number, z: number, out = new Vector3()): Vector3 {
    const e = 0.5;
    return out.set(this.height(x - e, z) - this.height(x + e, z), 2 * e, this.height(x, z - e) - this.height(x, z + e)).normalize();
  }

  pathAt(x: number, z: number): number {
    const half = this.world / 2;
    const ix = Math.round(clamp((x + half) / this.cell, 0, this.res)),
      iz = Math.round(clamp((z + half) / this.cell, 0, this.res));
    return this.pathMask[this.idx(ix, iz)];
  }

  inBounds(x: number, z: number, margin = 0): boolean {
    const r = this.play - margin;
    return x > -r && x < r && z > -r && z < r;
  }

  /** Flat enough to stand a prop or an interactable on. */
  isFlat(x: number, z: number, r = 1): boolean {
    const h = this.height(x, z);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      if (Math.abs(this.height(x + Math.cos(a) * r, z + Math.sin(a) * r) - h) > 0.35) return false;
    }
    return true;
  }

  // ------------------------------------------------------------- static colliders
  addCollider(x: number, z: number, r: number): void {
    const id = this.cols.length;
    this.cols.push({ x, z, r });
    const half = this.world / 2,
      C = this.colCell;
    const x0 = Math.floor((x - r + half) / C),
      x1 = Math.floor((x + r + half) / C);
    const z0 = Math.floor((z - r + half) / C),
      z1 = Math.floor((z + r + half) / C);
    for (let cz = Math.max(0, z0); cz <= Math.min(this.colDim - 1, z1); cz++)
      for (let cx = Math.max(0, x0); cx <= Math.min(this.colDim - 1, x1); cx++) this.colGrid[cz * this.colDim + cx].push(id);
  }

  /** Pushes a circle out of the static colliders. Returns the corrected position in `out`. */
  pushOut(x: number, z: number, r: number, out: { x: number; z: number }): void {
    const half = this.world / 2;
    const cx = Math.floor((x + half) / this.colCell),
      cz = Math.floor((z + half) / this.colCell);
    out.x = x;
    out.z = z;
    if (cx < 0 || cz < 0 || cx >= this.colDim || cz >= this.colDim) return;
    for (const id of this.colGrid[cz * this.colDim + cx]) {
      const c = this.cols[id];
      const dx = out.x - c.x,
        dz = out.z - c.z;
      const d = Math.hypot(dx, dz),
        m = c.r + r;
      if (d < m && d > 1e-4) {
        out.x = c.x + (dx / d) * m;
        out.z = c.z + (dz / d) * m;
      }
    }
  }

  // ------------------------------------------------------------- mesh
  build(material: ShaderMaterial): Mesh {
    const N = this.N,
      H = this.heights,
      half = this.world / 2;
    const geo = new PlaneGeometry(this.world, this.world, this.res, this.res).rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as BufferAttribute;
    const aPath = new Float32Array(pos.count),
      aCliff = new Float32Array(pos.count * 2);
    // Local cliff top / foot (5×5 max/min): occlusion at the foot and turf over the lip in the shader.
    const top = new Float32Array(N * N),
      foot = new Float32Array(N * N);
    for (let z = 0; z < N; z++)
      for (let x = 0; x < N; x++) {
        let mx = -1e9,
          mn = 1e9;
        for (let dz = -2; dz <= 2; dz++)
          for (let dx = -2; dx <= 2; dx++) {
            const h = H[clamp(z + dz, 0, N - 1) * N + clamp(x + dx, 0, N - 1)];
            if (h > mx) mx = h;
            if (h < mn) mn = h;
          }
        top[z * N + x] = mx;
        foot[z * N + x] = mn;
      }
    for (let v = 0; v < pos.count; v++) {
      const ix = Math.round((pos.getX(v) + half) / this.cell),
        iz = Math.round((pos.getZ(v) + half) / this.cell);
      const i = iz * N + ix;
      pos.setY(v, H[i]);
      aPath[v] = this.pathMask[i];
      aCliff[v * 2] = top[i];
      aCliff[v * 2 + 1] = foot[i];
    }
    geo.setAttribute('aPath', new BufferAttribute(aPath, 1));
    geo.setAttribute('aCliff', new BufferAttribute(aCliff, 2));
    geo.computeVertexNormals();
    this.mesh = new Mesh(geo, material);
    this.mesh.frustumCulled = false;
    return this.mesh;
  }

  /** Baked prop shadows: a world-sized mask, 2 texels per unit. */
  static shadeTexture(world: number, blobs: { x: number; z: number; r: number }[], sunDir: Vector3): DataTexture {
    const S = Math.round(world * 2);
    const raw = new Float32Array(S * S);
    const ox = (-sunDir.x / sunDir.y) * 0.5,
      oz = (-sunDir.z / sunDir.y) * 0.5;
    for (const b of blobs) {
      const cx = (b.x + ox * b.r + world / 2) * 2,
        cz = (b.z + oz * b.r + world / 2) * 2;
      const rx = b.r * 2,
        rz = b.r * 2 * 0.8;
      for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++)
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          if (x < 0 || z < 0 || x >= S || z >= S) continue;
          const d = ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2;
          if (d <= 1) raw[z * S + x] = 1;
        }
    }
    const data = new Uint8Array(S * S);
    for (let z = 0; z < S; z++)
      for (let x = 0; x < S; x++) {
        let s = 0,
          n = 0;
        for (let dz = -1; dz <= 1; dz++)
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx,
              zz = z + dz;
            if (xx < 0 || zz < 0 || xx >= S || zz >= S) continue;
            s += raw[zz * S + xx];
            n++;
          }
        data[z * S + x] = Math.round((s / n) * 255);
      }
    const t = new DataTexture(data, S, S, RedFormat);
    t.magFilter = t.minFilter = LinearFilter;
    t.needsUpdate = true;
    return t;
  }
}
