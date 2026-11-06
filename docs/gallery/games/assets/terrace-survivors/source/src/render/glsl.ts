// Shared GLSL helpers: hashing, value noise and a 4×4 Bayer matrix for ordered dithering (every soft edge in the game
// is cut on the pixel grid with it instead of alpha blending).

export const NOISE_GLSL = /* glsl */ `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float bayer2(vec2 a){ a = floor(a); return fract(a.x * .5 + a.y * a.y * .75); }
float bayer4(vec2 a){ return bayer2(.5 * a) * .25 + bayer2(a); }
`;

export const FOG_GLSL = /* glsl */ `
uniform vec3 uFogColor; uniform float uFogNear; uniform float uFogFar;
vec3 applyFog(vec3 c, float d){ return mix(c, uFogColor, smoothstep(uFogNear, uFogFar, d)); }
`;
