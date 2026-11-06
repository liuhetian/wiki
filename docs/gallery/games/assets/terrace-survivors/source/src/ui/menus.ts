// Modal screens: loading, main menu (biome + starting weapon), level-up/chest choices, pause and the end screen.

import type { Choice } from '../game/upgrades';
import { WEAPONS, type WeaponId } from '../game/data';
import { BIOMES } from '../world/biomes';
import type { BiomeId } from '../art/tiles';

const h = (tag: string, cls = '', html = '') => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};

export interface StartOpts {
  biome: BiomeId;
  weapon: WeaponId;
  seed: number;
}

export class Menus {
  private layer = h('div', 'modal');
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private loading = h('div', 'loading');

  constructor(parent: HTMLElement) {
    parent.append(this.layer, this.loading);
    this.layer.style.display = 'none';
    this.loading.innerHTML = '<div class="title">TERRACE SURVIVORS</div><div class="bar"><i></i></div><div class="label"></div>';
  }

  get visible(): boolean {
    return this.layer.style.display !== 'none';
  }

  setLoading(k: number, label: string): void {
    this.loading.style.display = '';
    (this.loading.querySelector('.bar i') as HTMLElement).style.width = `${Math.round(k * 100)}%`;
    this.loading.querySelector('.label')!.textContent = label;
  }

  hideLoading(): void {
    this.loading.style.display = 'none';
  }

  hide(): void {
    this.layer.style.display = 'none';
    this.layer.innerHTML = '';
    if (this.keyHandler) removeEventListener('keydown', this.keyHandler);
    this.keyHandler = null;
  }

  private show(...children: HTMLElement[]): void {
    this.hide();
    this.layer.append(...children);
    this.layer.style.display = '';
  }

  private onKeys(fn: (e: KeyboardEvent) => void): void {
    this.keyHandler = fn;
    addEventListener('keydown', fn);
  }

  showMain(icons: Record<string, string>, initial: StartOpts, start: (o: StartOpts) => void): void {
    const o = { ...initial };
    const panel = h('div', 'panel main');
    panel.append(h('div', 'logo', 'TERRACE<br>SURVIVORS'), h('div', 'sub', '3D 像素幸存者 · 内部测试 Demo'));
    panel.append(h('div', 'section', '选择地图'));
    const biomes = h('div', 'cards');
    for (const b of Object.values(BIOMES)) {
      const c = h('button', 'card biome' + (b.id === o.biome ? ' on' : ''));
      c.style.setProperty('--sky', '#' + b.skyTop.toString(16).padStart(6, '0'));
      c.style.setProperty('--fog', '#' + b.fog.toString(16).padStart(6, '0'));
      c.innerHTML = `<b>${b.name}</b><span>${b.desc}</span>`;
      c.onclick = () => {
        o.biome = b.id;
        biomes.querySelectorAll('.card').forEach((e) => e.classList.remove('on'));
        c.classList.add('on');
      };
      biomes.append(c);
    }
    panel.append(biomes, h('div', 'section', '初始武器'));
    const weapons = h('div', 'cards small');
    for (const w of Object.values(WEAPONS)) {
      const c = h('button', 'card weapon' + (w.id === o.weapon ? ' on' : ''));
      c.innerHTML = `<img src="${icons[w.id]}"><b>${w.name}</b><span>${w.desc}</span>`;
      c.onclick = () => {
        o.weapon = w.id;
        weapons.querySelectorAll('.card').forEach((e) => e.classList.remove('on'));
        c.classList.add('on');
      };
      weapons.append(c);
    }
    panel.append(weapons);
    const row = h('div', 'row');
    const seed = document.createElement('input');
    seed.type = 'number';
    seed.value = String(o.seed);
    seed.title = '地图种子';
    const reroll = h('button', 'btn ghost', '随机');
    reroll.onclick = () => (seed.value = String(Math.floor(Math.random() * 1e6)));
    const go = h('button', 'btn primary', '开始冒险');
    go.onclick = () => {
      o.seed = Number(seed.value) || 1;
      this.hide();
      start(o);
    };
    row.append(h('span', 'lab', '种子'), seed, reroll, go);
    panel.append(row, h('div', 'help', 'WASD 移动 · 空格 跳跃 · 鼠标 / Q E 转视角 · 滚轮 缩放 · E 开宝箱 · 站进神坛圈充能 · Esc 暂停'));
    this.show(panel);
    this.onKeys((e) => {
      if (e.code === 'Enter') go.click();
    });
  }

  showChoices(title: string, sub: string, choices: Choice[], icons: Record<string, string>, pick: (c: Choice) => void): void {
    const panel = h('div', 'panel choices');
    panel.append(h('div', 'ttl', title), h('div', 'sub', sub));
    const cards = h('div', 'cards');
    choices.forEach((c, i) => {
      const card = h('button', 'card choice');
      const lv = 'level' in c ? (c.level === 1 ? '<em class="new">新！</em>' : `<em>Lv ${c.level}</em>`) : '';
      const tag = c.kind === 'weapon' ? '武器' : c.kind === 'passive' ? '被动' : '奖励';
      card.innerHTML = `<div class="k">${i + 1}</div><img src="${icons[c.icon]}"><b>${c.name} ${lv}</b><span class="tag">${tag}</span><span>${c.desc}</span>`;
      card.onclick = () => {
        this.hide();
        pick(c);
      };
      cards.append(card);
    });
    panel.append(cards, h('div', 'help', '点击或按 1 / 2 / 3 选择'));
    this.show(panel);
    // Ignore keys for a moment so a held key does not pick blindly.
    const t0 = performance.now();
    this.onKeys((e) => {
      if (performance.now() - t0 < 250) return;
      const k = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code);
      if (k >= 0 && choices[k]) (cards.children[k] as HTMLElement).click();
    });
  }

  showPause(resume: () => void, restart = this.pauseHandlers.restart, menu = this.pauseHandlers.menu): void {
    const panel = h('div', 'panel small');
    panel.append(h('div', 'ttl', '暂停'));
    const b1 = h('button', 'btn primary', '继续游戏');
    b1.onclick = () => resume();
    panel.append(b1);
    if (restart) {
      const b2 = h('button', 'btn', '重新开始');
      b2.onclick = () => restart();
      panel.append(b2);
    }
    if (menu) {
      const b3 = h('button', 'btn ghost', '返回主菜单');
      b3.onclick = () => menu();
      panel.append(b3);
    }
    this.show(panel);
  }

  pauseHandlers: { restart?: () => void; menu?: () => void } = {};

  showEnd(win: boolean, s: { time: number; level: number; kills: number; biome: string }, again?: () => void, menu?: () => void): void {
    const panel = h('div', 'panel small end ' + (win ? 'win' : 'lose'));
    panel.append(h('div', 'ttl', win ? '胜利！' : '你倒下了…'));
    const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    panel.append(h('div', 'summary', `<div><span>地图</span><b>${s.biome}</b></div><div><span>存活时间</span><b>${fmt(s.time)}</b></div><div><span>等级</span><b>${s.level}</b></div><div><span>击败敌人</span><b>${s.kills}</b></div>`));
    const b1 = h('button', 'btn primary', '再来一局');
    b1.onclick = () => (again ?? this.pauseHandlers.restart)?.();
    const b2 = h('button', 'btn ghost', '返回主菜单');
    b2.onclick = () => (menu ?? this.pauseHandlers.menu)?.();
    panel.append(b1, b2);
    this.show(panel);
  }
}
