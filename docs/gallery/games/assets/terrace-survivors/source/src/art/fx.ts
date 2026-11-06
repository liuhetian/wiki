// FX atlas (16×16 cells) for projectiles, pickups and particles, plus 16×16 UI icons for weapons and passives.
// Glow cells are white so the instance colour tints them; pickups keep their own colours.

import { PixelImage, hex, mixc, outlineOf, type RGB } from './pixel';

export const FX_CELL = 16;
export const FX_COLS = 8;
export enum Fx {
  Orb,
  Spark,
  GemBlue,
  GemGreen,
  GemRed,
  Coin,
  Fruit,
  Magnet,
  Ring,
  Rock,
  Slash,
  Puff,
  Square,
  Flame,
  Star,
  Key,
}

const W: RGB = [255, 255, 255];

function disc(img: PixelImage, cx: number, cy: number, r: number, c: RGB | ((dx: number, dy: number, d: number) => RGB | null)): void {
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++)
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
      const dx = x + 0.5 - cx,
        dy = y + 0.5 - cy,
        d = Math.hypot(dx, dy);
      if (d > r) continue;
      const col = typeof c === 'function' ? c(dx, dy, d) : c;
      if (col) img.set(x, y, col);
    }
}

function line(img: PixelImage, x0: number, y0: number, x1: number, y1: number, c: RGB, t = 1): void {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1) * 2;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n,
      y = y0 + ((y1 - y0) * i) / n;
    if (t <= 1) img.set(Math.floor(x), Math.floor(y), c);
    else disc(img, x, y, t / 2, c);
  }
}

function gem(img: PixelImage, ox: number, oy: number, base: number): void {
  const b = hex(base),
    l = mixc(b, W, 0.5),
    d = mixc(b, [20, 10, 40], 0.45);
  const rows = [
    '......XX......',
    '.....XllX.....',
    '....XllbbX....',
    '...XllbbbdX...',
    '..XlwbbbbddX..',
    '..XlbbbbbddX..',
    '...XbbbbddX...',
    '....XbbddX....',
    '.....XddX.....',
    '......XX......',
  ];
  rows.forEach((r, y) =>
    [...r].forEach((ch, x) => {
      const col = ch === 'X' ? outlineOf(base) : ch === 'l' ? l : ch === 'b' ? b : ch === 'd' ? d : ch === 'w' ? W : null;
      if (col) img.set(ox + 1 + x, oy + 3 + y, col);
    }),
  );
}

export function buildFxAtlas(): { canvas: HTMLCanvasElement; cols: number; rows: number } {
  const rows = 2;
  const img = new PixelImage(FX_CELL * FX_COLS, FX_CELL * rows);
  const cell = (i: number) => [(i % FX_COLS) * FX_CELL, Math.floor(i / FX_COLS) * FX_CELL] as const;
  let [x, y] = cell(Fx.Orb);
  disc(img, x + 8, y + 8, 6.5, (_dx, _dy, d) => (d < 3 ? W : d < 5 ? [210, 210, 210] : [140, 140, 140]));
  [x, y] = cell(Fx.Spark);
  line(img, x + 8, y + 1, x + 8, y + 15, W);
  line(img, x + 1, y + 8, x + 15, y + 8, W);
  disc(img, x + 8, y + 8, 2.5, W);
  [x, y] = cell(Fx.GemBlue);
  gem(img, x, y, 0x4aa8ff);
  [x, y] = cell(Fx.GemGreen);
  gem(img, x, y, 0x4ade6a);
  [x, y] = cell(Fx.GemRed);
  gem(img, x, y, 0xff4a6a);
  [x, y] = cell(Fx.Coin);
  disc(img, x + 8, y + 8, 6, (dx, dy, d) => (d > 5 ? hex(0x9a6a10) : dx + dy < -2 ? hex(0xfff2a0) : d < 2.5 ? hex(0xe0a020) : hex(0xffd040)));
  line(img, x + 8, y + 5, x + 8, y + 11, hex(0xb07a18));
  [x, y] = cell(Fx.Fruit);
  disc(img, x + 8, y + 9, 5.5, (dx, dy) => (dx + dy < -4 ? hex(0xffa0a0) : dx + dy > 3 ? hex(0xa01830) : hex(0xe8304a)));
  line(img, x + 8, y + 2, x + 9, y + 4, hex(0x6a4020));
  disc(img, x + 11, y + 3, 1.6, hex(0x5ac04a));
  [x, y] = cell(Fx.Magnet);
  for (let a = 0; a <= 20; a++) {
    const t = Math.PI * (a / 20);
    disc(img, x + 8 + Math.cos(t) * 4.5, y + 7 + Math.sin(t) * 4.5, 1.6, hex(0xe03a3a));
  }
  line(img, x + 3.5, y + 7, x + 3.5, y + 2, hex(0xe03a3a), 3);
  line(img, x + 12.5, y + 7, x + 12.5, y + 2, hex(0xe03a3a), 3);
  line(img, x + 2.5, y + 2, x + 4.5, y + 2, W, 1);
  line(img, x + 11.5, y + 2, x + 13.5, y + 2, W, 1);
  [x, y] = cell(Fx.Ring);
  disc(img, x + 8, y + 8, 7.5, (_dx, _dy, d) => (d > 5.8 ? W : null));
  [x, y] = cell(Fx.Rock);
  disc(img, x + 8, y + 8, 6, (dx, dy) => (dx + dy < -3 ? hex(0xb0a090) : dx + dy > 4 ? hex(0x4a4038) : hex(0x7a6a5a)));
  [x, y] = cell(Fx.Slash);
  disc(img, x + 8, y + 12, 9, (_dx, dy, d) => (d > 6.5 && dy < -1 ? W : null));
  [x, y] = cell(Fx.Puff);
  disc(img, x + 8, y + 8, 6, (dx, dy, d) => ((Math.floor(dx + 8) + Math.floor(dy + 8)) % 2 === 0 || d < 3.5 ? W : null));
  [x, y] = cell(Fx.Square);
  disc(img, x + 8, y + 8, 3.5, W);
  [x, y] = cell(Fx.Flame);
  disc(img, x + 8, y + 10, 5, W);
  disc(img, x + 8, y + 6, 3.5, W);
  disc(img, x + 8, y + 3.5, 1.6, W);
  [x, y] = cell(Fx.Star);
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + (k * Math.PI * 2) / 5;
    line(img, x + 8, y + 8.5, x + 8 + Math.cos(a) * 7, y + 8.5 + Math.sin(a) * 7, W, 2.2);
  }
  [x, y] = cell(Fx.Key);
  disc(img, x + 5, y + 8, 3.5, (_dx, _dy, d) => (d > 1.5 ? hex(0xffd040) : null));
  line(img, x + 8, y + 8, x + 14, y + 8, hex(0xffd040), 2);
  line(img, x + 12, y + 8, x + 12, y + 11, hex(0xffd040), 1);
  return { canvas: img.toCanvas(), cols: FX_COLS, rows };
}

