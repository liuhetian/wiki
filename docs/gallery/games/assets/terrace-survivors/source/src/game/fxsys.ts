// Particles, expanding ground rings, telegraphs, lightning arcs and floating damage numbers.

import { Vector3, type Object3D, type PerspectiveCamera } from 'three';
import { Fx } from '../art/fx';
import { QuadBatch, ShadowBatch, fxTexture } from '../render/fxBatch';
import type { Shared } from '../render/renderer';
import type { Terrain } from '../world/terrain';

const PCAP = 4000;

interface Ring {
  x: number;
  y: number;
  z: number;
  r0: number;
  r1: number;
  t: number;
  life: number;
  c: [number, number, number];
}
interface Tele {
  x: number;
  z: number;
  r: number;
  t: number;
  life: number;
  dx: number;
  dz: number;
  len: number;
}
interface Arc {
  pts: number[];
  t: number;
  life: number;
  c: [number, number, number];
}
interface Pop {
  el: HTMLDivElement;
  x: number;
  y: number;
  z: number;
  t: number;
  life: number;
}

export class FxSystem {
  readonly glow: QuadBatch;
  readonly solid: QuadBatch;
  readonly ground: QuadBatch;
  readonly shadows: ShadowBatch;
  private px = new Float32Array(PCAP);
  private py = new Float32Array(PCAP);
  private pz = new Float32Array(PCAP);
  private pvx = new Float32Array(PCAP);
  private pvy = new Float32Array(PCAP);
  private pvz = new Float32Array(PCAP);
  private pl = new Float32Array(PCAP);
  private pm = new Float32Array(PCAP);
  private ps = new Float32Array(PCAP);
  private pc = new Uint8Array(PCAP);
  private pr = new Float32Array(PCAP);
  private pg = new Float32Array(PCAP);
  private pb = new Float32Array(PCAP);
  private pgr = new Float32Array(PCAP);
  private pn = 0;
  private rings: Ring[] = [];
  private teles: Tele[] = [];
  private arcs: Arc[] = [];
  private pops: Pop[] = [];
  private popFree: HTMLDivElement[] = [];
  private v = new Vector3();

  constructor(fxCanvas: HTMLCanvasElement, cols: number, rows: number, shared: Shared, parent: Object3D, private layer: HTMLElement, private terrain: Terrain) {
    const tex = fxTexture(fxCanvas);
    this.glow = new QuadBatch(tex, cols, rows, 'glow', shared, parent);
    this.solid = new QuadBatch(tex, cols, rows, 'solid', shared, parent, 2048);
    this.ground = new QuadBatch(tex, cols, rows, 'ground', shared, parent, 1024);
    this.shadows = new ShadowBatch(parent);
    for (let i = 0; i < 70; i++) {
      const el = document.createElement('div');
      el.className = 'pop';
      el.style.display = 'none';
      layer.append(el);
      this.popFree.push(el);
    }
  }

  particle(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number, cell: Fx, r: number, g: number, b: number, grav: number): void {
    if (this.pn >= PCAP) return;
    const i = this.pn++;
    this.px[i] = x;
    this.py[i] = y;
    this.pz[i] = z;
    this.pvx[i] = vx;
    this.pvy[i] = vy;
    this.pvz[i] = vz;
    this.pl[i] = life;
    this.pm[i] = life;
    this.ps[i] = size;
    this.pc[i] = cell;
    this.pr[i] = r;
    this.pg[i] = g;
    this.pb[i] = b;
    this.pgr[i] = grav;
  }

