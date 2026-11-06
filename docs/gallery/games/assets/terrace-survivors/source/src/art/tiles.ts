// Seamless 128×128 ground tiles drawn in code: grassy lawns with tufts and flowers, sand with ripples, dirt paths with
// pebbles, snow with drifts and stone cliff walls made of blocks (or sandstone strata). Everything is drawn with
// wrap-around writes and tileable noise so the tiles repeat without seams.

import { PixelImage, hex, mixc, type RGB } from './pixel';
import { Rng, tileNoise } from '../core/rng';

export const TILE = 128;

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)] / 16;

export interface GroundOpts {
  seed: number;
  base: number;
  dark: number;
  light: number;
  tufts?: number;
  flowers?: number;
  flowerCols?: number[];
  pebbles?: number;
  pebbleCol?: number;
  ripples?: boolean;
  sparkle?: boolean;
  cracks?: number;
}

export function groundTile(o: GroundOpts): PixelImage {
  const img = new PixelImage(TILE, TILE);
  const rng = new Rng(o.seed);
  const base = hex(o.base),
    dark = hex(o.dark),
    light = hex(o.light);
  const tones: RGB[] = [mixc(base, dark, 0.55), mixc(base, dark, 0.22), base, mixc(base, light, 0.4)];
  for (let y = 0; y < TILE; y++)
    for (let x = 0; x < TILE; x++) {
      let v = tileNoise(x / 16, y / 16, 8, o.seed) * 0.55 + tileNoise(x / 8, y / 8, 16, o.seed + 1) * 0.3 + tileNoise(x / 4, y / 4, 32, o.seed + 2) * 0.15;
      v += (bayer(x, y) - 0.5) * 0.12;
      const t = v < 0.36 ? 0 : v < 0.47 ? 1 : v < 0.64 ? 2 : 3;
      img.wset(x, y, tones[t]);
    }
  if (o.ripples) {
    // Wind ripples: wavy light crests with a dark trough under them.
    for (let row = 0; row < TILE; row += 8) {
      const ph = rng.range(0, Math.PI * 2),
        amp = rng.range(1, 2.4);
      for (let x = 0; x < TILE; x++) {
        const yy = row + Math.round(Math.sin((x / TILE) * Math.PI * 2 * 2 + ph) * amp + Math.sin((x / TILE) * Math.PI * 2 * 5 + ph * 2) * 0.8);
        if (tileNoise(x / 8, row / 8, 16, o.seed + 9) < 0.3) continue;
        img.wset(x, yy, mixc(base, light, 0.65));
        img.wset(x, yy + 1, mixc(base, dark, 0.35));
      }
    }
  }
  for (let i = 0; i < (o.tufts ?? 0); i++) {
    const x = rng.int(0, TILE - 1),
      y = rng.int(0, TILE - 1);
    const blades = rng.int(2, 4);
    for (let b = 0; b < blades; b++) {
      const lean = b - (blades - 1) / 2,
        hgt = rng.int(2, 4);
      for (let k = 0; k <= hgt; k++) {
        const c = k === hgt ? mixc(base, light, 0.7) : k === 0 ? mixc(base, dark, 0.6) : mixc(base, dark, 0.3);
        img.wset(x + Math.round(lean * (k / hgt) * 1.6), y - k, c);
      }
    }
  }
  const fc = o.flowerCols ?? [];
  for (let i = 0; i < (o.flowers ?? 0) && fc.length; i++) {
    const x = rng.int(0, TILE - 1),
      y = rng.int(0, TILE - 1);
    const pc = hex(rng.pick(fc));
    img.wset(x - 1, y, pc);
    img.wset(x + 1, y, pc);
    img.wset(x, y - 1, pc);
    img.wset(x, y + 1, mixc(pc, dark, 0.4));
    img.wset(x, y, [255, 226, 110]);
  }
  for (let i = 0; i < (o.pebbles ?? 0); i++) {
    const x = rng.int(0, TILE - 1),
      y = rng.int(0, TILE - 1);
    const pc = hex(o.pebbleCol ?? 0x9a958a);
    const w = rng.int(1, 3);
    for (let k = 0; k < w; k++) {
      img.wset(x + k, y, mixc(pc, [255, 255, 255], 0.35));
      img.wset(x + k, y + 1, pc);
    }
    img.wset(x + w, y + 1, mixc(pc, dark, 0.6));
    for (let k = 0; k < w; k++) img.wset(x + k, y + 2, mixc(base, dark, 0.5));
  }
  for (let i = 0; i < (o.cracks ?? 0); i++) {
    let x = rng.int(0, TILE - 1),
      y = rng.int(0, TILE - 1);
    const len = rng.int(5, 12);
    for (let k = 0; k < len; k++) {
      img.wset(x, y, mixc(base, dark, 0.75));
      x += rng.int(-1, 1);
      y += rng.chance(0.5) ? 1 : 0;
      x += 1;
    }
  }
  if (o.sparkle)
    for (let i = 0; i < 40; i++) img.wset(rng.int(0, TILE - 1), rng.int(0, TILE - 1), [255, 255, 255]);
  return img;
}

