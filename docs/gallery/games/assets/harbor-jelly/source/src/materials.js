import * as THREE from 'three';
import { C } from './palette.js';
import { WATER, FLOOR_Y } from './world/layout.js';
import { waves, WAVE, SURGE, GLSL_SURGE } from './world/waves.js';

/**
 * Uniforms shared by every patched material and by the water: time, the sea's tilt (the "jelly"
 * slosh), active ripples and the water colours. Everything under the water surface is tinted and
 * gets caustics in its own shader, so the transparent water on top can stay light.
 */
export const MAX_RIPPLES = 10;
export const shared = {
  uTime: { value: 0 },
  uTilt: { value: new THREE.Vector2() },
  uWaterCenter: { value: new THREE.Vector2(WATER.cx, WATER.cz) },
  uWaterBox: { value: new THREE.Vector4(WATER.x0, WATER.z0, WATER.x1, WATER.z1) },
  uShallow: { value: new THREE.Color(C.waterShallow) },
  uDeep: { value: new THREE.Color(C.waterDeep) },
  uUnderwater: { value: 1 },
  uCaustic: { value: 1 },
  uRipples: { value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, -100, 0)) },
  // mid-scale waves simulated on the CPU (world/waves.js): R = height, G = curvature
  uWave: { value: waves.texture },
  uWaveGrid: { value: new THREE.Vector4(WAVE.x0, WAVE.z0, 1 / WAVE.dx, 0) },
  // big waves (double-click): start time, amplitude, direction, life
  uSurge: { value: Array.from({ length: SURGE.n }, () => new THREE.Vector4(-100, 0, 0, 0)) },
};

export const GLSL_COMMON = /* glsl */ `
uniform float uTime;
uniform vec2 uTilt;
uniform vec2 uWaterCenter;
uniform vec4 uWaterBox;
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform float uUnderwater;
uniform float uCaustic;
uniform vec4 uRipples[${MAX_RIPPLES}];
uniform sampler2D uWave;
uniform vec4 uWaveGrid;
uniform vec4 uSurge[${SURGE.n}];

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

// Ripple rings: x, z, start time, strength.
float rippleH(vec2 p) {
  float h = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    if (age < 0.0 || age > 6.0) continue;
    float d = length(p - r.xy);
    float front = age * 3.2;
    float x = d - front;
    float env = exp(-x * x * 0.9) * exp(-age * 0.75) * r.w / (1.0 + d * 0.25);
    h += env * sin(x * 3.4) * 0.32;
  }
  return h;
}

float inWater(vec2 p) {
  return step(uWaterBox.x - 0.01, p.x) * step(p.x, uWaterBox.z + 0.01) * step(uWaterBox.y - 0.01, p.y) * step(p.y, uWaterBox.w + 0.01);
}

// Simulated waves, bilinear like WaveSim.sample(): x = height, y = curvature.
vec2 waveSample(vec2 p) {
  ivec2 sz = textureSize(uWave, 0);
  vec2 g = clamp((p - uWaveGrid.xy) * uWaveGrid.z, vec2(0.0), vec2(sz) - 1.0001);
  ivec2 i = ivec2(floor(g));
  vec2 f = g - vec2(i);
  vec2 a = texelFetch(uWave, i, 0).rg;
  vec2 b = texelFetch(uWave, i + ivec2(1, 0), 0).rg;
  vec2 c = texelFetch(uWave, i + ivec2(0, 1), 0).rg;
  vec2 d = texelFetch(uWave, i + ivec2(1, 1), 0).rg;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

${GLSL_SURGE}

// Height of the sea surface: the jelly tilt around the centre of the sea, slow swell, big waves, the
// simulated mid-scale waves and the small tap ripples.
float surfaceH(vec2 p) {
  vec2 d = p - uWaterCenter;
  float swell = 0.035 * sin(p.x * 0.55 + uTime * 1.1) + 0.03 * sin(p.y * 0.7 - uTime * 0.9 + p.x * 0.2);
  return dot(uTilt, d) + swell + surgeH(p) + waveSample(p).x + rippleH(p);
}

vec2 vhash(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
// Voronoi edges, the net of bright lines that sunlight draws on a shallow sea floor.
float causticNet(vec2 p, float t) {
  vec2 i = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(x, y);
    vec2 o = vhash(i + g);
    o = 0.5 + 0.42 * sin(t + 6.2831 * o);
    vec2 r = g + o - f;
    float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  float e = sqrt(d2) - sqrt(d1);
  return 1.0 - smoothstep(0.02, 0.16, e);
}

vec3 applyWater(vec3 col, vec3 wp, vec3 n) {
  if (uUnderwater < 0.5 || inWater(wp.xz) < 0.5) return col;
  float depth = surfaceH(wp.xz) - wp.y;
  if (depth <= -0.02) return col;
  float k = smoothstep(-0.02, 0.05, depth);
  float d = max(depth, 0.0);
  // the surface filters out most of the red, then the water fogs toward its own colour with depth
  vec3 lit = col * vec3(0.46, 0.93, 0.8);
  float fog = 1.0 - exp(-d * 0.15);
  lit = mix(lit, uDeep * 0.62, fog * 0.5);
  lit += uShallow * 0.035;
  // caustics: a broad soft net drifting slowly, mostly on surfaces that face up
  vec2 q = wp.xz + 0.35 * vec2(sin(wp.y + uTime * 0.3), cos(wp.y * 0.7 - uTime * 0.25));
  float c = causticNet(q * 0.3 + vec2(uTime * 0.025, -uTime * 0.018), uTime * 0.5) * 0.8
          + causticNet(q * 0.62 + 7.3, uTime * 0.7) * 0.2;
  float facing = clamp(n.y * 0.8 + 0.2, 0.0, 1.0);
  // waves passing overhead focus the light under their crests and spread it under the troughs
  float focus = clamp(-waveSample(wp.xz).y * 2.4, -0.6, 1.2) * uCaustic;
  lit *= 1.0 + 0.32 * focus * facing;
  lit += vec3(0.8, 1.0, 0.9) * (c * 0.09 * (1.0 + 0.8 * max(focus, 0.0)) * uCaustic + 0.045 * max(focus, 0.0)) * facing * exp(-d * 0.12);
  // a soft bright band just under the waterline
  lit += uShallow * 0.12 * exp(-d * 5.0);
  return mix(col, lit, k);
}
`;

