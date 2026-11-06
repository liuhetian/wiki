import * as THREE from 'three';
import { Builder } from '../geo.js';
import { C } from '../palette.js';
import { P } from '../materials.js';
import { Rand } from '../rand.js';
import { QX, HALF, PIER, LIGHTHOUSE, PLATFORM, BERTH } from './layout.js';
import { floorHeight } from './base.js';
import { buildFishingBoat } from './pier.js';

// places to keep free of seaweed (pier rubble, lighthouse base)
function blocked(x, z) {
  if (Math.abs(z - PIER.z) < 2.0 && x > PIER.x0 - 1.8) return true;
  if (Math.hypot(x - LIGHTHOUSE.x, z - LIGHTHOUSE.z) < 2.2) return true;
  if (x > QX - 0.6) return true;
  return false;
}

function seaweedClump(b, x, z, rnd, n = 6, tall = 1) {
  const fy = floorHeight(x, z);
  for (let i = 0; i < n; i++) {
    const h = rnd.float(0.9, 2.0) * tall;
    const w = rnd.float(0.09, 0.16);
    // a curved, tapered blade: a thin cone squashed flat
    const g = new THREE.ConeGeometry(w, h, 4, 4);
    g.scale(1, 1, 0.3);
    g.translate(0, h / 2, 0);
    const p = g.attributes.position;
    const bend = rnd.float(-0.35, 0.35);
    for (let k = 0; k < p.count; k++) {
      const t = p.getY(k) / h;
      p.setX(k, p.getX(k) + bend * t * t * h);
    }
    b.add(g, rnd.pick(C.seaweed), {
      pos: [x + rnd.float(-0.35, 0.35), fy - 0.05, z + rnd.float(-0.35, 0.35)],
      rot: [rnd.float(-0.15, 0.15), rnd.float(0, Math.PI * 2), rnd.float(-0.15, 0.15)],
      anim: [0.22 * tall, rnd.float(0, 6)], flat: true,
    });
  }
}

function coral(b, x, z, rnd) {
  const fy = floorHeight(x, z);
  const col = rnd.pick(C.coral);
  const branch = (base, dir, len, r, depth) => {
    const end = base.clone().addScaledVector(dir, len);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const e = new THREE.Euler().setFromQuaternion(q);
    b.add(new THREE.CylinderGeometry(r * 0.7, r, len, 5), col, { pos: base.clone().addScaledVector(dir, len / 2).toArray(), rot: [e.x, e.y, e.z] });
    if (depth > 0) {
      for (let i = 0; i < 2; i++) {
        const d = dir.clone().add(new THREE.Vector3(rnd.float(-0.7, 0.7), rnd.float(0.1, 0.5), rnd.float(-0.7, 0.7))).normalize();
        branch(end, d, len * 0.75, r * 0.7, depth - 1);
      }
    } else b.add(new THREE.SphereGeometry(r * 1.2, 5, 4), col, { pos: end.toArray() });
  };
  for (let i = 0; i < 3; i++) {
    const d = new THREE.Vector3(rnd.float(-0.4, 0.4), 1, rnd.float(-0.4, 0.4)).normalize();
    branch(new THREE.Vector3(x, fy, z), d, rnd.float(0.35, 0.5), 0.07, 2);
  }
}

function starfish(b, x, z, rnd) {
  const fy = floorHeight(x, z);
  const yaw = rnd.float(0, 6);
  for (let i = 0; i < 5; i++) {
    const a = yaw + (i / 5) * Math.PI * 2;
    b.add(new THREE.ConeGeometry(0.07, 0.3, 4), C.starfish, { pos: [x + Math.cos(a) * 0.13, fy + 0.04, z + Math.sin(a) * 0.13], rot: [0, -a, -Math.PI / 2], order: 'YXZ', scale: [1, 1, 0.5] });
  }
}

