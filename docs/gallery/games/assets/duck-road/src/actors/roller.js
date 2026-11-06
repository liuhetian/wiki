import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Builder } from '../geo.js';
import { C } from '../palette.js';
import { Duck } from './duck.js';

const DRUM_R = 1.25;
const DRUM_LEN = 5.4;
const WHEEL_R = 1.3;
const WHEELBASE = 6.0; // drum axle to rear axle

/**
 * Road roller. Local +Z is forward; the origin is on the ground under the drum axle, so
 * `s` (the roller's arc length on the road) is where the drum touches the paper.
 */
export class Roller {
  constructor(toyMat, scene) {
    this.scene = scene;
    this.object = new THREE.Group();
    this.chassis = new THREE.Group(); // gets a little engine shake
    this.object.add(this.chassis);
    this.s = 0;
    this.speed = 0;

    this.chassis.add(this.mesh(this.buildBody(), toyMat));

    this.drum = this.mesh(this.buildDrum(), toyMat);
    this.drum.position.set(0, DRUM_R, 0);
    this.object.add(this.drum);

    this.wheels = [1, -1].map((sx) => {
      const w = this.mesh(this.buildWheel(sx), toyMat);
      w.position.set(sx * 1.85, WHEEL_R, -WHEELBASE);
      this.object.add(w);
      return w;
    });

    this.driver = new Duck(toyMat, { scale: 1.1, hat: true });
    this.driver.object.position.set(0.15, 2.22, -4.45);
    this.chassis.add(this.driver.object);

    this.chimneyTop = new THREE.Vector3(-0.55, 4.05, -2.95);
    this.puffs = this.buildPuffs(scene);
    this.puffTimer = 0;

    // seats where the ducklings ride, in roller space
    this.seats = [
      [-1.9, 2.5, 0.15], [-0.65, 2.5, -0.05], [0.65, 2.5, 0.1], [1.9, 2.5, -0.05],
      [0.75, 5.33, -5.0], [-0.6, 5.33, -6.0],
    ].map((p) => new THREE.Vector3(...p));
  }

  mesh(geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.roller = this;
    return m;
  }

  get pickables() { return [this.drum, ...this.wheels, this.chassis.children[0]]; }

