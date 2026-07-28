# Pixel Bloom Cursor

- Source: the MP4 included in this folder; no original site URL or source code was provided.
- Mode: local visual/interaction reproduction for study.
- Stack: React 19 + Vite + Canvas 2D.
- Complexity: L3. The page is static, but the cursor effect needs continuous sampling, trail history and frame-based decay.
- Run: `npm install && npm run dev`.

## Fidelity notes

All active artworks are newly generated original assets. The primary surface is intentionally minimal: clean cobalt sky, smooth porcelain skin with almost no tattoo, and low-texture blush flowers. Three hidden layers represent genuinely different world states rather than color treatments: storm decay (wilted flowers, root/crack tattoos, thunder and rain), frost dormancy (closed frozen flowers, constellation/frost tattoos, blizzard), and rain rebirth (bioluminescent night flowers, water/mycelium tattoos, rainy aurora). The active mode changes only on click—there is no time-based switching. A click clears the previous trail before selecting the next artwork, so every smear contains exactly one effect.

Each grid square draws a real mini-crop from the exact same screen coordinate in its hidden artwork. Source and destination tile rectangles are identical, keeping the two artwork layers spatially aligned while preserving real intra-tile texture instead of flat-color fills.

Brush radii are scaled by approximately √2 while retaining the larger tile sizes, doubling the visible tile area/count without reducing texture legibility. Earlier X-ray/jade/neon style-only variants remain as unused development assets and are no longer loaded by the application.

Tile size, brush radius and pointer interpolation spacing scale together from a 1280×720 design baseline. Because the artwork uses `object-fit: cover`, scale uses the larger viewport-axis ratio: `max(width / 1280, height / 720)`, clamped to 0.7–4.5. This is especially important on portrait displays where height drives a large cover zoom. Trail lifetime also grows with scale so users have enough time to paint across the enlarged composition.

The former video-frame extraction remains in `public/assets/flower-hero.jpg` only as an unused local reference and is no longer loaded by the application.

The supplied video remains for local study. The two active hero images were generated specifically for this local project.
