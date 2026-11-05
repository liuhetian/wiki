/* =========================================================================
 * viewer.js — 牧场里的绵羊和树单独拿出来看：圆形草地底座、柔和阴影、
 * 拖动旋转 / 滚轮或双指缩放 / 右键或双指平移、自动旋转、动画开关。
 * 模型代码不另存：绵羊直接 new 牧场的 RANCH.Sheep，树从 RANCH.World.build
 * 搭出的整片牧场里取出来（13 棵，最后一棵是粉紫色的）。
 * 网址参数：?m=sheep|tree 选模型；绵羊另有 a=Idle|Graze|Walk|Jump、seed=数字；
 * 树另有 t=序号（从 1 数）或 t=pink。
 * ========================================================================= */
(function () {
  'use strict';
  const THREE = window.THREE;
  const R = window.RANCH;
  const q = new URLSearchParams(location.search);
  const MODEL = q.get('m') === 'tree' ? 'tree' : 'sheep';

  // 两种模型各自的底座大小、阴影范围和默认镜头
  const CFG = {
    sheep: { disc: 1.25, shadow: [-1.7, 1.7, 1.9, -1.5], cam: { theta: 0.75, phi: 1.2, radius: 5.0, target: [0, 0.48, 0] }, min: 1.6, max: 10 },
    tree: { disc: 2.3, shadow: [-2.8, 2.8, 4.6, -2.6], cam: { theta: 0.6, phi: 1.26, radius: 12, target: [0, 1.75, 0] }, min: 3, max: 22 },
  }[MODEL];

  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = Number(THREE.REVISION) >= 182 ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#fbf3e3');
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);

  scene.add(new THREE.HemisphereLight('#fffaf2', '#ecdcc0', 1.6));
  const sun = new THREE.DirectionalLight('#fff6ea', 2.3);
  const S = CFG.disc / 1.25;
  sun.position.set(-2.6 * S, 5 * S, 3.6 * S);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const [sl, sr, st, sb] = CFG.shadow;
  Object.assign(sun.shadow.camera, { left: sl, right: sr, top: st, bottom: sb, near: 0.5, far: 20 * S });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.01;
  scene.add(sun);

  // 圆形低多边形草地底座（同小橘猫那页）
  const D = CFG.disc;
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(D * 0.97, D * 0.9, 0.26 * S, 14), new THREE.MeshStandardMaterial({ color: '#ead6ab', flatShading: true, roughness: 1 }));
  soil.position.y = -0.15 * S;
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(D, D * 0.98, 0.06 * S, 14), new THREE.MeshStandardMaterial({ color: '#a9d472', flatShading: true, roughness: 1 }));
  grass.position.y = -0.025 * S;
  soil.receiveShadow = grass.receiveShadow = true;
  soil.castShadow = true;
  scene.add(soil, grass);
  const bladeGeo = new THREE.ConeGeometry(0.014 * S, 0.1 * S, 3).translate(0, 0.05 * S, 0);
  const bladeMat = new THREE.MeshStandardMaterial({ color: '#86bb55', flatShading: true, roughness: 1 });
  const rngDeco = R.util.mulberry32(7);
  for (let i = 0; i < 30; i++) {
    const a = rngDeco() * Math.PI * 2, r = D * (0.5 + rngDeco() * 0.45);
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(bladeGeo, bladeMat);
      m.position.set(Math.cos(a) * r + (rngDeco() - 0.5) * 0.07 * S, 0.004, Math.sin(a) * r + (rngDeco() - 0.5) * 0.07 * S);
      m.rotation.set((rngDeco() - 0.5) * 0.5, rngDeco() * 3, (rngDeco() - 0.5) * 0.5);
      m.scale.setScalar(0.7 + rngDeco() * 0.6);
      scene.add(m);
    }
  }
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ color: '#6b5636', opacity: 0.14 }));
  catcher.position.y = -0.281 * S;
  catcher.receiveShadow = true;
  scene.add(catcher);

  const $ = (id) => document.getElementById(id);
  document.body.dataset.model = MODEL;

  /* ---------------------------- 绵羊 ---------------------------- */
  let sheep = null;
  // 牧场的羊要问「这里能不能走、地面多高」；这里给一块无限平地，走路时每帧把羊拉回原点，原地踏步
  const flatWorld = { heightAt: () => 0, isWalkable: () => true };
  const LABEL = { Idle: '待机', Graze: '吃草', Walk: '行走', Jump: '跳跃' };
  function makeSheep(seed, action) {
    if (sheep) sheep.dispose();
    sheep = new R.Sheep({ seed, action, heading: 0 });
    scene.add(sheep.root);
    sheep.update(0, { world: flatWorld, flock: [sheep] });
    $('sub').textContent = `seed ${seed} · 程序化低多边形几何`;
    syncActions();
  }
  function syncActions() {
    document.querySelectorAll('[data-action]').forEach((b) => b.classList.toggle('on', sheep && b.dataset.action === sheep.action));
  }
  function updateSheep(dt) {
    sheep.update(dt, { world: flatWorld, flock: [sheep] });
    const p = sheep.root.position;
    p.x = 0; p.z = 0;
    sheep._prev.set(0, 0);
    sheep.headingTarget = 0; // 漫游转向不要，朝向交给相机
  }

  /* ---------------------------- 树 ---------------------------- */
  let trees = [], treeIdx = 0, shown = null;
  function pickTree(i) {
    treeIdx = (i + trees.length) % trees.length;
    if (shown) scene.remove(shown);
    shown = trees[treeIdx];
    shown.position.set(0, 0, 0);
    scene.add(shown);
    const pink = shown.name === 'pink-tree';
    $('sub').textContent = `牧场里的第 ${treeIdx + 1} / ${trees.length} 棵${pink ? ' · 粉紫色那棵' : ''}`;
  }

  if (MODEL === 'sheep') {
    $('title').textContent = '绵羊 · 3D 模型';
    const a0 = q.get('a');
    const seed = Number(q.get('seed')) || 20261105;
    makeSheep(seed, R.SHEEP_ACTIONS.includes(a0) ? a0 : 'Idle');
    document.querySelectorAll('[data-action]').forEach((b) => {
      b.textContent = LABEL[b.dataset.action];
      b.addEventListener('click', () => { sheep.setAction(b.dataset.action); syncActions(); });
    });
    $('next').textContent = '换一只';
    $('next').addEventListener('click', () => makeSheep(Math.floor(Math.random() * 1e9), sheep.action));
  } else {
    $('title').textContent = '树 · 3D 模型';
    const world = R.World.build(new THREE.Scene()); // 搭一整片牧场，只取里面的树
    trees = [...world.getObjectByName('trees').children];
    const t0 = q.get('t');
    pickTree(t0 === 'pink' ? trees.length - 1 : (Number(t0) || 1) - 1);
    $('next').textContent = '换一棵';
    $('next').addEventListener('click', () => pickTree(treeIdx + 1));
  }

  /* ---------------------------- 相机与交互 ---------------------------- */
  const c0 = CFG.cam;
  const cam = new R.OrbitCam(camera, {
    theta: c0.theta, phi: c0.phi, radius: c0.radius, target: new THREE.Vector3(...c0.target),
    minRadius: CFG.min, maxRadius: CFG.max, minPhi: 0.25, maxPhi: 1.6, bounds: D, rotateSpeed: 0.008,
    viewportHeight: () => window.innerHeight,
  });
  function fit() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    cam.setHome({ radius: c0.radius * Math.max(1, 0.85 / camera.aspect) }); // 竖屏时拉远，保证模型和底座大致完整
  }
  window.addEventListener('resize', fit);
  fit();
  cam.reset();
  cam.cur.radius = cam.goal.radius;

  const pts = new Map();
  let last = null, pinch = null, panMode = false;
  const pinchInfo = () => {
    const [a, b] = [...pts.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    autoRotate = false; syncButtons();
    if (pts.size === 1) { last = { x: e.clientX, y: e.clientY }; panMode = e.button === 1 || e.button === 2 || e.shiftKey; }
    else if (pts.size === 2) pinch = pinchInfo();
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    p.x = e.clientX; p.y = e.clientY;
    if (pts.size >= 2 && pinch) {
      const now = pinchInfo();
      if (now.d > 0) cam.zoom(pinch.d / now.d);
      cam.pan(now.x - pinch.x, now.y - pinch.y);
      pinch = now;
    } else if (last) {
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      if (panMode) cam.pan(dx, dy); else cam.rotate(dx, dy);
      last = { x: e.clientX, y: e.clientY };
    }
  });
  const end = (e) => {
    pts.delete(e.pointerId);
    if (pts.size === 1) { const p = [...pts.values()][0]; last = { x: p.x, y: p.y }; pinch = null; }
    if (pts.size === 0) { last = null; pinch = null; }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    cam.zoom(Math.exp(Math.max(-300, Math.min(300, e.deltaY * (e.deltaMode ? 33 : 1))) * 0.0012));
  }, { passive: false });

  let playing = true, autoRotate = false;
  function syncButtons() {
    $('play').classList.toggle('on', playing);
    $('play').textContent = playing ? '暂停动画' : '播放动画';
    $('spin').classList.toggle('on', autoRotate);
  }
  $('play').addEventListener('click', () => { playing = !playing; syncButtons(); });
  $('spin').addEventListener('click', () => { autoRotate = !autoRotate; syncButtons(); });
  $('reset').addEventListener('click', () => { autoRotate = false; syncButtons(); cam.reset(); });
  syncButtons();

  let lastT = null, t = 0;
  renderer.setAnimationLoop((now) => {
    const dt = lastT === null ? 0 : Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    if (playing) {
      t += dt;
      if (sheep) updateSheep(dt);
      else R.World.update(t); // 树冠的轻微摇摆
    }
    if (autoRotate) cam.goal.theta += dt * 0.5;
    cam.update(dt);
    renderer.render(scene, camera);
  });

  window.modelViewer = {
    THREE, scene, camera, renderer, cam, model: MODEL,
    get sheep() { return sheep; }, get tree() { return shown; }, trees: () => trees,
  };
})();
