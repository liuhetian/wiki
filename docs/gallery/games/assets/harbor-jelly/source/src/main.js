import * as THREE from 'three';
import { C } from './palette.js';
import { shared, createToyMaterial, createStrataMaterial } from './materials.js';
import { buildBase, buildGround } from './world/base.js';
import { Water } from './world/water.js';
import { Harbor } from './world/harbor.js';
import { ShipRoute } from './world/ship.js';
import { buildTown } from './world/town.js';
import { buildPier } from './world/pier.js';
import { buildSeaFloor, Floaters } from './world/sea.js';
import { FishSchools, Jellies, Gulls, People, Petals } from './world/life.js';
import { Surges } from './world/surge.js';
import { nearestSurgeWall } from './world/waves.js';
import { SECTIONS } from './tour.js';
import { plip, horn, swell, crash, setSound, sfx } from './sfx.js';
import { WATER, HALF } from './world/layout.js';

const params = new URLSearchParams(location.search);
const SHOT = params.has('shot');
const coarse = matchMedia('(pointer: coarse)').matches;
const Q = params.get('q') ?? (coarse ? 'mid' : 'high');

// ---------------------------------------------------------------- renderer, scene, lights
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: SHOT, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, Q === 'low' ? 1 : Q === 'mid' ? 1.5 : 2));
renderer.setClearColor(C.paper, 1);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = Q !== 'low';
renderer.shadowMap.type = THREE.PCFShadowMap;
app.appendChild(renderer.domElement);
const canvas = renderer.domElement;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(22, 1, 1, 600);

const hemi = new THREE.HemisphereLight(0xf6f3ea, 0xb7c2ae, 1.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff6e6, 2.3);
sun.position.set(-16, 34, -22);
sun.target.position.set(0, -2, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(Q === 'high' ? 4096 : 2048, Q === 'high' ? 4096 : 2048);
sun.shadow.camera.left = -34; sun.shadow.camera.right = 34;
sun.shadow.camera.top = 34; sun.shadow.camera.bottom = -34;
sun.shadow.camera.near = 5; sun.shadow.camera.far = 110;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.035;
sun.shadow.radius = 3;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0xe8f0ff, 0.45);
fill.position.set(20, 12, 24);
scene.add(fill);

// ---------------------------------------------------------------- world
const toy = createToyMaterial();
const strata = createStrataMaterial();
scene.add(buildGround());
scene.add(buildBase(toy, strata));
const water = new Water();
scene.add(water.group);
const harbor = new Harbor(toy);
scene.add(harbor.group);
const ship = new ShipRoute(toy, harbor.contGeo, water);
scene.add(ship.group);
scene.add(buildTown(toy));
const pier = buildPier(toy);
scene.add(pier);
const surges = new Surges(water, ship);
scene.add(surges.drops);
surges.onHit = (strength) => crash(strength);
// dir: 0 from the west wall, 1 from the north wall, 2 from the south wall
function makeSurge(dir = 0) { surges.launch(dir); swell(); }
/** A big wave from the wall nearest to a point on the sea plane (any wall but the quay). */
function surgeToward(p) { makeSurge(p ? nearestSurgeWall(p.x, p.z) : 0); }
// see-through bits above the water go in the second pass too, so the surface doesn't cover them
ship.wake.layers.set(1);
pier.userData.beam.layers.set(1);
scene.add(buildSeaFloor(toy));
const floaters = new Floaters(toy);
scene.add(floaters.group);
const fish = new FishSchools(toy);
scene.add(fish.group);
const jellies = new Jellies();
scene.add(jellies.group);
const gulls = new Gulls(toy);
scene.add(gulls.group);
const people = new People(toy);
scene.add(people.group);
const petals = new Petals();
scene.add(petals.mesh);

// ---------------------------------------------------------------- camera rig
// The rig is (target, azimuth, elevation, fit). "fit" is how many world units must fit inside the
// content area of the poster, so framing works for portrait and landscape screens alike.
const rig = { target: new THREE.Vector3(), az: 0, el: 0.6, fit: 50 };
const rigFrom = { target: new THREE.Vector3(), az: 0, el: 0, fit: 0 };
const rigTo = { target: new THREE.Vector3(), az: 0, el: 0, fit: 0 };
let rigT = 1;
let rigDur = 2.4;
const view = { w: 1, h: 1, landscape: false, cx: 0.5, cy: 0.5, cw: 1, ch: 1 };

