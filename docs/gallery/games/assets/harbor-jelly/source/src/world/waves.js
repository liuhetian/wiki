import * as THREE from 'three';
import { WATER, PIER, LIGHTHOUSE } from './layout.js';

/**
 * Mid-scale waves: a height field over the sea, integrated on the CPU.
 *
 *   h_tt = c² ∇²h − κ h − γ h_t + ν ∇²h_t + forcing
 *
 * The κ term is what makes it feel like jelly rather than plain water: long, broad bumps wobble in
 * place and settle back to flat, short ones run across the box and bounce off its walls. The walls of
 * the block, the rubble breakwater and the lighthouse base reflect waves.
 *
 * The heights go into an RG float texture (R = height, G = smoothed curvature for the light focusing
 * on the sea floor) that every shader samples with the same bilinear lookup as `sample()`.
 */
const DX = 0.25;
export const WAVE = {
  dx: DX,
  x0: WATER.x0,
  z0: WATER.z0,
  nx: Math.round((WATER.x1 - WATER.x0) / DX) + 1,
  nz: Math.round((WATER.z1 - WATER.z0) / DX) + 1,
};

const C = 4.6; // wave speed, units / s
const KAPPA = 2.6; // pull back to flat
const GAMMA = 0.38; // damping
const NU = 0.05; // viscosity, keeps grid-scale noise down
const STEP = 1 / 120;
const WALL_BAND = 1.1; // how far from the walls the jelly's own sloshing pushes the water

