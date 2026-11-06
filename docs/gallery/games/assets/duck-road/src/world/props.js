import * as THREE from 'three';
import { gableRoof, hipRoof } from '../geo.js';
import { C, WALLS, ROOFS, LEAVES, FLOWERS } from '../palette.js';

// Builders for the small things that fill a plot. All take a Builder `b`, a Rand `r` and a
// placement matrix `M` (plot-local → mesh-local), and work in metres-ish toy units.

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3(1, 1, 1);
const Y = new THREE.Vector3(0, 1, 0);

export function place(M, x, y, z, rotY = 0) {
  _q.setFromAxisAngle(Y, rotY);
  return new THREE.Matrix4().multiplyMatrices(M, _m.compose(_v.set(x, y, z), _q, _s));
}

const DOORS = [0xd8402f, 0x4f5fb8, 0x3f7f4a, 0xe2a534, 0x8a6244];

/** House with door and windows facing local +Z. Returns its footprint radius. */
export function house(b, r, M, o = {}) {
  const w = o.w ?? r.float(2.2, 3.4);
  const d = o.d ?? r.float(1.9, 2.8);
  const floors = o.floors ?? (r.chance(0.35) ? 2 : 1);
  const h = floors * 1.15 + 0.35;
  const wall = o.wall ?? r.pick(WALLS);
  const roof = o.roof ?? r.pick(ROOFS);
  const style = o.style ?? r.pick(['gable', 'gable', 'gable', 'hip', 'flat', 'aframe']);
  const wallPat = r.chance(0.3) ? 3 : 0;

  if (style === 'aframe') {
    const rh = 2.6 + floors * 0.6;
    b.add(gableRoof(d + 0.1, w, rh), roof, { matrix: place(M, 0, 0, 0, Math.PI / 2), pattern: 5 });
    // front gable wall
    const tri = new THREE.Shape();
    tri.moveTo(-w / 2 + 0.25, 0); tri.lineTo(w / 2 - 0.25, 0); tri.lineTo(0, rh - 0.4); tri.closePath();
    const g = new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false });
    b.add(g, wall, { matrix: place(M, 0, 0, d / 2 - 0.05) });
    b.add(new THREE.BoxGeometry(0.5, 0.85, 0.08), r.pick(DOORS), { matrix: place(M, 0, 0.43, d / 2 + 0.07) });
    b.add(new THREE.BoxGeometry(0.42, 0.42, 0.06), C.glass, { matrix: place(M, 0, 1.45, d / 2 + 0.07) });
    return Math.max(w, d) * 0.6;
  }

  b.add(new THREE.BoxGeometry(w, h, d), wall, { matrix: place(M, 0, h / 2, 0), pattern: wallPat });
  if (style === 'gable') {
    // wall-coloured gable body, then two overhanging roof plates
    const rh = r.float(0.9, 1.4);
    b.add(gableRoof(w, d, rh), wall, { matrix: place(M, 0, h, 0), flat: true });
    const slope = Math.atan2(rh, d / 2);
    const half = d / 2 + 0.24;
    const len = half / Math.cos(slope);
    for (const sz of [1, -1]) {
      const ez = sz * half;
      const ey = rh - half * Math.tan(slope);
      b.add(new THREE.BoxGeometry(w + 0.34, 0.1, len), roof, {
        rot: [sz * slope, 0, 0],
        matrix: place(M, 0, h + (rh + ey) / 2 + 0.05, ez / 2),
        pattern: 5,
      });
    }
  } else if (style === 'hip') {
    b.add(hipRoof(w + 0.35, d + 0.35, r.float(0.8, 1.2)), roof, { matrix: place(M, 0, h, 0), pattern: 5, flat: true });
  } else {
    b.add(new THREE.BoxGeometry(w + 0.16, 0.22, d + 0.16), roof, { matrix: place(M, 0, h + 0.11, 0), pattern: 1 });
    b.add(new THREE.BoxGeometry(w - 0.3, 0.06, d - 0.3), 0xd8d2c6, { matrix: place(M, 0, h + 0.24, 0) });
  }
  if (style !== 'flat' && r.chance(0.45)) {
    b.add(new THREE.BoxGeometry(0.3, 0.9, 0.3), roof === C.red ? 0x8a6244 : 0xb85a48, { matrix: place(M, w * 0.25, h + 0.6, -d * 0.15) });
  }
  // door
  b.add(new THREE.BoxGeometry(0.48, 0.82, 0.08), r.pick(DOORS), { matrix: place(M, w * r.float(-0.2, 0.2), 0.41, d / 2 + 0.03) });
  // windows on all four sides
  windows(b, M, w, d, floors, 0, d / 2, w, 0);
  windows(b, M, w, d, floors, 0, -d / 2, w, Math.PI);
  windows(b, M, w, d, floors, w / 2, 0, d, Math.PI / 2);
  windows(b, M, w, d, floors, -w / 2, 0, d, -Math.PI / 2);
  return Math.max(w, d) * 0.62;
}

function windows(b, M, w, d, floors, fx, fz, span, rot) {
  const n = Math.max(1, Math.floor(span / 0.95));
  for (let f = 0; f < floors; f++) {
    const y = 0.75 + f * 1.15;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * (span / n);
      if (f === 0 && rot === 0 && Math.abs(x) < 0.45) continue; // leave room for the door
      const P = place(M, fx, 0, fz, rot);
      b.add(new THREE.BoxGeometry(0.5, 0.56, 0.05), C.white, { matrix: place(P, x, y, 0.02) });
      b.add(new THREE.BoxGeometry(0.36, 0.42, 0.05), C.glass, { matrix: place(P, x, y, 0.045) });
    }
  }
}

