import * as THREE from 'three';
import { C } from './palette.js';

/** Uniforms shared by every patched material: sun direction for the window shadow, time. */
export const shared = {
  uSunDir: { value: new THREE.Vector3(-0.8, 0.6, -0.15).normalize() },
  // window-frame shadow (gobo): pane size xy, bar width, softness
  uGoboCell: { value: new THREE.Vector2(46, 38) },
  uGobo: { value: new THREE.Vector3(3.2, 2.6, 0.42) }, // bar width, softness, strength
  uGoboOff: { value: new THREE.Vector2(14, 30) },
  uGoboRot: { value: 0.32 },
  // the window shadow drifts after the camera so the endless street always has it nearby
  uGoboAnchor: { value: new THREE.Vector2() },
  uTime: { value: 0 },
};

export const GLSL_NOISE = /* glsl */ `
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash13(vec3 p3) { p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float vnoise3(vec3 p) {
  vec3 i = floor(p), f = fract(p); vec3 u = f * f * (3. - 2. * f);
  float a = mix(mix(hash13(i), hash13(i + vec3(1,0,0)), u.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), u.x), u.y);
  float b = mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), u.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), u.x), u.y);
  return mix(a, b, u.z);
}
float fbm(vec2 p) { float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= .5; } return s; }
`;

const GLSL_GOBO = /* glsl */ `
uniform vec3 uSunDir;
uniform vec2 uGoboCell;
uniform vec3 uGobo;
uniform vec2 uGoboOff;
uniform float uGoboRot;
uniform vec2 uGoboAnchor;
uniform float uTime;
float goboShade(vec3 wp) {
  // Follow the sun ray up to a window plane high above the table. Inside the window, the frame
  // bars cast soft stripes; outside it, the wall casts a lighter, broad shade.
  vec2 p = wp.xz - uGoboAnchor + (90.0 - wp.y) * uSunDir.xz / max(uSunDir.y, 0.15);
  float c = cos(uGoboRot), s = sin(uGoboRot);
  p = mat2(c, -s, s, c) * p + uGoboOff;
  vec2 pc = p / uGoboCell;
  vec2 cell = abs(fract(pc) - 0.5) * uGoboCell;
  vec2 toBar = uGoboCell * 0.5 - cell;
  float d = min(toBar.x, toBar.y);
  float bar = 1.0 - smoothstep(uGobo.x * 0.5 - uGobo.y, uGobo.x * 0.5 + uGobo.y, d);
  // window panes span x in [-2, 2] and y in [-3, 3] cells
  vec2 outside2 = max(vec2(-2.0, -3.0) - pc, pc - vec2(2.0, 3.0)) * uGoboCell;
  float outside = max(outside2.x, outside2.y);
  float wall = smoothstep(0.0, uGobo.y * 6.0, outside);
  float shade = max(bar * (1.0 - wall), wall * 0.55);
  return 1.0 - uGobo.z * shade;
}
`;

/** Adds world position varying, noise, gobo and the caller's extra code to a MeshStandardMaterial. */
export function patchStandard(mat, o) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared, o.uniforms ?? {});
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos;\n${o.vertexDecl ?? ''}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${o.vertexMain ?? ''}`)
      .replace('#include <project_vertex>', `#include <project_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos;\n${GLSL_NOISE}\n${GLSL_GOBO}\n${o.fragmentDecl ?? ''}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${o.fragmentColor ?? ''}`)
      .replace(
        '#include <lights_fragment_end>',
        `#include <lights_fragment_end>\n{ float gb = goboShade(vWPos); reflectedLight.directDiffuse *= gb; reflectedLight.directSpecular *= gb; }`,
      );
    o.after?.(shader);
  };
  mat.customProgramCacheKey = () => o.key;
  return mat;
}

