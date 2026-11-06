// Biome parameters: terrain shape, zone heights, sky/fog/light and which enemies roam there.

import type { BiomeId } from '../art/tiles';
import type { EnvLook } from '../render/renderer';

export interface Biome extends EnvLook {
  id: BiomeId;
  name: string;
  desc: string;
  levels: number; // terrace levels
  stepH: number; // height of one terrace
  freq: number; // base noise frequency
  massifs: number;
  snowH: number; // snow line (world height)
  highA: number; // highland zone ramp start/end
  highB: number;
  shadow: number; // terrain shade colour
  cloud: number; // cloud shadow multiplier colour
  propDensity: number;
  enemies: { id: string; from: number; w: number }[]; // unlock time (s) and weight
}

const STEP = 4.6;

export const BIOMES: Record<BiomeId, Biome> = {
  meadow: {
    id: 'meadow',
    name: '翠风高原',
    desc: '台地与草甸，山巅积雪。',
    levels: 5,
    stepH: STEP,
    freq: 0.011,
    massifs: 3,
    snowH: STEP * 4.4,
    highA: STEP * 1.7,
    highB: STEP * 2.8,
    fog: 0xc4e4fa,
    skyTop: 0x4f96e6,
    skyHorizon: 0xd2ebff,
    sun: 0xfff3dc,
    light: 1.0,
    hemiSky: 0xe0f0ff,
    hemiGround: 0x7a8a5a,
    shadow: 0x7486c8,
    cloud: 0xc4cdf0,
    propDensity: 1,
    enemies: [
      { id: 'slime', from: 0, w: 5 },
      { id: 'mushroom', from: 40, w: 3 },
      { id: 'bat', from: 90, w: 3 },
      { id: 'beetle', from: 170, w: 2 },
      { id: 'gargoyle', from: 280, w: 1.2 },
    ],
  },
  snow: {
    id: 'snow',
    name: '霜牙雪岭',
    desc: '寒风呼啸的雪原与冰晶。',
    levels: 5,
    stepH: STEP,
    freq: 0.012,
    massifs: 4,
    snowH: STEP * 3.3,
    highA: STEP * 0.9,
    highB: STEP * 1.8,
    fog: 0xc6d6ec,
    skyTop: 0x5f86c8,
    skyHorizon: 0xdae6f6,
    sun: 0xf2f4ff,
    light: 0.96,
    hemiSky: 0xf0f6ff,
    hemiGround: 0x8a9ab8,
    shadow: 0x8090c8,
    cloud: 0xc8d2f0,
    propDensity: 0.85,
    enemies: [
      { id: 'slime', from: 0, w: 4 },
      { id: 'bat', from: 30, w: 4 },
      { id: 'beetle', from: 120, w: 2 },
      { id: 'mushroom', from: 150, w: 1.5 },
      { id: 'gargoyle', from: 240, w: 1.6 },
    ],
  },
  desert: {
    id: 'desert',
    name: '赤砂峡谷',
    desc: '烈日下的砂岩台地与绿洲。',
    levels: 4,
    stepH: STEP,
    freq: 0.0095,
    massifs: 3,
    snowH: 999,
    highA: STEP * 1.3,
    highB: STEP * 2.3,
    fog: 0xf2dcb4,
    skyTop: 0x5f9fe0,
    skyHorizon: 0xf8e6c4,
    sun: 0xfff0d4,
    light: 1.04,
    hemiSky: 0xfff0d8,
    hemiGround: 0xa07a5a,
    shadow: 0x9c7a92,
    cloud: 0xe0c8c8,
    propDensity: 0.7,
    enemies: [
      { id: 'slime', from: 0, w: 4 },
      { id: 'beetle', from: 25, w: 3 },
      { id: 'bat', from: 60, w: 3 },
      { id: 'mushroom', from: 120, w: 1.5 },
      { id: 'gargoyle', from: 200, w: 1.5 },
    ],
  },
};