function layout() {
  const w = window.innerWidth, h = window.innerHeight;
  view.w = w; view.h = h;
  view.landscape = w / h >= 1.2;
  if (view.landscape) {
    // text column on the left: the diorama lives in the right ~62%
    view.cx = 0.66; view.cy = 0.53; view.cw = 0.6; view.ch = 0.86;
  } else {
    // poster: headline at the top, captions at the bottom (squarer screens leave less room between them)
    const a = w / h;
    view.cx = 0.5; view.cy = 0.53; view.cw = a > 0.75 ? 0.8 : 0.94; view.ch = a > 0.75 ? 0.46 : 0.5;
  }
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.setViewOffset(w, h, w * (0.5 - view.cx), h * (0.5 - view.cy), w, h);
  camera.updateProjectionMatrix();
}

function distanceFor(fit) {
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 2;
  const visible = Math.min(camera.aspect * view.cw, view.ch);
  return fit / (t * visible);
}

function applyRig() {
  const d = distanceFor(rig.fit);
  const ce = Math.cos(rig.el);
  camera.position.set(
    rig.target.x + d * ce * Math.sin(rig.az),
    rig.target.y + d * Math.sin(rig.el),
    rig.target.z + d * ce * Math.cos(rig.az),
  );
  camera.lookAt(rig.target);
}

function moveRig(cam, dur = 2.4) {
  rigFrom.target.copy(rig.target); rigFrom.az = rig.az; rigFrom.el = rig.el; rigFrom.fit = rig.fit;
  rigTo.target.fromArray(cam.target); rigTo.az = cam.az; rigTo.el = cam.el; rigTo.fit = cam.fit;
  // shortest way round
  while (rigTo.az - rigFrom.az > Math.PI) rigTo.az -= Math.PI * 2;
  while (rigTo.az - rigFrom.az < -Math.PI) rigTo.az += Math.PI * 2;
  rigT = 0;
  rigDur = dur;
}

function stepRig(dt) {
  if (rigT >= 1) return;
  rigT = Math.min(1, rigT + dt / rigDur);
  const k = rigT < 0.5 ? 4 * rigT ** 3 : 1 - (-2 * rigT + 2) ** 3 / 2;
  rig.target.lerpVectors(rigFrom.target, rigTo.target, k);
  rig.az = THREE.MathUtils.lerp(rigFrom.az, rigTo.az, k);
  rig.el = THREE.MathUtils.lerp(rigFrom.el, rigTo.el, k);
  // zoom in log space so pull-backs feel even
  rig.fit = Math.exp(THREE.MathUtils.lerp(Math.log(rigFrom.fit), Math.log(rigTo.fit), k));
}

// ---------------------------------------------------------------- poster UI and tour
const $ = (id) => document.getElementById(id);
const ui = { headline: $('headline'), sec: $('sec'), sub: $('sub'), bar: $('bar'), dots: $('dots'), play: $('play'), sound: $('sound'), hint: $('hint') };
SECTIONS.forEach((s, i) => {
  const b = document.createElement('button');
  b.textContent = s.id;
  b.title = s.name;
  b.addEventListener('click', () => { goSection(i); setPlaying(true); });
  ui.dots.appendChild(b);
});

const tour = { i: 0, t: 0, playing: !params.has('free'), demoT: 0, demoStep: 0, demoPress: false, demoSurge: false };
let surfaceAlpha = 1;

function setText(s) {
  ui.headline.classList.add('out');
  ui.sub.classList.add('out');
  ui.sec.classList.add('out');
  setTimeout(() => {
    const [a, b] = ui.headline.querySelectorAll('span');
    a.textContent = s.head[0];
    b.textContent = s.head[1];
    ui.sec.textContent = `${s.id} / ${s.name}`;
    ui.sub.textContent = s.sub;
    ui.headline.classList.remove('out');
    ui.sub.classList.remove('out');
    ui.sec.classList.remove('out');
  }, 380);
}

function goSection(i, { instant = false } = {}) {
  const s = SECTIONS[i];
  const prev = tour.i;
  tour.i = i; tour.t = 0; tour.demoT = 0; tour.demoStep = 0; tour.demoSurge = false;
  if (tour.demoPress) { water.pressEnd(); tour.demoPress = false; }
  setText(s);
  ui.bar.style.width = `${((i + 1) / SECTIONS.length) * 100}%`;
  [...ui.dots.children].forEach((b, k) => b.classList.toggle('on', k === i));
  document.documentElement.style.setProperty('--fade', s.fade);
  if (instant) {
    rig.target.fromArray(s.cam.target); rig.az = s.cam.az; rig.el = s.cam.el; rig.fit = s.cam.fit; rigT = 1;
  } else moveRig(s.cam, i === 0 && prev === SECTIONS.length - 1 ? 3.2 : 2.6);

  // keep the harbour story in step with the video: ship alongside in 01–04, out sailing in 06
  if (i <= 3 && !ship.docked) { ship.snapDocked(); harbor.snapToWork(); }
  if (i === 4 && ship.state === 'docked') ship.depart();
  if (i === 5 && (ship.state === 'docked' || ship.state === 'waitClear')) { harbor.snapToClear(); ship.jumpToLoop(0.3); }
}

