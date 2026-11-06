// Original creatures, built as ellipsoid rigs with a pose function per animation. Each one is rendered from 8 yaw
// angles into a vertically stacked sheet whose metadata matches the PMD-style sprites.json layout:
//   { w, h, anims: { walk|idle|attack|hurt|faint: { y, fw, fh, n, rows: 8, d: [ticks @60fps per frame] } } }

import { PixelImage } from './pixel';
import { mat, renderRig, onSurface, type Mat, type Pose, type Prim, type V3 } from './rig';

export type AnimName = 'walk' | 'idle' | 'attack' | 'hurt' | 'faint';
export const ANIMS: AnimName[] = ['walk', 'idle', 'attack', 'hurt', 'faint'];

export interface AnimMeta {
  y: number;
  fw: number;
  fh: number;
  n: number;
  rows: number;
  d: number[];
}
export interface SheetMeta {
  w: number;
  h: number;
  anims: Record<AnimName, AnimMeta>;
}
export interface SpriteSheet {
  id: string;
  canvas: HTMLCanvasElement;
  meta: SheetMeta;
}

interface CreatureDef {
  id: string;
  fw: number;
  fh: number;
  oy: number;
  mats: Mat[];
  anims: Record<AnimName, number[]>; // frame durations
  pose: (anim: AnimName, f: number, n: number) => Pose;
}

const P = (c: V3, r: V3, m: number, rot?: V3): Prim => ({ c, r, m, rot });
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** Rotates an offset around X (limb swing). Positive swings backward. */
const swingX = (v: V3, a: number): V3 => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
const swingZ = (v: V3, a: number): V3 => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- hero: a young wandering mage with a staff
const hero: CreatureDef = {
  id: 'hero',
  fw: 40,
  fh: 46,
  oy: 41,
  mats: [
    mat(0xf2c49b), // 0 skin
    mat(0x6b3f2a), // 1 hair
    mat(0x3f7fc8), // 2 tunic
    mat(0xc8463c), // 3 cape
    mat(0x5a3a28), // 4 boots / belt
    mat(0x1d1630), // 5 eyes
    mat(0x8a5a33), // 6 staff
    mat(0x7ff0ff, { glow: true }), // 7 gem
    mat(0xf2c14e), // 8 scarf
    mat(0x464a6e), // 9 trousers
  ],
  anims: { walk: [7, 7, 7, 7, 7, 7], idle: [26, 10, 26, 10], attack: [4, 4, 5, 8, 5, 6], hurt: [4, 14], faint: [8, 8, 10, 40] },
  pose(anim, f, n) {
    const t = f / n,
      w = Math.sin(t * TAU);
    let leg = 0,
      armL = 0.1,
      armR = -0.25,
      bob = 0,
      cape = 0.15;
    const pose: Pose = { prims: [] };
    if (anim === 'walk') {
      leg = w * 0.65;
      armL = -w * 0.5;
      armR = -0.25 + w * 0.25;
      bob = Math.abs(Math.cos(t * TAU)) * 1.1;
      cape = 0.3 + Math.abs(w) * 0.2;
    } else if (anim === 'idle') {
      bob = f % 2 ? -0.5 : 0;
    } else if (anim === 'attack') {
      const k = [0, 1, 2, 2, 1, 0][f];
      armR = [-0.6, -1.6, -1.5, -1.45, -1.0, -0.5][f];
      pose.tilt = [-0.08, -0.12, 0.14, 0.18, 0.1, 0][f];
      pose.fwd = k * 1.2;
      cape = 0.2 + k * 0.15;
    } else if (anim === 'hurt') {
      pose.tilt = f ? -0.2 : -0.38;
      pose.squash = f ? 0 : 0.08;
      armL = 0.6;
      armR = 0.3;
    } else {
      const k = f / (n - 1);
      pose.tilt = -k * 1.45;
      pose.lift = -k * 1.5;
      armL = armR = 0.8 * k;
    }
    const y = bob;
    const hipL: V3 = [-2.5, 7 + y, 0],
      hipR: V3 = [2.5, 7 + y, 0];
    const shL: V3 = [-5.4, 13.6 + y, 0],
      shR: V3 = [5.4, 13.6 + y, 0];
    const handR = add(shR, swingX([0, -6, 0.4], armR));
    pose.prims.push(
      P(add(hipL, swingX([0, -3.4, 0], leg)), [2.1, 3.4, 2.2], 9, [leg, 0, 0]),
      P(add(hipR, swingX([0, -3.4, 0], -leg)), [2.1, 3.4, 2.2], 9, [-leg, 0, 0]),
      P(add(hipL, swingX([0, -6.2, 0.8], leg)), [2.4, 1.6, 3], 4),
      P(add(hipR, swingX([0, -6.2, 0.8], -leg)), [2.4, 1.6, 3], 4),
      P([0, 10.8 + y, 0], [5, 5.4, 4], 2),
      P([0, 8.2 + y, 0], [5.3, 1.2, 4.3], 4),
      P([0, 11 + y, -3.5], [5.3, 6.3, 1.3], 3, [cape, 0, 0]),
      P(add(shL, swingX([0, -3.1, 0], armL)), [1.8, 3.5, 1.8], 2, [armL, 0, 0]),
      P(add(shR, swingX([0, -3.1, 0], armR)), [1.8, 3.5, 1.8], 2, [armR, 0, 0]),
      P(add(shL, swingX([0, -6, 0.4], armL)), [1.6, 1.6, 1.6], 0),
      P(handR, [1.6, 1.6, 1.6], 0),
      P(add(handR, swingX([0, 4, 0.6], armR + 0.25)), [0.75, 7.5, 0.75], 6, [armR + 0.25, 0, 0]),
      P(add(handR, swingX([0, 11.8, 0.6], armR + 0.25)), [1.7, 1.7, 1.7], 7),
      P([0, 15 + y, 0.4], [4.7, 1.6, 4.3], 8),
      P([0, 20.2 + y, 0.5], [6.4, 5.9, 5.9], 0),
      P([0, 22.6 + y, -0.9], [6.9, 5, 6.5], 1),
      P([0, 23.8 + y, 3], [5.6, 2.3, 3.1], 1),
      P([-2.3, 19.6 + y, 5.7], [0.9, 1.5, 0.7], 5),
      P([2.3, 19.6 + y, 5.7], [0.9, 1.5, 0.7], 5),
    );
    return pose;
  },
};

