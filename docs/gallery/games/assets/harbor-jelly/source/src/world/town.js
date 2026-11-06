import * as THREE from 'three';
import { Builder, hipRoofRidge, gableRoof } from '../geo.js';
import { C } from '../palette.js';
import { P } from '../materials.js';
import { Rand } from '../rand.js';
import { QX, LAND_Y } from './layout.js';

const Y = LAND_Y;

/** Sign boards: text drawn on a canvas. */
const signCache = new Map();
export function signTexture(text, { bg = '#efe6c8', fg = '#2f3a36', vertical = false, w = 256, h = 96, font = 'bold 64px "Noto Serif CJK SC", "Songti SC", "SimSun", serif' } = {}) {
  const key = [text, bg, fg, vertical, w, h].join('|');
  if (signCache.has(key)) return signCache.get(key);
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(60,50,40,0.6)'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (vertical) {
    const chars = [...text];
    chars.forEach((ch, i) => g.fillText(ch, w / 2, (h / (chars.length + 0.4)) * (i + 0.7)));
  } else g.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  signCache.set(key, t);
  return t;
}

function signMesh(text, width, height, opts) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map: signTexture(text, opts), roughness: 0.9 }));
  m.castShadow = false;
  return m;
}

/** Builder wrapper that places parts in a local frame (position + yaw). */
function framed(b, x, z, yaw = 0, y = Y) {
  const M = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(1, 1, 1));
  return (geo, color, o = {}) => b.add(geo, color, { ...o, matrix: M });
}

/** Two-storey shop house, facing local -x. */
function house(b, x, z, w, d, yaw, rnd, opts = {}) {
  const add = framed(b, x, z, yaw);
  const wall = opts.wall ?? rnd.pick([C.wall, C.wallWarm, 0xe9dcc0]);
  const roof = opts.roof ?? rnd.pick([C.roof, C.roof, C.roofDark, 0x5a8a80]);
  const h1 = 1.0, h2 = 0.9;
  add(new THREE.BoxGeometry(d, h1, w), wall, { pos: [0, h1 / 2, 0] });
  // shop front: dark opening with a short indigo curtain
  add(new THREE.BoxGeometry(0.06, 0.62, w * 0.62), 0x3a4440, { pos: [-d / 2 - 0.01, 0.38, 0] });
  add(new THREE.BoxGeometry(0.07, 0.22, w * 0.62), rnd.pick([0x34507a, 0x8a3b3b, 0x3e6b5e]), { pos: [-d / 2 - 0.02, 0.6, 0] });
  // posts and beams
  for (const sz of [-1, 0, 1]) add(new THREE.BoxGeometry(0.1, h1 + h2, 0.1), C.wood, { pos: [-d / 2 - 0.02, (h1 + h2) / 2, sz * (w / 2 - 0.05)] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.1, h1 + h2, 0.1), C.wood, { pos: [sx * (d / 2 - 0.03), (h1 + h2) / 2, sz * (w / 2 - 0.03)] });
  add(new THREE.BoxGeometry(d + 0.04, 0.1, w + 0.04), C.wood, { pos: [0, h1, 0] });
  // first-floor eave
  add(new THREE.BoxGeometry(0.55, 0.06, w + 0.3), roof, { pos: [-d / 2 - 0.18, h1 + 0.1, 0], rot: [0, 0, 0.32], pattern: P.tiles });
  // second floor with lattice windows
  add(new THREE.BoxGeometry(d - 0.12, h2, w - 0.12), wall, { pos: [0, h1 + h2 / 2, 0] });
  const nWin = Math.max(1, Math.round(w / 0.9));
  for (let i = 0; i < nWin; i++) {
    const zz = (i - (nWin - 1) / 2) * (w / nWin);
    add(new THREE.BoxGeometry(0.05, 0.42, 0.5), C.windowPane, { pos: [-(d - 0.12) / 2 - 0.01, h1 + 0.45, zz] });
    add(new THREE.BoxGeometry(0.06, 0.04, 0.54), C.wood, { pos: [-(d - 0.12) / 2 - 0.02, h1 + 0.45, zz] });
    add(new THREE.BoxGeometry(0.06, 0.46, 0.04), C.wood, { pos: [-(d - 0.12) / 2 - 0.02, h1 + 0.45, zz] });
    add(new THREE.BoxGeometry(0.08, 0.05, 0.56), C.wood, { pos: [-(d - 0.12) / 2 - 0.03, h1 + 0.2, zz] });
  }
  // side windows
  add(new THREE.BoxGeometry(0.4, 0.36, 0.05), C.windowPane, { pos: [0, h1 + 0.45, (w - 0.12) / 2 + 0.01] });
  add(new THREE.BoxGeometry(0.4, 0.36, 0.05), C.windowPane, { pos: [0, h1 + 0.45, -(w - 0.12) / 2 - 0.01] });
  // hip roof with a ridge
  const rh = 0.75;
  add(hipRoofRidge(d + 0.55, w + 0.55, rh), roof, { pos: [0, h1 + h2, 0], pattern: P.tiles });
  if (w > d) add(new THREE.BoxGeometry(0.12, 0.1, w - d + 0.2), 0x34524c, { pos: [0, h1 + h2 + rh - 0.02, 0] });
  else add(new THREE.BoxGeometry(d - w + 0.2, 0.1, 0.12), 0x34524c, { pos: [0, h1 + h2 + rh - 0.02, 0] });
  if (opts.sign) {
    add(new THREE.BoxGeometry(0.05, 0.22, w * 0.5), 0xe9dfc2, { pos: [-d / 2 - 0.06, h1 - 0.12, 0] });
  }
  return { h: h1 + h2 + rh };
}

