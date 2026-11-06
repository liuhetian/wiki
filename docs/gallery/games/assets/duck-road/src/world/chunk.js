import * as THREE from 'three';
import gsap from 'gsap';
import { Builder, slabFromCorners } from '../geo.js';
import { C, PLOT_STYLES } from '../palette.js';
import { Rand } from '../rand.js';
import { ROAD } from './roadPath.js';
import { CROSS_HALF, createRoadChunk } from './road.js';
import { place, house, tower, tree, flowers, fence, lamp } from './props.js';
import { TrafficLight } from './trafficLight.js';
import { Flock } from '../actors/flock.js';

export const CHUNK = ROAD.block;
const BANDS = [[5.75, 10.6], [11.6, 16.4], [17.4, 22.2], [23.2, 27.8]];
const SLAB_H = 0.16;
const LAMP_EVERY = 21;

// The first crosswalk tells the film's story; later ones only name the ducks' home.
const STORY = [
  [1, 0, false, '家'], [-1, 0, true, '外婆家'], [1, 0, true, '小卖部'], [-1, 0, false, '早点摊'],
  [-1, 1, true, '老街'], [1, 1, false, '车站'], [1, 1, true, '邮局'],
];

let lampGeo = null;
function lampGeometry() {
  if (!lampGeo) {
    const b = new Builder();
    lamp(b, new THREE.Matrix4());
    lampGeo = b.build();
  }
  return lampGeo;
}

/**
 * One stretch of the endless street, s in [s0, s0 + CHUNK): its road ribbon, the pencil drawing
 * and shop names, street lamps, the plots that start in it, and possibly a crosswalk with a duck
 * family. Plot meshes are built lazily (`buildNext`) and everything is freed by `dispose`.
 */
export class Chunk {
  constructor(world, index) {
    this.world = world;
    this.index = index;
    this.s0 = index * CHUNK;
    this.s1 = this.s0 + CHUNK;
    this.r = new Rand((world.seed * 7919 + index * 104729) >>> 0);
    this.crossS = world.isCrossChunk(index) ? this.s0 + CHUNK / 2 : null;
    this.group = new THREE.Group();
    world.root.add(this.group);
    this.items = [];
    this.trash = []; // geometries, materials and textures owned by this chunk

    this.layout();
    this.buildRoad();
    this.buildPencil();
    this.buildLabels();
    this.buildLamps();
    if (this.crossS != null) this.buildCrossing();
    this.queue = [...this.plots];
  }

  // ---------------------------------------------------------------- layout
  layout() {
    const { r, world } = this;
    const cs = this.crossS;
    this.plots = [];
    for (const side of [1, -1]) {
      BANDS.forEach(([d0, d1], band) => {
        const key = `${side}:${band}`;
        let s = world.cursors.get(key) ?? this.s0 + 1.5 + r.float(0, 3);
        while (s < this.s1) {
          const len = r.float(4.2, 6.6);
          // keep a street open in line with the crosswalk
          if (cs != null && s < cs + CROSS_HALF + 0.6 && s + len > cs - CROSS_HALF - 0.6) {
            s = cs + CROSS_HALF + 0.6;
            continue;
          }
          const skip = (band === 3 && r.chance(0.3)) || (band === 2 && r.chance(0.08));
          const seed = r.int(0, 2 ** 30); // per plot, so build order never changes what gets built
          if (!skip) this.plots.push(this.framePlot({ side, band, s0: s, s1: s + len, d0, d1, seed }));
          s += len + (r.chance(0.12) ? 2.4 : 1.0);
        }
        world.cursors.set(key, s);
      });
    }

    // names: the story ones around a crosswalk, then every third plot near the road
    if (cs != null) {
      const near = (side, band, before) => {
        const list = this.plots.filter((p) => p.side === side && p.band === band);
        return before
          ? list.filter((p) => p.s1 < cs).sort((a, b) => b.s1 - a.s1)[0]
          : list.filter((p) => p.s0 > cs).sort((a, b) => a.s0 - b.s0)[0];
      };
      const story = world.crossings++ === 0 ? STORY : STORY.slice(0, 1);
      for (const [side, band, before, name] of story) {
        const p = near(side, band, before);
        if (p) p.label = name;
      }
      this.home = this.plots.find((p) => p.label === '家');
      if (this.home) this.home.kind = 'home';
    }
    this.plots
      .filter((p) => p.band <= 1 && !p.label)
      .sort((a, b) => a.s0 - b.s0)
      .forEach((p, i) => { if (i % 3 === 0) p.label = world.nextName(); });

    for (const p of this.plots) {
      this.items.push({ kind: 'plot', plot: p, chunk: this, revealS: p.s0 + p.band * 1.6 - 1.2 });
    }
  }