// ---------------------------------------------------------------- slime
const slime: CreatureDef = {
  id: 'slime',
  fw: 32,
  fh: 30,
  oy: 27,
  mats: [mat(0x58c27d), mat(0x1d2a30), mat(0xe8fff0, { glow: true })],
  anims: { walk: [6, 7, 7, 6], idle: [18, 12, 18, 12], attack: [5, 4, 5, 6, 8], hurt: [4, 14], faint: [8, 8, 10, 40] },
  pose(anim, f, n) {
    const p: Pose = { prims: [] };
    if (anim === 'walk') {
      p.squash = [0.22, -0.14, -0.06, 0.1][f];
      p.lift = [0, 2.6, 4.2, 1.2][f];
    } else if (anim === 'idle') p.squash = [0, 0.06, 0, -0.04][f];
    else if (anim === 'attack') {
      p.squash = [0.3, -0.25, -0.1, 0.05, 0.12][f];
      p.fwd = [0, 2.5, 5, 3, 1][f];
      p.lift = [0, 2, 2.5, 0.5, 0][f];
    } else if (anim === 'hurt') {
      p.squash = f ? 0.1 : 0.3;
      p.tilt = -0.2;
    } else {
      const k = f / (n - 1);
      p.squash = 0.2 + k * 0.5;
      p.lift = -k * 1.5;
    }
    p.prims.push(
      P([0, 6.6, 0], [9, 7, 8.6], 0),
      P([-3.2, 8.2, 7.6], [1.1, 2, 0.7], 1),
      P([3.2, 8.2, 7.6], [1.1, 2, 0.7], 1),
      P([0, 5.1, 8.3], [1.6, 0.6, 0.5], 1),
      P([-3.6, 11.2, 4.4], [2, 1.1, 1.4], 2),
    );
    return p;
  },
};

