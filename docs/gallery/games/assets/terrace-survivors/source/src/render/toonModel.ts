// The few real 3D objects (chests, shrines): code-built low poly with MeshToonMaterial on a 3-step gradient map and an
// inverted-hull outline (back faces pushed out along the normal, drawn dark).

import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  DataTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  OctahedronGeometry,
  RedFormat,
  BackSide,
  type BufferGeometry,
} from 'three';

const gradient = (() => {
  const t = new DataTexture(new Uint8Array([90, 170, 255]), 3, 1, RedFormat);
  t.minFilter = t.magFilter = NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const outlineMat = (() => {
  const m = new MeshBasicMaterial({ color: 0x1a1028, side: BackSide });
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * 0.06;');
  };
  return m;
})();

const mats = new Map<string, MeshToonMaterial>();
export function toon(color: number, emissive = 0, intensity = 0): MeshToonMaterial {
  const key = `${color}|${emissive}|${intensity}`;
  let m = mats.get(key);
  if (!m) {
    m = new MeshToonMaterial({ color, gradientMap: gradient, emissive: new Color(emissive), emissiveIntensity: intensity });
    mats.set(key, m);
  }
  return m;
}

function part(g: BufferGeometry, m: MeshToonMaterial, x: number, y: number, z: number, outline = true): Mesh {
  const mesh = new Mesh(g, m);
  mesh.position.set(x, y, z);
  if (outline) mesh.add(new Mesh(g, outlineMat));
  return mesh;
}

export function makeChest(): { root: Group; lid: Group } {
  const root = new Group();
  const wood = toon(0x9a5a2e),
    trim = toon(0xf2c040, 0x4a3000, 0.3),
    dark = toon(0x5a321a);
  root.add(part(new BoxGeometry(1.6, 0.9, 1.1), wood, 0, 0.45, 0));
  root.add(part(new BoxGeometry(1.66, 0.14, 1.16), trim, 0, 0.82, 0, false));
  root.add(part(new BoxGeometry(0.16, 0.92, 1.14), trim, -0.6, 0.46, 0, false));
  root.add(part(new BoxGeometry(0.16, 0.92, 1.14), trim, 0.6, 0.46, 0, false));
  const lid = new Group();
  lid.position.set(0, 0.9, -0.55);
  const top = part(new CylinderGeometry(0.55, 0.55, 1.6, 8, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2), wood, 0, 0, 0.55);
  lid.add(top);
  lid.add(part(new BoxGeometry(0.3, 0.32, 0.12), trim, 0, 0.0, 1.13, false));
  lid.add(part(new BoxGeometry(0.12, 0.14, 0.06), dark, 0, -0.02, 1.2, false));
  root.add(lid);
  return { root, lid };
}

export function makeShrine(color: number): { root: Group; crystal: Mesh } {
  const root = new Group();
  const stone = toon(0xb8b4c8),
    stoneD = toon(0x7a768a);
  root.add(part(new CylinderGeometry(2.4, 2.6, 0.4, 10), stoneD, 0, 0.2, 0));
  root.add(part(new CylinderGeometry(1.5, 1.7, 0.35, 10), stone, 0, 0.55, 0));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    root.add(part(new BoxGeometry(0.42, 2.4, 0.42), stone, Math.cos(a) * 2, 1.4, Math.sin(a) * 2));
    root.add(part(new BoxGeometry(0.62, 0.22, 0.62), stoneD, Math.cos(a) * 2, 2.68, Math.sin(a) * 2));
  }
  const crystal = part(new OctahedronGeometry(0.62, 0).scale(1, 1.6, 1), toon(color, color, 1.6), 0, 2.2, 0);
  root.add(crystal);
  return { root, crystal };
}
