// One run: builds the world for a biome, owns every system, runs the fixed-step simulation and assembles the frame.
// States: play → levelup (modal) → play … → dead | win; pause on Esc / lost pointer lock.

import { Frustum, Group, Matrix4, Sphere } from 'three';
import type { Art } from '../art';
import type { Input } from '../core/input';
import { PropBatch } from '../render/propBatch';
import type { Renderer } from '../render/renderer';
import { SpriteSystem } from '../render/spriteBatch';
import type { Biome } from '../world/biomes';
import { Terrain } from '../world/terrain';
import { makeTerrainMaterial } from '../world/terrainMat';
import { scatterProps } from '../world/scatter';
import { CameraRig } from './camera';
import { Director } from './director';
import { Enemies } from './enemies';
import { FxSystem } from './fxsys';
import { Interact } from './interact';
import { Pickups } from './pickups';
import { Player, type Stats } from './player';
import { Projectiles } from './projectiles';
import { applyChoice, rollChoices, type Choice } from './upgrades';
import { Weapons } from './weapons';
import { FlowField } from './flow';
import { Fx } from '../art/fx';
import type { Hud } from '../ui/hud';
import type { Menus } from '../ui/menus';
import type { WeaponId } from './data';

export type State = 'play' | 'levelup' | 'pause' | 'dead' | 'win';

export interface GameOpts {
  renderer: Renderer;
  art: Art;
  biome: Biome;
  seed: number;
  input: Input;
  hud: Hud;
  menus: Menus;
  runLength: number;
  startWeapon: WeaponId;
}

export class Game {
  readonly root = new Group();
  readonly renderer: Renderer;
  readonly art: Art;
  readonly biome: Biome;
  readonly seed: number;
  readonly input: Input;
  readonly hud: Hud;
  readonly menus: Menus;
  readonly terrain: Terrain;
  readonly props: PropBatch;
  readonly sprites: SpriteSystem;
  readonly fx: FxSystem;
  readonly player = new Player();
  readonly camera = new CameraRig();
  readonly enemies: Enemies;
  readonly pickups = new Pickups();
  readonly projectiles = new Projectiles();
  readonly weapons = new Weapons();
  readonly director: Director;
  readonly interact: Interact;
  readonly flow: FlowField;
  readonly buffs: Partial<Stats> = {};
  state: State = 'play';
  time = 0;
  private pendingLevels = 0;
  private endT = 0;
  private frustum = new Frustum();
  private mat = new Matrix4();
  private sph = new Sphere();
  disposed = false;

  constructor(o: GameOpts) {
    this.renderer = o.renderer;
    this.art = o.art;
    this.biome = o.biome;
    this.seed = o.seed;
    this.input = o.input;
    this.hud = o.hud;
    this.menus = o.menus;
    const r = o.renderer;
    r.setEnvironment(o.biome);
    r.scene.add(this.root);

    this.terrain = new Terrain(o.biome, o.seed);
    const ba = o.art.biome(o.biome.id);
    const sc = scatterProps(this.terrain, ba.props, o.seed);
    const shade = Terrain.shadeTexture(this.terrain.world, sc.shadows, r.shared.uSunDir.value);
    this.root.add(this.terrain.build(makeTerrainMaterial(o.biome, ba.tiles, r.shared, shade, this.terrain.world)));
    this.props = new PropBatch(ba.props, sc.list, r.shared, this.root);
    this.sprites = new SpriteSystem(o.art.sheets, r.shared, this.root);
    this.fx = new FxSystem(o.art.fx.canvas, o.art.fx.cols, o.art.fx.rows, r.shared, this.root, o.hud.popLayer, this.terrain);
    this.enemies = new Enemies(this.terrain.world);
    this.flow = new FlowField(this.terrain);
    this.director = new Director(this, o.runLength);
    this.interact = new Interact(this);
    this.root.add(this.interact.group);

    const s = this.terrain.spawn;
    this.player.spawnAt(s.x, s.y, s.z);
    this.player.weapons.set(o.startWeapon, 1);
    this.weapons.add(o.startWeapon);
    this.player.recomputeStats(this.buffs);
    this.hud.attach(this);
  }

  // ------------------------------------------------------------- flow
  onLevelUp(n: number): void {
    this.pendingLevels += n;
    this.fx.ring(this.player.x, this.player.z, 0.5, 5, 0.5, [1.4, 2.2, 2.6]);
    if (this.state === 'play') this.openChoices('升级！', '选择一项强化');
  }

  openChest(): void {
    if (this.state === 'play') this.openChoices('宝箱', '获得一项强化');
  }

  private openChoices(title: string, sub: string): void {
    this.state = 'levelup';
    this.input.releaseLock();
    const choices = rollChoices(this.player);
    this.menus.showChoices(title, sub, choices, this.art.icons, (c) => this.pick(c));
  }

  private pick(c: Choice): void {
    applyChoice(this.player, c);
    if (c.kind === 'weapon') this.weapons.add(c.id);
    this.player.recomputeStats(this.buffs);
    this.hud.refreshLoadout();
    if (this.pendingLevels > 0 && this.state === 'levelup') this.pendingLevels--;
    if (this.pendingLevels > 0) this.openChoices('升级！', '选择一项强化');
    else this.resume();
  }

  resume(): void {
    this.state = 'play';
    this.menus.hide();
    this.input.requestLock();
  }

