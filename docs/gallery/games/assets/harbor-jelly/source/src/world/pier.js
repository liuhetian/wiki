import * as THREE from 'three';
import { Builder } from '../geo.js';
import { C } from '../palette.js';
import { P } from '../materials.js';
import { Rand } from '../rand.js';
import { QX, LAND_Y, FLOOR_Y, PIER, LIGHTHOUSE, PLATFORM } from './layout.js';
import { floorHeight } from './base.js';

export function buildPier(toy) {
  const group = new THREE.Group();
  group.name = 'pier';
  const b = new Builder();
  const rnd = new Rand(5);
  const { z, x0, x1, width, y } = PIER;
  const len = x1 - x0;

  // deck: planks across the walkway, edge beams, low curbs
  b.add(new THREE.BoxGeometry(len, 0.16, width), C.plank, { pos: [(x0 + x1) / 2, y, z], pattern: P.planksX });
  for (const s of [-1, 1]) b.add(new THREE.BoxGeometry(len, 0.2, 0.1), C.plankDark, { pos: [(x0 + x1) / 2, y - 0.04, z + s * (width / 2 + 0.03)] });
  for (let x = x0 + 0.5; x < x1 - 0.3; x += 1.6) {
    for (const s of [-1, 1]) b.add(new THREE.BoxGeometry(0.1, 0.32, 0.1), C.plankDark, { pos: [x, y + 0.24, z + s * (width / 2 - 0.02)] });
  }
  // steps up to the quay
  for (let i = 0; i < 3; i++) b.add(new THREE.BoxGeometry(0.3, 0.12, width), C.quayCap, { pos: [x1 - 0.15 - i * 0.3, y + 0.14 + (2 - i) * 0.1, z] });

  // rubble breakwater under the deck: big rounded boulders from the floor up to the deck
  for (let x = x0 - 0.6; x < x1 - 0.4; x += 0.55) {
    const fy = floorHeight(x, z);
    for (let k = 0; k < 3; k++) {
      const r = rnd.float(0.45, 0.85);
      const yy = fy + r * 0.6 + k * rnd.float(0.6, 0.9);
      if (yy > y - 0.25) continue;
      const dz = rnd.float(-1.2, 1.2) * (1 - k * 0.25);
      b.add(new THREE.IcosahedronGeometry(r, 1), rnd.pick(C.rock), {
        pos: [x + rnd.float(-0.2, 0.2), yy, z + dz], scale: [1, rnd.float(0.75, 1), rnd.float(0.85, 1.1)],
        rot: [rnd.float(0, 3), rnd.float(0, 3), 0], pattern: P.stone, flat: true,
      });
    }
  }
  // a few scattered rocks spilling out sideways
  for (let i = 0; i < 26; i++) {
    const x = rnd.float(x0 - 1, x1 - 1);
    const dz = rnd.float(1.2, 2.4) * (rnd.chance(0.5) ? -1 : 1);
    const r = rnd.float(0.25, 0.55);
    b.add(new THREE.IcosahedronGeometry(r, 1), rnd.pick(C.rock), { pos: [x, floorHeight(x, z + dz) + r * 0.5, z + dz], scale: [1, 0.7, 1], pattern: P.stone, flat: true });
  }

  // lighthouse on a round stone base with steps
  const lx = LIGHTHOUSE.x, lz = LIGHTHOUSE.z;
  const baseH = y + 0.2 - FLOOR_Y;
  b.add(new THREE.CylinderGeometry(1.35, 1.6, baseH, 20), 0xc9c4ad, { pos: [lx, FLOOR_Y + baseH / 2, lz], pattern: P.stone });
  b.add(new THREE.CylinderGeometry(1.42, 1.42, 0.14, 20), C.quayCap, { pos: [lx, y + 0.22, lz] });
  for (let i = 0; i < 5; i++) b.add(new THREE.BoxGeometry(0.9, 0.16, 0.34), C.quayCap, { pos: [lx - 0.4, y + 0.15 - i * 0.2, lz + 1.45 + i * 0.3] });
  const towerH = 4.3;
  const ty0 = y + 0.29;
  const bands = 8;
  for (let i = 0; i < bands; i++) {
    const t0 = i / bands, t1 = (i + 1) / bands;
    const r0 = THREE.MathUtils.lerp(0.62, 0.46, t0), r1 = THREE.MathUtils.lerp(0.62, 0.46, t1);
    b.add(new THREE.CylinderGeometry(r1, r0, towerH / bands, 18), i % 2 ? C.lhWhite : C.lhRed, { pos: [lx, ty0 + (t0 + t1) / 2 * towerH, lz] });
  }
  b.add(new THREE.BoxGeometry(0.05, 0.5, 0.3), 0x5a4636, { pos: [lx + 0.62, ty0 + 0.3, lz] });
  for (const t of [0.35, 0.62]) b.add(new THREE.BoxGeometry(0.05, 0.22, 0.16), C.lhDark, { pos: [lx + 0.6 - t * 0.16, ty0 + t * towerH, lz] });
  const gy = ty0 + towerH;
  b.add(new THREE.CylinderGeometry(0.72, 0.72, 0.1, 18), C.lhDark, { pos: [lx, gy + 0.05, lz] });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    b.add(new THREE.BoxGeometry(0.03, 0.28, 0.03), C.lhDark, { pos: [lx + Math.cos(a) * 0.68, gy + 0.24, lz + Math.sin(a) * 0.68] });
  }
  b.add(new THREE.TorusGeometry(0.68, 0.02, 4, 24), C.lhDark, { pos: [lx, gy + 0.38, lz], rot: [Math.PI / 2, 0, 0] });
  b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 14), C.lhDark, { pos: [lx, gy + 0.16, lz] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.add(new THREE.BoxGeometry(0.04, 0.6, 0.04), C.lhDark, { pos: [lx + Math.cos(a) * 0.4, gy + 0.52, lz + Math.sin(a) * 0.4] });
  }
  b.add(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 14), C.lhDark, { pos: [lx, gy + 0.85, lz] });
  b.add(new THREE.ConeGeometry(0.55, 0.55, 14), C.lhRed, { pos: [lx, gy + 1.17, lz] });
  b.add(new THREE.SphereGeometry(0.08, 8, 6), C.lhDark, { pos: [lx, gy + 1.5, lz] });
  b.add(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 4), C.lhDark, { pos: [lx, gy + 1.7, lz] });

  // wooden fishing platform on stilts by the quay, with stairs, a little shed and barrels
  const px = PLATFORM.x, pz = PLATFORM.z;
  const pw = 3.1, pd = 2.8, py = 0.62;
  b.add(new THREE.BoxGeometry(pw, 0.14, pd), 0x9c7a55, { pos: [px, py, pz], pattern: P.planksX });
  for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) {
    const xx = px + sx * (pw / 2 - 0.12), zz = pz + sz * (pd / 2 - 0.12);
    const fy = floorHeight(xx, zz);
    b.add(new THREE.CylinderGeometry(0.1, 0.12, py - fy, 6), 0x6e5440, { pos: [xx, (py + fy) / 2, zz] });
  }
  for (let i = 0; i < 4; i++) b.add(new THREE.BoxGeometry(0.4, 0.1, 0.9), 0x9c7a55, { pos: [QX - 0.25 - i * 0.02, py + 0.18 + i * 0.16, pz + pd / 2 + 0.55 - i * 0.0], pattern: P.planksX });
  b.add(new THREE.BoxGeometry(0.08, 0.5, 0.08), 0x6e5440, { pos: [px - pw / 2 + 0.1, py + 0.3, pz - pd / 2 + 0.1] });
  // shed with a blue canopy
  b.add(new THREE.BoxGeometry(1.0, 0.8, 1.1), 0x9c7a55, { pos: [px + 0.7, py + 0.47, pz - 0.6], pattern: P.planksZ });
  b.add(new THREE.BoxGeometry(1.5, 0.06, 1.7), C.boatBlue, { pos: [px + 0.3, py + 1.05, pz - 0.4], rot: [0, 0, 0.2] });
  for (const [xx, zz] of [[px - 0.4, pz - 1.15], [px - 0.4, pz + 0.35]]) b.add(new THREE.BoxGeometry(0.06, 0.95, 0.06), 0x6e5440, { pos: [xx, py + 0.5, zz] });
  for (const [xx, zz, r] of [[px - 1.0, pz + 0.9, 0.2], [px - 0.55, pz + 1.0, 0.17], [px + 1.1, pz + 0.9, 0.2]]) {
    b.add(new THREE.CylinderGeometry(r, r, r * 2.2, 10), 0x8a6444, { pos: [xx, py + 0.07 + r * 1.1, zz] });
    b.add(new THREE.TorusGeometry(r, 0.02, 4, 12), 0x3a3a3a, { pos: [xx, py + 0.07 + r * 1.5, zz], rot: [Math.PI / 2, 0, 0] });
  }
  b.add(new THREE.BoxGeometry(0.5, 0.35, 0.4), 0xb48e5e, { pos: [px - 0.9, py + 0.25, pz - 0.6], pattern: P.planksZ });
  b.add(new THREE.BoxGeometry(0.55, 0.06, 0.45), 0x5f9fc8, { pos: [px - 0.9, py + 0.45, pz - 0.6] });

  const mesh = new THREE.Mesh(b.build(), toy);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // the lighthouse lamp (unlit, warm)
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 14), new THREE.MeshBasicMaterial({ color: C.lhLight }));
  lamp.position.set(lx, gy + 0.52, lz);
  group.add(lamp);
  // faint rotating beam
  const beamGeo = new THREE.ConeGeometry(0.9, 6, 16, 1, true);
  beamGeo.translate(0, -3, 0);
  beamGeo.rotateZ(Math.PI / 2);
  const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xfff1c0, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.copy(lamp.position);
  group.add(beam);
  group.userData.beam = beam;
  return group;
}

