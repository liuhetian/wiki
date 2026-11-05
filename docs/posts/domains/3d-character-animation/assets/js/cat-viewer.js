/* =========================================================================
 * cat-viewer.js — 小橘猫模型预览：圆形草地底座、柔和阴影、
 * 拖动旋转 / 滚轮或双指缩放 / 右键或双指平移、自动旋转、动画开关
 * ========================================================================= */
(function () {
  'use strict';
  const THREE = window.THREE;
  const R = window.RANCH;

  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = Number(THREE.REVISION) >= 182 ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap; // r182 起 PCFSoft 弃用，PCF 已是柔和过滤
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#fbf3e3');
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);

  scene.add(new THREE.HemisphereLight('#fffaf2', '#ecdcc0', 1.6));
  const sun = new THREE.DirectionalLight('#fff6ea', 2.3);
  sun.position.set(-2.2, 4, 3.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -1.4, right: 1.4, top: 1.6, bottom: -1.2, near: 0.5, far: 12 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.01;
  scene.add(sun);

  // 圆形低多边形草地底座
  const stage = new THREE.Group();
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.86, 0.26, 14), new THREE.MeshStandardMaterial({ color: '#ead6ab', flatShading: true, roughness: 1 }));
  soil.position.y = -0.15;
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.93, 0.06, 14), new THREE.MeshStandardMaterial({ color: '#a9d472', flatShading: true, roughness: 1 }));
  grass.position.y = -0.025;
  soil.receiveShadow = grass.receiveShadow = true;
  soil.castShadow = true;
  stage.add(soil, grass);
  // 几簇小草
  const bladeGeo = new THREE.ConeGeometry(0.012, 0.09, 3).translate(0, 0.045, 0);
  const bladeMat = new THREE.MeshStandardMaterial({ color: '#86bb55', flatShading: true, roughness: 1 });
  const rng = R.util.mulberry32(7);
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2, r = 0.45 + rng() * 0.43;
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(bladeGeo, bladeMat);
      m.position.set(Math.cos(a) * r + (rng() - 0.5) * 0.06, 0.004, Math.sin(a) * r + (rng() - 0.5) * 0.06);
      m.rotation.set((rng() - 0.5) * 0.5, rng() * 3, (rng() - 0.5) * 0.5);
      m.scale.setScalar(0.7 + rng() * 0.6);
      stage.add(m);
    }
  }
  scene.add(stage);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ color: '#6b5636', opacity: 0.14 }));
  catcher.position.y = -0.281;
  catcher.receiveShadow = true;
  scene.add(catcher);

  // 小猫
  const cat = new R.Cat();
  scene.add(cat.root);

  // 相机（默认正面略俯视，与参考图同角度）
  const cam = new R.OrbitCam(camera, {
    theta: 0, phi: 1.36, radius: 3.4, target: new THREE.Vector3(0, 0.46, 0),
    minRadius: 1.2, maxRadius: 8, minPhi: 0.25, maxPhi: 1.6, bounds: 1.2, rotateSpeed: 0.008,
    viewportHeight: () => window.innerHeight,
  });
  function fit() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const r = 3.4 * Math.pow(Math.max(1, 0.75 / camera.aspect), 0.9); // 竖屏时适当拉远，保证小猫完整
    cam.setHome({ radius: r });
  }
  window.addEventListener('resize', fit);
  fit();
  cam.reset();
  cam.cur.radius = cam.goal.radius;

  // 指针交互：单指/左键旋转，双指捏合缩放+平移，右键/中键平移，滚轮缩放
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
    if (pts.size === 1) { const q = [...pts.values()][0]; last = { x: q.x, y: q.y }; pinch = null; }
    if (pts.size === 0) { last = null; pinch = null; }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    cam.zoom(Math.exp(Math.max(-300, Math.min(300, e.deltaY * (e.deltaMode ? 33 : 1))) * 0.0012));
  }, { passive: false });

  // 按钮
  let playing = true, autoRotate = false;
  const $ = (id) => document.getElementById(id);
  function syncButtons() {
    $('play').classList.toggle('on', playing);
    $('play').querySelector('span').textContent = playing ? '暂停动画' : '播放动画';
    $('spin').classList.toggle('on', autoRotate);
  }
  $('play').addEventListener('click', () => { playing = !playing; syncButtons(); });
  $('spin').addEventListener('click', () => { autoRotate = !autoRotate; syncButtons(); });
  $('reset').addEventListener('click', () => { autoRotate = false; syncButtons(); cam.reset(); });
  syncButtons();

  let lastT = null;
  renderer.setAnimationLoop((now) => {
    const dt = lastT === null ? 0 : Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    if (playing) cat.update(dt);
    if (autoRotate) cam.goal.theta += dt * 0.5;
    cam.update(dt);
    renderer.render(scene, camera);
  });

  window.catViewer = { THREE, scene, camera, renderer, cam, cat };
})();
