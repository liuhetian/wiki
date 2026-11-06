// Terrain shader. Everything is cut on a world-space pixel grid of 13.5 texels per unit — the sprites' density — so
// ground, cliffs and characters read as one pixel-art image. Zones (lowland / highland / alpine / snow / path) switch
// with Bayer-dithered hard edges instead of cross-fades; slopes above ~0.32 become cliff walls sampled along the
// wall's own horizontal axis; light is two hard bands plus a stepped sky term; wind bands and cloud shadows drift over
// the grass; trees and props cast a baked shadow mask.

import {
  Color,
  LinearMipmapLinearFilter,
  NearestFilter,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  CanvasTexture,
  type Texture,
} from 'three';
import type { TileSet } from '../art/tiles';
import type { Biome } from './biomes';
import type { Shared } from '../render/renderer';
import { FOG_GLSL, NOISE_GLSL } from '../render/glsl';

export const PX = 13.5;

function tileTex(c: HTMLCanvasElement): CanvasTexture {
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.magFilter = NearestFilter;
  t.minFilter = LinearMipmapLinearFilter;
  t.anisotropy = 4;
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function makeTerrainMaterial(biome: Biome, tiles: TileSet, shared: Shared, shade: Texture, world: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      tLow: { value: tileTex(tiles.low) },
      tHigh: { value: tileTex(tiles.high) },
      tAlpine: { value: tileTex(tiles.alpine) },
      tSnow: { value: tileTex(tiles.snow) },
      tCliff: { value: tileTex(tiles.cliff) },
      tPath: { value: tileTex(tiles.path) },
      tShade: { value: shade },
      uPx: { value: PX },
      uWorld: { value: world },
      uSnowH: { value: biome.snowH },
      uHighA: { value: biome.highA },
      uHighB: { value: biome.highB },
      uSunDir: shared.uSunDir,
      uSun: { value: new Color(biome.sun).multiplyScalar(1.05 * biome.light) },
      uShadow: { value: new Color(biome.shadow).multiplyScalar(0.72 * biome.light + 0.08) },
      uCloud: { value: new Color(biome.cloud) },
      uTime: shared.uTime,
      uFogColor: shared.uFogColor,
      uFogNear: shared.uFogNear,
      uFogFar: shared.uFogFar,
    },
    vertexShader: /* glsl */ `
      attribute float aPath; attribute vec2 aCliff;
      varying vec3 vW; varying vec3 vN; varying float vPath; varying vec2 vCliff; varying float vD;
      void main(){
        vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
        vPath = aPath; vCliff = aCliff;
        vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tLow, tHigh, tAlpine, tSnow, tCliff, tPath, tShade;
      uniform float uPx, uWorld, uSnowH, uHighA, uHighB, uTime;
      uniform vec3 uSunDir, uSun, uShadow, uCloud;
      varying vec3 vW; varying vec3 vN; varying float vPath; varying vec2 vCliff; varying float vD;
      ${NOISE_GLSL}
      ${FOG_GLSL}
      vec2 gx, gy;
      // Pixel-exact lookup (texel centres on the world grid) with the smooth gradient for mip selection.
      vec3 tile(sampler2D t, vec2 pp, vec2 off){ return textureGrad(t, (pp + .5) / 128. + off, gx, gy).rgb; }
      vec3 toonLight(vec3 n, vec2 pp){
        float ndl = dot(n, uSunDir);
        float d = (bayer4(pp) - .5) * .06;
        float band = step(.02, ndl + d) * .72 + step(.58, ndl + d) * .28;
        float sky = floor(n.y * 3. + bayer4(pp + 2.) * .9) / 3.;
        return mix(mix(uShadow, uSun, .3), uSun, band) + vec3(.05, .07, .11) * sky;
      }
      void main(){
        vec3 n = normalize(vN);
        float slope = 1. - n.y;
        vec2 pp = floor(vW.xz * uPx), ws = pp / uPx;
        vec2 suv = vW.xz * uPx / 128.;
        gx = dFdx(suv); gy = dFdy(suv);

        // Ground zones by height + wandering noise, each border a dithered step.
        float zn = vnoise(ws * .021) - .5, zn2 = vnoise(ws * .063 + 9.) - .5, dz = (bayer4(pp) - .5) * .14;
        float hiK = smoothstep(uHighA, uHighB, vW.y) * .8 + zn * .55 + zn2 * .2;
        float alK = smoothstep(uSnowH * .62, uSnowH * .9, vW.y) + zn * .3 + zn2 * .25;
        vec3 g = tile(tLow, pp, vec2(0.));
        g = mix(g, tile(tHigh, pp, vec2(.37)), step(.5, hiK + dz));
        g = mix(g, tile(tAlpine, pp, vec2(.61)), step(.55, alK + dz));
        // Big lawn patches in three flat tones so the tile repeat never reads.
        float pv = vnoise(ws * .045 + 3.1) * .7 + vnoise(ws * .17) * .3 + (bayer4(pp + 1.) - .5) * .08;
        g *= pv > .63 ? vec3(1.06, 1.05, .97) : pv < .35 ? vec3(.9, .94, 1.02) : vec3(1.);
        vec3 col = mix(g, tile(tPath, pp, vec2(.13)), step(.56 + (bayer4(pp) - .5) * .1, vPath));

        // Cliffs: the wall's own tile along whichever horizontal axis it faces away from (dithered where they swap).
        float isRock = step(.32 + (hash(pp) - .5) * .08, slope);
        vec3 an = abs(n);
        float useZ = step(an.z + (bayer4(floor(vec2(vW.x + vW.z, vW.y) * uPx)) - .5) * .2, an.x);
        float along = mix(vW.x, vW.z, useZ);
        vec2 cp = vec2(floor(along * uPx), -floor(vW.y * uPx));
        vec2 cs = vec2(along, -vW.y) * uPx / 128.;
        vec3 r = textureGrad(tCliff, (cp + .5) / 128., dFdx(cs), dFdy(cs)).rgb;
        r *= mix(.68, 1., smoothstep(0., 1.8, vW.y - vCliff.y));          // occlusion at the foot of the wall
        col *= 1. - .1 * smoothstep(1.5, 4., vCliff.x - vW.y) * step(slope, .3); // soft contact shade below cliffs
        // Turf hanging over the top edge of each wall.
        float dTop = vCliff.x - vW.y, colN = floor(along * uPx / 2.);
        float L = .22 + .3 * hash(vec2(colN, 1.3)) + .25 * vnoise(vec2(along * .9, 2.));
        float hang = step(dTop, L) * isRock * step(1.2, vCliff.x - vCliff.y);
        vec3 hg = mix(g, g * vec3(.5, .6, .62), step(L - 1.5 / uPx, dTop));
        col = mix(col, r, isRock);
        col = mix(col, hg, hang);

        // Snow above the snow line: wandering dithered edge; on walls only the ledges.
        float snowE = uSnowH + (vnoise(ws * .05) - .5) * 6. + (bayer4(pp + 5.) - .5) * .8;
        float sn = step(snowE, vW.y);
        vec3 snowC = tile(tSnow, pp, vec2(.21)) * mix(1., .9, step(.32, slope));
        float glint = hash(pp + .7);
        snowC = mix(snowC, vec3(1.25), step(.997, glint) * step(.8, fract(glint * 13.1 + uTime * (.3 + glint * .5))));
        col = mix(col, snowC, sn * (1. - isRock * step(.55, slope)));

        col *= toonLight(n, pp);

        // Wind combing the grass in long bright bands (never on rock or snow).
        float grassy = (1. - isRock) * (1. - sn) * (1. - step(.56, vPath));
        float wv = dot(ws, vec2(.8, .6)) * .045 - uTime * .55 + vnoise(ws * .012) * 3.5;
        float sweep = smoothstep(.82, 1., sin(wv)) * smoothstep(.35, .65, vnoise(ws * .006 + uTime * .01));
        col = mix(col, col * vec3(1.12, 1.13, 1.02) + vec3(.02, .025, 0.), step(.5 + (bayer4(pp + 2.) - .5) * .9, sweep) * grassy * .85);
        // Cloud shadows: big soft shapes, one flat cool tone, dithered rim.
        vec2 cw = ws * .011 + vec2(uTime * .016, uTime * .009);
        float cl = vnoise(cw) * .62 + vnoise(cw * 2.3 + 5.) * .38;
        col *= mix(vec3(1.), uCloud, step(.6 + (bayer4(pp + 7.) - .5) * .05, cl));
        // Baked prop shadows: one flat tone, dithered rim, never stacking darker.
        float sh = texture2D(tShade, (ws + .5 / uPx) / uWorld + .5).r;
        col *= mix(vec3(1.), vec3(.66, .72, .9), step(.5 + (bayer4(pp + 3.) - .5) * .5, sh) * (1. - isRock));

        gl_FragColor = vec4(applyFog(col, vD), 1.);
      }`,
  });
}
