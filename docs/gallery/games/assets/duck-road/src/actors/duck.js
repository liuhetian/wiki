import * as THREE from 'three';
import gsap from 'gsap';
import { Builder } from '../geo.js';
import { C } from '../palette.js';

/**
 * A felt duckling. `object` is placed in the world (feet at y = 0, facing local +Z); `body` takes
 * the squash, bob and waddle; the wings flap from shoulder pivots.
 */
export class Duck {
  /** Geometry is shared by every duck of the same colour and hat (ducks come and go with the road). */
  static geometry(color, hat) {
    const key = `${color}-${hat}`;
    Duck.cache ??= new Map();
    if (Duck.cache.has(key)) return Duck.cache.get(key);
    const b = new Builder();
    b.add(new THREE.SphereGeometry(0.45, 24, 16), color, { pos: [0, 0.5, 0], scale: [0.95, 0.82, 1.12], pattern: 6 });
    b.add(new THREE.ConeGeometry(0.17, 0.36, 10), color, { pos: [0, 0.74, -0.5], rot: [-1.05, 0, 0], pattern: 6 });
    b.add(new THREE.SphereGeometry(0.32, 22, 16), color, { pos: [0, 1.02, 0.24], pattern: 6 });
    b.add(new THREE.ConeGeometry(0.05, 0.18, 6), color, { pos: [0, 1.38, 0.18], rot: [-0.3, 0, 0] });
    b.add(new THREE.SphereGeometry(0.17, 14, 10), C.beak, { pos: [0, 0.95, 0.56], scale: [1.15, 0.42, 1.3] });
    for (const sx of [1, -1]) {
      b.add(new THREE.SphereGeometry(0.045, 8, 6), C.black, { pos: [sx * 0.17, 1.1, 0.49] });
      b.add(new THREE.SphereGeometry(0.13, 10, 8), C.beak, { pos: [sx * 0.17, 0.03, 0.12], scale: [1, 0.3, 1.4] });
    }
    if (hat) {
      b.add(new THREE.SphereGeometry(0.35, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), C.white, { pos: [0, 1.18, 0.22] });
      b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 20), C.white, { pos: [0, 1.18, 0.27] });
      b.add(new THREE.CylinderGeometry(0.355, 0.355, 0.08, 20), C.red, { pos: [0, 1.24, 0.22] });
      b.add(new THREE.SphereGeometry(0.09, 10, 8), C.white, { pos: [0, 1.53, 0.22] });
    }
    const wing = new Builder().add(new THREE.SphereGeometry(0.3, 14, 10), color, { pos: [0, -0.16, -0.06], scale: [0.3, 0.62, 1.0], pattern: 6 }).build();
    const g = { body: b.build(), wing };
    Duck.cache.set(key, g);
    return g;
  }

  constructor(toyMat, { scale = 1, color = C.duck, hat = false } = {}) {
    this.object = new THREE.Group();
    this.body = new THREE.Group();
    this.object.add(this.body);
    this.object.scale.setScalar(scale);
    this.scaleBase = scale;

    const geos = Duck.geometry(color, hat);
    this.mesh = new THREE.Mesh(geos.body, toyMat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.body.add(this.mesh);

    const wg = geos.wing;
    this.wings = [1, -1].map((sx) => {
      const pivot = new THREE.Group();
      pivot.position.set(sx * 0.4, 0.74, 0);
      const w = new THREE.Mesh(wg, toyMat);
      w.castShadow = true;
      pivot.add(w);
      pivot.userData.side = sx;
      this.body.add(pivot);
      return pivot;
    });

    this.object.traverse((o) => { o.userData.duck = this; });
    this.mode = 'idle'; // idle | walk | fly | sit
    this.phase = Math.random() * 10;
    this.flap = 0; // 0..1 flapping strength
    this.busy = false;
  }

  get pickables() { return [this.mesh, ...this.wings.map((w) => w.children[0])]; }

  update(dt, t) {
    const tt = t + this.phase;
    const B = this.body;
    if (this.mode === 'walk') {
      B.rotation.z = Math.sin(tt * 11) * 0.16;
      B.position.y = Math.abs(Math.sin(tt * 11)) * 0.08;
      B.rotation.x = 0.05;
    } else if (this.mode === 'fly') {
      B.rotation.z *= 0.9;
      B.rotation.x = -0.15;
    } else if (!this.busy) {
      B.rotation.z *= 0.85;
      B.rotation.x *= 0.85;
      B.position.y = Math.max(0, Math.sin(tt * 2.2) * 0.015);
      B.rotation.y = Math.sin(tt * 0.7) * 0.12;
    }
    const target = this.mode === 'fly' ? 1 : this.flapping ? 1 : 0;
    this.flap += (target - this.flap) * Math.min(1, dt * 10);
    const a = 0.12 + this.flap * (0.7 + 0.6 * Math.sin(tt * 34));
    for (const w of this.wings) w.rotation.z = w.userData.side * a;
  }

  /** Squash, jump in place, flap: the reaction to a click. */
  hop(height = 0.9) {
    if (this.busy) return null;
    this.busy = true;
    this.flapping = true;
    const B = this.body;
    const tl = gsap.timeline({ onComplete: () => { this.busy = false; this.flapping = false; } });
    tl.to(B.scale, { x: 1.15, y: 0.75, z: 1.15, duration: 0.09, ease: 'power2.out' })
      .to(B.scale, { x: 0.92, y: 1.12, z: 0.92, duration: 0.12 })
      .to(B.position, { y: height, duration: 0.24, ease: 'power2.out' }, '<')
      .to(B.position, { y: 0, duration: 0.24, ease: 'power2.in' })
      .to(B.scale, { x: 1.18, y: 0.78, z: 1.18, duration: 0.07 })
      .to(B.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    return tl;
  }

  dispose() {
    gsap.killTweensOf(this.body.scale);
    gsap.killTweensOf(this.body.position);
    gsap.killTweensOf(this.object.rotation);
    this.object.removeFromParent();
  }

  reset() {
    gsap.killTweensOf(this.body.scale);
    gsap.killTweensOf(this.body.position);
    this.body.scale.set(1, 1, 1);
    this.body.position.set(0, 0, 0);
    this.body.rotation.set(0, 0, 0);
    this.busy = false;
    this.flapping = false;
    this.mode = 'idle';
  }
}