const TOY_VERT_DECL = /* glsl */ `
attribute float aPattern;
attribute vec2 aAnim;
varying float vPattern;
varying vec3 vObjPos;
varying vec3 vObjN;
varying vec3 vWPos;
varying vec3 vWN;
uniform float uTime;
`;

const TOY_VERT_MAIN = /* glsl */ `
vPattern = aPattern;
vObjPos = position;
vObjN = normal;
if (aAnim.x > 0.0) {
  // sway in world xz: seaweed in the current, sakura branches in the wind
  float ph = aAnim.y + position.x * 0.35 + position.z * 0.27;
  transformed.x += aAnim.x * (sin(uTime * 1.3 + ph) * 0.7 + sin(uTime * 2.1 + ph * 1.7) * 0.3);
  transformed.z += aAnim.x * 0.6 * cos(uTime * 1.1 + ph * 1.3);
}
`;

const TOY_VERT_POS = /* glsl */ `
{
  vec4 wp4 = vec4(transformed, 1.0);
  vec3 wn = objectNormal;
  #ifdef USE_INSTANCING
    wp4 = instanceMatrix * wp4;
    wn = mat3(instanceMatrix) * wn;
  #endif
  vWPos = (modelMatrix * wp4).xyz;
  vWN = normalize(mat3(modelMatrix) * wn);
}
`;

const TOY_FRAG_DECL = /* glsl */ `
varying float vPattern;
varying vec3 vObjPos;
varying vec3 vObjN;
varying vec3 vWPos;
varying vec3 vWN;
${GLSL_COMMON}

float lines(float v, float freq, float width) {
  float g = v * freq; float w = fwidth(g) + 1e-4;
  float f = abs(fract(g) - 0.5);
  float m = smoothstep(0.5 - width - w, 0.5 - width + w, f);
  return mix(m, 2.0 * width, smoothstep(0.3, 0.7, w));
}
`;

// pattern ids
export const P = {
  none: 0,
  tiles: 1, // roof tile rows: horizontal lines plus staggered seams
  planksX: 2, // board seams at constant x
  planksZ: 3, // board seams at constant z
  blossom: 4, // speckled sakura puffs
  panels: 5, // concrete panels on the quay wall
  stripes: 6, // awning stripes (alternating along z)
  corrugated: 7, // container ribs
  stone: 8, // blotchy stone
};

