import * as THREE from 'three';
import gsap from 'gsap';
import { Builder } from '../geo.js';
import { C } from '../palette.js';

let iconTex = null;
let bodyGeo = null;
const faceGeo = new THREE.PlaneGeometry(0.66, 0.6);

function duckIcon() {
  if (iconTex) return iconTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#fff';
  g.beginPath(); g.ellipse(60, 80, 34, 24, 0, 0, Math.PI * 2); g.fill(); // body
  g.beginPath(); g.arc(80, 46, 17, 0, Math.PI * 2); g.fill(); // head
  g.beginPath(); g.moveTo(94, 44); g.lineTo(112, 50); g.lineTo(94, 56); g.fill(); // beak
  g.beginPath(); g.moveTo(28, 74); g.lineTo(14, 58); g.lineTo(36, 66); g.fill(); // tail
  iconTex = new THREE.CanvasTexture(c);
  iconTex.colorSpace = THREE.SRGBColorSpace;
  return iconTex;
}

function lightBody() {
  if (bodyGeo) return bodyGeo;
  const b = new Builder();
  b.add(new THREE.CylinderGeometry(0.07, 0.09, 2.6, 10), C.pole, { pos: [0, 1.3, 0] });
  b.add(new THREE.CylinderGeometry(0.2, 0.22, 0.1, 12), C.pole, { pos: [0, 0.05, 0] });
  b.add(new THREE.BoxGeometry(0.9, 0.75, 0.32), C.black, { pos: [0, 2.85, 0] });
  b.add(new THREE.BoxGeometry(0.98, 0.08, 0.42), C.black, { pos: [0, 3.25, 0.05] });
  bodyGeo = b.build();
  return bodyGeo;
}

/** Pedestrian light with a duck icon; pops up when the crosswalk is painted. */
export class TrafficLight {
  constructor(toyMat, position, rotY) {
    this.object = new THREE.Group();
    this.object.position.copy(position);
    this.object.rotation.y = rotY;
    const mesh = new THREE.Mesh(lightBody(), toyMat);
    mesh.castShadow = true;
    this.object.add(mesh);
    this.face = new THREE.MeshBasicMaterial({ map: duckIcon(), color: 0xe0473a, toneMapped: false });
    const faceMesh = new THREE.Mesh(faceGeo, this.face);
    faceMesh.position.set(0, 2.85, 0.165);
    this.object.add(faceMesh);
    const back = faceMesh.clone();
    back.rotation.y = Math.PI;
    back.position.z = -0.165;
    this.object.add(back);
    this.object.visible = false;
  }

  show() {
    const o = this.object;
    o.visible = true;
    this.face.color.set(0xe0473a);
    o.scale.set(0.001, 0.001, 0.001);
    gsap.to(o.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
  }

  green() {
    gsap.to(this.face.color, { r: 0.12, g: 0.75, b: 0.35, duration: 0.25 });
  }

  dispose() {
    gsap.killTweensOf(this.object.scale);
    gsap.killTweensOf(this.face.color);
    this.object.removeFromParent();
    this.face.dispose(); // geometry and icon are shared
  }

  reset() {
    gsap.killTweensOf(this.object.scale);
    gsap.killTweensOf(this.face.color);
    this.object.visible = false;
    this.face.color.set(0xe0473a);
  }
}
