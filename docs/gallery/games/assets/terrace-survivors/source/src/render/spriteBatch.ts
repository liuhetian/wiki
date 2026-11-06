// Character sprites: one InstancedMesh per sheet, per-instance data in InstancedBufferAttributes rewritten each frame
// (begin → push… → end). The vertex shader builds a billboard leaning 35% toward the camera's up vector; the fragment
// shader does alpha-test, dissolve, hit flash, elite outline and fog. Frame and facing row are chosen on the CPU.

import {
  CanvasTexture,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  NearestFilter,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Camera,
  type Object3D,
} from 'three';
import type { AnimName, SheetMeta, SpriteSheet } from '../art/creatures';
import type { Shared } from './renderer';
import { FOG_GLSL } from './glsl';

/** World units per sprite texel (matches the terrain's 13.5 texels per unit). */
export const TEXEL = 1 / 13.5;

const VERT = /* glsl */ `
attribute vec3 iPos; attribute vec2 iSize; attribute vec4 iUV; attribute vec4 iFx; attribute vec4 iTint;
uniform float uLean;
varying vec2 vUv; varying vec4 vFx; varying vec4 vTint; varying float vD; varying vec4 vRect; varying vec2 vLocal;
void main(){
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 camUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 up = normalize(mix(vec3(0., 1., 0.), camUp, uLean));
  float sq = iFx.w;
  vec2 size = iSize * vec2(1. + sq * .35, 1. - sq * .3);
  vec3 world = iPos + right * (position.x * size.x) + up * (position.y * size.y);
  vec4 mv = viewMatrix * vec4(world, 1.);
  // Nudge toward the camera so feet do not sink into slopes (bigger sprites need more).
  mv.z += .25 + iSize.y * .05;
  gl_Position = projectionMatrix * mv;
  vUv = vec2(mix(iUV.x, iUV.z, uv.x), mix(iUV.y, iUV.w, uv.y));
  vRect = vec4(min(iUV.x, iUV.z), min(iUV.y, iUV.w), max(iUV.x, iUV.z), max(iUV.y, iUV.w));
  vLocal = uv; vFx = iFx; vTint = iTint; vD = -mv.z;
}`;

const FRAG = /* glsl */ `
uniform sampler2D map; uniform vec2 uTexel; uniform vec3 uLight; uniform float uTime;
varying vec2 vUv; varying vec4 vFx; varying vec4 vTint; varying float vD; varying vec4 vRect; varying vec2 vLocal;
${FOG_GLSL}
float hash1(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float alphaAt(vec2 uv){ if (uv.x < vRect.x || uv.y < vRect.y || uv.x > vRect.z || uv.y > vRect.w) return 0.; return texture2D(map, uv).a; }
void main(){
  vec4 t = texture2D(map, vUv);
  float outline = vFx.z;
  if (t.a < .5) {
    if (outline < .5) discard;
    float n = max(max(alphaAt(vUv + vec2(uTexel.x, 0.)), alphaAt(vUv - vec2(uTexel.x, 0.))), max(alphaAt(vUv + vec2(0., uTexel.y)), alphaAt(vUv - vec2(0., uTexel.y))));
    if (n < .5) discard;
    vec3 oc = outline < 1.5 ? vec3(1., .82, .2) : outline < 2.5 ? vec3(1., .2, .15) : vec3(.4, 1., 1.);
    gl_FragColor = vec4(oc * (1.4 + .5 * sin(uTime * 8.)), 1.);
    return;
  }
  // Dissolve (death): pixels vanish in hashed order with a hot rim.
  float diss = vFx.y;
  if (diss > 0.) {
    float n = hash1(floor(vUv / uTexel));
    if (n < diss) discard;
    if (n < diss + .12) { gl_FragColor = vec4(vec3(1., .9, .6) * 2.2, 1.); return; }
  }
  vec3 col = t.rgb * uLight;
  col = mix(col, col * vTint.rgb * 1.4 + vTint.rgb * .12, vTint.w);
  col *= mix(.82, 1.05, smoothstep(0., .5, vLocal.y));
  col = mix(col, vec3(1.), vFx.x);
  gl_FragColor = vec4(applyFog(col, vD), 1.);
}`;

const footCache = new WeakMap<SpriteSheet, Foot>();

