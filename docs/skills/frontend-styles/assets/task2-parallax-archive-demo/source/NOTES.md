# Parallax Archive React reproduction

- Source: local user-provided screen recording only; no public URL or source code was available.
- Mode: visual/interaction reproduction for local use.
- Complexity: L3 (single-page React experience with three animated layout states).
- Evidence: `RECON/frames/` and `RECON/contact-01.jpg`.
- Implemented states: layered diagonal stack, pointer-reactive orbit, evenly spaced scrollable three-column archive with a synchronized simulated scrollbar.
- Cards intentionally have no click/open behavior. Layered hover uses the original card only: it moves upward while its stacking level rises progressively through the pile instead of jumping directly to the top; neighboring cards barely move. Orbit uses a wider radial spread for more visible cover area; hovering a specific orbit card freezes the pointer drift, raises, straightens, and enlarges that card while leaving the rest of the collection fully opaque. Any orbit card can be freely dragged and keeps its new offset, with a small visible edge retained inside the stage so cards cannot be lost completely off-screen.
- Portrait displays place the exhibition stage on top and the control panel below, using the full screen height instead of compressing both into a landscape layout.
- Run: `npm install && npm run dev`.
- Known limitation: card artwork is cropped from the recording and intentionally repeats across the 24 cards; the original high-resolution source assets were not available.
