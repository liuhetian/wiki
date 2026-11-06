import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { shared, createToyMaterial, createPaperMaterial, createPencilMaterial } from './materials.js';
import { World, BEHIND } from './world/world.js';
import { Roller } from './actors/roller.js';
import { Rings } from './fx/rings.js';
import { Post } from './fx/post.js';
import { Sfx } from './sfx.js';
import { UI } from './ui.js';

const params = new URLSearchParams(location.search);
const coarse = matchMedia('(pointer: coarse)').matches;
const quality = params.get('q') ?? (coarse ? 'mid' : 'high');

// The roller starts a full BEHIND window into the road, so the far end of the street behind it is
// always the point where old chunks get dropped, never a visible "start of the road".
const START_S = BEHIND;

// ------------------------------------------------------------------ renderer, scene, camera
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: params.has('shot') });
renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 'high' ? 2 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.06;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe9dfd0);

const camera = new THREE.PerspectiveCamera(28, innerWidth / innerHeight, 1, 2000);

// Follow view: beside the road looking back at the roller as it comes toward us (as in the film),
// so the direction of travel points lower right on screen; the camera turns with the road's bends.
const CAM_EL = 0.86;
const CAM_TURN = THREE.MathUtils.degToRad(51);
// Overview: high up ahead of the roller, looking back down the street it has built (the film's end).
const OVERVIEW_EL = THREE.MathUtils.degToRad(62);
const OVERVIEW_BACK = 70;
// keep roughly the same width of street in view on narrow phones
const narrow = () => Math.max(1, 0.75 / camera.aspect) ** 0.85;
const camDistance = () => (camera.aspect < 1 ? 34 * narrow() : 30);
const overviewDistance = () => (camera.aspect < 1 ? 250 * narrow() : 200);

function followDir(s, out = new THREE.Vector3()) {
  const f = world.path.frame(s);
  const gx = f.tx * Math.cos(CAM_TURN) - f.tz * Math.sin(CAM_TURN);
  const gz = f.tx * Math.sin(CAM_TURN) + f.tz * Math.cos(CAM_TURN);
  return out.set(gx * Math.cos(CAM_EL), Math.sin(CAM_EL), gz * Math.cos(CAM_EL)).normalize();
}

function overviewDir(s, out = new THREE.Vector3()) {
  const f = world.path.frame(s);
  return out.set(f.tx * Math.cos(OVERVIEW_EL), Math.sin(OVERVIEW_EL), f.tz * Math.cos(OVERVIEW_EL)).normalize();
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 14;
controls.maxDistance = 420; // further out would show the ends of the generated window
controls.minPolarAngle = 0.05;
controls.maxPolarAngle = 1.2;

// ------------------------------------------------------------------ light
const hemi = new THREE.HemisphereLight(0xfaf4ec, 0xc8bba9, 1.45);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe8cc, 3.9);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.radius = 4;
sun.shadow.bias = -0.0003;
sun.shadow.normalBias = 0.03;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 600;
scene.add(sun, sun.target);
let shadowExtent = 0;
function updateSun(target, extent) {
  sun.position.copy(target).addScaledVector(shared.uSunDir.value, 250);
  sun.target.position.copy(target);
  const e = Math.round(extent / 4) * 4;
  if (e !== shadowExtent) {
    shadowExtent = e;
    const c = sun.shadow.camera;
    c.left = -e; c.right = e; c.top = e; c.bottom = -e;
    c.updateProjectionMatrix();
    sun.shadow.radius = THREE.MathUtils.clamp(220 / e, 1.5, 5);
  }
}

// Window shadow: offset so the point the camera looks at falls inside a pane, near a corner of the cross.
{
  const sd = shared.uSunDir.value;
  const k = 90 / Math.max(sd.y, 0.15);
  const px = sd.x * k;
  const pz = sd.z * k;
  const c = Math.cos(shared.uGoboRot.value);
  const s = Math.sin(shared.uGoboRot.value);
  const cell = shared.uGoboCell.value;
  shared.uGoboOff.value.set(0.35 * cell.x - (c * px + s * pz), 0.3 * cell.y - (-s * px + c * pz));
}

