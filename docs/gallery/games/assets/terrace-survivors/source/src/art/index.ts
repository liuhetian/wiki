// Generates every piece of art at startup. Creature sheets are the expensive part (a software raster per frame), so
// each one yields to the browser to keep the loading bar alive. Biome tiles/props are built lazily and cached.

import { ANIMS, CREATURES, buildSheet, type SheetMeta, type SpriteSheet } from './creatures';
import { buildFxAtlas, buildIcons } from './fx';
import { buildTiles, type BiomeId, type TileSet } from './tiles';
import { buildProps, type PropAtlas } from './props';

export interface Art {
  sheets: SpriteSheet[];
  fx: { canvas: HTMLCanvasElement; cols: number; rows: number };
  icons: Record<string, string>;
  biome(id: BiomeId): { tiles: TileSet; props: PropAtlas };
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/**
 * Hand-made art wins over the procedural sheets: drop public/sprites/<id>.png + <id>.json (same layout as
 * sprites.json: { w, h, anims: { walk: { y, fw, fh, n, rows: 8, d: [...] }, ... } }) and it is used instead.
 * Missing animations fall back to walk; single-row sheets (rows: 1) are fine too.
 */
async function loadOverride(id: string): Promise<SpriteSheet | null> {
  try {
    const r = await fetch(`./sprites/${id}.json`);
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
    const meta = (await r.json()) as SheetMeta;
    const img = new Image();
    img.src = `./sprites/${id}.png`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    const fallback = meta.anims.walk ?? meta.anims.idle ?? Object.values(meta.anims)[0];
    for (const a of ANIMS) meta.anims[a] ??= fallback;
    meta.w = canvas.width;
    meta.h = canvas.height;
    console.info(`[art] using sprites/${id}.png`);
    return { id, canvas, meta };
  } catch {
    return null;
  }
}

export async function generateArt(progress: (k: number, label: string) => void): Promise<Art> {
  const sheets: SpriteSheet[] = [];
  const steps = CREATURES.length + 2;
  for (let i = 0; i < CREATURES.length; i++) {
    progress(i / steps, `绘制角色：${CREATURES[i].id}`);
    await frame();
    sheets.push((await loadOverride(CREATURES[i].id)) ?? buildSheet(CREATURES[i]));
  }
  progress(CREATURES.length / steps, '绘制特效与图标');
  await frame();
  const fx = buildFxAtlas();
  const icons = buildIcons();
  const cache = new Map<BiomeId, { tiles: TileSet; props: PropAtlas }>();
  progress(1, '完成');
  return {
    sheets,
    fx,
    icons,
    biome(id) {
      let c = cache.get(id);
      if (!c) {
        c = { tiles: buildTiles(id), props: buildProps(id) };
        cache.set(id, c);
      }
      return c;
    },
  };
}
