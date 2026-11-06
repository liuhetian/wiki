import * as THREE from 'three';
import { RoadPath } from './roadPath.js';
import { createRoadShared } from './road.js';
import { Chunk, CHUNK } from './chunk.js';
import { Rand } from '../rand.js';

export const AHEAD = 4 * CHUNK; // keep this much road generated in front of the roller
export const BEHIND = 4 * CHUNK; // and drop chunks that end further back than this

const FIRST_CROSS = 5; // first chunk with a crosswalk
const CROSS_EVERY = 3; // then every third chunk

const NAMES = ['面馆', '文具', '水果', '书店', '花店', '诊所', '煎饼', '理发', '菜场', '茶馆', '药店', '修车', '奶茶',
  '五金', '裁缝', '包子铺', '幼儿园', '操场', '公园', '银行', '澡堂', '球场', '报亭', '豆浆', '粮站', '照相馆', '小学',
  '早餐', '修鞋', '面包房', '杂货铺', '图书馆', '冰室', '剃头', '布店', '锁匠'];

/**
 * The endless street: a road path plus a window of chunks around the roller. New chunks are made
 * ahead as the roller advances and old ones disposed behind it; plot meshes are built a few per
 * frame; items pop into view as the roller passes them.
 */
export class World {
  constructor({ scene, toyMat, pencilMat, rings, sfx, roller, viewDir, onFlockState, seed = 7 }) {
    Object.assign(this, { scene, toyMat, pencilMat, rings, sfx, roller, viewDir, onFlockState, seed });
    this.path = new RoadPath(seed);
    this.roadShared = createRoadShared();
    this.root = new THREE.Group();
    scene.add(this.root);
    this.chunks = new Map();
    this.first = 0;
    this.next = 0;
    this.cursors = new Map(); // plot layout cursor per (side, band), carried from chunk to chunk
    this.crossings = 0;
    this.pending = []; // items not yet revealed, sorted by revealS
    const names = [...NAMES];
    const r = new Rand(seed + 3);
    for (let i = names.length - 1; i > 0; i--) { const j = r.int(0, i); [names[i], names[j]] = [names[j], names[i]]; }
    this.names = names;
    this.nameIdx = 0;
  }

  isCrossChunk(k) { return k >= FIRST_CROSS && (k - FIRST_CROSS) % CROSS_EVERY === 0; }

  nextName() { return this.names[this.nameIdx++ % this.names.length]; }

  /** Generate chunks up to rollerS + AHEAD and dispose the ones that fell behind. */
  ensure(rollerS) {
    const want = Math.floor((rollerS + AHEAD) / CHUNK);
    this.path.ensure((want + 2) * CHUNK);
    let added = false;
    while (this.next <= want) {
      const c = new Chunk(this, this.next);
      this.chunks.set(this.next, c);
      this.pending.push(...c.items);
      this.next++;
      added = true;
    }
    if (added) this.pending.sort((a, b) => a.revealS - b.revealS);

    let dropped = false;
    while (this.first < this.next - 1 && (this.first + 1) * CHUNK < rollerS - BEHIND) {
      this.chunks.get(this.first).dispose();
      this.chunks.delete(this.first);
      this.first++;
      dropped = true;
    }
    if (dropped) {
      this.pending = this.pending.filter((it) => it.chunk.index >= this.first);
      this.path.discardBefore(this.first * CHUNK - 16);
    }
  }

  /** Build queued plot meshes, nearest chunk first, for about `ms` milliseconds. */
  pump(ms) {
    const t0 = performance.now();
    for (let k = this.first; k < this.next; k++) {
      const c = this.chunks.get(k);
      while (c.buildNext()) if (performance.now() - t0 > ms) return;
    }
  }

  /** Reveal everything the paint has reached. */
  update(rollerS, animate = true) {
    this.roadShared.uRollerS.value = rollerS;
    let n = 0;
    while (n < this.pending.length && this.pending[n].revealS <= rollerS) {
      const it = this.pending[n++];
      it.chunk.reveal(it, animate);
    }
    if (n) this.pending.splice(0, n);
  }

  get flocks() {
    const out = [];
    for (let k = this.first; k < this.next; k++) {
      const f = this.chunks.get(k).flock;
      if (f) out.push(f);
    }
    return out;
  }

  /** How far the roller may go: up to the first duck family still waiting or boarding. */
  limit() {
    let m = Infinity;
    for (const f of this.flocks) m = Math.min(m, f.limit());
    return m;
  }

  updateFlocks(dt, t, rollerS) {
    for (const f of this.flocks) f.update(dt, t, rollerS);
  }

  /**
   * The duck family that matters right now, for the camera and the hint line: one hopping down or
   * crossing, else one boarding or riding, else the next one waiting ahead.
   */
  story(rollerS) {
    const fl = this.flocks;
    return fl.find((f) => f.onStage && rollerS < f.crossS + 26)
      ?? fl.find((f) => f.state === 'boarding' || f.state === 'riding')
      ?? fl.find((f) => f.state === 'waiting' && f.crossS > rollerS)
      ?? null;
  }

  /** Debug jump: every family the roller would have passed goes straight home. */
  skipBefore(s) {
    for (const f of this.flocks) if (f.stopS < s && f.state !== 'home') f.skipHome();
  }

  dispose() {
    for (const c of this.chunks.values()) c.dispose();
    this.chunks.clear();
    this.pending.length = 0;
    this.root.removeFromParent();
  }
}