// ------------------------------------------------------------------ world
const toyMat = createToyMaterial();
const pencilMat = createPencilMaterial();
// the sheet of paper follows the camera; its grain is in world space so it never slides
const paper = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), createPaperMaterial());
paper.rotation.x = -Math.PI / 2;
paper.receiveShadow = true;
scene.add(paper);

const sfx = new Sfx();
const rings = new Rings(scene);
const roller = new Roller(toyMat, scene);
scene.add(roller.object);

const ui = new UI({
  onReset: () => resetAll(),
  onToggleView: () => setOverview(!overview),
  onToggleSound: (on) => sfx.setEnabled(on),
  onDrive: (v) => { sfx.unlock(); driveHeld.button = v; },
});

let elapsed = 0;
let homeAt = -100;
let world = null;

function makeWorld() {
  return new World({
    scene, toyMat, pencilMat, rings, sfx, roller,
    viewDir: (s) => followDir(s),
    onFlockState: (flock, s, prev) => {
      if (s === 'home' && prev === 'crossing') { homeAt = elapsed; sfx.chime(); }
    },
  });
}

// ------------------------------------------------------------------ state
let targetS = START_S;
let overview = false;
const driveHeld = { key: false, button: false };
const view = { k: 0, tweening: false }; // k: 0 follow … 1 overview
const sph = new THREE.Spherical();
let camHeading = 0;

function rollerFocus(out = new THREE.Vector3()) {
  const f = world.path.frame(roller.s - 1.8 - OVERVIEW_BACK * view.k);
  return out.set(f.x, 1.6, f.z);
}

// Blend toward the ducks: a little when coming up to them, mostly while they hop down and cross.
let duckFocus = 0;
let aheadFocus = 0;
const duckPos = new THREE.Vector3();
function cameraFocus(dt, out) {
  rollerFocus(out);
  const f = world.story(roller.s);
  if (f) f.centroid(duckPos).setY(1.0);
  const stage = f && f.onStage && roller.s < f.crossS + 26 ? 0.9 : 0;
  const near = f && f.state === 'waiting' ? THREE.MathUtils.smoothstep(roller.s, f.crossS - 32, f.crossS - 12) * 0.45 : 0;
  const ease = 1 - view.k;
  duckFocus += (stage * ease - duckFocus) * (1 - Math.exp(-dt * 1.5));
  aheadFocus += (near * ease - aheadFocus) * (1 - Math.exp(-dt * 2));
  if (aheadFocus > 0.001) out.lerp(duckPos, aheadFocus);
  if (duckFocus > 0.001) out.lerp(duckPos, duckFocus);
  return out;
}

function setRoller(s, animate) {
  roller.place(world.path, s);
  world.update(s + 0.4, animate);
}

function placeCamera() {
  const target = rollerFocus();
  controls.target.copy(target);
  const dir = view.k > 0.5 ? overviewDir(roller.s) : followDir(roller.s);
  camera.position.copy(target).addScaledVector(dir, view.k > 0.5 ? overviewDistance() : camDistance());
  camera.lookAt(target);
  camHeading = world.path.heading(roller.s);
  shared.uGoboAnchor.value.set(target.x, target.z);
}

function resetAll() {
  gsap.killTweensOf(view);
  gsap.killTweensOf(sph);
  view.k = 0;
  view.tweening = false;
  overview = false;
  ui.setOverview(false);
  rings.clear();
  world?.dispose();
  world = makeWorld();
  roller.s = START_S;
  targetS = START_S;
  world.ensure(START_S);
  setRoller(START_S, false);
  duckFocus = 0;
  aheadFocus = 0;
  homeAt = -100;
  placeCamera();
}