export function buildSeaFloor(toy) {
  const group = new THREE.Group();
  group.name = 'seafloor';
  const rnd = new Rand(17);
  const b = new Builder();

  // seaweed: clumps everywhere, denser along the west and south edges
  for (let i = 0; i < 95; i++) {
    let x, z;
    if (i < 30) { x = rnd.float(-19.4, -15); z = rnd.float(-19, 19); }
    else if (i < 45) { x = rnd.float(-19, 7); z = rnd.float(16.5, 19.4); }
    else { x = rnd.float(-19, 7.5); z = rnd.float(-19, 19); }
    if (blocked(x, z)) continue;
    seaweedClump(b, x, z, rnd, rnd.int(4, 8), rnd.float(0.8, 1.25));
  }
  // patches along the breakwater
  for (let x = PIER.x0; x < QX - 1; x += 1.7) {
    seaweedClump(b, x + rnd.float(-0.4, 0.4), PIER.z - 2.4 + rnd.float(-0.3, 0.3), rnd, 4, 0.8);
    seaweedClump(b, x + rnd.float(-0.4, 0.4), PIER.z + 2.4 + rnd.float(-0.3, 0.3), rnd, 4, 0.8);
  }
  for (let i = 0; i < 18; i++) {
    const x = rnd.float(-18.5, 6), z = rnd.float(-18.5, 18.5);
    if (!blocked(x, z)) coral(b, x, z, rnd);
  }
  for (let i = 0; i < 26; i++) {
    const x = rnd.float(-19, 7), z = rnd.float(-19, 19);
    if (!blocked(x, z)) starfish(b, x, z, rnd);
  }

  // anchor lying half-buried, with a chain rising toward the surface
  {
    const ax = -15.8, az = 2.6, fy = floorHeight(ax, az);
    const yaw = 0.6;
    const M = new THREE.Matrix4().compose(new THREE.Vector3(ax, fy + 0.1, az), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, yaw, 0.1)), new THREE.Vector3(1, 1, 1));
    const add = (g, c, o = {}) => b.add(g, c, { ...o, matrix: M });
    add(new THREE.BoxGeometry(0.12, 1.5, 0.12), C.anchor, { pos: [0, 0.75, 0] });
    add(new THREE.BoxGeometry(0.9, 0.1, 0.1), C.anchor, { pos: [0, 1.25, 0] });
    add(new THREE.TorusGeometry(0.14, 0.04, 5, 10), C.anchor, { pos: [0, 1.6, 0] });
    add(new THREE.TorusGeometry(0.55, 0.07, 5, 14, Math.PI), C.anchor, { pos: [0, 0.5, 0], rot: [0, 0, Math.PI] });
    for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.12, 0.3, 4), C.anchor, { pos: [s * 0.55, 0.62, 0], rot: [0, 0, -s * 0.5] });
    // chain links climbing toward the moored sailboat
    const top = new THREE.Vector3(-14.6, -0.3, 1.6);
    const start = new THREE.Vector3(0, 1.6, 0).applyMatrix4(M);
    const n = 16;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const p = start.clone().lerp(top, t);
      p.y -= Math.sin(t * Math.PI) * 0.4;
      b.add(new THREE.TorusGeometry(0.07, 0.022, 4, 8), C.anchor, { pos: p.toArray(), rot: [i % 2 ? Math.PI / 2 : 0, 0.4, 0] });
    }
  }

  // wreck: the ribs and planks of a small wooden boat
  {
    const wx = -17.2, wz = -1.4, fy = floorHeight(wx, wz);
    const M = new THREE.Matrix4().compose(new THREE.Vector3(wx, fy, wz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.5, 0.12)), new THREE.Vector3(1, 1, 1));
    const add = (g, c, o = {}) => b.add(g, c, { ...o, matrix: M });
    add(new THREE.BoxGeometry(0.16, 0.14, 3.4), C.wreck, { pos: [0, 0.07, 0] });
    for (let i = 0; i < 7; i++) {
      const zz = -1.4 + i * 0.47;
      const h = 0.5 + Math.sin((i / 6) * Math.PI) * 0.35 - (i === 5 ? 0.3 : 0);
      for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.6, 0.045, 4, 8, Math.PI / 2 * (h / 0.85)), C.wreck, { pos: [0, 0.62, zz], rot: [0, Math.PI / 2, s > 0 ? Math.PI : -Math.PI / 2 * 0], scale: [1, 1, 1] });
    }
    for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.06, 0.06, 2.4 - i * 0.3), 0x7a6648, { pos: [0.48 - i * 0.02, 0.25 + i * 0.16, 0.1] });
    for (let i = 0; i < 3; i++) add(new THREE.BoxGeometry(0.06, 0.06, 1.6), 0x7a6648, { pos: [-0.5, 0.2 + i * 0.12, -0.2 + i * 0.3], rot: [0, 0, 0.3] });
    add(new THREE.BoxGeometry(0.5, 0.35, 0.4), 0x7a6648, { pos: [1.2, 0.18, 0.8], rot: [0, 0.4, 0.2], pattern: P.planksZ });
  }

  // a row of sunken stone blocks
  for (let i = 0; i < 5; i++) {
    const x = -14.6 + i * 0.85, z = -5.2 + i * 0.25;
    const s = rnd.float(0.55, 0.75);
    b.add(new THREE.BoxGeometry(s, s, s), rnd.pick(C.rock), { pos: [x, floorHeight(x, z) + s * 0.4, z], rot: [rnd.float(-0.2, 0.2), rnd.float(0, 1), rnd.float(-0.2, 0.2)], pattern: P.stone });
  }
  // an old crate and a lost tyre on the floor
  b.add(new THREE.TorusGeometry(0.3, 0.12, 6, 12), C.tire, { pos: [-6.0, floorHeight(-6, 9.5) + 0.1, 9.5], rot: [Math.PI / 2 - 0.2, 0, 0] });

  const mesh = new THREE.Mesh(b.build(), toy);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // pebbles: one instanced mesh
  const pebGeo = new Builder().add(new THREE.IcosahedronGeometry(1, 1), 0xffffff, { flat: true }).build();
  const nPeb = 340;
  const peb = new THREE.InstancedMesh(pebGeo, toy, nPeb);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const col = new THREE.Color();
  let k = 0;
  for (let i = 0; i < nPeb * 2 && k < nPeb; i++) {
    const x = rnd.float(-19.6, QX - 0.4), z = rnd.float(-19.6, 19.6);
    if (blocked(x, z) && rnd.chance(0.8)) continue;
    const r = rnd.float(0.08, 0.26) * (rnd.chance(0.1) ? 1.5 : 1);
    q.setFromEuler(new THREE.Euler(0, rnd.float(0, 6), 0));
    m.compose(new THREE.Vector3(x, floorHeight(x, z) + r * 0.2, z), q, new THREE.Vector3(r * rnd.float(1, 1.5), r * 0.45, r));
    peb.setMatrixAt(k, m);
    peb.setColorAt(k, col.set(rnd.pick(C.pebble)));
    k++;
  }
  peb.count = k;
  peb.receiveShadow = true;
  group.add(peb);
  return group;
}

