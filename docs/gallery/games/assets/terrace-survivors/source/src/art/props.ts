// Prop atlas per biome. Round shapes (tree crowns, rocks, cacti, palms) come from the ellipsoid rig renderer seen
// from the front and a little above; conifers and grass are drawn directly as pixel art.

import { PixelImage, ShelfPacker, hex, mixc, outlineOf } from './pixel';
import { mat, renderRig, type Prim, type V3 } from './rig';
import { Rng } from '../core/rng';
import type { BiomeId } from './tiles';

export interface PropDef {
  name: string;
  solid: number; // collision radius in world units (0 = walk through)
  shadow: number; // baked ground-shadow radius in world units
  sway: number; // wind sway amount
  weight: number; // scatter weight
  scale: [number, number]; // random scale range
  zone: 'any' | 'low' | 'high';
  cluster: number; // 0..1 how strongly it clumps
}

export interface PropAtlas {
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
  defs: PropDef[];
  rects: { x: number; y: number; w: number; h: number }[];
}

const P = (c: V3, r: V3, m: number, rot?: V3): Prim => ({ c, r, m, rot });
const PROP_PITCH = 0.3;

function rig(prims: Prim[], mats: ReturnType<typeof mat>[], w: number, h: number, seed = 3): PixelImage {
  const img = renderRig({ prims }, mats, { w, h, yaw: 0, pitch: PROP_PITCH, ox: w / 2, oy: h - 3, seed });
  const b = img.bounds();
  // Keep the feet row at the bottom: crop sides and top only.
  return b ? img.crop({ x0: b.x0, y0: b.y0, x1: b.x1, y1: h - 1 }) : img;
}

function crown(rng: Rng, cy: number, rx: number, ry: number, n: number, rmin: number, rmax: number, mats: number[]): Prim[] {
  const out: Prim[] = [];
  for (let i = 0; i < n; i++) {
    const a = rng.range(0, Math.PI * 2),
      d = Math.sqrt(rng.next());
    const r = rng.range(rmin, rmax);
    out.push(P([Math.cos(a) * rx * d, cy + rng.range(-ry, ry) * 0.8, Math.sin(a) * rx * d * 0.8], [r, r * 0.9, r], rng.pick(mats)));
  }
  return out;
}

function broadleaf(seed: number, leaf: number, leaf2: number, bark: number, size = 1): PixelImage {
  const rng = new Rng(seed);
  const mats = [mat(bark, { noise: 0.3 }), mat(leaf, { noise: 0.45 }), mat(leaf2, { noise: 0.45 })];
  const s = size;
  const prims: Prim[] = [
    P([0, 2, 0], [5 * s, 2.5 * s, 4 * s], 0),
    P([0, 11 * s, 0], [2.8 * s, 11 * s, 2.8 * s], 0),
    P([-3 * s, 18 * s, 0], [1.4 * s, 6 * s, 1.4 * s], 0, [0, 0, 0.6]),
    P([3 * s, 19 * s, 0], [1.4 * s, 6 * s, 1.4 * s], 0, [0, 0, -0.6]),
    ...crown(rng, 30 * s, 13 * s, 7 * s, 11, 6 * s, 9 * s, [1, 1, 2]),
  ];
  return rig(prims, mats, Math.ceil(64 * s), Math.ceil(76 * s), seed);
}

function bush(seed: number, leaf: number, leaf2: number, berry?: number): PixelImage {
  const rng = new Rng(seed);
  const mats = [mat(leaf, { noise: 0.45 }), mat(leaf2, { noise: 0.45 }), mat(berry ?? 0xffffff)];
  const prims = crown(rng, 7, 8, 2, 7, 4.5, 6.5, [0, 0, 1]).map((p) => ({ ...p, c: [p.c[0], Math.max(p.r[1] * 0.7, p.c[1]), p.c[2]] as V3 }));
  if (berry !== undefined) for (let i = 0; i < 7; i++) prims.push(P([rng.range(-7, 7), rng.range(5, 12), rng.range(4, 7)], [1.2, 1.2, 1.2], 2));
  return rig(prims, mats, 34, 26, seed);
}

function rock(seed: number, stone: number, top?: number, size = 1): PixelImage {
  const rng = new Rng(seed);
  const mats = [mat(stone, { noise: 0.35 }), mat(hexMix(stone, 0x000000, 0.18), { noise: 0.3 }), mat(top ?? stone, { noise: 0.3 })];
  const s = size;
  const prims: Prim[] = [P([0, 6 * s, 0], [9 * s, 7 * s, 7 * s], 0, [0, rng.range(0, 1), 0.1]), P([-6 * s, 4 * s, 2 * s], [5 * s, 4.5 * s, 5 * s], 1), P([6 * s, 3.5 * s, 1 * s], [4.5 * s, 4 * s, 4 * s], 1)];
  if (top !== undefined) prims.push(P([0, 11.5 * s, 0], [7 * s, 2 * s, 5.5 * s], 2), P([-5 * s, 7.6 * s, 2 * s], [3.5 * s, 1.4 * s, 3 * s], 2));
  return rig(prims, mats, Math.ceil(40 * s), Math.ceil(32 * s), seed);
}