/** Tall block of flats with a flat roof. */
export function tower(b, r, M) {
  const w = r.float(2.0, 2.6);
  const d = r.float(2.0, 2.6);
  const floors = r.int(3, 5);
  const h = floors * 1.15 + 0.35;
  const wall = r.pick([0xc4d8e6, 0xa9a7a3, 0xf4efe6, 0xcfe0c2, 0xc9c6e6]);
  b.add(new THREE.BoxGeometry(w, h, d), wall, { matrix: place(M, 0, h / 2, 0) });
  if (r.chance(0.5)) {
    b.add(gableRoof(w + 0.25, d + 0.3, 1.0), r.pick(ROOFS), { matrix: place(M, 0, h, 0), pattern: 5 });
  } else {
    b.add(new THREE.BoxGeometry(w + 0.12, 0.2, d + 0.12), 0xd8d2c6, { matrix: place(M, 0, h + 0.1, 0) });
  }
  b.add(new THREE.BoxGeometry(0.48, 0.82, 0.08), r.pick(DOORS), { matrix: place(M, 0, 0.41, d / 2 + 0.03) });
  windows(b, M, w, d, floors, 0, d / 2, w, 0);
  windows(b, M, w, d, floors, 0, -d / 2, w, Math.PI);
  windows(b, M, w, d, floors, w / 2, 0, d, Math.PI / 2);
  windows(b, M, w, d, floors, -w / 2, 0, d, -Math.PI / 2);
  return Math.max(w, d) * 0.62;
}

/** Cloud tree: trunk and two to four felt balls. */
export function tree(b, r, M, scale = 1) {
  const s = scale * r.float(0.8, 1.15);
  const th = r.float(0.9, 1.4) * s;
  b.add(new THREE.CylinderGeometry(0.09 * s, 0.13 * s, th, 7), C.trunk, { matrix: place(M, 0, th / 2, 0) });
  const c1 = r.pick(LEAVES);
  const c2 = r.chance(0.4) ? r.pick(LEAVES) : c1;
  const n = r.int(2, 4);
  for (let i = 0; i < n; i++) {
    const rad = r.float(0.5, 0.78) * s;
    const a = (i / n) * Math.PI * 2 + r.float(0, 1);
    const off = i === 0 ? 0 : 0.42 * s;
    b.add(new THREE.IcosahedronGeometry(rad, 2), i % 2 ? c2 : c1, {
      matrix: place(M, Math.cos(a) * off, th + rad * 0.7 + (i === 0 ? 0.25 * s : r.float(-0.1, 0.2) * s), Math.sin(a) * off),
      pattern: 6,
    });
  }
  return 0.9 * s;
}

/** Small flowers scattered in a rectangle. */
export function flowers(b, r, M, hx, hz, n) {
  for (let i = 0; i < n; i++) {
    const x = r.float(-hx, hx);
    const z = r.float(-hz, hz);
    b.add(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 4), 0x5f9c5a, { matrix: place(M, x, 0.11, z) });
    b.add(new THREE.IcosahedronGeometry(r.float(0.08, 0.12), 0), r.pick(FLOWERS), { matrix: place(M, x, 0.25, z), flat: true });
  }
}

/** White picket fence from (x0,z0) to (x1,z1). */
export function fence(b, M, x0, z0, x1, z1) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const rot = Math.atan2(-(z1 - z0), x1 - x0);
  const P = place(M, x0, 0, z0, rot);
  const n = Math.max(2, Math.floor(len / 0.3));
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * len;
    b.add(new THREE.BoxGeometry(0.08, 0.5, 0.05), C.white, { matrix: place(P, x, 0.25, 0) });
    b.add(new THREE.ConeGeometry(0.057, 0.1, 4), C.white, { matrix: place(P, x, 0.55, 0, Math.PI / 4), flat: true });
  }
  b.add(new THREE.BoxGeometry(len, 0.06, 0.04), C.white, { matrix: place(P, len / 2, 0.36, -0.03) });
  b.add(new THREE.BoxGeometry(len, 0.06, 0.04), C.white, { matrix: place(P, len / 2, 0.16, -0.03) });
}

/** Street lamp; its arm reaches toward local +Z (the road). */
export function lamp(b, M) {
  b.add(new THREE.CylinderGeometry(0.06, 0.08, 3.0, 8), C.pole, { matrix: place(M, 0, 1.5, 0) });
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 2.95, 0), new THREE.Vector3(0, 3.45, 0.1), new THREE.Vector3(0, 3.3, 0.75));
  b.add(new THREE.TubeGeometry(curve, 8, 0.045, 6), C.pole, { matrix: M });
  b.add(new THREE.CylinderGeometry(0.06, 0.2, 0.18, 10), C.pole, { matrix: place(M, 0, 3.22, 0.78) });
  b.add(new THREE.SphereGeometry(0.1, 8, 6), 0xfff4d0, { matrix: place(M, 0, 3.12, 0.78) });
  b.add(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 10), C.pole, { matrix: place(M, 0, 0.04, 0) });
}
