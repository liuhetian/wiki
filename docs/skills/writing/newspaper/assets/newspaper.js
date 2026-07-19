/* ============================================================
   报纸版交互组件 (newspaper-style)
   全部基于 class/属性钩子，自初始化，无硬编码 id。
   放在 </body> 前： <script src=".../newspaper.js"></script>
   （另需在 <head> 尽早放：
      <script>document.documentElement.className += ' js';</script>
    以避免原生下拉闪现。本文件也会兜底补上 .js 类。）

   钩子约定：
   - 自定义下拉：    <select class="np-select"> … </select>
   - 改值即提交：    把 select 放进 <form data-np-autosubmit> （可选）
   - 加载遮罩：      表单提交时，自动给页面里的 .loading-overlay 加 .show
   - 复制链接：      <button class="np-copy" data-link="/foo">复制链接</button>
   - 提示 toast：    页面有 <div class="toast"></div> 则复用，否则自动创建
   ============================================================ */
(function () {
    document.documentElement.className += ' js';

    /* ---- toast ---- */
    var toastEl = document.querySelector('.toast');
    var toastTimer = null;
    function ensureToast() {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'toast';
            document.body.appendChild(toastEl);
        }
        return toastEl;
    }
    function showToast(msg) {
        var t = ensureToast();
        t.textContent = msg;
        t.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1600);
    }

    /* ---- 加载遮罩 ---- */
    function showLoading() {
        document.querySelectorAll('.loading-overlay').forEach(function (o) { o.classList.add('show'); });
    }
    function hideLoading() {
        document.querySelectorAll('.loading-overlay').forEach(function (o) { o.classList.remove('show'); });
    }
    // 后退/bfcache 恢复时清除残留遮罩
    window.addEventListener('pageshow', hideLoading);
    // 任意表单提交（含原生按钮）都显示遮罩
    document.querySelectorAll('form').forEach(function (f) {
        f.addEventListener('submit', showLoading);
    });

    /* ---- 复制链接 ---- */
    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast('链接已复制'); }
        catch (e) { showToast('复制失败，请手动复制'); }
        document.body.removeChild(ta);
    }
    document.querySelectorAll('.np-copy').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var link = btn.getAttribute('data-link') || '';
            var full = /^https?:/i.test(link) ? link : (window.location.origin + link);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(full).then(
                    function () { showToast('链接已复制'); },
                    function () { fallbackCopy(full); }
                );
            } else {
                fallbackCopy(full);
            }
        });
    });

    /* ---- 自定义下拉 ---- */
    function closeAll(except) {
        document.querySelectorAll('.custom-select.open').forEach(function (w) {
            if (w !== except && w._close) w._close();
        });
    }

    function buildSelect(sel) {
        var autosubmit = !!sel.closest('form[data-np-autosubmit]');

        var wrap = document.createElement('div');
        wrap.className = 'custom-select';

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'cs-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        var label = document.createElement('span');
        label.className = 'cs-label';
        var arrow = document.createElement('span');
        arrow.className = 'cs-arrow';
        trigger.appendChild(label);
        trigger.appendChild(arrow);

        var menu = document.createElement('ul');
        menu.className = 'cs-menu';
        menu.setAttribute('role', 'listbox');

        var activeIdx = -1;
        function setActive(i) {
            var items = menu.children;
            for (var k = 0; k < items.length; k++) items[k].classList.toggle('active', k === i);
            activeIdx = i;
            if (i >= 0 && items[i]) items[i].scrollIntoView({ block: 'nearest' });
        }
        function syncLabel() { label.textContent = sel.options[sel.selectedIndex].textContent.trim(); }
        function choose(i) {
            sel.selectedIndex = i;
            syncLabel();
            close();
            sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        function open() {
            closeAll(wrap);
            wrap.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            setActive(sel.selectedIndex);
        }
        function close() {
            wrap.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
            setActive(-1);
        }
        wrap._close = close;

        Array.prototype.forEach.call(sel.options, function (opt, i) {
            var li = document.createElement('li');
            li.className = 'cs-option' + (opt.selected ? ' selected' : '');
            li.setAttribute('role', 'option');
            li.textContent = opt.textContent.trim();
            li.addEventListener('click', function (e) { e.stopPropagation(); choose(i); });
            menu.appendChild(li);
        });
        syncLabel();

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            if (wrap.classList.contains('open')) close(); else open();
        });
        trigger.addEventListener('keydown', function (e) {
            var n = menu.children.length;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (!wrap.classList.contains('open')) { open(); return; }
                var ni = activeIdx + (e.key === 'ArrowDown' ? 1 : -1);
                if (ni < 0) ni = 0;
                if (ni >= n) ni = n - 1;
                setActive(ni);
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (wrap.classList.contains('open')) {
                    e.preventDefault();
                    if (activeIdx >= 0) choose(activeIdx);
                }
            } else if (e.key === 'Escape') {
                close();
            }
        });

        // 改值即提交（可选）：先显示遮罩再提交
        if (autosubmit) {
            sel.addEventListener('change', function () {
                showLoading();
                sel.form.submit();
            });
        }

        wrap.appendChild(trigger);
        wrap.appendChild(menu);
        sel.parentNode.appendChild(wrap);
    }

    document.querySelectorAll('select.np-select').forEach(buildSelect);
    document.addEventListener('click', function () { closeAll(null); });
})();
