window.Layouts = {

  blank() {
    return '';
  },

  hero(s) {
    let h = '<div class="col-text">';
    if (s.kicker) h += `<div class="kicker">${s.kicker}</div>`;
    if (s.headlineMid) h += `<p class="headline-mid">${s.headlineMid}</p>`;
    if (s.headline) h += `<h1 class="headline">${s.headline}</h1>`;
    if (s.subhead) h += `<p class="subhead">${s.subhead}</p>`;
    h += '</div>';
    return h;
  },

  left(s) {
    let h = '<div class="col-text">';
    if (s.kicker) h += `<div class="kicker">${s.kicker}</div>`;
    if (s.headline) h += `<h1 class="headline">${s.headline}</h1>`;
    if (s.subhead) h += `<p class="subhead">${s.subhead}</p>`;
    if (s.flow) h += `<div class="kicker flow">${s.flow}</div>`;
    if (s.bodyNote) h += `<p class="body-note">${s.bodyNote}</p>`;
    h += '</div>';
    if (s.stats) {
      h += '<div class="col-stats">';
      s.stats.forEach(st => {
        h += '<div class="stat">';
        h += `<div class="num">${st.num}</div>`;
        h += `<div class="note">${st.note}</div>`;
        h += '</div>';
      });
      h += '</div>';
    }
    return h;
  },

  dual(s) {
    let h = '';
    if (s.kicker) h += `<div class="dual-kicker"><div class="kicker">${s.kicker}</div></div>`;
    h += '<div class="dual-cols">';
    s.columns.forEach(col => {
      h += '<div class="dual-col">';
      h += `<div class="dual-col-title">${col.title}</div>`;
      h += `<div class="dual-col-body">${col.body}</div>`;
      h += '</div>';
    });
    h += '</div>';
    if (s.footer || s.footerNote) {
      h += '<div class="dual-footer">';
      if (s.footer) h += `<p class="dual-footer-main">${s.footer}</p>`;
      if (s.footerNote) h += `<p class="dual-footer-note">${s.footerNote}</p>`;
      h += '</div>';
    }
    return h;
  },

  anchor(s) {
    let h = '<div class="col-text">';
    if (s.kicker) h += `<div class="kicker">${s.kicker}</div>`;
    if (s.headline) h += `<h1 class="headline">${s.headline}</h1>`;
    if (s.subhead) h += `<p class="subhead">${s.subhead}</p>`;
    h += '</div>';

    if (s.modules) {
      h += '<div class="col-stats"><div class="chapter-modules">';
      s.modules.forEach(m => {
        h += '<div class="mod">';
        h += `<div class="mod-num">${m.num}</div>`;
        h += `<div class="mod-name">${m.name}</div>`;
        h += `<div class="mod-tag">${m.tag}</div>`;
        h += '</div>';
      });
      h += '</div></div>';
    }
    return h;
  },

  steps(s) {
    let h = '<div class="col-steps">';
    if (s.kicker) h += `<div class="kicker">${s.kicker}</div>`;
    h += '<div class="steps-list">';
    s.steps.forEach(st => {
      h += '<div class="step">';
      h += `<div class="step-num">${st.num}</div>`;
      h += '<div class="step-body">';
      h += `<div class="step-title">${st.title}</div>`;
      h += `<div class="step-desc">${st.desc}</div>`;
      h += '</div></div>';
    });
    h += '</div></div>';

    h += '<div class="col-text">';
    if (s.headline) h += `<h1 class="headline">${s.headline}</h1>`;
    if (s.quote) h += `<blockquote class="steps-quote">${s.quote}</blockquote>`;
    if (s.embed) h += `<div class="steps-embed">${s.embed}</div>`;
    h += '</div>';

    return h;
  },

  accordion(s) {
    const id = s.accId || 'acc-' + s._idx;
    const ov = s.overview;
    let h = `<div class="acc" id="${id}">`;

    h += '<div class="acc-overview">';
    h += `<div class="ov-kicker">${ov.kicker}</div>`;
    h += `<h2 class="ov-title">${ov.title}</h2>`;
    h += `<p class="ov-lead">${ov.lead}</p>`;
    h += `<p class="ov-note">${ov.note}</p>`;
    h += '</div>';

    h += '<div class="acc-cases-wrap">';
    if (s.coverImg) {
      h += `<div class="acc-cover">`;
      h += `<img src="${s.coverImg}" alt="">`;
      h += '<div class="acc-cover-hint">点击查看详情 →</div>';
      h += '</div>';
    }
    h += `<div class="acc-cases${s.coverImg ? ' acc-cases-hidden' : ''}">`;
    s.cases.forEach((c, ci) => {
      const isEmpty = !c.detail || (!c.detail.title && (!c.detail.paragraphs || !c.detail.paragraphs.length) && (!c.detail.aside || !c.detail.aside.length));
      h += `<div class="acc-case${isEmpty ? ' acc-case-empty' : ''}" data-case="${ci + 1}">`;

      h += '<div class="case-collapsed">';
      h += `<div class="case-tag">${c.tag}</div>`;
      h += `<div class="case-title">${c.title}</div>`;
      h += `<div class="case-summary">${c.summary}</div>`;
      h += '<span class="case-arrow">→</span>';
      h += '</div>';

      const det = c.detail || {};
      h += '<div class="case-detail">';
      const hasToggle = det.codeFile || det.reveal;
      h += '<div class="detail-head">';
      if (hasToggle) {
        h += `<div class="detail-title title-toggle" data-toggle="${det.codeFile ? 'code' : 'reveal'}">${det.title || c.title || ''}</div>`;
      } else {
        h += `<div class="detail-title">${det.title || c.title || ''}</div>`;
      }
      h += '</div>';
      h += '<div class="detail-body">';
      h += '<div class="detail-text">';
      (det.paragraphs || []).forEach(p => { h += `<p>${p}</p>`; });
      h += '</div>';
      if (det.codeFile) {
        h += '<div class="detail-code-col">';
        h += `<div class="detail-code-label">${det.codeFile.split('/').pop()}</div>`;
        h += `<pre class="detail-code-block" data-code-src="${det.codeFile}"></pre>`;
        h += '</div>';
      }
      if (det.aside && det.aside.length) {
        h += '<div class="detail-aside">';
        det.aside.forEach(a => {
          h += '<div class="aside-row">';
          h += `<div class="aside-kicker">${a.kicker}</div>`;
          h += `<div>${a.text}</div>`;
          h += '</div>';
        });
        h += '</div>';
      }
      h += '</div></div>';

      h += '</div>';
    });
    h += '</div></div></div>';

    return h;
  },

  buildDeck(content, stageInner) {
    let html = '';

    // bg-layer
    html += '<div class="bg-layer">';
    content.media.forEach(m => {
      if (m.type === 'image') {
        html += `<img id="${m.id}" src="${m.src}" alt="">`;
      } else {
        const attrs = 'muted playsinline preload="auto"' + (m.loop ? ' loop' : '');
        html += `<video id="${m.id}" src="${m.src}" ${attrs}></video>`;
      }
    });
    html += '</div>';

    // nav
    html += '<nav class="nav">';
    html += `<div class="nav-logo">${content.meta.logo}</div>`;
    html += '<div class="nav-menu">';
    content.nav.forEach(n => {
      html += `<a href="#" data-jump="${n.jump}">${n.label}</a>`;
    });
    html += '</div>';
    html += '<div class="nav-right">';
    html += `<span class="nav-link">${content.meta.version} \xb7 ${content.meta.date}</span>`;
    html += '</div></nav>';

    // scenes
    html += '<div class="scenes">';
    content.scenes.forEach((s, i) => {
      const extra = (s.classes || []).map(c => ' ' + c).join('');
      html += `<section class="scene layout-${s.layout}${extra}" data-scene="${i}" data-chapter="${s.chapter}">`;
      s._idx = i;
      const renderer = Layouts[s.layout];
      if (renderer) html += renderer(s);
      html += '</section>';
    });
    html += '</div>';

    // bottom strip
    html += '<div class="bottom-strip-anchor">';
    html += '<div class="chapter-row" id="chapterRow">';
    content.chapters.forEach((ch, i) => {
      html += `<span class="ch" data-jump="${i}"><span class="mark ${ch.mark}"></span>${ch.label}</span>`;
    });
    html += '</div>';
    html += `<div class="footer-meta" id="footerMeta">01 / ${String(content.scenes.length).padStart(2, '0')} \xb7 ${content.meta.date}</div>`;
    html += '</div>';

    // scroll hint + wait corner
    html += '<div class="scroll-hint" id="scrollHint">Scroll <span class="bar"></span></div>';
    html += '<div class="wait-corner">入场中 \xb7 调试投屏 \xb7 Scroll to begin</div>';

    stageInner.innerHTML = html;
  },
};
