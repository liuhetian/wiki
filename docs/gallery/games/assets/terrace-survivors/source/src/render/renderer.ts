// WebGL renderer, camera, sky dome, lights and the post chain. All custom shaders share the fog/time/light uniforms in
// `shared` so one biome switch recolours everything.

import {
  BackSide,
  Color,
  DirectionalLight,
  Fog,
  HalfFloatType,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, VignetteEffect } from 'postprocessing';
import { PixelOutlineEffect, ToonGradeEffect } from './post';

export interface Shared {
  uTime: { value: number };
  uFogColor: { value: Color };
  uFogNear: { value: number };
  uFogFar: { value: number };
  uLight: { value: Color };
  uSunDir: { value: Vector3 };
}

export interface EnvLook {
  fog: number;
  skyTop: number;
  skyHorizon: number;
  sun: number;
  light: number;
  hemiSky: number;
  hemiGround: number;
}

export class Renderer {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(70, 1, 0.1, 600);
  readonly composer: EffectComposer;
  readonly shared: Shared = {
    uTime: { value: 0 },
    uFogColor: { value: new Color(0xbfe3ff) },
    uFogNear: { value: 40 },
    uFogFar: { value: 160 },
    uLight: { value: new Color(1, 1, 1) },
    uSunDir: { value: new Vector3(0.45, 0.8, 0.35).normalize() },
  };
  private sky: Mesh;
  private skyMat: ShaderMaterial;
  private hemi = new HemisphereLight(0xdff0ff, 0x8a7a5a, 1.6);
  private sun = new DirectionalLight(0xfff4d6, 2.2);
  private outline = new PixelOutlineEffect();
  private bloom: BloomEffect;
  private pixelScale: number;

  constructor(readonly canvas: HTMLCanvasElement, pixelScale = 1) {
    this.pixelScale = pixelScale;
    this.renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.info.autoReset = false;
    this.scene.fog = new Fog(0xbfe3ff, 40, 160);
    this.sun.position.set(60, 120, 40);
    this.scene.add(this.hemi, this.sun);

    this.skyMat = new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uTop: { value: new Color(0x5aa0e8) }, uHorizon: { value: new Color(0xcfe8ff) }, uSunDir: this.shared.uSunDir },
      vertexShader: /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.); gl_Position = p.xyww; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop, uHorizon, uSunDir; varying vec3 vDir;
        void main(){
          float h = clamp(vDir.y, 0., 1.);
          // Banded gradient (pixel-art skies use flat steps) with a dithered boundary.
          float k = pow(h, 0.55);
          vec2 p = floor(gl_FragCoord.xy / 3.);
          float d = fract(p.x * .5 + p.y * p.y * .75) - .5;
          k = floor(k * 7. + d * .6) / 7.;
          vec3 c = mix(uHorizon, uTop, k);
          float s = dot(normalize(vDir), uSunDir);
          c += vec3(1., .92, .7) * (step(.9985, s) * 1.6 + smoothstep(.97, 1., s) * .25);
          gl_FragColor = vec4(c, 1.);
        }`,
    });
    this.sky = new Mesh(new SphereGeometry(500, 32, 16), this.skyMat);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -100;
    this.scene.add(this.sky);

    this.composer = new EffectComposer(this.renderer, { frameBufferType: HalfFloatType });
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.9, luminanceSmoothing: 0.15, intensity: 0.65, radius: 0.6 });
    const vignette = new VignetteEffect({ offset: 0.38, darkness: 0.42 });
    this.composer.addPass(new EffectPass(this.camera, this.outline, new ToonGradeEffect(), this.bloom, vignette));

    addEventListener('resize', () => this.resize());
    this.resize();
  }

  setEnvironment(e: EnvLook): void {
    this.shared.uFogColor.value.setHex(e.fog);
    (this.scene.fog as Fog).color.setHex(e.fog);
    (this.skyMat.uniforms.uTop.value as Color).setHex(e.skyTop);
    (this.skyMat.uniforms.uHorizon.value as Color).setHex(e.skyHorizon);
    this.shared.uLight.value.setHex(e.sun).multiplyScalar(e.light);
    this.sun.color.setHex(e.sun);
    this.hemi.color.setHex(e.hemiSky);
    this.hemi.groundColor.setHex(e.hemiGround);
    this.renderer.setClearColor(e.fog);
  }

  resize(): void {
    const w = innerWidth,
      h = innerHeight;
    const px = this.pixelScale > 1;
    // Cap the backbuffer around 2.2 MP: pixel art does not need retina resolution, and it keeps the outline 1 px wide.
    let ratio = px ? 1 / this.pixelScale : Math.min(devicePixelRatio, Math.max(0.5, Math.sqrt(2.2e6 / (w * h))));
    ratio = Math.round(ratio * 100) / 100;
    this.canvas.style.imageRendering = px ? 'pixelated' : 'auto';
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render(dt: number): void {
    this.shared.uTime.value += dt;
    this.sky.position.copy(this.camera.position);
    this.outline.setFog(this.shared.uFogNear.value, this.shared.uFogFar.value);
    this.renderer.info.reset();
    this.composer.render(dt);
  }
}
