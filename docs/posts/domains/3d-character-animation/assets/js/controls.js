/* =========================================================================
 * controls.js — 轨道相机（带阻尼）：旋转 / 缩放（可朝指针缩放）/ 平移 / 重置
 * 输入由 app.js 中统一的 Pointer Events 处理器驱动（鼠标与触控通用）。
 * ========================================================================= */
(function () {
  'use strict';
  const THREE = window.THREE;
  const R = window.RANCH;
  const { clamp, wrapAngle } = R.util;

  class OrbitCam {
    constructor(camera, opts = {}) {
      this.camera = camera;
      this.opts = Object.assign({
        theta: 0.55, phi: 0.98, radius: 56,
        target: new THREE.Vector3(0, 0, 0),
        minRadius: 7, maxRadius: 120,
        minPhi: 0.12, maxPhi: 1.36,
        bounds: 17, rotateSpeed: 0.0062, damping: 10,
        viewportHeight: () => window.innerHeight,
      }, opts);
      const o = this.opts;
      this.home = { theta: o.theta, phi: o.phi, radius: o.radius, target: o.target.clone() };
      this.cur = { theta: o.theta, phi: o.phi, radius: o.radius, target: o.target.clone() };
      this.goal = { theta: o.theta, phi: o.phi, radius: o.radius, target: o.target.clone() };
      this._apply();
    }
    setHome(h) {
      if (h.theta !== undefined) this.home.theta = h.theta;
      if (h.phi !== undefined) this.home.phi = h.phi;
      if (h.radius !== undefined) this.home.radius = h.radius;
      if (h.target) this.home.target.copy(h.target);
    }
    rotate(dx, dy) {
      const s = this.opts.rotateSpeed;
      this.goal.theta -= dx * s;
      this.goal.phi = clamp(this.goal.phi - dy * s, this.opts.minPhi, this.opts.maxPhi);
    }
    /** factor < 1 拉近；point 为指针下的地面点（可选），拉近时向该点靠拢 */
    zoom(factor, point) {
      const o = this.opts, g = this.goal;
      const r0 = g.radius;
      g.radius = clamp(g.radius * factor, o.minRadius, o.maxRadius);
      if (point && g.radius < r0) {
        const k = (1 - g.radius / r0) * 0.85;
        g.target.x += (point.x - g.target.x) * k;
        g.target.z += (point.z - g.target.z) * k;
        this._clampTarget();
      }
    }
    pan(dx, dy) {
      const g = this.goal, th = this.cur.theta;
      const perPx = (2 * this.cur.radius * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))) / this.opts.viewportHeight();
      const rx = Math.cos(th), rz = -Math.sin(th);      // 屏幕右方向（地面）
      const fx = -Math.sin(th), fz = -Math.cos(th);     // 远离相机方向（地面）
      const fwdScale = Math.min(2.5, 1 / Math.max(0.2, Math.cos(this.cur.phi))); // 地面透视压缩补偿
      g.target.x += (-rx * dx + fx * dy * fwdScale) * perPx;
      g.target.z += (-rz * dx + fz * dy * fwdScale) * perPx;
      this._clampTarget();
    }
    _clampTarget() {
      const b = this.opts.bounds;
      this.goal.target.x = clamp(this.goal.target.x, -b, b);
      this.goal.target.z = clamp(this.goal.target.z, -b, b);
    }
    reset() {
      const g = this.goal, h = this.home;
      g.theta = g.theta + wrapAngle(h.theta - g.theta);
      g.phi = h.phi;
      g.radius = h.radius;
      g.target.copy(h.target);
    }
    update(dt) {
      const k = 1 - Math.exp(-this.opts.damping * dt);
      const c = this.cur, g = this.goal;
      c.theta += (g.theta - c.theta) * k;
      c.phi += (g.phi - c.phi) * k;
      c.radius += (g.radius - c.radius) * k;
      c.target.lerp(g.target, k);
      this._apply();
    }
    _apply() {
      const c = this.cur, sp = Math.sin(c.phi);
      this.camera.position.set(
        c.target.x + c.radius * sp * Math.sin(c.theta),
        c.target.y + c.radius * Math.cos(c.phi),
        c.target.z + c.radius * sp * Math.cos(c.theta),
      );
      this.camera.lookAt(c.target);
    }
  }

  R.OrbitCam = OrbitCam;
})();
