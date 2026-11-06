// A tiny software renderer that turns a "rig" of ellipsoids into pixel art: orthographic view from slightly above,
// banded (cel) shading from a material ramp, selective 1px outlines and inner contour lines where a part overlaps
// another. Rendering the same rig from 8 yaw angles gives consistent 8-direction sprites for free.

import { PixelImage, ramp, outlineOf, type RGB } from './pixel';
import { hash2 } from '../core/rng';

export type V3 = [number, number, number];

export interface Prim {
  c: V3; // centre, creature space in pixels (y up, +z = forward)
  r: V3; // radii
  rot?: V3; // euler XYZ (applied Rz·Ry·Rx)
  m: number; // material index
}

export interface Mat {
  ramp: RGB[];
  outline: RGB;
  glow?: boolean; // unlit, always bright
  noise?: number; // per-pixel band jitter (foliage, rock grain)
}

export const mat = (base: number, opts: { glow?: boolean; noise?: number; outline?: number } = {}): Mat => ({
  ramp: ramp(base),
  outline: outlineOf(opts.outline ?? base),
  glow: opts.glow,
  noise: opts.noise,
});

export interface Pose {
  prims: Prim[];
  tilt?: number; // whole-body rotation around X at the feet (lean back < 0 < lean forward)
  roll?: number; // whole-body rotation around Z
  lift?: number; // whole-body offset up
  fwd?: number; // whole-body offset forward
  squash?: number; // >0 wider and shorter
}

type M3 = number[]; // row-major 3×3

const mm = (a: M3, b: M3): M3 => {
  const o = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
  return o;
};
const mv = (a: M3, v: V3): V3 => [
  a[0] * v[0] + a[1] * v[1] + a[2] * v[2],
  a[3] * v[0] + a[4] * v[1] + a[5] * v[2],
  a[6] * v[0] + a[7] * v[1] + a[8] * v[2],
];
const rx = (t: number): M3 => [1, 0, 0, 0, Math.cos(t), -Math.sin(t), 0, Math.sin(t), Math.cos(t)];
const ry = (t: number): M3 => [Math.cos(t), 0, Math.sin(t), 0, 1, 0, -Math.sin(t), 0, Math.cos(t)];
const rz = (t: number): M3 => [Math.cos(t), -Math.sin(t), 0, Math.sin(t), Math.cos(t), 0, 0, 0, 1];
const tr = (a: M3): M3 => [a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]];

const LIGHT: V3 = (() => {
  const l: V3 = [-0.5, 0.72, 0.55];
  const n = Math.hypot(...l);
  return [l[0] / n, l[1] / n, l[2] / n];
})();

export interface RenderOpts {
  w: number;
  h: number;
  yaw: number; // facing angle: 0 = toward the viewer, PI/2 = screen right
  pitch: number; // camera elevation
  ox: number; // pixel column of the origin (feet)
  oy: number; // pixel row of the origin (feet)
  seed?: number;
}

