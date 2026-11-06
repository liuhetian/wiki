import * as THREE from 'three';
import { Builder } from '../geo.js';
import { C } from '../palette.js';
import { Rand } from '../rand.js';
import { BERTH, SHIP_ROWS, shipRowZ } from './layout.js';
import { CONT, pickContainerColor } from './harbor.js';

export const SHIP = { L: 16, B: 3.5, deck: 1.0, draft: 1.25 };

/** Top-view hull outline (x across, z along; bow at +z), as a Shape in (x, -z) for extrusion. */
function hullShape(L, B, inset = 0) {
  const hb = B / 2 - inset, hl = L / 2 - inset;
  const s = new THREE.Shape();
  s.moveTo(-hb, hl);
  s.lineTo(hb, hl);
  s.lineTo(hb, -(hl - 3.4));
  s.bezierCurveTo(hb, -(hl - 1.2), hb * 0.45, -hl, 0, -hl);
  s.bezierCurveTo(-hb * 0.45, -hl, -hb, -(hl - 1.2), -hb, -(hl - 3.4));
  s.closePath();
  return s;
}

function extrudeHull(shape, y0, y1) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  return g;
}

export function buildCargoShip(toy, contGeo) {
  const group = new THREE.Group();
  group.name = 'cargoShip';
  const { L, B, deck, draft } = SHIP;
  const b = new Builder();
  b.add(extrudeHull(hullShape(L, B, 0.12), -draft, -0.1), C.hullRed);
  b.add(extrudeHull(hullShape(L, B), -0.12, deck - 0.08), C.hull);
  b.add(extrudeHull(hullShape(L, B, -0.02), deck - 0.1, deck), 0xe9e4d4);
  b.add(extrudeHull(hullShape(L, B, 0.18), deck - 0.05, deck + 0.02), C.deck);
  // superstructure at the stern
  const zs = -L / 2 + 1.5;
  b.add(new THREE.BoxGeometry(2.7, 2.4, 2.2), C.superstructure, { pos: [0, deck + 1.2, zs] });
  b.add(new THREE.BoxGeometry(2.72, 0.22, 2.22), C.windowDark, { pos: [0, deck + 0.75, zs] });
  b.add(new THREE.BoxGeometry(2.72, 0.22, 2.22), C.windowDark, { pos: [0, deck + 1.55, zs] });
  b.add(new THREE.BoxGeometry(3.5, 0.7, 1.4), C.superstructure, { pos: [0, deck + 2.75, zs + 0.3] });
  b.add(new THREE.BoxGeometry(3.52, 0.28, 1.42), C.windowDark, { pos: [0, deck + 2.8, zs + 0.3] });
  b.add(new THREE.BoxGeometry(3.6, 0.1, 1.5), 0xd6d0bf, { pos: [0, deck + 3.15, zs + 0.3] });
  b.add(new THREE.BoxGeometry(0.85, 1.1, 0.85), C.funnel, { pos: [0, deck + 3.6, zs - 0.6] });
  b.add(new THREE.BoxGeometry(0.87, 0.22, 0.87), C.hullRed, { pos: [0, deck + 3.9, zs - 0.6] });
  b.add(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 4), 0x555b58, { pos: [0, deck + 3.9, zs + 0.5] });
  b.add(new THREE.BoxGeometry(0.6, 0.06, 0.06), 0x555b58, { pos: [0, deck + 4.3, zs + 0.5] });
  for (const s of [-1, 1]) b.add(new THREE.CapsuleGeometry(0.22, 0.9, 3, 6), 0xe58a3a, { pos: [s * 1.45, deck + 0.55, zs + 0.2], rot: [Math.PI / 2, 0, 0] });
  // forecastle and mast at the bow
  b.add(new THREE.BoxGeometry(2.4, 0.35, 1.0), C.hull, { pos: [0, deck + 0.17, L / 2 - 2.4] });
  b.add(new THREE.CylinderGeometry(0.05, 0.06, 1.6, 5), 0xe9e4d4, { pos: [0, deck + 0.8, L / 2 - 2.1] });
  // hull rails
  for (const s of [-1, 1]) b.add(new THREE.BoxGeometry(0.04, 0.2, L - 4.5), 0xe9e4d4, { pos: [s * (B / 2 - 0.06), deck + 0.12, -0.6] });
  const hull = new THREE.Mesh(b.build(), toy);
  hull.castShadow = true;
  hull.receiveShadow = true;
  group.add(hull);

  // deck containers: rows along the ship; the crane rows keep a stack of exactly 3
  const rnd = new Rand(33);
  const items = [];
  const colsX = [-2, -1, 0, 1, 2].map((i) => i * 0.64);
  for (let r = 0; r < SHIP_ROWS.n; r++) {
    const z = shipRowZ(r);
    const narrow = r === SHIP_ROWS.n - 1;
    for (const x of colsX) {
      if (narrow && Math.abs(x) > 0.7) continue;
      let h = rnd.int(2, 3);
      if (r === 1 || r === 5) h = 3;
      if ((r === 1 && x === -0.64) || (r === 5 && x === 0.64)) h = 3;
      for (let k = 0; k < h; k++) items.push([x, deck + CONT.H * (k + 0.5) + 0.02, z]);
    }
  }
  const cont = new THREE.InstancedMesh(contGeo, toy, items.length);
  const m = new THREE.Matrix4();
  const col = new THREE.Color();
  items.forEach(([x, y, z], i) => {
    m.makeTranslation(x, y, z);
    cont.setMatrixAt(i, m);
    cont.setColorAt(i, col.set(pickContainerColor(rnd)));
  });
  cont.castShadow = true;
  cont.receiveShadow = true;
  group.add(cont);
  return group;
}