/** Sailboat with a deep keel (visible through the water). Origin on the waterline. */
function buildSailboat(toy, rnd) {
  const b = new Builder();
  const s = new THREE.Shape();
  s.moveTo(-0.45, 1.1); s.lineTo(0.45, 1.1); s.lineTo(0.48, -0.3);
  s.quadraticCurveTo(0.4, -1.1, 0, -1.4); s.quadraticCurveTo(-0.4, -1.1, -0.48, -0.3); s.closePath();
  const hull = new THREE.ExtrudeGeometry(s, { depth: 0.55, bevelEnabled: false, curveSegments: 8 });
  hull.rotateX(-Math.PI / 2); hull.translate(0, -0.25, 0);
  b.add(hull, C.sailHull);
  const stripe = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false, curveSegments: 8 });
  stripe.rotateX(-Math.PI / 2); stripe.translate(0, -0.2, 0); stripe.scale(1.03, 1, 1.02);
  b.add(stripe, rnd.pick([0xc9473b, 0x3f7fb3]));
  b.add(new THREE.BoxGeometry(0.6, 0.3, 1.0), C.sailHull, { pos: [0, 0.42, -0.1] });
  b.add(new THREE.BoxGeometry(0.62, 0.1, 0.9), C.windowDark, { pos: [0, 0.45, -0.1] });
  b.add(new THREE.CylinderGeometry(0.03, 0.035, 3.0, 5), 0xdcd8cc, { pos: [0, 1.8, 0.35] });
  b.add(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 5), 0xdcd8cc, { pos: [0, 0.75, -0.35], rot: [Math.PI / 2, 0, 0] });
  b.add(new THREE.BoxGeometry(0.5, 0.12, 0.8), 0x2f6f8a, { pos: [0, 0.82, -0.3] });
  // keel and rudder under the water
  b.add(new THREE.BoxGeometry(0.1, 1.2, 0.55), C.keel, { pos: [0, -0.85, 0.1] });
  b.add(new THREE.CapsuleGeometry(0.13, 0.5, 3, 6), C.keel, { pos: [0, -1.45, 0.1], rot: [Math.PI / 2, 0, 0] });
  b.add(new THREE.BoxGeometry(0.06, 0.5, 0.25), C.keel, { pos: [0, -0.45, -0.95] });
  const g = new THREE.Group();
  const m = new THREE.Mesh(b.build(), toy);
  m.castShadow = true;
  g.add(m);
  // stays from the mast top
  const lg = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 3.3, 0.35), new THREE.Vector3(0, 0.3, 1.35),
    new THREE.Vector3(0, 3.3, 0.35), new THREE.Vector3(0, 0.3, -1.05),
  ]);
  g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x6f7a78 })));
  return g;
}