export class WaveSim {
  constructor() {
    const { nx, nz } = WAVE;
    const n = nx * nz;
    this.n = n;
    this.h = new Float32Array(n);
    this.v = new Float32Array(n);
    this.vn = new Float32Array(n);
    this.force = new Float32Array(n);
    this.fluid = new Uint8Array(n);
    this.nL = new Int32Array(n);
    this.nR = new Int32Array(n);
    this.nU = new Int32Array(n);
    this.nD = new Int32Array(n);
    this.acc = 0;

    const solid = (x, z) =>
      (x > PIER.x0 - 0.9 && Math.abs(z - PIER.z) < 1.0) || Math.hypot(x - LIGHTHOUSE.x, z - LIGHTHOUSE.z) < 1.5;
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        this.fluid[k] = solid(WAVE.x0 + i * DX, WAVE.z0 + j * DX) ? 0 : 1;
      }
    }
    // neighbours; a wall or a solid cell mirrors the cell itself (reflecting boundary)
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        const nb = (ii, jj) => {
          if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) return k;
          const q = jj * nx + ii;
          return this.fluid[q] ? q : k;
        };
        this.nL[k] = nb(i - 1, j);
        this.nR[k] = nb(i + 1, j);
        this.nU[k] = nb(i, j - 1);
        this.nD[k] = nb(i, j + 1);
      }
    }
    // a band along the four walls: when the jelly tilts, the water there lags and sends waves inward
    const band = [], bx = [], bz = [];
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        if (!this.fluid[k]) continue;
        const x = WAVE.x0 + i * DX, z = WAVE.z0 + j * DX;
        const d = Math.min(x - WATER.x0, WATER.x1 - x, z - WATER.z0, WATER.z1 - z);
        const w = Math.exp(-((d / WALL_BAND) ** 2));
        if (w < 0.02) continue;
        band.push(k);
        bx.push(w * (x - WATER.cx));
        bz.push(w * (z - WATER.cz));
      }
    }
    this.band = Int32Array.from(band);
    this.bandX = Float32Array.from(bx);
    this.bandZ = Float32Array.from(bz);

    this.texData = new Float32Array(n * 2);
    this.texture = new THREE.DataTexture(this.texData, nx, nz, THREE.RGFormat, THREE.FloatType);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
    this.texture.needsUpdate = true;
  }

  /** Visit grid cells within 3σ of (x, z) with their gaussian weight. */
  _splat(x, z, sigma, fn) {
    const { nx, nz, x0, z0 } = WAVE;
    const r = sigma * 3;
    const i0 = Math.max(0, Math.floor((x - r - x0) / DX)), i1 = Math.min(nx - 1, Math.ceil((x + r - x0) / DX));
    const j0 = Math.max(0, Math.floor((z - r - z0) / DX)), j1 = Math.min(nz - 1, Math.ceil((z + r - z0) / DX));
    const inv = 1 / (2 * sigma * sigma);
    for (let j = j0; j <= j1; j++) {
      const dz = z0 + j * DX - z;
      for (let i = i0; i <= i1; i++) {
        const k = j * nx + i;
        if (!this.fluid[k]) continue;
        const dx = x0 + i * DX - x;
        const d2 = dx * dx + dz * dz;
        if (d2 > r * r) continue;
        fn(k, Math.exp(-d2 * inv));
      }
    }
  }

  /** A kick: positive amp pushes the water down (a drop, a tap), which rebounds into a ring. */
  impulse(x, z, amp, sigma = 0.75) {
    const v = this.v;
    this._splat(x, z, sigma, (k, g) => { v[k] -= amp * g; });
  }

  /** Start of a frame: clear the forcing, add the walls' response to the jelly tilting. */
  beginFrame(tiltVelX, tiltVelZ, wallGain) {
    const f = this.force;
    f.fill(0);
    const { band, bandX, bandZ } = this;
    const gx = -wallGain * tiltVelX, gz = -wallGain * tiltVelZ;
    for (let q = 0; q < band.length; q++) f[band[q]] += gx * bandX[q] + gz * bandZ[q];
  }

  /** A steady push for this frame (a finger pressing into the jelly). */
  pressure(x, z, amp, sigma = 1.3) {
    const f = this.force;
    this._splat(x, z, sigma, (k, g) => { f[k] -= amp * g; });
  }

  step(dt) {
    this.acc += dt;
    let n = 0;
    while (this.acc >= STEP && n < 10) { this._step(); this.acc -= STEP; n++; }
    if (n === 10) this.acc = 0;
  }

  _step() {
    const { h, v, vn, force, fluid, nL, nR, nU, nD, n } = this;
    const inv = 1 / (DX * DX);
    const dt = STEP;
    const damp = 1 - GAMMA * dt;
    const c2 = C * C;
    for (let k = 0; k < n; k++) {
      if (!fluid[k]) { vn[k] = 0; continue; }
      const hk = h[k], vk = v[k];
      const l = nL[k], r = nR[k], u = nU[k], d = nD[k];
      const lap = (h[l] + h[r] + h[u] + h[d] - 4 * hk) * inv;
      const lapv = (v[l] + v[r] + v[u] + v[d] - 4 * vk) * inv;
      vn[k] = (vk + (c2 * lap - KAPPA * hk + NU * lapv + force[k]) * dt) * damp;
    }
    this.v = vn; this.vn = v;
    const vv = this.v;
    for (let k = 0; k < n; k++) h[k] += vv[k] * dt;
  }

  /** Copy heights and curvature into the texture. */
  upload() {
    const { h, nL, nR, nU, nD, n, texData } = this;
    const inv = 1 / (4 * DX * DX);
    for (let k = 0; k < n; k++) {
      // curvature over a two-cell stencil: smoother than the one-cell one
      const lap = (h[nL[nL[k]]] + h[nR[nR[k]]] + h[nU[nU[k]]] + h[nD[nD[k]]] - 4 * h[k]) * inv;
      texData[k * 2] = h[k];
      texData[k * 2 + 1] = lap;
    }
    this.texture.needsUpdate = true;
  }

  /** Bilinear height, the same lookup as waveSample() in the shaders. */
  sample(x, z) {
    const { nx, nz, x0, z0 } = WAVE;
    let gx = (x - x0) / DX, gz = (z - z0) / DX;
    gx = Math.min(Math.max(gx, 0), nx - 1.0001);
    gz = Math.min(Math.max(gz, 0), nz - 1.0001);
    const i = Math.floor(gx), j = Math.floor(gz);
    const fx = gx - i, fz = gz - j;
    const k = j * nx + i;
    const h = this.h;
    const a = h[k], b = h[k + 1], c = h[k + nx], d = h[k + nx + 1];
    return (a + (b - a) * fx) * (1 - fz) + (c + (d - c) * fx) * fz;
  }

  stats() {
    let max = 0, e = 0;
    for (let k = 0; k < this.n; k++) { const a = Math.abs(this.h[k]); if (a > max) max = a; e += this.v[k] * this.v[k]; }
    return { max: +max.toFixed(3), energy: +e.toFixed(2) };
  }

  reset() { this.h.fill(0); this.v.fill(0); this.vn.fill(0); this.acc = 0; }
}

export const waves = new WaveSim();

/**
 * The big wave (double-click): a straight swell across the whole width of the sea, like the wave
 * machine of a wave pool. It starts at whichever glass wall is nearest the double-click (west, north
 * or south; never the quay) and rolls across to the opposite side, where it slams in and comes back
 * smaller (an image source behind that wall). It is analytic rather than simulated so the crest stays
 * level and keeps its shape all the way across.
 *
 * Waves running north–south meet the breakwater head-on: the water behind it (east of the lighthouse)
 * lies in its lee and only gets a little of the wave, bending in around the lighthouse.
 */
