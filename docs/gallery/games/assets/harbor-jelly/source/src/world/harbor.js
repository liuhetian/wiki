import * as THREE from 'three';
import { Builder } from '../geo.js';
import { C } from '../palette.js';
import { P } from '../materials.js';
import { Rand } from '../rand.js';
import { QX, LAND_Y, YARD, CRANE_Z, BERTH } from './layout.js';

export const CONT = { L: 1.5, W: 0.62, H: 0.62 };

/** One container geometry (white; tinted per instance), with ribs, door end and corner posts. */
export function containerGeometry() {
  const b = new Builder();
  b.add(new THREE.BoxGeometry(CONT.W, CONT.H, CONT.L), 0xffffff, { pattern: P.corrugated });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.add(new THREE.BoxGeometry(0.07, CONT.H + 0.01, 0.07), 0xdedede, { pos: [sx * (CONT.W / 2 - 0.02), 0, sz * (CONT.L / 2 - 0.02)] });
  }
  b.add(new THREE.BoxGeometry(CONT.W - 0.08, CONT.H - 0.1, 0.02), 0xcfcfcf, { pos: [0, 0, CONT.L / 2 + 0.005] });
  return b.build();
}

const CONT_WEIGHTS = [5, 5, 4, 4, 4, 3, 3, 2, 2, 2];
export function pickContainerColor(rnd) {
  const total = CONT_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = rnd.float(0, total);
  for (let i = 0; i < CONT_WEIGHTS.length; i++) { r -= CONT_WEIGHTS[i]; if (r <= 0) return C.containers[i]; }
  return C.containers[0];
}

