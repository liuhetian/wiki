// Gameplay tables: enemies, weapons (5 levels each) and passives. Tweak balance here.

export interface EnemyType {
  id: string;
  name: string;
  hp: number;
  speed: number;
  dmg: number;
  xp: number;
  scale: number;
  fly?: boolean;
  knockRes: number; // 0 = full knockback, 1 = immune
  color: number; // death particles
}

export const ENEMY_TYPES: Record<string, EnemyType> = {
  slime: { id: 'slime', name: '史莱姆', hp: 14, speed: 3.1, dmg: 5, xp: 1, scale: 1, knockRes: 0, color: 0x58c27d },
  bat: { id: 'bat', name: '影翼蝠', hp: 10, speed: 5.0, dmg: 5, xp: 1, scale: 1, fly: true, knockRes: 0, color: 0x7d5ab8 },
  mushroom: { id: 'mushroom', name: '伞菇怪', hp: 28, speed: 2.7, dmg: 8, xp: 2, scale: 1, knockRes: 0.2, color: 0xd9483b },
  beetle: { id: 'beetle', name: '铠甲虫', hp: 42, speed: 3.6, dmg: 10, xp: 3, scale: 1, knockRes: 0.5, color: 0x2f8f8a },
  gargoyle: { id: 'gargoyle', name: '石像鬼', hp: 95, speed: 3.0, dmg: 14, xp: 6, scale: 1.1, knockRes: 0.6, color: 0x8c8fa3 },
  golem: { id: 'golem', name: '远古岩魔像', hp: 3000, speed: 3.3, dmg: 24, xp: 0, scale: 1, knockRes: 1, color: 0x8a7f72 },
};

export type WeaponId = 'bolt' | 'orbit' | 'blast' | 'chain' | 'slash' | 'meteor';
export type PassiveId = 'speed' | 'magnet' | 'haste' | 'power' | 'vitality';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  desc: string;
  levels: { cd: number; dmg: number; n: number; r: number; extra: number }[];
  lvDesc: string[];
}

const L = (cd: number, dmg: number, n: number, r: number, extra = 0) => ({ cd, dmg, n, r, extra });

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  bolt: {
    id: 'bolt',
    name: '奥术飞弹',
    desc: '自动追踪最近的敌人。',
    // n = bolts per volley, extra = pierce
    levels: [L(0.85, 14, 1, 0, 0), L(0.8, 17, 1, 0, 1), L(0.72, 20, 2, 0, 1), L(0.64, 24, 2, 0, 2), L(0.55, 30, 3, 0, 2)],
    lvDesc: ['发射 1 枚追踪飞弹', '伤害 +25%，穿透 1 个敌人', '每次发射 2 枚', '冷却缩短，穿透 2 个敌人', '每次发射 3 枚，伤害大幅提升'],
  },
  orbit: {
    id: 'orbit',
    name: '星环护符',
    desc: '光球环绕自身，撞击触碰的敌人。',
    // n = orbs, r = orbit radius, extra = angular speed
    levels: [L(0.5, 8, 2, 2.6, 2.6), L(0.5, 10, 3, 2.8, 2.8), L(0.45, 12, 3, 3.0, 3.1), L(0.45, 14, 4, 3.2, 3.3), L(0.4, 18, 5, 3.5, 3.6)],
    lvDesc: ['2 颗光球环绕', '光球 +1', '伤害与转速提升', '光球 +1，范围扩大', '5 颗光球，伤害大幅提升'],
  },
  blast: {
    id: 'blast',
    name: '炎爆术',
    desc: '向敌群投掷火球，落地爆炸。',
    levels: [L(2.4, 24, 1, 2.8), L(2.2, 30, 1, 3.1), L(2.0, 38, 2, 3.4), L(1.8, 48, 2, 3.8), L(1.5, 62, 3, 4.3)],
    lvDesc: ['投掷 1 枚火球', '伤害与爆炸范围提升', '每次 2 枚火球', '伤害与范围提升', '每次 3 枚火球'],
  },
  chain: {
    id: 'chain',
    name: '连锁闪电',
    desc: '闪电在敌人之间跳跃。',
    // n = jumps
    levels: [L(1.8, 16, 3, 7), L(1.6, 20, 4, 7), L(1.4, 24, 5, 7.5), L(1.2, 28, 6, 8), L(1.0, 34, 8, 8.5)],
    lvDesc: ['跳跃 3 次', '跳跃 +1，伤害提升', '跳跃 +1，冷却缩短', '跳跃 +1，伤害提升', '跳跃 8 次'],
  },
  slash: {
    id: 'slash',
    name: '新月斩',
    desc: '向前方扇形挥斩并击退敌人。',
    // r = reach, extra = 1 → also slashes behind
    levels: [L(1.3, 20, 1, 3.6), L(1.15, 26, 1, 4.0), L(1.0, 32, 1, 4.4), L(0.9, 40, 1, 4.8), L(0.75, 50, 1, 5.2, 1)],
    lvDesc: ['向前方挥斩', '伤害与范围提升', '冷却缩短', '伤害与范围提升', '同时向身后挥斩'],
  },
  meteor: {
    id: 'meteor',
    name: '陨石雨',
    desc: '召唤陨石轰击敌人所在的位置。',
    levels: [L(4.2, 40, 2, 2.8), L(3.8, 50, 3, 2.9), L(3.4, 60, 3, 3.1), L(3.0, 75, 4, 3.3), L(2.6, 95, 5, 3.6)],
    lvDesc: ['召唤 2 颗陨石', '陨石 +1', '伤害提升，冷却缩短', '陨石 +1', '5 颗陨石，伤害大幅提升'],
  },
};

export interface PassiveDef {
  id: PassiveId;
  name: string;
  desc: string;
}

export const PASSIVES: Record<PassiveId, PassiveDef> = {
  speed: { id: 'speed', name: '疾风之靴', desc: '移动速度 +8%' },
  magnet: { id: 'magnet', name: '引力磁石', desc: '拾取范围 +35%' },
  haste: { id: 'haste', name: '时之沙漏', desc: '所有武器冷却 -7%' },
  power: { id: 'power', name: '力量徽记', desc: '所有伤害 +12%' },
  vitality: { id: 'vitality', name: '生命之心', desc: '最大生命 +20，每秒回复 +0.3' },
};

export const MAX_WEAPONS = 6;
export const MAX_LEVEL = 5;

export const xpForLevel = (lv: number) => Math.round(5 + (lv - 1) * 6 + (lv - 1) ** 2 * 0.65);
