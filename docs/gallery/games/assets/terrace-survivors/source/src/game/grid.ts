// Uniform spatial hash rebuilt every tick with a counting sort (no allocations): separation, targeting and hit tests.

export class SpatialGrid {
  readonly dim: number;
  private half: number;
  private counts: Int32Array;
  private starts: Int32Array;
  private items: Int32Array;
  private cellOf: Int32Array;

  constructor(world: number, readonly cell: number, cap: number) {
    this.dim = Math.ceil((world + 40) / cell);
    this.half = (this.dim * cell) / 2;
    this.counts = new Int32Array(this.dim * this.dim);
    this.starts = new Int32Array(this.dim * this.dim + 1);
    this.items = new Int32Array(cap);
    this.cellOf = new Int32Array(cap);
  }

  private key(x: number, z: number): number {
    const cx = Math.min(this.dim - 1, Math.max(0, Math.floor((x + this.half) / this.cell)));
    const cz = Math.min(this.dim - 1, Math.max(0, Math.floor((z + this.half) / this.cell)));
    return cz * this.dim + cx;
  }

  build(ids: ArrayLike<number>, n: number, xs: Float32Array, zs: Float32Array): void {
    this.counts.fill(0);
    for (let k = 0; k < n; k++) {
      const i = ids[k];
      const c = this.key(xs[i], zs[i]);
      this.cellOf[k] = c;
      this.counts[c]++;
    }
    let s = 0;
    for (let c = 0; c < this.counts.length; c++) {
      this.starts[c] = s;
      s += this.counts[c];
    }
    this.starts[this.counts.length] = s;
    const fill = this.counts;
    fill.fill(0);
    for (let k = 0; k < n; k++) {
      const c = this.cellOf[k];
      this.items[this.starts[c] + fill[c]++] = ids[k];
    }
  }

  /** Calls fn(id) for every item in the cells overlapping the circle. Return true from fn to stop early. */
  query(x: number, z: number, r: number, fn: (id: number) => boolean | void): void {
    const x0 = Math.max(0, Math.floor((x - r + this.half) / this.cell)),
      x1 = Math.min(this.dim - 1, Math.floor((x + r + this.half) / this.cell));
    const z0 = Math.max(0, Math.floor((z - r + this.half) / this.cell)),
      z1 = Math.min(this.dim - 1, Math.floor((z + r + this.half) / this.cell));
    for (let cz = z0; cz <= z1; cz++)
      for (let cx = x0; cx <= x1; cx++) {
        const c = cz * this.dim + cx;
        for (let k = this.starts[c], e = this.starts[c + 1]; k < e; k++) if (fn(this.items[k])) return;
      }
  }
}
