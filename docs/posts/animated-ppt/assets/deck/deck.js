(() => {
  const content = window.CONTENT;
  const stageInner = document.getElementById('stageInner');

  Layouts.buildDeck(content, stageInner);

  const SCENE_COUNT = content.scenes.length;
  const imgs = content.media.filter(m => m.id.startsWith('s')).map(m => document.getElementById(m.id));
  const vidMeta = content.media.filter(m => m.id.startsWith('v'));
  const vids = vidMeta.map(m => document.getElementById(m.id));
  const transToVidIdx = new Array(SCENE_COUNT - 1).fill(-1);
  const vidToTransIdx = [];
  vidMeta.forEach((m, vi) => {
    const match = m.id.match(/^v(\d+)_/);
    if (match) {
      const ti = parseInt(match[1], 10);
      if (ti < SCENE_COUNT - 1) transToVidIdx[ti] = vi;
      vidToTransIdx[vi] = ti;
    }
  });
  const scenes = document.querySelectorAll('.scene');
  const hint = document.getElementById('scrollHint');
  const footerMeta = document.getElementById('footerMeta');
  const chapterRow = document.getElementById('chapterRow');
  const navLinks = document.querySelectorAll('.nav-menu a[data-jump]');

  const sceneToChapter = content.scenes.map(s => s.chapter);

  // ===== scroll mapping =====
  const SCENE_WT = 1;
  const TRANS_WT_VIDEO = 5;
  const TRANS_WT_NONE = 0.3;
  const rawSegs = [];
  for (let i = 0; i < SCENE_COUNT; i++) {
    rawSegs.push({ kind: 'scene', idx: i, w: SCENE_WT });
    if (i < SCENE_COUNT - 1) {
      rawSegs.push({ kind: 'trans', idx: i, w: transToVidIdx[i] >= 0 ? TRANS_WT_VIDEO : TRANS_WT_NONE });
    }
  }
  const totalW = rawSegs.reduce((s, r) => s + r.w, 0);
  const segments = [];
  let cursor = 0;
  rawSegs.forEach(r => {
    const span = r.w / totalW;
    segments.push({ start: cursor, end: cursor + span, kind: r.kind, idx: r.idx });
    cursor += span;
  });
  segments[segments.length - 1].end = 1.0;

  // looping background videos
  const loopBgs = content.media
    .filter(m => m.loop)
    .map(m => document.getElementById(m.id))
    .filter(el => el && el.tagName === 'VIDEO');
  loopBgs.forEach(v => v.play().catch(() => {}));

  const videoReady = new Array(vids.length).fill(false);
  const targetT = new Array(vids.length).fill(0);
  vids.forEach((v, i) => {
    v.addEventListener('loadedmetadata', () => { videoReady[i] = true; onScroll(); });
  });

  const lastOpImg = new Array(imgs.length).fill(-1);
  const lastOpVid = new Array(vids.length).fill(-1);
  let lastActive = -1;

  function setImgOp(i, v) {
    const r = Math.round(v * 1000) / 1000;
    if (lastOpImg[i] !== r) { imgs[i].style.opacity = r; lastOpImg[i] = r; }
    if (loopBgs.includes(imgs[i]) && imgs[i].paused && r > 0) imgs[i].play().catch(() => {});
  }
  function setVidOp(i, v) {
    const r = Math.round(v * 1000) / 1000;
    if (lastOpVid[i] !== r) { vids[i].style.opacity = r; lastOpVid[i] = r; }
  }

  function onScroll() {
    const max = document.body.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;

    const oi = new Array(imgs.length).fill(0);
    const ov = new Array(vids.length).fill(0);

    let seg = segments[segments.length - 1];
    for (let i = 0; i < segments.length; i++) {
      if (p < segments[i].end) { seg = segments[i]; break; }
    }

    let active;
    if (seg.kind === 'scene') {
      oi[seg.idx] = 1;
      active = seg.idx;
    } else {
      const t = (p - seg.start) / (seg.end - seg.start);
      const si = seg.idx;
      const vi = transToVidIdx[si];
      if (vi >= 0 && videoReady[vi]) {
        ov[vi] = 1;
        targetT[vi] = t * vids[vi].duration;
      } else {
        oi[si] = 1 - t;
        oi[si + 1] = t;
      }
      active = (t < 0.5) ? si : (si + 1);
    }

    for (let i = 0; i < imgs.length; i++) setImgOp(i, oi[i]);
    for (let i = 0; i < vids.length; i++) setVidOp(i, ov[i]);

    if (active !== lastActive) {
      scenes.forEach(sc => sc.classList.toggle('active', +sc.dataset.scene === active));
      footerMeta.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(SCENE_COUNT).padStart(2, '0') + ' \xb7 ' + content.meta.date;
      const chapIdx = sceneToChapter[active];
      chapterRow.querySelectorAll('.ch').forEach((el, i) => el.classList.toggle('active', i === chapIdx));
      navLinks.forEach(a => a.classList.toggle('active', sceneToChapter[+a.dataset.jump] === chapIdx));
      stageInner.dataset.active = String(active);

      if (lastActive !== -1) {
        const prevScene = content.scenes[lastActive];
        if (prevScene && prevScene.layout === 'accordion') {
          closeAllAccordions();
          resetAccordionCovers();
        }
      }

      lastActive = active;
    }

    hint.style.opacity = p > 0.015 ? 0 : 1;
  }

  function tick() {
    for (let i = 0; i < vids.length; i++) {
      if (!videoReady[i]) continue;
      const v = vids[i];
      if (Math.abs(targetT[i] - v.currentTime) > 0.005) v.currentTime = targetT[i];
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);

  // ===== animated scroll =====
  const FALLBACK_MS = 500, MIN_MS = 250, MAX_MS = 8000;
  function pathTransitionMs(p0, p1) {
    const a = Math.min(p0, p1), b = Math.max(p0, p1);
    let total = 0, hasVideo = false;
    for (let i = 0; i < vids.length; i++) {
      if (!videoReady[i]) continue;
      const ti = vidToTransIdx[i];
      const seg = segments.find(s => s.kind === 'trans' && s.idx === ti);
      if (!seg) continue;
      const overlap = Math.max(0, Math.min(b, seg.end) - Math.max(a, seg.start));
      const span = seg.end - seg.start;
      if (overlap > 0 && span > 0) {
        total += (overlap / span) * vids[i].duration * 1000;
        hasVideo = true;
      }
    }
    if (!hasVideo) return FALLBACK_MS;
    return Math.max(MIN_MS, Math.min(MAX_MS, total));
  }

  let scrollAnim = null;
  function scrollToP(targetP, duration) {
    const max = document.body.scrollHeight - window.innerHeight;
    const target = targetP * max;
    const start = window.scrollY;
    const delta = target - start;
    if (Math.abs(delta) < 1) return;
    if (duration === undefined) duration = pathTransitionMs(start / max, targetP);
    const t0 = performance.now();
    if (scrollAnim) cancelAnimationFrame(scrollAnim);
    function step(now) {
      const t = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, start + delta * t);
      if (t < 1) scrollAnim = requestAnimationFrame(step);
      else scrollAnim = null;
    }
    scrollAnim = requestAnimationFrame(step);
  }

  function gotoScene(idx) {
    idx = Math.max(0, Math.min(SCENE_COUNT - 1, idx));
    const seg = segments.find(s => s.kind === 'scene' && s.idx === idx);
    scrollToP(seg.start + (seg.end - seg.start) * 0.5);
  }
  function nextScene() { gotoScene((lastActive < 0 ? 0 : lastActive) + 1); }
  function prevScene() { gotoScene((lastActive < 0 ? 0 : lastActive) - 1); }

  // wire data-jump
  document.querySelectorAll('[data-jump]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      gotoScene(+el.dataset.jump);
    });
  });

  // ===== accordion covers =====
  document.querySelectorAll('.acc-cover').forEach(cover => {
    cover.addEventListener('click', () => {
      const cases = cover.parentElement.querySelector('.acc-cases');
      cover.classList.add('hidden');
      if (cases) cases.classList.add('acc-cases-visible');
    });
  });

  function resetAccordionCovers() {
    document.querySelectorAll('.acc-cover').forEach(cover => {
      cover.classList.remove('hidden');
      const cases = cover.parentElement.querySelector('.acc-cases');
      if (cases) cases.classList.remove('acc-cases-visible');
    });
  }

  // ===== accordion =====
  const allAccs = document.querySelectorAll('.acc');

  function closeAllAccordions() {
    allAccs.forEach(acc => {
      acc.classList.remove('has-expanded');
      acc.querySelectorAll('.acc-case.expanded').forEach(c => c.classList.remove('expanded'));
    });
  }

  function loadCodeBlocks(container) {
    container.querySelectorAll('.detail-code-block[data-code-src]').forEach(pre => {
      if (pre.dataset.loaded) return;
      pre.dataset.loaded = '1';
      fetch(pre.dataset.codeSrc)
        .then(r => r.ok ? r.text() : Promise.reject())
        .then(code => {
          pre.textContent = code;
        })
        .catch(() => {
          pre.textContent = '// 无法加载文件';
        });
    });
  }

  document.addEventListener('wheel', (e) => {
    const block = e.target.closest('.detail-code-block');
    if (!block) return;
    const atTop = block.scrollTop <= 0 && e.deltaY < 0;
    const atBottom = block.scrollTop + block.clientHeight >= block.scrollHeight - 1 && e.deltaY > 0;
    if (!atTop && !atBottom) {
      e.preventDefault();
      e.stopPropagation();
      block.scrollTop += e.deltaY;
    }
  }, { passive: false, capture: true });

  document.querySelectorAll('.title-toggle').forEach(title => {
    title.addEventListener('click', (e) => {
      e.stopPropagation();
      const detail = title.closest('.case-detail');
      const mode = title.dataset.toggle;
      if (mode === 'code') {
        detail.classList.toggle('show-code');
        if (detail.classList.contains('show-code')) loadCodeBlocks(detail);
      } else if (mode === 'reveal') {
        detail.querySelectorAll('.reveal-wrap').forEach(r => r.classList.add('revealed'));
      }
    });
  });

  allAccs.forEach(acc => {
    acc.querySelectorAll('.acc-case').forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('acc-case-empty')) return;
        if (card.classList.contains('expanded')) {
          acc.classList.remove('has-expanded');
          acc.querySelectorAll('.acc-case.expanded').forEach(c => {
            c.classList.remove('expanded');
            const det = c.querySelector('.case-detail');
            if (det) det.classList.remove('show-code');
            c.querySelectorAll('.reveal-wrap.revealed').forEach(r => r.classList.remove('revealed'));
          });
          return;
        }
        acc.querySelectorAll('.acc-case').forEach(c => c.classList.remove('expanded'));
        card.classList.add('expanded');
        acc.classList.add('has-expanded');
      });
    });
  });

  // ===== mini slideshow =====
  document.querySelectorAll('.mini-slideshow').forEach(ss => {
    const slides = ss.querySelectorAll('.ms-slide');
    const counter = ss.querySelector('.ms-counter');
    const total = slides.length;
    let cur = 0;
    const go = (idx) => {
      slides[cur].classList.remove('ms-active');
      cur = (idx + total) % total;
      slides[cur].classList.add('ms-active');
      if (counter) counter.textContent = `${cur + 1} / ${total}`;
    };
    ss.querySelector('.ms-prev')?.addEventListener('click', (e) => { e.stopPropagation(); go(cur - 1); });
    ss.querySelector('.ms-next')?.addEventListener('click', (e) => { e.stopPropagation(); go(cur + 1); });
  });

  // ===== keyboard =====
  window.addEventListener('keydown', (e) => {
    if (e.target.matches && e.target.matches('input,textarea,[contenteditable]')) return;
    if (e.key === 'Escape') {
      const anyExpanded = Array.from(allAccs).some(a => a.classList.contains('has-expanded'));
      if (anyExpanded) {
        e.preventDefault();
        allAccs.forEach(acc => {
          acc.classList.remove('has-expanded');
          acc.querySelectorAll('.acc-case.expanded').forEach(c => c.classList.remove('expanded'));
        });
        return;
      }
    }
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ':
      case 'n': case 'N':
        e.preventDefault(); nextScene(); break;
      case 'ArrowLeft': case 'PageUp':
      case 'p': case 'P':
        e.preventDefault(); prevScene(); break;
      case 'ArrowDown': e.preventDefault(); nextScene(); break;
      case 'ArrowUp':   e.preventDefault(); prevScene(); break;
      case 'Home':      e.preventDefault(); gotoScene(0); break;
      case 'End':       e.preventDefault(); gotoScene(SCENE_COUNT - 1); break;
      case 'f': case 'F':
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
        break;
      default:
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          const n = parseInt(e.key, 10);
          if (n >= 1 && n <= SCENE_COUNT) gotoScene(n - 1);
        }
    }
  });

  onScroll();
  requestAnimationFrame(tick);

  // ===== global timer =====
  const timerEl = document.getElementById('globalTimer');
  if (timerEl) {
    const t0 = Date.now();
    setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      const m = Math.floor(s / 60);
      const ss = s % 60;
      timerEl.textContent = String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
    }, 1000);
  }

  window.Deck = { gotoScene, nextScene, prevScene, closeAccordion: closeAllAccordions };
})();
