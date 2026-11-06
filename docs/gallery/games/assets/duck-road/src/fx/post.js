import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Tilt-shift: blur grows with screen distance from a horizontal focus band.
const TiltShift = {
  uniforms: {
    tDiffuse: { value: null },
    uFocusY: { value: 0.5 },
    uBand: { value: 0.07 },
    uRamp: { value: 0.38 },
    uMaxBlur: { value: 7.0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uFocusY, uBand, uRamp, uMaxBlur;
    uniform vec2 uResolution;
    varying vec2 vUv;
    void main() {
      float dy = abs(vUv.y - uFocusY);
      // the near (bottom) side blurs a bit faster, like a real lens tilted over a table
      float ramp = vUv.y < uFocusY ? uRamp * 0.8 : uRamp;
      float k = smoothstep(uBand, uBand + ramp, dy);
      float r = k * uMaxBlur;
      vec4 acc = texture2D(tDiffuse, vUv);
      float wsum = 1.0;
      if (r > 0.3) {
        const float GA = 2.39996323;
        for (int i = 1; i < 28; i++) {
          float fi = float(i);
          float rr = sqrt(fi / 28.0) * r;
          vec2 o = vec2(cos(fi * GA), sin(fi * GA)) * rr / uResolution;
          acc += texture2D(tDiffuse, vUv + o);
          wsum += 1.0;
        }
      }
      gl_FragColor = acc / wsum;
    }
  `,
};

// Final grade in display space: warm lift, gentle desaturation, vignette and grain.
const Grade = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uGrain: { value: 0.045 },
    uVignette: { value: 0.2 },
  },
  vertexShader: TiltShift.vertexShader,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uGrain, uVignette;
    uniform vec2 uResolution;
    varying vec2 vUv;
    float h(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, 0.88);
      // lifted, slightly cool shadows and a soft warm cast, like the hazy original
      c = c * 0.9 + vec3(0.075, 0.07, 0.075);
      c *= vec3(1.015, 1.0, 0.975);
      vec2 q = vUv - 0.5;
      q.x *= uResolution.x / uResolution.y;
      c *= 1.0 - uVignette * smoothstep(0.35, 1.05, length(q));
      float g = h(vUv * uResolution + fract(uTime * 7.3) * 400.0) - 0.5;
      c += g * uGrain;
      gl_FragColor = vec4(c, 1.0);
    }
  `,
};

export class Post {
  constructor(renderer, scene, camera, { quality = 'high' } = {}) {
    this.renderer = renderer;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(renderer, rt);
    this.composer.addPass(new RenderPass(scene, camera));

    this.gtao = new GTAOPass(scene, camera, size.x, size.y);
    this.gtao.output = GTAOPass.OUTPUT.Default;
    this.gtao.blendIntensity = 0.85;
    this.gtao.updateGtaoMaterial({ radius: 1.1, distanceExponent: 1.6, thickness: 1.2, scale: 1.0, samples: 16 });
    this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
    this.composer.addPass(this.gtao);

    this.tilt = new ShaderPass(TiltShift);
    this.composer.addPass(this.tilt);
    this.composer.addPass(new OutputPass());
    this.grade = new ShaderPass(Grade);
    this.composer.addPass(this.grade);

    this.setQuality(quality);
  }

  setQuality(q) {
    this.quality = q;
    this.gtao.enabled = q === 'high';
    this.tilt.enabled = q !== 'low';
  }

  setSize(w, h) {
    this.composer.setSize(w, h);
    const s = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    this.tilt.uniforms.uResolution.value.copy(s);
    this.grade.uniforms.uResolution.value.copy(s);
    // blur in device pixels, scaled to the screen height so phones and 4K look alike
    this.tilt.uniforms.uMaxBlur.value = s.y / 180;
  }

  render(t, focusY, blurAmount = 1) {
    this.tilt.uniforms.uFocusY.value = focusY;
    this.tilt.uniforms.uMaxBlur.value = (this.renderer.getDrawingBufferSize(_v).y / 130) * blurAmount;
    this.grade.uniforms.uTime.value = t;
    this.composer.render();
  }
}
const _v = new THREE.Vector2();