// ---------------------------------------------------------------- bat
const bat: CreatureDef = {
  id: 'bat',
  fw: 44,
  fh: 40,
  oy: 37,
  mats: [mat(0x7d5ab8), mat(0x4d3580), mat(0xff5a5a, { glow: true }), mat(0xe08ab0), mat(0xffffff)],
  anims: { walk: [5, 5, 5, 5], idle: [7, 7, 7, 7], attack: [4, 4, 6, 8], hurt: [4, 14], faint: [8, 8, 10, 40] },
  pose(anim, f, n) {
    const p: Pose = { prims: [] };
    let flap = [0.95, 0.25, -0.5, 0.25][f % 4];
    let lift = 10 + [0, 1, 2, 1][f % 4];
    if (anim === 'attack') {
      p.fwd = [0, 2, 5, 2][f];
      p.tilt = [0, 0.25, 0.45, 0.2][f];
      flap = [1, 0.6, -0.6, 0][f];
    } else if (anim === 'hurt') {
      p.tilt = -0.4;
      flap = 0.9;
    } else if (anim === 'faint') {
      const k = f / (n - 1);
      lift = 10 * (1 - k) + 1;
      p.roll = k * 1.3;
      flap = -0.3;
    }
    const y = lift;
    const shL: V3 = [-3, 13 + y - 10, -0.5],
      shR: V3 = [3, 13 + y - 10, -0.5];
    p.prims.push(
      P([0, 12 + y - 10, 0], [4.6, 4.6, 4.2], 0),
      P(add(shL, swingZ([-5.5, 0, 0], -flap)), [6.5, 2.4, 0.9], 1, [0, 0, -flap]),
      P(add(shR, swingZ([5.5, 0, 0], flap)), [6.5, 2.4, 0.9], 1, [0, 0, flap]),
      P([-2.4, 17 + y - 10, 0], [1.3, 3, 1.2], 0, [0, 0, 0.3]),
      P([2.4, 17 + y - 10, 0], [1.3, 3, 1.2], 0, [0, 0, -0.3]),
      P([-2.4, 16.8 + y - 10, 0.6], [0.7, 2, 0.6], 3, [0, 0, 0.3]),
      P([2.4, 16.8 + y - 10, 0.6], [0.7, 2, 0.6], 3, [0, 0, -0.3]),
      P([-1.7, 12.8 + y - 10, 3.9], [0.9, 1, 0.6], 2),
      P([1.7, 12.8 + y - 10, 3.9], [0.9, 1, 0.6], 2),
      P([-0.9, 10.3 + y - 10, 3.9], [0.4, 0.8, 0.4], 4),
      P([0.9, 10.3 + y - 10, 3.9], [0.4, 0.8, 0.4], 4),
    );
    p.lift = 0;
    return p;
  },
};