const _off = new THREE.Vector3();
function setOverview(on) {
  overview = on;
  ui.setOverview(on);
  gsap.killTweensOf(view);
  gsap.killTweensOf(sph);
  const dir = on ? overviewDir(roller.s) : followDir(roller.s);
  const goal = new THREE.Spherical().setFromVector3(dir.multiplyScalar(on ? overviewDistance() : camDistance()));
  sph.setFromVector3(_off.subVectors(camera.position, controls.target));
  let dTheta = goal.theta - sph.theta;
  dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
  view.tweening = true;
  const dur = on ? 2.2 : 1.6;
  gsap.to(sph, { radius: goal.radius, phi: goal.phi, theta: sph.theta + dTheta, duration: dur, ease: 'power2.inOut' });
  gsap.to(view, {
    k: on ? 1 : 0, duration: dur, ease: 'power2.inOut',
    onComplete: () => { view.tweening = false; camHeading = world.path.heading(roller.s); },
  });
}

// ------------------------------------------------------------------ input
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let dragging = false;
let grabOffset = 0;
let down = null;

function setNdc(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
}

function groundS(e) {
  setNdc(e);
  const hit = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(ground, hit)) return null;
  return world.path.project(hit.x, hit.z, roller.s - 12, roller.s + 40);
}

function pick(e) {
  setNdc(e);
  const flocks = world.flocks;
  const hits = raycaster.intersectObjects([...roller.pickables, ...flocks.flatMap((f) => f.pickables)], false);
  if (!hits.length) return null;
  let o = hits[0].object;
  while (o && !o.userData.duck && !o.userData.roller) o = o.parent;
  if (!o) return null;
  if (o.userData.roller) return { roller: true };
  const duck = o.userData.duck;
  return { duck, flock: flocks.find((f) => f.ducks.includes(duck)) };
}

const canvas = renderer.domElement;
canvas.addEventListener('pointerdown', (e) => {
  sfx.unlock();
  const p = pick(e);
  down = { x: e.clientX, y: e.clientY, p };
  if (p?.roller) {
    controls.enabled = false;
    dragging = true;
    const s = groundS(e);
    grabOffset = s == null ? 0 : s - roller.s;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
  } else if (p?.duck) {
    controls.enabled = false;
  }
}, { capture: true });

canvas.addEventListener('pointermove', (e) => {
  if (dragging) {
    const s = groundS(e);
    if (s != null) targetS = Math.max(targetS, s - grabOffset);
    return;
  }
  if (e.buttons === 0 && e.pointerType === 'mouse') {
    const p = pick(e);
    canvas.style.cursor = p ? (p.roller ? 'grab' : 'pointer') : '';
  }
});

function endPointer(e) {
  const p = down?.p;
  if (p?.duck && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8) p.flock?.poke(p.duck);
  dragging = false;
  down = null;
  controls.enabled = true;
  canvas.style.cursor = '';
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) { driveHeld.key = true; sfx.unlock(); e.preventDefault(); }
  if (e.code === 'KeyR') resetAll();
  if (e.code === 'KeyV') setOverview(!overview);
});
addEventListener('keyup', (e) => {
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) driveHeld.key = false;
});

// When the user rotates or zooms, stop a view change so it does not fight them.
controls.addEventListener('start', () => {
  if (!view.tweening) return;
  gsap.killTweensOf(sph);
  gsap.killTweensOf(view);
  view.k = overview ? 1 : 0;
  view.tweening = false;
  camHeading = world.path.heading(roller.s);
});

// ------------------------------------------------------------------ resize
const post = new Post(renderer, scene, camera, { quality });
function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  post.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize);
resize();

// ------------------------------------------------------------------ loop
const timer = new THREE.Timer();
const tmp = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const prevTarget = new THREE.Vector3();