export interface CliffOpts {
  seed: number;
  base: number;
  dark: number;
  light: number;
  mortar: number;
  top?: number; // moss / snow on block tops
  strata?: boolean;
}

export function cliffTile(o: CliffOpts): PixelImage {
  const img = new PixelImage(TILE, TILE);
  const rng = new Rng(o.seed);
  const base = hex(o.base),
    dark = hex(o.dark),
    light = hex(o.light),
    mortar = hex(o.mortar);
  if (o.strata) {
    // Sandstone: wavy horizontal layers, each with its own tone, lit edge on top, shadow under, vertical cracks.
    const layers: number[] = [];
    let s = 0;
    while (s < TILE) {
      const h = Math.min(TILE - s, rng.int(9, 18));
      layers.push(h);
      s += h;
    }
    let y0 = 0;
    layers.forEach((h, li) => {
      const tone = mixc(base, li % 2 ? dark : light, rng.range(0.1, 0.35));
      for (let x = 0; x < TILE; x++) {
        const wob = Math.round(Math.sin((x / TILE) * Math.PI * 2 * 3 + li) * 1.2);
        for (let k = 0; k < h; k++) {
          const yy = y0 + k + wob;
          const n = tileNoise(x / 4, yy / 4, 32, o.seed + li) + (bayer(x, yy) - 0.5) * 0.2;
          let c = n < 0.3 ? mixc(tone, dark, 0.3) : n > 0.75 ? mixc(tone, light, 0.25) : tone;
          if (k === 0) c = mixc(tone, light, 0.5);
          if (k === h - 1) c = mixc(tone, mortar, 0.6);
          img.wset(x, yy, c);
        }
      }
      y0 += h;
    });
    for (let i = 0; i < 14; i++) {
      let x = rng.int(0, TILE - 1);
      const y = rng.int(0, TILE - 1),
        len = rng.int(6, 16);
      for (let k = 0; k < len; k++) {
        img.wset(x, y + k, mortar);
        img.wset(x + 1, y + k, mixc(base, light, 0.3));
        if (rng.chance(0.25)) x += rng.int(-1, 1);
      }
    }
    return img;
  }
  // Stone blocks in courses; each course is offset so joints never line up.
  const rows = [22, 18, 24, 20, 26, 18];
  let y0 = 0;
  for (const rh of rows) {
    const off = rng.int(0, TILE - 1);
    let x0 = 0;
    while (x0 < TILE) {
      let bw = rng.int(18, 34);
      if (TILE - x0 - bw < 14) bw = TILE - x0;
      const tone = mixc(base, rng.chance(0.5) ? dark : light, rng.range(0, 0.3));
      for (let y = 0; y < rh; y++)
        for (let x = 0; x < bw; x++) {
          const px = x0 + x + off,
            py = y0 + y;
          let c: RGB;
          if (x === bw - 1 || y === rh - 1) c = mortar;
          else if (y < 2) c = mixc(tone, light, 0.55);
          else if (x === 0) c = mixc(tone, light, 0.3);
          else if (y >= rh - 3) c = mixc(tone, dark, 0.55);
          else if (x === bw - 2) c = mixc(tone, dark, 0.4);
          else {
            const n = tileNoise(px / 4, py / 4, 32, o.seed) + (bayer(px, py) - 0.5) * 0.25;
            c = n < 0.3 ? mixc(tone, dark, 0.25) : n > 0.78 ? mixc(tone, light, 0.2) : tone;
          }
          img.wset(px, py, c);
        }
      // A crack here and there.
      if (rng.chance(0.4)) {
        let cx = x0 + off + rng.int(4, bw - 6),
          cy = y0 + rng.int(3, 6);
        for (let k = 0; k < rng.int(4, 9); k++) {
          img.wset(cx, cy, mixc(tone, mortar, 0.7));
          cx += rng.int(-1, 1);
          cy++;
        }
      }
      // Moss or snow resting on the block's top.
      if (o.top !== undefined && rng.chance(0.55)) {
        const tc = hex(o.top);
        const start = rng.int(0, bw - 6),
          len = rng.int(4, Math.max(5, bw - 4));
        for (let k = 0; k < len; k++) {
          const px = x0 + off + start + k;
          const drip = rng.chance(0.3) ? rng.int(1, 3) : 0;
          for (let d = 0; d <= 1 + drip; d++) img.wset(px, y0 + d, d === 0 ? mixc(tc, [255, 255, 255], 0.25) : tc);
        }
      }
      x0 += bw;
    }
    y0 += rh;
  }
  return img;
}