// ---------------------------------------------------------------- mushroom
const mushroom: CreatureDef = {
  id: 'mushroom',
  fw: 34,
  fh: 36,
  oy: 33,
  mats: [mat(0xf0e0c0), mat(0xd9483b), mat(0xfff6e8), mat(0x2a1a1a), mat(0x9a6a48), mat(0xc9a98a)],
  anims: { walk: [7, 7, 7, 7], idle: [24, 10, 24, 10], attack: [5, 5, 6, 8], hurt: [4, 14], faint: [8, 8, 10, 40] },
  pose(anim, f, n) {
    const p: Pose = { prims: [] };
    let footL = 0,
      footR = 0,
      bob = 0;
    if (anim === 'walk') {
      p.roll = [0.13, 0, -0.13, 0][f];
      footL = [1.5, 0, 0, 0][f];
      footR = [0, 0, 1.5, 0][f];
      bob = [0.5, 0, 0.5, 0][f];
    } else if (anim === 'idle') p.squash = [0, 0.05, 0, 0.05][f];
    else if (anim === 'attack') {
      p.tilt = [-0.15, 0.25, 0.4, 0.1][f];
      p.fwd = [0, 2, 4, 1][f];
    } else if (anim === 'hurt') {
      p.tilt = -0.3;
      p.squash = f ? 0 : 0.12;
    } else {
      const k = f / (n - 1);
      p.roll = k * 1.4;
      p.lift = -k;
    }
    const cap = P([0, 14 + bob, 0], [10, 5.6, 10], 1);
    p.prims.push(
      P([-2.6, 1.2 + footL, 0.6], [2.4, 1.3, 2.8], 4),
      P([2.6, 1.2 + footR, 0.6], [2.4, 1.3, 2.8], 4),
      P([0, 6.5 + bob, 0.5], [4.6, 6, 4.4], 0),
      P([0, 11.2 + bob, 0], [8.6, 1.5, 8.6], 5),
      cap,
      P([-1.9, 7.6 + bob, 4.6], [0.8, 1.4, 0.6], 3),
      P([1.9, 7.6 + bob, 4.6], [0.8, 1.4, 0.6], 3),
    );
    for (const [th, ph] of [[0, 0.1], [0.9, 0.95], [2.3, 0.85], [3.6, 0.95], [4.9, 0.8], [-0.7, 0.62]])
      p.prims.push(P(onSurface(cap, th, ph, 0.93), [2.1, 1.2, 2.1], 2));
    return p;
  },
};

// ---------------------------------------------------------------- beetle
const beetle: CreatureDef = {
  id: 'beetle',
  fw: 42,
  fh: 32,
  oy: 28,
  mats: [mat(0x2f8f8a), mat(0x2a2a3a), mat(0xd9c38a), mat(0xffd34a, { glow: true }), mat(0x1f1f2a), mat(0x1c5d61)],
  anims: { walk: [5, 5, 5, 5], idle: [20, 10, 20, 10], attack: [4, 4, 6, 10], hurt: [4, 14], faint: [8, 8, 10, 40] },
  pose(anim, f, n) {
    const p: Pose = { prims: [] };
    let g = 0;
    if (anim === 'walk') g = [1, 0, -1, 0][f];
    else if (anim === 'attack') {
      p.fwd = [0, 1, 5, 2][f];
      p.tilt = [-0.15, -0.2, 0.15, 0][f];
    } else if (anim === 'hurt') p.tilt = -0.25;
    else if (anim === 'faint') {
      const k = f / (n - 1);
      p.roll = k * 2.6;
      p.lift = k * 3;
    }
    p.prims.push(
      P([0, 6.5, -1], [7, 5, 9], 0),
      P([0, 9.6, -1], [0.6, 1.8, 8.4], 5),
      P([0, 5, 7.5], [4, 3.4, 3.4], 1),
      P([0, 9, 10.5], [1.2, 4, 1.2], 2, [0.7, 0, 0]),
      P([-2, 5.8, 10.3], [0.9, 0.9, 0.6], 3),
      P([2, 5.8, 10.3], [0.9, 0.9, 0.6], 3),
    );
    for (const side of [-1, 1])
      for (const [i, z] of [[0, 5], [1, 0], [2, -5]] as const) {
        const ph = (i + (side > 0 ? 1 : 0)) % 2 ? g : -g;
        p.prims.push(P([side * 7.6, 1.8, z + ph * 1.5], [3, 0.9, 0.9], 4, [0, 0, side * -0.5]));
      }
    return p;
  },
};