  /** Centre, rotation (local +Z faces the road), corners and usable half extents of a plot. */
  framePlot(p) {
    const path = this.world.path;
    const sm = (p.s0 + p.s1) / 2;
    const f = path.frame(sm);
    p.center = path.toWorld(sm, p.side * (p.d0 + p.d1) / 2);
    p.theta = Math.atan2(-p.side * f.nx, -p.side * f.nz);
    const c = Math.cos(p.theta);
    const sn = Math.sin(p.theta);
    p.world = [[p.s0, p.d0], [p.s1, p.d0], [p.s1, p.d1], [p.s0, p.d1]].map(([s, d]) => path.toWorld(s, p.side * d));
    p.corners = p.world.map((w) => {
      const dx = w.x - p.center.x;
      const dz = w.z - p.center.z;
      return [dx * c - dz * sn, dx * sn + dz * c];
    });
    const xs = p.corners.map((k) => k[0]);
    const zs = p.corners.map((k) => k[1]);
    p.hx = Math.min(-Math.min(...xs), Math.max(...xs)) - 0.45;
    p.hz = Math.min(-Math.min(...zs), Math.max(...zs)) - 0.45;
    return p;
  }

  /** Plot-local point → world. */
  plotToWorld(p, x, y, z, out = new THREE.Vector3()) {
    const c = Math.cos(p.theta);
    const s = Math.sin(p.theta);
    return out.set(p.center.x + x * c + z * s, y, p.center.z - x * s + z * c);
  }

  // ---------------------------------------------------------------- road, pencil, names, lamps
  buildRoad() {
    const mesh = createRoadChunk(this.world.path, this.s0, this.s1, this.world.roadShared, this.crossS);
    this.group.add(mesh);
    this.trash.push(mesh.geometry, mesh.material);
  }

  buildPencil() {
    const origin = this.world.path.toWorld(this.s0, 0);
    const pos = [];
    const quad = (a, b, w) => {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const l = Math.hypot(dx, dz) || 1;
      const nx = (-dz / l) * w;
      const nz = (dx / l) * w;
      const ax = a.x - origin.x, az = a.z - origin.z, bx = b.x - origin.x, bz = b.z - origin.z;
      const y = 0.012;
      pos.push(ax + nx, y, az + nz, bx + nx, y, bz + nz, bx - nx, y, bz - nz);
      pos.push(ax + nx, y, az + nz, bx - nx, y, bz - nz, ax - nx, y, az - nz);
    };
    for (const p of this.plots) for (let i = 0; i < 4; i++) quad(p.world[i], p.world[(i + 1) % 4], 0.03);
    // a few survey crosses
    for (let i = 0; i < 10; i++) {
      const c = this.world.path.toWorld(this.r.float(this.s0, this.s1), this.r.pick([-1, 1]) * this.r.float(5.0, 29));
      const k = 0.28;
      quad(new THREE.Vector3(c.x - k, 0, c.z), new THREE.Vector3(c.x + k, 0, c.z), 0.025);
      quad(new THREE.Vector3(c.x, 0, c.z - k), new THREE.Vector3(c.x, 0, c.z + k), 0.025);
    }
    // wind every triangle counter-clockwise seen from above
    for (let i = 0; i < pos.length; i += 9) {
      const ax = pos[i + 3] - pos[i], az = pos[i + 5] - pos[i + 2];
      const bx = pos[i + 6] - pos[i], bz = pos[i + 8] - pos[i + 2];
      if (az * bx - ax * bz < 0) for (let k = 0; k < 3; k++) { const t = pos[i + 3 + k]; pos[i + 3 + k] = pos[i + 6 + k]; pos[i + 6 + k] = t; }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, this.world.pencilMat);
    mesh.position.copy(origin);
    mesh.receiveShadow = true;
    this.group.add(mesh);
    this.trash.push(g);
  }