export interface TileSet {
  low: HTMLCanvasElement;
  high: HTMLCanvasElement;
  alpine: HTMLCanvasElement;
  snow: HTMLCanvasElement;
  cliff: HTMLCanvasElement;
  path: HTMLCanvasElement;
}

export type BiomeId = 'meadow' | 'snow' | 'desert';

export function buildTiles(biome: BiomeId): TileSet {
  const c = (i: PixelImage) => i.toCanvas();
  if (biome === 'meadow')
    return {
      low: c(groundTile({ seed: 11, base: 0x5cb84a, dark: 0x2c7a3a, light: 0x9ade5c, tufts: 260, flowers: 26, flowerCols: [0xffffff, 0xffe066, 0xff9fc6] })),
      high: c(groundTile({ seed: 12, base: 0xa9b04c, dark: 0x6b7534, light: 0xdccf6c, tufts: 200, flowers: 34, flowerCols: [0xb070c8, 0xd890e0] })),
      alpine: c(groundTile({ seed: 13, base: 0x80996c, dark: 0x52695a, light: 0xb0bf8c, tufts: 120, pebbles: 30 })),
      snow: c(groundTile({ seed: 14, base: 0xe9f1ff, dark: 0xb3c4e6, light: 0xffffff, sparkle: true })),
      cliff: c(cliffTile({ seed: 15, base: 0x9a8068, dark: 0x6a5242, light: 0xc9ae8c, mortar: 0x40302c, top: 0x6aa84a })),
      path: c(groundTile({ seed: 16, base: 0xc9a26b, dark: 0x94713f, light: 0xe6c891, pebbles: 70, pebbleCol: 0xb0a090 })),
    };
  if (biome === 'snow')
    return {
      low: c(groundTile({ seed: 21, base: 0x9cc2ae, dark: 0x5f8a80, light: 0xd8eef0, tufts: 160, flowers: 10, flowerCols: [0xc8e8ff] })),
      high: c(groundTile({ seed: 22, base: 0xbcd0dc, dark: 0x7d96ae, light: 0xe8f2f8, tufts: 70, pebbles: 24, pebbleCol: 0x8a94a8 })),
      alpine: c(groundTile({ seed: 23, base: 0xc6dcf4, dark: 0x8fa9d6, light: 0xf0f7ff, cracks: 10, sparkle: true })),
      snow: c(groundTile({ seed: 24, base: 0xe8eff9, dark: 0xa9bcdc, light: 0xffffff, sparkle: true })),
      cliff: c(cliffTile({ seed: 25, base: 0x8390a8, dark: 0x56607a, light: 0xb4c0d4, mortar: 0x323848, top: 0xf4f8ff })),
      path: c(groundTile({ seed: 26, base: 0xb9b2aa, dark: 0x857e78, light: 0xdcd6ce, pebbles: 60, pebbleCol: 0x8c8c94 })),
    };
  return {
    low: c(groundTile({ seed: 31, base: 0xe4c27f, dark: 0xbf955a, light: 0xf5dfa6, ripples: true, pebbles: 6, pebbleCol: 0xb08a60 })),
    high: c(groundTile({ seed: 32, base: 0xd9a35d, dark: 0xa8733c, light: 0xedc589, ripples: true })),
    alpine: c(groundTile({ seed: 33, base: 0xb98b5a, dark: 0x86603c, light: 0xd4aa78, pebbles: 40, pebbleCol: 0x9a7a5a, cracks: 22 })),
    snow: c(groundTile({ seed: 34, base: 0xefe6d2, dark: 0xcfc2a6, light: 0xfffaf0, cracks: 30 })),
    cliff: c(cliffTile({ seed: 35, base: 0xc0704a, dark: 0x8a4a32, light: 0xe0996a, mortar: 0x5a2c22, strata: true })),
    path: c(groundTile({ seed: 36, base: 0xc8b28e, dark: 0x9a8462, light: 0xe2d0aa, pebbles: 80, pebbleCol: 0x8a8070 })),
  };
}
