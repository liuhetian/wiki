// Small pixel-art toolkit: an RGBA buffer with wrap-around drawing (for seamless tiles), colour ramps and canvas export.

export type RGB = [number, number, number];

export const hex = (h: number): RGB => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
export const toHex = (c: RGB): number => (c[0] << 16) | (c[1] << 8) | c[2];
export const mixc = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
export const mul = (a: RGB, f: number): RGB => [
  Math.min(255, Math.round(a[0] * f)),
  Math.min(255, Math.round(a[1] * f)),
  Math.min(255, Math.round(a[2] * f)),
];

/** Hue-shifted 4-step ramp (shadow → highlight), the way pixel artists shade: cool shadows, warm lights. */
export function ramp(base: number | RGB): RGB[] {
  const b = typeof base === 'number' ? hex(base) : base;
  const dark = mixc(mul(b, 0.6), [44, 32, 78], 0.22);
  const light = mixc(mul(b, 1.16), [255, 246, 214], 0.12);
  const hi = mixc(b, [255, 252, 236], 0.5);
  return [dark, b, light, hi];
}

export const outlineOf = (base: number | RGB): RGB => {
  const b = typeof base === 'number' ? hex(base) : base;
  return mixc(mul(b, 0.3), [26, 18, 38], 0.55);
};

export class PixelImage {
  readonly data: Uint8ClampedArray;
  constructor(readonly w: number, readonly h: number) {
    this.data = new Uint8ClampedArray(w * h * 4);
  }

  set(x: number, y: number, c: RGB, a = 255): void {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = c[0];
    this.data[i + 1] = c[1];
    this.data[i + 2] = c[2];
    this.data[i + 3] = a;
  }

  /** Wrap-around write: tiles stay seamless whatever is drawn near an edge. */
  wset(x: number, y: number, c: RGB): void {
    x = ((Math.round(x) % this.w) + this.w) % this.w;
    y = ((Math.round(y) % this.h) + this.h) % this.h;
    const i = (y * this.w + x) * 4;
    this.data[i] = c[0];
    this.data[i + 1] = c[1];
    this.data[i + 2] = c[2];
    this.data[i + 3] = 255;
  }

  get(x: number, y: number): RGB {
    x = ((x % this.w) + this.w) % this.w;
    y = ((y % this.h) + this.h) % this.h;
    const i = (y * this.w + x) * 4;
    return [this.data[i], this.data[i + 1], this.data[i + 2]];
  }

  alpha(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.data[(y * this.w + x) * 4 + 3];
  }

  fill(c: RGB): void {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) this.set(x, y, c);
  }

  /** Copies `src` at (dx,dy); optional horizontal mirror. */
  blit(src: PixelImage, dx: number, dy: number, flipX = false): void {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const si = (y * src.w + (flipX ? src.w - 1 - x : x)) * 4;
        if (src.data[si + 3] === 0) continue;
        const tx = dx + x,
          ty = dy + y;
        if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
        const di = (ty * this.w + tx) * 4;
        this.data[di] = src.data[si];
        this.data[di + 1] = src.data[si + 1];
        this.data[di + 2] = src.data[si + 2];
        this.data[di + 3] = src.data[si + 3];
      }
  }

  /** 1px outline around opaque pixels, written into transparent ones. */
  outline(color: RGB | ((x: number, y: number) => RGB)): void {
    const add: number[] = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.alpha(x, y)) continue;
        if (this.alpha(x + 1, y) || this.alpha(x - 1, y) || this.alpha(x, y + 1) || this.alpha(x, y - 1)) add.push(x, y);
      }
    for (let i = 0; i < add.length; i += 2) {
      const c = typeof color === 'function' ? color(add[i], add[i + 1]) : color;
      this.set(add[i], add[i + 1], c);
    }
  }

  /** Opaque bounding box, or null when empty. */
  bounds(): { x0: number; y0: number; x1: number; y1: number } | null {
    let x0 = this.w,
      y0 = this.h,
      x1 = -1,
      y1 = -1;
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++)
        if (this.data[(y * this.w + x) * 4 + 3]) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    return x1 < 0 ? null : { x0, y0, x1, y1 };
  }

  crop(b: { x0: number; y0: number; x1: number; y1: number }): PixelImage {
    const out = new PixelImage(b.x1 - b.x0 + 1, b.y1 - b.y0 + 1);
    for (let y = 0; y < out.h; y++)
      for (let x = 0; x < out.w; x++) {
        const si = ((y + b.y0) * this.w + x + b.x0) * 4,
          di = (y * out.w + x) * 4;
        for (let k = 0; k < 4; k++) out.data[di + k] = this.data[si + k];
      }
    return out;
  }

  toCanvas(scale = 1): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = this.w;
    c.height = this.h;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(this.w, this.h);
    img.data.set(this.data);
    ctx.putImageData(img, 0, 0);
    if (scale === 1) return c;
    const s = document.createElement('canvas');
    s.width = this.w * scale;
    s.height = this.h * scale;
    const sctx = s.getContext('2d')!;
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(c, 0, 0, s.width, s.height);
    return s;
  }
}

/** Simple shelf packer for atlases. */
export class ShelfPacker {
  private x = 0;
  private y = 0;
  private rowH = 0;
  constructor(readonly w: number, private pad = 2) {}
  place(w: number, h: number): { x: number; y: number } {
    if (this.x + w > this.w) {
      this.x = 0;
      this.y += this.rowH + this.pad;
      this.rowH = 0;
    }
    const p = { x: this.x, y: this.y };
    this.x += w + this.pad;
    this.rowH = Math.max(this.rowH, h);
    return p;
  }
  get height(): number {
    return this.y + this.rowH;
  }
}
