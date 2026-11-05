/* =========================================================================
 * cat.js — 程序化低多边形小橘猫（依据 tmp/image.png 的像素画设计）
 * 坐姿、举起左前爪挥手、张嘴吐舌、大眼睛高光、粉色内耳与肉垫、
 * 奶白色口鼻/胸口/脚掌、虎斑条纹、上卷的条纹尾巴、胡须。
 *
 * 做法与绵羊相同：全部由代码生成。区别是花纹——每个部件是一个细分椭球，
 * 按“三角面在椭球上的方向”调用涂色函数，把条纹/奶白区域写进顶点色。
 * 修改 RANCH.CAT_PARAMS 即可调整颜色与比例。
 *
 * 层级：root → body(呼吸) / headPivot(歪头) → 耳朵、眼睛(眨眼)
 *        root → armPivot(挥手) → wristPivot(手腕) ；root → 尾巴关节链(摆尾)
 * ========================================================================= */
(function () {
  'use strict';
  const THREE = window.THREE;
  const R = (window.RANCH = window.RANCH || {});

  // 若未加载 world.js，则提供同样的工具函数
  if (!R.util) {
    const mulberry32 = (seed) => {
      let a = seed >>> 0;
      return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const lerp = (a, b, t) => a + (b - a) * t;
    const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    const wrapAngle = (a) => { a = (a + Math.PI) % (Math.PI * 2); if (a < 0) a += Math.PI * 2; return a - Math.PI; };
    R.util = { mulberry32, clamp, lerp, smoothstep, wrapAngle };
  }
  const { mulberry32, clamp, smoothstep } = R.util;

  /* ---------------------------- 可编辑参数 ---------------------------- */
  const P = (R.CAT_PARAMS = {
    colors: {
      fur: '#f5a046', stripe: '#de6c22', cream: '#fde7cb', white: '#fff7ec',
      earInner: '#f6a5a2', nose: '#ec8b8b', mouth: '#8f3b2c', tongue: '#f3898a',
      iris: '#6e3519', pupil: '#2f1309', highlight: '#ffffff', whisker: '#a0602f',
      pad: '#f7a3a9', toeLine: '#e4a07e',
    },
    head: { pos: [0, 0.66, 0.02], scale: [0.3, 0.235, 0.26], detail: 4 },
    neck: [0, 0.45, 0],                                  // 头部旋转支点
    ear: { x: 0.185, y: 0.8, z: -0.01, radius: 0.125, height: 0.215, tilt: 0.3 },
    eye: { x: 0.115, y: 0.678, w: 0.058, h: 0.07, yaw: 0.4 },
    body: { pos: [0, 0.2, -0.03], scale: [0.2, 0.245, 0.19] },
    arm: { shoulder: [0.105, 0.35, 0.07], restZ: -0.8, restX: 0.36, length: 0.15 },
    tail: {
      segments: 12, radius: 0.062,
      path: [[-0.08, 0.06, -0.15], [-0.21, 0.045, -0.19], [-0.31, 0.065, -0.11], [-0.36, 0.16, -0.02], [-0.35, 0.27, 0.03], [-0.3, 0.355, 0.03], [-0.245, 0.39, 0.0]],
    },
    anim: { waveSpeed: 7.0, waveOn: 2.6, wavePause: 1.6, blinkEvery: 3.4 },
  });

  /* ---------------------------- 几何构建器 ---------------------------- */
  const sphereCache = {};
  const unitSphere = (detail) => (sphereCache[detail] ||= new THREE.IcosahedronGeometry(1, detail));
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
  const _v = new THREE.Vector3(), _s = new THREE.Vector3(), _d = new THREE.Vector3();
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c3 = new THREE.Vector3();
  const _col = new THREE.Color();

  class Builder {
    constructor(seed = 1, offset = [0, 0, 0]) {
      this.pos = [];
      this.col = [];
      this.rng = mulberry32(seed);
      this.offset = offset;   // 整体平移（用于把几何放到关节的局部坐标系）
    }
    _push(v, c) {
      this.pos.push(v.x - this.offset[0], v.y - this.offset[1], v.z - this.offset[2]);
      this.col.push(c.r, c.g, c.b);
    }
    /**
     * 椭球部件。paint(d, out)：d 为该三角面中心在单位球上的方向（部件局部坐标），
     * 返回颜色写入 out。每个面再加一点明度抖动，形成低多边形的块面感。
     */
    ellipsoid({ pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0], detail = 1, color, paint, deform, shade = 0.035 }) {
      const base = unitSphere(detail).attributes.position;
      _m.compose(_v.set(pos[0], pos[1], pos[2]), _q.setFromEuler(_e.set(rot[0], rot[1], rot[2])), _s.set(1, 1, 1));
      const tri = [_a, _b, _c3];
      for (let i = 0; i < base.count; i += 3) {
        for (let k = 0; k < 3; k++) tri[k].fromBufferAttribute(base, i + k);
        _d.copy(_a).add(_b).add(_c3).normalize();
        if (paint) paint(_d, _col); else _col.set(color);
        if (shade) _col.offsetHSL(0, 0, (this.rng() - 0.5) * shade);
        for (let k = 0; k < 3; k++) {
          if (deform) deform(tri[k]);
          tri[k].set(tri[k].x * scale[0], tri[k].y * scale[1], tri[k].z * scale[2]).applyMatrix4(_m);
          this._push(tri[k], _col);
        }
      }
      return this;
    }
    /** 任意几何体（圆锥、圆柱等），单色 */
    geometry(geo, color, matrix) {
      const g = geo.index ? geo.toNonIndexed() : geo;
      const p = g.attributes.position;
      _col.set(color);
      for (let i = 0; i < p.count; i++) {
        _v.fromBufferAttribute(p, i);
        if (matrix) _v.applyMatrix4(matrix);
        this._push(_v, _col);
      }
      if (g !== geo) g.dispose();
      return this;
    }
    /** 从 a 指向 b 的细圆柱（胡须） */
    stick(a, b, r0, r1, color) {
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
      const dir = B.clone().sub(A), len = dir.length();
      const geo = new THREE.CylinderGeometry(r1, r0, len, 4, 1);
      const m = new THREE.Matrix4().compose(
        A.clone().addScaledVector(dir, 0.5),
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()),
        new THREE.Vector3(1, 1, 1));
      this.geometry(geo, color, m);
      geo.dispose();
      return this;
    }
    /**
     * 贴在椭球表面的一笔条纹（扁椭球“笔触”）。
     * host={pos, scale, deform}；dir 为在单位球上的方向；along 为条纹走向；size=[宽, 长, 厚]
     */
    stroke(host, dir, along, size, color) {
      const d = new THREE.Vector3(...dir).normalize();
      const p = d.clone();
      if (host.deform) host.deform(p);
      p.set(p.x * host.scale[0], p.y * host.scale[1], p.z * host.scale[2]).add(new THREE.Vector3(...host.pos));
      const n = new THREE.Vector3(d.x / host.scale[0], d.y / host.scale[1], d.z / host.scale[2]).normalize();
      const t = new THREE.Vector3(...along).projectOnPlane(n).normalize();
      const x = new THREE.Vector3().crossVectors(t, n);
      const e = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, t, n));
      p.addScaledVector(n, -size[2] * 0.3);
      return this.ellipsoid({ pos: [p.x, p.y, p.z], scale: size, rot: [e.x, e.y, e.z], detail: 1, color, shade: 0.02 });
    }
    build() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
      g.computeVertexNormals();
      return g;
    }
  }

  const catMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0 });
  function makeMesh(geo, shadow = true) {
    const m = new THREE.Mesh(geo, catMat);
    m.castShadow = shadow;
    m.receiveShadow = true;
    return m;
  }

  /* ---------------------------- 涂色函数（花纹） ---------------------------- */
  const C = P.colors;

  function paintHead(d, out) {
    const ax = Math.abs(d.x);
    // 奶白口鼻：下半脸较宽，向上收窄成两眼之间的细条
    let w = clamp(0.62 - (d.y + 0.15) * 1.6, 0, 0.62);
    if (d.y < 0.3) w = Math.max(w, 0.09);
    if ((d.z > 0.3 && ax < w) || (d.y < -0.62 && d.z > -0.15)) return out.set(C.cream);
    // 后脑勺横条纹（额头与脸颊的条纹用 stroke 笔触单独贴上）
    if (d.z < -0.3 && Math.sin(d.y * 8 + 1) > 0.5) return out.set(C.stripe);
    return out.set(C.fur);
  }
  function paintBody(d, out) {
    const ax = Math.abs(d.x);
    const w = 0.16 + 0.34 * clamp((d.y + 0.6) / 1.4, 0, 1);       // 胸口奶白，上宽下窄
    if (d.z > 0.35 && ax < w && d.y > -0.88) return out.set(C.cream);
    const s = Math.sin(d.y * 7.2 - ax * 2.2 + (d.z < 0 ? d.z * 1.4 : 0));
    if (s > 0.55 && !(d.z > 0.2 && ax < w + 0.12)) return out.set(C.stripe);
    return out.set(C.fur);
  }
  const paintHaunch = (d, out) => out.set(Math.sin(d.z * 6.5 + d.y * 4.5 + 0.6) > 0.55 ? C.stripe : C.fur);
  const paintLimb = (d, out) => out.set(Math.sin(d.y * 8.5 + 0.4) > 0.5 && d.y > -0.75 ? C.stripe : C.fur);
  const deformBody = (v) => {
    if (v.y < 0) { v.x *= 1 + 0.2 * -v.y; v.z *= 1 + 0.1 * -v.y; }
    if (v.y < -0.78) v.y = -0.78 + (v.y + 0.78) * 0.3;               // 坐着的平底
  };
  const deformHead = (v) => {
    if (v.y > 0) v.y *= 0.93;                                        // 头顶略平
    else v.x *= 1 + 0.08 * Math.sin(-v.y * Math.PI);                 // 腮帮略鼓
  };

  /* ---------------------------- 部件 ---------------------------- */
  function foot(b, x, y, z, s, rotY = 0) {
    b.ellipsoid({ pos: [x, y, z], scale: [0.062 * s, 0.042 * s, 0.085 * s], rot: [0, rotY, 0], detail: 2, color: C.white });
    // 脚趾分隔线
    for (const dx of [-0.02, 0.02]) {
      b.ellipsoid({ pos: [x + dx * s, y + 0.012 * s, z + 0.068 * s], scale: [0.004, 0.02 * s, 0.022 * s], rot: [0.5, rotY, 0], detail: 0, color: C.toeLine, shade: 0 });
    }
  }

  function buildTorso() {
    const b = new Builder(11);
    const B = P.body;
    b.ellipsoid({ pos: B.pos, scale: B.scale, detail: 4, paint: paintBody, deform: deformBody, shade: 0.025 });
    for (const sx of [-1, 1]) {
      b.ellipsoid({ pos: [sx * 0.145, 0.105, -0.03], scale: [0.11, 0.125, 0.155], rot: [0, sx * 0.25, 0], detail: 4, paint: paintHaunch, shade: 0.025 });
      foot(b, sx * 0.175, 0.034, 0.115, 1, sx * 0.12);
    }
    // 着地的右前腿 + 前爪
    b.ellipsoid({ pos: [-0.075, 0.19, 0.125], scale: [0.058, 0.165, 0.064], rot: [0.08, 0, 0.04], detail: 4, paint: paintLimb, shade: 0.025 });
    foot(b, -0.08, 0.036, 0.175, 1.05, 0);
    return makeMesh(b.build());
  }

  function buildHead() {
    const N = P.neck, H = P.head;
    const b = new Builder(23, N);
    b.ellipsoid({ pos: H.pos, scale: H.scale, detail: H.detail, paint: paintHead, deform: deformHead, shade: 0.025 });
    // 额头 4 道竖条纹 + 两侧脸颊各 2 道横条纹
    const host = { pos: H.pos, scale: H.scale, deform: deformHead };
    for (const [x, len] of [[-0.36, 0.05], [-0.12, 0.068], [0.12, 0.068], [0.36, 0.05]]) {
      b.stroke(host, [x, 0.72 - Math.abs(x) * 0.15, 0.62], [x * 0.3, 1, -0.35], [0.021, len, 0.014], C.stripe);
    }
    for (const sx of [-1, 1]) {
      b.stroke(host, [sx * 0.93, 0.2, 0.3], [0, 0.12, -1], [0.017, 0.055, 0.012], C.stripe);
      b.stroke(host, [sx * 0.95, -0.04, 0.3], [0, 0.05, -1], [0.016, 0.05, 0.012], C.stripe);
    }
    // 胡须垫（两团奶白，自然形成“ω”形上唇）
    for (const sx of [-1, 1]) b.ellipsoid({ pos: [sx * 0.043, 0.598, 0.262], scale: [0.058, 0.044, 0.04], detail: 2, color: C.cream, shade: 0.02 });
    // 张开的嘴 + 舌头
    b.ellipsoid({ pos: [0, 0.556, 0.262], scale: [0.043, 0.034, 0.024], detail: 2, color: C.mouth, shade: 0 });
    b.ellipsoid({ pos: [0, 0.545, 0.272], scale: [0.03, 0.021, 0.015], detail: 2, color: C.tongue, shade: 0.02 });
    // 粉色鼻子（倒三角）
    b.ellipsoid({ pos: [0, 0.624, 0.29], scale: [0.026, 0.017, 0.014], detail: 1, color: C.nose, shade: 0, deform: (v) => { if (v.y < 0) v.x *= 1 + v.y * 0.7; } });
    // 胡须：每侧三根
    for (const sx of [-1, 1]) {
      const x0 = sx * 0.085;
      b.stick([x0, 0.605, 0.25], [sx * 0.3, 0.635, 0.2], 0.0042, 0.0022, C.whisker);
      b.stick([x0, 0.592, 0.25], [sx * 0.31, 0.588, 0.19], 0.0042, 0.0022, C.whisker);
      b.stick([x0, 0.58, 0.245], [sx * 0.25, 0.545, 0.2], 0.0042, 0.0022, C.whisker);
    }
    return makeMesh(b.build());
  }

  function buildEar(side) {
    const E = P.ear, r = E.radius, h = E.height, depth = 0.72;
    const b = new Builder(31 + side);
    // 外耳：三棱锥（一个面朝前），前后略压扁
    const outer = new THREE.ConeGeometry(r, h, 3, 1, false, Math.PI).translate(0, h / 2, 0).scale(1, 1, depth);
    b.geometry(outer, C.fur);
    outer.dispose();
    // 内耳：贴在朝前那个面上的粉色三角片（略微外移，避免与外耳重叠闪烁）
    const bl = new THREE.Vector3(-0.866 * r, 0, 0.5 * r * depth);
    const br = new THREE.Vector3(0.866 * r, 0, 0.5 * r * depth);
    const ap = new THREE.Vector3(0, h, 0);
    const n = new THREE.Vector3().subVectors(br, bl).cross(new THREE.Vector3().subVectors(ap, bl)).normalize();
    const cen = new THREE.Vector3().add(bl).add(br).add(ap).multiplyScalar(1 / 3);
    const shrink = (v, k, up) => v.clone().lerp(cen, k).addScaledVector(n, 0.004).add(new THREE.Vector3(0, up, 0));
    const t0 = shrink(bl, 0.32, 0.012), t1 = shrink(br, 0.32, 0.012), t2 = shrink(ap, 0.2, -0.012);
    _col.set(C.earInner);
    for (const v of [t0, t1, t2]) b._push(v, _col);
    return makeMesh(b.build());
  }

  function buildEye(side) {
    const E = P.eye;
    const b = new Builder(41 + side);
    b.ellipsoid({ pos: [0, 0, 0], scale: [E.w, E.h, 0.03], detail: 2, color: C.iris, shade: 0 });
    b.ellipsoid({ pos: [0, -0.004, 0.012], scale: [E.w * 0.72, E.h * 0.74, 0.024], detail: 2, color: C.pupil, shade: 0 });
    const inner = -side; // 高光偏向鼻梁一侧（与参考图一致）
    b.ellipsoid({ pos: [inner * E.w * 0.22, E.h * 0.32, 0.03], scale: [0.019, 0.021, 0.008], detail: 1, color: C.highlight, shade: 0 });
    b.ellipsoid({ pos: [-inner * E.w * 0.3, -E.h * 0.38, 0.027], scale: [0.009, 0.009, 0.005], detail: 1, color: C.highlight, shade: 0 });
    return makeMesh(b.build(), false);
  }

  function buildArm() {
    const A = P.arm;
    const upper = new Builder(51);
    upper.ellipsoid({ pos: [0, 0.07, 0], scale: [0.056, 0.1, 0.06], detail: 4, paint: paintLimb, shade: 0.025 });
    const paw = new Builder(52);
    paw.ellipsoid({ pos: [0, 0.045, 0], scale: [0.066, 0.07, 0.05], detail: 2, color: C.white });
    // 掌心肉垫 + 4 个趾垫，朝向前方（+z）
    paw.ellipsoid({ pos: [0, 0.028, 0.044], scale: [0.03, 0.023, 0.012], detail: 2, color: C.pad, shade: 0 });
    for (const [x, y] of [[-0.037, 0.066], [-0.013, 0.083], [0.013, 0.083], [0.037, 0.066]]) {
      paw.ellipsoid({ pos: [x, y, 0.04], scale: [0.012, 0.014, 0.01], detail: 1, color: C.pad, shade: 0 });
    }
    return { upper: makeMesh(upper.build()), paw: makeMesh(paw.build()), length: A.length };
  }

  /* ---------------------------- 小猫 ---------------------------- */
  class Cat {
    constructor(opts = {}) {
      this.size = opts.size ?? 1;
      this.time = 0;
      this.root = new THREE.Group();
      this.root.name = 'cat';
      this.root.scale.setScalar(this.size);

      // 身体（呼吸时以底部为基准缩放）
      this.body = new THREE.Group();
      this.body.add(buildTorso());
      this.root.add(this.body);

      // 头
      this.headPivot = new THREE.Group();
      this.headPivot.position.set(...P.neck);
      this.headPivot.add(buildHead());
      this.root.add(this.headPivot);
      const E = P.ear, N = P.neck;
      this.ears = [1, -1].map((side) => {
        const pivot = new THREE.Group();
        pivot.position.set(side * E.x - N[0], E.y - N[1], E.z - N[2]);
        pivot.rotation.z = -side * E.tilt;
        pivot.add(buildEar(side));
        this.headPivot.add(pivot);
        return pivot;
      });
      const EY = P.eye, Hd = P.head;
      this.eyes = [1, -1].map((side) => {
        // 眼睛贴在头部椭球表面
        const nx = (side * EY.x) / Hd.scale[0], ny = (EY.y - Hd.pos[1]) / Hd.scale[1];
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const g = new THREE.Group();
        g.position.set(side * EY.x - N[0], EY.y - N[1], Hd.pos[2] + nz * Hd.scale[2] - 0.004 - N[2]);
        g.rotation.set(-0.05, side * EY.yaw, 0);
        g.add(buildEye(side));
        this.headPivot.add(g);
        return g;
      });

      // 举起的左前爪
      const A = P.arm, arm = buildArm();
      this.armPivot = new THREE.Group();
      this.armPivot.position.set(...A.shoulder);
      this.armPivot.rotation.order = 'ZXY';
      this.armPivot.add(arm.upper);
      this.wrist = new THREE.Group();
      this.wrist.position.y = arm.length;
      this.wrist.add(arm.paw);
      this.armPivot.add(this.wrist);
      this.root.add(this.armPivot);

      // 尾巴：沿曲线生成关节链，每节一个带颜色交替的椭球
      this.tail = this._buildTail();

      // 柔和接触阴影
      this.root.add(this._contactShadow());
      this.update(0);
    }

    _buildTail() {
      const T = P.tail, n = T.segments;
      const curve = new THREE.CatmullRomCurve3(T.path.map((p) => new THREE.Vector3(...p)));
      const pts = curve.getSpacedPoints(n);
      const Y = new THREE.Vector3(0, 1, 0);
      const worldQ = [];
      for (let i = 0; i < n; i++) worldQ.push(new THREE.Quaternion().setFromUnitVectors(Y, pts[i + 1].clone().sub(pts[i]).normalize()));
      const joints = [];
      let parent = this.root;
      for (let i = 0; i < n; i++) {
        const len = pts[i + 1].distanceTo(pts[i]);
        const pivot = new THREE.Group();
        if (i === 0) {
          pivot.position.copy(pts[0]);
          pivot.quaternion.copy(worldQ[0]);
        } else {
          pivot.position.set(0, pts[i].distanceTo(pts[i - 1]), 0);
          pivot.quaternion.copy(worldQ[i - 1]).invert().multiply(worldQ[i]);
        }
        // 胶囊体首尾相接（关节处为同半径球面），形成连续的尾巴；每 2 节一条深色环纹
        const r = T.radius * (1 - 0.18 * (i / (n - 1)));
        const b = new Builder(60 + i);
        const cap = new THREE.CapsuleGeometry(r, len, 3, 8).translate(0, len / 2, 0);
        b.geometry(cap, Math.floor(i / 2) % 2 === 1 ? C.stripe : C.fur);
        cap.dispose();
        pivot.add(makeMesh(b.build()));
        parent.add(pivot);
        joints.push({ pivot, rest: pivot.quaternion.clone() });
        parent = pivot;
      }
      return joints;
    }

    _contactShadow() {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 128;
      const ctx = cv.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(0,0,0,0.5)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.18)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.75).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), color: '#5a3a1c', transparent: true, opacity: 0.45, depthWrite: false }));
      m.position.set(-0.04, 0.003, 0);
      m.renderOrder = 1;
      return m;
    }

    /* ---------- 动画：挥手、眨眼、歪头、抖耳、摇尾、呼吸 ---------- */
    update(dt) {
      this.time += dt;
      const t = this.time, A = P.anim;

      // 呼吸
      const br = Math.sin(t * 2.2);
      this.body.scale.set(1 - 0.006 * br, 1 + 0.012 * br, 1 - 0.006 * br);

      // 挥手：挥 waveOn 秒，停 wavePause 秒（停时爪子仍举着）
      const cyc = A.waveOn + A.wavePause, u = t % cyc;
      const env = smoothstep(0, 0.35, u) * (1 - smoothstep(A.waveOn - 0.35, A.waveOn, u));
      const w = Math.sin(t * A.waveSpeed);
      this.armPivot.rotation.z = P.arm.restZ + env * 0.2 * w;
      this.armPivot.rotation.x = P.arm.restX + 0.04 * Math.sin(t * 1.3);
      this.wrist.rotation.z = env * 0.38 * Math.sin(t * A.waveSpeed - 0.7) - 0.08;

      // 头：轻轻歪向挥手一侧，随挥手微动
      this.headPivot.rotation.z = -0.07 + 0.05 * Math.sin(t * 0.9) - env * 0.03 * w;
      this.headPivot.rotation.x = 0.025 * Math.sin(t * 1.4);
      this.headPivot.rotation.y = 0.12 * Math.sin(t * 0.45);

      // 眨眼
      const bu = t % A.blinkEvery;
      const blink = bu < 0.16 ? 1 - Math.sin((bu / 0.16) * Math.PI) * 0.9 : 1;
      for (const e of this.eyes) e.scale.y = blink;

      // 抖耳朵
      const eu = (t + 1.3) % 4.3;
      const twitch = eu < 0.25 ? Math.sin((eu / 0.25) * Math.PI) : 0;
      this.ears[0].rotation.z = -P.ear.tilt - 0.25 * twitch;
      this.ears[1].rotation.z = P.ear.tilt + 0.05 * Math.sin(t * 1.1);

      // 尾巴：沿关节链传播的摆动
      for (let i = 0; i < this.tail.length; i++) {
        const j = this.tail[i], k = i / this.tail.length;
        _e.set(0.1 * k * Math.sin(t * 1.7 - i * 0.55), 0, 0.16 * (0.3 + k) * Math.sin(t * 2.1 - i * 0.6));
        j.pivot.quaternion.copy(j.rest).multiply(_q.setFromEuler(_e));
      }
    }
  }

  R.Cat = Cat;
})();
