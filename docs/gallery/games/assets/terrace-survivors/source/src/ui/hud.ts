// DOM HUD: XP bar, level, timer, kills, gold, HP, loadout with level pips, boss bar, prompt, banners and a minimap.

import type { Game } from '../game/game';
import { MAX_LEVEL, PASSIVES, WEAPONS, type PassiveId, type WeaponId } from '../game/data';

const h = (tag: string, cls = '', html = '') => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export class Hud {
  readonly root = h('div', 'hud');
  readonly popLayer = h('div', 'pops');
  private xpFill = h('div', 'xp-fill');
  private lvl = h('div', 'lvl');
  private timer = h('div', 'timer');
  private bossIn = h('div', 'boss-in');
  private stats = h('div', 'stats');
  private hpFill = h('div', 'hp-fill');
  private hpText = h('div', 'hp-text');
  private loadout = h('div', 'loadout');
  private prompt = h('div', 'prompt');
  private bannerEl = h('div', 'banner');
  private bossBar = h('div', 'bossbar');
  private bossFill = h('div', 'boss-fill');
  private vignette = h('div', 'hurt');
  private hint = h('div', 'hint');
  private mapCanvas = document.createElement('canvas');
  private mapBase: HTMLCanvasElement | null = null;
  private game: Game | null = null;
  private bannerT = 0;
  private last = { lvl: -1, kills: -1, coins: -1, hp: -1 };

  constructor(parent: HTMLElement) {
    const xp = h('div', 'xp');
    xp.append(this.xpFill);
    const hp = h('div', 'hp');
    hp.append(this.hpFill, this.hpText);
    const top = h('div', 'top');
    top.append(this.timer, this.bossIn);
    this.bossBar.append(h('div', 'boss-name', '远古岩魔像'), h('div', 'boss-track'));
    this.bossBar.lastElementChild!.append(this.bossFill);
    this.mapCanvas.width = this.mapCanvas.height = 150;
    this.mapCanvas.className = 'minimap';
    this.hint.innerHTML = 'WASD 移动 · 空格 跳跃 · 鼠标/Q E 转视角 · 滚轮 缩放 · E 互动 · Esc 暂停';
    this.root.append(xp, this.lvl, top, this.stats, this.mapCanvas, hp, this.loadout, this.prompt, this.bannerEl, this.bossBar, this.hint);
    parent.append(this.vignette, this.popLayer, this.root);
    this.root.style.display = 'none';
  }

  attach(g: Game): void {
    this.game = g;
    this.root.style.display = '';
    this.last = { lvl: -1, kills: -1, coins: -1, hp: -1 };
    this.buildMap(g);
    this.refreshLoadout();
    setTimeout(() => this.hint.classList.add('fade'), 9000);
  }

  detach(): void {
    this.game = null;
    this.root.style.display = 'none';
    this.hint.classList.remove('fade');
  }

  banner(text: string, color: string): void {
    this.bannerEl.textContent = text;
    this.bannerEl.style.color = color;
    this.bannerEl.classList.remove('show');
    void this.bannerEl.offsetWidth;
    this.bannerEl.classList.add('show');
    this.bannerT = 3;
  }

  hurt(): void {
    this.vignette.classList.remove('on');
    void this.vignette.offsetWidth;
    this.vignette.classList.add('on');
  }

  refreshLoadout(): void {
    const g = this.game;
    if (!g) return;
    const icons = g.art.icons;
    this.loadout.innerHTML = '';
    const slot = (icon: string, lv: number, title: string, weapon: boolean) => {
      const s = h('div', 'slot' + (weapon ? ' w' : ' p'));
      s.title = title;
      const img = document.createElement('img');
      img.src = icons[icon];
      s.append(img);
      const pips = h('div', 'pips');
      for (let k = 0; k < MAX_LEVEL; k++) pips.append(h('i', k < lv ? 'on' : ''));
      s.append(pips);
      this.loadout.append(s);
    };
    for (const [id, lv] of g.player.weapons) slot(id, lv, WEAPONS[id as WeaponId].name, true);
    for (const [id, lv] of g.player.passives) slot(id, lv, PASSIVES[id as PassiveId].name, false);
  }

  private buildMap(g: Game): void {
    const t = g.terrain;
    const S = 150;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(S, S);
    const span = t.play * 2;
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const wx = -t.play + ((x + 0.5) / S) * span,
          wz = -t.play + ((y + 0.5) / S) * span;
        const ht = t.height(wx, wz);
        const lv = Math.floor(ht / g.biome.stepH);
        const n = t.normal(wx, wz);
        const path = t.pathAt(wx, wz) > 0.5;
        let r = 70 + lv * 22,
          gg = 120 + lv * 18,
          b = 80 + lv * 16;
        if (g.biome.id === 'desert') [r, gg, b] = [150 + lv * 18, 110 + lv * 14, 70 + lv * 10];
        if (g.biome.id === 'snow') [r, gg, b] = [130 + lv * 22, 150 + lv * 20, 170 + lv * 16];
        if (ht > g.biome.snowH) [r, gg, b] = [235, 240, 250];
        if (path) [r, gg, b] = [190, 160, 110];
        if (n.y < 0.75) [r, gg, b] = [r * 0.55, gg * 0.55, b * 0.6];
        const i = (y * S + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = gg;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
    this.mapBase = c;
  }

  private drawMap(g: Game): void {
    const ctx = this.mapCanvas.getContext('2d')!;
    const S = 150,
      t = g.terrain;
    if (this.mapBase) ctx.drawImage(this.mapBase, 0, 0);
    const toM = (x: number, z: number) => [((x + t.play) / (t.play * 2)) * S, ((z + t.play) / (t.play * 2)) * S];
    for (const m of g.interact.markers()) {
      const [x, y] = toM(m.x, m.z);
      ctx.fillStyle = m.kind === 'chest' ? '#ffd23a' : '#b88aff';
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
    const e = g.enemies;
    ctx.fillStyle = 'rgba(255,70,70,0.75)';
    for (let k = 0; k < e.count; k += 2) {
      const i = e.active[k];
      const [x, y] = toM(e.x[i], e.z[i]);
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    if (e.boss >= 0 && e.hp[e.boss] > 0) {
      const [x, y] = toM(e.x[e.boss], e.z[e.boss]);
      ctx.fillStyle = '#ff2a2a';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    const p = g.player;
    const [px, py] = toM(p.x, p.z);
    // Player arrow pointing along the camera's view.
    const a = -g.camera.yaw;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(a);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(4, 4);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  update(g: Game): void {
    const p = g.player;
    this.xpFill.style.width = `${(p.xp / p.xpNext) * 100}%`;
    if (p.level !== this.last.lvl) this.lvl.textContent = `Lv ${(this.last.lvl = p.level)}`;
    this.timer.textContent = fmt(g.director.time);
    const left = g.director.bossTime - g.director.time;
    this.bossIn.textContent = g.director.bossSpawned ? '击败 Boss！' : `Boss 倒计时 ${fmt(Math.max(0, left))}`;
    if (p.kills !== this.last.kills || p.coins !== this.last.coins) {
      this.last.kills = p.kills;
      this.last.coins = p.coins;
      this.stats.innerHTML = `<span>☠ ${p.kills}</span><span class="gold">● ${p.coins}</span>`;
    }
    const hp = Math.ceil(p.hp);
    if (hp !== this.last.hp) {
      this.last.hp = hp;
      this.hpFill.style.width = `${(p.hp / p.stats.maxHp) * 100}%`;
      this.hpText.textContent = `${hp} / ${p.stats.maxHp}`;
    }
    this.prompt.textContent = g.interact.prompt;
    this.prompt.style.opacity = g.interact.prompt ? '1' : '0';
    const e = g.enemies;
    if (e.boss >= 0 && e.hp[e.boss] > 0) {
      this.bossBar.style.display = 'block';
      this.bossFill.style.width = `${Math.max(0, e.hp[e.boss] / e.maxHp[e.boss]) * 100}%`;
    } else this.bossBar.style.display = 'none';
    if (this.bannerT > 0) this.bannerT -= 1 / 60;
    this.drawMap(g);
  }
}