// ------------------------------------------------------------------ UI icons
function icon(draw: (img: PixelImage) => void, outline: number): string {
  const img = new PixelImage(16, 16);
  draw(img);
  img.outline(outlineOf(outline));
  return img.toCanvas(4).toDataURL();
}

export function buildIcons(): Record<string, string> {
  return {
    bolt: icon((g) => {
      line(g, 2, 13, 8, 7, hex(0x4a8aff), 2);
      disc(g, 10, 6, 4, (dx, dy) => (dx + dy < -2 ? W : hex(0x7fd0ff)));
    }, 0x2a4aa0),
    orbit: icon((g) => {
      disc(g, 8, 8, 6.5, (_dx, _dy, d) => (d > 5.6 ? hex(0x6a7aa0) : null));
      disc(g, 8, 2.5, 2.2, hex(0xff9af0));
      disc(g, 3, 11, 2.2, hex(0xff9af0));
      disc(g, 13, 11, 2.2, hex(0xff9af0));
      disc(g, 8, 8, 2, hex(0xffe0ff));
    }, 0x7a3a8a),
    blast: icon((g) => {
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        line(g, 8, 8, 8 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, hex(0xff8a2a), 2);
      }
      disc(g, 8, 8, 4, (_dx, _dy, d) => (d < 2 ? hex(0xfff2a0) : hex(0xffc040)));
    }, 0x8a3010),
    chain: icon((g) => {
      const pts = [[3, 1], [9, 6], [5, 8], [12, 14]];
      for (let i = 0; i < pts.length - 1; i++) line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], hex(0xfff070), 2);
    }, 0x6a5a10),
    slash: icon((g) => {
      disc(g, 6, 10, 9, (dx, dy, d) => (d > 6.5 && dx > -2 && dy < 2 ? (d > 8 ? W : hex(0xbfe8ff)) : null));
    }, 0x3a5a7a),
    meteor: icon((g) => {
      line(g, 2, 2, 8, 8, hex(0xff8a2a), 3);
      line(g, 4, 2, 9, 7, hex(0xffd040), 1);
      disc(g, 10, 10, 4, (dx, dy) => (dx + dy < -2 ? hex(0xb0a090) : hex(0x6a5a4a)));
    }, 0x3a2a20),
    speed: icon((g) => {
      line(g, 5, 3, 5, 11, hex(0x8a5a33), 3);
      line(g, 5, 12, 12, 12, hex(0x8a5a33), 3);
      line(g, 1, 6, 3, 6, W, 1);
      line(g, 0, 9, 3, 9, W, 1);
    }, 0x4a2a10),
    magnet: icon((g) => {
      for (let a = 0; a <= 20; a++) {
        const t = Math.PI * (a / 20);
        disc(g, 8 + Math.cos(t) * 4.5, 8 + Math.sin(t) * 4.5, 1.7, hex(0xe03a3a));
      }
      line(g, 3.5, 8, 3.5, 2, hex(0xe03a3a), 3);
      line(g, 12.5, 8, 12.5, 2, hex(0xe03a3a), 3);
      line(g, 2, 2, 5, 2, W, 2);
      line(g, 11, 2, 14, 2, W, 2);
    }, 0x6a1010),
    haste: icon((g) => {
      line(g, 3, 2, 13, 2, hex(0x8a5a33), 2);
      line(g, 3, 14, 13, 14, hex(0x8a5a33), 2);
      for (let y = 3; y < 8; y++) line(g, 4 + (y - 3), y, 12 - (y - 3), y, hex(0xbfe0ff), 1);
      for (let y = 9; y < 14; y++) line(g, 8 - (y - 9), y, 8 + (y - 9), y, hex(0xffe08a), 1);
    }, 0x3a2a10),
    power: icon((g) => {
      line(g, 3, 13, 12, 4, hex(0xd8e0f0), 2);
      line(g, 4, 9, 7, 12, hex(0xc09030), 2);
      line(g, 2, 14, 4, 12, hex(0x8a5a33), 2);
    }, 0x2a2a40),
    vitality: icon((g) => {
      disc(g, 5.5, 6, 3.5, hex(0xe8304a));
      disc(g, 10.5, 6, 3.5, hex(0xe8304a));
      for (let y = 7; y < 14; y++) line(g, 2 + (y - 7), y, 14 - (y - 7), y, hex(0xe8304a), 1);
      disc(g, 5, 5, 1.2, hex(0xffb0b0));
    }, 0x6a1020),
  };
}
