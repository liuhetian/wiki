import * as THREE from 'three';
import { C } from '../palette.js';
import { ROAD } from './roadPath.js';
import { patchStandard } from '../materials.js';

export const CROSS_HALF = 1.7; // crosswalk half length along s

/** Uniforms every road chunk shares: how far the paint has reached, sizes and colours. */
export function createRoadShared() {
  return {
    uRollerS: { value: 0 },
    uCrossHalf: { value: CROSS_HALF },
    uHalfW: { value: ROAD.halfWidth },
    uSide: { value: ROAD.sidewalk },
    uRoadCol: { value: new THREE.Color(C.road) },
    uCurbCol: { value: new THREE.Color(C.curb) },
    uPencilCol: { value: new THREE.Color(C.pencil) },
    uLineCol: { value: new THREE.Color(0xf4f1ea) },
  };
}

/**
 * One stretch of road [s0, s1] as a ribbon whose UV is (s, d), built around `origin` so the
 * vertices stay small. The shader draws pencil lines ahead of the roller and blue asphalt with
 * markings, a ragged paint edge and a curb strip behind it. `crossS` puts a crosswalk in this
 * stretch (null for none).
 */
export function createRoadChunk(path, s0, s1, shared, crossS) {
  const outer = ROAD.halfWidth + ROAD.sidewalk + 0.2;
  const origin = path.toWorld(s0, 0);
  const rows = Math.round((s1 - s0) / 0.5) + 1;
  const pos = new Float32Array(rows * 2 * 3);
  const uv = new Float32Array(rows * 2 * 2);
  const nrm = new Float32Array(rows * 2 * 3);
  const idx = [];
  const p = new THREE.Vector3();
  for (let r = 0; r < rows; r++) {
    const s = Math.min(s1, s0 + r * 0.5);
    for (let k = 0; k < 2; k++) {
      // left edge first; with +Z forward and +X to the left this winds counter-clockwise from above
      const d = k === 0 ? outer : -outer;
      path.toWorld(s, d, p);
      const i = r * 2 + k;
      pos.set([p.x - origin.x, 0.02, p.z - origin.z], i * 3);
      uv.set([s, d], i * 2);
      nrm.set([0, 1, 0], i * 3);
    }
    if (r > 0) {
      const a = (r - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeBoundingSphere();

  const uniforms = { ...shared, uCrossS: { value: crossS ?? -1e6 } };
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, transparent: true, depthWrite: false });
  patchStandard(mat, {
    key: 'road',
    uniforms,
    vertexDecl: 'varying vec2 vRoad;',
    vertexMain: 'vRoad = uv;',
    fragmentDecl: /* glsl */ `
      varying vec2 vRoad;
      uniform float uRollerS, uCrossS, uCrossHalf, uHalfW, uSide;
      uniform vec3 uRoadCol, uCurbCol, uPencilCol, uLineCol;
      float lineAA(float dist, float hw) { float w = fwidth(dist) + 1e-4; return 1.0 - smoothstep(hw - w, hw + w, abs(dist)); }
      float fill(float sd) { float w = fwidth(sd) + 1e-4; return 1.0 - smoothstep(-w, w, sd); }
      float arrowSD(float a, float b) {
        float shaft = max(abs(b) - 0.13, max(-1.7 - a, a - 0.45));
        float head = max(0.35 - a, abs(b) - 0.6 * (1.45 - a));
        return min(shaft, head);
      }
    `,
    fragmentColor: /* glsl */ `
      {
        float s = vRoad.x, d = vRoad.y, ad = abs(d);
        float seed = d > 0.0 ? 17.0 : 3.0;

        // ---- where the paint has reached: a ragged front just under the drum
        float front = uRollerS + (vnoise(vec2(d * 1.6, 5.0)) - 0.5) * 0.7;
        float wS = fwidth(s) + 1e-4;
        float painted = 1.0 - smoothstep(front - wS, front + wS, s);

        // ---- crosswalk stripes run along s and repeat across d
        float inCross = step(abs(s - uCrossS), uCrossHalf) * step(ad, uHalfW - 0.55);
        float period = 1.05, sw = 0.58;
        float fu = fract((d + 50.0) / period);
        float stripe = fill(abs(fu - sw * 0.5) * period - sw * 0.5 * period);

        // ---- pencil drawing (unpaved)
        float pen = lineAA(ad - uHalfW, 0.045);
        pen = max(pen, 0.75 * lineAA(ad - (uHalfW + uSide), 0.035));
        pen = max(pen, lineAA(d, 0.04) * step(fract(s / 3.0), 0.5) * (1.0 - inCross));
        {
          float de = min(abs(fu - 0.0), min(abs(fu - sw), abs(fu - 1.0))) * period;
          float edgeD = lineAA(de, 0.035) * step(fu, sw + 0.03 / period) * step(abs(s - uCrossS), uCrossHalf + 0.03);
          float capD = lineAA(abs(s - uCrossS) - uCrossHalf, 0.035) * step(fu, sw);
          pen = max(pen, max(edgeD, capD) * step(ad, uHalfW - 0.5));
        }

        // ---- painted asphalt
        vec3 col = uRoadCol * (0.88 + 0.2 * fbm(vec2(s, d) * 0.3));
        col *= 0.95 + 0.08 * vnoise(vec2(s, d) * 6.0);
        {
          // sparse pale flecks, round so they don't read as pixels
          vec2 g = vec2(s, d) * 3.0;
          vec2 id = floor(g);
          float h = hash12(id);
          vec2 c = vec2(hash12(id + 7.1), hash12(id + 3.7)) * 0.6 + 0.2;
          float r = length(fract(g) - c);
          float fw = fwidth(g.x) + 1e-4;
          float dot = (1.0 - smoothstep(0.06 - fw, 0.06 + fw, r)) * step(0.82, h);
          col = mix(col, vec3(0.66, 0.7, 0.9), dot * 0.55);
        }
        float scratch = hash12(floor(vec2(s * 1.5, d * 9.0)));
        col = mix(col, col * 1.25, step(0.996, scratch) * 0.6);

        float marks = lineAA(ad - (uHalfW - 0.3), 0.085);
        marks = max(marks, lineAA(ad - uHalfW * 0.36, 0.085) * step(fract(s / 4.2), 0.45) * (1.0 - step(abs(s - uCrossS), uCrossHalf + 2.0)));
        {
          float cell = mod(s, 34.0) - 17.0;
          float lane = uHalfW * 0.69;
          float b = d - sign(d) * lane;
          float a = d > 0.0 ? cell : -cell;
          marks = max(marks, fill(arrowSD(a, b)) * (1.0 - step(abs(s - uCrossS), uCrossHalf + 3.0)));
        }
        marks = max(marks, stripe * inCross);
        col = mix(col, uLineCol, marks * 0.95);
        {
          float mc = mod(s + 9.0, 41.0) - 20.5;
          float r = length(vec2(mc, d - 1.5));
          col = mix(col, col * 0.62, lineAA(r - 0.42, 0.06) + fill(r - 0.3) * 0.25);
        }

        // ragged paint edge spilling slightly past the white line, then the curb strip
        float edge = uHalfW - 0.02 + (vnoise(vec2(s * 1.2, seed)) - 0.5) * 0.32 + (vnoise(vec2(s * 4.0, seed + 4.0)) - 0.5) * 0.06;
        float inPaint = fill(ad - edge);
        vec3 curb = uCurbCol * (0.95 + 0.06 * vnoise(vec2(s, d) * 3.0));
        curb = mix(curb, curb * 0.8, lineAA(ad - (uHalfW + uSide), 0.05));
        vec3 paved = mix(curb, col, inPaint);
        float inWidth = fill(ad - (uHalfW + uSide + 0.04));

        float a = max(painted * inWidth, pen * 0.85 * (1.0 - painted));
        diffuseColor.rgb = mix(uPencilCol, paved, painted);
        diffuseColor.a = a;
        if (a < 0.01) discard;
      }
    `,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(origin);
  mesh.receiveShadow = true;
  mesh.renderOrder = 1;
  return mesh;
}
