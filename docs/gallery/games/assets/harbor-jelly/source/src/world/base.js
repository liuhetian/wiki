import * as THREE from 'three';
import { Builder } from '../geo.js';
import { C } from '../palette.js';
import { P } from '../materials.js';
import { Rand } from '../rand.js';
import { HALF, QX, LAND_Y, FLOOR_Y, BOTTOM_Y, YARD, PIER, PLATFORM } from './layout.js';

/** Fill colour, pattern and sway attributes on a hand-made geometry so the toy material can use it. */
export function toyAttrs(g, colorFn, pattern = 0) {
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  const c = new THREE.Color();
  const p = g.attributes.position.array;
  for (let i = 0; i < n; i++) {
    colorFn(c, p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aPattern', new THREE.BufferAttribute(new Float32Array(n).fill(pattern), 1));
  g.setAttribute('aAnim', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  return g;
}

/** Gentle sea-floor relief: shallower toward the quay and along the edges, a few dunes. */
export function floorHeight(x, z) {
  // always at or above FLOOR_Y, so the slab under it never shows through
  const n = Math.sin(x * 0.33 + 1.3) * Math.cos(z * 0.27 - 0.4) * 0.22 + Math.sin(x * 0.9 + z * 0.7) * 0.07 + 0.32;
  const pierRidge = Math.max(0, 1 - Math.abs(z - PIER.z) / 3.2) * (x > PIER.x0 - 2 ? 0.35 : 0);
  // flat where it meets the sides of the block, so the cut faces stay clean
  const e = Math.min(x + HALF, QX - x, z + HALF, HALF - z);
  const fade = THREE.MathUtils.smoothstep(e, 0, 1.6);
  return FLOOR_Y + (n + pierRidge) * fade;
}

function paintLandTop() {
  const ppu = 48;
  const W = Math.round((HALF - QX) * ppu);
  const H = Math.round(HALF * 2 * ppu);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const X = (x) => (x - QX) * ppu;
  const Z = (z) => (z + HALF) * ppu;
  const rnd = new Rand(7);

  // town ground: soft grass with earthy speckle
  g.fillStyle = '#9fb089';
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = rnd.pick(['#94a87f', '#a9b892', '#8d9f78', '#b2bd98']);
    const r = rnd.float(2, 7);
    g.beginPath(); g.arc(rnd.float(0, W), rnd.float(0, H), r, 0, Math.PI * 2); g.fill();
  }

  // container yard: pale concrete with lane markings and crane rails
  g.fillStyle = '#c9c7b3';
  g.fillRect(0, 0, W, Z(YARD.z1 + 0.9));
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(90,90,70,${rnd.float(0.02, 0.06)})`;
    g.fillRect(rnd.float(0, W), rnd.float(0, Z(YARD.z1)), rnd.float(4, 30), rnd.float(4, 30));
  }
  g.strokeStyle = 'rgba(240,236,214,0.9)';
  g.lineWidth = 3;
  for (let z = YARD.z0; z < YARD.z1; z += 1.9) {
    g.beginPath(); g.moveTo(X(YARD.x0 - 0.3), Z(z)); g.lineTo(X(YARD.x1), Z(z)); g.stroke();
  }
  g.strokeStyle = '#d9b24a';
  g.lineWidth = 5;
  g.beginPath(); g.moveTo(X(YARD.x0 - 0.5), 0); g.lineTo(X(YARD.x0 - 0.5), Z(YARD.z1 + 0.5)); g.stroke();
  // crane rails
  g.strokeStyle = '#6d6e66';
  g.lineWidth = 4;
  for (const x of [QX + 0.75, QX + 4.55]) {
    g.beginPath(); g.moveTo(X(x), 0); g.lineTo(X(x), Z(-1.2)); g.stroke();
  }

  // quay promenade: stone flags along the water
  const promW = 2.9;
  g.fillStyle = '#d8d3bd';
  g.fillRect(0, Z(YARD.z1 + 0.9), X(QX + promW), H);
  g.strokeStyle = 'rgba(120,115,95,0.35)';
  g.lineWidth = 2;
  for (let z = YARD.z1 + 0.9; z < HALF; z += 0.8) {
    g.beginPath(); g.moveTo(0, Z(z)); g.lineTo(X(QX + promW), Z(z)); g.stroke();
  }
  for (let x = QX; x < QX + promW; x += 0.8) {
    g.beginPath(); g.moveTo(X(x), Z(YARD.z1 + 0.9)); g.lineTo(X(x), H); g.stroke();
  }

  // market plaza
  g.fillStyle = '#d3cdb5';
  g.fillRect(X(QX + promW), Z(1.0), X(QX + 9.2) - X(QX + promW), Z(13.6) - Z(1.0));
  g.strokeStyle = 'rgba(120,115,95,0.3)';
  for (let z = 1.0; z < 13.6; z += 0.65) {
    g.beginPath(); g.moveTo(X(QX + promW), Z(z)); g.lineTo(X(QX + 9.2), Z(z)); g.stroke();
  }
  for (let x = QX + promW; x < QX + 9.2; x += 0.65) {
    g.beginPath(); g.moveTo(X(x), Z(1.0)); g.lineTo(X(x), Z(13.6)); g.stroke();
  }

  // earthy lanes between the houses
  g.fillStyle = '#cdbf9b';
  g.fillRect(X(QX + 2.9), Z(-2.8), X(HALF) - X(QX + 2.9), Z(-1.6) - Z(-2.8));
  g.fillRect(X(QX + 2.9), Z(14.3), X(HALF) - X(QX + 2.9), Z(15.4) - Z(14.3));
  g.fillRect(X(QX + 9.4), Z(-2.8), X(QX + 10.3) - X(QX + 9.4), Z(19.5) - Z(-2.8));

  // fallen petals near the sakura
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = rnd.pick(['rgba(242,195,201,0.85)', 'rgba(234,176,187,0.8)', 'rgba(250,224,226,0.9)']);
    const x = rnd.float(X(QX + 2.5), W);
    const z = rnd.float(Z(-3), H);
    g.beginPath(); g.ellipse(x, z, 2.2, 1.4, rnd.float(0, 3), 0, Math.PI * 2); g.fill();
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function buildBase(toy, strata) {
  const group = new THREE.Group();
  group.name = 'base';

  // under-floor slab (strata on the sides) and the land block above it
  const slab = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2, FLOOR_Y - BOTTOM_Y, HALF * 2), strata);
  slab.position.set(0, (FLOOR_Y + BOTTOM_Y) / 2 - 0.02, 0);
  slab.receiveShadow = true;
  group.add(slab);

  const landH = LAND_Y - FLOOR_Y;
  const land = new THREE.Mesh(new THREE.BoxGeometry(HALF - QX, landH, HALF * 2), strata);
  land.position.set((HALF + QX) / 2, FLOOR_Y + landH / 2 - 0.005, 0);
  land.receiveShadow = true;
  land.castShadow = true;
  group.add(land);

  // land top with the painted ground
  const topMat = new THREE.MeshStandardMaterial({ map: paintLandTop(), roughness: 0.92, metalness: 0 });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(HALF - QX, HALF * 2), topMat);
  top.rotation.x = -Math.PI / 2;
  top.position.set((HALF + QX) / 2, LAND_Y + 0.002, 0);
  top.receiveShadow = true;
  group.add(top);

  // sea floor: sand with darker patches and a few green algae fields
  const fw = QX + HALF;
  const floor = new THREE.PlaneGeometry(fw, HALF * 2, 87, 120);
  floor.rotateX(-Math.PI / 2);
  floor.translate((QX - HALF) / 2, 0, 0);
  const fp = floor.attributes.position;
  for (let i = 0; i < fp.count; i++) {
    const x = fp.getX(i), z = fp.getZ(i);
    fp.setY(i, floorHeight(x, z));
  }
  floor.computeVertexNormals();
  const sand = new THREE.Color(C.sand);
  const sandDark = new THREE.Color(C.sandDark);
  const algae = new THREE.Color(0xa9c49a);
  const fl = floor.toNonIndexed();
  floor.dispose();
  fl.computeVertexNormals();
  toyAttrs(fl, (c, x, y, z) => {
    const n = Math.sin(x * 0.21 + z * 0.13) * 0.5 + Math.sin(x * 0.57 - z * 0.41) * 0.3 + Math.sin(z * 0.9 + 1.7) * 0.2;
    c.copy(sand).lerp(sandDark, THREE.MathUtils.clamp(n * 0.35 + 0.35, 0, 1));
    const g = Math.sin(x * 0.17 - 1.1) * Math.cos(z * 0.21 + 0.6);
    if (g > 0.4) c.lerp(algae, Math.min(0.45, (g - 0.4) * 0.8));
  });
  const floorMesh = new THREE.Mesh(fl, toy);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // quay wall, cap, tyres, life rings, ladders, bollards
  const b = new Builder();
  const wallH = LAND_Y - FLOOR_Y + 0.02;
  b.add(new THREE.BoxGeometry(0.6, wallH, HALF * 2 - 0.02), C.quayWall, {
    pos: [QX + 0.28, FLOOR_Y + wallH / 2 - 0.01, 0], pattern: P.panels,
  });
  for (let z = -HALF; z < HALF - 0.01; z += 1.25) {
    const len = Math.min(1.21, HALF - z);
    b.add(new THREE.BoxGeometry(0.95, 0.2, len), C.quayCap, { pos: [QX + 0.36, LAND_Y + 0.08, z + len / 2] });
  }
  const skip = (z) => (Math.abs(z - PIER.z) < 1.4) || (Math.abs(z - PLATFORM.z) < 2.2);
  for (let z = -18.6; z < HALF - 1; z += 2.55) {
    if (skip(z)) continue;
    b.add(new THREE.TorusGeometry(0.3, 0.11, 8, 16), C.tire, { pos: [QX - 0.12, 0.42, z], rot: [0, Math.PI / 2, 0] });
    b.add(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 4), C.cable, { pos: [QX - 0.06, 1.05, z] });
  }
  const rings = [-16.4, -5.2, 3.4, 11.2, 17.6];
  for (const z of rings) {
    for (let k = 0; k < 4; k++) {
      b.add(new THREE.TorusGeometry(0.21, 0.065, 6, 6, Math.PI / 2), k % 2 ? C.white : C.lifeRed, {
        pos: [QX - 0.05, 0.95, z], rot: [k * Math.PI / 2, Math.PI / 2, 0], order: 'YXZ',
      });
    }
  }
  for (const z of [-11.4, -1.2, 6.2, 16.4]) {
    for (const dz of [-0.2, 0.2]) {
      b.add(new THREE.BoxGeometry(0.05, LAND_Y + 1.5, 0.05), C.rail, { pos: [QX - 0.06, (LAND_Y - 1.5) / 2 + 0.05, z + dz] });
    }
    for (let y = -1.2; y < LAND_Y; y += 0.32) {
      b.add(new THREE.BoxGeometry(0.05, 0.04, 0.42), C.rail, { pos: [QX - 0.08, y, z] });
    }
  }
  for (let z = -18.8; z < HALF - 0.5; z += 3.4) {
    b.add(new THREE.CylinderGeometry(0.13, 0.16, 0.26, 8), C.bollard, { pos: [QX + 0.32, LAND_Y + 0.3, z] });
    b.add(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 8), C.bollard, { pos: [QX + 0.32, LAND_Y + 0.45, z] });
  }
  const quay = new THREE.Mesh(b.build(), toy);
  quay.castShadow = true;
  quay.receiveShadow = true;
  group.add(quay);

  return group;
}

/** Shadow catcher and a soft contact shadow so the block sits on the paper. */
export function buildGround() {
  const group = new THREE.Group();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.13, color: 0x3a4a40 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = BOTTOM_Y - 0.01;
  shadow.receiveShadow = true;
  group.add(shadow);

  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 60, 128, 128, 128);
  grd.addColorStop(0, 'rgba(60,70,60,0.5)');
  grd.addColorStop(1, 'rgba(60,70,60,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(cv);
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF * 2.5, HALF * 2.5),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.35 }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = BOTTOM_Y - 0.005;
  group.add(contact);
  return group;
}
