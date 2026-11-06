// Seeded random numbers and value noise. Everything procedural (terrain, art, scatter) goes through here so a seed
// reproduces the same map and the same sprites.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private f: () => number;
  constructor(seed: number) {
    this.f = mulberry32(seed);
  }
  next(): number {
    return this.f();
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.f();
  }
  int(a: number, b: number): number {
    return a + Math.floor((b - a + 1) * this.f());
  }
  chance(p: number): boolean {
    return this.f() < p;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.f() * arr.length)];
  }
  weighted<T>(items: readonly { w: number; v: T }[]): T {
    let total = 0;
    for (const it of items) total += it.w;
    let r = this.f() * total;
    for (const it of items) {
      r -= it.w;
      if (r <= 0) return it.v;
    }
    return items[items.length - 1].v;
  }
}

/** Integer lattice hash in [0,1). */
export function hash2(x: number, y: number, seed: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * (3 - 2 * t);

/** 2D value noise in [-1,1] with fbm. */
export class Noise2 {
  constructor(private seed: number) {}
  get(x: number, y: number): number {
    const xi = Math.floor(x),
      yi = Math.floor(y);
    const fx = fade(x - xi),
      fy = fade(y - yi);
    const s = this.seed;
    const a = hash2(xi, yi, s),
      b = hash2(xi + 1, yi, s),
      c = hash2(xi, yi + 1, s),
      d = hash2(xi + 1, yi + 1, s);
    return (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) * 2 - 1;
  }
  fbm(x: number, y: number, oct = 4, lac = 2, gain = 0.5): number {
    let amp = 1,
      sum = 0,
      norm = 0;
    for (let i = 0; i < oct; i++) {
      sum += this.get(x, y) * amp;
      norm += amp;
      amp *= gain;
      x = x * lac + 17.3;
      y = y * lac - 9.1;
    }
    return sum / norm;
  }
}

/** Tileable value noise in [0,1]: the lattice wraps every `period` cells (seamless textures). */
export function tileNoise(x: number, y: number, period: number, seed: number): number {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const fx = fade(x - xi),
    fy = fade(y - yi);
  const m = (v: number) => ((v % period) + period) % period;
  const a = hash2(m(xi), m(yi), seed),
    b = hash2(m(xi + 1), m(yi), seed),
    c = hash2(m(xi), m(yi + 1), seed),
    d = hash2(m(xi + 1), m(yi + 1), seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
