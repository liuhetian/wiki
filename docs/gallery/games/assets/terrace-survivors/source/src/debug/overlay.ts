// ?debug overlay: FPS, frame time, draw calls, triangles, entity counts. Hotkeys:
// F1 god mode · F2 level up · F3 +100 enemies · F4 skip 60 s · F5 summon boss now · F6 all weapons Lv1

import type { Game } from '../game/game';
import { WEAPONS, type WeaponId } from '../game/data';

export class DebugOverlay {
  private el = document.createElement('div');
  private frames = 0;
  private acc = 0;
  private fps = 0;
  private ms = 0;
  constructor(parent: HTMLElement) {
    this.el.className = 'debug';
    parent.append(this.el);
  }

  keys(g: Game): void {
    const i = g.input;
    if (i.hit('F1')) g.player.god = !g.player.god;
    if (i.hit('F2')) g.onLevelUp(1);
    if (i.hit('F3')) g.debugSpawn(100);
    if (i.hit('F4')) g.director.time += 60;
    if (i.hit('F5') && !g.director.bossSpawned) g.director.time = Math.max(g.director.time, g.director.bossTime);
    if (i.hit('F6')) {
      for (const id of Object.keys(WEAPONS) as WeaponId[]) {
        if (!g.player.weapons.has(id)) g.player.weapons.set(id, 1);
        g.weapons.add(id);
      }
      g.hud.refreshLoadout();
    }
  }

  frame(dt: number, g: Game | null, cpuMs: number): void {
    this.frames++;
    this.acc += dt;
    this.ms = this.ms * 0.9 + cpuMs * 0.1;
    if (this.acc >= 0.5) {
      this.fps = this.frames / this.acc;
      this.frames = 0;
      this.acc = 0;
    }
    if (!g) return;
    const info = g.renderer.renderer.info;
    this.el.textContent =
      `FPS ${this.fps.toFixed(0)} · CPU ${this.ms.toFixed(1)}ms\n` +
      `draw calls ${info.render.calls} · tris ${(info.render.triangles / 1000).toFixed(0)}k\n` +
      `enemies ${g.enemies.alive} · gems ${g.pickups.gemCount} · particles ${g.fx.particleCount}\n` +
      `pos ${g.player.x.toFixed(1)}, ${g.player.y.toFixed(1)}, ${g.player.z.toFixed(1)} · ${g.player.god ? 'GOD' : ''}\n` +
      `F1 无敌 F2 升级 F3 +100怪 F4 +60s F5 Boss F6 全武器`;
  }
}