// ---------------------------------------------------------------- gargoyle (elite-ish)
const gargoyle: CreatureDef = {
  id: 'gargoyle',
  fw: 48,
  fh: 46,
  oy: 42,
  mats: [mat(0x8c8fa3, { noise: 0.25 }), mat(0x5e6075, { noise: 0.2 }), mat(0xff9a3c, { glow: true }), mat(0xd8d0c0), mat(0x6a6d85)],
  anims: { walk: [7, 7, 7, 7], idle: [22, 10, 22, 10], attack: [5, 4, 5, 8, 6], hurt: [4, 14], faint: [8, 8, 10, 40] },
  pose(anim, f, n) {
    const p: Pose = { prims: [] };
    let leg = 0,
      arm = 0,
      flap = 0.4,
      bob = 0;
    if (anim === 'walk') {
      leg = [0.5, 0, -0.5, 0][f];
      arm = -leg * 0.7;
      bob = [0, 0.8, 0, 0.8][f];
    } else if (anim === 'idle') flap = [0.4, 0.55, 0.4, 0.3][f];
    else if (anim === 'attack') {
      arm = [-0.4, -1.8, -1.2, -0.6, -0.2][f];
      p.fwd = [0, 0, 3, 4, 1][f];
      p.tilt = [0, -0.1, 0.25, 0.3, 0.1][f];
      flap = [0.4, 0.9, 0.2, 0.1, 0.3][f];
    } else if (anim === 'hurt') {
      p.tilt = -0.3;
      flap = 0.9;
    } else {
      const k = f / (n - 1);
      p.tilt = k * 1.3;
      p.lift = -k * 1.5;
    }
    const y = bob;
    p.prims.push(
      P(add([-3, 6.8 + y, 0.5], swingX([0, -3.4, 0], leg)), [2.6, 3.6, 2.6], 1, [leg, 0, 0]),
      P(add([3, 6.8 + y, 0.5], swingX([0, -3.4, 0], -leg)), [2.6, 3.6, 2.6], 1, [-leg, 0, 0]),
      P([0, 11 + y, 0], [6, 7, 5], 0),
      P([0, 5 + y, -6], [1.2, 1.2, 4], 1, [-0.5, 0, 0]),
      P(add([-4, 15 + y, -3], swingZ([-6, 2, 0], -flap)), [6.5, 5, 0.9], 4, [0, 0, -flap]),
      P(add([4, 15 + y, -3], swingZ([6, 2, 0], flap)), [6.5, 5, 0.9], 4, [0, 0, flap]),
      P(add([-6.3, 14.5 + y, 1.5], swingX([0, -4, 0], arm)), [2, 4.2, 2], 0, [arm, 0, 0]),
      P(add([6.3, 14.5 + y, 1.5], swingX([0, -4, 0], arm)), [2, 4.2, 2], 0, [arm, 0, 0]),
      P(add([-6.3, 14.5 + y, 1.5], swingX([0, -8, 0.6], arm)), [1.8, 1.6, 2], 1),
      P(add([6.3, 14.5 + y, 1.5], swingX([0, -8, 0.6], arm)), [1.8, 1.6, 2], 1),
      P([0, 20.5 + y, 1.5], [5, 4.4, 4.6], 0),
      P([0, 19.2 + y, 5.4], [2.6, 2, 2], 1),
      P([-3, 24.5 + y, 0], [1, 3.2, 1], 3, [0, 0, 0.45]),
      P([3, 24.5 + y, 0], [1, 3.2, 1], 3, [0, 0, -0.45]),
      P([-1.9, 21.2 + y, 5.5], [0.9, 0.7, 0.5], 2),
      P([1.9, 21.2 + y, 5.5], [0.9, 0.7, 0.5], 2),
    );
    return p;
  },
};