function setPlaying(on) {
  tour.playing = on;
  if (!on && tour.demoPress) { water.pressEnd(); tour.demoPress = false; }
  ui.play.textContent = on ? '暂停' : '导览';
  ui.play.classList.toggle('on', !on);
}
ui.play.addEventListener('click', () => setPlaying(!tour.playing));
ui.sound.addEventListener('click', () => { setSound(!sfx.enabled); ui.sound.textContent = sfx.enabled ? '声音 开' : '声音 关'; ui.sound.classList.toggle('on', sfx.enabled); });

function stepTour(dt) {
  const s = SECTIONS[tour.i];
  if (s.drift && rigT >= 1) rig.az += s.drift * dt;
  const wantSurface = s.surface ?? 1;
  surfaceAlpha += (wantSurface - surfaceAlpha) * Math.min(1, dt * 1.5);
  water.uniforms.uSurfaceAlpha.value = surfaceAlpha;
  if (!tour.playing) return;
  tour.t += dt;
  if (s.demo) {
    // show the interaction: a few taps, then a long press dragged across the sea, then let go
    tour.demoT += dt;
    const taps = [[1.0, -8, 4], [1.8, -3, -5], [2.6, -12, -2]];
    while (tour.demoStep < taps.length && tour.demoT > taps[tour.demoStep][0]) {
      const [, x, z] = taps[tour.demoStep++];
      water.tap(x, z, 1);
    }
    const a = [-12, 7], b = [-3, -7];
    if (tour.demoT > 3.6 && tour.demoT < 6.6 && !drag) {
      if (!water.pressing) { water.pressStart(a[0], a[1]); tour.demoPress = true; }
      const k = THREE.MathUtils.smoothstep(tour.demoT, 4.2, 6.0);
      if (tour.demoPress) water.pressMove(THREE.MathUtils.lerp(a[0], b[0], k), THREE.MathUtils.lerp(a[1], b[1], k));
    } else if (tour.demoPress && tour.demoT >= 6.6) { water.pressEnd(); tour.demoPress = false; }
    // and a double-click: a big wave rolls in from the open sea (it reaches the quay during 07)
    if (!tour.demoSurge && tour.demoT > 7.4) { tour.demoSurge = true; makeSurge(); }
  }
  if (tour.t > s.dur) goSection((tour.i + 1) % SECTIONS.length);
}

// ---------------------------------------------------------------- input
// drag anywhere = orbit (right / shift drag = pan), tap water = ripple,
// long-press water (or alt/ctrl + drag) = press into the jelly and push it around
const LONG_PRESS_MS = 260;
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function planeHit(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const p = new THREE.Vector3();
  return ray.ray.intersectPlane(plane, p) ? p : null;
}
function waterHit(ev) {
  const p = planeHit(ev);
  if (!p || !water.inside(p.x, p.z) || p.x > WATER.x1 - 0.3) return null;
  return p;
}

const pointers = new Map();
let drag = null;
let pinch = null;
let lastTap = null; // for double-click / double-tap: a big wave
let hoverPoint = null; // where the mouse is over the sea plane (W makes a wave from the nearest wall)

function enterFree() {
  if (tour.playing) setPlaying(false);
  rigT = 1;
}

function startPress(p) {
  if (!drag) return;
  drag.mode = 'press';
  tour.demoPress = false;
  enterFree();
  water.pressStart(p.x, p.z);
  canvas.classList.add('pressing');
  plip(0.35);
}

function endDrag() {
  if (!drag) return;
  clearTimeout(drag.timer);
  if (drag.mode === 'press') { water.pressEnd(); plip(0.7); }
  drag = null;
  canvas.classList.remove('dragging', 'pressing');
}

