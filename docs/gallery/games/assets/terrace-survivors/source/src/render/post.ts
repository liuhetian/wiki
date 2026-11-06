// Custom post effects for pmndrs/postprocessing:
//  - PixelOutline: dark silhouette lines from depth discontinuities (a 1px "ink" line around cliffs, sprites, props),
//    fading out with the fog so the horizon does not get paper-cut silhouettes. Also scrubs NaN/Inf before bloom.
//  - ToonGrade: cool shadows / warm highlights and a gentle S-curve.

import { Color, Uniform, Vector2 } from 'three';
import { BlendFunction, Effect, EffectAttribute } from 'postprocessing';

export class PixelOutlineEffect extends Effect {
  constructor() {
    super(
      'PixelOutline',
      /* glsl */ `
      uniform vec3 uColor; uniform float uStrength; uniform vec2 uFog;
      float vz(vec2 uv){ return -getViewZ(readDepth(uv)); }
      void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor){
        float c = -getViewZ(depth);
        vec2 t = texelSize;
        float m = max(max(vz(uv + vec2(t.x, 0.)), vz(uv - vec2(t.x, 0.))), max(vz(uv + vec2(0., t.y)), vz(uv - vec2(0., t.y))));
        float edge = step(1.0 + c * 0.12, m - c) * (1. - smoothstep(mix(uFog.x, uFog.y, 0.35), uFog.y * 0.9, c));
        vec3 col = mix(inputColor.rgb, uColor, edge * uStrength);
        col = any(isnan(col)) || any(isinf(col)) ? vec3(0.) : clamp(col, 0., 48.);
        outputColor = vec4(col, inputColor.a);
      }`,
      {
        attributes: EffectAttribute.DEPTH,
        blendFunction: BlendFunction.NORMAL,
        uniforms: new Map<string, Uniform>([
          ['uColor', new Uniform(new Color(0x1a1028))],
          ['uStrength', new Uniform(0.85)],
          ['uFog', new Uniform(new Vector2(40, 160))],
        ]),
      },
    );
  }
  setFog(near: number, far: number): void {
    (this.uniforms.get('uFog')!.value as Vector2).set(near, far);
  }
}

export class ToonGradeEffect extends Effect {
  constructor() {
    super(
      'ToonGrade',
      /* glsl */ `
      uniform float uAmount;
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
        vec3 c = clamp(inputColor.rgb, 0., 1.);
        float l = dot(c, vec3(0.299, 0.587, 0.114));
        vec3 g = c * mix(vec3(0.93, 0.97, 1.06), vec3(1.04, 1.01, 0.95), smoothstep(0.15, 0.75, l));
        g = mix(g, g * g * (3. - 2. * g), 0.22);
        outputColor = vec4(mix(inputColor.rgb, g, uAmount), inputColor.a);
      }`,
      { uniforms: new Map<string, Uniform>([['uAmount', new Uniform(1)]]) },
    );
  }
}