  pause(): void {
    if (this.state !== 'play') return;
    this.state = 'pause';
    this.input.releaseLock();
    this.menus.showPause(() => this.resume());
  }

  onPlayerHit(): void {
    this.camera.shake(0.18, 0.18);
    this.hud.hurt();
  }

  onBossKilled(x: number, y: number, z: number): void {
    this.fx.burst(x, y + 3, z, 80, 12, Fx.Star, 2.6, 2.2, 1, 1, 1.2);
    this.fx.ring(x, z, 1, 14, 1, [2.4, 2, 1]);
    this.camera.shake(0.6, 0.8);
    for (let k = 0; k < 30; k++) this.pickups.dropGem(x + (Math.random() - 0.5) * 6, y, z + (Math.random() - 0.5) * 6, 10);
    // The horde crumbles with its master.
    const e = this.enemies;
    for (let k = 0; k < e.count; k++) {
      const i = e.active[k];
      if (e.dieT[i] < 0) e.dieT[i] = Math.random() * 0.25;
    }
    this.state = 'win';
    this.endT = 0;
  }

  // ------------------------------------------------------------- simulation
  update(dt: number): void {
    if (this.input.hit('Escape') || this.input.hit('KeyP')) {
      if (this.state === 'play') this.pause();
      else if (this.state === 'pause') this.resume();
    }
    if (this.state === 'win' || this.state === 'dead') {
      // The hero can still stroll around after a win (and plays its faint animation after a loss).
      this.endT += dt;
      this.player.update(dt, this.input, this.camera.yaw, this.terrain);
      if (this.state === 'win') {
        this.pickups.update(dt, this);
        this.enemies.update(dt, this);
      }
      this.fx.update(dt);
      if (this.endT > 1.6 && !this.menus.visible) {
        this.input.releaseLock();
        this.menus.showEnd(this.state === 'win', this.summary());
      }
      return;
    }
    if (this.state !== 'play') return;
    const p = this.player;
    p.update(dt, this.input, this.camera.yaw, this.terrain);
    if (p.dead) {
      this.state = 'dead';
      this.endT = 0;
      this.input.releaseLock();
      return;
    }
    this.director.update(dt);
    this.flow.update(dt, p.x, p.z);
    this.enemies.update(dt, this);
    this.weapons.update(dt, this);
    this.projectiles.update(dt, this);
    this.pickups.update(dt, this);
    this.interact.update(dt);
    this.fx.update(dt);
  }

  summary() {
    return { time: this.director.time, level: this.player.level, kills: this.player.kills, biome: this.biome.name };
  }

  inView(x: number, y: number, z: number, r: number): boolean {
    this.sph.center.set(x, y, z);
    this.sph.radius = r;
    return this.frustum.intersectsSphere(this.sph);
  }

  // ------------------------------------------------------------- frame
  frame(dt: number): void {
    this.time += dt;
    const p = this.player,
      r = this.renderer;
    const look = this.state === 'play' || this.state === 'dead' || this.state === 'win';
    this.camera.update(dt, this.input, p.x, p.y, p.z, this.terrain, r.camera, look);
    r.camera.updateMatrixWorld();
    this.mat.multiplyMatrices(r.camera.projectionMatrix, r.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.mat);
    this.props.uPlayer.value.set(p.x, p.y, p.z);

    this.sprites.begin(r.camera);
    this.fx.begin();
    // Hero.
    const hb = this.sprites.get('hero');
    const anim = p.dead ? 'faint' : p.hurtT > 0 ? 'hurt' : p.attackT > 0 ? 'attack' : p.moving ? 'walk' : 'idle';
    const at = p.dead ? p.deadT : anim === 'attack' ? 0.3 - p.attackT : anim === 'hurt' ? 0.3 - p.hurtT : p.animT;
    const blink = p.invuln > 0 && Math.floor(this.time * 20) % 2 === 0 ? 0.6 : 0;
    hb.push(p.x, p.y, p.z, anim, at, this.sprites.dirRow(p.fx, p.fz), 1, p.dead, Math.max(p.flash, blink), 0, 0, 0);
    this.fx.shadows.push(p.x, this.terrain.height(p.x, p.z), p.z, 0.9);
    if (this.state === 'play' && p.moving && p.grounded && Math.random() < 0.15)
      this.fx.particle(p.x, p.y + 0.1, p.z, 0, 0.6, 0, 0.4, 0.4, Fx.Puff, 0.85, 0.8, 0.72, 0);

    this.enemies.render(this);
    this.weapons.render(this, this.time);
    this.projectiles.render(this);
    this.pickups.render(this, this.time);
    this.interact.render(this.time);
    this.fx.render(r.camera, this.time);
    this.sprites.end();
    this.fx.end();
    this.hud.update(this);
    r.render(this.state === 'pause' || this.state === 'levelup' ? 0 : dt);
  }

  dispose(): void {
    this.disposed = true;
    this.renderer.scene.remove(this.root);
    this.root.traverse((o) => {
      const m = o as unknown as { geometry?: { dispose(): void }; material?: { dispose(): void } | { dispose(): void }[] };
      m.geometry?.dispose();
      if (Array.isArray(m.material)) m.material.forEach((x) => x.dispose());
      else m.material?.dispose();
    });
    this.fx.dispose();
    this.hud.detach();
  }

  /** Debug helpers. */
  debugSpawn(n: number): void {
    for (let k = 0; k < n; k++) this.director.spawnOne();
  }
}