  buildLabels() {
    const named = this.plots.filter((p) => p.label);
    if (!named.length) return;
    const cellW = 512;
    const cellH = 128;
    const cols = 4;
    const rows = Math.ceil(named.length / cols);
    const canvas = document.createElement('canvas');
    canvas.width = cellW * cols;
    canvas.height = THREE.MathUtils.ceilPowerOfTwo(cellH * rows);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#4a433d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '400 84px "Noto Serif SC", "Noto Serif CJK SC", "Songti SC", "STSong", "SimSun", serif';
    named.forEach((p, i) => {
      ctx.fillText([...p.label].join(' '), (i % cols) * cellW + cellW / 2, Math.floor(i / cols) * cellH + cellH / 2 + 4);
    });
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    this.trash.push(tex);

    named.forEach((p, i) => {
      const h = 0.95;
      const g = new THREE.PlaneGeometry(h * 4, h); // 512 × 128 cell
      const u0 = (i % cols) / cols;
      const v1 = 1 - (Math.floor(i / cols) * cellH) / canvas.height;
      const v0 = v1 - cellH / canvas.height;
      const uv = g.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) / cols, v0 + uv.getY(k) * (v1 - v0));
      const mat = new THREE.MeshStandardMaterial({
        map: tex, transparent: true, depthWrite: false, roughness: 1,
        polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
      });
      const m = new THREE.Mesh(g, mat);
      m.rotation.order = 'YXZ';
      m.rotation.x = -Math.PI / 2;
      // the plot-aligned rotation that reads upright from the camera at this point of the road
      const fwd = this.world.viewDir((p.s0 + p.s1) / 2).negate().setY(0).normalize();
      let best = 0;
      let bd = -Infinity;
      for (let k = 0; k < 4; k++) {
        const a = p.theta + (k * Math.PI) / 2;
        const dd = -Math.sin(a) * fwd.x - Math.cos(a) * fwd.z;
        if (dd > bd) { bd = dd; best = a; }
      }
      m.rotation.y = best;
      m.position.set(p.center.x, 0.015, p.center.z);
      m.receiveShadow = true;
      m.renderOrder = 2;
      this.group.add(m);
      p.labelMesh = m;
      this.trash.push(g, mat);
    });
  }

  buildLamps() {
    const path = this.world.path;
    const first = Math.ceil((this.s0 - 8) / LAMP_EVERY);
    for (let k = first; 8 + k * LAMP_EVERY < this.s1; k++) {
      const s = 8 + k * LAMP_EVERY;
      if (this.crossS != null && Math.abs(s - this.crossS) < 4) continue;
      const side = k % 2 ? 1 : -1;
      const f = path.frame(s);
      const mesh = new THREE.Mesh(lampGeometry(), this.world.toyMat);
      mesh.castShadow = true;
      mesh.position.copy(path.toWorld(s, side * (ROAD.halfWidth + ROAD.sidewalk * 0.55)));
      mesh.rotation.y = Math.atan2(-side * f.nx, -side * f.nz);
      mesh.visible = false;
      this.group.add(mesh);
      this.items.push({ kind: 'lamp', mesh, chunk: this, revealS: s + 1 });
    }
  }

  buildCrossing() {
    const { world } = this;
    const cs = this.crossS;
    // duck light on the camera's side of the crosswalk, turned toward the camera
    const pos = world.path.toWorld(cs + 2.5, -(ROAD.halfWidth + ROAD.sidewalk * 0.55));
    const face = world.viewDir(cs);
    this.light = new TrafficLight(world.toyMat, pos, Math.atan2(face.x, face.z));
    this.group.add(this.light.object);
    const home = this.home;
    this.flock = new Flock({
      scene: world.scene, toyMat: world.toyMat, path: world.path, roller: world.roller, crossS: cs, light: this.light, sfx: world.sfx,
      homeYard: () => (home ? this.plotToWorld(home, 0, SLAB_H, home.hz * 0.45) : null),
      homeFacing: () => (home ? home.theta : 0),
      onState: (s, prev) => world.onFlockState?.(this.flock, s, prev),
    });
  }

  // ---------------------------------------------------------------- plots
  /** Build one queued plot mesh; returns false when none are left. */
  buildNext() {
    const p = this.queue.shift();
    if (!p) return false;
    if (!p.mesh) this.buildPlot(p);
    return true;
  }

  buildPlot(p) {
    const r = new Rand(p.seed);
    const [color, pattern] = r.pick(PLOT_STYLES);
    const b = new Builder();
    b.add(slabFromCorners(p.corners, SLAB_H * 0.7), 0xf1ece2, {});
    const inset = p.corners.map(([x, z]) => {
      const l = Math.hypot(x, z);
      const k = Math.max(0, (l - 0.2) / l);
      return [x * k, z * k];
    });
    b.add(slabFromCorners(inset, SLAB_H), color, { pattern });
    fillPlot(b, r, place(new THREE.Matrix4(), 0, SLAB_H, 0), p);
    const mesh = new THREE.Mesh(b.build(), this.world.toyMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(p.center);
    mesh.rotation.y = p.theta;
    mesh.visible = false;
    this.group.add(mesh);
    p.mesh = mesh;
    this.trash.push(mesh.geometry);
  }

  /** Make an item visible, popping it up with a ring when `animate`. */
  reveal(item, animate) {
    if (item.shown) return;
    item.shown = true;
    if (item.kind === 'plot' && !item.plot.mesh) this.buildPlot(item.plot);
    const m = item.kind === 'plot' ? item.plot.mesh : item.mesh;
    m.visible = true;
    const lm = item.plot?.labelMesh;
    if (lm) {
      if (animate) gsap.to(lm.material, { opacity: 0, duration: 0.35, onComplete: () => { lm.visible = false; } });
      else lm.visible = false;
    }
    if (!animate) return;
    const delay = Math.random() * 0.12;
    m.scale.set(0.001, 0.001, 0.001);
    gsap.to(m.scale, { x: 1, z: 1, duration: 0.42, delay, ease: 'back.out(2.2)' });
    gsap.to(m.scale, { y: 1, duration: 0.75, delay: delay + 0.06, ease: 'elastic.out(1, 0.45)' });
    if (item.kind === 'plot') {
      this.world.rings.spawn(m.position.x, m.position.z, Math.max(item.plot.hx, item.plot.hz) + 0.9, delay);
      this.world.sfx?.pop(item.plot.band);
    }
  }

  dispose() {
    this.flock?.dispose();
    this.light?.dispose();
    this.group.traverse((o) => {
      gsap.killTweensOf(o.scale);
      if (o.material) gsap.killTweensOf(o.material);
    });
    this.group.removeFromParent();
    for (const t of this.trash) t.dispose();
    this.trash.length = 0;
    this.plots.length = 0;
    this.items.length = 0;
    this.queue.length = 0;
  }
}