const hexMix = (a: number, b: number, t: number) => {
  const c = mixc(hex(a), hex(b), t);
  return (c[0] << 16) | (c[1] << 8) | c[2];
};

function conifer(seed: number, h: number, leaf: number, snow: boolean, bark = 0x6b4a32): PixelImage {
  const rng = new Rng(seed);
  const w = Math.round(h * 0.55);
  const img = new PixelImage(w + 4, h + 2);
  const cx = Math.floor((w + 4) / 2);
  const L = hex(leaf),
    dark = mixc(L, [20, 30, 50], 0.45),
    light = mixc(L, [230, 255, 200], 0.28),
    sn = hex(0xf4f8ff),
    snS = hex(0xc4d4ee);
  const trunkH = Math.round(h * 0.14);
  for (let y = h - trunkH; y < h; y++)
    for (let x = -1; x <= 1; x++) img.set(cx + x, y, x < 0 ? mixc(hex(bark), [255, 255, 255], 0.15) : hex(bark));
  const tiers = 4;
  let top = 1;
  const usable = h - trunkH;
  for (let t = 0; t < tiers; t++) {
    const tb = Math.round(((t + 1) / tiers) * usable * 0.95 + usable * 0.05);
    const ttop = t === 0 ? 1 : Math.round(top - (tb - top) * 0.35);
    const maxW = (w / 2) * (0.45 + 0.55 * ((t + 1) / tiers));
    for (let y = ttop; y <= tb; y++) {
      const k = (y - ttop) / Math.max(1, tb - ttop);
      const hw = Math.max(0, Math.round(maxW * k + (rng.chance(0.3) ? 1 : 0)));
      for (let x = -hw; x <= hw; x++) {
        const rel = hw ? x / hw : 0;
        let c = rel < -0.3 ? light : rel < 0.3 ? L : dark;
        if (y === tb) c = dark;
        if (snow && (y - ttop < 2 + (hw > 3 ? 1 : 0) || (y === tb - 1 && rng.chance(0.6)))) c = rel > 0.35 ? snS : sn;
        img.set(cx + x, y, c);
      }
    }
    top = tb;
  }
  img.outline(outlineOf(leaf));
  return img;
}

function tuft(seed: number, base: number, tip: number, flowers?: number[]): PixelImage {
  const rng = new Rng(seed);
  const img = new PixelImage(20, 16);
  const B = hex(base),
    T = hex(tip);
  for (let b = 0; b < 7; b++) {
    const x0 = 10 + rng.int(-5, 5),
      hgt = rng.int(6, 12),
      lean = rng.range(-0.5, 0.5);
    for (let k = 0; k < hgt; k++) img.set(x0 + Math.round(lean * k), 15 - k, mixc(B, T, k / hgt));
  }
  if (flowers)
    for (let i = 0; i < 3; i++) {
      const x = 10 + rng.int(-6, 6),
        y = rng.int(3, 7);
      const c = hex(rng.pick(flowers));
      img.set(x, y, c);
      img.set(x + 1, y, c);
      img.set(x, y + 1, c);
      img.set(x + 1, y + 1, mixc(c, [0, 0, 0], 0.25));
    }
  img.outline(outlineOf(base));
  return img;
}

function cactus(seed: number): PixelImage {
  const rng = new Rng(seed);
  const mats = [mat(0x4f9a4a, { noise: 0.15 }), mat(0xffd0e0)];
  const lh = rng.range(9, 13),
    rh = rng.range(11, 16);
  const prims: Prim[] = [
    P([0, 15, 0], [3.8, 15, 3.8], 0),
    P([-6, lh, 0], [2.2, 2.2, 2.2], 0),
    P([-8, lh + 5, 0], [2.2, 5.5, 2.2], 0),
    P([6, rh, 0], [2.2, 2.2, 2.2], 0),
    P([8, rh + 4, 0], [2.2, 4.5, 2.2], 0),
    P([-3, lh, 0], [3, 1.8, 1.8], 0, [0, 0, 1.57]),
    P([3, rh, 0], [3, 1.8, 1.8], 0, [0, 0, 1.57]),
    P([0, 30.5, 1], [1.6, 1.2, 1.6], 1),
  ];
  return rig(prims, mats, 30, 40, seed);
}