function hintText() {
  const f = world.story(roller.s);
  const st = f?.state;
  if (st === 'boarding') return '小鸭被吓飞了……落到压路机上搭车！';
  if (st === 'riding') return roller.s < f.crossS + 2 ? '小鸭坐稳了，继续开' : '斑马线刷好了，再往前一点';
  if (st === 'landing') return '灯绿了，小鸭跳下来过马路';
  if (st === 'crossing') return '小鸭排队回家';
  if (elapsed - homeAt < 5) return '小鸭到家了！路还长，接着修';
  if (st === 'waiting' && roller.s > f.crossS - 22) return '前面的斑马线上排着小鸭……';
  return coarse ? '按住右下角按钮开车，或者拖动压路机 · 点小鸭' : '按住压路机往前拖，或者按住空格开车 · 拖空白处转视角 · 点小鸭';
}

function tick(time) {
  timer.update(time);
  const dt = Math.min(timer.getDelta(), 1 / 20);
  elapsed += dt;
  shared.uTime.value = elapsed;

  // drive: forward only, never past a duck family that is still in the way
  const limit = world.limit();
  if (driveHeld.key || driveHeld.button) targetS = Math.max(targetS, roller.s) + 9 * dt;
  targetS = Math.min(targetS, limit);
  const gap = targetS - roller.s;
  const moving = gap > 0.02;
  if (moving) {
    const s = Math.min(targetS, roller.s + Math.min(14, gap * 5 + 1.5) * dt);
    world.ensure(s);
    setRoller(s, true);
  }
  world.pump(3);
  roller.update(dt, elapsed, moving);
  world.updateFlocks(dt, elapsed, roller.s);

  // camera: follow the focus point, turn with the road, and play any view change
  cameraFocus(dt, tmp);
  prevTarget.copy(controls.target);
  controls.target.lerp(tmp, 1 - Math.exp(-dt * 3));
  camera.position.add(tmp.subVectors(controls.target, prevTarget));
  let dh = world.path.heading(roller.s) - camHeading;
  dh = Math.atan2(Math.sin(dh), Math.cos(dh)) * (1 - Math.exp(-dt * 1.2));
  camHeading += dh;
  if (view.tweening) {
    sph.theta += dh;
    camera.position.setFromSpherical(sph).add(controls.target);
  } else {
    tmp.subVectors(camera.position, controls.target).applyAxisAngle(UP, dh);
    camera.position.copy(controls.target).add(tmp);
  }
  controls.update(dt);

  const target = controls.target;
  const dist = camera.position.distanceTo(target);
  updateSun(target, THREE.MathUtils.clamp(dist * 0.62, 30, 240));
  paper.position.set(Math.round(target.x / 50) * 50, 0, Math.round(target.z / 50) * 50);
  const anchor = shared.uGoboAnchor.value;
  const ka = 1 - Math.exp(-dt * 0.35);
  anchor.set(anchor.x + (target.x - anchor.x) * ka, anchor.y + (target.z - anchor.y) * ka);

  // keep the roller (or the street in overview, or the ducks) in focus
  tmp.copy(view.k > 0.5 || duckFocus > 0.5 ? target : roller.object.position).setY(1.5).project(camera);
  const focusY = THREE.MathUtils.clamp(tmp.y * 0.5 + 0.5, 0.15, 0.85);
  const blur = THREE.MathUtils.clamp(1.7 - dist / 90, 0.12, 1);

  ui.hint(hintText());
  ui.distance(roller.s - START_S);
  post.render(elapsed, focusY, blur);
}

resetAll();
renderer.setAnimationLoop(tick);

// Debug / screenshot hooks.
window.__duck = {
  get world() { return world; },
  roller, camera, controls, post, renderer, START_S,
  /** Jump to arc length s; duck families on the way go straight home. */
  setS(s) {
    world.ensure(s);
    world.skipBefore(s);
    targetS = s;
    setRoller(s, false);
    placeCamera();
  },
  drive(s) { targetS = s; },
  /** Arc length of the next crosswalk ahead (or null). */
  nextCross() { return world.flocks.find((f) => f.crossS > roller.s)?.crossS ?? null; },
  overview: setOverview,
  reset: resetAll,
  state: () => {
    const f = world.story(roller.s);
    return { s: roller.s, flock: f?.state ?? null, crossS: f?.crossS ?? null, overview, chunks: [world.first, world.next - 1] };
  },
};
