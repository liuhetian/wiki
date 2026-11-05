/* =========================================================================
 * app.js — 场景、灯光、羊群、交互（鼠标 + 触控）与 UI
 * ========================================================================= */
(function () {
  'use strict';
  const THREE = window.THREE;
  const R = window.RANCH;
  const { clamp, mulberry32 } = R.util;
  const World = R.World;

  const ACTION_LABEL = { Idle: '待机', Graze: '吃草', Walk: '行走', Jump: '跳跃' };
  const MAX_SHEEP = 60;

  /* ---------------------------- 渲染器与场景 ---------------------------- */
  const canvas = document.getElementById('scene');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (err) {
    document.getElementById('nogl').hidden = false;
    throw err;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = Number(THREE.REVISION) >= 182 ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap; // r182 起 PCFSoft 弃用，PCF 已是柔和过滤
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const BG = '#f4efe5';
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);

  const fovFor = (a) => (a < 0.8 ? 46 : a < 1.15 ? 38 : 32); // 竖屏时加大视角，草地显示更大
  const camera = new THREE.PerspectiveCamera(fovFor(window.innerWidth / window.innerHeight), window.innerWidth / window.innerHeight, 0.5, 500);

  // 灯光：暖白半球光 + 带柔和阴影的主光
  const hemi = new THREE.HemisphereLight('#fffaf0', '#e9dfc9', 1.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff7ec', 2.35);
  sun.position.set(-17, 30, 19);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -27; sc.right = 27; sc.top = 27; sc.bottom = -27; sc.near = 5; sc.far = 90;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.035;
  scene.add(sun, sun.target);

  // 桌面上的柔和投影（底座阴影 + 环境光遮蔽晕影）
  const H = World.config.half, baseY = -World.config.thickness;
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(220, 220).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ color: '#6b5636', opacity: 0.16 }));
  catcher.position.y = baseY - 0.01;
  catcher.receiveShadow = true;
  scene.add(catcher);
  (function addTableGlow() {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(128, 128, 30, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,0.5)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.22)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), color: '#7a6040', transparent: true, opacity: 0.38, depthWrite: false }));
    m.scale.set(2 * H * 1.55, 1, 2 * H * 1.55);
    m.position.y = baseY - 0.02;
    scene.add(m);
  })();

  World.build(scene);

  /* ---------------------------- 羊群 ---------------------------- */
  const flock = [];
  const ctx = { world: World, flock };
  let selected = null;

  function addSheep(opts) {
    const s = new R.Sheep(opts);
    scene.add(s.root);
    flock.push(s);
    s.update(0, ctx);
    return s;
  }

  function freeSpot(x0, z0, minDist, exclude) {
    const ok = (x, z) => World.isWalkable(x, z, 0.1) &&
      flock.every((o) => o === exclude || (o.position.x - x) ** 2 + (o.position.z - z) ** 2 > minDist * minDist);
    if (ok(x0, z0)) return { x: x0, z: z0 };
    for (const r of [1.4, 1.9, 2.5, 3.2, 4.2, 5.5]) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + r;
        const x = x0 + Math.cos(a) * r, z = z0 + Math.sin(a) * r;
        if (ok(x, z)) return { x, z };
      }
    }
    return World.constrain(x0 + 1.4, z0);
  }

  (function spawnInitial() {
    const rng = mulberry32(42);
    const actions = ['Graze', 'Idle', 'Graze', 'Walk', 'Graze', 'Idle', 'Jump', 'Graze', 'Walk', 'Idle', 'Graze'];
    let tries = 0;
    while (flock.length < actions.length && tries < 5000) {
      tries++;
      const x = -5.5 + rng() * 13.5, z = -14 + rng() * 28;
      if (!World.isWalkable(x, z, 0.4)) continue;
      if (World.pathDist(x, z) < World.pathHalf(z) + 0.7) continue;
      if (flock.some((o) => (o.position.x - x) ** 2 + (o.position.z - z) ** 2 < 2.6 * 2.6)) continue;
      addSheep({
        seed: Math.floor(rng() * 1e9),
        size: 0.92 + rng() * 0.16,
        action: actions[flock.length],
        heading: rng() * Math.PI * 2,
        position: { x, z },
      });
    }
  })();

  /* ---------------------------- 相机 ---------------------------- */
  // 默认视角：投影草地的 8 个角点，自动求出能完整容纳草地的相机距离与中心（适配任意屏幕比例）
  const fitCam = camera.clone();
  const BOARD_PTS = [];
  for (const x of [-H, H]) for (const z of [-H, H]) for (const y of [0.4, baseY]) BOARD_PTS.push(new THREE.Vector3(x, y, z));
  function placeFitCam(theta, phi, radius, target) {
    const sp = Math.sin(phi);
    fitCam.position.set(target.x + radius * sp * Math.sin(theta), target.y + radius * Math.cos(phi), target.z + radius * sp * Math.cos(theta));
    fitCam.lookAt(target);
    fitCam.updateMatrixWorld();
  }
  function boardBox() {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of BOARD_PTS) {
      tmpFit.copy(p).project(fitCam);
      x0 = Math.min(x0, tmpFit.x); x1 = Math.max(x1, tmpFit.x); y0 = Math.min(y0, tmpFit.y); y1 = Math.max(y1, tmpFit.y);
    }
    return { x0, x1, y0, y1 };
  }
  const tmpFit = new THREE.Vector3();
  function homeView() {
    const w = window.innerWidth, h = Math.max(1, window.innerHeight), a = w / h;
    fitCam.aspect = a;
    fitCam.fov = camera.fov;
    fitCam.updateProjectionMatrix();
    const portrait = a < 0.8;
    const theta = portrait ? 0.22 : 0.55, phi = portrait ? 0.68 : 0.94;
    // 预留顶部栏与底部提示条的空间（NDC）
    const top = 1 - (2 * (a < 0.8 ? 64 : 78)) / h, bottom = -1 + (2 * (a < 0.8 ? 74 : 66)) / h;
    const xm = 1 - (2 * (a < 0.8 ? 10 : 36)) / w;
    const target = new THREE.Vector3(0, -0.6, 0);
    const fitRay = new THREE.Raycaster(), gp = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.6), hit = new THREE.Vector3();
    let radius = 60;
    for (let iter = 0; iter < 5; iter++) {
      let lo = 15, hi = 260;
      for (let i = 0; i < 28; i++) {
        const mid = (lo + hi) / 2;
        placeFitCam(theta, phi, mid, target);
        const bb = boardBox();
        const sx = (bb.x1 - bb.x0) / (2 * xm), sy = (bb.y1 - bb.y0) / (top - bottom);
        if (sx <= 1 && sy <= 1) hi = mid; else lo = mid;
      }
      radius = hi;
      placeFitCam(theta, phi, radius, target);
      const bb = boardBox();
      const cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2 - (top + bottom) / 2;
      fitRay.setFromCamera(new THREE.Vector2(cx, cy), fitCam);
      if (fitRay.ray.intersectPlane(gp, hit)) target.set(hit.x, -0.6, hit.z);
    }
    return { theta, phi, radius: radius * 1.02, target };
  }
  const cam = new R.OrbitCam(camera, Object.assign(homeView(), { bounds: H - 1, maxRadius: 140, viewportHeight: () => window.innerHeight }));

  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = fovFor(w / h);
    camera.updateProjectionMatrix();
    const home = homeView();
    cam.setHome(home);
    cam.opts.maxRadius = Math.max(140, home.radius * 1.3);
  }
  window.addEventListener('resize', onResize);
  onResize();

  /* ---------------------------- 拾取 ---------------------------- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const tmpV = new THREE.Vector3();

  function setRay(x, y) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
  }
  function pickSheep(x, y, pointerType) {
    setRay(x, y);
    const hits = raycaster.intersectObjects(flock.map((s) => s.proxy), false);
    if (hits.length) return hits[0].object.userData.sheep;
    // 屏幕空间兜底：羊很小时（尤其触控）也能点中
    const r = canvas.getBoundingClientRect();
    const thr = pointerType === 'touch' ? 28 : 14;
    let best = null, bd = thr;
    for (const s of flock) {
      tmpV.copy(s.position);
      tmpV.y += 0.55 * s.size + s.lift.position.y;
      tmpV.project(camera);
      if (tmpV.z > 1) continue;
      const sx = r.left + ((tmpV.x + 1) / 2) * r.width, sy = r.top + ((1 - tmpV.y) / 2) * r.height;
      const d = Math.hypot(sx - x, sy - y);
      if (d < bd) { bd = d; best = s; }
    }
    return best;
  }
  function groundPoint(x, y, h = 0) {
    setRay(x, y);
    plane.constant = -h;
    const out = new THREE.Vector3();
    return raycaster.ray.intersectPlane(plane, out) ? out : null;
  }

  /* ---------------------------- 选择 / 操作 ---------------------------- */
  function select(s) {
    if (selected === s) { refreshPanel(); return; }
    if (selected) selected.setSelected(false);
    selected = s;
    if (s) s.setSelected(true);
    refreshPanel();
  }
  function setAction(name) {
    if (!selected) return;
    selected.setAction(name);
    refreshPanel();
  }
  function rotateSelected(deg) {
    if (!selected) return;
    selected.rotateBy((-deg * Math.PI) / 180);
    refreshHeading(true);
  }
  function duplicateSelected() {
    if (!selected) return;
    if (flock.length >= MAX_SHEEP) { toast(`牧场最多容纳 ${MAX_SHEEP} 只绵羊`); return; }
    const src = selected;
    const spot = freeSpot(src.position.x + 1.5, src.position.z, 1.2, null);
    const s = addSheep({ seed: src.seed, size: src.size, action: src.action, heading: src.headingTarget, position: spot });
    s.walkPhase = (src.walkPhase + 0.5) % 1;
    s.jumpPhase = (src.jumpPhase + 0.35) % 1;
    select(s);
    toast(`已复制为 ${nameOf(s)}`);
    updateCount();
  }
  function deleteSelected() {
    if (!selected) return;
    const s = selected;
    if (drag && drag.sheep === s) drag = null;
    if (press && press.sheep === s) { press = null; mode = 'idle'; }
    select(null);
    flock.splice(flock.indexOf(s), 1);
    s.dispose();
    toast(`已删除 ${nameOf(s)}`);
    updateCount();
  }
  function addNewSheep() {
    if (flock.length >= MAX_SHEEP) { toast(`牧场最多容纳 ${MAX_SHEEP} 只绵羊`); return; }
    const t = cam.goal.target;
    const spot = freeSpot(clamp(t.x, -5, 8), clamp(t.z, -14, 14), 1.4, null);
    const s = addSheep({ size: 0.92 + Math.random() * 0.16, action: 'Idle', heading: Math.random() * Math.PI * 2, position: spot });
    select(s);
    toast(`已添加 ${nameOf(s)}`);
    updateCount();
  }
  const nameOf = (s) => `绵羊 #${String(s.id).padStart(2, '0')}`;

  /* ---------------------------- 指针交互（鼠标 + 触控） ---------------------------- */
  const pointers = new Map();
  let mode = 'idle';       // idle | orbit | pan | sheep | pinch
  let press = null;        // 单指/鼠标按下状态
  let drag = null;         // 正在拖动的羊
  let pinch = null;

  function pinchInfo() {
    const [a, b] = [...pointers.values()];
    return { dist: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  }
  function endSheepDrag() {
    if (drag) { drag.sheep.endDrag(); drag = null; }
    canvas.style.cursor = '';
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button > 2) return;
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    hideHint();
    if (pointers.size === 1) {
      const panBtn = e.pointerType === 'mouse' && (e.button === 2 || e.button === 1 || e.shiftKey);
      press = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, type: e.pointerType };
      if (panBtn) { mode = 'pan'; return; }
      const hit = pickSheep(e.clientX, e.clientY, e.pointerType);
      if (hit) {
        // 先记为候选：轻点抬起或开始拖动时才真正选中（避免双指缩放时误选）
        const g = groundPoint(e.clientX, e.clientY, hit.position.y);
        press.sheep = hit;
        press.offX = g ? g.x - hit.position.x : 0;
        press.offZ = g ? g.z - hit.position.z : 0;
        press.h = hit.position.y;
        mode = 'sheep';
      } else {
        mode = 'orbit';
      }
    } else if (pointers.size === 2) {
      endSheepDrag();
      press = null;
      mode = 'pinch';
      pinch = pinchInfo();
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) {
      if (e.pointerType === 'mouse') hoverQueued = { x: e.clientX, y: e.clientY };
      return;
    }
    p.x = e.clientX; p.y = e.clientY;
    if (mode === 'pinch' && pointers.size >= 2) {
      const now = pinchInfo();
      if (pinch.dist > 0 && now.dist > 0) cam.zoom(pinch.dist / now.dist, groundPoint(now.mx, now.my, 0));
      cam.pan(now.mx - pinch.mx, now.my - pinch.my);
      pinch = now;
      return;
    }
    if (!press || e.pointerId !== press.id) return;
    const dx = e.clientX - press.lx, dy = e.clientY - press.ly;
    if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) > (press.type === 'touch' ? 7 : 3)) {
      press.moved = true;
      if (mode === 'sheep') {
        select(press.sheep);
        drag = { sheep: press.sheep };
        press.sheep.beginDrag();
        canvas.style.cursor = 'grabbing';
      }
    }
    if (press.moved) {
      if (mode === 'orbit') cam.rotate(dx, dy);
      else if (mode === 'pan') cam.pan(dx, dy);
      else if (mode === 'sheep' && drag) {
        const g = groundPoint(e.clientX, e.clientY, press.h);
        if (g) {
          const c = World.constrain(g.x - press.offX, g.z - press.offZ);
          drag.sheep.setPosition(c.x, c.z);
        }
      }
    }
    press.lx = e.clientX; press.ly = e.clientY;
  });

  function onPointerEnd(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (mode === 'pinch') {
      if (pointers.size === 1) {
        const [id, p] = [...pointers.entries()][0];
        mode = 'orbit';
        press = { id, x: p.x, y: p.y, lx: p.x, ly: p.y, moved: true, type: 'touch' };
      } else if (pointers.size === 0) {
        mode = 'idle'; press = null; pinch = null;
      }
      return;
    }
    if (press && e.pointerId === press.id) {
      if (mode === 'sheep') {
        if (!press.moved && e.type === 'pointerup' && flock.includes(press.sheep)) select(press.sheep); // 轻点选中
        endSheepDrag();
      }
      if (mode === 'orbit' && !press.moved && e.type === 'pointerup') select(null); // 点击空白处取消选择
      mode = 'idle';
      press = null;
    }
  }
  canvas.addEventListener('pointerup', onPointerEnd);
  canvas.addEventListener('pointercancel', onPointerEnd);
  canvas.addEventListener('lostpointercapture', onPointerEnd);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1;
    const f = Math.exp(clamp(e.deltaY * unit, -300, 300) * 0.0013);
    cam.zoom(f, groundPoint(e.clientX, e.clientY, 0));
  }, { passive: false });
  canvas.addEventListener('dblclick', (e) => {
    const hit = pickSheep(e.clientX, e.clientY, 'mouse');
    if (hit) { cam.goal.target.set(hit.position.x, 0, hit.position.z); cam.goal.radius = Math.min(cam.goal.radius, 22); }
  });

  // 鼠标悬停：在羊上显示可抓取光标
  let hoverQueued = null;
  function processHover() {
    if (!hoverQueued || mode !== 'idle') return;
    const h = pickSheep(hoverQueued.x, hoverQueued.y, 'mouse');
    canvas.style.cursor = h ? 'grab' : '';
    hoverQueued = null;
  }

  /* ---------------------------- UI ---------------------------- */
  const $ = (id) => document.getElementById(id);
  const ui = {
    panel: $('panel'), name: $('sheepName'), state: $('sheepState'),
    actions: [...document.querySelectorAll('#actions [data-action]')],
    heading: $('heading'), headingVal: $('headingVal'),
    count: $('sheepCount'), hint: $('hint'), toast: $('toast'),
  };
  ui.actions.forEach((b) => b.addEventListener('click', () => setAction(b.dataset.action)));
  $('rotL').addEventListener('click', () => rotateSelected(-45));
  $('rotR').addEventListener('click', () => rotateSelected(45));
  $('dup').addEventListener('click', duplicateSelected);
  $('del').addEventListener('click', deleteSelected);
  $('deselect').addEventListener('click', () => select(null));
  $('resetView').addEventListener('click', () => cam.reset());
  $('addSheep').addEventListener('click', addNewSheep);
  let sliderActive = false;
  ui.heading.addEventListener('input', () => {
    sliderActive = true;
    if (selected) selected.setHeading((-Number(ui.heading.value) * Math.PI) / 180);
    ui.headingVal.textContent = ui.heading.value + '°';
  });
  ui.heading.addEventListener('change', () => { sliderActive = false; });

  function headingDeg(s) {
    const d = Math.round(((-s.headingTarget * 180) / Math.PI) % 360);
    return ((d % 360) + 360) % 360;
  }
  function refreshHeading(force) {
    if (!selected || (sliderActive && !force)) return;
    const d = headingDeg(selected);
    ui.heading.value = d;
    ui.headingVal.textContent = d + '°';
  }
  function refreshPanel() {
    const s = selected;
    ui.panel.classList.toggle('hidden', !s);
    ui.panel.setAttribute('aria-hidden', s ? 'false' : 'true');
    document.body.classList.toggle('has-selection', !!s);
    if (!s) return;
    ui.name.textContent = nameOf(s);
    ui.state.textContent = `${s.action} · ${ACTION_LABEL[s.action]}`;
    ui.actions.forEach((b) => {
      const on = b.dataset.action === s.action;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    refreshHeading(true);
  }
  function updateCount() { ui.count.textContent = `${flock.length} 只绵羊`; }
  let toastTimer = 0;
  function toast(msg) {
    ui.toast.textContent = msg;
    ui.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 1600);
  }
  let hintHidden = false;
  function hideHint() {
    if (hintHidden) return;
    hintHidden = true;
    setTimeout(() => ui.hint.classList.add('faded'), 2500);
  }

  // 键盘快捷键
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' && e.target.type !== 'range')) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') { select(null); return; }
    if (k === 'home' || (k === 'r' && !selected)) { cam.reset(); return; }
    if (!selected) return;
    if (['1', '2', '3', '4'].includes(k)) setAction(R.SHEEP_ACTIONS[Number(k) - 1]);
    else if (k === 'q') rotateSelected(-45);
    else if (k === 'e') rotateSelected(45);
    else if (k === 'd' && (e.ctrlKey || e.metaKey || !e.shiftKey)) { e.preventDefault(); duplicateSelected(); }
    else if (k === 'delete' || k === 'backspace') { e.preventDefault(); deleteSelected(); }
  });

  updateCount();
  refreshPanel();

  /* ---------------------------- 主循环 ---------------------------- */
  let elapsed = 0, uiTimer = 0, lastT = null;
  renderer.setAnimationLoop((now) => {
    const dt = lastT === null ? 0 : Math.min((now - lastT) / 1000, 1 / 20);
    lastT = now;
    elapsed += dt;
    World.update(elapsed, dt);
    for (const s of flock) s.update(dt, ctx);
    cam.update(dt);
    processHover();
    uiTimer += dt;
    if (uiTimer > 0.12) { uiTimer = 0; refreshHeading(false); }
    renderer.render(scene, camera);
  });

  // 调试 / 二次开发接口
  window.ranch = {
    THREE, scene, camera, renderer, cam, flock, World,
    get selected() { return selected; },
    select: (i) => select(typeof i === 'number' ? flock[i] : i),
    setAction, rotateSelected, duplicateSelected, deleteSelected, addNewSheep,
    screenPos(s) {
      const r = canvas.getBoundingClientRect();
      tmpV.copy(s.position); tmpV.y += 0.55 * s.size + s.lift.position.y; tmpV.project(camera);
      return { x: r.left + ((tmpV.x + 1) / 2) * r.width, y: r.top + ((1 - tmpV.y) / 2) * r.height };
    },
  };
})();