function fillPlot(b, r, M, p) {
  const { hx, hz } = p;
  if (hx < 0.9 || hz < 0.9) return;
  if (p.kind === 'home') {
    // house at the back, an open front yard for the ducks
    house(b, r, place(M, 0, 0, -hz + 1.3), { w: Math.min(3.2, hx * 2 - 0.4), d: 2.2, floors: 2, wall: 0xf3e3a6, roof: C.red, style: 'gable' });
    tree(b, r, place(M, hx - 0.5, 0, -hz + 0.6), 0.9);
    fence(b, M, -hx, hz, -hx, -hz);
    fence(b, M, hx, -hz, hx, hz);
    flowers(b, r, M, hx * 0.9, hz * 0.9, 8);
    return;
  }
  const roll = r.next();
  if (p.band >= 2 && roll < 0.14) {
    tower(b, r, place(M, r.float(-0.4, 0.4), 0, r.float(-0.4, 0.2)));
    if (hx > 1.8) tree(b, r, place(M, hx - 0.4, 0, hz - 0.4), 0.8);
  } else if (roll < 0.6) {
    const rot = r.chance(0.2) ? Math.PI / 2 : 0;
    const hxR = rot ? hz : hx;
    const hzR = rot ? hx : hz;
    const w = Math.min(r.float(2.2, 3.4), hxR * 2 - 0.3);
    const d = Math.min(r.float(1.9, 2.8), hzR * 2 - 0.3);
    const x = r.float(-0.3, 0.3) * Math.max(0, hx - w / 2);
    const z = -Math.max(0, hz - d / 2 - 0.2) * r.float(0.2, 0.8);
    house(b, r, place(M, x, 0, z, rot), { w, d });
    const n = r.int(0, 2);
    for (let i = 0; i < n; i++) {
      const sx = r.chance(0.5) ? 1 : -1;
      tree(b, r, place(M, sx * (hx - 0.3), 0, (i ? -1 : 1) * (hz - 0.3)), 0.75);
    }
    if (r.chance(0.35)) fence(b, M, -hx - 0.2, hz + 0.2, hx + 0.2, hz + 0.2);
  } else if (roll < 0.85) {
    const n = r.int(2, 5);
    for (let i = 0; i < n; i++) tree(b, r, place(M, r.float(-hx, hx) * 0.8, 0, r.float(-hz, hz) * 0.8), 1);
    if (r.chance(0.3)) fence(b, M, -hx - 0.2, hz + 0.2, hx + 0.2, hz + 0.2);
  }
  flowers(b, r, M, hx, hz, r.int(2, 9));
}