function buildYard(toy, geo) {
  const rnd = new Rand(21);
  const items = [];
  const cols = 7;
  const colW = (YARD.x1 - YARD.x0) / cols;
  for (let zb = YARD.z0; zb < YARD.z1 - CONT.L; zb += CONT.L * 4 + 0.9) {
    for (let r = 0; r < 4; r++) {
      const z = zb + r * (CONT.L + 0.04) + CONT.L / 2;
      if (z > YARD.z1 - CONT.L / 2) break;
      for (let c = 0; c < cols; c++) {
        const x = YARD.x0 + colW * (c + 0.5);
        const back = c / (cols - 1);
        const hMax = Math.round(2 + back * 3);
        const h = rnd.int(Math.max(1, hMax - 2), hMax);
        for (let k = 0; k < h; k++) items.push({ x, y: LAND_Y + CONT.H * (k + 0.5) + 0.01, z, color: pickContainerColor(rnd) });
      }
    }
  }
  // a few loose stacks on the apron behind the crane legs
  for (const [x, z, h] of [[QX + 5.0, -18.6, 3], [QX + 5.0, -2.8, 2], [QX + 1.6, -3.2, 1], [QX + 2.4, -3.2, 2]]) {
    for (let k = 0; k < h; k++) items.push({ x, y: LAND_Y + CONT.H * (k + 0.5) + 0.01, z, color: pickContainerColor(rnd) });
  }
  const mesh = new THREE.InstancedMesh(geo, toy, items.length);
  const m = new THREE.Matrix4();
  const col = new THREE.Color();
  items.forEach((it, i) => {
    m.makeTranslation(it.x, it.y, it.z);
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, col.set(it.color));
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// crane geometry constants (crane-local: origin on the quay edge at ground level, +x toward land)
const LEG_X = [0.75, 4.55];
const LEG_Z = 1.5;
const PORTAL_Y = 6.6;
const BOOM_Y = 6.7;
const BOOM_H = 0.75;
const HINGE_X = 0.5;
const TIP_X = -7.6;
const BACK_X = 7.4;
const APEX = new THREE.Vector3(2.4, 10.6, 0);
const HOIST_TOP = BOOM_Y - 0.5;

function truss(b, color, x0, x1, y, h, z, panel = 0.95) {
  const n = Math.max(1, Math.round((x1 - x0) / panel));
  const step = (x1 - x0) / n;
  const t = 0.12;
  b.add(new THREE.BoxGeometry(x1 - x0, t * 1.4, t * 1.4), color, { pos: [(x0 + x1) / 2, y, z] });
  b.add(new THREE.BoxGeometry(x1 - x0, t, t), color, { pos: [(x0 + x1) / 2, y + h, z] });
  for (let i = 0; i <= n; i++) {
    const x = x0 + i * step;
    b.add(new THREE.BoxGeometry(t * 0.8, h, t * 0.8), color, { pos: [x, y + h / 2, z] });
    if (i < n) {
      const len = Math.hypot(step, h);
      const ang = Math.atan2(h, step) * (i % 2 ? 1 : -1);
      b.add(new THREE.BoxGeometry(len, t * 0.7, t * 0.7), color, { pos: [x + step / 2, y + h / 2, z], rot: [0, 0, ang] });
    }
  }
}

function beam(b, color, a, c, t = 0.14) {
  const d = new THREE.Vector3().subVectors(c, a);
  const len = d.length();
  const mid = new THREE.Vector3().addVectors(a, c).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  b.add(new THREE.BoxGeometry(len, t, t), color, { pos: mid.toArray(), rot: [e.x, e.y, e.z] });
}

class Crane {
  constructor(toy, color, z, phase, contGeo) {
    this.group = new THREE.Group();
    this.group.position.set(QX, LAND_Y, z);
    this.phase = phase;
    this.boomAngle = 0;
    this.state = 'work';
    this.stateT = 0;
    this.cycleT = phase;
    this.contOnShip = true;
    this.snapClear = false;

    const b = new Builder();
    for (const lx of LEG_X) for (const s of [-1, 1]) {
      b.add(new THREE.BoxGeometry(0.34, PORTAL_Y, 0.34), color, { pos: [lx, PORTAL_Y / 2, s * LEG_Z] });
      b.add(new THREE.BoxGeometry(0.6, 0.35, 0.9), C.bollard, { pos: [lx, 0.18, s * LEG_Z] });
    }
    for (const s of [-1, 1]) {
      b.add(new THREE.BoxGeometry(LEG_X[1] - LEG_X[0], 0.3, 0.3), color, { pos: [(LEG_X[0] + LEG_X[1]) / 2, 0.55, s * LEG_Z] });
      b.add(new THREE.BoxGeometry(LEG_X[1] - LEG_X[0] + 0.4, 0.4, 0.4), color, { pos: [(LEG_X[0] + LEG_X[1]) / 2, PORTAL_Y - 1.4, s * LEG_Z] });
      beam(b, color, new THREE.Vector3(LEG_X[0], 0.8, s * LEG_Z), new THREE.Vector3(LEG_X[1], PORTAL_Y - 1.6, s * LEG_Z), 0.16);
    }
    for (const lx of LEG_X) {
      b.add(new THREE.BoxGeometry(0.36, 0.4, LEG_Z * 2 + 0.3), color, { pos: [lx, PORTAL_Y - 0.1, 0] });
    }
    // fixed back part of the boom with the machinery house
    for (const s of [-1, 1]) truss(b, color, HINGE_X, BACK_X, BOOM_Y, BOOM_H, s * 0.85);
    for (let x = HINGE_X; x <= BACK_X; x += 1.5) b.add(new THREE.BoxGeometry(0.1, 0.1, 1.8), color, { pos: [x, BOOM_Y + BOOM_H, 0] });
    b.add(new THREE.BoxGeometry(2.4, 1.3, 2.1), C.craneHouse, { pos: [BACK_X - 1.3, BOOM_Y + BOOM_H + 0.65, 0] });
    b.add(new THREE.BoxGeometry(2.5, 0.1, 2.2), 0xb9b4a2, { pos: [BACK_X - 1.3, BOOM_Y + BOOM_H + 1.35, 0] });
    b.add(new THREE.BoxGeometry(0.9, 0.5, 0.9), C.craneHouse, { pos: [BACK_X - 0.8, BOOM_Y + BOOM_H + 1.6, 0.4] });
    // apex A-frame
    for (const s of [-1, 1]) {
      beam(b, color, new THREE.Vector3(LEG_X[0], BOOM_Y + BOOM_H, s * 0.9), new THREE.Vector3(APEX.x, APEX.y, s * 0.55), 0.2);
      beam(b, color, new THREE.Vector3(LEG_X[1], BOOM_Y + BOOM_H, s * 0.9), new THREE.Vector3(APEX.x, APEX.y, s * 0.55), 0.2);
    }
    b.add(new THREE.BoxGeometry(0.3, 0.3, 1.4), color, { pos: [APEX.x, APEX.y, 0] });
    // walkway rail along the back boom
    this.fixed = new THREE.Mesh(b.build(), toy);
    this.fixed.castShadow = true;
    this.fixed.receiveShadow = true;
    this.group.add(this.fixed);

    // hinged sea-side boom
    this.boomPivot = new THREE.Group();
    this.boomPivot.position.set(HINGE_X, BOOM_Y, 0);
    const bb = new Builder();
    for (const s of [-1, 1]) truss(bb, color, TIP_X - HINGE_X, 0, 0, BOOM_H, s * 0.85);
    for (let x = TIP_X - HINGE_X; x <= 0; x += 1.5) bb.add(new THREE.BoxGeometry(0.1, 0.1, 1.8), color, { pos: [x, BOOM_H, 0] });
    bb.add(new THREE.BoxGeometry(0.3, 0.3, 1.9), color, { pos: [TIP_X - HINGE_X + 0.1, BOOM_H / 2, 0] });
    this.boom = new THREE.Mesh(bb.build(), toy);
    this.boom.castShadow = true;
    this.boomPivot.add(this.boom);
    this.group.add(this.boomPivot);

    // trolley with the operator cab, spreader and the container it moves
    const tb = new Builder();
    tb.add(new THREE.BoxGeometry(1.3, 0.45, 1.5), 0x5f6a66, { pos: [0, -0.05, 0] });
    tb.add(new THREE.BoxGeometry(0.9, 0.75, 0.8), 0xd9dccf, { pos: [-0.2, -0.75, 0.75] });
    tb.add(new THREE.BoxGeometry(0.92, 0.25, 0.82), 0x35505a, { pos: [-0.2, -0.65, 0.75] });
    this.trolley = new THREE.Mesh(tb.build(), toy);
    this.trolley.castShadow = true;
    this.group.add(this.trolley);

    const sb = new Builder();
    sb.add(new THREE.BoxGeometry(CONT.W + 0.1, 0.14, CONT.L + 0.1), 0xe0b84a);
    sb.add(new THREE.BoxGeometry(0.3, 0.22, 0.3), 0x3c4a48, { pos: [0, 0.16, 0] });
    this.spreader = new THREE.Mesh(sb.build(), toy);
    this.spreader.castShadow = true;
    this.group.add(this.spreader);

    this.contColor = new THREE.Color(phase > 1 ? C.containers[1] : C.containers[2]);
    this.contTint = new THREE.InstancedMesh(contGeo, toy, 1);
    this.contTint.setColorAt(0, this.contColor);
    this.contTint.castShadow = true;
    this.group.add(this.contTint);

    // cables: hoist ropes (4) and stays from the apex to the boom
    this.cableGeo = new THREE.BufferGeometry();
    this.cableGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 2 * 12), 3));
    this.cables = new THREE.LineSegments(this.cableGeo, new THREE.LineBasicMaterial({ color: C.cable }));
    this.cables.frustumCulled = false;
    this.group.add(this.cables);

    this.trolleyX = 2.6;
    this.hoistY = HOIST_TOP - 1.4;
    this.startX = this.trolleyX;
    this.startY = this.hoistY;
    this.shipSlotX = BERTH.x - QX + (phase > 1 ? 0.64 : -0.64);
    this.shipSlotY = 1.0 + CONT.H * 3 - LAND_Y + 0.02; // top of the deck stack
    this.landSlotX = 2.65;
    this.landSlotY = 0.01;
  }

  /** Where the trolley rides: on the hinged boom it follows the boom angle. */
  railPoint(x) {
    if (x >= HINGE_X) return new THREE.Vector3(x, BOOM_Y - 0.05, 0);
    const a = this.boomAngle;
    const r = x - HINGE_X;
    return new THREE.Vector3(HINGE_X + r * Math.cos(a), BOOM_Y - 0.05 + -r * Math.sin(a), 0);
  }

  /**
   * States: work (moving the box between ship and land) → parking (finish with the box on land,
   * trolley over the land) → raising (boom up) → up (berth clear) → lowering → work.
   */
  update(dt, wantWork) {
    const ease = (t) => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * ease(THREE.MathUtils.clamp(t, 0, 1));
    const up = HOIST_TOP - 1.4;
    let carrying = false;

    if (this.state === 'work') {
      const fromX = this.contOnShip ? this.shipSlotX : this.landSlotX;
      const toX = this.contOnShip ? this.landSlotX : this.shipSlotX;
      const fromY = this.contOnShip ? this.shipSlotY : this.landSlotY;
      const toY = this.contOnShip ? this.landSlotY : this.shipSlotY;
      const prev = this.cycleT;
      this.cycleT += dt;
      const t = this.cycleT;
      const grabY = fromY + CONT.H + 0.1;
      const dropY = toY + CONT.H + 0.1;
      if (t < 2.6) { this.trolleyX = lerp(this.startX, fromX, t / 2.6); this.hoistY = lerp(this.startY, up, t / 1.5); }
      else if (t < 4.6) { this.trolleyX = fromX; this.hoistY = lerp(up, grabY, (t - 2.6) / 2); }
      else if (t < 5.2) { this.hoistY = grabY; carrying = true; }
      else if (t < 7.2) { this.hoistY = lerp(grabY, up, (t - 5.2) / 2); carrying = true; }
      else if (t < 9.8) { this.trolleyX = lerp(fromX, toX, (t - 7.2) / 2.6); this.hoistY = up; carrying = true; }
      else if (t < 11.8) { this.trolleyX = toX; this.hoistY = lerp(up, dropY, (t - 9.8) / 2); carrying = true; }
      else if (t < 12.4) { this.hoistY = dropY; carrying = prev < 11.8; }
      else { this.hoistY = lerp(dropY, up, (t - 12.4) / 1.6); }
      if (prev < 12.0 && t >= 12.0) this.contOnShip = !this.contOnShip;
      // the ship wants to leave and this cycle has not picked up its box from the land yet: skip it
      if (!wantWork && !this.contOnShip && t < 4.6) { this.state = 'parking'; this.stateT = 0; this.cycleT = 0; }
      if (t >= 14) {
        this.cycleT = 0;
        this.startX = this.trolleyX;
        this.startY = this.hoistY;
        if (!wantWork && !this.contOnShip) { this.state = 'parking'; this.stateT = 0; }
      }
    } else if (this.state === 'parking') {
      this.stateT += dt;
      this.trolleyX += (3.3 - this.trolleyX) * Math.min(1, dt * 2);
      this.hoistY += (HOIST_TOP - 0.9 - this.hoistY) * Math.min(1, dt * 2);
      if (this.stateT > 1.6) this.state = 'raising';
    } else if (this.state === 'raising') {
      this.boomAngle = Math.min(1.32, this.boomAngle + dt * 0.4);
      if (this.boomAngle >= 1.32) this.state = 'up';
    } else if (this.state === 'up') {
      if (wantWork) this.state = 'lowering';
    } else if (this.state === 'lowering') {
      this.boomAngle = Math.max(0, this.boomAngle - dt * 0.4);
      if (this.boomAngle <= 0) {
        this.state = 'work'; this.cycleT = 0; this.startX = this.trolleyX; this.startY = this.hoistY;
      }
    }
    this.boomPivot.rotation.z = -this.boomAngle;

    // jump straight to "berth clear" (used when the tour skips ahead)
    if (this.snapClear) {
      this.snapClear = false;
      this.contOnShip = false; this.state = 'up'; this.boomAngle = 1.32; this.trolleyX = 3.3; this.hoistY = HOIST_TOP - 0.9;
      this.boomPivot.rotation.z = -this.boomAngle;
      carrying = false;
    }
    const shipDocked = wantWork || this.state === 'work' || this.state === 'parking';

    const rp = this.railPoint(this.trolleyX);
    this.trolley.position.copy(rp);
    this.trolley.rotation.z = this.trolleyX < HINGE_X ? -this.boomAngle : 0;
    const sp = new THREE.Vector3(rp.x, Math.min(this.hoistY, rp.y - 0.7), 0);
    this.spreader.position.copy(sp);

    // container: on the spreader, or resting on its slot
    const cm = new THREE.Matrix4();
    let cp;
    if (carrying) cp = new THREE.Vector3(sp.x, sp.y - CONT.H / 2 - 0.08, 0);
    else if (this.contOnShip) cp = new THREE.Vector3(this.shipSlotX, this.shipSlotY + CONT.H / 2, 0);
    else cp = new THREE.Vector3(this.landSlotX, this.landSlotY + CONT.H / 2, 0);
    // hide the ship-side box when the ship is away (it left with the ship)
    const visible = carrying || !this.contOnShip || shipDocked;
    cm.makeTranslation(cp.x, cp.y, cp.z);
    if (!visible) cm.makeScale(0, 0, 0);
    this.contTint.setMatrixAt(0, cm);
    this.contTint.instanceMatrix.needsUpdate = true;

    // cables
    const a = this.cableGeo.attributes.position.array;
    let i = 0;
    const put = (v) => { a[i++] = v.x; a[i++] = v.y; a[i++] = v.z; };
    for (const [dx, dz] of [[-0.25, -0.5], [0.25, -0.5], [-0.25, 0.5], [0.25, 0.5]]) {
      put(new THREE.Vector3(rp.x + dx, rp.y - 0.25, dz));
      put(new THREE.Vector3(sp.x + dx, sp.y + 0.07, dz));
    }
    const tip = this.railPoint(TIP_X + 0.2).add(new THREE.Vector3(0, BOOM_H + 0.05, 0));
    const mid = this.railPoint(-3.4).add(new THREE.Vector3(0, BOOM_H + 0.05, 0));
    for (const s of [-1, 1]) {
      const ap = new THREE.Vector3(APEX.x, APEX.y, s * 0.55);
      put(ap); put(new THREE.Vector3(tip.x, tip.y, s * 0.85));
      put(ap); put(new THREE.Vector3(mid.x, mid.y, s * 0.85));
      put(ap); put(new THREE.Vector3(BACK_X - 0.2, BOOM_Y + BOOM_H, s * 0.85));
      put(ap); put(new THREE.Vector3(LEG_X[1], BOOM_Y + BOOM_H, s * 0.85));
    }
    this.cableGeo.attributes.position.needsUpdate = true;
  }
}