// ---------------------------------------------------------------- boss: rock golem
const golem: CreatureDef = {
  id: 'golem',
  fw: 108,
  fh: 104,
  oy: 99,
  mats: [
    mat(0x8a7f72, { noise: 0.3 }),
    mat(0x5e554c, { noise: 0.2 }),
    mat(0x6ff3ff, { glow: true }),
    mat(0xffe26a, { glow: true }),
    mat(0x5f9a46, { noise: 0.4 }),
  ],
  anims: { walk: [9, 9, 9, 9], idle: [24, 12, 24, 12], attack: [8, 8, 10, 4, 12, 10], hurt: [4, 14], faint: [10, 10, 14, 60] },
  pose(anim, f, n) {
    const p: Pose = { prims: [] };
    let leg = 0,
      armL = 0.15,
      armR = 0.15,
      bob = 0;
    if (anim === 'walk') {
      leg = [0.35, 0, -0.35, 0][f];
      armL = 0.15 - leg * 0.8;
      armR = 0.15 + leg * 0.8;
      bob = [0, 1.5, 0, 1.5][f];
      p.roll = [0.04, 0, -0.04, 0][f];
    } else if (anim === 'idle') bob = [0, -0.8, 0, -0.8][f];
    else if (anim === 'attack') {
      armL = armR = [-0.6, -2.4, -2.8, -1.2, -0.7, -0.2][f];
      p.tilt = [0, -0.12, -0.15, 0.22, 0.25, 0.08][f];
      p.fwd = [0, 0, 0, 4, 4, 1][f];
    } else if (anim === 'hurt') p.tilt = -0.15;
    else {
      const k = f / (n - 1);
      p.tilt = k * 0.5;
      p.lift = -k * 6;
      p.squash = k * 0.15;
    }
    const y = bob;
    const shL: V3 = [-19, 42 + y, 0],
      shR: V3 = [19, 42 + y, 0];
    p.prims.push(
      P(add([-9, 15, 0], swingX([0, -7, 0], leg)), [7, 9, 7], 1, [leg, 0, 0]),
      P(add([9, 15, 0], swingX([0, -7, 0], -leg)), [7, 9, 7], 1, [-leg, 0, 0]),
      P([0, 17 + y, 0], [13, 7, 10], 1),
      P([0, 32 + y, 0], [18, 16, 13], 0),
      P(add(shL, swingX([0, -10, 0], armL)), [6.5, 10, 6.5], 0, [armL, 0, 0]),
      P(add(shR, swingX([0, -10, 0], armR)), [6.5, 10, 6.5], 0, [armR, 0, 0]),
      P(add(shL, swingX([0, -22, 2], armL)), [8, 7, 8], 1),
      P(add(shR, swingX([0, -22, 2], armR)), [8, 7, 8], 1),
      P(shL, [9, 8, 8], 0),
      P(shR, [9, 8, 8], 0),
      P([-19, 49 + y, 0], [6, 2, 5], 4),
      P([19, 49 + y, 0], [6, 2, 5], 4),
      P([0, 51 + y, 4], [10, 8, 9], 0),
      P([0, 54 + y, 10], [8, 2.4, 3], 1),
      P([-4, 51 + y, 12], [2, 1.4, 1], 3),
      P([4, 51 + y, 12], [2, 1.4, 1], 3),
      P([-3, 58 + y, 3], [6, 2, 5], 4),
      P([0, 46 + y, -11], [3, 8, 3], 2, [-0.4, 0, 0]),
      P([-7, 44 + y, -10], [2, 5, 2], 2, [-0.3, 0, 0.4]),
      P([7, 44 + y, -10], [2, 5, 2], 2, [-0.3, 0, -0.4]),
    );
    return p;
  },
};

export const CREATURES: CreatureDef[] = [hero, slime, bat, mushroom, beetle, gargoyle, golem];

const PITCH = 0.42;

export function buildSheet(def: CreatureDef): SpriteSheet {
  const { fw, fh } = def;
  let maxW = 0,
    totalH = 0;
  for (const a of ANIMS) {
    maxW = Math.max(maxW, def.anims[a].length * fw);
    totalH += 8 * fh;
  }
  const sheet = new PixelImage(maxW, totalH);
  const anims = {} as Record<AnimName, AnimMeta>;
  let y = 0;
  for (const a of ANIMS) {
    const d = def.anims[a];
    const n = d.length;
    for (let f = 0; f < n; f++) {
      const pose = def.pose(a, f, n);
      for (let row = 0; row < 8; row++) {
        const img = renderRig(pose, def.mats, { w: fw, h: fh, yaw: (row * Math.PI) / 4, pitch: PITCH, ox: fw / 2, oy: def.oy, seed: 11 });
        sheet.blit(img, f * fw, y + row * fh);
      }
    }
    anims[a] = { y, fw, fh, n, rows: 8, d };
    y += 8 * fh;
  }
  return { id: def.id, canvas: sheet.toCanvas(), meta: { w: maxW, h: totalH, anims } };
}
