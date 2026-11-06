import * as THREE from 'three';
import gsap from 'gsap';
import { C } from '../palette.js';
import { ROAD } from '../world/roadPath.js';
import { Duck } from './duck.js';

const N = 6;

/**
 * The ducklings' little story:
 *   waiting   queued on the pencilled crosswalk; the roller has to stop in front of them
 *   boarding  startled, they flap up onto the drum and the canopy
 *   riding    carried along while the crosswalk is paved
 *   landing   hop down onto the new white stripes once the light is green
 *   crossing  waddle across the road and into the yard of 「家」
 *   home      idle in the front yard
 */
export class Flock {
  constructor({ scene, toyMat, path, roller, crossS, homeYard, homeFacing, light, sfx, onState }) {
    this.scene = scene;
    this.path = path;
    this.roller = roller;
    this.crossS = crossS;
    this.homeYard = homeYard;
    this.homeFacing = homeFacing;
    this.light = light;
    this.sfx = sfx;
    this.onState = onState;
    this.stopS = crossS - 5.4; // drum stops just short of the first duck
    this.ducks = [];
    for (let i = 0; i < N; i++) {
      const small = i === N - 1;
      const d = new Duck(toyMat, { scale: small ? 0.72 : 0.92, color: small ? C.duckPale : C.duck });
      scene.add(d.object);
      this.ducks.push(d);
    }
    this.flights = [];
    this.calls = [];
    this.reset();
  }

  /** gsap.delayedCall that reset() and dispose() can cancel. */
  later(delay, fn) {
    this.calls.push(gsap.delayedCall(delay, fn));
  }

  killCalls() {
    for (const c of this.calls) c.kill();
    this.calls.length = 0;
  }

  set(state) {
    const prev = this.state;
    this.state = state;
    this.onState?.(state, prev);
  }

  /** How far the roller may go right now. */
  limit() {
    return this.state === 'waiting' || this.state === 'boarding' ? this.stopS : Infinity;
  }

  queuePos(i, out = new THREE.Vector3()) {
    // two loose columns on the crosswalk, heading toward the + side
    const col = i % 2;
    const row = Math.floor(i / 2);
    const s = this.crossS + (col ? 0.55 : -0.5);
    const d = -2.6 + row * 1.35 + (col ? 0.5 : 0);
    return this.path.toWorld(s, d, out);
  }

  facingAcross() {
    const f = this.path.frame(this.crossS);
    return Math.atan2(f.nx, f.nz); // toward +d
  }

  reset() {
    this.killCalls();
    this.flights.length = 0;
    const face = this.facingAcross();
    this.ducks.forEach((d, i) => {
      d.reset();
      this.scene.attach(d.object);
      this.queuePos(i, d.object.position);
      d.object.position.y = 0.02;
      d.object.rotation.set(0, face + (Math.random() - 0.5) * 0.3, 0);
    });
    this.light?.reset();
    this.set('waiting');
  }

  /** Arc from the duck's current world position to a target given by a function (it may move). */
  fly(d, targetFn, { delay = 0, dur = 1.0, height = 3, onDone }) {
    this.flights.push({ d, targetFn, delay, dur, height, t: 0, from: null, onDone });
  }

  update(dt, t, rollerS) {
    for (const d of this.ducks) d.update(dt, t);

    // flights in progress
    for (let k = this.flights.length - 1; k >= 0; k--) {
      const f = this.flights[k];
      if (f.delay > 0) { f.delay -= dt; continue; }
      if (!f.from) {
        this.scene.attach(f.d.object);
        f.from = f.d.object.position.clone();
        f.d.mode = 'fly';
        this.sfx?.quack(f.d.scaleBase < 0.8 ? 1.4 : 1 + Math.random() * 0.15);
      }
      f.t += dt / f.dur;
      const e = Math.min(1, f.t);
      const ee = e < 0.5 ? 2 * e * e : 1 - (-2 * e + 2) ** 2 / 2;
      const to = f.targetFn();
      const p = f.d.object.position.lerpVectors(f.from, to, ee);
      p.y += f.height * 4 * e * (1 - e);
      const dx = to.x - f.from.x;
      const dz = to.z - f.from.z;
      if (Math.hypot(dx, dz) > 0.3) f.d.object.rotation.y = Math.atan2(dx, dz);
      if (e >= 1) {
        f.d.mode = 'idle';
        this.flights.splice(k, 1);
        f.onDone?.();
      }
    }

    if (this.state === 'waiting' && rollerS >= this.stopS - 0.05) this.board();
    if (this.state === 'riding' && rollerS >= this.crossS + 14) this.land();
    if (this.state === 'crossing') this.walk(dt);
  }

  board() {
    this.set('boarding');
    let done = 0;
    this.ducks.forEach((d, i) => {
      this.later(i * 0.12, () => d.hop(0.35));
      this.fly(d, () => this.roller.seatWorld(i), {
        delay: 0.35 + i * 0.12,
        dur: 0.9,
        height: 2.6,
        onDone: () => {
          this.roller.object.attach(d.object);
          d.object.position.copy(this.roller.seats[i]);
          d.object.rotation.set(0, (Math.random() - 0.5) * 0.8, 0);
          if (++done === N) this.set('riding');
        },
      });
    });
  }

