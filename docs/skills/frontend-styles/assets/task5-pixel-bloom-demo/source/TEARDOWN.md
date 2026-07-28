# Interaction teardown

## Evidence

- SOURCE: `今天做了一个鼠标交互效果！ 2026-7-11 08-13-01 小艾不迟到（AIGC）.mp4` is a 3840×2160, 60fps, 17.4s recording.
- SOURCE (frame observation): the background and navigation remain static; only a block-aligned translucent layer follows the pointer.
- SOURCE (frame observation): fast movement produces a connected band; stopping produces a roughly circular cloud; old cells disappear progressively.
- PARTIAL: block size is visually around 18–24 screen pixels in the 4K recording.
- GUESS: inverse/cool color transform, 116px radius and 920ms decay. No original JS, shader or source map was available.

## Local implementation

`src/App.jsx` builds screen-sized sampling buffers from three aligned world-state artworks (`hero-storm-decay-v3.png`, `hero-frost-dormancy-v3.png`, and `hero-rain-rebirth-v3.png`). Pointer positions are interpolated at 22px spacing and remember which mode was active when they were created. On every frame, a grid cell selects its strongest live trail point and copies a real texture crop from that point's artwork. Modes change only on click. Switching clears the previous trail and pointer anchor, so one smear can never mix two artworks. No runtime color inversion is used.

After visual verification showed that single-pixel RGB fills looked like solid color, the renderer was changed to copy an actual source rectangle into every tile with `drawImage`. Source and destination use identical coordinates and dimensions, preserving spatial alignment and visible intra-cell texture.

Responsive scaling uses `max(viewportWidth / 1280, viewportHeight / 720)` for the cell size, brush radius, point interpolation interval, and (above 1×) trail lifetime. This mirrors the scale selected by `object-fit: cover`; portrait screens therefore use their height-driven zoom instead of incorrectly retaining a width-sized brush.
