# Technical teardown

## Evidence status

- `SOURCE`: the supplied 17-second video and the extracted frames under `RECON/screenshots/`.
- `SOURCE (clone)`: the implementation and browser verification screenshots in this project.
- `GUESS`: original easing curves and exact drag thresholds. The current interpretation preserves the source's side-view spacing while simplifying every album to a zero-thickness plane.

## Rendering

- Album covers are regular buttons with per-card offset variables calculated in `src/App.tsx:102`.
- The cover rail uses tall archival-sleeve buttons with printed vertical index strips inside one perspective container.
- Each album still renders exactly one zero-thickness cover plane. Side faces, back faces, spines, edges, and inside pages remain removed; `rotateY` and `translateZ` are used only to position that plane in the side-view scene.
- The selected plane pulls forward while retaining a partial side angle, surrounding planes fade, and the same cover is handed to the flat detail view through a shared visual transition.
- All demo cover graphics are generated from CSS motifs and data tokens; see `src/App.tsx:21`, `src/data.ts:1`, and `src/styles.css:176`.

## Interaction

- The album rail uses pointer capture, continuous pixel offset, edge resistance, bounded velocity projection, residual-preserving snap, wheel input, and keyboard navigation in `src/App.tsx:49`.
- Detail mode is one horizontal carousel containing every album; a background drag changes the selected album by one.
- Albums with 12 or fewer tracks use one semantic track list. Longer albums are chunked into eight-track panels at runtime.
- Long albums use one vertically scrollable semantic track sheet with a small custom thumb. The thumb maps its vertical travel to native `scrollTop`, while wheel and touch scrolling continue to work normally.

## State and playback

- The view state is only `library | detail`; long-track scrolling is local detail content, not another page.
- Search and playback queue are overlays that do not remount the main player; see `src/App.tsx:361`.
- The player uses a real native audio element with a locally generated, original demo sound in `src/App.tsx:275`.
- Escape behavior closes overlays first, then returns from detail to the library.

## Why the renderer uses planes, not cuboids

The user wants the source's floating side-view archive composition without physical album thickness. CSS perspective is therefore used for spatial placement, but every record remains one semantic HTML plane. Detail and track scrolling stay completely flat.
