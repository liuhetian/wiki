// Static scenery: every tree, rock and tuft of the map in one InstancedMesh. Cylindrical billboards (they only turn
// around Y so trunks stay upright), wind sway growing toward the top, a darker base, and screen-door transparency
// (Bayer-dithered discard) for props standing between the camera and the player — no sorting needed.

import {
  CanvasTexture,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearFilter,
  NearestFilter,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
  type Object3D,
} from 'three';
import type { PropAtlas } from '../art/props';
import type { Shared } from './renderer';
import { FOG_GLSL, NOISE_GLSL } from './glsl';
import { TEXEL } from './spriteBatch';

export interface PropInstance {
  def: number;
  x: number;
  y: number;
  z: number;
  s: number;
  flip: boolean;
}

export class PropBatch {
  readonly mesh: InstancedMesh;
  readonly uPlayer = { value: new Vector3() };
  private material: ShaderMaterial;
  private tex: CanvasTexture;

  constructor(atlas: PropAtlas, list: PropInstance[], shared: Shared, parent: Object3D) {
    const n = Math.max(1, list.length);
    const g = new PlaneGeometry(1, 1).translate(0, 0.5, 0);
    const pos = new Float32Array(n * 3),
      size = new Float32Array(n * 2),
      uvs = new Float32Array(n * 4),
      sway = new Float32Array(n * 2);
    list.forEach((p, i) => {
      const r = atlas.rects[p.def];
      const d = atlas.defs[p.def];
      pos.set([p.x, p.y - 0.08, p.z], i * 3);
      size.set([r.w * TEXEL * p.s, r.h * TEXEL * p.s], i * 2);
      const e = 0.01;
      let u0 = (r.x + e) / atlas.w,
        u1 = (r.x + r.w - e) / atlas.w;
      if (p.flip) [u0, u1] = [u1, u0];
      uvs.set([u0, 1 - (r.y + r.h - e) / atlas.h, u1, 1 - (r.y + e) / atlas.h], i * 4);
      sway.set([d.sway, (p.x * 0.37 + p.z * 0.61) % 6.283], i * 2);
    });
    g.setAttribute('iPos', new InstancedBufferAttribute(pos, 3));
    g.setAttribute('iSize', new InstancedBufferAttribute(size, 2));
    g.setAttribute('iUV', new InstancedBufferAttribute(uvs, 4));
    g.setAttribute('iSway', new InstancedBufferAttribute(sway, 2));
    this.tex = new CanvasTexture(atlas.canvas);
    this.tex.magFilter = NearestFilter;
    this.tex.minFilter = LinearFilter;
    this.tex.generateMipmaps = false;
    this.tex.colorSpace = SRGBColorSpace;
    this.material = new ShaderMaterial({
      uniforms: {
        map: { value: this.tex },
        uTime: shared.uTime,
        uLight: shared.uLight,
        uPlayer: this.uPlayer,
        uFogColor: shared.uFogColor,
        uFogNear: shared.uFogNear,
        uFogFar: shared.uFogFar,
      },
      vertexShader: /* glsl */ `
        attribute vec3 iPos; attribute vec2 iSize; attribute vec4 iUV; attribute vec2 iSway;
        uniform float uTime; uniform vec3 uPlayer;
        varying vec2 vUv; varying float vD; varying float vY; varying float vFade;
        void main(){
          vec3 right = normalize(vec3(viewMatrix[0][0], 0., viewMatrix[2][0]));
          float h = position.y;
          float sway = iSway.x * (sin(uTime * 1.6 + iSway.y) * .7 + sin(uTime * 2.9 + iSway.y * 2.) * .3) * h * h * .06 * iSize.y;
          vec3 w = iPos + right * (position.x * iSize.x + sway) + vec3(0., h * iSize.y, 0.);
          vec4 mv = viewMatrix * vec4(w, 1.);
          vD = -mv.z; gl_Position = projectionMatrix * mv;
          vUv = vec2(mix(iUV.x, iUV.z, uv.x), mix(iUV.y, iUV.w, uv.y)); vY = h;
          vec3 a = cameraPosition, b = uPlayer + vec3(0., 1., 0.), c = iPos + vec3(0., iSize.y * .45, 0.);
          vec3 ab = b - a; float t = clamp(dot(c - a, ab) / dot(ab, ab), 0., 1.);
          float dseg = length(a + ab * t - c);
          vFade = (1. - smoothstep(iSize.x * .35 + .8, iSize.x * .6 + 2.5, dseg)) * step(t, .97) * step(.02, t);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D map; uniform vec3 uLight;
        varying vec2 vUv; varying float vD; varying float vY; varying float vFade;
        ${NOISE_GLSL}
        ${FOG_GLSL}
        void main(){
          vec4 t = texture2D(map, vUv);
          if (t.a < .5) discard;
          if (vFade > .01 && bayer4(gl_FragCoord.xy) < vFade * .8) discard;
          vec3 c = t.rgb * uLight * mix(.8, 1., smoothstep(0., .22, vY));
          gl_FragColor = vec4(applyFog(c, vD), 1.);
        }`,
    });
    this.mesh = new InstancedMesh(g, this.material, list.length);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
    parent.add(this.mesh);
  }

  dispose(): void {
    this.mesh.parent?.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.tex.dispose();
  }
}