  burst(x: number, y: number, z: number, n: number, speed: number, cell: Fx, r: number, g: number, b: number, size = 0.5, life = 0.5): void {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2,
        s = speed * (0.4 + Math.random() * 0.6);
      this.particle(x, y, z, Math.cos(a) * s, Math.random() * speed * 0.8, Math.sin(a) * s, life * (0.6 + Math.random() * 0.6), size, cell, r, g, b, 6);
    }
  }

  ring(x: number, z: number, r0: number, r1: number, life: number, c: [number, number, number]): void {
    this.rings.push({ x, y: this.terrain.height(x, z), z, r0, r1, t: 0, life, c });
  }

  telegraph(x: number, z: number, r: number, life: number): void {
    this.teles.push({ x, z, r, t: 0, life, dx: 0, dz: 0, len: 0 });
  }

  telegraphLine(x: number, z: number, dx: number, dz: number, len: number, life: number): void {
    this.teles.push({ x, z, r: 0, t: 0, life, dx, dz, len });
  }

  lightning(pts: number[], c: [number, number, number] = [1.6, 1.8, 2.6]): void {
    this.arcs.push({ pts, t: 0, life: 0.18, c });
  }

  number(x: number, y: number, z: number, v: number, crit: boolean): void {
    this.popText(x, y, z, String(Math.round(v)), crit ? '#ffd23a' : '#ffffff', crit);
  }

  popText(x: number, y: number, z: number, text: string, color: string, big = false): void {
    const el = this.popFree.pop() ?? this.pops.shift()?.el;
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
    el.style.fontSize = big ? '22px' : '16px';
    el.style.display = 'block';
    this.pops.push({ el, x: x + (Math.random() - 0.5) * 0.5, y, z, t: 0, life: 0.75 });
  }

  update(dt: number): void {
    for (let i = 0; i < this.pn; i++) {
      this.pl[i] -= dt;
      if (this.pl[i] <= 0) {
        const j = --this.pn;
        this.px[i] = this.px[j];
        this.py[i] = this.py[j];
        this.pz[i] = this.pz[j];
        this.pvx[i] = this.pvx[j];
        this.pvy[i] = this.pvy[j];
        this.pvz[i] = this.pvz[j];
        this.pl[i] = this.pl[j];
        this.pm[i] = this.pm[j];
        this.ps[i] = this.ps[j];
        this.pc[i] = this.pc[j];
        this.pr[i] = this.pr[j];
        this.pg[i] = this.pg[j];
        this.pb[i] = this.pb[j];
        this.pgr[i] = this.pgr[j];
        i--;
        continue;
      }
      this.pvy[i] -= this.pgr[i] * dt;
      this.px[i] += this.pvx[i] * dt;
      this.py[i] += this.pvy[i] * dt;
      this.pz[i] += this.pvz[i] * dt;
    }
    const age = <T extends { t: number; life: number }>(list: T[]) => {
      for (let k = list.length - 1; k >= 0; k--) if ((list[k].t += dt) >= list[k].life) list.splice(k, 1);
    };
    age(this.rings);
    age(this.teles);
    age(this.arcs);
    for (let k = this.pops.length - 1; k >= 0; k--) {
      const p = this.pops[k];
      p.t += dt;
      p.y += dt * 1.4;
      if (p.t >= p.life) {
        p.el.style.display = 'none';
        this.popFree.push(p.el);
        this.pops.splice(k, 1);
      }
    }
  }

  render(cam: PerspectiveCamera, time: number): void {
    for (let i = 0; i < this.pn; i++) {
      const k = this.pl[i] / this.pm[i];
      const cell = this.pc[i];
      if (cell === Fx.Puff && this.pgr[i] === 0) this.solid.push(this.px[i], this.py[i], this.pz[i], this.ps[i] * (0.6 + (1 - k)), cell, this.pr[i], this.pg[i], this.pb[i]);
      else this.glow.push(this.px[i], this.py[i], this.pz[i], this.ps[i] * (0.4 + 0.6 * k), cell, this.pr[i], this.pg[i], this.pb[i], 1, time * 4 + i);
    }
    for (const r of this.rings) {
      const k = r.t / r.life;
      const rad = r.r0 + (r.r1 - r.r0) * (1 - (1 - k) ** 2);
      this.ground.push(r.x, r.y + 0.15, r.z, rad * 2.1, Fx.Ring, r.c[0], r.c[1], r.c[2], 0.9 * (1 - k));
    }
    for (const t of this.teles) {
      const pulse = 0.55 + 0.45 * Math.sin(time * 18);
      const k = t.t / t.life;
      if (t.len > 0) {
        for (let d = 1; d < t.len; d += 0.9) {
          const x = t.x + t.dx * d,
            z = t.z + t.dz * d;
          this.ground.push(x, this.terrain.height(x, z) + 0.15, z, 0.8, Fx.Square, 1, 0.25, 0.2, 0.6 * pulse);
        }
      } else {
        const y = this.terrain.height(t.x, t.z) + 0.15;
        this.ground.push(t.x, y, t.z, t.r * 2.1, Fx.Ring, 1, 0.3, 0.2, 0.9 * pulse);
        this.ground.push(t.x, y + 0.01, t.z, t.r * 2.1 * k, Fx.Puff, 1, 0.35, 0.2, 0.35);
      }
    }
    for (const a of this.arcs) {
      const fade = 1 - a.t / a.life;
      for (let s = 0; s + 5 < a.pts.length; s += 3) {
        const x0 = a.pts[s],
          y0 = a.pts[s + 1],
          z0 = a.pts[s + 2],
          x1 = a.pts[s + 3],
          y1 = a.pts[s + 4],
          z1 = a.pts[s + 5];
        const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
        const n = Math.max(2, Math.ceil(len / 0.28));
        let jx = 0,
          jy = 0,
          jz = 0;
        for (let q = 0; q <= n; q++) {
          const u = q / n;
          const env = Math.sin(u * Math.PI);
          jx += (Math.random() - 0.5) * 0.25;
          jy += (Math.random() - 0.5) * 0.25;
          jz += (Math.random() - 0.5) * 0.25;
          this.glow.push(x0 + (x1 - x0) * u + jx * env, y0 + (y1 - y0) * u + jy * env, z0 + (z1 - z0) * u + jz * env, 0.42, Fx.Square, a.c[0], a.c[1], a.c[2], fade);
        }
      }
    }
    // Damage numbers: project to the screen.
    const w = innerWidth,
      h = innerHeight;
    for (const p of this.pops) {
      this.v.set(p.x, p.y, p.z).project(cam);
      if (this.v.z > 1) {
        p.el.style.opacity = '0';
        continue;
      }
      const k = p.t / p.life;
      p.el.style.opacity = String(k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3);
      p.el.style.transform = `translate(${((this.v.x + 1) / 2) * w}px, ${((1 - this.v.y) / 2) * h}px) translate(-50%, -50%) scale(${k < 0.12 ? 1.4 - k * 3 : 1})`;
    }
  }

  begin(): void {
    this.glow.begin();
    this.solid.begin();
    this.ground.begin();
    this.shadows.begin();
  }

  end(): void {
    this.glow.end();
    this.solid.end();
    this.ground.end();
    this.shadows.end();
  }

  clearPops(): void {
    for (const p of this.pops) {
      p.el.style.display = 'none';
      this.popFree.push(p.el);
    }
    this.pops = [];
  }

  get particleCount(): number {
    return this.pn;
  }

  dispose(): void {
    this.clearPops();
    this.layer.querySelectorAll('.pop').forEach((e) => e.remove());
  }
}
