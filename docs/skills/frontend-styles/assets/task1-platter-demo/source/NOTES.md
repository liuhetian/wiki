# Flat Music Album Interpretation

## Source

- Reference: `../3d音乐专辑.mp4`
- Duration: 17.04 seconds
- Resolution: 2732 × 2048 at 60 fps
- Current phase: implemented and browser-verified local visual recreation
- Intended mode: visual recreation for local learning; original artwork/audio will not be redistributed

## Complexity assessment

- Level: L4 (interaction-heavy single-page experience)
- High-confidence scope: side-view single-plane archival rail, horizontally continuous flat detail, unified compact track scrolling, persistent mini-player, responsive desktop/tablet layout
- Main risk: reconstructing easing, depth spacing, gesture thresholds, and transitions from video alone
- Out of scope for the first pass: streaming backend, user accounts, search service, DRM, and exact copyrighted artwork/audio

## Recommended stack

- Vite + React + TypeScript
- CSS perspective with single-plane `rotateY`/`translateZ` placement; no cuboid faces or physical thickness
- GSAP only for coordinated transitions and inertia-like snapping
- Native `<audio>` for the demo player
- No Three.js/WebGL initially; add it only if later evidence shows effects CSS cannot reproduce

## Why React instead of a single HTML file

The experience has several linked states: selected album, library/detail mode, per-album track scroll position, active track, progress, and play/pause. React keeps those states explicit while every visible archive sleeve remains one accessible DOM plane.

## Run

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run build
npm run preview
```

The verified local development URL for this session is `http://127.0.0.1:5174/`. Vite may select another port if that one is already occupied.
