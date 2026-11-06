import * as THREE from 'three';
import { Builder } from '../geo.js';
import { C } from '../palette.js';
import { patchToy } from '../materials.js';
import { Rand } from '../rand.js';
import { LAND_Y, QX, PIER } from './layout.js';
import { floorHeight } from './base.js';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3(1, 1, 1);

/** Fish schools: each school follows a looping path; fish keep loose offsets around its centre. */
export class FishSchools {
  constructor(toy) {
    this.group = new THREE.Group();
    this.group.name = 'fish';
    const rnd = new Rand(41);
    const b = new Builder();
    b.add(new THREE.SphereGeometry(1, 8, 6), 0xffffff, { scale: [0.07, 0.09, 0.26] });
    b.add(new THREE.ConeGeometry(0.08, 0.16, 4), 0xffffff, { pos: [0, 0, -0.3], rot: [-Math.PI / 2, 0, 0], scale: [0.4, 1, 1] });
    const geo = b.build();
    const defs = [
      { n: 34, c: [-8.5, -2.0, 3.5], r: [5.5, 4.0], sp: 0.16, col: [C.fishBlue, 0x7cb4d4, 0x4f8fb8] },
      { n: 24, c: [-4.0, -1.8, -6.5], r: [4.5, 3.0], sp: -0.2, col: [C.fishGold, 0xe0bc6a, 0xc79a45] },
      { n: 22, c: [2.0, -1.1, 6.8], r: [3.0, 2.0], sp: 0.24, col: [0xb9c6c8, 0x9fb2b8, 0xd2d8d0] },
      { n: 26, c: [-14.0, -2.4, -12.0], r: [3.0, 4.5], sp: -0.14, col: [C.fishBlue, 0x6fa6c4] },
      { n: 18, c: [-12.5, -2.2, 13.0], r: [3.0, 2.2], sp: 0.2, col: [C.fishGold, 0xd9b45c] },
    ];
    const total = defs.reduce((a, d) => a + d.n, 0);
    this.mesh = new THREE.InstancedMesh(geo, toy, total);
    this.mesh.castShadow = false;
    this.fish = [];
    const col = new THREE.Color();
    let i = 0;
    for (const d of defs) {
      for (let k = 0; k < d.n; k++) {
        this.fish.push({
          d, off: new THREE.Vector3(rnd.float(-1, 1), rnd.float(-0.35, 0.35), rnd.float(-1, 1)).multiplyScalar(1.1),
          ph: rnd.float(0, 6), wob: rnd.float(0.6, 1.4), size: rnd.float(0.8, 1.25), lag: rnd.float(-0.25, 0.25),
          prev: new THREE.Vector3(),
        });
        this.mesh.setColorAt(i++, col.set(rnd.pick(d.col)));
      }
    }
    this.group.add(this.mesh);
  }

  centre(d, t, out) {
    const a = t * d.sp;
    return out.set(d.c[0] + Math.cos(a) * d.r[0], d.c[1] + Math.sin(a * 2.3) * 0.25, d.c[2] + Math.sin(a) * d.r[1] + Math.sin(a * 3.1) * 0.6);
  }

