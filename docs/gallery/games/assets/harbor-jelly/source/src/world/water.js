import * as THREE from 'three';
import { shared, GLSL_COMMON, MAX_RIPPLES } from '../materials.js';
import { C } from '../palette.js';
import { WATER, FLOOR_Y } from './layout.js';
import { waves, surgeHeight } from './waves.js';

// how hard a finger presses into the jelly, how far the whole sea leans while it is dragged around,
// and how strongly the sloshing of that lean throws waves off the walls
const PRESS_AMP = 7;
const PRESS_SIGMA = 1.3;
const TILT_SCALE = 0.008;
const TILT_MAX = 0.07;
const WALL_GAIN = 1.4;

const SURF_VERT = /* glsl */ `
${GLSL_COMMON}
attribute float aTop; // walls: 1 on the top edge (follows the surface), 0 at the bottom
uniform float uIsWall;
varying vec3 vWPos;
varying vec3 vN;
varying float vDepthT;
varying float vSim;
varying float vSimC;
varying vec2 vSimG;
varying float vSurge;
void main() {
  vec3 p = position;
  float h = surfaceH(p.xz);
  vec2 ws = waveSample(p.xz);
  vSimG = vec2(waveSample(p.xz + vec2(0.25, 0.0)).x - waveSample(p.xz - vec2(0.25, 0.0)).x,
               waveSample(p.xz + vec2(0.0, 0.25)).x - waveSample(p.xz - vec2(0.0, 0.25)).x) * 2.0;
  // the big wave joins the simulated ones for shading: height, slope (along x) and curvature
  float s0 = surgeH(p.xz);
  float sxp = surgeH(p.xz + vec2(0.3, 0.0)), sxm = surgeH(p.xz - vec2(0.3, 0.0));
  float szp = surgeH(p.xz + vec2(0.0, 0.3)), szm = surgeH(p.xz - vec2(0.0, 0.3));
  vSurge = s0;
  vSim = ws.x + s0;
  vSimC = ws.y + (sxp + sxm + szp + szm - 4.0 * s0) / 0.09;
  vSimG += vec2(sxp - sxm, szp - szm) / 0.6;
  vec3 n = vec3(0.0, 1.0, 0.0);
  if (uIsWall > 0.5) {
    p.y = mix(p.y, h, aTop);
    vDepthT = 1.0 - aTop;
    n = normal;
  } else {
    p.y = h;
    float e = 0.15;
    float hx = surfaceH(p.xz + vec2(e, 0.0)) - surfaceH(p.xz - vec2(e, 0.0));
    float hz = surfaceH(p.xz + vec2(0.0, e)) - surfaceH(p.xz - vec2(0.0, e));
    n = normalize(vec3(-hx, 2.0 * e, -hz));
    vDepthT = 0.0;
  }
  vN = n;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vWPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const SURF_FRAG = /* glsl */ `
${GLSL_COMMON}
uniform vec3 uSky;
uniform vec3 uSunDir;
uniform float uIsWall;
uniform float uSurfaceAlpha;
uniform vec4 uPress; // x, z, strength
uniform sampler2D uScene; // the frame so far, everything but the surface (display colours)
uniform vec2 uSceneSize;
uniform float uRefract; // 0: plain alpha blending
varying vec3 vWPos;
varying vec3 vN;
varying float vDepthT;
varying float vSim;
varying float vSimC;
varying vec2 vSimG;
varying float vSurge;

// a soft ring around the finger while it presses into the water
float pressGlow(vec2 p) {
  if (uPress.z <= 0.0) return 0.0;
  float d = length(p - uPress.xy);
  float x = d - 2.0;
  return (exp(-x * x * 9.0) * 0.7 + exp(-d * d * 0.8) * 0.18) * uPress.z;
}

float ringGlow(vec2 p) {
  float g = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    if (age < 0.0 || age > 6.0) continue;
    float d = length(p - r.xy);
    float x = d - age * 3.2;
    float fade = exp(-age * 0.7) * r.w * smoothstep(0.0, 0.15, age);
    g += exp(-x * x * 26.0) * fade;
    g += exp(-(x + 0.95) * (x + 0.95) * 30.0) * fade * 0.6;
    g += exp(-(x + 1.9) * (x + 1.9) * 34.0) * fade * 0.3;
  }
  return g;
}