function barrelCactus(seed: number): PixelImage {
  const mats = [mat(0x5aa25a, { noise: 0.2 }), mat(0xff7aa8), mat(0xffe27a)];
  return rig([P([0, 5.5, 0], [6, 5.5, 6], 0), P([0, 11.2, 0.5], [2.4, 1.3, 2.4], 1), P([0, 11.8, 0.6], [1, 0.8, 1], 2)], mats, 20, 20, seed);
}

function palm(seed: number): PixelImage {
  const rng = new Rng(seed);
  const mats = [mat(0x9a7448, { noise: 0.3 }), mat(0x5fae4a, { noise: 0.3 }), mat(0x4a8a3c, { noise: 0.3 }), mat(0x7a5530)];
  const prims: Prim[] = [];
  for (let i = 0; i < 9; i++) prims.push(P([Math.sin(i * 0.25) * 2 + i * 0.4, 3 + i * 4, 0], [2.6 - i * 0.06, 2.6, 2.6], 0));
  const top: V3 = [5.2, 38, 0];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + rng.range(-0.2, 0.2);
    const dir: V3 = [Math.cos(a), 0, Math.sin(a)];
    prims.push(P([top[0] + dir[0] * 8, top[1] - 2.5, top[2] + dir[2] * 8], [9, 1.3, 2.6], i % 2 ? 1 : 2, [0, -a, -0.35]));
  }
  prims.push(P([top[0] - 1, top[1] - 3, 2], [1.6, 1.6, 1.6], 3), P([top[0] + 1.5, top[1] - 3.5, 2.2], [1.6, 1.6, 1.6], 3));
  return rig(prims, mats, 52, 52, seed);
}

function deadTree(seed: number, bark: number, h = 1): PixelImage {
  const rng = new Rng(seed);
  const mats = [mat(bark, { noise: 0.3 })];
  const prims: Prim[] = [P([0, 12 * h, 0], [2.2, 12 * h, 2.2], 0), P([0, 1.5, 0], [4, 2, 3.5], 0)];
  for (let i = 0; i < 6; i++) {
    const y = rng.range(12, 24) * h,
      side = i % 2 ? 1 : -1,
      ang = side * rng.range(0.5, 1.1);
    const len = rng.range(4, 7);
    prims.push(P([side * Math.sin(Math.abs(ang)) * len * 0.9, y + Math.cos(ang) * len * 0.9, rng.range(-2, 2)], [0.9, len, 0.9], 0, [0, 0, -ang]));
  }
  return rig(prims, mats, 40, Math.ceil(42 * h), seed);
}

function crystal(seed: number): PixelImage {
  const rng = new Rng(seed);
  const mats = [mat(0x9fe0ff), mat(0x6fb0f0), mat(0xd8f4ff)];
  const prims: Prim[] = [];
  for (let i = 0; i < 5; i++) {
    const a = rng.range(-0.6, 0.6),
      h = rng.range(6, 13);
    prims.push(P([Math.sin(a) * h * 0.8 + rng.range(-3, 3), Math.cos(a) * h * 0.8, rng.range(-2, 2)], [1.8, h, 1.8], i % 3, [0, 0, -a]));
  }
  return rig(prims, mats, 30, 34, seed);
}

function spire(seed: number, stone: number): PixelImage {
  const rng = new Rng(seed);
  const mats = [mat(stone, { noise: 0.35 }), mat(hexMix(stone, 0x401010, 0.25), { noise: 0.3 })];
  const prims: Prim[] = [];
  let y = 0;
  for (let i = 0; i < 5; i++) {
    const r = 9 - i * 1.3 + rng.range(-1, 1),
      hh = rng.range(3.5, 5);
    prims.push(P([rng.range(-1.5, 1.5), y + hh, 0], [r, hh, r * 0.9], i % 2));
    y += hh * 1.6;
  }
  return rig(prims, mats, 30, 48, seed);
}

type Entry = { def: PropDef; img: PixelImage };
const D = (name: string, img: PixelImage, o: Partial<PropDef> = {}): Entry => ({
  def: { name, solid: 0, shadow: 0, sway: 0, weight: 1, scale: [0.9, 1.15], zone: 'any', cluster: 0.3, ...o },
  img,
});