canvas.addEventListener('pointerdown', (ev) => {
  canvas.setPointerCapture(ev.pointerId);
  pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  ui.hint.classList.add('hide');
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), fit: rig.fit };
    endDrag();
    enterFree();
    return;
  }
  if (pointers.size > 2) return;
  const hit = waterHit(ev);
  const pan = ev.button === 2 || ev.shiftKey;
  drag = { mode: pan ? 'pan' : 'pending', x: ev.clientX, y: ev.clientY, lx: ev.clientX, ly: ev.clientY, start: hit, moved: false, timer: 0, touch: ev.pointerType === 'touch' };
  canvas.classList.add('dragging');
  if (!pan && hit) {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) startPress(hit);
    else drag.timer = setTimeout(() => { if (drag?.mode === 'pending' && !drag.moved) startPress(drag.start); }, LONG_PRESS_MS);
  }
});

canvas.addEventListener('pointermove', (ev) => {
  const p = pointers.get(ev.pointerId);
  if (p) { p.x = ev.clientX; p.y = ev.clientY; }
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    rig.fit = THREE.MathUtils.clamp(pinch.fit * (pinch.d / Math.max(d, 1)), 6, 110);
    return;
  }
  if (!drag) {
    hoverPoint = planeHit(ev);
    canvas.classList.toggle('water', !!(hoverPoint && water.inside(hoverPoint.x, hoverPoint.z) && hoverPoint.x <= WATER.x1 - 0.3));
    return;
  }
  const mx = ev.clientX - drag.lx, my = ev.clientY - drag.ly;
  drag.lx = ev.clientX; drag.ly = ev.clientY;
  if (!drag.moved && Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) > (drag.touch ? 10 : 6)) {
    drag.moved = true;
    if (drag.mode === 'pending') { clearTimeout(drag.timer); drag.mode = 'orbit'; }
  }
  if (!drag.moved) return;
  if (drag.mode === 'press') {
    const q = planeHit(ev);
    if (q) water.pressMove(q.x, q.z);
  } else if (drag.mode === 'orbit') {
    enterFree();
    rig.az -= mx * 0.006;
    rig.el = THREE.MathUtils.clamp(rig.el + my * 0.005, 0.12, 1.45);
  } else if (drag.mode === 'pan') {
    enterFree();
    const s = rig.fit / Math.min(view.w, view.h) * 1.2;
    const right = new THREE.Vector3(Math.cos(rig.az), 0, -Math.sin(rig.az));
    const fwd = new THREE.Vector3(-Math.sin(rig.az), 0, -Math.cos(rig.az));
    rig.target.addScaledVector(right, -mx * s).addScaledVector(fwd, my * s);
    rig.target.x = THREE.MathUtils.clamp(rig.target.x, -HALF, HALF);
    rig.target.z = THREE.MathUtils.clamp(rig.target.z, -HALF, HALF);
  }
});

function endPointer(ev) {
  pointers.delete(ev.pointerId);
  if (pointers.size < 2) pinch = null;
  if (!drag) return;
  if (drag.mode === 'pending' && !drag.moved) {
    const now = performance.now();
    if (lastTap && now - lastTap.t < 340 && Math.hypot(ev.clientX - lastTap.x, ev.clientY - lastTap.y) < 34) {
      surgeToward(planeHit(ev));
      lastTap = null;
    } else {
      lastTap = { t: now, x: ev.clientX, y: ev.clientY };
      if (drag.start) { water.tap(drag.start.x, drag.start.z, 1); plip(1); }
    }
  }
  endDrag();
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  enterFree();
  rig.fit = THREE.MathUtils.clamp(rig.fit * Math.exp(ev.deltaY * 0.0012), 6, 110);
}, { passive: false });

window.addEventListener('keydown', (ev) => {
  if (ev.key === ' ') { ev.preventDefault(); setPlaying(!tour.playing); }
  else if (/^[1-7]$/.test(ev.key)) { goSection(+ev.key - 1); setPlaying(true); }
  else if (ev.key === 'm' || ev.key === 'M') ui.sound.click();
  else if (ev.key === 'w' || ev.key === 'W') surgeToward(hoverPoint);
  else if (ev.key === 'r' || ev.key === 'R') { ship.snapDocked(); harbor.snapToWork(); goSection(0); setPlaying(true); }
});

window.addEventListener('resize', layout);
{
  // one unbreakable chunk per control, so a narrow screen wraps between them (the dot stays behind)
  const items = coarse
    ? ['点水面起涟漪', '长按水面拖动推水', '双击掀起大浪', '单指转视角', '双指缩放']
    : ['点水面起涟漪', '长按水面拖动推水', '双击掀起大浪', '拖动转视角', '滚轮缩放'];
  ui.hint.innerHTML = items.map((t, i) => `<span style="white-space:nowrap">${t}${i < items.length - 1 ? ' ·' : ''}</span>`).join(' ');
}
setTimeout(() => ui.hint.classList.add('hide'), 9000);
layout();

