/* =========================================================================
 * world.js — 程序化低多边形牧场
 * 方形微缩草地、左侧蜿蜒河流（带纵向流动高光）、右侧浅黄色弯曲小路、
 * 圆冠绿树、一棵粉紫色树、细小草叶与石头。
 * 所有几何体均由代码生成，可通过 RANCH.WORLD_CONFIG 调整。
 * ========================================================================= */
(function () {
  'use strict';
  const THREE = window.THREE;
  const R = (window.RANCH = window.RANCH || {});

  /* ---------------------------- 工具函数 ---------------------------- */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const wrapAngle = (a) => {
    a = (a + Math.PI) % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return a - Math.PI;
  };
  R.util = { mulberry32, clamp, lerp, smoothstep, wrapAngle };

  /* ---------------------------- 可编辑配置 ---------------------------- */
  const CFG = (R.WORLD_CONFIG = {
    half: 18,          // 草地半边长（草地为 36 x 36）
    thickness: 1.5,    // 底座厚度
    lipDepth: 0.26,    // 侧面草皮层厚度
    grid: 90,          // 地形网格细分
    seed: 1105,
    bumpAmp: 0.075,    // 草地起伏幅度
    river: {
      baseX: -11.4,
      waves: [[2.1, 0.19, 0.6], [0.75, 0.44, 2.2]], // [振幅, 频率, 相位]
      halfWidth: 1.6, widthVar: 0.16, bank: 1.3,
      waterY: -0.3, bedY: -0.92,
    },
    path: {
      baseX: 10.6,
      waves: [[2.0, 0.16, 1.3], [0.7, 0.38, 0.2]],
      halfWidth: 0.82, widthVar: 0.14, y: 0.03, flatten: 1.0,
    },
    grassTufts: 2200,
    colors: {
      grassA: '#9ccb66', grassB: '#b2d97b', pathTint: '#c3d985',
      bank: '#bcd27f', sand: '#e8d9ab', bed: '#cfc39a',
      lip: '#b4d982', soilTop: '#eddbb2', soil: '#e5d0a4',
      waterDeep: '#3f98d6', waterShallow: '#8fd2f2', waterHighlight: '#ffffff', waterCap: '#5aaee2',
      path: '#f3e2a4', pathEdge: '#e2dc98',
      trunk: '#a87e59',
      crowns: ['#6cb65a', '#7ec468', '#5eaa52', '#8bcb70'],
      pinkCrowns: ['#d9a2dc', '#e6b9e8', '#c994d6'],
      blades: ['#86bb55', '#94c65f', '#a5d16c', '#7bb04e', '#b2d877'],
      petals: ['#f0c6ee', '#e3aee6', '#f6d9f3'],
      rock: '#d9d2c5',
    },
  });

  /* ---------------------------- 曲线与高度场 ---------------------------- */
  function curveX(c, z) {
    let x = c.baseX;
    for (const [a, f, p] of c.waves) x += a * Math.sin(z * f + p);
    return x;
  }
  function curveSlope(c, z) {
    let s = 0;
    for (const [a, f, p] of c.waves) s += a * f * Math.cos(z * f + p);
    return s;
  }
  const riverX = (z) => curveX(CFG.river, z);
  const pathX = (z) => curveX(CFG.path, z);
  const riverHalf = (z) => CFG.river.halfWidth * (1 + CFG.river.widthVar * Math.sin(z * 0.52 + 0.7));
  const pathHalf = (z) => CFG.path.halfWidth * (1 + CFG.path.widthVar * Math.sin(z * 0.83 + 0.2));
  function perpDist(c, x, z) {
    const s = curveSlope(c, z);
    return Math.abs(x - curveX(c, z)) / Math.sqrt(1 + s * s);
  }
  const riverDist = (x, z) => perpDist(CFG.river, x, z);
  const pathDist = (x, z) => perpDist(CFG.path, x, z);

  // 河道剖面：t = smoothstep(hw*0.2, hw+bank, d)，高度 = lerp(河床, 地面, t)
  // 求出水面与河岸交汇处（可见水边）的归一化位置
  const EDGE_U = (() => {
    const rv = CFG.river;
    const target = (rv.waterY - rv.bedY) / (0 - rv.bedY);
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      if (m * m * (3 - 2 * m) < target) lo = m; else hi = m;
    }
    return (lo + hi) / 2;
  })();
  function riverEdge(z) {
    const hw = riverHalf(z);
    const a = hw * 0.2, b = hw + CFG.river.bank;
    return a + EDGE_U * (b - a);
  }

  function bumps(x, z) {
    return CFG.bumpAmp * (Math.sin(x * 0.73 + z * 0.31) * Math.cos(z * 0.67 - x * 0.22) +
      0.6 * Math.sin(x * 1.71 + 1.3) * Math.sin(z * 1.53 + 0.4)) +
      0.09 * Math.sin(x * 0.21 + 0.5) * Math.cos(z * 0.18 + 1.1);
  }

  function heightAt(x, z) {
    const rv = CFG.river, pc = CFG.path;
    const hw = riverHalf(z), dr = riverDist(x, z);
    const ph = pathHalf(z), dp = pathDist(x, z);
    let h = bumps(x, z);
    h *= smoothstep(ph + 0.1, ph + pc.flatten, dp);                       // 小路处压平
    h *= lerp(0.25, 1, smoothstep(hw + rv.bank, hw + rv.bank + 2.5, dr));  // 河岸附近起伏减弱
    const t = smoothstep(hw * 0.2, hw + rv.bank, dr);
    return lerp(rv.bedY, h, t);
  }

  /* ---------------------------- 可行走区域 ---------------------------- */
  const obstacles = []; // {x, z, r}
  const SHEEP_MARGIN = 0.9;
  function isWalkable(x, z, margin = 0) {
    const lim = CFG.half - SHEEP_MARGIN - margin;
    if (Math.abs(x) > lim || Math.abs(z) > lim) return false;
    if (riverDist(x, z) < riverEdge(z) + 0.55 + margin) return false;
    for (const o of obstacles) {
      const dx = x - o.x, dz = z - o.z, r = o.r + 0.4 + margin;
      if (dx * dx + dz * dz < r * r) return false;
    }
    return true;
  }
  // 把任意位置约束到可放置羊的位置（拖拽、复制时使用）
  function constrain(x, z) {
    const lim = CFG.half - SHEEP_MARGIN;
    for (let it = 0; it < 4; it++) {
      x = clamp(x, -lim, lim);
      z = clamp(z, -lim, lim);
      const need = riverEdge(z) + 0.6;
      const s = curveSlope(CFG.river, z), k = Math.sqrt(1 + s * s);
      const rx = riverX(z);
      if (Math.abs(x - rx) / k < need) {
        const side = x >= rx ? 1 : -1;
        x = rx + side * need * k;
        if (Math.abs(x) > lim) x = rx - side * need * k;
      }
      for (const o of obstacles) {
        const dx = x - o.x, dz = z - o.z, r = o.r + 0.42;
        const d2 = dx * dx + dz * dz;
        if (d2 < r * r) {
          const d = Math.sqrt(d2) || 1e-3;
          x = o.x + (dx / d) * r;
          z = o.z + (dz / d) * r;
        }
      }
    }
    return { x: clamp(x, -lim, lim), z: clamp(z, -lim, lim) };
  }

  /* ---------------------------- 材质缓存 ---------------------------- */
  const matCache = new Map();
  function flatMat(hex, rough = 0.95) {
    const key = hex + '|' + rough;
    if (!matCache.has(key)) {
      matCache.set(key, new THREE.MeshStandardMaterial({ color: hex, flatShading: true, roughness: rough, metalness: 0 }));
    }
    return matCache.get(key);
  }
  const vcMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.96, metalness: 0 });

  function lumpyIco(radius, detail, rng, amt) {
    const g = new THREE.IcosahedronGeometry(radius, detail);
    const p = g.attributes.position;
    const map = new Map();
    for (let i = 0; i < p.count; i++) {
      const key = p.getX(i).toFixed(3) + ',' + p.getY(i).toFixed(3) + ',' + p.getZ(i).toFixed(3);
      if (!map.has(key)) map.set(key, 1 + (rng() - 0.5) * amt);
      const k = map.get(key);
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }

  /* ---------------------------- 地形（草地 + 河道） ---------------------------- */
  function buildTerrain(rng) {
    const N = CFG.grid, H = CFG.half, step = (2 * H) / N, C = CFG.colors, rv = CFG.river;
    const cnt = (N + 1) * (N + 1);
    const vx = new Float32Array(cnt), vy = new Float32Array(cnt), vz = new Float32Array(cnt);
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        let x = -H + i * step, z = -H + j * step;
        if (i > 0 && i < N) x += (rng() - 0.5) * step * 0.55;
        if (j > 0 && j < N) z += (rng() - 0.5) * step * 0.55;
        const k = j * (N + 1) + i;
        vx[k] = x; vz[k] = z; vy[k] = heightAt(x, z);
      }
    }

    const cGrassA = new THREE.Color(C.grassA), cGrassB = new THREE.Color(C.grassB);
    const cPathTint = new THREE.Color(C.pathTint), cBank = new THREE.Color(C.bank);
    const cSand = new THREE.Color(C.sand), cBed = new THREE.Color(C.bed);
    const tmp = new THREE.Color();

    function faceColor(cx, cy, cz) {
      const dr = riverDist(cx, cz);
      if (dr < riverEdge(cz) + rv.bank && cy < -0.05) {
        if (cy < rv.waterY - 0.02) tmp.copy(cBed);
        else tmp.copy(cSand).lerp(cBank, smoothstep(rv.waterY, -0.05, cy));
      } else {
        const n = 0.5 + 0.5 * Math.sin(cx * 0.31 + cz * 0.17) * Math.cos(cz * 0.27 - cx * 0.11);
        tmp.copy(cGrassA).lerp(cGrassB, n * 0.85);
        const ph = pathHalf(cz), dp = pathDist(cx, cz);
        if (dp < ph + 0.7) tmp.lerp(cPathTint, 0.45 * (1 - smoothstep(ph, ph + 0.7, dp)));
      }
      tmp.offsetHSL((rng() - 0.5) * 0.012, (rng() - 0.5) * 0.04, (rng() - 0.5) * 0.04);
      return tmp;
    }

    const pos = [], col = [];
    function tri(a, b, c) {
      pos.push(vx[a], vy[a], vz[a], vx[b], vy[b], vz[b], vx[c], vy[c], vz[c]);
      const fc = faceColor((vx[a] + vx[b] + vx[c]) / 3, (vy[a] + vy[b] + vy[c]) / 3, (vz[a] + vz[b] + vz[c]) / 3);
      for (let q = 0; q < 3; q++) col.push(fc.r, fc.g, fc.b);
    }
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1;
        if ((i + j) & 1) { tri(a, c, b); tri(b, c, d); } else { tri(a, c, d); tri(a, d, b); }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const top = new THREE.Mesh(geo, vcMat);
    top.receiveShadow = true;
    top.name = 'grass-top';

    /* ---- 侧壁（浅色土层，无深色描边） ---- */
    const wPos = [], wCol = [];
    const cLip = new THREE.Color(C.lip), cSoilTop = new THREE.Color(C.soilTop), cSoil = new THREE.Color(C.soil);
    const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();
    const e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
    function quad(p0, p1, p2, p3, outward, color) { // p0,p1 上沿；p2 在 p1 下方，p3 在 p0 下方
      e1.subVectors(p3, p0); e2.subVectors(p1, p0);
      const n = e1.clone().cross(e2);
      const order = n.dot(outward) >= 0 ? [p0, p3, p1, p1, p3, p2] : [p0, p1, p3, p1, p2, p3];
      for (const p of order) { wPos.push(p.x, p.y, p.z); wCol.push(color.r, color.g, color.b); }
    }
    const bottomY = -CFG.thickness, midY = -CFG.thickness * 0.55;
    function wallSide(indices, outward) {
      for (let k = 0; k < indices.length - 1; k++) {
        const a = indices[k], b = indices[k + 1];
        const ha = vy[a], hb = vy[b];
        const inChannel = Math.min(ha, hb) < -0.1;
        // 草皮层
        quad(v0.set(vx[a], ha, vz[a]), v1.set(vx[b], hb, vz[b]),
          v2.set(vx[b], hb - CFG.lipDepth, vz[b]), v3.set(vx[a], ha - CFG.lipDepth, vz[a]),
          outward, inChannel ? cSand : cLip);
        // 上层土
        quad(v0.set(vx[a], ha - CFG.lipDepth, vz[a]), v1.set(vx[b], hb - CFG.lipDepth, vz[b]),
          v2.set(vx[b], Math.min(midY, hb - CFG.lipDepth - 0.05), vz[b]), v3.set(vx[a], Math.min(midY, ha - CFG.lipDepth - 0.05), vz[a]),
          outward, cSoilTop);
        // 下层土
        quad(v0.set(vx[a], Math.min(midY, ha - CFG.lipDepth - 0.05), vz[a]), v1.set(vx[b], Math.min(midY, hb - CFG.lipDepth - 0.05), vz[b]),
          v2.set(vx[b], bottomY, vz[b]), v3.set(vx[a], bottomY, vz[a]),
          outward, cSoil);
      }
    }
    const south = [], north = [], west = [], east = [];
    for (let i = 0; i <= N; i++) { north.push(i); south.push(N * (N + 1) + i); }
    for (let j = 0; j <= N; j++) { west.push(j * (N + 1)); east.push(j * (N + 1) + N); }
    wallSide(south, new THREE.Vector3(0, 0, 1));
    wallSide(north, new THREE.Vector3(0, 0, -1));
    wallSide(west, new THREE.Vector3(-1, 0, 0));
    wallSide(east, new THREE.Vector3(1, 0, 0));
    const wGeo = new THREE.BufferGeometry();
    wGeo.setAttribute('position', new THREE.Float32BufferAttribute(wPos, 3));
    wGeo.setAttribute('color', new THREE.Float32BufferAttribute(wCol, 3));
    wGeo.computeVertexNormals();
    const walls = new THREE.Mesh(wGeo, vcMat);
    walls.castShadow = true;
    walls.receiveShadow = true;
    walls.name = 'board-walls';

    const bottom = new THREE.Mesh(new THREE.PlaneGeometry(2 * H, 2 * H).rotateX(Math.PI / 2), flatMat(C.soil));
    bottom.position.y = bottomY;

    /* ---- 河流在草地前后边缘的水体截面 ---- */
    const capPos = [];
    function cap(indices, zEdge, outward) {
      for (let k = 0; k < indices.length - 1; k++) {
        const a = indices[k], b = indices[k + 1];
        if (vy[a] >= rv.waterY && vy[b] >= rv.waterY) continue;
        const ya = Math.min(vy[a], rv.waterY), yb = Math.min(vy[b], rv.waterY);
        const p0 = [vx[a], rv.waterY, zEdge], p1 = [vx[b], rv.waterY, zEdge], p2 = [vx[b], yb, zEdge], p3 = [vx[a], ya, zEdge];
        const flip = outward > 0;
        const order = flip ? [p0, p3, p1, p1, p3, p2] : [p0, p1, p3, p1, p2, p3];
        for (const p of order) capPos.push(p[0], p[1] + 0.001, p[2] + outward * 0.004);
      }
    }
    cap(south, H, 1);
    cap(north, -H, -1);
    const capGeo = new THREE.BufferGeometry();
    capGeo.setAttribute('position', new THREE.Float32BufferAttribute(capPos, 3));
    capGeo.computeVertexNormals();
    const caps = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: C.waterCap, roughness: 0.4, metalness: 0 }));
    caps.name = 'water-caps';

    const g = new THREE.Group();
    g.name = 'terrain';
    g.add(top, walls, bottom, caps);
    return g;
  }

  /* ---------------------------- 河流水面（纵向流动高光） ---------------------------- */
  const waterUniforms = {
    uTime: { value: 0 },
    uDeep: { value: new THREE.Color(CFG.colors.waterDeep) },
    uShallow: { value: new THREE.Color(CFG.colors.waterShallow) },
    uHi: { value: new THREE.Color(CFG.colors.waterHighlight) },
  };
  function buildWater() {
    const rv = CFG.river, H = CFG.half, NZ = 180, NA = 12;
    const pos = [], uv = [], idx = [];
    let along = 0, pcx = riverX(-H), pz = -H;
    for (let k = 0; k <= NZ; k++) {
      const z = -H + (2 * H * k) / NZ;
      const cx = riverX(z), s = curveSlope(rv, z), kk = Math.sqrt(1 + s * s);
      const edge = riverEdge(z), ext = edge + 0.9;
      if (k > 0) along += Math.hypot(z - pz, cx - pcx);
      pz = z; pcx = cx;
      for (let a = 0; a <= NA; a++) {
        const u = -1 + (2 * a) / NA;
        const x = clamp(cx + u * ext * kk, -H, H);
        pos.push(x, rv.waterY, z);
        uv.push((u * ext) / edge, along);
      }
    }
    for (let k = 0; k < NZ; k++) {
      for (let a = 0; a < NA; a++) {
        const i0 = k * (NA + 1) + a, i1 = i0 + 1, i2 = i0 + NA + 1, i3 = i2 + 1;
        idx.push(i0, i2, i1, i1, i2, i3);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('riverUv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.32, metalness: 0 });
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, waterUniforms);
      shader.vertexShader = 'attribute vec2 riverUv;\nvarying vec2 vRiverUv;\n' +
        shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vRiverUv = riverUv;');
      shader.fragmentShader = [
        'uniform float uTime;',
        'uniform vec3 uDeep;',
        'uniform vec3 uShallow;',
        'uniform vec3 uHi;',
        'varying vec2 vRiverUv;',
        'float rHash(float n) { return fract(sin(n * 127.1) * 43758.5453); }',
        shader.fragmentShader,
      ].join('\n')
        .replace('#include <color_fragment>', `#include <color_fragment>
  float acr = vRiverUv.x;           // 横向：-1..1 为可见水面
  float alg = vRiverUv.y;           // 纵向：沿河道的距离
  float aa = abs(acr);
  vec3 wcol = mix(uDeep, uShallow, smoothstep(0.1, 1.0, aa));
  wcol = mix(wcol, uShallow, 0.08 * sin(alg * 0.35 + acr * 1.7));
  float hl = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float lanes = 3.0 + fi * 2.0;
    float wob = sin(alg * (0.42 + fi * 0.17) + uTime * 0.5 + fi * 2.0) * 0.14;
    float lx = (acr + 1.0) * 0.5 * lanes + wob + fi * 0.37;
    float lane = floor(lx);
    float fx = fract(lx) - 0.5;
    float r = rHash(lane * 13.7 + fi * 71.3);
    float spd = 1.0 + r * 0.9;
    float len = 0.9 + r * 1.8;
    float gap = 2.2 + rHash(lane * 3.1 + fi * 5.7) * 4.5;
    float per = len + gap;
    float sp = mod(alg - uTime * spd + r * 37.0, per);
    float dash = smoothstep(0.0, len * 0.35, sp) * (1.0 - smoothstep(len * 0.5, len, sp));
    float wid = 0.07 + 0.05 * r;
    float line = 1.0 - smoothstep(wid * 0.35, wid, abs(fx));
    hl += dash * line * (0.5 + 0.5 * r);
  }
  hl *= 1.0 - smoothstep(0.82, 1.0, aa);
  float shore = smoothstep(0.72, 1.0, aa) * (0.6 + 0.4 * sin(alg * 2.1 - uTime * 1.4 + acr * 3.0));
  diffuseColor.rgb = mix(wcol, uHi, clamp(hl * 0.55 + shore * 0.22, 0.0, 0.9));`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
  totalEmissiveRadiance += uHi * (hl * 0.32 + shore * 0.06);`);
    };
    mat.customProgramCacheKey = () => 'ranch-water-v1';
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.name = 'river-water';
    return mesh;
  }

  /* ---------------------------- 小路 ---------------------------- */
  function buildPath(rng) {
    const pc = CFG.path, H = CFG.half, C = CFG.colors, NZ = 160;
    const g = new THREE.Group();
    g.name = 'path';

    function ribbon(widthAdd, y, colors, NA, jitterY) {
      const rows = [];
      for (let k = 0; k <= NZ; k++) {
        const z = -H + (2 * H * k) / NZ;
        const cx = pathX(z), s = curveSlope(pc, z), kk = Math.sqrt(1 + s * s);
        const hw = (pathHalf(z) + widthAdd) * (1 + 0.05 * Math.sin(z * 2.3) + (rng() - 0.5) * 0.06);
        const row = [];
        for (let a = 0; a <= NA; a++) {
          const u = -1 + (2 * a) / NA;
          const yy = y + (a > 0 && a < NA ? (rng() - 0.5) * jitterY : 0);
          row.push([clamp(cx + u * hw * kk, -H, H), yy, z]);
        }
        rows.push(row);
      }
      const pos = [], col = [];
      const base = colors.map((c) => new THREE.Color(c));
      const c = new THREE.Color();
      const tri = (p, q, r) => {
        pos.push(...p, ...q, ...r);
        c.copy(base[Math.floor(rng() * base.length)]).offsetHSL(0, 0, (rng() - 0.5) * 0.035);
        for (let i = 0; i < 3; i++) col.push(c.r, c.g, c.b);
      };
      for (let k = 0; k < NZ; k++) {
        for (let a = 0; a < NA; a++) {
          const p0 = rows[k][a], p1 = rows[k][a + 1], p2 = rows[k + 1][a], p3 = rows[k + 1][a + 1];
          tri(p0, p2, p1);
          tri(p1, p2, p3);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, vcMat);
      m.receiveShadow = true;
      return m;
    }
    g.add(ribbon(0.2, pc.y * 0.5, [C.pathEdge], 2, 0));
    g.add(ribbon(0, pc.y, [C.path, '#f6e7b0', '#efdc98'], 4, 0.012));
    return g;
  }

  /* ---------------------------- 树木 ---------------------------- */
  const swayers = [];
  function makeTree(rng, scale, palette) {
    const s = scale;
    const tree = new THREE.Group();
    const trunkH = 1.25 * s;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * s, 0.22 * s, trunkH, 7), flatMat(CFG.colors.trunk, 0.9));
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    const crown = new THREE.Group();
    crown.position.y = trunkH * 0.92;
    const blobs = [[0, 0.78, 0, 1.05]];
    const n = 2 + Math.floor(rng() * 2);
    const a0 = rng() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2 + (rng() - 0.5) * 0.6;
      blobs.push([Math.cos(a) * 0.62, 0.5 + rng() * 0.35, Math.sin(a) * 0.62, 0.62 + rng() * 0.2]);
    }
    blobs.push([(rng() - 0.5) * 0.3, 1.45, (rng() - 0.5) * 0.3, 0.58]);
    blobs.forEach(([x, y, z, r], i) => {
      const m = new THREE.Mesh(lumpyIco(r * s, 1, rng, 0.16), flatMat(palette[i % palette.length], 0.9));
      m.position.set(x * s, y * s, z * s);
      m.rotation.set(rng() * 3, rng() * 3, rng() * 3);
      m.castShadow = true;
      m.receiveShadow = true;
      crown.add(m);
    });
    tree.add(crown);
    swayers.push({ obj: crown, phase: rng() * 10, amp: 0.012 + rng() * 0.01 });
    return tree;
  }

  // 让树避开河流与小路
  function safeSpot(x, z, r) {
    const H = CFG.half;
    for (let i = 0; i < 60; i++) {
      const okRiver = riverDist(x, z) > riverEdge(z) + r + 0.5;
      const okPath = pathDist(x, z) > pathHalf(z) + r + 0.35;
      if (okRiver && okPath) break;
      if (!okRiver) x += (x > riverX(z) ? 1 : -1) * 0.25;
      if (!okPath) x += (x > pathX(z) ? 1 : -1) * 0.25;
      x = clamp(x, -H + 0.7, H - 0.7);
    }
    return [x, z];
  }

  const TREE_SPOTS = [
    // [x, z, 尺寸]
    [-16.6, -15.0, 1.05], [-16.5, -6.5, 0.9], [-16.7, 3.5, 1.1], [-16.4, 13.2, 0.95],
    [-4.8, -16.4, 1.0], [0.6, -16.5, 1.2], [6.0, -16.2, 0.9],
    [16.3, -13.8, 1.1], [16.5, -4.8, 0.95], [16.4, 6.0, 1.05], [16.2, 15.8, 0.9],
    [-3.5, 16.3, 0.85],
  ];
  const PINK_TREE = [4.8, -10.2, 1.18];

  function buildTrees(rng) {
    const g = new THREE.Group();
    g.name = 'trees';
    const C = CFG.colors;
    TREE_SPOTS.forEach(([x0, z0, s]) => {
      const [x, z] = safeSpot(x0, z0, 0.3 * s);
      const pal = C.crowns.slice().sort(() => rng() - 0.5);
      const t = makeTree(rng, s, pal);
      t.position.set(x, heightAt(x, z) - 0.02, z);
      t.rotation.y = rng() * Math.PI * 2;
      g.add(t);
      obstacles.push({ x, z, r: 0.3 * s });
    });
    const [px, pz] = safeSpot(PINK_TREE[0], PINK_TREE[1], 0.3);
    const pink = makeTree(rng, PINK_TREE[2], C.pinkCrowns);
    pink.position.set(px, heightAt(px, pz) - 0.02, pz);
    pink.name = 'pink-tree';
    g.add(pink);
    obstacles.push({ x: px, z: pz, r: 0.3 * PINK_TREE[2] });
    g.userData.pink = { x: px, z: pz };
    return g;
  }

  /* ---------------------------- 石头 ---------------------------- */
  function buildRocks(rng) {
    const g = new THREE.Group();
    g.name = 'rocks';
    const rv = CFG.river;
    const place = (x, z, s, sink) => {
      const m = new THREE.Mesh(lumpyIco(1, 0, rng, 0.45), flatMat(CFG.colors.rock, 0.9));
      m.scale.set(s * (0.9 + rng() * 0.4), s * (0.55 + rng() * 0.2), s * (0.9 + rng() * 0.4));
      m.rotation.y = rng() * Math.PI;
      m.position.set(x, Math.max(heightAt(x, z), rv.waterY) - sink * s, z);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
      return m;
    };
    // 河岸石头（半浸在水中）
    const riverRocks = [[-13, 1, 0.32], [-9, -1, 0.26], [-4, 1, 0.38], [2.5, -1, 0.3], [7, 1, 0.24], [11.5, -1, 0.34], [15.5, 1, 0.28]];
    riverRocks.forEach(([z, side, s]) => {
      const s2 = curveSlope(rv, z), k = Math.sqrt(1 + s2 * s2);
      const x = riverX(z) + side * (riverEdge(z) + 0.05) * k;
      place(x, z, s, 0.25);
      place(x + side * 0.35 + (rng() - 0.5) * 0.2, z + 0.35, s * 0.55, 0.2);
    });
    // 草地上的零星石头
    const fieldRocks = [[13.4, -9.5, 0.32], [8.0, 13.8, 0.28], [-6.2, -12.5, 0.26]];
    fieldRocks.forEach(([x, z, s]) => {
      place(x, z, s, 0.15);
      place(x + 0.42, z + 0.18, s * 0.6, 0.12);
      obstacles.push({ x, z, r: s + 0.15 });
    });
    return g;
  }

  /* ---------------------------- 细小草叶（实例化 + 风动） ---------------------------- */
  const grassUniforms = { uTime: { value: 0 } };
  function buildGrass(rng, pinkSpot) {
    const C = CFG.colors, H = CFG.half;
    const blade = new THREE.BufferGeometry();
    blade.setAttribute('position', new THREE.Float32BufferAttribute([
      -0.5, 0, 0, 0.5, 0, 0, 0.32, 0.5, 0.03, -0.32, 0.5, 0.03, 0, 1, 0.09,
    ], 3));
    blade.setAttribute('color', new THREE.Float32BufferAttribute([
      0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.97, 0.97, 0.97, 0.97, 0.97, 0.97, 1.12, 1.12, 1.12,
    ], 3));
    blade.setIndex([0, 1, 2, 0, 2, 3, 3, 2, 4]);
    blade.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1, metalness: 0 });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = grassUniforms.uTime;
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
  #ifdef USE_INSTANCING
    vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
    float sw = sin(uTime * 1.7 + ip.x * 0.55 + ip.z * 0.35) * 0.6 + sin(uTime * 2.9 + ip.x * 1.3 - ip.z) * 0.25;
    transformed.x += sw * position.y * position.y * 0.16;
    transformed.z += sw * position.y * position.y * 0.06;
  #endif`);
    };
    mat.customProgramCacheKey = () => 'ranch-grass-v1';

    const mats = [];
    const cols = [];
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pv = new THREE.Vector3(), sv = new THREE.Vector3();
    const palette = C.blades.map((c) => new THREE.Color(c));
    let attempts = 0, tufts = 0;
    while (tufts < CFG.grassTufts && attempts < CFG.grassTufts * 6) {
      attempts++;
      const x = (rng() * 2 - 1) * (H - 0.25), z = (rng() * 2 - 1) * (H - 0.25);
      const dens = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(x * 0.45 + 1.0) * Math.cos(z * 0.38 - 0.4));
      if (rng() > dens) continue;
      if (riverDist(x, z) < riverEdge(z) + 0.35) continue;
      if (heightAt(x, z) < -0.08) continue;
      if (pathDist(x, z) < pathHalf(z) + 0.14) continue;
      let blocked = false;
      for (const o of obstacles) if ((x - o.x) ** 2 + (z - o.z) ** 2 < (o.r + 0.12) ** 2) { blocked = true; break; }
      if (blocked) continue;
      tufts++;
      const n = 3 + Math.floor(rng() * 3);
      const base = palette[Math.floor(rng() * palette.length)];
      for (let b = 0; b < n; b++) {
        const bx = x + (rng() - 0.5) * 0.2, bz = z + (rng() - 0.5) * 0.2;
        if (Math.abs(bx) > H - 0.05 || Math.abs(bz) > H - 0.05) continue;
        const hgt = 0.09 + rng() * 0.13, wid = 0.024 + rng() * 0.016;
        pv.set(bx, heightAt(bx, bz) - 0.015, bz);
        e.set((rng() - 0.5) * 0.5, rng() * Math.PI * 2, (rng() - 0.5) * 0.5);
        q.setFromEuler(e);
        sv.set(wid, hgt, wid);
        m4.compose(pv, q, sv);
        mats.push(m4.clone());
        cols.push(base.clone().offsetHSL(0, 0, (rng() - 0.5) * 0.05));
      }
    }
    const inst = new THREE.InstancedMesh(blade, mat, mats.length);
    mats.forEach((m, i) => { inst.setMatrixAt(i, m); inst.setColorAt(i, cols[i]); });
    inst.instanceMatrix.needsUpdate = true;
    inst.instanceColor.needsUpdate = true;
    inst.receiveShadow = true;
    inst.name = 'grass-blades';

    // 粉紫色树下的落花
    const pg = new THREE.CircleGeometry(0.07, 5).rotateX(-Math.PI / 2);
    const pmat = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1, side: THREE.DoubleSide });
    const petalsM = [], petalsC = [];
    const ppal = C.petals.map((c) => new THREE.Color(c));
    for (let i = 0; i < 140; i++) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 2.6;
      const x = pinkSpot.x + Math.cos(a) * r, z = pinkSpot.z + Math.sin(a) * r * 0.9;
      if (pathDist(x, z) < pathHalf(z) + 0.05) continue;
      pv.set(x, heightAt(x, z) + 0.012, z);
      e.set((rng() - 0.5) * 0.2, rng() * 6.28, (rng() - 0.5) * 0.2);
      q.setFromEuler(e);
      const s = 0.7 + rng() * 0.7;
      sv.set(s, s, s);
      petalsM.push(new THREE.Matrix4().compose(pv, q, sv));
      petalsC.push(ppal[Math.floor(rng() * ppal.length)]);
    }
    const petals = new THREE.InstancedMesh(pg, pmat, petalsM.length);
    petalsM.forEach((m, i) => { petals.setMatrixAt(i, m); petals.setColorAt(i, petalsC[i]); });
    petals.receiveShadow = true;
    petals.name = 'petals';

    const g = new THREE.Group();
    g.add(inst, petals);
    return g;
  }

  /* ---------------------------- 组装 ---------------------------- */
  function build(scene) {
    const rng = mulberry32(CFG.seed);
    obstacles.length = 0;
    swayers.length = 0;
    const root = new THREE.Group();
    root.name = 'ranch-world';
    root.add(buildTerrain(rng));
    root.add(buildWater());
    root.add(buildPath(rng));
    const trees = buildTrees(rng);
    root.add(trees);
    root.add(buildRocks(rng));
    root.add(buildGrass(rng, trees.userData.pink));
    scene.add(root);
    return root;
  }

  function update(t) {
    waterUniforms.uTime.value = t;
    grassUniforms.uTime.value = t;
    for (const s of swayers) {
      s.obj.rotation.z = Math.sin(t * 0.8 + s.phase) * s.amp;
      s.obj.rotation.x = Math.sin(t * 0.63 + s.phase * 1.7) * s.amp * 0.7;
    }
  }

  R.World = {
    config: CFG,
    heightAt, riverX, pathX, riverDist, pathDist, riverEdge, pathHalf,
    isWalkable, constrain, obstacles,
    build, update,
  };
})();