interface Foot {
  below: number; // texels under the feet in the walk frame
  height: number; // texels feet → head
  width: number;
}

export class SpriteBatch {
  mesh: InstancedMesh;
  readonly meta: SheetMeta;
  private cap: number;
  private count = 0;
  private aPos!: InstancedBufferAttribute;
  private aSize!: InstancedBufferAttribute;
  private aUV!: InstancedBufferAttribute;
  private aFx!: InstancedBufferAttribute;
  private aTint!: InstancedBufferAttribute;
  private material: ShaderMaterial;
  private geometry: PlaneGeometry;
  readonly foot: Foot;
  private totals = new Map<AnimName, number>();

  constructor(sheet: SpriteSheet, shared: Shared, private parent: Object3D, cap = 64) {
    this.meta = sheet.meta;
    this.cap = cap;
    const tex = new CanvasTexture(sheet.canvas);
    tex.magFilter = tex.minFilter = NearestFilter;
    tex.generateMipmaps = false;
    tex.colorSpace = SRGBColorSpace;
    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        map: { value: tex },
        uTexel: { value: new Vector2(1 / sheet.meta.w, 1 / sheet.meta.h) },
        uLean: { value: 0.35 },
        uFogColor: shared.uFogColor,
        uFogNear: shared.uFogNear,
        uFogFar: shared.uFogFar,
        uLight: shared.uLight,
        uTime: shared.uTime,
      },
    });
    this.geometry = new PlaneGeometry(1, 1).translate(0, 0.5, 0);
    this.allocate(cap);
    this.mesh = this.makeMesh();
    this.foot = this.measure(sheet);
  }

  private allocate(cap: number): void {
    const mk = (n: number) => new InstancedBufferAttribute(new Float32Array(cap * n), n).setUsage(DynamicDrawUsage);
    const old = [this.aPos, this.aSize, this.aUV, this.aFx, this.aTint];
    this.aPos = mk(3);
    this.aSize = mk(2);
    this.aUV = mk(4);
    this.aFx = mk(4);
    this.aTint = mk(4);
    const now = [this.aPos, this.aSize, this.aUV, this.aFx, this.aTint];
    old.forEach((a, i) => a && (now[i].array as Float32Array).set(a.array as Float32Array));
    const g = this.geometry;
    g.setAttribute('iPos', this.aPos);
    g.setAttribute('iSize', this.aSize);
    g.setAttribute('iUV', this.aUV);
    g.setAttribute('iFx', this.aFx);
    g.setAttribute('iTint', this.aTint);
  }

  private makeMesh(): InstancedMesh {
    const m = new InstancedMesh(this.geometry, this.material, this.cap);
    m.frustumCulled = false;
    m.renderOrder = 1;
    m.count = 0;
    this.parent.add(m);
    return m;
  }

  private grow(): void {
    this.cap *= 2;
    this.allocate(this.cap);
    this.parent.remove(this.mesh);
    this.mesh.dispose();
    this.mesh = this.makeMesh();
  }

  private measure(sheet: SpriteSheet): Foot {
    const cached = footCache.get(sheet);
    if (cached) return cached;
    const a = this.meta.anims.walk;
    const ctx = sheet.canvas.getContext('2d')!;
    const d = ctx.getImageData(0, a.y, a.fw, a.fh).data;
    let lo = 0,
      hi = a.fh,
      x0 = a.fw,
      x1 = 0;
    for (let y = 0; y < a.fh; y++)
      for (let x = 0; x < a.fw; x++)
        if (d[(y * a.fw + x) * 4 + 3] > 128) {
          lo = Math.max(lo, y);
          hi = Math.min(hi, y);
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
        }
    const foot = { below: a.fh - 1 - lo, height: lo - hi + 1, width: x1 - x0 + 1 };
    footCache.set(sheet, foot);
    return foot;
  }

  /** World height of the body (feet → head) at scale 1. */
  get bodyHeight(): number {
    return this.foot.height * TEXEL;
  }
  get bodyWidth(): number {
    return this.foot.width * TEXEL;
  }

  animLength(anim: AnimName): number {
    let t = this.totals.get(anim);
    if (t === undefined) {
      t = this.meta.anims[anim].d.reduce((s, v) => s + v, 0);
      this.totals.set(anim, t);
    }
    return t / 60;
  }

  begin(): void {
    this.count = 0;
  }

  /**
   * @param time  seconds into the animation
   * @param once  clamp on the last frame instead of looping (faint)
   * @param fx    [flash, dissolve, outlineMode, squash]
   * @param tint  [r,g,b,strength]
   */
  push(x: number, y: number, z: number, anim: AnimName, time: number, row: number, scale: number, once: boolean, fx0 = 0, fx1 = 0, fx2 = 0, fx3 = 0, tr = 1, tg = 1, tb = 1, tw = 0): void {
    if (this.count >= this.cap) this.grow();
    const a = this.meta.anims[anim];
    const total = this.animLength(anim) * 60;
    let tick = Math.floor(time * 60);
    tick = once ? Math.min(total - 1, tick) : tick % total;
    let f = 0;
    while (f < a.n - 1 && tick >= a.d[f]) tick -= a.d[f++];
    const r = a.rows > 1 ? row : 0;
    const W = this.meta.w,
      H = this.meta.h;
    const e = 0.02;
    const u0 = (f * a.fw + e) / W,
      u1 = ((f + 1) * a.fw - e) / W;
    const vTop = 1 - (a.y + r * a.fh + e) / H,
      vBot = 1 - (a.y + (r + 1) * a.fh - e) / H;
    const s = TEXEL * scale;
    const i = this.count++;
    const P = this.aPos.array as Float32Array;
    P[i * 3] = x;
    P[i * 3 + 1] = y - this.foot.below * s;
    P[i * 3 + 2] = z;
    const S = this.aSize.array as Float32Array;
    S[i * 2] = a.fw * s;
    S[i * 2 + 1] = a.fh * s;
    const U = this.aUV.array as Float32Array;
    U[i * 4] = u0;
    U[i * 4 + 1] = vBot;
    U[i * 4 + 2] = u1;
    U[i * 4 + 3] = vTop;
    const F = this.aFx.array as Float32Array;
    F[i * 4] = fx0;
    F[i * 4 + 1] = fx1;
    F[i * 4 + 2] = fx2;
    F[i * 4 + 3] = fx3;
    const T = this.aTint.array as Float32Array;
    T[i * 4] = tr;
    T[i * 4 + 1] = tg;
    T[i * 4 + 2] = tb;
    T[i * 4 + 3] = tw;
  }

  end(): void {
    const n = this.count;
    this.mesh.count = n;
    this.mesh.visible = n > 0;
    if (!n) return;
    for (const a of [this.aPos, this.aSize, this.aUV, this.aFx, this.aTint]) {
      a.clearUpdateRanges();
      a.addUpdateRange(0, n * a.itemSize);
      a.needsUpdate = true;
    }
  }

  dispose(): void {
    this.parent.remove(this.mesh);
    this.mesh.dispose();
    this.geometry.dispose();
    this.material.dispose();
    (this.material.uniforms.map.value as CanvasTexture).dispose();
  }
}