  buildBody() {
    const b = new Builder();
    const rb = (w, h, d, r = 0.16) => new RoundedBoxGeometry(w, h, d, 3, r);
    // chassis, trim, underside
    b.add(rb(3.0, 1.05, 4.5), C.red, { pos: [0, 1.3, -4.85] });
    b.add(new THREE.BoxGeometry(3.08, 0.13, 4.58), C.white, { pos: [0, 0.86, -4.85] });
    b.add(new THREE.BoxGeometry(2.3, 0.5, 4.0), C.black, { pos: [0, 0.6, -4.85] });
    // engine block with vents and a white rim
    b.add(rb(2.6, 0.95, 1.7, 0.22), C.red, { pos: [0.1, 2.25, -3.25] });
    b.add(new THREE.BoxGeometry(2.66, 0.1, 1.76), C.white, { pos: [0.1, 1.8, -3.25] });
    for (let i = 0; i < 4; i++) b.add(new THREE.BoxGeometry(0.06, 0.42, 0.11), C.black, { pos: [-1.2, 2.25, -2.75 - i * 0.3] });
    for (let i = 0; i < 4; i++) b.add(new THREE.BoxGeometry(0.06, 0.42, 0.11), C.black, { pos: [1.4, 2.25, -2.75 - i * 0.3] });
    // chimney: black stack, yellow band, red cap
    b.add(new THREE.CylinderGeometry(0.27, 0.29, 1.35, 16), C.black, { pos: [-0.55, 3.25, -2.95] });
    b.add(new THREE.CylinderGeometry(0.3, 0.3, 0.17, 16), C.hub, { pos: [-0.55, 3.45, -2.95] });
    b.add(new THREE.CylinderGeometry(0.38, 0.33, 0.24, 16), C.red, { pos: [-0.55, 3.98, -2.95] });
    // seat and steering
    b.add(rb(1.7, 0.45, 1.3, 0.12), C.redDark, { pos: [0.15, 2.0, -4.7] });
    b.add(rb(1.7, 1.0, 0.25, 0.1), C.redDark, { pos: [0.15, 2.45, -5.45] });
    b.add(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), C.black, { pos: [0.15, 2.45, -3.75], rot: [-0.5, 0, 0] });
    b.add(new THREE.TorusGeometry(0.3, 0.035, 8, 24), C.black, { pos: [0.15, 2.88, -3.95], rot: [-1.1, 0, 0] });
    // water tank across the back, yellow with a blue band
    b.add(new THREE.CylinderGeometry(0.62, 0.62, 2.4, 22), C.hub, { pos: [0.1, 2.55, -6.75], rot: [0, 0, Math.PI / 2], pattern: 6 });
    b.add(new THREE.CylinderGeometry(0.635, 0.635, 0.8, 22), C.drum, { pos: [0.1, 2.55, -6.75], rot: [0, 0, Math.PI / 2] });
    // canopy: four thin poles, white rim with red bulbs, dotted orange roof and a knob
    for (const [x, z] of [[1.3, -4.05], [-1.3, -4.05], [1.3, -6.9], [-1.3, -6.9]]) {
      b.add(new THREE.CylinderGeometry(0.05, 0.05, 3.3, 8), C.black, { pos: [x, 3.47, z] });
    }
    b.add(new THREE.BoxGeometry(3.25, 0.12, 3.55), C.white, { pos: [0, 5.11, -5.47] });
    b.add(new THREE.BoxGeometry(3.05, 0.18, 3.35), C.canopy, { pos: [0, 5.23, -5.47], pattern: 1 });
    b.add(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 16), C.cream, { pos: [0, 5.39, -5.47] });
    for (let i = 0; i <= 6; i++) {
      const t = -1.55 + (i / 6) * 3.1;
      for (const z of [-3.73, -7.21]) b.add(new THREE.SphereGeometry(0.07, 8, 6), C.red, { pos: [t, 4.99, z] });
    }
    for (let i = 1; i < 6; i++) {
      const z = -3.73 - (i / 6) * 3.48;
      for (const x of [1.6, -1.6]) b.add(new THREE.SphereGeometry(0.07, 8, 6), C.red, { pos: [x, 4.99, z] });
    }
    // yoke: arms from the body to the drum axle, a cross beam, hazard plates
    for (const sx of [1, -1]) {
      b.add(rb(0.34, 0.34, 2.9, 0.06), C.red, { pos: [sx * 2.98, DRUM_R, -1.3] });
      for (let i = 0; i < 4; i++) b.add(new THREE.SphereGeometry(0.05, 6, 4), C.white, { pos: [sx * 3.16, DRUM_R + 0.05, -0.4 - i * 0.6] });
      const from = new THREE.Vector3(sx * 2.6, 2.4, -2.5);
      const to = new THREE.Vector3(sx * 2.82, 1.62, 0.15);
      const mid = from.clone().add(to).multiplyScalar(0.5);
      const len = from.distanceTo(to);
      const pitch = Math.atan2(from.y - to.y, to.z - from.z);
      b.add(new THREE.BoxGeometry(0.5, 0.07, len), C.hazard, { pos: [mid.x, mid.y, mid.z], rot: [pitch, 0, 0], pattern: 7 });
      b.add(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 10), C.red, { pos: [sx * 2.2, 2.3, -2.6], rot: [0, 0, Math.PI / 2] });
    }
    b.add(rb(6.3, 0.34, 0.4, 0.06), C.red, { pos: [0, DRUM_R + 0.1, -2.55] });
    // hoses
    const hose = (pts) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 24, 0.055, 6);
    b.add(hose([[-1.2, 2.5, -2.6], [-1.75, 2.2, -3.4], [-1.6, 1.5, -4.6], [-1.55, 1.2, -5.6]]), C.black);
    b.add(hose([[0.9, 2.7, -2.5], [1.6, 2.3, -2.0], [2.4, 1.7, -1.6], [2.85, 1.45, -1.0]]), C.black);
    b.add(hose([[-0.55, 2.6, -3.1], [-1.0, 2.0, -4.0], [-0.9, 2.2, -6.2]]), C.black);
    // rear fenders: arcs over the wheels
    for (const sx of [1, -1]) {
      const sh = new THREE.Shape();
      sh.absarc(0, 0, 1.58, 0, Math.PI, false);
      sh.absarc(0, 0, 1.42, Math.PI, 0, true);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.9, bevelEnabled: false, curveSegments: 20 });
      g.translate(0, 0, -0.45);
      b.add(g, C.red, { pos: [sx * 1.85, WHEEL_R, -WHEELBASE], rot: [0, Math.PI / 2, 0] });
    }
    return b.build();
  }

  buildDrum() {
    const b = new Builder();
    b.add(new THREE.CylinderGeometry(DRUM_R, DRUM_R, DRUM_LEN, 40, 1, true), C.drum, { rot: [0, 0, Math.PI / 2] });
    for (const sx of [1, -1]) {
      const x = sx * (DRUM_LEN / 2 + 0.05);
      b.add(new THREE.CylinderGeometry(DRUM_R + 0.03, DRUM_R + 0.03, 0.14, 40), C.cream, { pos: [x, 0, 0], rot: [0, 0, Math.PI / 2] });
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const pos = [x + sx * 0.08, Math.cos(a) * 0.95, Math.sin(a) * 0.95];
        if (i % 2) b.add(new THREE.SphereGeometry(0.045, 6, 4), C.black, { pos });
        else b.add(new THREE.BoxGeometry(0.02, 0.05, 0.22), C.drum, { pos, rot: [a, 0, 0] });
      }
      b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 24), C.hub, { pos: [x + sx * 0.13, 0, 0], rot: [0, 0, Math.PI / 2] });
      b.add(new THREE.CylinderGeometry(0.17, 0.17, 0.24, 16), C.black, { pos: [x + sx * 0.2, 0, 0], rot: [0, 0, Math.PI / 2] });
    }
    // a seam line so the rolling reads
    b.add(new THREE.BoxGeometry(DRUM_LEN - 0.1, 0.03, 0.06), 0x34419a, { pos: [0, DRUM_R, 0] });
    return b.build();
  }

  buildWheel(sx) {
    const b = new Builder();
    b.add(new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.75, 32), C.tire, { rot: [0, 0, Math.PI / 2] });
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      b.add(new THREE.BoxGeometry(0.7, 0.12, 0.2), C.tire, { pos: [0, Math.cos(a) * (WHEEL_R + 0.04), Math.sin(a) * (WHEEL_R + 0.04)], rot: [a, 0, 0] });
    }
    const x = sx * 0.39;
    b.add(new THREE.CylinderGeometry(0.66, 0.66, 0.06, 28), C.hub, { pos: [x, 0, 0], rot: [0, 0, Math.PI / 2] });
    b.add(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 18), C.black, { pos: [x + sx * 0.04, 0, 0], rot: [0, 0, Math.PI / 2] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.add(new THREE.SphereGeometry(0.05, 6, 4), C.white, { pos: [x + sx * 0.04, Math.cos(a) * 0.45, Math.sin(a) * 0.45] });
    }
    return b.build();
  }

  buildPuffs(scene) {
    const b = new Builder();
    b.add(new THREE.IcosahedronGeometry(0.42, 2), 0xffffff, { pos: [0, 0, 0], pattern: 6 });
    b.add(new THREE.IcosahedronGeometry(0.32, 2), 0xffffff, { pos: [0.36, -0.06, 0.1], pattern: 6 });
    b.add(new THREE.IcosahedronGeometry(0.3, 2), 0xffffff, { pos: [-0.3, -0.04, -0.12], pattern: 6 });
    b.add(new THREE.IcosahedronGeometry(0.28, 2), 0xffffff, { pos: [0.05, 0.28, -0.05], pattern: 6 });
    const geo = b.build();
    const puffs = [];
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 1, transparent: true, opacity: 0 });
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.visible = false;
      scene.add(m);
      puffs.push({ m, life: 0, age: 1, vel: new THREE.Vector3() });
    }
    return puffs;
  }

  emitPuff() {
    const p = this.puffs.find((q) => q.age >= q.life) ?? this.puffs[0];
    p.m.position.copy(this.object.localToWorld(this.chimneyTop.clone()));
    p.vel.set((Math.random() - 0.5) * 0.4, 1.6 + Math.random() * 0.5, (Math.random() - 0.5) * 0.4);
    p.life = 1.9 + Math.random() * 0.5;
    p.age = 0;
    p.spin = (Math.random() - 0.5) * 1.5;
    p.m.visible = true;
  }

  /** Put the roller at arc length s: drum on the road, rear wheels following the curve. */
  place(path, s) {
    const ds = s - this.s;
    this.s = s;
    const front = path.toWorld(s, 0);
    const rear = path.toWorld(Math.max(0, s - WHEELBASE), 0);
    this.object.position.copy(front);
    this.object.rotation.y = Math.atan2(front.x - rear.x, front.z - rear.z);
    this.drum.rotation.x += ds / DRUM_R;
    for (const w of this.wheels) w.rotation.x += ds / WHEEL_R;
  }

  update(dt, t, moving) {
    this.chassis.position.y = moving ? Math.abs(Math.sin(t * 22)) * 0.025 : Math.abs(Math.sin(t * 9)) * 0.008;
    this.driver.update(dt, t);
    this.puffTimer -= dt;
    if (this.puffTimer <= 0) {
      this.emitPuff();
      this.puffTimer = moving ? 0.28 : 1.1;
    }
    for (const p of this.puffs) {
      if (p.age >= p.life) { p.m.visible = false; continue; }
      p.age += dt;
      const k = Math.min(1, p.age / p.life);
      p.m.position.addScaledVector(p.vel, dt);
      p.vel.multiplyScalar(1 - dt * 0.6);
      p.m.rotation.y += p.spin * dt;
      const sc = 0.45 + k * 1.3;
      p.m.scale.setScalar(sc);
      p.m.material.opacity = k < 0.1 ? k * 9 : Math.max(0, 0.95 * (1 - (k - 0.1) / 0.9) ** 1.5);
    }
  }

  seatWorld(i, out = new THREE.Vector3()) {
    return this.object.localToWorld(out.copy(this.seats[i % this.seats.length]));
  }
}

export const ROLLER = { DRUM_R, WHEELBASE };