void main() {
  vec3 V = normalize(cameraPosition - vWPos);
  vec3 N = normalize(vN);
  if (uIsWall > 0.5) {
    // glass-like cut face: clear cyan, brighter near the surface line and at the bottom edge
    float top = smoothstep(0.06, 0.0, vDepthT);
    float meniscus = smoothstep(0.035, 0.0, vDepthT);
    float bottom = smoothstep(0.9, 1.0, vDepthT);
    vec3 col = mix(uShallow * 1.05, mix(uShallow, uDeep, 0.45), vDepthT);
    col = mix(col, vec3(0.92, 1.0, 0.97), meniscus * 0.6);
    float a = mix(0.42, 0.62, vDepthT) + top * 0.2 + bottom * 0.1;
    // caustic shimmer through the glass
    float c = causticNet(vec2(vWPos.x + vWPos.z, vWPos.y * 1.6) * 0.45 + uTime * 0.03, uTime * 0.6);
    col += c * 0.05;
    gl_FragColor = vec4(col, a);
  } else {
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
    vec3 col = mix(uShallow, uSky, 0.35 + 0.65 * fres);
    // sun glints
    vec3 H = normalize(uSunDir + V);
    float spec = pow(max(dot(N, H), 0.0), 220.0) * 1.6;
    // soft cell sparkle on the surface itself
    float c = causticNet(vWPos.xz * 0.55 + vec2(uTime * 0.05, 0.0), uTime * 0.9);
    float ring = ringGlow(vWPos.xz) + pressGlow(vWPos.xz);
    // the simulated waves, drawn a little like a painting: slopes facing the sun lighter, slopes
    // facing away darker, crests catching a touch of foam-white, troughs clearer
    float lean = clamp(dot(-vSimG, normalize(uSunDir.xz)) * 2.0, -1.0, 1.0);
    // a crest line where the surface is both raised and sharply curved over
    float crest = smoothstep(0.05, 0.3, -vSimC) * smoothstep(0.01, 0.06, vSim);
    float trough = smoothstep(0.015, 0.16, -vSim);
    // white water on the big wave's crest, broken into streaks
    float streak = vnoise(vWPos.xz * vec2(1.1, 3.4) + vec2(uTime * 1.6, 0.0)) * 0.6 + vnoise(vWPos.xz * 4.0 - uTime * 0.7) * 0.4;
    float foam = smoothstep(0.28, 0.58, vSurge) * smoothstep(0.25, 0.7, streak + smoothstep(0.45, 0.65, vSurge) * 0.5);
    crest = max(crest, foam);
    col += vec3(1.0) * (spec + c * 0.05 + ring * 0.55 + crest * 0.55 + max(lean, 0.0) * 0.2);
    col *= 1.0 - max(-lean, 0.0) * 0.2;
    float a = mix(0.12, 0.62, fres) + c * 0.05 + ring * 0.45 + spec * 0.4 + crest * 0.3 + abs(lean) * 0.1 - trough * 0.04;
    a = clamp(a * uSurfaceAlpha, 0.0, 0.95);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    if (uRefract > 0.0) {
      // refraction: the sea floor seen through the surface shifts with the local slope of the waves
      // (not the jelly's overall lean, which would slide the whole picture)
      vec2 g = -N.xz / max(N.y, 0.2) - uTilt;
      vec2 o = (viewMatrix * vec4(g.x, 0.0, g.y, 0.0)).xy / max(length(cameraPosition - vWPos), 1.0);
      float edge = smoothstep(0.0, 1.5, min(min(vWPos.x - uWaterBox.x, vWPos.z - uWaterBox.y), uWaterBox.w - vWPos.z));
      vec2 uv = gl_FragCoord.xy / uSceneSize + o * uRefract * edge;
      vec3 refr = texture2D(uScene, uv).rgb;
      gl_FragColor = vec4(mix(refr, gl_FragColor.rgb, a), 1.0);
    } else {
      gl_FragColor.a = a;
    }
    return;
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export class Water {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'water';
    this.time = 0;
    this.tilt = new THREE.Vector2();
    this.tiltVel = new THREE.Vector2();
    this.tiltTarget = new THREE.Vector2();
    this.holding = false;
    this.waves = waves;
    // a finger pressing into the jelly: eased position, start point, how far it has sunk in
    this.press = { on: false, x: 0, z: 0, tx: 0, tz: 0, sx: 0, sz: 0, depth: 0 };
    this.rippleIndex = 0;
    this.ripples = shared.uRipples.value;

    const common = {
      ...shared,
      uSky: { value: new THREE.Color(C.waterSky) },
      uSunDir: { value: new THREE.Vector3(-0.3, 0.8, -0.5).normalize() },
      uSurfaceAlpha: { value: 1 },
      uPress: { value: new THREE.Vector4(0, 0, 0, 0) },
      uScene: { value: null },
      uSceneSize: { value: new THREE.Vector2(1, 1) },
      uRefract: { value: 0 },
    };
    this.uniforms = common;

    const W = WATER.x1 - WATER.x0;
    const D = WATER.z1 - WATER.z0;
    const surf = new THREE.PlaneGeometry(W, D, 96, 132);
    surf.rotateX(-Math.PI / 2);
    surf.translate(WATER.cx, 0, WATER.cz);
    surf.setAttribute('aTop', new THREE.BufferAttribute(new Float32Array(surf.attributes.position.count), 1));
    this.surfaceMat = new THREE.ShaderMaterial({
      uniforms: { ...common, uIsWall: { value: 0 } },
      vertexShader: SURF_VERT,
      fragmentShader: SURF_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.surface = new THREE.Mesh(surf, this.surfaceMat);
    this.surface.renderOrder = 2;
    // drawn in a second pass on layer 1, after the rest of the frame has been copied for refraction
    this.surface.layers.set(1);
    this.group.add(this.surface);

    // cut faces of the water on the open sides of the block (west, north, south)
    const walls = [];
    const seg = 64;
    const addWall = (ax, az, bx, bz, nx, nz) => {
      const pos = [], top = [], nrm = [];
      for (let i = 0; i < seg; i++) {
        const t0 = i / seg, t1 = (i + 1) / seg;
        const x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0;
        const x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1;
        const quad = [[x0, FLOOR_Y, z0, 0], [x1, FLOOR_Y, z1, 0], [x1, 0, z1, 1], [x0, FLOOR_Y, z0, 0], [x1, 0, z1, 1], [x0, 0, z0, 1]];
        for (const [x, y, z, tp] of quad) { pos.push(x, y, z); top.push(tp); nrm.push(nx, 0, nz); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
      g.setAttribute('aTop', new THREE.Float32BufferAttribute(top, 1));
      walls.push(g);
    };
    addWall(WATER.x0, WATER.z1, WATER.x0, WATER.z0, -1, 0); // west
    addWall(WATER.x0, WATER.z1, WATER.x1, WATER.z1, 0, 1); // south
    addWall(WATER.x0, WATER.z0, WATER.x1, WATER.z0, 0, -1); // north
    this.wallMat = new THREE.ShaderMaterial({
      uniforms: { ...common, uIsWall: { value: 1 } },
      vertexShader: SURF_VERT,
      fragmentShader: SURF_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    for (const g of walls) {
      const m = new THREE.Mesh(g, this.wallMat);
      m.renderOrder = 1;
      this.group.add(m);
    }
  }

  /** Same height function as surfaceH() in the shaders. */
  heightAt(x, z) {
    const t = this.time;
    const dx = x - WATER.cx, dz = z - WATER.cz;
    let h = this.tilt.x * dx + this.tilt.y * dz + waves.sample(x, z) + this.surgeAt(x, z);
    h += 0.035 * Math.sin(x * 0.55 + t * 1.1) + 0.03 * Math.sin(z * 0.7 - t * 0.9 + x * 0.2);
    for (const r of this.ripples) {
      const age = t - r.z;
      if (age < 0 || age > 6) continue;
      const d = Math.hypot(x - r.x, z - r.y);
      const xx = d - age * 3.2;
      const env = Math.exp(-xx * xx * 0.9) * Math.exp(-age * 0.75) * r.w / (1 + d * 0.25);
      h += env * Math.sin(xx * 3.4) * 0.32;
    }
    return h;
  }

  /** Refraction source: a copy of the frame drawn so far (null = no refraction). */
  setSceneTexture(tex, size, strength = 13) {
    this.uniforms.uScene.value = tex;
    this.uniforms.uSceneSize.value.copy(size);
    this.uniforms.uRefract.value = tex ? strength : 0;
  }

  /** Height of the big waves at (x, z) (same as surgeH() in the shaders). */
  surgeAt(x, z) {
    let h = 0;
    for (const u of shared.uSurge.value) h += surgeHeight(u, this.time, x, z);
    return h;
  }

  inside(x, z) {
    return x >= WATER.x0 && x <= WATER.x1 && z >= WATER.z0 && z <= WATER.z1;
  }

  ripple(x, z, strength = 1) {
    const r = this.ripples[this.rippleIndex];
    r.set(x, z, this.time, strength);
    this.rippleIndex = (this.rippleIndex + 1) % MAX_RIPPLES;
  }

  /** A tap: small crisp rings plus a broader wave that runs off across the sea and bounces back. */
  tap(x, z, strength = 1) {
    this.ripple(x, z, strength);
    waves.impulse(x, z, 5 * strength, 0.8);
  }

  /** Something moving through the water (a hull, a drop): a kick into the simulated waves only. */
  disturb(x, z, amp, sigma = 0.8) {
    if (this.inside(x, z)) waves.impulse(x, z, amp, sigma);
  }

  /** Long press: the finger sinks into the jelly and the water around it bulges up. */
  pressStart(x, z) {
    const p = this.press;
    p.on = true;
    p.x = p.tx = p.sx = x;
    p.z = p.tz = p.sz = z;
    this.holding = true;
  }

  /** Dragging while pressed: the dent follows the finger and the whole sea leans that way. */
  pressMove(x, z) {
    const p = this.press;
    if (!p.on) return;
    p.tx = THREE.MathUtils.clamp(x, WATER.x0 + 0.4, WATER.x1 - 0.4);
    p.tz = THREE.MathUtils.clamp(z, WATER.z0 + 0.4, WATER.z1 - 0.4);
    this.setTiltTarget(x - p.sx, z - p.sz);
  }

  /** Let go: the dent springs back up and the sea wobbles back to level. */
  pressEnd() {
    const p = this.press;
    if (!p.on) return;
    p.on = false;
    this.release();
    this.ripple(p.x, p.z, 0.6);
  }

  get pressing() { return this.press.on; }

  /** The sea leans toward (dx, dz), like a block of jelly being pushed. */
  setTiltTarget(dx, dz) {
    const v = new THREE.Vector2(dx, dz).multiplyScalar(TILT_SCALE);
    if (v.length() > TILT_MAX) v.setLength(TILT_MAX);
    this.tiltTarget.copy(v);
    this.holding = true;
  }

  release() {
    this.tiltTarget.set(0, 0);
    this.holding = false;
  }

  /** A shove (a big wave slamming into the quay): the jelly sways and wobbles back. */
  kick(vx, vz) {
    this.tiltVel.x += vx;
    this.tiltVel.y += vz;
  }

  update(dt, time) {
    this.time = time;
    // damped spring; softer while held, wobbly when let go
    const k = this.holding ? 26 : 30;
    const c = this.holding ? 9 : 2.6;
    const ax = (this.tiltTarget.x - this.tilt.x) * k - this.tiltVel.x * c;
    const az = (this.tiltTarget.y - this.tilt.y) * k - this.tiltVel.y * c;
    this.tiltVel.x += ax * dt;
    this.tiltVel.y += az * dt;
    this.tilt.x += this.tiltVel.x * dt;
    this.tilt.y += this.tiltVel.y * dt;
    shared.uTilt.value.copy(this.tilt);

    // the simulated waves: the walls answer the tilt's motion, the finger presses in
    waves.beginFrame(this.tiltVel.x, this.tiltVel.y, WALL_GAIN);
    const p = this.press;
    p.depth = p.on ? Math.min(1, p.depth + dt / 0.2) : Math.max(0, p.depth - dt / 0.05);
    const follow = 1 - Math.exp(-dt * 14);
    p.x += (p.tx - p.x) * follow;
    p.z += (p.tz - p.z) * follow;
    const sink = p.depth * p.depth * (3 - 2 * p.depth);
    if (sink > 0) waves.pressure(p.x, p.z, PRESS_AMP * sink, PRESS_SIGMA);
    this.uniforms.uPress.value.set(p.x, p.z, p.on ? sink : 0, 0);
    waves.step(dt);
    waves.upload();
  }
}