/** All sprite batches + camera-relative facing. */
export class SpriteSystem {
  readonly batches = new Map<string, SpriteBatch>();
  private camRight = new Vector3();
  private camFwd = new Vector3();
  private tmp = new Vector3();

  constructor(sheets: SpriteSheet[], shared: Shared, parent: Object3D) {
    for (const s of sheets) this.batches.set(s.id, new SpriteBatch(s, shared, parent, s.id === 'hero' || s.id === 'golem' ? 4 : 64));
  }

  get(id: string): SpriteBatch {
    return this.batches.get(id)!;
  }

  begin(camera: Camera): void {
    camera.updateMatrixWorld();
    camera.matrixWorld.extractBasis(this.camRight, this.tmp, this.camFwd);
    this.camFwd.negate();
    this.camFwd.y = 0;
    this.camFwd.normalize();
    this.camRight.y = 0;
    this.camRight.normalize();
    for (const b of this.batches.values()) b.begin();
  }

  end(): void {
    for (const b of this.batches.values()) b.end();
  }

  /** Sheet row (0 = facing the camera, 2 = screen right, 4 = away, 6 = left) for a world-space facing. */
  dirRow(dx: number, dz: number): number {
    const n = dx * this.camRight.x + dz * this.camRight.z;
    const r = dx * this.camFwd.x + dz * this.camFwd.z;
    const a = Math.atan2(n, -r);
    return ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
  }
}