const TOY_FRAG = /* glsl */ `
varying float vPattern;
varying vec3 vObjPos;
varying vec3 vObjN;

// Each pattern returns coverage 0..1 of the darker ink, fading to its average where cells get tiny.
float pDots(vec2 q, float freq, float r) {
  vec2 g = q * freq; float w = length(fwidth(g)) * 0.7 + 1e-4;
  float m = 1.0 - smoothstep(r - w, r + w, length(fract(g) - 0.5));
  return mix(m, 3.14 * r * r, smoothstep(0.25, 0.6, w));
}
float pStagger(vec2 q, float freq, float r) {
  vec2 g = q * freq; g.x += 0.5 * mod(floor(g.y), 2.0); float w = length(fwidth(g)) * 0.7 + 1e-4;
  float m = 1.0 - smoothstep(r - w, r + w, length(fract(g) - 0.5));
  return mix(m, 3.14 * r * r, smoothstep(0.25, 0.6, w));
}
float pGrid(vec2 q, float freq, float t) {
  vec2 g = q * freq; vec2 f = abs(fract(g) - 0.5); float w = length(fwidth(g)) * 0.7 + 1e-4;
  float m = smoothstep(0.5 - t - w, 0.5 - t + w, max(f.x, f.y));
  return mix(m, 4.0 * t, smoothstep(0.25, 0.6, w));
}
float pCheck(vec2 q, float freq) {
  vec2 g = q * freq; float w = length(fwidth(g)) + 1e-4;
  vec2 f = smoothstep(-w, w, fract(g) - 0.5) ;
  float m = abs(f.x - f.y);
  return mix(m, 0.5, smoothstep(0.3, 0.7, w));
}
float pKnit(vec2 q) {
  vec2 g = q * vec2(11.0, 15.0); float w = length(fwidth(g)) + 1e-4;
  float x = fract(g.x) - 0.5;
  float v = fract(g.y + abs(x) * 1.1);
  float m = smoothstep(0.55, 0.85, v) * (1.0 - smoothstep(0.5 - w, 0.5, abs(x)));
  return mix(m, 0.2, smoothstep(0.3, 0.8, w));
}
float pStripes(vec2 q) { float g = (q.x + q.y) * 1.8; float w = fwidth(g) + 1e-4; return smoothstep(0.5 - w, 0.5 + w, fract(g)) * (1.0 - smoothstep(1.0 - w, 1.0, fract(g))); }

float patternAt(float id, vec2 q) {
  if (id < 1.5) return pDots(q, 3.4, 0.2);
  if (id < 2.5) return pGrid(q, 2.6, 0.05);
  if (id < 3.5) return pCheck(q, 2.0) * 0.45;
  if (id < 4.5) return pStagger(q, 1.7, 0.13);
  if (id < 5.5) return pStagger(q, 5.0, 0.24);
  if (id < 6.5) return pKnit(q);
  if (id < 7.5) return pStripes(q);
  return 0.0;
}
`;

/** Shared material for everything built with Builder: vertex colours plus procedural ink patterns. */
export function createToyMaterial() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });
  return patchStandard(m, {
    key: 'toy',
    vertexDecl: 'attribute float aPattern; varying float vPattern; varying vec3 vObjPos; varying vec3 vObjN;',
    vertexMain: 'vPattern = aPattern; vObjPos = position; vObjN = normal;',
    fragmentDecl: TOY_FRAG,
    fragmentColor: /* glsl */ `
      {
        vec3 base = diffuseColor.rgb;
        if (vPattern > 0.5) {
          vec3 an = abs(normalize(vObjN)); an = pow(an, vec3(4.0)); an /= (an.x + an.y + an.z);
          float m = an.x * patternAt(vPattern, vObjPos.zy) + an.y * patternAt(vPattern, vObjPos.xz) + an.z * patternAt(vPattern, vObjPos.xy);
          if (vPattern > 6.5 && vPattern < 7.5) {
            diffuseColor.rgb = mix(base, vec3(0.03), m);
          } else if (vPattern > 5.5 && vPattern < 6.5) {
            diffuseColor.rgb = base * (1.0 - 0.22 * m);
          } else {
            diffuseColor.rgb = mix(base, pow(base, vec3(1.7)) * 0.82, m);
          }
        }
        // felt-like fuzz on every toy surface
        float fz = vnoise3(vObjPos * 34.0) * 0.6 + vnoise3(vObjPos * 9.0) * 0.4;
        diffuseColor.rgb *= 0.92 + 0.12 * fz;
      }
    `,
  });
}

/** Big sheet of paper under the whole town. */
export function createPaperMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: C.paper, roughness: 0.95, metalness: 0 });
  return patchStandard(m, {
    key: 'paper',
    fragmentColor: /* glsl */ `
      {
        vec2 q = vWPos.xz;
        float f = fbm(q * 0.06) * 0.6 + fbm(q * 0.9) * 0.4;
        float grain = vnoise(q * 14.0);
        diffuseColor.rgb *= 0.95 + 0.06 * f + 0.03 * grain;
      }
    `,
  });
}

/** Pencil ink for outlines on the paper. */
export function createPencilMaterial() {
  const m = new THREE.MeshStandardMaterial({
    color: C.pencil, roughness: 1, metalness: 0,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  return patchStandard(m, {
    key: 'pencil',
    fragmentColor: 'diffuseColor.rgb *= 0.9 + 0.2 * vnoise(vWPos.xz * 6.0);',
  });
}