export function renderRig(pose: Pose, mats: Mat[], o: RenderOpts): PixelImage {
  const img = new PixelImage(o.w, o.h);
  const N = o.w * o.h;
  const zbuf = new Float32Array(N).fill(-1e9);
  const mbuf = new Int16Array(N).fill(-1);
  const sbuf = new Uint8Array(N);

  const sq = pose.squash ?? 0;
  const S: M3 = [1 + sq * 0.6, 0, 0, 0, 1 - sq * 0.5, 0, 0, 0, 1 + sq * 0.6];
  const G = mm(rz(pose.roll ?? 0), rx(pose.tilt ?? 0));
  const V = mm(rx(o.pitch), ry(o.yaw));
  const VG = mm(V, mm(G, S));
  const off: V3 = mv(V, [0, pose.lift ?? 0, pose.fwd ?? 0]);

  for (const p of pose.prims) {
    const R = p.rot ? mm(rz(p.rot[2]), mm(ry(p.rot[1]), rx(p.rot[0]))) : [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const M = mm(VG, R);
    // Squash is not orthonormal: re-normalise the axes into radii so the ray test stays exact.
    const cols: V3[] = [0, 1, 2].map((j) => [M[j], M[3 + j], M[6 + j]] as V3);
    const rad: V3 = [p.r[0], p.r[1], p.r[2]];
    const Mo: M3 = new Array(9);
    for (let j = 0; j < 3; j++) {
      const l = Math.hypot(...cols[j]) || 1;
      rad[j] *= l;
      Mo[j] = cols[j][0] / l;
      Mo[3 + j] = cols[j][1] / l;
      Mo[6 + j] = cols[j][2] / l;
    }
    const Mi = tr(Mo);
    const c = mv(VG, p.c);
    c[0] += off[0];
    c[1] += off[1];
    c[2] += off[2];
    const reach = Math.max(rad[0], rad[1], rad[2]) + 1;
    const x0 = Math.max(0, Math.floor(o.ox + c[0] - reach)),
      x1 = Math.min(o.w - 1, Math.ceil(o.ox + c[0] + reach));
    const y0 = Math.max(0, Math.floor(o.oy - c[1] - reach)),
      y1 = Math.min(o.h - 1, Math.ceil(o.oy - c[1] + reach));
    const d = mv(Mi, [0, 0, -1]);
    const ds: V3 = [d[0] / rad[0], d[1] / rad[1], d[2] / rad[2]];
    const a = ds[0] * ds[0] + ds[1] * ds[1] + ds[2] * ds[2];
    const mt = mats[p.m];
    for (let py = y0; py <= y1; py++)
      for (let px = x0; px <= x1; px++) {
        const X = px + 0.5 - o.ox,
          Y = o.oy - (py + 0.5);
        const ol = mv(Mi, [X - c[0], Y - c[1], 200 - c[2]]);
        const os: V3 = [ol[0] / rad[0], ol[1] / rad[1], ol[2] / rad[2]];
        const b = 2 * (os[0] * ds[0] + os[1] * ds[1] + os[2] * ds[2]);
        const cc = os[0] * os[0] + os[1] * os[1] + os[2] * os[2] - 1;
        const disc = b * b - 4 * a * cc;
        if (disc < 0) continue;
        const t = (-b - Math.sqrt(disc)) / (2 * a);
        const z = 200 - t;
        const idx = py * o.w + px;
        if (z <= zbuf[idx]) continue;
        // Normal: gradient of the unit sphere in ellipsoid space, back to view space.
        const hs: V3 = [os[0] + t * ds[0], os[1] + t * ds[1], os[2] + t * ds[2]];
        const nl = mv(Mo, [hs[0] / rad[0], hs[1] / rad[1], hs[2] / rad[2]]);
        const nn = Math.hypot(...nl) || 1;
        let ndl = (nl[0] * LIGHT[0] + nl[1] * LIGHT[1] + nl[2] * LIGHT[2]) / nn;
        if (mt.noise) ndl += (hash2(px, py, (o.seed ?? 7) + p.m * 31) - 0.5) * mt.noise;
        const band = mt.glow ? 2 : ndl < -0.08 ? 0 : ndl < 0.5 ? 1 : ndl < 0.86 ? 2 : 3;
        zbuf[idx] = z;
        mbuf[idx] = p.m;
        sbuf[idx] = band;
      }
  }

  // Inner contour: a pixel whose neighbour is much closer (another part in front) gets the darkest tone.
  const inner = new Uint8Array(N);
  for (let y = 0; y < o.h; y++)
    for (let x = 0; x < o.w; x++) {
      const i = y * o.w + x;
      if (mbuf[i] < 0) continue;
      const z = zbuf[i];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= o.w || ny >= o.h) continue;
        const j = ny * o.w + nx;
        if (mbuf[j] >= 0 && zbuf[j] - z > 3.2) {
          inner[i] = 1;
          break;
        }
      }
    }

  for (let i = 0; i < N; i++) {
    const m = mbuf[i];
    if (m < 0) continue;
    const mt = mats[m];
    const col = inner[i] && !mt.glow ? mt.outline : mt.ramp[sbuf[i]];
    img.set(i % o.w, Math.floor(i / o.w), col);
  }

  // Selective outline: each edge pixel takes the dark tone of the closest neighbouring part.
  img.outline((x, y) => {
    let best = -1,
      bz = -1e9;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx,
        ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= o.w || ny >= o.h) continue;
      const j = ny * o.w + nx;
      if (mbuf[j] >= 0 && zbuf[j] > bz) {
        bz = zbuf[j];
        best = mbuf[j];
      }
    }
    return best >= 0 ? mats[best].outline : [30, 20, 40];
  });
  return img;
}

/** Point on an ellipsoid's surface (for spots, studs, moss on a body). */
export function onSurface(base: Prim, theta: number, phi: number, inset = 0.85): V3 {
  return [
    base.c[0] + base.r[0] * inset * Math.sin(phi) * Math.sin(theta),
    base.c[1] + base.r[1] * inset * Math.cos(phi),
    base.c[2] + base.r[2] * inset * Math.sin(phi) * Math.cos(theta),
  ];
}