function sakura(b, x, z, rnd, scale = 1) {
  const add = (geo, color, o) => b.add(geo, color, o);
  const s = scale;
  const trunkH = 1.3 * s;
  add(new THREE.CylinderGeometry(0.09 * s, 0.15 * s, trunkH, 6), C.trunk, { pos: [x, Y + trunkH / 2, z] });
  const tips = [];
  const nb = 4;
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * Math.PI * 2 + rnd.float(-0.4, 0.4);
    const len = rnd.float(0.7, 1.1) * s;
    const tilt = rnd.float(0.6, 0.95);
    const dir = new THREE.Vector3(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt));
    const base = new THREE.Vector3(x, Y + trunkH * 0.85, z);
    const tip = base.clone().addScaledVector(dir, len);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const e = new THREE.Euler().setFromQuaternion(q);
    add(new THREE.CylinderGeometry(0.04 * s, 0.08 * s, len, 5), C.trunk, { pos: base.clone().addScaledVector(dir, len / 2).toArray(), rot: [e.x, e.y, e.z] });
    tips.push(tip);
  }
  // blossom: a broad, flattish crown of many small puffs, densest on top
  const crown = new THREE.Vector3(x, Y + trunkH + 0.5 * s, z);
  const R = 1.2 * s;
  for (let i = 0; i < 40; i++) {
    const a = rnd.float(0, Math.PI * 2);
    const rr = Math.sqrt(rnd.float(0, 1)) * R;
    const top = 1 - (rr / R) ** 2;
    const p = new THREE.Vector3(x + Math.cos(a) * rr, crown.y + top * 0.5 * s + rnd.float(-0.2, 0.15) * s, z + Math.sin(a) * rr);
    const r = rnd.float(0.22, 0.4) * s;
    add(new THREE.IcosahedronGeometry(r, 1), rnd.pick(C.sakura), {
      pos: p.toArray(), scale: [1, rnd.float(0.7, 0.9), 1], rot: [rnd.float(0, 3), rnd.float(0, 3), 0], pattern: P.blossom, flat: true, anim: [0.03, rnd.float(0, 6)],
    });
  }
  // a few loose sprigs hanging below the crown, near the branch tips
  for (const t of tips) {
    add(new THREE.IcosahedronGeometry(0.2 * s, 1), rnd.pick(C.sakura), { pos: [t.x, t.y - 0.05, t.z], pattern: P.blossom, anim: [0.03, rnd.float(0, 6)] });
  }
}