export const SURGE = {
  n: 3, // at most this many at once
  v: 4.4, // speed, units / s
  r: 0.55, // how much comes back off the far wall
  amp: 0.72,
  start: -21, // the crest starts one unit behind its wall (all three walls sit at "along" = -20)
  leak: 0.12, // what is left of a wave in the lee of the breakwater
  xb: LIGHTHOUSE.x - 1.5, // west end of the breakwater (the lighthouse base)
  bw: PIER.z, // breakwater line
};
// "along" = distance travelled: 0 from the west (along x), 1 from the north (along z), 2 from the south (along −z)
export const SURGE_DIRS = [
  { dx: 1, dz: 0, far: WATER.x1 },
  { dx: 0, dz: 1, far: WATER.z1 },
  { dx: 0, dz: -1, far: -WATER.z0 },
];
export function surgeLife(dir) {
  const far = SURGE_DIRS[dir].far;
  return (far - SURGE.start + (far - SURGE.start - 1)) / SURGE.v + 0.5;
}
export function surgeAlong(dir, x, z) { return dir === 0 ? x : dir === 1 ? z : -z; }

/** The wall nearest to a point: where a double-click there makes the wave start. */
export function nearestSurgeWall(x, z) {
  const cx = Math.min(Math.max(x, WATER.x0), WATER.x1);
  const cz = Math.min(Math.max(z, WATER.z0), WATER.z1);
  const d = [cx - WATER.x0, cz - WATER.z0, WATER.z1 - cz];
  return d.indexOf(Math.min(...d));
}

/** Shape across the crest: a steep face ahead (q > 0), a long back and a shallow trough behind. */
export function surgeProfile(q) {
  const w = q > 0 ? 1.25 : 3.6;
  const t = (q + 6.5) / 2.6;
  return Math.exp(-(q * q) / (w * w)) - 0.22 * Math.exp(-t * t);
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Envelope of one surge at a given age: grows out of the wall, fades as the echo gets back. */
export function surgeEnvelope(age, life) {
  return smooth(0, 1, age) * (1 - smooth(life - 2.5, life, age)) * Math.exp(-age * 0.04);
}

/** How much of a north–south wave reaches (x, along): the lee of the breakwater gets little. */
export function surgeShelter(x, along, dir) {
  if (dir === 0) return 1;
  const behind = along - (dir === 1 ? SURGE.bw : -SURGE.bw);
  const w = 0.6 + 0.35 * Math.max(behind, 0);
  return 1 - (1 - SURGE.leak) * smooth(-0.6, 0.6, behind) * smooth(SURGE.xb - w, SURGE.xb + w, x);
}

export function surgeFront(age) { return SURGE.start + age * SURGE.v; }

/** Height of one surge (uniform: start time, amplitude, direction, life) at (x, z). */
export function surgeHeight(u, time, x, z) {
  const age = time - u.x;
  if (age < 0 || age > u.w) return 0;
  const dir = Math.round(u.z);
  const a = surgeAlong(dir, x, z);
  const a2 = 2 * SURGE_DIRS[dir].far - a;
  const f = surgeFront(age);
  return u.y * surgeEnvelope(age, u.w) * (surgeProfile(a - f) * surgeShelter(x, a, dir) + SURGE.r * surgeProfile(a2 - f) * surgeShelter(x, a2, dir));
}

const g = (v) => v.toFixed(3);
export const GLSL_SURGE = /* glsl */ `
float surgeProfile(float q) {
  float w = q > 0.0 ? 1.25 : 3.6;
  float t = (q + 6.5) / 2.6;
  return exp(-(q * q) / (w * w)) - 0.22 * exp(-t * t);
}
float surgeShelter(float x, float along, int dir) {
  if (dir == 0) return 1.0;
  float behind = along - (dir == 1 ? ${g(SURGE.bw)} : ${g(-SURGE.bw)});
  float w = 0.6 + 0.35 * max(behind, 0.0);
  return 1.0 - ${g(1 - SURGE.leak)} * smoothstep(-0.6, 0.6, behind) * smoothstep(${g(SURGE.xb)} - w, ${g(SURGE.xb)} + w, x);
}
// uSurge[i]: start time, amplitude, direction (0 west, 1 north, 2 south), life
float surgeH(vec2 p) {
  float h = 0.0;
  for (int i = 0; i < ${SURGE.n}; i++) {
    vec4 s = uSurge[i];
    float age = uTime - s.x;
    if (age < 0.0 || age > s.w) continue;
    int dir = int(s.z + 0.5);
    float along = dir == 0 ? p.x : (dir == 1 ? p.y : -p.y);
    float far = dir == 0 ? ${g(SURGE_DIRS[0].far)} : (dir == 1 ? ${g(SURGE_DIRS[1].far)} : ${g(SURGE_DIRS[2].far)});
    float a2 = 2.0 * far - along;
    float env = smoothstep(0.0, 1.0, age) * (1.0 - smoothstep(s.w - 2.5, s.w, age)) * exp(-age * 0.04);
    float f = ${g(SURGE.start)} + age * ${g(SURGE.v)};
    h += s.y * env * (surgeProfile(along - f) * surgeShelter(p.x, along, dir) + ${g(SURGE.r)} * surgeProfile(a2 - f) * surgeShelter(p.x, a2, dir));
  }
  return h;
}
`;