// ---------------------------------------------------------------- two-pass render
// Pass 1 draws everything except the sea surface; the frame is copied into a texture; pass 2 draws
// the surface (layer 1), which samples that copy with an offset from the waves' slope: refraction.
// That is what makes waves readable on clear water. Low quality skips it and blends the surface.
const REFRACT = Q !== 'low';
const bufSize = new THREE.Vector2();
let sceneTex = null;
renderer.info.autoReset = false;
if (!REFRACT) camera.layers.enable(1);

function render() {
  renderer.info.reset();
  if (!REFRACT) { renderer.render(scene, camera); return; }
  renderer.getDrawingBufferSize(bufSize);
  if (!sceneTex || sceneTex.image.width !== bufSize.x || sceneTex.image.height !== bufSize.y) {
    sceneTex?.dispose();
    sceneTex = new THREE.FramebufferTexture(bufSize.x, bufSize.y);
    sceneTex.minFilter = sceneTex.magFilter = THREE.LinearFilter;
    water.setSceneTexture(sceneTex, bufSize);
  }
  renderer.render(scene, camera);
  renderer.copyFramebufferToTexture(sceneTex);
  renderer.autoClear = false;
  renderer.shadowMap.autoUpdate = false;
  camera.layers.set(1);
  renderer.render(scene, camera);
  camera.layers.set(0);
  renderer.shadowMap.autoUpdate = true;
  renderer.autoClear = true;
}

// ---------------------------------------------------------------- main loop
const timer = new THREE.Timer();
timer.connect(document);
let time = 0;
let lastShipState = ship.state;
const startSection = THREE.MathUtils.clamp((+params.get('section') || 1) - 1, 0, SECTIONS.length - 1);
goSection(startSection, { instant: true });
if (!tour.playing) setPlaying(false);

function frame(ts) {
  timer.update(ts);
  const dt = Math.min(timer.getDelta(), 1 / 20) * window.__harbor.timeScale;
  time += dt;
  shared.uTime.value = time;

  water.update(dt, time);
  surges.update(dt);
  ship.update(dt, harbor);
  harbor.update(dt, ship.cranesShouldWork);
  if (ship.state !== lastShipState) {
    if (ship.state === 'undock') horn();
    lastShipState = ship.state;
  }
  floaters.update(water, time);
  fish.update(time);
  jellies.update(time);
  gulls.update(time);
  people.update(dt, time);
  petals.update(dt, time);
  pier.userData.beam.rotation.y = time * 0.8;

  stepTour(dt);
  stepRig(dt);
  applyRig();
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame((ts) => {
  document.getElementById('loading').classList.add('done');
  frame(ts);
});

// ---------------------------------------------------------------- debug hooks
window.__harbor = {
  scene, camera, renderer, rig, water, ship, harbor, tour, timeScale: 1,
  go: (i) => goSection(i - 1, { instant: true }),
  play: () => setPlaying(true),
  pause: () => setPlaying(false),
  ripple: (x, z, s = 1) => water.tap(x, z, s),
  tilt: (x, z) => water.setTiltTarget(x, z),
  release: () => water.release(),
  press: (x, z) => water.pressStart(x, z),
  pressMove: (x, z) => water.pressMove(x, z),
  pressEnd: () => water.pressEnd(),
  surge: (dir = 0) => makeSurge(dir),
  surgeAt: (x, z) => surgeToward({ x, z }),
  surges,
  cam: (o) => { enterFree(); if (o.target) rig.target.fromArray(o.target); for (const k of ['az', 'el', 'fit']) if (o[k] != null) rig[k] = o[k]; },
  state: () => ({
    section: tour.i + 1, playing: tour.playing, ship: ship.state, cranes: harbor.cranes.map((c) => c.state),
    tilt: [+water.tilt.x.toFixed(4), +water.tilt.y.toFixed(4)], waves: water.waves.stats(), pressing: water.pressing, surges: surges.active, surgeDirs: surges.uniforms.filter((u) => water.time - u.x < u.w).map((u) => ['west', 'north', 'south'][Math.round(u.z)]), drops: surges.n, rig: { t: rig.target.toArray().map((v) => +v.toFixed(2)), az: +rig.az.toFixed(3), el: +rig.el.toFixed(3), fit: +rig.fit.toFixed(1) },
    calls: renderer.info.render.calls, tris: renderer.info.render.triangles,
  }),
};
