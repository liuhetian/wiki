// Scatters scenery over the terrain: jittered grid candidates, clumped by low-frequency noise, filtered by slope,
// paths, zones and spacing. Solid props register colliders; anything with a shadow goes into the baked shade mask.

import { Vector3 } from 'three';
import { Noise2, Rng } from '../core/rng';
import type { PropAtlas } from '../art/props';
import type { PropInstance } from '../render/propBatch';
import type { Terrain } from './terrain';

export function scatterProps(t: Terrain, atlas: PropAtlas, seed: number): { list: PropInstance[]; shadows: { x: number; z: number; r: number }[] } {
  const rng = new Rng(seed ^ 0x9e3779b9);
  const noise = new Noise2(seed ^ 0x1234567);
  const list: PropInstance[] = [];
  const shadows: { x: number; z: number; r: number }[] = [];
  const solids: { x: number; z: number; r: number }[] = [];
  const b = t.biome;
  const step = 1.55;
  const lim = t.play - 3;
  const norm = new Vector3();
  for (let gz = -lim; gz < lim; gz += step)
    for (let gx = -lim; gx < lim; gx += step) {
      const x = gx + rng.range(-0.7, 0.7) * step,
        z = gz + rng.range(-0.7, 0.7) * step;
      const r0 = Math.hypot(x, z);
      if (r0 < 7) continue;
      if (t.pathAt(x, z) > 0.2) continue;
      const n = t.normal(x, z, norm);
      if (n.y < 0.92) continue;
      const y = t.height(x, z);
      const zone = y > b.highA + 1 ? 'high' : 'low';
      const clump = noise.fbm(x * 0.035, z * 0.035, 3) * 0.5 + 0.5;
      const pick = rng.weighted(atlas.defs.map((d, i) => ({ w: d.zone === 'any' || d.zone === zone ? d.weight : 0, v: i })));
      const d = atlas.defs[pick];
      if (!(d.zone === 'any' || d.zone === zone)) continue;
      // Clumping: trees gather into groves, grass spreads more evenly.
      const p = 0.11 * b.propDensity * (1 - d.cluster + d.cluster * Math.pow(clump, 2.2) * 3.2);
      if (!rng.chance(p)) continue;
      const s = rng.range(d.scale[0], d.scale[1]);
      if (d.solid > 0) {
        if (r0 < 11) continue;
        const rr = d.solid * s;
        if (solids.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + rr + 0.8)) continue;
        if (!t.isFlat(x, z, rr + 0.4)) continue;
        solids.push({ x, z, r: rr });
        t.addCollider(x, z, rr);
      }
      list.push({ def: pick, x, y, z, s, flip: rng.chance(0.5) });
      if (d.shadow > 0) shadows.push({ x, z, r: d.shadow * s });
    }
  return { list, shadows };
}

/** Flat, reachable-looking spots for chests and shrines, spread apart. */
export function pickSpots(t: Terrain, seed: number, count: number, minDist: number, avoid: { x: number; z: number }[]): { x: number; z: number }[] {
  const rng = new Rng(seed);
  const out: { x: number; z: number }[] = [];
  for (let tries = 0; out.length < count && tries < 4000; tries++) {
    const x = rng.range(-t.play + 12, t.play - 12),
      z = rng.range(-t.play + 12, t.play - 12);
    if (Math.hypot(x, z) < 18) continue;
    if (!t.isFlat(x, z, 2.6)) continue;
    if ([...out, ...avoid].some((o) => Math.hypot(o.x - x, o.z - z) < minDist)) continue;
    out.push({ x, z });
  }
  return out;
}
