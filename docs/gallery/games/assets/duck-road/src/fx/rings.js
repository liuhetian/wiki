import * as THREE from 'three';
import gsap from 'gsap';

/** White rings that spread over the paper when a plot pops up (pooled). */
export class Rings {
  constructor(scene, count = 32) {
    this.pool = [];
    this.i = 0;
    const geo = new THREE.RingGeometry(0.93, 1.0, 72);
    geo.rotateX(-Math.PI / 2);
    for (let k = 0; k < count; k++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
      m.visible = false;
      m.renderOrder = 3;
      scene.add(m);
      this.pool.push(m);
    }
  }

  spawn(x, z, radius, delay = 0) {
    const m = this.pool[this.i++ % this.pool.length];
    gsap.killTweensOf(m.scale);
    gsap.killTweensOf(m.material);
    m.position.set(x, 0.4, z);
    m.scale.setScalar(radius * 0.55);
    m.material.opacity = 0;
    m.visible = true;
    gsap.to(m.scale, { x: radius * 1.25, y: radius * 1.25, z: radius * 1.25, duration: 1.1, delay, ease: 'power2.out' });
    gsap.timeline({ delay, onComplete: () => { m.visible = false; } })
      .to(m.material, { opacity: 0.85, duration: 0.12 })
      .to(m.material, { opacity: 0, duration: 0.95, ease: 'power1.in' });
  }

  clear() {
    for (const m of this.pool) {
      gsap.killTweensOf(m.scale);
      gsap.killTweensOf(m.material);
      m.visible = false;
    }
  }
}