export function buildProps(biome: BiomeId): PropAtlas {
  let list: Entry[];
  if (biome === 'meadow')
    list = [
      D('oak', broadleaf(101, 0x4fa83e, 0x3f8f3a, 0x6b4a32), { solid: 0.9, shadow: 2.6, sway: 0.6, weight: 3, cluster: 0.7, zone: 'low' }),
      D('oak2', broadleaf(102, 0x6cbf48, 0x4fa83e, 0x7a5638, 0.85), { solid: 0.8, shadow: 2.2, sway: 0.6, weight: 2, cluster: 0.7 }),
      D('blossom', broadleaf(103, 0xf3a6c8, 0xe68ab4, 0x6b4a32, 0.8), { solid: 0.8, shadow: 2, sway: 0.6, weight: 0.5, cluster: 0.5 }),
      D('pine', conifer(104, 58, 0x2f7a4a, false), { solid: 0.7, shadow: 1.8, sway: 0.3, weight: 2, zone: 'high', cluster: 0.8 }),
      D('bush', bush(105, 0x58b048, 0x3f8f3a), { shadow: 1, sway: 0.4, weight: 3, scale: [0.8, 1.2] }),
      D('berry', bush(106, 0x4a9a42, 0x357a36, 0xe0303a), { shadow: 1, sway: 0.4, weight: 1 }),
      D('rock', rock(107, 0x9a9890), { solid: 0.8, shadow: 1.2, weight: 1.5, scale: [0.7, 1.3] }),
      D('mossrock', rock(108, 0x8a8c84, 0x6aa84a, 1.4), { solid: 1.3, shadow: 1.8, weight: 0.8, zone: 'high' }),
      D('grass', tuft(109, 0x2f7d3a, 0x9ade5c), { sway: 1, weight: 9, scale: [0.8, 1.3], cluster: 0.6 }),
      D('flowers', tuft(110, 0x3a8a3a, 0x8fd060, [0xffffff, 0xffe066, 0xff9fc6, 0x9fb4ff]), { sway: 1, weight: 4, cluster: 0.8 }),
      D('heather', tuft(111, 0x6b7534, 0xdccf6c, [0xb070c8, 0xd890e0]), { sway: 1, weight: 4, zone: 'high', cluster: 0.7 }),
    ];
  else if (biome === 'snow')
    list = [
      D('snowpine', conifer(201, 62, 0x2f6a5a, true), { solid: 0.7, shadow: 1.9, sway: 0.3, weight: 4, cluster: 0.8 }),
      D('snowpine2', conifer(202, 44, 0x3a7a62, true), { solid: 0.6, shadow: 1.5, sway: 0.3, weight: 3, cluster: 0.8 }),
      D('bare', deadTree(203, 0x7a6a62), { solid: 0.5, shadow: 1.2, sway: 0.2, weight: 1.2 }),
      D('crystal', crystal(204), { solid: 0.7, shadow: 0.8, weight: 0.8, zone: 'high', cluster: 0.6 }),
      D('snowrock', rock(205, 0x8a94a8, 0xf2f6ff), { solid: 0.8, shadow: 1.2, weight: 1.5 }),
      D('bigsnowrock', rock(206, 0x7a8498, 0xf2f6ff, 1.4), { solid: 1.3, shadow: 1.8, weight: 0.7 }),
      D('frostbush', bush(207, 0x6a9a8a, 0x4f7f74, 0xdff2ff), { shadow: 1, sway: 0.4, weight: 2 }),
      D('frostgrass', tuft(208, 0x5f8a80, 0xd8eef0), { sway: 1, weight: 6, cluster: 0.6, zone: 'low' }),
    ];
  else
    list = [
      D('cactus', cactus(301), { solid: 0.6, shadow: 1.2, weight: 2.5, cluster: 0.4 }),
      D('cactus2', cactus(302), { solid: 0.6, shadow: 1.2, weight: 1.5, cluster: 0.4 }),
      D('barrel', barrelCactus(303), { solid: 0.4, shadow: 0.7, weight: 2 }),
      D('palm', palm(304), { solid: 0.6, shadow: 2.4, sway: 0.5, weight: 1, zone: 'low', cluster: 0.85 }),
      D('deadbush', deadTree(305, 0x8a6a48, 0.55), { shadow: 0.8, sway: 0.3, weight: 2 }),
      D('redrock', rock(306, 0xc0784e), { solid: 0.8, shadow: 1.2, weight: 2 }),
      D('spire', spire(307, 0xc8805a), { solid: 1.1, shadow: 1.6, weight: 0.8, zone: 'high', cluster: 0.5 }),
      D('drygrass', tuft(308, 0xa88a4a, 0xf0d890), { sway: 1, weight: 5, cluster: 0.6 }),
    ];
  const packer = new ShelfPacker(1024);
  const placed = list.map((e) => ({ e, p: packer.place(e.img.w, e.img.h) }));
  const h = Math.ceil(packer.height / 4) * 4;
  const atlas = new PixelImage(1024, h);
  for (const { e, p } of placed) atlas.blit(e.img, p.x, p.y);
  return {
    canvas: atlas.toCanvas(),
    w: 1024,
    h,
    defs: list.map((e) => e.def),
    rects: placed.map(({ e, p }) => ({ x: p.x, y: p.y, w: e.img.w, h: e.img.h })),
  };
}