function lamp(b, glow, x, z) {
  b.add(new THREE.CylinderGeometry(0.045, 0.06, 2.1, 6), 0x3e4c4a, { pos: [x, Y + 1.05, z] });
  b.add(new THREE.BoxGeometry(0.04, 0.04, 0.62), 0x3e4c4a, { pos: [x, Y + 2.05, z] });
  for (const s of [-1, 1]) {
    glow.add(new THREE.SphereGeometry(0.12, 10, 8), C.lampGlow, { pos: [x, Y + 1.98, z + s * 0.3] });
    b.add(new THREE.CylinderGeometry(0.07, 0.05, 0.05, 8), 0x3e4c4a, { pos: [x, Y + 2.1, z + s * 0.3] });
  }
}

function lantern(b, x, y, z) {
  b.add(new THREE.SphereGeometry(0.11, 10, 8), C.lantern, { pos: [x, y, z], scale: [1, 1.25, 1] });
  b.add(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), 0x2b2b2b, { pos: [x, y + 0.14, z] });
  b.add(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), 0x2b2b2b, { pos: [x, y - 0.14, z] });
}

/** Fish stall facing -x with a striped awning, a sign and a "港" banner. */
function stall(b, signs, x, z, rnd, banner) {
  const add = framed(b, x, z, 0);
  add(new THREE.BoxGeometry(0.9, 0.55, 1.35), C.wood, { pos: [0, 0.28, 0], pattern: P.planksZ });
  add(new THREE.BoxGeometry(0.95, 0.06, 1.4), 0xc9b08a, { pos: [0, 0.58, 0] });
  // fish and ice on the counter
  for (let i = 0; i < 5; i++) {
    add(new THREE.CapsuleGeometry(0.05, 0.22, 2, 6), rnd.pick([0x9fb6c2, 0xd98a6a, 0xc7c9c4, 0x7a9ab0]), { pos: [-0.15 + rnd.float(-0.15, 0.15), 0.65, -0.5 + i * 0.25], rot: [0, 0, Math.PI / 2] });
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.06, 1.45, 0.06), C.woodDark, { pos: [sx * 0.42, 0.72, sz * 0.65] });
  add(new THREE.BoxGeometry(1.25, 0.06, 1.6), C.awning, { pos: [-0.12, 1.42, 0], rot: [0, 0, 0.22], pattern: P.stripes });
  add(new THREE.BoxGeometry(0.04, 0.2, 1.6), C.awning, { pos: [-0.74, 1.24, 0], pattern: P.stripes });
  add(new THREE.BoxGeometry(0.08, 0.3, 1.0), 0xe9dfc2, { pos: [0.35, 1.75, 0] });
  const s = signMesh('鮮魚', 0.95, 0.27, { bg: '#f1dfc4', fg: '#7a2f28', w: 256, h: 72, font: 'bold 54px "Noto Serif CJK SC", serif' });
  s.position.set(x + 0.3, Y + 1.75, z);
  s.rotation.y = -Math.PI / 2;
  signs.push(s);
  lantern(b, x - 0.62, Y + 1.12, z - 0.62);
  lantern(b, x - 0.62, Y + 1.12, z + 0.62);
  if (banner) {
    add(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 5), C.woodDark, { pos: [-0.45, 1.2, -0.95] });
    const bn = signMesh('港', 0.34, 0.5, { bg: '#f4eedc', fg: '#2b2b2b', w: 96, h: 140, font: 'bold 84px "Noto Serif CJK SC", serif' });
    bn.position.set(x - 0.45, Y + 2.1, z - 0.95);
    bn.rotation.y = -Math.PI / 2;
    signs.push(bn);
  }
  // barrels and crates
  add(new THREE.CylinderGeometry(0.16, 0.16, 0.36, 10), 0x9a7048, { pos: [0.25, 0.18, 0.9] });
  add(new THREE.BoxGeometry(0.34, 0.24, 0.34), 0xb48e5e, { pos: [-0.2, 0.12, 0.95], pattern: P.planksZ });
}