export class Harbor {
  constructor(toy) {
    this.group = new THREE.Group();
    this.group.name = 'harbor';
    this.contGeo = containerGeometry();
    this.yard = buildYard(toy, this.contGeo);
    this.group.add(this.yard);
    this.cranes = [
      new Crane(toy, C.craneRed, CRANE_Z[0], 0, this.contGeo),
      new Crane(toy, C.craneBlue, CRANE_Z[1], 7, this.contGeo),
    ];
    for (const c of this.cranes) this.group.add(c.group);
  }

  /** True once both booms are up and out of the ship's way. */
  get clear() { return this.cranes.every((c) => c.state === 'up'); }
  get working() { return this.cranes.every((c) => c.state === 'work'); }

  snapToClear() { for (const c of this.cranes) c.snapClear = true; }

  /** Booms down and working (used when the tour rewinds to the start). */
  snapToWork() {
    for (const c of this.cranes) {
      c.state = 'work'; c.boomAngle = 0; c.cycleT = c.phase; c.contOnShip = true;
      c.trolleyX = 2.6; c.startX = 2.6; c.boomPivot.rotation.z = 0;
    }
  }

  /** wantWork: the ship is alongside and the cranes should work it; false asks them to clear the berth. */
  update(dt, wantWork) {
    for (const c of this.cranes) c.update(dt, wantWork);
  }
}
