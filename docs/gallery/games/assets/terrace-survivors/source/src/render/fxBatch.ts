// Pooled instanced quads for everything small and numerous:
//  - QuadBatch 'glow'   additive billboards (bolts, orbs, sparks, lightning, explosions) — bright colours feed bloom
//  - QuadBatch 'solid'  alpha-tested billboards (gems, coins, fruit, rocks)
//  - QuadBatch 'ground' flat alpha-blended decals on the terrain (AoE telegraphs, shrine circles)
//  - ShadowBatch        soft blob shadows under creatures and pickups

import {
  AdditiveBlending,
  CanvasTexture,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  NearestFilter,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  type Object3D,
} from 'three';
import type { Shared } from './renderer';
import { FOG_GLSL } from './glsl';
import { FX_CELL } from '../art/fx';

export type QuadMode = 'glow' | 'solid' | 'ground';

export class QuadBatch {
  private mesh: InstancedMesh;
  private cap: number;
  private count = 0;
  private aPos: InstancedBufferAttribute;
  private aCol: InstancedBufferAttribute;
  private aCell: InstancedBufferAttribute;

  constructor(tex: CanvasTexture, cols: number, rows: number, mode: QuadMode, shared: Shared, parent: Object3D, cap = 4096) {
    this.cap = cap;
    const g = new PlaneGeometry(1, 1);
    const mk = (n: number) => new InstancedBufferAttribute(new Float32Array(cap * n), n).setUsage(DynamicDrawUsage);
    this.aPos = mk(4); // xyz + size
    this.aCol = mk(4); // rgb (can exceed 1 for bloom) + alpha
    this.aCell = mk(2); // atlas cell, rotation
    g.setAttribute('iPos', this.aPos);
    g.setAttribute('iCol', this.aCol);
    g.setAttribute('iCell', this.aCell);
    const ground = mode === 'ground';
    const mat = new ShaderMaterial({
      transparent: mode !== 'solid',
      depthWrite: mode === 'solid',
      blending: mode === 'glow' ? AdditiveBlending : NormalBlending,
      defines: { GROUND: ground ? 1 : 0, SOLID: mode === 'solid' ? 1 : 0, GLOW: mode === 'glow' ? 1 : 0 },
      uniforms: {
        map: { value: tex },
        uGrid: { value: [cols, rows] },
        uFogColor: shared.uFogColor,
        uFogNear: shared.uFogNear,
        uFogFar: shared.uFogFar,
        uLight: shared.uLight,
      },
      vertexShader: /* glsl */ `
        attribute vec4 iPos; attribute vec4 iCol; attribute vec2 iCell;
        uniform vec2 uGrid;
        varying vec2 vUv; varying vec4 vCol; varying float vD;
        void main(){
          float c = cos(iCell.y), s = sin(iCell.y);
          vec2 p = vec2(c * position.x - s * position.y, s * position.x + c * position.y) * iPos.w;
#if GROUND
          vec3 w = iPos.xyz + vec3(p.x, 0., p.y);
#else
          vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
          vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
          vec3 w = iPos.xyz + right * p.x + up * p.y;
#endif
          vec4 mv = viewMatrix * vec4(w, 1.);
#if GLOW
          mv.z += .3;
#endif
          vD = -mv.z; gl_Position = projectionMatrix * mv;
          float cell = iCell.x;
          vec2 o = vec2(mod(cell, uGrid.x), floor(cell / uGrid.x));
          vUv = vec2((o.x + uv.x) / uGrid.x, 1. - (o.y + 1. - uv.y) / uGrid.y);
          vCol = iCol;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D map; uniform vec3 uLight;
        varying vec2 vUv; varying vec4 vCol; varying float vD;
        ${FOG_GLSL}
        void main(){
          vec4 t = texture2D(map, vUv);
#if SOLID
          if (t.a < .5) discard;
          gl_FragColor = vec4(applyFog(t.rgb * vCol.rgb * uLight, vD), 1.);
#elif GLOW
          if (t.a < .5) discard;
          float f = 1. - smoothstep(uFogNear, uFogFar, vD);
          gl_FragColor = vec4(t.rgb * vCol.rgb * vCol.a * f, 1.);
#else
          if (t.a < .5) discard;
          gl_FragColor = vec4(t.rgb * vCol.rgb, vCol.a);
#endif
        }`,
    });
    this.mesh = new InstancedMesh(g, mat, cap);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = mode === 'solid' ? 1 : mode === 'ground' ? 2 : 3;
    this.mesh.count = 0;
    parent.add(this.mesh);
  }

  begin(): void {
    this.count = 0;
  }

  push(x: number, y: number, z: number, size: number, cell: number, r: number, g: number, b: number, a = 1, rot = 0): void {
    if (this.count >= this.cap) return;
    const i = this.count++;
    const P = this.aPos.array as Float32Array,
      C = this.aCol.array as Float32Array,
      K = this.aCell.array as Float32Array;
    P[i * 4] = x;
    P[i * 4 + 1] = y;
    P[i * 4 + 2] = z;
    P[i * 4 + 3] = size;
    C[i * 4] = r;
    C[i * 4 + 1] = g;
    C[i * 4 + 2] = b;
    C[i * 4 + 3] = a;
    K[i * 2] = cell;
    K[i * 2 + 1] = rot;
  }

  end(): void {
    const n = this.count;
    this.mesh.count = n;
    this.mesh.visible = n > 0;
    for (const a of [this.aPos, this.aCol, this.aCell]) {
      a.clearUpdateRanges();
      a.addUpdateRange(0, Math.max(1, n) * a.itemSize);
      a.needsUpdate = true;
    }
  }

  get size(): number {
    return this.count;
  }
}

export class ShadowBatch {
  private mesh: InstancedMesh;
  private a: InstancedBufferAttribute;
  private count = 0;
  constructor(parent: Object3D, private cap = 2048) {
    const g = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    this.a = new InstancedBufferAttribute(new Float32Array(cap * 4), 4).setUsage(DynamicDrawUsage);
    g.setAttribute('iS', this.a);
    const m = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `attribute vec4 iS; varying vec2 vUv; void main(){ vUv = uv; vec3 p = vec3(position.x * iS.w, 0., position.z * iS.w * .62) + iS.xyz + vec3(0., .07, 0.); gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.); }`,
      fragmentShader: /* glsl */ `varying vec2 vUv; void main(){ float d = length(vUv - .5) * 2.; if (d > 1.) discard; float a = d < .72 ? .34 : .17; gl_FragColor = vec4(.06, .05, .14, a); }`,
    });
    this.mesh = new InstancedMesh(g, m, cap);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 0.5;
    this.mesh.count = 0;
    parent.add(this.mesh);
  }
  begin(): void {
    this.count = 0;
  }
  push(x: number, y: number, z: number, size: number): void {
    if (this.count >= this.cap) return;
    (this.a.array as Float32Array).set([x, y, z, size], this.count++ * 4);
  }
  end(): void {
    this.mesh.count = this.count;
    this.a.clearUpdateRanges();
    this.a.addUpdateRange(0, Math.max(1, this.count) * 4);
    this.a.needsUpdate = true;
  }
}

export function fxTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const t = new CanvasTexture(canvas);
  t.magFilter = t.minFilter = NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = SRGBColorSpace;
  return t;
}

export { FX_CELL };