export function buildTown(toy) {
  const group = new THREE.Group();
  group.name = 'town';
  const b = new Builder();
  const glow = new Builder();
  const signs = [];
  const rnd = new Rand(11);
  const yaw = 0; // houses face the water (-x)

  // houses
  const houses = [
    [18.6, -1.6, 2.4, 2.0], [18.6, 1.3, 2.4, 2.0], [18.6, 4.4, 2.6, 2.0], [18.6, 7.6, 2.4, 2.0], [18.6, 10.6, 2.4, 2.0],
    [16.3, 1.0, 2.0, 1.8], [15.9, 15.9, 2.2, 1.9], [18.7, 15.4, 2.2, 1.9], [13.2, 17.4, 2.4, 1.8], [18.7, 18.7, 1.8, 1.9],
    [16.2, 18.8, 1.6, 1.7], [16.3, 13.5, 1.9, 1.6], [19.0, 13.0, 1.6, 1.6],
  ];
  for (const [x, z, w, d] of houses) house(b, x, z, w, d, yaw, rnd);

  // torii and a small shrine near the end of the yard
  {
    const tx = 13.6, tz = -1.9;
    const add = framed(b, tx, tz, 0);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.09, 0.11, 2.1, 10), C.torii, { pos: [0, 1.05, s * 0.85] });
    add(new THREE.BoxGeometry(0.18, 0.12, 2.0), C.torii, { pos: [0, 1.55, 0] });
    add(new THREE.BoxGeometry(0.24, 0.14, 2.5), C.torii, { pos: [0, 2.0, 0] });
    add(new THREE.BoxGeometry(0.28, 0.1, 2.75), C.toriiBlack, { pos: [0, 2.12, 0] });
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.28, 0.1, 0.35), C.toriiBlack, { pos: [0, 2.17, s * 1.42], rot: [s * 0.3, 0, 0] });
    add(new THREE.BoxGeometry(0.06, 0.3, 0.22), 0x2b2b2b, { pos: [-0.05, 1.8, 0] });
    const sa = framed(b, tx + 1.9, tz, 0);
    sa(new THREE.BoxGeometry(1.1, 0.25, 1.3), 0xbfb9a3, { pos: [0, 0.12, 0] });
    sa(new THREE.BoxGeometry(0.9, 0.75, 1.0), C.wood, { pos: [0, 0.62, 0], pattern: P.planksZ });
    sa(gableRoof(1.5, 1.4, 0.55), C.roof, { pos: [0, 1.0, 0], rot: [0, Math.PI / 2, 0], pattern: P.tiles });
    sa(new THREE.TorusGeometry(0.3, 0.035, 5, 12, Math.PI), 0xf3efe2, { pos: [-0.47, 0.9, 0], rot: [Math.PI, Math.PI / 2, 0] });
    lantern(b, tx - 0.25, Y + 0.9, tz - 1.25);
    lantern(b, tx - 0.25, Y + 0.9, tz + 1.25);
    b.add(new THREE.BoxGeometry(0.06, 0.8, 0.06), C.woodDark, { pos: [tx - 0.25, Y + 0.4, tz - 1.25] });
    b.add(new THREE.BoxGeometry(0.06, 0.8, 0.06), C.woodDark, { pos: [tx - 0.25, Y + 0.4, tz + 1.25] });
  }

  // fish market hall
  {
    const mx = 14.4, mz = 8.4, md = 3.4, mw = 7.4;
    const add = framed(b, mx, mz, 0);
    add(new THREE.BoxGeometry(md, 1.35, mw), 0xd9cfb4, { pos: [0.15, 0.68, 0] });
    add(new THREE.BoxGeometry(0.05, 1.0, mw - 0.4), 0x3f4a46, { pos: [-md / 2 + 0.13, 0.5, 0] });
    for (let i = 0; i <= 8; i++) add(new THREE.BoxGeometry(0.12, 1.5, 0.12), C.wood, { pos: [-md / 2 + 0.05, 0.75, -mw / 2 + (i * mw) / 8] });
    add(new THREE.BoxGeometry(0.16, 0.18, mw + 0.1), C.wood, { pos: [-md / 2 + 0.05, 1.42, 0] });
    // low counters inside the open front
    for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.6, 0.42, 1.3), 0xb7a27a, { pos: [-md / 2 + 0.55, 0.21, -mw / 2 + 1.0 + i * 1.8], pattern: P.planksZ });
    add(hipRoofRidge(md + 1.0, mw + 0.9, 1.05), C.roof, { pos: [0.1, 1.5, 0], pattern: P.tiles });
    add(new THREE.BoxGeometry(0.16, 0.14, mw - md + 0.6), 0x34524c, { pos: [0.1, 2.52, 0] });
    // front canopy over the counters
    add(new THREE.BoxGeometry(0.9, 0.06, mw + 0.4), 0x4f7c74, { pos: [-md / 2 - 0.4, 1.38, 0], rot: [0, 0, 0.25], pattern: P.tiles });
    const sg = signMesh('魚市場', 1.9, 0.44, { bg: '#efe2c0', fg: '#2f3a36', w: 384, h: 92, font: 'bold 66px "Noto Serif CJK SC", serif' });
    sg.position.set(mx - md / 2 - 0.86, Y + 1.66, mz);
    sg.rotation.y = -Math.PI / 2;
    signs.push(sg);
    add(new THREE.BoxGeometry(0.06, 0.52, 2.0), 0x5a4636, { pos: [-md / 2 - 0.82, 1.66, 0] });
    for (let i = 0; i < 6; i++) lantern(b, mx - md / 2 - 0.7, Y + 1.05, mz - mw / 2 + 0.7 + i * ((mw - 1.4) / 5));
  }

  // stalls along the promenade
  stall(b, signs, 11.4, -0.4, rnd, true);
  stall(b, signs, 11.4, 2.1, rnd, false);
  stall(b, signs, 11.4, 13.0, rnd, true);

  // street lamps along the quay
  for (const z of [-2.6, 3.9, 7.2, 10.6, 16.2, 19.2]) lamp(b, glow, 10.15, z);
  lamp(b, glow, 12.6, 15.1);

  // lantern string across the plaza
  for (let i = 0; i < 9; i++) {
    const z = 3.6 + i * 0.95;
    const sag = Math.sin((i / 8) * Math.PI) * 0.25;
    lantern(b, 12.15, Y + 1.95 - sag, z);
  }

  // sakura
  const trees = [[14.9, -0.1, 1.15], [16.9, 3.0, 1.25], [16.8, 12.6, 1.2], [12.7, 15.4, 1.15], [19.3, 16.9, 1.1], [14.4, 19.2, 1.1], [17.4, -2.9, 1.0], [19.4, 6.1, 1.0], [11.4, 18.0, 0.95], [12.2, -3.6, 0.9], [19.5, 9.2, 0.95], [17.3, 7.4, 0.9]];
  for (const [x, z, s] of trees) sakura(b, x, z, rnd, s);

  // barrels, crates and benches scattered along the promenade
  for (const [x, z] of [[11.0, 4.4], [11.2, 11.3], [10.3, 15.0], [10.6, 18.0], [11.6, 6.8]]) {
    b.add(new THREE.CylinderGeometry(0.17, 0.17, 0.38, 10), 0x9a7048, { pos: [x, Y + 0.19, z] });
    b.add(new THREE.BoxGeometry(0.36, 0.26, 0.36), 0xb48e5e, { pos: [x + 0.3, Y + 0.13, z + 0.35], pattern: P.planksZ });
  }
  for (const [x, z] of [[10.5, 5.7], [10.5, 12.0]]) {
    b.add(new THREE.BoxGeometry(0.3, 0.06, 1.0), C.wood, { pos: [x, Y + 0.3, z], pattern: P.planksZ });
    b.add(new THREE.BoxGeometry(0.26, 0.28, 0.06), C.woodDark, { pos: [x, Y + 0.14, z - 0.4] });
    b.add(new THREE.BoxGeometry(0.26, 0.28, 0.06), C.woodDark, { pos: [x, Y + 0.14, z + 0.4] });
  }

  const mesh = new THREE.Mesh(b.build(), toy);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  const glowMesh = new THREE.Mesh(glow.build(), new THREE.MeshBasicMaterial({ vertexColors: true }));
  group.add(glowMesh);
  for (const s of signs) group.add(s);
  return group;
}