  update(time) {
    const p = new THREE.Vector3();
    const p2 = new THREE.Vector3();
    this.fish.forEach((f, i) => {
      const t = time + f.lag * 4;
      this.centre(f.d, t, p);
      this.centre(f.d, t + 0.1, p2);
      const sway = new THREE.Vector3(Math.sin(t * 0.9 * f.wob + f.ph) * 0.35, Math.sin(t * 1.3 + f.ph) * 0.12, Math.cos(t * 0.7 * f.wob + f.ph) * 0.35);
      p.add(f.off).add(sway);
      p2.add(f.off).add(sway);
      const fy = floorHeight(p.x, p.z) + 0.35;
      p.y = Math.max(p.y, fy);
      p.x = Math.min(p.x, QX - 0.5);
      const dir = _v.subVectors(p2, p);
      const yaw = Math.atan2(dir.x, dir.z) + Math.sin(time * 9 * f.wob + f.ph) * 0.18;
      _e.set(0, yaw, 0);
      _q.setFromEuler(_e);
      _s.setScalar(f.size);
      _m.compose(p, _q, _s);
      this.mesh.setMatrixAt(i, _m);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** Jellyfish: translucent bells drifting up and down. */
export class Jellies {
  constructor() {
    this.group = new THREE.Group();
    const rnd = new Rand(77);
    const mat = patchToy(new THREE.MeshStandardMaterial({ color: C.jelly, transparent: true, opacity: 0.55, roughness: 0.35, emissive: 0x2a5560, depthWrite: false }), 'jelly');
    const b = new Builder();
    b.add(new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xffffff);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.add(new THREE.CylinderGeometry(0.015, 0.005, 0.5, 3), 0xffffff, { pos: [Math.cos(a) * 0.16, -0.25, Math.sin(a) * 0.16] });
    }
    const geo = b.build();
    this.items = [];
    const spots = [[-10, -6], [-6, 9], [-15, 5], [-3, -2], [-12, -15], [0, 12], [-17, -4], [-7, 15], [3, -15], [-1, 4]];
    for (const [x, z] of spots) {
      const m = new THREE.Mesh(geo, mat);
      m.renderOrder = 0;
      this.group.add(m);
      this.items.push({ m, x, z, ph: rnd.float(0, 6), s: rnd.float(0.7, 1.2) });
    }
  }

  update(time) {
    for (const it of this.items) {
      const pulse = 1 + Math.sin(time * 2.2 + it.ph) * 0.12;
      it.m.position.set(it.x + Math.sin(time * 0.15 + it.ph) * 0.8, -2.0 + Math.sin(time * 0.5 + it.ph) * 0.7, it.z + Math.cos(time * 0.12 + it.ph) * 0.8);
      it.m.scale.set(it.s * pulse, it.s / pulse, it.s * pulse);
    }
  }
}

/** Seagulls circling the harbour with flapping wings. */
export class Gulls {
  constructor(toy) {
    this.group = new THREE.Group();
    this.group.name = 'gulls';
    const rnd = new Rand(13);
    const bodyB = new Builder();
    bodyB.add(new THREE.CapsuleGeometry(0.09, 0.32, 3, 8), C.gull, { rot: [Math.PI / 2, 0, 0] });
    bodyB.add(new THREE.SphereGeometry(0.085, 8, 6), C.gull, { pos: [0, 0.05, 0.25] });
    bodyB.add(new THREE.ConeGeometry(0.03, 0.12, 5), 0xe8b84a, { pos: [0, 0.04, 0.37], rot: [Math.PI / 2, 0, 0] });
    bodyB.add(new THREE.BoxGeometry(0.16, 0.02, 0.12), C.gullWing, { pos: [0, 0, -0.27] });
    const bodyGeo = bodyB.build();
    const wingB = new Builder();
    wingB.add(new THREE.BoxGeometry(0.42, 0.02, 0.16), C.gull, { pos: [0.21, 0, 0] });
    wingB.add(new THREE.BoxGeometry(0.16, 0.021, 0.12), C.gullWing, { pos: [0.4, 0, -0.02] });
    const wingGeo = wingB.build();
    this.birds = [];
    const routes = [
      { c: [-6, 4.5, 2], r: 9, sp: 0.18, h: 0.6 },
      { c: [-2, 5.5, -6], r: 7, sp: -0.22, h: 0.8 },
      { c: [2, 3.6, 10], r: 5, sp: 0.26, h: 0.5 },
      { c: [-10, 6.5, -2], r: 6, sp: 0.2, h: 1.0 },
      { c: [4, 7.5, -12], r: 6, sp: -0.17, h: 0.7 },
      { c: [-12, 3.2, 10], r: 4.5, sp: 0.3, h: 0.4 },
      { c: [6, 6.0, 2], r: 8, sp: 0.15, h: 0.9 },
    ];
    for (const rt of routes) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(bodyGeo, toy);
      body.castShadow = true;
      g.add(body);
      const wl = new THREE.Mesh(wingGeo, toy);
      const wr = new THREE.Mesh(wingGeo, toy);
      wl.castShadow = wr.castShadow = true;
      wr.scale.x = -1;
      g.add(wl, wr);
      g.scale.setScalar(1.25);
      this.group.add(g);
      this.birds.push({ g, wl, wr, rt, ph: rnd.float(0, 6), flap: rnd.float(6, 8) });
    }
  }

  update(time) {
    for (const b of this.birds) {
      const { rt } = b;
      const a = time * rt.sp + b.ph;
      const x = rt.c[0] + Math.cos(a) * rt.r;
      const z = rt.c[2] + Math.sin(a) * rt.r * 0.8;
      const y = rt.c[1] + Math.sin(a * 2 + b.ph) * rt.h;
      b.g.position.set(x, y, z);
      // tangent of the circle → heading; bank into the turn
      const dx = -Math.sin(a) * rt.r * Math.sign(rt.sp), dz = Math.cos(a) * rt.r * 0.8 * Math.sign(rt.sp);
      b.g.rotation.set(0, Math.atan2(dx, dz), -0.25 * Math.sign(rt.sp), 'YXZ');
      // flap in bursts, glide in between
      const burst = Math.max(0, Math.sin(time * 0.6 + b.ph));
      const f = Math.sin(time * b.flap + b.ph) * (0.15 + 0.6 * burst);
      b.wl.rotation.z = f + 0.08;
      b.wr.rotation.z = -f - 0.08;
    }
  }
}

/** Little people walking up and down the promenade, the plaza and the quay. */
export class People {
  constructor(toy) {
    this.group = new THREE.Group();
    this.group.name = 'people';
    const rnd = new Rand(19);
    const bodyGeo = new Builder().add(new THREE.CapsuleGeometry(0.075, 0.2, 3, 8), 0xffffff, { pos: [0, 0.2, 0] })
      .add(new THREE.BoxGeometry(0.05, 0.14, 0.06), 0x3a4044, { pos: [0.04, 0.05, 0] })
      .add(new THREE.BoxGeometry(0.05, 0.14, 0.06), 0x3a4044, { pos: [-0.04, 0.05, 0] }).build();
    const headGeo = new Builder().add(new THREE.SphereGeometry(0.07, 8, 6), C.skin, { pos: [0, 0.43, 0] })
      .add(new THREE.SphereGeometry(0.072, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), 0x3a2f28, { pos: [0, 0.445, -0.005] }).build();
    const paths = [];
    const seg = (x0, z0, x1, z1, n, colors) => { for (let i = 0; i < n; i++) paths.push({ a: new THREE.Vector2(x0, z0), b: new THREE.Vector2(x1, z1), colors }); };
    seg(9.9, -3.0, 9.9, 19.4, 4, C.person);
    seg(10.9, -2.5, 10.9, 19.0, 5, C.person);
    seg(12.3, 1.2, 12.3, 13.2, 4, C.person);
    seg(11.8, 3.2, 12.8, 12.0, 3, C.person);
    seg(12.8, 14.8, 18.5, 14.8, 3, C.person);
    seg(12.4, -2.6, 17.0, -2.6, 2, C.person);
    seg(9.7, -18.5, 9.7, -5.0, 3, [0xe08a3a, 0xe8c24a]);
    seg(13.2, -18.0, 13.2, -5.0, 2, [0xe08a3a, 0xe8c24a]);
    seg(0.0, PIER.z - 0.3, 7.5, PIER.z + 0.3, 3, C.person);
    this.n = paths.length;
    this.body = new THREE.InstancedMesh(bodyGeo, toy, this.n);
    this.head = new THREE.InstancedMesh(headGeo, toy, this.n);
    this.body.castShadow = this.head.castShadow = true;
    const col = new THREE.Color();
    this.walkers = paths.map((p, i) => {
      this.body.setColorAt(i, col.set(rnd.pick(p.colors)));
      this.head.setColorAt(i, col.set(0xffffff));
      const len = p.a.distanceTo(p.b);
      return { ...p, len, u: rnd.float(0, 1), dir: rnd.chance(0.5) ? 1 : -1, sp: rnd.float(0.25, 0.45) / Math.max(len, 1), side: rnd.float(-0.25, 0.25), pause: 0, ph: rnd.float(0, 6) };
    });
    this.group.add(this.body, this.head);
  }

  update(dt, time) {
    this.walkers.forEach((w, i) => {
      if (w.pause > 0) w.pause -= dt;
      else {
        w.u += w.dir * w.sp * dt;
        if (w.u > 1 || w.u < 0) { w.u = THREE.MathUtils.clamp(w.u, 0, 1); w.dir *= -1; w.pause = 1 + (i % 3); }
      }
      const x = THREE.MathUtils.lerp(w.a.x, w.b.x, w.u);
      const z = THREE.MathUtils.lerp(w.a.y, w.b.y, w.u);
      const dx = (w.b.x - w.a.x) * w.dir, dz = (w.b.y - w.a.y) * w.dir;
      const nx = -dz / w.len, nz = dx / w.len;
      const onPier = Math.abs(z - PIER.z) < 1 && x < QX;
      const y = (onPier ? PIER.y + 0.08 : LAND_Y) + (w.pause > 0 ? 0 : Math.abs(Math.sin(time * 9 + w.ph)) * 0.03);
      _q.setFromEuler(_e.set(0, Math.atan2(dx, dz), 0));
      _s.setScalar(1.15);
      _m.compose(_v.set(x + nx * w.side, y, z + nz * w.side), _q, _s);
      this.body.setMatrixAt(i, _m);
      this.head.setMatrixAt(i, _m);
    });
    this.body.instanceMatrix.needsUpdate = true;
    this.head.instanceMatrix.needsUpdate = true;
  }
}

/** Sakura petals drifting down over the town. */
export class Petals {
  constructor() {
    this.n = 220;
    const rnd = new Rand(3);
    this.rnd = rnd;
    const geo = new THREE.PlaneGeometry(0.09, 0.065);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf6c9d0, side: THREE.DoubleSide });
    this.mesh = new THREE.InstancedMesh(geo, mat, this.n);
    this.p = Array.from({ length: this.n }, () => this.spawn({}, true));
    this.mesh.frustumCulled = false;
  }

  spawn(p, initial = false) {
    const r = this.rnd;
    p.x = r.float(10.5, 19.8);
    p.z = r.float(-3.5, 19.8);
    p.y = initial ? r.float(LAND_Y, LAND_Y + 4) : LAND_Y + r.float(2.5, 4);
    p.vy = r.float(0.25, 0.45);
    p.ph = r.float(0, 6);
    p.spin = r.float(1, 3);
    p.drift = r.float(0.2, 0.5);
    return p;
  }

  update(dt, time) {
    this.p.forEach((p, i) => {
      p.y -= p.vy * dt;
      p.x -= p.drift * dt * 0.6;
      p.z += Math.sin(time * 0.8 + p.ph) * dt * 0.3;
      if (p.y < LAND_Y + 0.02 || p.x < 9.2 && p.y < 0.2) this.spawn(p);
      _e.set(time * p.spin + p.ph, time * p.spin * 0.7, p.ph);
      _q.setFromEuler(_e);
      _m.compose(_v.set(p.x + Math.sin(time * 1.3 + p.ph) * 0.2, p.y, p.z), _q, _s.setScalar(1));
      this.mesh.setMatrixAt(i, _m);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