/** Small blue fishing boat; returns a Group whose origin sits on the waterline. */
export function buildFishingBoat(toy) {
  const b = new Builder();
  const s = new THREE.Shape();
  s.moveTo(-0.5, 1.1); s.lineTo(0.5, 1.1); s.lineTo(0.5, -0.4);
  s.quadraticCurveTo(0.45, -1.0, 0, -1.25); s.quadraticCurveTo(-0.45, -1.0, -0.5, -0.4); s.closePath();
  const hull = new THREE.ExtrudeGeometry(s, { depth: 0.75, bevelEnabled: false, curveSegments: 8 });
  hull.rotateX(-Math.PI / 2); hull.translate(0, -0.4, 0);
  b.add(hull, C.boatBlue);
  const rim = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false, curveSegments: 8 });
  rim.rotateX(-Math.PI / 2); rim.translate(0, 0.33, 0); rim.scale(1.04, 1, 1.02);
  b.add(rim, C.white);
  b.add(new THREE.BoxGeometry(0.7, 0.55, 0.7), C.white, { pos: [0, 0.6, 0.35] });
  b.add(new THREE.BoxGeometry(0.72, 0.16, 0.72), C.windowDark, { pos: [0, 0.72, 0.35] });
  b.add(new THREE.BoxGeometry(0.8, 0.06, 0.8), 0xc9473b, { pos: [0, 0.9, 0.35] });
  b.add(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 4), 0x6e5440, { pos: [0, 1.1, -0.45] });
  b.add(new THREE.BoxGeometry(0.03, 0.03, 0.8), 0x6e5440, { pos: [0, 1.5, -0.6], rot: [0.3, 0, 0] });
  b.add(new THREE.BoxGeometry(0.4, 0.15, 0.3), 0xe3b450, { pos: [0.1, 0.42, -0.5] });
  const g = new THREE.Group();
  const m = new THREE.Mesh(b.build(), toy);
  m.castShadow = true;
  g.add(m);
  return g;
}

export { LAND_Y };
