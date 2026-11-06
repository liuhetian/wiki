import * as THREE from 'three';
import { shared } from '../materials.js';
import { WATER, LIGHTHOUSE, PIER } from './layout.js';
import { SHIP } from './ship.js';
import { SURGE, SURGE_DIRS, surgeLife, surgeFront, surgeEnvelope, surgeShelter, waves } from './waves.js';

const SLOT = 0.5; // spacing of the points along the crest that check for something to slam into
const MAX_DROPS = 700;
const GRAVITY = 9.8;

/**
 * Big waves (double-click): launches them from a wall, and when a crest reaches something standing in
 * the water (the far wall, the breakwater and lighthouse base, a ship) throws spray up there, roughs up
 * the simulated water along the impact and, at the far wall, gives the whole jelly a shove.
 */
export class Surges {
  constructor(water, ship) {
    this.water = water;
    this.ship = ship;
    this.uniforms = shared.uSurge.value;
    this.next = 0;
    // points along the crest: across z for waves from the west, across x for the north / south ones
    this.slots = [
      Array.from({ length: Math.floor((WATER.z1 - WATER.z0) / SLOT) }, (_, k) => WATER.z0 + (k + 0.5) * SLOT),
      Array.from({ length: Math.floor((WATER.x1 - WATER.x0) / SLOT) }, (_, k) => WATER.x0 + (k + 0.5) * SLOT),
    ];
    // per surge: crest position last frame, whether it has hit the far wall yet
    this.track = this.uniforms.map(() => ({ prevFront: -1e9, hit: false }));
    this.onHit = null;

    // spray: little white drops flying ballistically, shrinking as they fall back
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf2fbf7 });
    this.drops = new THREE.InstancedMesh(geo, mat, MAX_DROPS);
    this.drops.frustumCulled = false;
    this.drops.count = 0;
    this.drops.layers.set(1); // drawn with the water surface, after the refraction copy
    this.pos = new Float32Array(MAX_DROPS * 3);
    this.vel = new Float32Array(MAX_DROPS * 3);
    this.age = new Float32Array(MAX_DROPS);
    this.life = new Float32Array(MAX_DROPS);
    this.size = new Float32Array(MAX_DROPS);
    this.n = 0;
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._p = new THREE.Vector3();
    this._s = new THREE.Vector3();
  }

  get active() {
    let k = 0;
    for (const u of this.uniforms) if (this.water.time - u.x < u.w) k++;
    return k;
  }

  /** dir: 0 from the west wall, 1 from the north wall, 2 from the south wall. */
  launch(dir = 0, amp = SURGE.amp) {
    const u = this.uniforms[this.next];
    u.set(this.water.time, amp, dir, surgeLife(dir));
    this.track[this.next] = { prevFront: -1e9, hit: false };
    this.next = (this.next + 1) % this.uniforms.length;
  }

  /**
   * How far along its way (see SURGE_DIRS) a crest gets at cross position c before it meets
   * something: a ship, the breakwater / lighthouse base, or else the far wall.
   */
  hitAlong(dir, c) {
    let a = SURGE_DIRS[dir].far;
    const s = this.ship;
    const shipAlongZ = Math.abs(Math.sin(s.yaw)) < 0.35;
    const shipAlongX = Math.abs(Math.cos(s.yaw)) < 0.35;
    if (dir === 0) {
      const dz = c - LIGHTHOUSE.z;
      if (Math.abs(dz) < 1.5) a = Math.min(a, LIGHTHOUSE.x - Math.sqrt(2.25 - dz * dz));
      if (shipAlongZ && Math.abs(c - s.pos.z) < SHIP.L / 2 - 0.8) a = Math.min(a, s.pos.x - SHIP.B / 2);
      if (shipAlongX && Math.abs(c - s.pos.z) < SHIP.B / 2 - 0.3) a = Math.min(a, s.pos.x - SHIP.L / 2);
    } else {
      const sg = dir === 1 ? 1 : -1; // along = sg * z
      const dx = c - LIGHTHOUSE.x;
      if (Math.abs(dx) < 1.5) a = Math.min(a, sg * (LIGHTHOUSE.z - sg * Math.sqrt(2.25 - dx * dx)));
      else if (c > PIER.x0 - 0.9) a = Math.min(a, sg * (PIER.z - sg * 1.0));
      if (shipAlongZ && Math.abs(c - s.pos.x) < SHIP.B / 2 - 0.3) a = Math.min(a, sg * (s.pos.z - sg * SHIP.L / 2));
      if (shipAlongX && Math.abs(c - s.pos.x) < SHIP.L / 2 - 0.8) a = Math.min(a, sg * (s.pos.z - sg * SHIP.B / 2));
    }
    return a;
  }

  spawn(x, y, z, strength, dx, dz) {
    for (let k = 0; k < 4; k++) {
      if (this.n >= MAX_DROPS) return;
      const i = this.n++;
      const r = Math.random() * 0.3, t = (Math.random() - 0.5) * SLOT;
      this.pos[i * 3] = x - dx * r + dz * t;
      this.pos[i * 3 + 1] = y + Math.random() * 0.2;
      this.pos[i * 3 + 2] = z - dz * r + dx * t;
      // thrown back the way the wave came, and up
      const back = (0.4 + Math.random() * 2.2) * strength, side = (Math.random() - 0.5) * 1.4;
      this.vel[i * 3] = -dx * back + dz * side;
      this.vel[i * 3 + 1] = (2.6 + Math.random() * 3.2) * strength;
      this.vel[i * 3 + 2] = -dz * back + dx * side;
      this.age[i] = 0;
      this.life[i] = 0.9 + Math.random() * 0.7;
      this.size[i] = 0.07 + Math.random() * 0.11;
    }
  }

  update(dt) {
    const time = this.water.time;
    for (let j = 0; j < this.uniforms.length; j++) {
      const u = this.uniforms[j];
      const age = time - u.x;
      const tr = this.track[j];
      if (age < 0 || age > u.w) continue;
      const dir = Math.round(u.z);
      const { dx, dz, far } = SURGE_DIRS[dir];
      const f = surgeFront(age);
      // only the outgoing crest slams into things (the echo is too small to bother)
      if (f < far + 0.5) {
        const base = (u.y / SURGE.amp) * surgeEnvelope(age, u.w);
        for (const c of this.slots[dir === 0 ? 0 : 1]) {
          const ha = this.hitAlong(dir, c) - 0.35;
          if (!(tr.prevFront < ha && f >= ha)) continue;
          const x = dir === 0 ? ha : c;
          const z = dir === 0 ? c : dir === 1 ? ha : -ha;
          const strength = base * surgeShelter(x, ha, dir);
          if (strength < 0.15) continue;
          this.spawn(x, this.water.heightAt(x, z), z, strength, dx, dz);
          // the impact breaks the water up: uneven kicks along the wall become choppy local waves
          waves.impulse(x - dx * 0.5, z - dz * 0.5, -(0.5 + Math.random() * 1.1) * strength, 0.7);
          if (!tr.hit && ha > far - 1) {
            tr.hit = true;
            this.water.kick(0.075 * strength * dx, 0.075 * strength * dz);
            this.onHit?.(strength);
          }
        }
      }
      tr.prevFront = f;
    }

    // drops
    let w = 0;
    for (let i = 0; i < this.n; i++) {
      const a = this.age[i] + dt;
      if (a > this.life[i]) continue;
      const vy = this.vel[i * 3 + 1] - GRAVITY * dt;
      const x = this.pos[i * 3] + this.vel[i * 3] * dt;
      const y = this.pos[i * 3 + 1] + vy * dt;
      const z = this.pos[i * 3 + 2] + this.vel[i * 3 + 2] * dt;
      if (vy < 0 && y < this.water.heightAt(x, z) - 0.05) continue; // fell back in
      this.pos[w * 3] = x; this.pos[w * 3 + 1] = y; this.pos[w * 3 + 2] = z;
      this.vel[w * 3] = this.vel[i * 3]; this.vel[w * 3 + 1] = vy; this.vel[w * 3 + 2] = this.vel[i * 3 + 2];
      this.age[w] = a; this.life[w] = this.life[i]; this.size[w] = this.size[i];
      const sc = this.size[w] * (1 - 0.6 * (a / this.life[w]));
      this._e.set(a * 7 + w, a * 5, 0);
      this._m.compose(this._p.set(x, y, z), this._q.setFromEuler(this._e), this._s.set(sc, sc * 1.3, sc));
      this.drops.setMatrixAt(w, this._m);
      w++;
    }
    this.n = w;
    this.drops.count = w;
    this.drops.instanceMatrix.needsUpdate = true;
  }
}