const TOY_FRAG_COLOR = /* glsl */ `
{
  vec3 base = diffuseColor.rgb;
  vec3 an = abs(normalize(vObjN));
  float id = vPattern;
  if (id > 0.5 && id < 1.5) {
    float rows = lines(vObjPos.y, 7.0, 0.09);
    float seams = lines(vObjPos.x + vObjPos.z + 0.5 * floor(vObjPos.y * 7.0), 5.0, 0.05) * 0.6;
    diffuseColor.rgb = base * (1.0 - 0.28 * max(rows, seams * (1.0 - an.y)));
  } else if (id > 1.5 && id < 2.5) {
    float m = lines(vObjPos.x, 3.2, 0.05);
    diffuseColor.rgb = base * (1.0 - 0.22 * m) * (0.95 + 0.1 * hash12(vec2(floor(vObjPos.x * 3.2), 1.0)));
  } else if (id > 2.5 && id < 3.5) {
    float m = lines(vObjPos.z, 3.2, 0.05);
    diffuseColor.rgb = base * (1.0 - 0.22 * m) * (0.95 + 0.1 * hash12(vec2(floor(vObjPos.z * 3.2), 2.0)));
  } else if (id > 3.5 && id < 4.5) {
    // clusters of tiny blossoms: pale petals with deeper pink hearts
    float s = vnoise3(vObjPos * 7.0);
    float d = vnoise3(vObjPos * 26.0 + 3.0);
    diffuseColor.rgb = base * (0.9 + 0.16 * s);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.97, 0.97), smoothstep(0.66, 0.86, d) * 0.55);
    diffuseColor.rgb = mix(diffuseColor.rgb, base * vec3(0.86, 0.66, 0.72), smoothstep(0.7, 0.92, 1.0 - d) * 0.6);
  } else if (id > 4.5 && id < 5.5) {
    float m = max(lines(vObjPos.z, 0.42, 0.012), lines(vObjPos.y + 0.6, 0.5, 0.012));
    float stain = smoothstep(0.9, -0.6, vObjPos.y) * 0.18;
    float n = vnoise(vObjPos.zy * 2.0);
    diffuseColor.rgb = base * (1.0 - 0.18 * m - stain) * (0.94 + 0.1 * n);
  } else if (id > 5.5 && id < 6.5) {
    float g = vObjPos.z * 3.2; float w = fwidth(g) + 1e-4;
    float m = smoothstep(0.5 - w, 0.5 + w, fract(g));
    diffuseColor.rgb = mix(base, vec3(0.98, 0.9, 0.84), m * 0.65);
  } else if (id > 6.5 && id < 7.5) {
    float m = lines(vObjPos.x * an.z + vObjPos.z * an.x, 9.0, 0.16) * (1.0 - an.y);
    diffuseColor.rgb = base * (1.0 - 0.16 * m);
  } else if (id > 7.5 && id < 8.5) {
    float n = vnoise3(vObjPos * 3.0) * 0.6 + vnoise3(vObjPos * 9.0) * 0.4;
    diffuseColor.rgb = base * (0.85 + 0.25 * n);
  }
  // a faint painterly grain on everything
  diffuseColor.rgb *= 0.96 + 0.06 * vnoise3(vObjPos * 17.0);
}
`;

/** Shared material for everything built with Builder (vertex colours + patterns + water tint). */
export function patchToy(mat, key = 'toy', extra = {}) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared, extra.uniforms ?? {});
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${TOY_VERT_DECL}\n${extra.vertexDecl ?? ''}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${TOY_VERT_MAIN}\n${extra.vertexMain ?? ''}`)
      .replace('#include <project_vertex>', `#include <project_vertex>\n${TOY_VERT_POS}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${TOY_FRAG_DECL}\n${extra.fragmentDecl ?? ''}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${TOY_FRAG_COLOR}\n${extra.fragmentColor ?? ''}`)
      .replace('#include <opaque_fragment>', extra.noWater ? '#include <opaque_fragment>' : `outgoingLight = applyWater(outgoingLight, vWPos, normalize(vWN));\n#include <opaque_fragment>`);
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}

export function createToyMaterial() {
  return patchToy(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 }), 'toy');
}

/** Glowing bits (lamp globes, lighthouse lamp): unlit, still tinted when under water. */
export function createGlowMaterial(color) {
  return new THREE.MeshBasicMaterial({ color, toneMapped: false });
}

/** Ground strata on the sides of the block, banded by height: soil above the sea floor, a sand band, then layers. */
export function createStrataMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 });
  const cols = C.strata.map((c) => new THREE.Color(c));
  return patchToy(m, 'strata', {
    noWater: true,
    uniforms: { uStrata: { value: cols }, uSoil: { value: new THREE.Color(C.soil) } },
    fragmentDecl: `uniform vec3 uStrata[${cols.length}]; uniform vec3 uSoil;`,
    fragmentColor: /* glsl */ `
      {
        float wob = 0.12 * sin(vWPos.x * 0.35 + vWPos.z * 0.22) + 0.08 * (vnoise(vWPos.xz * 0.7 + vWPos.y) - 0.5);
        float y = vWPos.y + wob;
        vec3 c;
        if (vWPos.y > ${(FLOOR_Y + 0.01).toFixed(3)}) {
          c = uSoil * (0.92 + 0.12 * vnoise(vec2(vWPos.x + vWPos.z, vWPos.y) * 3.0));
          c = mix(c, uStrata[2], smoothstep(0.9, 1.25, vWPos.y) * 0.6);
        } else if (y > ${(FLOOR_Y - 1.0).toFixed(3)}) {
          c = uStrata[0];
        } else {
          float t = (${(FLOOR_Y - 1.0).toFixed(3)} - y) / 0.62;
          int i = int(floor(t));
          int k = 1 + i - (i / ${cols.length - 1}) * ${cols.length - 1};
          c = uStrata[1];
          for (int j = 1; j < ${cols.length}; j++) if (j == k) c = uStrata[j];
          float seam = 1.0 - smoothstep(0.0, 0.08, fract(t));
          c *= 1.0 - 0.1 * seam;
        }
        c *= 0.95 + 0.08 * vnoise(vec2(vWPos.x + vWPos.z, vWPos.y * 5.0));
        diffuseColor.rgb = c;
      }
    `,
  });
}
