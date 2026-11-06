// Colours sampled from the reference keyframes (see docs/reference.md).
export const C = {
  paper: 0xece3d6,
  pencil: 0x8a8178,
  road: 0x4855b6,
  drum: 0x4d5cba,
  curb: 0xe6e0d6,
  red: 0xd8402f,
  redDark: 0xa9322a,
  canopy: 0xe2a534,
  duck: 0xf8cf3e,
  duckPale: 0xf7e7a2,
  beak: 0xef8a2b,
  white: 0xf6f0e4,
  cream: 0xf1e6cf,
  black: 0x2b2727,
  tire: 0x353031,
  hub: 0xf0b52c,
  trunk: 0x8a6244,
  glass: 0x3b4a6b,
  pole: 0x3a3a40,
  hazard: 0xf2c230,
};

// [base colour, pattern id] — patterns are drawn in the toy shader (materials.js).
export const PLOT_STYLES = [
  [0x7fa766, 2], // green, grid
  [0x4f8a4f, 2], // dark green, grid
  [0xe3a7a0, 1], // pink, dots
  [0xe3a7a0, 3], // pink, check
  [0xa9a8d6, 1], // lavender, dots
  [0xa9a8d6, 2], // lavender, grid
  [0xddb36a, 1], // ochre, dots
  [0xddb36a, 4], // ochre, sparse dots
  [0xc95a48, 1], // red, dots
  [0xe8c25a, 3], // yellow, check
  [0x8fb46e, 4], // light green, sparse dots
];

export const WALLS = [0xf3e3a6, 0xf2c9c3, 0xc9c6e6, 0xcfe0c2, 0xc4d8e6, 0xa9a7a3, 0xf4efe6, 0x6f6c72, 0xf0c65a, 0xe9a35a, 0xb7d27a];
export const ROOFS = [0xd9534a, 0x4f5fb8, 0xe2a534, 0x6f6c72, 0x87b25c, 0xc9c6e6, 0xf0c65a, 0x9b6b4f, 0xe9a35a];
export const LEAVES = [0xb9cf5c, 0x5f9c5a, 0x8cbf5f, 0xf0b23c, 0xf0a3b5, 0x3f7f4a, 0xd6d66a];
export const FLOWERS = [0xe0525a, 0xf3a2b4, 0xf6f0e4, 0xf3c443, 0xd8402f];
