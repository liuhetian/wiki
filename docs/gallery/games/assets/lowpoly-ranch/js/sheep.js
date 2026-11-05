/* =========================================================================
 * sheep.js — 程序化低多边形绵羊
 * 模型完全由代码生成（羊毛团、头部、耳朵、眼睛、尾巴、两段式腿），
 * 修改 RANCH.SHEEP_PARAMS 即可调整外形与动画参数。
 *
 * 层级：root(地面位置/朝向/缩放) → lift(跳跃/提起高度) → body(俯仰/侧倾)
 *        body → wool / neckPivot → headPivot → ears / tailPivot / 4 条腿(hip → knee)
 * 腿部使用两骨骼 IK：每个动画只描述“脚的位置”，关节角度自动求解，
 * 因此行走时脚掌贴地不打滑、下蹲起跳时膝盖自然弯曲。
 * ========================================================================= */
(function () {
  'use strict';
  const THREE = window.THREE;
  const R = window.RANCH;
  const { mulberry32, clamp, lerp, smoothstep, wrapAngle } = R.util;
  const TAU = Math.PI * 2;

  /* ---------------------------- 可编辑参数 ---------------------------- */
  const P = (R.SHEEP_PARAMS = {
    colors: {
      wool: '#ffffff', woolShade: '#e9e6df',
      face: '#3d3534', leg: '#3d3534', hoof: '#2a2423',
      eye: '#f3efe6', pupil: '#151212',
    },
    body: { y: 0.6, rx: 0.3, ry: 0.27, rz: 0.48 },               // 羊毛身体外轮廓（椭球半径）
    wool: { puffs: 34, minR: 0.1, maxR: 0.145, detail: 1 },       // 羊毛团数量与大小
    neck: { base: [0, 0.0, 0.36], length: 0.3, angle: 0.95 },      // 颈部（相对身体中心），angle 为抬起角
    head: { rest: 0.3 },                                           // 头部默认低头角
    legs: { hipX: 0.15, frontZ: 0.27, backZ: -0.27, hipY: -0.19, upper: 0.195, lower: 0.215, radius: 0.052 }, // upper+lower = 髋高，静止时腿伸直
    tail: { pos: [0, 0.06, -0.46] },
    walk: { speed: 0.48, stride: 0.44, duty: 0.62, stepHeight: 0.08 },
    jump: { period: 1.25, height: 0.55 },
    selection: { color: '#ff8a3d', size: [0.92, 1.2, 1.55], center: [0, 0.6, 0.1] },
  });
  const ACTIONS = (R.SHEEP_ACTIONS = ['Idle', 'Graze', 'Walk', 'Jump']);
  const ACTION_FN = { Idle: '_idle', Graze: '_graze', Walk: '_walk', Jump: '_jump' };

  /* ---------------------------- 几何工具 ---------------------------- */
  // 所有部件共用一个“顶点色 + 平面着色”材质，颜色写在几何体里
  const partMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.96, metalness: 0 });
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
  const _v = new THREE.Vector3(), _s = new THREE.Vector3();
  const sphereCache = {};
  function unitSphere(detail) {
    return (sphereCache[detail] ||= new THREE.IcosahedronGeometry(1, detail));
  }

  /** 由一组椭球“团块”合成一个几何体：{p:[x,y,z], s:r 或 [sx,sy,sz], c:颜色, rot?:[x,y,z], d?:细分} */
  function blobGeometry(list) {
    let total = 0;
    for (const b of list) total += unitSphere(b.d ?? 1).attributes.position.count;
    const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
    const c = new THREE.Color();
    let o = 0;
    for (const b of list) {
      const base = unitSphere(b.d ?? 1).attributes.position;
      const sc = Array.isArray(b.s) ? b.s : [b.s, b.s, b.s];
      _m.compose(_v.set(b.p[0], b.p[1], b.p[2]), _q.setFromEuler(_e.set(...(b.rot || [0, 0, 0]))), _s.set(sc[0], sc[1], sc[2]));
      c.set(b.c);
      for (let i = 0; i < base.count; i++, o++) {
        _v.fromBufferAttribute(base, i).applyMatrix4(_m);
        pos[o * 3] = _v.x; pos[o * 3 + 1] = _v.y; pos[o * 3 + 2] = _v.z;
        col[o * 3] = c.r; col[o * 3 + 1] = c.g; col[o * 3 + 2] = c.b;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }

  /** 合并若干非索引几何并赋颜色 */
  function mergeColored(parts) {
    const geos = parts.map(({ geo, color }) => {
      const g = geo.index ? geo.toNonIndexed() : geo.clone();
      const n = g.attributes.position.count, c = new THREE.Color(color), arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
      return g;
    });
    let total = 0;
    for (const g of geos) total += g.attributes.position.count;
    const pos = new Float32Array(total * 3), col = new Float32Array(total * 3);
    let o = 0;
    for (const g of geos) {
      pos.set(g.attributes.position.array, o * 3);
      col.set(g.attributes.color.array, o * 3);
      o += g.attributes.position.count;
      g.dispose();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    out.computeVertexNormals();
    return out;
  }

  /* ---------------------------- 共享几何（腿/选中框/阴影） ---------------------------- */
  let shared = null;
  function getShared() {
    if (shared) return shared;
    const L = P.legs, C = P.colors, r = L.radius;
    const upper = new THREE.CylinderGeometry(r * 1.12, r, L.upper, 6, 1).translate(0, -L.upper / 2, 0);
    const kneeBall = new THREE.IcosahedronGeometry(r * 1.02, 0);
    const shin = new THREE.CylinderGeometry(r * 0.95, r * 0.85, L.lower - 0.055, 6, 1).translate(0, -(L.lower - 0.055) / 2, 0);
    const hoof = new THREE.CylinderGeometry(r * 0.95, r * 1.12, 0.055, 6, 1).translate(0, -L.lower + 0.0275, 0);
    const upperGeo = mergeColored([{ geo: upper, color: C.leg }]);
    const lowerGeo = mergeColored([{ geo: kneeBall, color: C.leg }, { geo: shin, color: C.leg }, { geo: hoof, color: C.hoof }]);

    // 选中框：12 条棱的角标 + 淡色完整棱线
    const S = P.selection, [w, h, d] = S.size, t = 0.024, Lc = 0.2;
    const bars = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const cx = (sx * w) / 2, cy = (sy * h) / 2, cz = (sz * d) / 2;
      bars.push(new THREE.BoxGeometry(Lc, t, t).translate(cx - (sx * Lc) / 2, cy, cz));
      bars.push(new THREE.BoxGeometry(t, Lc, t).translate(cx, cy - (sy * Lc) / 2, cz));
      bars.push(new THREE.BoxGeometry(t, t, Lc).translate(cx, cy, cz - (sz * Lc) / 2));
    }
    const bracketGeo = mergeColored(bars.map((g) => ({ geo: g, color: '#ffffff' })));
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
    const selMat = new THREE.MeshBasicMaterial({ color: S.color, toneMapped: false });
    const edgeMat = new THREE.LineBasicMaterial({ color: S.color, transparent: true, opacity: 0.45, toneMapped: false });
    const ringGeo = new THREE.RingGeometry(0.66, 0.74, 48).rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: S.color, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const markerGeo = new THREE.ConeGeometry(0.1, 0.2, 4).rotateX(Math.PI);
    const markerMat = new THREE.MeshBasicMaterial({ color: S.color, toneMapped: false });

    // 接触阴影（柔和径向渐变）
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const ctx = cv.getContext('2d');
    const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,0.55)');
    grd.addColorStop(0.5, 'rgba(0,0,0,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
    const blobTex = new THREE.CanvasTexture(cv);
    const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, color: '#4a3b28', transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });

    const proxyGeo = new THREE.BoxGeometry(0.95, 1.15, 1.5);
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
    shared = { upperGeo, lowerGeo, bracketGeo, edgeGeo, selMat, edgeMat, ringGeo, ringMat, markerGeo, markerMat, blobGeo, blobMat, proxyGeo, proxyMat };
    return shared;
  }

  /* ---------------------------- 姿态（用于动画混合） ---------------------------- */
  const POSE_KEYS = ['lift', 'bodyY', 'pitch', 'roll', 'sx', 'sy', 'neckPitch', 'neckYaw', 'headPitch', 'headRoll', 'earL', 'earR', 'tailY', 'tailX'];
  function makePose() {
    const p = { feet: [[0, 0], [0, 0], [0, 0], [0, 0]] };
    for (const k of POSE_KEYS) p[k] = 0;
    p.sx = p.sy = 1;
    return p;
  }
  function clearPose(p) {
    for (const k of POSE_KEYS) p[k] = 0;
    for (const f of p.feet) { f[0] = 0; f[1] = 0; }
  }
  function restPose(p) {
    clearPose(p);
    p.sx = p.sy = 1;
  }
  function addPose(dst, src, w) {
    for (const k of POSE_KEYS) dst[k] += src[k] * w;
    for (let i = 0; i < 4; i++) { dst.feet[i][0] += src.feet[i][0] * w; dst.feet[i][1] += src.feet[i][1] * w; }
  }
  function mixPose(dst, src, w) {
    for (const k of POSE_KEYS) dst[k] = lerp(dst[k], src[k], w);
    for (let i = 0; i < 4; i++) { dst.feet[i][0] = lerp(dst.feet[i][0], src.feet[i][0], w); dst.feet[i][1] = lerp(dst.feet[i][1], src.feet[i][1], w); }
  }

  // 一次快速的耳朵抖动 / 尾巴摆动（周期性出现）
  function flick(t, period, offset) {
    const u = (((t + offset) % period) + period) % period;
    return u < 0.32 ? Math.sin((u / 0.32) * Math.PI) : 0;
  }
  function wag(t, period, offset) {
    const u = (((t + offset) % period) + period) % period;
    return u < 1.0 ? Math.sin(u * TAU * 4) * (1 - u) : 0;
  }
  const easeOut = (x) => 1 - (1 - x) * (1 - x);
  const easeInOut = (x) => x * x * (3 - 2 * x);

  /* ---------------------------- 绵羊 ---------------------------- */
  let NEXT_ID = 1;
  // 腿的顺序：0 左前，1 右前，2 左后，3 右后
  const LEGS = [
    { side: 1, front: true }, { side: -1, front: true },
    { side: 1, front: false }, { side: -1, front: false },
  ];
  // 行走步态（侧向序列步态：左后→左前→右后→右前）
  const GAIT_OFFSET = [0.25, 0.75, 0.0, 0.5];

  class Sheep {
    constructor(opts = {}) {
      this.id = NEXT_ID++;
      this.seed = opts.seed ?? Math.floor(Math.random() * 1e9);
      this.size = opts.size ?? 1;
      const rng = mulberry32(this.seed);
      this.phaseSeed = rng() * 100;
      this.turnPref = rng() < 0.5 ? -1 : 1;

      this.root = new THREE.Group();
      this.root.name = 'sheep-' + this.id;
      this.root.userData.sheep = this;
      this.root.scale.setScalar(this.size);
      this.lift = new THREE.Group();
      this.root.add(this.lift);
      this._build(rng);

      this.heading = this.headingTarget = opts.heading ?? 0;
      this.root.rotation.y = this.heading;
      this.time = rng() * 20;
      this.walkPhase = rng();
      this.jumpPhase = 0;
      this.grazeT = rng() * 5;
      this.action = ACTIONS.includes(opts.action) ? opts.action : 'Idle';
      this.weights = {};
      for (const a of ACTIONS) this.weights[a] = a === this.action ? 1 : 0;
      this.walkSpeed = P.walk.speed;
      this.dragging = false;
      this.dragW = 0;
      this.impact = 0;
      this.vel = new THREE.Vector2();
      this._prev = new THREE.Vector2();
      this.pose = makePose();
      this._tmp = makePose();
      this.selected = false;
      if (opts.position) this.setPosition(opts.position.x, opts.position.z);
      this._prev.set(this.root.position.x, this.root.position.z);
    }

    /* ---------- 建模 ---------- */
    _build(rng) {
      const B = P.body, W = P.wool, C = P.colors, sh = getShared();
      this.body = new THREE.Group();
      this.body.position.y = B.y;
      this.lift.add(this.body);

      // 身体羊毛：核心椭球 + 分布在椭球表面的羊毛团（斐波那契分布）
      const puffs = [{ p: [0, 0, 0], s: [B.rx - 0.07, B.ry - 0.07, B.rz - 0.07], c: C.wool }];
      const shade = new THREE.Color(C.wool), shadeB = new THREE.Color(C.woolShade);
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < W.puffs; i++) {
        const y = 1 - (2 * (i + 0.5)) / W.puffs;
        const rr = Math.sqrt(1 - y * y), a = i * golden + rng() * 0.4;
        const dx = Math.cos(a) * rr, dz = Math.sin(a) * rr;
        const r = lerp(W.minR, W.maxR, rng()) * (y < -0.55 ? 0.8 : 1);
        const k = 0.86;
        const c = shade.clone().lerp(shadeB, clamp(rng() * 0.45 + (y < -0.2 ? 0.35 : 0), 0, 1));
        puffs.push({ p: [dx * (B.rx - r * k), y * (B.ry - r * k), dz * (B.rz - r * k)], s: r, c });
      }
      this.wool = new THREE.Mesh(blobGeometry(puffs), partMat);
      this.wool.castShadow = true;
      this.wool.receiveShadow = true;
      this.body.add(this.wool);

      // 颈部（羊毛）
      const N = P.neck, na = N.angle;
      this.neckPivot = new THREE.Group();
      this.neckPivot.position.set(...N.base);
      this.neckPivot.rotation.order = 'YXZ';
      this.body.add(this.neckPivot);
      const nd = [0, Math.sin(na), Math.cos(na)];
      const neckPuffs = [[0.05, 0.17], [0.45, 0.15], [0.82, 0.13]].map(([t, r], i) => ({
        p: [0, nd[1] * N.length * t, nd[2] * N.length * t - 0.02], s: [r, r * 1.05, r], c: i === 2 ? C.wool : shade.clone().lerp(shadeB, 0.2),
      }));
      this.neck = new THREE.Mesh(blobGeometry(neckPuffs), partMat);
      this.neck.castShadow = true;
      this.neckPivot.add(this.neck);

      // 头部：深色头骨 + 口鼻 + 眼睛 + 头顶羊毛
      this.headPivot = new THREE.Group();
      this.headPivot.position.set(0, nd[1] * N.length, nd[2] * N.length);
      this.neckPivot.add(this.headPivot);
      const head = [
        { p: [0, 0.01, 0.06], s: [0.12, 0.125, 0.14], c: C.face },
        { p: [0, -0.035, 0.16], s: [0.08, 0.08, 0.11], c: C.face },
        { p: [0.095, 0.035, 0.115], s: 0.028, c: C.eye, d: 1 },
        { p: [-0.095, 0.035, 0.115], s: 0.028, c: C.eye, d: 1 },
        { p: [0.109, 0.037, 0.125], s: 0.017, c: C.pupil, d: 1 },
        { p: [-0.109, 0.037, 0.125], s: 0.017, c: C.pupil, d: 1 },
        { p: [0, 0.118, 0.03], s: 0.078, c: C.wool },
        { p: [0.05, 0.1, -0.01], s: 0.064, c: C.wool },
        { p: [-0.05, 0.1, -0.01], s: 0.064, c: C.wool },
        { p: [0, 0.095, 0.095], s: 0.052, c: C.wool },
      ];
      this.head = new THREE.Mesh(blobGeometry(head), partMat);
      this.head.castShadow = true;
      this.headPivot.add(this.head);

      // 耳朵
      const earGeo = blobGeometry([{ p: [0.085, 0, 0], s: [0.09, 0.03, 0.05], c: C.face, d: 1 }]);
      this.ears = [1, -1].map((side) => {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.1, 0.06, 0.02);
        const m = new THREE.Mesh(earGeo, partMat);
        m.scale.x = side;
        m.castShadow = true;
        pivot.add(m);
        this.headPivot.add(pivot);
        return pivot;
      });
      this._earGeo = earGeo;

      // 尾巴
      this.tailPivot = new THREE.Group();
      this.tailPivot.position.set(...P.tail.pos);
      this.body.add(this.tailPivot);
      this.tail = new THREE.Mesh(blobGeometry([
        { p: [0, -0.03, -0.04], s: [0.075, 0.09, 0.07], c: C.wool },
        { p: [0, -0.09, -0.05], s: 0.055, c: C.woolShade },
      ]), partMat);
      this.tail.castShadow = true;
      this.tailPivot.add(this.tail);

      // 腿：hip → upper → knee → lower(+蹄)
      const L = P.legs;
      this.legs = LEGS.map((cfg) => {
        const hip = new THREE.Group();
        const z = cfg.front ? L.frontZ : L.backZ;
        hip.position.set(cfg.side * L.hipX, L.hipY, z);
        const up = new THREE.Mesh(sh.upperGeo, partMat);
        up.castShadow = true;
        hip.add(up);
        const knee = new THREE.Group();
        knee.position.y = -L.upper;
        const low = new THREE.Mesh(sh.lowerGeo, partMat);
        low.castShadow = true;
        knee.add(low);
        hip.add(knee);
        this.body.add(hip);
        return { hip, knee, x: cfg.side * L.hipX, z, front: cfg.front };
      });

      // 接触阴影
      this.blob = new THREE.Mesh(sh.blobGeo, sh.blobMat);
      this.blob.scale.set(1.0, 1, 1.55);
      this.blob.position.set(0, 0.03, 0.04);
      this.blob.renderOrder = 1;
      this.root.add(this.blob);

      // 拾取代理（不可见，比模型略大，方便点击与触控）
      this.proxy = new THREE.Mesh(sh.proxyGeo, sh.proxyMat);
      this.proxy.position.set(0, 0.57, 0.1);
      this.proxy.userData.sheep = this;
      this.lift.add(this.proxy);

      // 选中框 + 地面光圈 + 指示标
      const S = P.selection;
      this.selBox = new THREE.Group();
      this.selBox.position.set(...S.center);
      this.selBox.add(new THREE.Mesh(sh.bracketGeo, sh.selMat));
      this.selBox.add(new THREE.LineSegments(sh.edgeGeo, sh.edgeMat));
      this.marker = new THREE.Mesh(sh.markerGeo, sh.markerMat);
      this.marker.position.y = S.size[1] / 2 + 0.32;
      this.selBox.add(this.marker);
      this.selBox.visible = false;
      this.lift.add(this.selBox);
      this.ring = new THREE.Mesh(sh.ringGeo, sh.ringMat);
      this.ring.position.y = 0.04;
      this.ring.scale.set(1, 1, 1.25);
      this.ring.visible = false;
      this.ring.renderOrder = 2;
      this.root.add(this.ring);
    }

    /* ---------- 公共接口 ---------- */
    get position() { return this.root.position; }
    setPosition(x, z) { this.root.position.x = x; this.root.position.z = z; }
    setAction(name) {
      if (!ACTIONS.includes(name) || name === this.action) return;
      if (name === 'Jump' && this.weights.Jump < 0.2) this.jumpPhase = 0;
      if (name === 'Graze' && this.weights.Graze < 0.2) this.grazeT = 0;
      this.action = name;
    }
    rotateBy(delta) { this.headingTarget += delta; }
    setHeading(rad) { this.headingTarget = this.heading + wrapAngle(rad - this.heading); }
    get headingDeg() { return Math.round((((this.headingTarget * 180) / Math.PI) % 360 + 360) % 360) % 360; }
    setSelected(v) {
      this.selected = v;
      this.selBox.visible = v;
      this.ring.visible = v;
    }
    beginDrag() { this.dragging = true; }
    endDrag() { this.dragging = false; this._dropping = true; }
    toJSON() {
      return { seed: this.seed, size: this.size, action: this.action, heading: this.headingTarget, position: { x: this.root.position.x, z: this.root.position.z } };
    }
    dispose() {
      this.root.removeFromParent();
      this.wool.geometry.dispose();
      this.neck.geometry.dispose();
      this.head.geometry.dispose();
      this.tail.geometry.dispose();
      this._earGeo.dispose();
    }

    /* ---------- 动画：每个动作生成一个姿态 ---------- */
    _idle(p, t) {
      const s = this.phaseSeed;
      restPose(p);
      p.bodyY = 0.004 * Math.sin(t * 1.9);
      p.sy = 1 + 0.016 * Math.sin(t * 1.9);                   // 呼吸
      p.sx = 1 + 0.008 * Math.sin(t * 1.9 + 0.4);
      p.roll = 0.018 * Math.sin(t * 0.41 + s);                // 重心轻移
      p.neckYaw = 0.38 * Math.sin(t * 0.33 + s) + 0.16 * Math.sin(t * 0.87 + s * 1.7); // 左顾右盼
      p.neckPitch = 0.08 * Math.sin(t * 0.27 + s * 2.3) - 0.02;
      p.headPitch = 0.05 * Math.sin(t * 0.61 + s);
      p.headRoll = 0.07 * Math.sin(t * 0.47 + s * 0.6);
      p.earL = 0.5 * flick(t, 3.3, s);
      p.earR = 0.5 * flick(t, 4.1, s + 1.3);
      p.tailY = 0.4 * wag(t, 5.2, s);
      p.feet[3][0] = 0.02;
    }

    _graze(p, t) {
      const s = this.phaseSeed;
      restPose(p);
      const cyc = 8.0, u = this.grazeT % cyc;
      // 大部分时间低头啃草，约 5.6s~7.4s 抬头咀嚼
      const up = smoothstep(5.1, 5.8, u) * (1 - smoothstep(7.2, 7.95, u));
      const down = 1 - up;
      const nib = Math.pow(Math.max(0, Math.sin(t * TAU * 2.1)), 2);
      const tug = 0.5 + 0.5 * Math.sin(t * 0.9 + s);
      p.neckPitch = lerp(0.08, 1.95, down);
      p.headPitch = lerp(0.05, -0.92, down) + down * (0.13 * nib * tug);
      p.neckYaw = down * (0.12 * Math.sin(t * 0.55 + s) + 0.03 * Math.sin(t * TAU * 1.05)) + up * 0.14 * Math.sin(t * 0.6 + s);
      p.headRoll = up * 0.07 * Math.sin(t * TAU * 1.8);    // 抬头时左右咀嚼
      p.headPitch += up * 0.03 * Math.sin(t * TAU * 1.8);
      p.pitch = 0.1 * down;
      p.bodyY = -0.015 * down;
      p.sy = 1 + 0.012 * Math.sin(t * 1.7);
      p.sx = 1;
      p.feet[0][0] = 0.06 * down;
      p.feet[1][0] = -0.015;
      p.earL = -0.12 + 0.45 * flick(t, 3.9, s);
      p.earR = -0.12 + 0.45 * flick(t, 4.6, s + 2);
      p.tailY = 0.35 * wag(t, 4.4, s + 0.7);
    }

    _walk(p, t) {
      const W = P.walk;
      restPose(p);
      const ph = this.walkPhase;
      const S = W.stride * W.duty;
      for (let i = 0; i < 4; i++) {
        const f = (((ph + GAIT_OFFSET[i]) % 1) + 1) % 1;
        let dz, dy;
        if (f < W.duty) {                       // 支撑相：脚掌贴地向后
          const k = f / W.duty;
          dz = S / 2 - S * k;
          dy = 0;
        } else {                                // 摆动相：抬脚向前
          const k = (f - W.duty) / (1 - W.duty);
          dz = -S / 2 + S * (0.5 - 0.5 * Math.cos(Math.PI * k));
          dy = W.stepHeight * Math.sin(Math.PI * k) * (this.legs[i].front ? 1.1 : 0.9);
        }
        p.feet[i][0] = dz;
        p.feet[i][1] = dy;
      }
      const c = ph * TAU;
      p.bodyY = -0.012 + 0.008 * Math.cos(2 * c);
      p.roll = 0.03 * Math.sin(c);
      p.pitch = 0.015 * Math.sin(2 * c + 0.6);
      p.neckPitch = 0.22 + 0.05 * Math.sin(2 * c + 0.8);
      p.headPitch = 0.02;
      p.neckYaw = 0.05 * Math.sin(c) + 0.1 * Math.sin(t * 0.3 + this.phaseSeed);
      p.tailY = 0.16 * Math.sin(c + 1.0);
      p.earL = 0.06 * Math.sin(2 * c);
      p.earR = 0.06 * Math.sin(2 * c + 0.5);
      p.sy = 1 + 0.01 * Math.sin(2 * c);
    }

    _jump(p) {
      const J = P.jump;
      restPose(p);
      const x = this.jumpPhase;
      const crouchEnd = 0.22, takeoff = 0.3, land = 0.72, absorb = 0.84;
      let tuck = 0;
      if (x < crouchEnd) {                       // 下蹲蓄力
        const c = easeInOut(x / crouchEnd);
        p.bodyY = -0.09 * c; p.sy = 1 - 0.07 * c; p.pitch = -0.04 * c; p.neckPitch = 0.28 * c;
        p.earL = p.earR = -0.1 * c; p.tailX = 0.1 * c;
      } else if (x < takeoff) {                  // 蹬地
        const k = (x - crouchEnd) / (takeoff - crouchEnd);
        p.bodyY = lerp(-0.09, 0.03, easeOut(k)); p.sy = lerp(0.93, 1.07, k);
        p.pitch = lerp(-0.04, -0.17, k); p.neckPitch = lerp(0.28, -0.25, k);
        p.earL = p.earR = lerp(-0.1, -0.35, k); p.tailX = lerp(0.1, -0.5, k);
      } else if (x < land) {                     // 腾空：抛物线 + 收腿 + 身体由抬头转为前倾
        const s = (x - takeoff) / (land - takeoff);
        p.lift = J.height * 4 * s * (1 - s);
        p.bodyY = 0.03 * (1 - s);
        p.sy = lerp(1.07, 1.0, Math.min(1, s * 2));
        p.pitch = lerp(-0.17, 0.14, easeInOut(s));
        p.neckPitch = lerp(-0.25, 0.12, s);
        tuck = Math.pow(Math.sin(Math.PI * s), 0.8);
        const vy = 1 - 2 * s;                    // 竖直速度（归一化），耳朵随惯性上下翻
        p.earL = p.earR = -0.35 * vy + 0.1;
        p.tailX = -0.5 * tuck;
      } else if (x < absorb) {                   // 落地缓冲
        const k = easeOut((x - land) / (absorb - land));
        p.bodyY = -0.085 * k; p.sy = 1 - 0.09 * k; p.pitch = lerp(0.14, 0.05, k);
        p.neckPitch = lerp(0.12, 0.25, k);
        p.earL = p.earR = lerp(0.45, 0.0, k) - 0.1;
        p.tailX = -0.1 * (1 - k);
      } else {                                   // 恢复站姿
        const k = easeInOut((x - absorb) / (1 - absorb));
        p.bodyY = lerp(-0.085, 0, k); p.sy = lerp(0.91, 1, k); p.pitch = lerp(0.05, 0, k);
        p.neckPitch = lerp(0.25, 0, k);
        p.earL = p.earR = lerp(-0.1, 0, k);
      }
      p.sx = 1 / Math.sqrt(p.sy);
      for (let i = 0; i < 4; i++) {
        const front = this.legs[i].front;
        p.feet[i][0] = (front ? -0.075 : 0.085) * tuck;
        p.feet[i][1] = (front ? 0.19 : 0.15) * tuck;
      }
    }

    _carried(p, t) {                            // 被拖动时：提起、腿自然下垂并随移动摆动
      restPose(p);
      const h = this.heading, ch = Math.cos(h), sh = Math.sin(h);
      const vf = this.vel.x * sh + this.vel.y * ch;     // 前后速度
      const vs = this.vel.x * ch - this.vel.y * sh;     // 侧向速度
      p.lift = 0.5 + 0.02 * Math.sin(t * 5);
      p.pitch = clamp(vf * 0.04, -0.3, 0.3);
      p.roll = clamp(-vs * 0.04, -0.3, 0.3);
      const swing = clamp(-vf * 0.035, -0.12, 0.12);
      for (let i = 0; i < 4; i++) {
        p.feet[i][0] = swing + 0.025 * Math.sin(t * 6 + i * 1.7);
        p.feet[i][1] = -0.05;
      }
      p.neckPitch = 0.3; p.headPitch = 0.15;
      p.neckYaw = 0.15 * Math.sin(t * 2.3);
      p.earL = 0.35 + 0.12 * Math.sin(t * 9);
      p.earR = 0.35 + 0.12 * Math.sin(t * 9 + 1);
      p.tailY = 0.45 * Math.sin(t * 11);
      p.sy = 1.03; p.sx = 0.985;
    }

    /* ---------- 行走转向：随机漫游 + 避开河流/边界/树木/其他羊 ---------- */
    _steer(dt, ctx, ww) {
      const Wd = ctx.world, pos = this.root.position, s = this.phaseSeed;
      const h = this.heading, fx = Math.sin(h), fz = Math.cos(h);
      let turn = 0.32 * Math.sin(this.time * 0.21 + s * 3.1) + 0.2 * Math.sin(this.time * 0.53 + s * 7.7);
      let speedMul = 1;
      const look = 1.5 * this.size + 0.4;
      if (!Wd.isWalkable(pos.x + fx * look, pos.z + fz * look, 0.05)) {
        let found = 0;
        outer: for (const off of [0.5, 1.0, 1.5, 2.0, 2.6, Math.PI]) {
          for (const sg of [this.turnPref, -this.turnPref]) {
            const hh = h + off * sg;
            if (Wd.isWalkable(pos.x + Math.sin(hh) * look, pos.z + Math.cos(hh) * look, 0.05)) { found = off * sg; break outer; }
          }
        }
        turn = found ? Math.sign(found) * (1.0 + Math.abs(found) * 0.45) : 1.8 * this.turnPref;
        speedMul = found && Math.abs(found) < 1.1 ? 0.75 : 0.4;
      } else if (Math.random() < dt * 0.04) {
        this.turnPref *= -1;
      }
      for (const o of ctx.flock) {
        if (o === this || o.dragging) continue;
        const dx = o.root.position.x - pos.x, dz = o.root.position.z - pos.z;
        const d2 = dx * dx + dz * dz, R0 = 1.5 * (this.size + o.size) * 0.5;
        if (d2 < R0 * R0 && d2 > 1e-6) {
          const d = Math.sqrt(d2), ahead = (dx * fx + dz * fz) / d;
          if (ahead > 0.1) {
            const side = fx * dz - fz * dx;
            turn += (side > 0 ? 1 : -1) * 1.6 * (1 - d / R0) * ahead;
            speedMul = Math.min(speedMul, 0.45 + 0.55 * (d / R0));
          }
        }
      }
      this.headingTarget += turn * dt * ww;
      this.walkSpeed = P.walk.speed * speedMul;
      const sp = this.walkSpeed * this.size * ww * dt;
      const nx = pos.x + fx * sp, nz = pos.z + fz * sp;
      if (Wd.isWalkable(nx, nz, -0.3)) { pos.x = nx; pos.z = nz; } else { this.headingTarget += 2.0 * dt * this.turnPref; }

      // 轻量碰撞分离，避免羊只互相穿插
      for (const o of ctx.flock) {
        if (o === this || o.dragging) continue;
        const dx = pos.x - o.root.position.x, dz = pos.z - o.root.position.z;
        const minD = 0.82 * (this.size + o.size) * 0.5;
        const d2 = dx * dx + dz * dz;
        if (d2 < minD * minD && d2 > 1e-8) {
          const d = Math.sqrt(d2), push = (minD - d) * (o.weights.Walk > 0.5 ? 0.5 : 1);
          const px = pos.x + (dx / d) * push, pz = pos.z + (dz / d) * push;
          if (Wd.isWalkable(px, pz, -0.3)) { pos.x = px; pos.z = pz; }
        }
      }
    }

    /* ---------- 每帧更新 ---------- */
    update(dt, ctx) {
      this.time += dt;
      const t = this.time;

      // 动作权重平滑过渡（约 0.3s）
      const k = 1 - Math.exp(-dt * 7);
      let sum = 0;
      for (const a of ACTIONS) { this.weights[a] += ((a === this.action ? 1 : 0) - this.weights[a]) * k; sum += this.weights[a]; }
      for (const a of ACTIONS) this.weights[a] /= sum;
      const prevDragW = this.dragW;
      this.dragW += ((this.dragging ? 1 : 0) - this.dragW) * (1 - Math.exp(-dt * 10));
      if (this._dropping && prevDragW > 0.12 && this.dragW <= 0.12) { this.impact = 1; this._dropping = false; }
      this.impact = Math.max(0, this.impact - dt * 3.2);

      // 计时器
      if (this.weights.Graze > 0.001) this.grazeT += dt;
      if (this.action === 'Jump' || this.weights.Jump > 0.001) this.jumpPhase = (this.jumpPhase + dt / P.jump.period) % 1;
      const ww = this.weights.Walk * (1 - this.dragW);
      if (ww > 0.01) this._steer(dt, ctx, ww); else this.walkSpeed = P.walk.speed;
      this.walkPhase = (this.walkPhase + (dt * this.walkSpeed) / P.walk.stride) % 1;

      // 朝向缓动
      const dh = wrapAngle(this.headingTarget - this.heading);
      this.heading += dh * (1 - Math.exp(-dt * 9));
      this.root.rotation.y = this.heading;

      // 速度（用于拖动时的摆动）
      const pos = this.root.position;
      if (dt > 0) {
        const vx = (pos.x - this._prev.x) / dt, vz = (pos.z - this._prev.y) / dt;
        const kv = 1 - Math.exp(-dt * 8);
        this.vel.x += (vx - this.vel.x) * kv;
        this.vel.y += (vz - this.vel.y) * kv;
      }
      this._prev.set(pos.x, pos.z);
      pos.y = ctx.world.heightAt(pos.x, pos.z);

      // 混合各动作姿态
      const pose = this.pose, tmp = this._tmp;
      clearPose(pose);
      for (const a of ACTIONS) {
        const w = this.weights[a];
        if (w < 0.001) continue;
        this[ACTION_FN[a]](tmp, t);
        addPose(pose, tmp, w);
      }
      if (this.dragW > 0.001) { this._carried(tmp, t); mixPose(pose, tmp, this.dragW); }
      if (this.impact > 0) {
        const im = Math.sin(this.impact * Math.PI) * this.impact;
        pose.bodyY -= 0.06 * im; pose.sy -= 0.08 * im; pose.sx += 0.04 * im;
      }
      this._applyPose(pose);

      // 选中效果动画
      if (this.selected) {
        const pulse = 1 + 0.06 * Math.sin(t * 4.5);
        this.ring.scale.set(pulse, 1, 1.25 * pulse);
        this.marker.position.y = P.selection.size[1] / 2 + 0.3 + 0.06 * Math.sin(t * 3.2);
        this.marker.rotation.y = t * 1.6;
      }
    }

    _applyPose(p) {
      const B = P.body, L = P.legs;
      this.lift.position.y = p.lift;
      this.body.position.y = B.y + p.bodyY;
      this.body.rotation.set(p.pitch, 0, p.roll);
      this.wool.scale.set(p.sx, p.sy, p.sx);
      this.neckPivot.rotation.set(p.neckPitch, p.neckYaw, 0);
      this.headPivot.rotation.set(P.head.rest + p.headPitch, 0, p.headRoll);
      this.ears[0].rotation.z = -0.38 + p.earL;
      this.ears[1].rotation.z = 0.38 - p.earR;
      this.tailPivot.rotation.set(-0.35 + p.tailX, p.tailY, 0);

      const sl = clamp(1 - p.lift * 1.1, 0.35, 1);
      this.blob.scale.set(1.0 * sl, 1, 1.55 * sl);

      // 两骨骼 IK（矢状面），在 lift 坐标系中求解
      const cp = Math.cos(p.pitch), sp = Math.sin(p.pitch);
      const bodyY = B.y + p.bodyY;
      const l1 = L.upper, l2 = L.lower;
      for (let i = 0; i < 4; i++) {
        const leg = this.legs[i];
        const hipY = bodyY + L.hipY * cp - leg.z * sp;
        const hipZ = L.hipY * sp + leg.z * cp;
        const footZ = leg.z + p.feet[i][0];
        const footY = p.feet[i][1];
        const vz = footZ - hipZ, vy = footY - hipY;
        const D = clamp(Math.hypot(vz, vy), Math.abs(l1 - l2) + 0.02, l1 + l2 - 0.0008);
        const a = Math.atan2(-vz, -vy);
        const cosB = clamp((l1 * l1 + D * D - l2 * l2) / (2 * l1 * D), -1, 1);
        const beta = Math.acos(cosB);
        const sgn = leg.front ? 1 : -1;          // 前腿腕关节朝前，后腿跗关节朝后
        const u = a - sgn * beta;
        const kz = hipZ - l1 * Math.sin(u), ky = hipY - l1 * Math.cos(u);
        const w = Math.atan2(-(footZ - kz), -(footY - ky));
        leg.hip.rotation.x = u - p.pitch;
        leg.knee.rotation.x = w - u;
      }
    }
  }

  R.Sheep = Sheep;
})();
