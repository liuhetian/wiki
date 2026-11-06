import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const KEEP = new Set(['position', 'normal', 'uv', 'color', 'aPattern']);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _c = new THREE.Color();

/**
 * Collects primitive parts with a colour and a pattern id per part, then merges them into one
 * geometry for the shared toy material: a whole house or a whole roller body is one draw call.
 */
export class Builder {
  constructor() { this.parts = []; }

  /**
   * @param {THREE.BufferGeometry} geo  fresh geometry, consumed
   * @param {number} color              sRGB hex
   * @param {object} o                  pos [x,y,z], rot [x,y,z], scale [x,y,z] | number, pattern, flat
   */
  add(geo, color, o = {}) {
    let g = geo.index ? geo.toNonIndexed() : geo;
    if (g !== geo) geo.dispose();
    if (o.flat) g.computeVertexNormals();
    if (!g.attributes.uv) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    const s = o.scale ?? 1;
    const sv = Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s);
    _e.set(...(o.rot ?? [0, 0, 0]), o.order ?? 'XYZ');
    _q.setFromEuler(_e);
    _m.compose(new THREE.Vector3(...(o.pos ?? [0, 0, 0])), _q, sv);
    g.applyMatrix4(_m);
    if (o.matrix) g.applyMatrix4(o.matrix);

    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    _c.set(color);
    for (let i = 0; i < n; i++) { col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aPattern', new THREE.BufferAttribute(new Float32Array(n).fill(o.pattern ?? 0), 1));
    for (const k of Object.keys(g.attributes)) if (!KEEP.has(k)) g.deleteAttribute(k);
    this.parts.push(g);
    return this;
  }

  get empty() { return this.parts.length === 0; }

  build() {
    const g = mergeGeometries(this.parts, false);
    for (const p of this.parts) p.dispose();
    this.parts = [];
    g.computeBoundingSphere();
    return g;
  }
}

/** Triangular prism along X: a gable roof `w` long, `d` deep, `h` tall, base at y = 0. */
export function gableRoof(w, d, h) {
  const shape = new THREE.Shape();
  shape.moveTo(-d / 2, 0);
  shape.lineTo(d / 2, 0);
  shape.lineTo(0, h);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false });
  g.translate(0, 0, -w / 2);
  g.rotateY(Math.PI / 2);
  return g;
}

/** Four-sided pyramid (hip roof) with base w × d at y = 0. */
export function hipRoof(w, d, h) {
  const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  g.rotateY(Math.PI / 4);
  g.translate(0, 0.5, 0);
  g.scale(w, h, d);
  return g;
}

/** Flat quad slab from four XZ corners (CCW seen from above), `h` thick, top at y = h. */
export function slabFromCorners(corners, h) {
  const top = corners.map(([x, z]) => [x, h, z]);
  const bot = corners.map(([x, z]) => [x, 0, z]);
  const pos = [];
  const uv = [];
  const tri = (a, b, c) => { pos.push(...a, ...b, ...c); uv.push(0, 0, 0, 0, 0, 0); };
  tri(top[0], top[2], top[1]);
  tri(top[0], top[3], top[2]);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    tri(bot[i], bot[j], top[j]);
    tri(bot[i], top[j], top[i]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  // Flip every triangle if the corners came in clockwise, so the top faces point up.
  const p = g.attributes.position.array;
  const [a, b, c] = [0, 3, 6].map((i) => new THREE.Vector3(p[i], p[i + 1], p[i + 2]));
  if (b.sub(a).cross(c.sub(a)).y < 0) {
    for (let i = 0; i < p.length; i += 9) {
      for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; }
    }
  }
  g.computeVertexNormals();
  return g;
}