function buildBuoy(toy, color, cone = false) {
  const b = new Builder();
  if (cone) {
    b.add(new THREE.CylinderGeometry(0.02, 0.36, 0.95, 10), color, { pos: [0, 0.35, 0] });
    b.add(new THREE.SphereGeometry(0.36, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), color, { pos: [0, -0.12, 0] });
    b.add(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4), C.anchor, { pos: [0, -0.9, 0] });
  } else {
    b.add(new THREE.SphereGeometry(0.34, 12, 10), color);
    b.add(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 6), C.lhDark, { pos: [0, 0.38, 0] });
    b.add(new THREE.TorusGeometry(0.34, 0.03, 4, 16), 0x3a3a3a, { rot: [Math.PI / 2, 0, 0] });
  }
  const g = new THREE.Group();
  const m = new THREE.Mesh(b.build(), toy);
  m.castShadow = true;
  g.add(m);
  return g;
}

/** Things floating on the water, re-posed every frame from the water height. */
export class Floaters {
  constructor(toy) {
    this.group = new THREE.Group();
    this.group.name = 'floaters';
    this.items = [];
    const rnd = new Rand(9);
    const add = (obj, x, z, yaw, o = {}) => {
      obj.position.set(x, 0, z);
      this.group.add(obj);
      this.items.push({ obj, x, z, yaw, sink: o.sink ?? 0, roll: o.roll ?? 1, drift: o.drift ?? 0.15, phase: rnd.float(0, 6), click: o.click ?? null });
    };
    add(buildSailboat(toy, rnd), -15.6, -9.6, 0.5, { drift: 0.25 });
    add(buildSailboat(toy, rnd), -13.0, 8.6, -0.9, { drift: 0.25 });
    add(buildBuoy(toy, C.buoy), -13.6, -7.4, 0, { sink: 0.1 });
    add(buildBuoy(toy, C.buoy), -11.4, 9.6, 0, { sink: 0.1 });
    add(buildBuoy(toy, C.buoyGreen, true), -9.4, 12.4, 0, { sink: 0.15, roll: 1.5 });
    add(buildBuoy(toy, C.buoy), -1.0, -16.5, 0, { sink: 0.1 });
    const tire = new THREE.Group();
    const tm = new THREE.Mesh(new Builder().add(new THREE.TorusGeometry(0.42, 0.15, 8, 18), C.tire, { rot: [Math.PI / 2, 0, 0] }).build(), toy);
    tm.castShadow = true;
    tire.add(tm);
    add(tire, -16.4, -11.6, 0, { sink: 0.02 });
    const fb = buildFishingBoat(toy);
    add(fb, PLATFORM.x - 0.1, PLATFORM.z - 2.6, 0.08, { drift: 0.05 });
    this.berth = BERTH;
  }

  update(water, time) {
    const e = 0.6;
    for (const it of this.items) {
      const { obj } = it;
      const dx = Math.sin(time * 0.21 + it.phase) * it.drift;
      const dz = Math.cos(time * 0.17 + it.phase) * it.drift;
      const x = it.x + dx, z = it.z + dz;
      const h = water.heightAt(x, z);
      const sx = water.heightAt(x + e, z) - water.heightAt(x - e, z);
      const sz = water.heightAt(x, z + e) - water.heightAt(x, z - e);
      obj.position.set(x, h - it.sink, z);
      obj.rotation.set(Math.atan2(sz, 2 * e) * it.roll * 0.8, it.yaw + Math.sin(time * 0.3 + it.phase) * 0.15, -Math.atan2(sx, 2 * e) * it.roll * 0.8, 'YXZ');
    }
  }
}

export { HALF };
