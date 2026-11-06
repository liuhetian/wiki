// Third-person orbit camera: mouse (pointer lock or drag) and Q/E turn it, the wheel zooms, it pulls in when the
// terrain is between it and the player and never dips under the ground.

import type { PerspectiveCamera } from 'three';
import type { Input } from '../core/input';
import type { Terrain } from '../world/terrain';

export class CameraRig {
  yaw = 0.0;
  pitch = 0.62;
  dist = 10.5;
  private cur = 10.5;
  private ty = 0;
  private shakeT = 0;
  private shakeA = 0;

  shake(amount: number, time = 0.25): void {
    this.shakeA = Math.max(this.shakeA, amount);
    this.shakeT = Math.max(this.shakeT, time);
  }

  update(dt: number, input: Input, px: number, py: number, pz: number, t: Terrain, cam: PerspectiveCamera, look = true): void {
    if (look) {
      this.yaw -= input.mouseDX * 0.0032;
      this.pitch = Math.min(1.25, Math.max(0.15, this.pitch + input.mouseDY * 0.0024));
      this.yaw += input.axis(['KeyE'], ['KeyQ']) * dt * 2.2;
      this.dist = Math.min(18, Math.max(5.5, this.dist * Math.pow(1.1, input.wheel)));
    }
    this.ty += (py - this.ty) * (1 - Math.exp(-10 * dt));
    if (Math.abs(py - this.ty) > 6) this.ty = py;
    const tx = px,
      tz = pz,
      ty = this.ty + 1.5;
    const cp = Math.cos(this.pitch),
      sp = Math.sin(this.pitch);
    const dx = Math.sin(this.yaw) * cp,
      dy = sp,
      dz = Math.cos(this.yaw) * cp;
    // March toward the desired position; stop before the first terrain hit.
    let want = this.dist;
    for (let i = 1; i <= 16; i++) {
      const d = (this.dist * i) / 16;
      const x = tx + dx * d,
        y = ty + dy * d,
        z = tz + dz * d;
      if (t.height(x, z) + 0.6 > y) {
        want = Math.max(1.6, d * 0.85);
        break;
      }
    }
    this.cur += (want - this.cur) * (1 - Math.exp(-(want < this.cur ? 18 : 4) * dt));
    let cx = tx + dx * this.cur,
      cy = ty + dy * this.cur,
      cz = tz + dz * this.cur;
    cy = Math.max(cy, t.height(cx, cz) + 0.6);
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = this.shakeA * Math.max(0, this.shakeT) * 4;
      cx += (Math.random() - 0.5) * a;
      cy += (Math.random() - 0.5) * a;
      cz += (Math.random() - 0.5) * a;
      if (this.shakeT <= 0) this.shakeA = 0;
    }
    cam.position.set(cx, cy, cz);
    cam.lookAt(tx, ty, tz);
  }
}
