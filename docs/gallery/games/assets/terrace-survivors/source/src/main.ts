// Entry: generate art → main menu → run games. URL params:
//   ?biome=meadow|snow|desert&seed=N&weapon=bolt  skip the menu and start directly
//   ?time=SECONDS   run length (boss at 90%)       ?px=2   pixelated low-res rendering
//   ?debug          stats overlay + hotkeys         ?spawn=N keep at least N enemies (stress test)
//   ?art            sprite / tile / prop preview page

import { generateArt, type Art } from './art';
import { Input } from './core/input';
import { startLoop } from './core/loop';
import { Renderer } from './render/renderer';
import { BIOMES } from './world/biomes';
import { Game } from './game/game';
import { Hud } from './ui/hud';
import { Menus, type StartOpts } from './ui/menus';
import { DebugOverlay } from './debug/overlay';
import type { BiomeId } from './art/tiles';
import type { WeaponId } from './game/data';
import { Group } from 'three';
import { Terrain } from './world/terrain';
import { makeTerrainMaterial } from './world/terrainMat';
import { scatterProps } from './world/scatter';
import { PropBatch } from './render/propBatch';

const params = new URLSearchParams(location.search);
const ui = document.getElementById('ui')!;
const canvas = document.getElementById('game') as HTMLCanvasElement;

function artPreview(art: Art): void {
  document.body.style.overflow = 'auto';
  canvas.style.display = 'none';
  ui.style.cssText = 'position:static;background:#334;padding:8px;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start;pointer-events:auto';
  ui.innerHTML = '';
  const add = (c: HTMLCanvasElement, s = 2) => {
    c.style.cssText = `image-rendering:pixelated;width:${c.width * s}px;background:#8ab`;
    ui.append(c);
  };
  const b = art.biome((params.get('biome') ?? 'meadow') as BiomeId);
  const only = params.get('sheet');
  const anim = params.get('anim') as 'walk' | null;
  if (!only && !anim) {
    for (const k of Object.values(b.tiles)) add(k, 2);
    add(b.props.canvas, 1);
    add(art.fx.canvas, 4);
  }
  for (const s of art.sheets)
    if (!only || s.id === only) {
      if (anim) {
        const a = s.meta.anims[anim];
        const c = document.createElement('canvas');
        c.width = a.n * a.fw;
        c.height = 8 * a.fh;
        c.getContext('2d')!.drawImage(s.canvas, 0, a.y, c.width, c.height, 0, 0, c.width, c.height);
        add(c, Number(params.get('scale') ?? 2));
      } else add(s.canvas, only ? 2 : 1);
    }
}

async function main(): Promise<void> {
  const menus = new Menus(ui);
  const art = await generateArt((k, l) => menus.setLoading(k, l));
  menus.hideLoading();
  if (params.has('art')) return artPreview(art);

  const renderer = new Renderer(canvas, Number(params.get('px') ?? 1));
  const input = new Input(canvas);
  const hud = new Hud(ui);
  const debug = params.has('debug') ? new DebugOverlay(ui) : null;
  const stress = Number(params.get('spawn') ?? 0);
  let game: Game | null = null;
  let last: StartOpts = {
    biome: (params.get('biome') as BiomeId) ?? 'meadow',
    weapon: (params.get('weapon') as WeaponId) ?? 'bolt',
    seed: Number(params.get('seed') ?? Math.floor(Math.random() * 1e6)),
  };

  // Menu backdrop: a meadow map slowly orbited by the camera.
  let backdrop: { group: Group; terrain: Terrain } | null = null;
  const showBackdrop = () => {
    if (backdrop) return;
    const b = BIOMES.meadow;
    renderer.setEnvironment(b);
    const terrain = new Terrain(b, 4242);
    const ba = art.biome('meadow');
    const sc = scatterProps(terrain, ba.props, 4242);
    const shade = Terrain.shadeTexture(terrain.world, sc.shadows, renderer.shared.uSunDir.value);
    const group = new Group();
    group.add(terrain.build(makeTerrainMaterial(b, ba.tiles, renderer.shared, shade, terrain.world)));
    new PropBatch(ba.props, sc.list, renderer.shared, group);
    renderer.scene.add(group);
    backdrop = { group, terrain };
  };
  const hideBackdrop = () => {
    if (!backdrop) return;
    renderer.scene.remove(backdrop.group);
    backdrop.group.traverse((o) => {
      const m = o as unknown as { geometry?: { dispose(): void }; material?: { dispose(): void } };
      m.geometry?.dispose();
      m.material?.dispose();
    });
    backdrop = null;
  };

  const start = (o: StartOpts) => {
    last = o;
    hideBackdrop();
    game?.dispose();
    menus.hide();
    menus.setLoading(0.5, '生成地形…');
    // Let the loading screen paint before the (synchronous) world build.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        game = new Game({ renderer, art, biome: BIOMES[o.biome], seed: o.seed, input, hud, menus, runLength: Number(params.get('time') ?? 600), startWeapon: o.weapon });
        menus.hideLoading();
        input.requestLock();
        (window as unknown as { game: Game }).game = game;
      }),
    );
  };
  const toMenu = () => {
    game?.dispose();
    game = null;
    input.releaseLock();
    showMenu();
  };
  menus.pauseHandlers = { restart: () => start(last), menu: toMenu };
  const showMenu = () => {
    showBackdrop();
    menus.showMain(art.icons, last, start);
  };

  canvas.addEventListener('click', () => {
    if (game?.state === 'play') input.requestLock();
  });
  let wasLocked = false;
  input.onLockChange = (locked) => {
    // Losing the lock mid-run (Esc) pauses, like most PC games.
    if (!locked && wasLocked && game?.state === 'play') game.pause();
    wasLocked = locked;
  };

  if (params.has('biome')) start(last);
  else showMenu();

  // A slowly orbiting backdrop behind the main menu.
  let menuYaw = 0;
  startLoop(
    (dt) => {
      if (!game) return;
      if (debug) debug.keys(game);
      if (stress && game.state === 'play' && game.enemies.alive < stress) game.debugSpawn(Math.min(50, stress - game.enemies.alive));
      game.update(dt);
      input.endStep();
    },
    (dt) => {
      const t0 = performance.now();
      if (game) {
        game.frame(dt);
        input.endFrame();
      } else {
        menuYaw += dt * 0.04;
        const cx = Math.sin(menuYaw) * 26,
          cz = Math.cos(menuYaw) * 26;
        const gy = backdrop ? backdrop.terrain.height(0, 0) : 0;
        renderer.camera.position.set(cx, gy + 13, cz);
        renderer.camera.lookAt(0, gy + 2, 0);
        renderer.render(dt);
        input.endStep();
        input.endFrame();
      }
      debug?.frame(dt, game, performance.now() - t0);
    },
  );
}

main();