  land() {
    this.set('landing');
    this.light?.show();
    // the light turns green, then everyone hops down onto the new zebra on the - side
    this.later(0.9, () => {
      this.light?.green();
      let done = 0;
      this.ducks.forEach((d, i) => {
        // the first pair lands at the front of the line, so the queue walks off in order
        const target = this.path.toWorld(this.crossS + (i % 2 ? 0.55 : -0.5), -ROAD.halfWidth + 0.8 + (2 - Math.floor(i / 2)) * 0.9);
        target.y = 0.02;
        this.fly(d, () => target, {
          delay: 0.3 + i * 0.15,
          dur: 1.0,
          height: 2.2,
          onDone: () => {
            d.object.rotation.y = this.facingAcross();
            if (++done === N) this.startCrossing();
          },
        });
      });
    });
  }

  startCrossing() {
    this.set('crossing');
    const yard = this.homeYard();
    // waypoints: across the zebra to the far curb, then into the yard
    this.paths = this.ducks.map((d, i) => {
      const lane = i % 2 ? 0.55 : -0.5;
      const pts = [
        this.path.toWorld(this.crossS + lane, ROAD.halfWidth + ROAD.sidewalk * 0.5),
      ];
      if (yard) {
        const curbToYard = this.path.toWorld(this.crossS + 2.6 + (i % 3) * 0.6, ROAD.halfWidth + ROAD.sidewalk + 0.3);
        pts.push(curbToYard);
        const spot = yard.clone();
        // spread over the yard in the plot's own axes (x along the street, z toward it)
        const th = this.homeFacing();
        const lx = ((i % 3) - 1) * 1.15;
        const lz = (Math.floor(i / 3) - 0.5) * 1.1;
        spot.x += lx * Math.cos(th) + lz * Math.sin(th);
        spot.z += -lx * Math.sin(th) + lz * Math.cos(th);
        pts.push(spot);
      }
      return { pts, k: 0, wait: Math.floor(i / 2) * 0.75 + (i % 2) * 0.3 };
    });
    for (const d of this.ducks) d.mode = 'idle';
  }

  walk(dt) {
    let arrived = 0;
    this.ducks.forEach((d, i) => {
      const w = this.paths[i];
      if (w.wait > 0) { w.wait -= dt; return; }
      if (w.k >= w.pts.length) { arrived++; return; }
      const p = d.object.position;
      const target = w.pts[w.k];
      const dx = target.x - p.x;
      const dz = target.z - p.z;
      const dist = Math.hypot(dx, dz);
      const step = 2.2 * dt * (d.scaleBase < 0.8 ? 0.85 : 1);
      d.mode = 'walk';
      const yaw = Math.atan2(dx, dz);
      let dy = yaw - d.object.rotation.y;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      d.object.rotation.y += dy * Math.min(1, dt * 8);
      if (dist <= step) {
        p.x = target.x;
        p.z = target.z;
        p.y = target.y > 0.05 ? target.y : 0.02;
        w.k++;
        if (w.k >= w.pts.length) {
          d.mode = 'idle';
          gsap.to(d.object.rotation, { y: this.homeFacing() + (Math.random() - 0.5) * 0.6, duration: 0.6 });
        }
      } else {
        p.x += (dx / dist) * step;
        p.z += (dz / dist) * step;
        // step up onto the plot slab when close to the yard
        if (w.k === w.pts.length - 1 && w.pts.length > 2) p.y = Math.min(target.y, p.y + dt * 0.6);
      }
    });
    if (arrived === N) this.set('home');
  }

  /** Jump straight to the end of the story (used when skipping ahead). */
  skipHome() {
    this.killCalls();
    this.flights.length = 0;
    this.light?.show();
    this.light?.green();
    const yard = this.homeYard();
    const th = this.homeFacing();
    this.ducks.forEach((d, i) => {
      d.reset();
      this.scene.attach(d.object);
      if (yard) {
        const lx = ((i % 3) - 1) * 1.15;
        const lz = (Math.floor(i / 3) - 0.5) * 1.1;
        d.object.position.set(yard.x + lx * Math.cos(th) + lz * Math.sin(th), yard.y, yard.z - lx * Math.sin(th) + lz * Math.cos(th));
      }
      d.object.rotation.set(0, th + (Math.random() - 0.5) * 0.6, 0);
    });
    this.set('home');
  }

  dispose() {
    this.killCalls();
    this.flights.length = 0;
    for (const d of this.ducks) d.dispose();
    this.onState = null;
  }

  /** Click on a duck. */
  poke(d) {
    if (this.flights.some((f) => f.d === d)) return;
    d.hop(0.8);
    this.sfx?.quack(d.scaleBase < 0.8 ? 1.4 : 1 + Math.random() * 0.2);
  }

  get pickables() { return this.ducks.flatMap((d) => d.pickables); }

  /** Centre of the flock in world space. */
  centroid(out = new THREE.Vector3()) {
    out.set(0, 0, 0);
    const v = new THREE.Vector3();
    for (const d of this.ducks) out.add(d.object.getWorldPosition(v));
    return out.multiplyScalar(1 / this.ducks.length);
  }

  /** While the ducks are hopping down and crossing, the camera should look at them. */
  get onStage() { return this.state === 'landing' || this.state === 'crossing'; }
}