export function buildTug(toy) {
  const b = new Builder();
  const shape = hullShape(2.8, 1.25);
  b.add(extrudeHull(shape, -0.45, 0.35), C.tug);
  b.add(extrudeHull(hullShape(2.8, 1.25, -0.04), 0.3, 0.4), 0x2b2f2e);
  b.add(new THREE.BoxGeometry(0.85, 0.55, 0.9), C.white, { pos: [0, 0.65, 0.05] });
  b.add(new THREE.BoxGeometry(0.87, 0.16, 0.92), C.windowDark, { pos: [0, 0.78, 0.05] });
  b.add(new THREE.BoxGeometry(0.95, 0.06, 1.0), C.tug, { pos: [0, 0.96, 0.05] });
  b.add(new THREE.CylinderGeometry(0.13, 0.15, 0.5, 8), 0x2b2f2e, { pos: [0, 1.2, -0.25] });
  b.add(new THREE.CylinderGeometry(0.135, 0.135, 0.1, 8), C.tug, { pos: [0, 1.32, -0.25] });
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(b.build(), toy);
  mesh.castShadow = true;
  g.add(mesh);
  g.name = 'tug';
  return g;
}

// loop through the harbour, starting and ending just off the berth heading +z
const OFF_X = BERTH.x - 4;
const LOOP = new THREE.CatmullRomCurve3([
  [OFF_X, -9.6], [2.5, -3.5], [0.0, 1.5], [-5.0, 3.5], [-9.5, 1.0],
  [-10.5, -4.5], [-7.5, -9.5], [-2.5, -12.5], [1.5, -13.8],
].map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');

/** Ship + tug + wake and the harbour routine: alongside → clear the berth → loop → back alongside. */
export class ShipRoute {
  pushWater(dt, pos, yaw, halfL, halfB, prev, gain) {
    const mx = pos.x - prev.p.x, mz = pos.z - prev.p.z;
    const d = Math.hypot(mx, mz);
    prev.p.copy(pos);
    // standing still, or a jump (snapDocked / jumpToLoop): no splash
    if (d < 1e-5 || d > 1.5 || dt <= 0) { prev.dist = 0; return; }
    prev.dist += d;
    if (prev.dist < 0.7) return;
    prev.dist = 0;
    const speed = d / dt;
    const ux = mx / d, uz = mz / d;
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const along = ux * fx + uz * fz, side = ux * fz - uz * fx;
    // leading point of the hull (an ellipse) in the direction of travel
    const r = 1 / Math.sqrt((along / halfL) ** 2 + (side / halfB) ** 2);
    const amp = -gain * Math.min(1, speed / 1.6);
    const px = pos.x + ux * r, pz = pos.z + uz * r;
    this.water.disturb(px, pz, amp, 0.8);
    // moving sideways (undocking, docking) the whole flank pushes
    if (Math.abs(side) > 0.7) for (const s of [-0.62, 0.62]) this.water.disturb(px + fx * halfL * s, pz + fz * halfL * s, amp * 0.6, 0.8);
  }

  constructor(toy, contGeo, water) {
    this.water = water;
    this.ship = buildCargoShip(toy, contGeo);
    this.tug = buildTug(toy);
    this.group = new THREE.Group();
    this.group.add(this.ship, this.tug);
    this.len = LOOP.getLength();
    this.speed = 1.9;
    this.state = 'docked';
    this.t = 0;
    this.dockTime = 32;
    this.u = 0;
    this.pos = new THREE.Vector3(BERTH.x, 0, BERTH.z);
    this.yaw = 0;
    this.tugPos = new THREE.Vector3(BERTH.x - 4.6, 0, BERTH.z - 9.5);
    this.tugYaw = Math.PI / 2;
    this.tugVel = new THREE.Vector3();
    this.departRequested = false;
    // for the hulls' push on the simulated water
    this.pushPrev = { ship: { p: this.pos.clone(), dist: 0 }, tug: { p: this.tugPos.clone(), dist: 0 } };

    // tow line
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    this.towLine = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x2b2f2e }));
    this.towLine.frustumCulled = false;
    this.group.add(this.towLine);

    // wake: a ribbon of recent stern positions
    this.wakeN = 48;
    this.wakePts = Array.from({ length: this.wakeN }, () => ({ p: this.pos.clone(), dir: new THREE.Vector3(0, 0, 1), age: 99 }));
    this.wakeTimer = 0;
    const wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.wakeN * 2 * 3), 3));
    wg.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(this.wakeN * 2), 1));
    const idx = [];
    for (let i = 0; i < this.wakeN - 1; i++) {
      const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
      idx.push(a, c, b, b, c, d);
    }
    wg.setIndex(idx);
    this.wake = new THREE.Mesh(wg, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: 'attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying float vA; void main(){ gl_FragColor = vec4(vec3(0.97,1.0,0.98), vA); }',
    }));
    this.wake.frustumCulled = false;
    this.wake.renderOrder = 3;
    this.group.add(this.wake);
  }

  get docked() { return this.state === 'docked' || this.state === 'waitClear'; }

  /** Ask the ship to leave now (skips the rest of the loading). */
  depart() { if (this.state === 'docked') { this.state = 'waitClear'; this.t = 0; } }

  /** Teleport into the loop (used when the tour jumps straight to the interaction scene). */
  jumpToLoop(u = 0.12) {
    this.state = 'sail'; this.u = u; this.t = 0;
    const p = LOOP.getPointAt(u);
    this.pos.set(p.x, 0, p.z);
    const tg = LOOP.getTangentAt(u);
    this.yaw = Math.atan2(tg.x, tg.z);
    this.tugPos.copy(this.pos).addScaledVector(tg, 11);
    for (const w of this.wakePts) w.age = 99;
  }

  /** Back to the berth instantly (used by reset). */
  snapDocked() {
    this.state = 'docked'; this.t = 0; this.u = 0;
    this.pos.set(BERTH.x, 0, BERTH.z); this.yaw = 0;
    this.tugPos.set(BERTH.x - 4.6, 0, BERTH.z - 9.5); this.tugYaw = Math.PI / 2;
    for (const w of this.wakePts) w.age = 99;
  }

  /** wantWork for the cranes: true while the ship is alongside and loading. */
  get cranesShouldWork() { return this.state === 'docked'; }

  update(dt, harbor) {
    this.t += dt;
    const ease = (x) => x * x * (3 - 2 * x);
    let moving = false;
    const tugTarget = new THREE.Vector3();
    let tugYawTarget = this.tugYaw;

    if (this.state === 'docked') {
      if (this.t > this.dockTime) { this.state = 'waitClear'; this.t = 0; }
      tugTarget.set(BERTH.x - 4.6, 0, BERTH.z - 9.5);
      tugYawTarget = Math.PI / 2;
    } else if (this.state === 'waitClear') {
      if (harbor.clear) { this.state = 'undock'; this.t = 0; }
      tugTarget.set(BERTH.x - 3.6, 0, BERTH.z + 1.5);
      tugYawTarget = Math.PI / 2;
    } else if (this.state === 'undock' || this.state === 'dock') {
      const T = 7;
      const k = ease(Math.min(1, this.t / T));
      const x = this.state === 'undock' ? THREE.MathUtils.lerp(BERTH.x, OFF_X, k) : THREE.MathUtils.lerp(OFF_X, BERTH.x, k);
      this.pos.set(x, 0, BERTH.z);
      this.yaw = 0;
      moving = true;
      tugTarget.set(x - SHIP.B / 2 - 0.75, 0, BERTH.z + 1.5);
      tugYawTarget = Math.PI / 2;
      if (this.t >= T) {
        if (this.state === 'undock') { this.state = 'sail'; this.u = 0; } else { this.state = 'docked'; }
        this.t = 0;
      }
    } else if (this.state === 'sail') {
      // ease in and out of the loop
      const s = this.u * this.len;
      const v = this.speed * Math.min(1, 0.25 + s / 6) * Math.min(1, 0.25 + (this.len - s) / 6);
      this.u = Math.min(1, this.u + (v * dt) / this.len);
      const p = LOOP.getPointAt(this.u);
      const tg = LOOP.getTangentAt(this.u);
      this.pos.set(p.x, 0, p.z);
      this.yaw = Math.atan2(tg.x, tg.z);
      moving = true;
      const ahead = LOOP.getPointAt((this.u + (SHIP.L / 2 + 3.2) / this.len) % 1);
      tugTarget.copy(ahead);
      tugYawTarget = this.yaw;
      if (this.u >= 1) { this.state = 'dock'; this.t = 0; this.yaw = 0; }
    }

    // ship pose riding the water
    const w = this.water;
    const y = w.heightAt(this.pos.x, this.pos.z);
    const fx = w.heightAt(this.pos.x + Math.sin(this.yaw) * 4, this.pos.z + Math.cos(this.yaw) * 4) - w.heightAt(this.pos.x - Math.sin(this.yaw) * 4, this.pos.z - Math.cos(this.yaw) * 4);
    const sx = w.heightAt(this.pos.x + Math.cos(this.yaw) * 1.5, this.pos.z - Math.sin(this.yaw) * 1.5) - w.heightAt(this.pos.x - Math.cos(this.yaw) * 1.5, this.pos.z + Math.sin(this.yaw) * 1.5);
    this.ship.position.set(this.pos.x, y * 0.85, this.pos.z);
    this.ship.rotation.set(0, 0, 0);
    this.ship.rotateY(this.yaw);
    this.ship.rotateX(-Math.atan2(fx, 8) * 0.6);
    this.ship.rotateZ(Math.atan2(sx, 3) * 0.5);

    // tug follows its target with a little lag
    const toT = tugTarget.clone().sub(this.tugPos);
    this.tugVel.lerp(toT.multiplyScalar(1.6), Math.min(1, dt * 2.5));
    this.tugPos.addScaledVector(this.tugVel, dt);
    let dyaw = tugYawTarget - this.tugYaw;
    dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
    this.tugYaw += dyaw * Math.min(1, dt * 2);
    const ty = w.heightAt(this.tugPos.x, this.tugPos.z);
    this.tug.position.set(this.tugPos.x, ty, this.tugPos.z);
    this.tug.rotation.set(0, this.tugYaw, Math.sin(w.time * 1.7) * 0.04);

    // the hulls shove water up at their leading edge as they move: bow waves that spread into a wake
    this.pushWater(dt, this.pos, this.yaw, SHIP.L / 2, SHIP.B / 2, this.pushPrev.ship, 0.65);
    this.pushWater(dt, this.tugPos, this.tugYaw, 1.1, 0.55, this.pushPrev.tug, 0.5);

    // tow line from the tug's stern to the ship's bow while sailing
    const la = this.towLine.geometry.attributes.position.array;
    if (this.state === 'sail') {
      const bow = new THREE.Vector3(0, SHIP.deck, SHIP.L / 2 - 0.3).applyMatrix4(this.ship.matrixWorld);
      const stern = new THREE.Vector3(0, 0.4, -1.3).applyMatrix4(this.tug.matrixWorld);
      la.set([bow.x, bow.y, bow.z, stern.x, stern.y, stern.z]);
      this.towLine.visible = true;
    } else this.towLine.visible = false;
    this.towLine.geometry.attributes.position.needsUpdate = true;

    // wake
    this.wakeTimer += dt;
    for (const p of this.wakePts) p.age += dt;
    if (moving && this.wakeTimer > 0.18) {
      this.wakeTimer = 0;
      const last = this.wakePts.pop();
      const dir = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
      last.p.copy(this.pos).addScaledVector(dir, -SHIP.L / 2 + 0.4);
      last.dir.copy(dir);
      last.age = 0;
      this.wakePts.unshift(last);
    }
    const pa = this.wake.geometry.attributes.position.array;
    const aa = this.wake.geometry.attributes.alpha.array;
    for (let i = 0; i < this.wakeN; i++) {
      const pt = this.wakePts[i];
      const half = 0.9 + pt.age * 0.35;
      const sideX = pt.dir.z, sideZ = -pt.dir.x;
      const hy = w.heightAt(pt.p.x, pt.p.z) + 0.03;
      pa[i * 6] = pt.p.x + sideX * half; pa[i * 6 + 1] = hy; pa[i * 6 + 2] = pt.p.z + sideZ * half;
      pa[i * 6 + 3] = pt.p.x - sideX * half; pa[i * 6 + 4] = hy; pa[i * 6 + 5] = pt.p.z - sideZ * half;
      const a = Math.max(0, 0.32 * Math.exp(-pt.age * 0.45)) * (i === 0 ? 0 : 1);
      aa[i * 2] = a; aa[i * 2 + 1] = a;
    }
    this.wake.geometry.attributes.position.needsUpdate = true;
    this.wake.geometry.attributes.alpha.needsUpdate = true;
  }
}
