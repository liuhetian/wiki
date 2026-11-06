// DOM overlay: title, hint line, progress bar and a few buttons.

const CSS = `
:root { --ink: #4a423a; --paper: rgba(246, 240, 229, 0.86); }
.ui { position: fixed; inset: 0; pointer-events: none; font-family: "Noto Serif SC", "Noto Serif CJK SC", "Songti SC", "STSong", serif; color: var(--ink); }
.ui .title { position: absolute; left: 12px; top: 12px; padding: 6px 12px; border-radius: 12px; background: rgba(246, 240, 229, 0.72); font-size: 15px; letter-spacing: 0.12em; line-height: 1.6; text-shadow: 0 1px 0 rgba(255,255,255,0.6); }
.ui .title b { font-size: 20px; font-weight: 600; letter-spacing: 0.08em; }
.ui .title small { display: block; opacity: 0.6; font-size: 12px; letter-spacing: 0.05em; }
.ui .meter { display: block; margin-top: 2px; font-size: 13px; letter-spacing: 0.08em; color: #3f4db0; font-variant-numeric: tabular-nums; }
.ui .hint { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); background: var(--paper); padding: 9px 18px; border-radius: 999px; font-size: 14px; letter-spacing: 0.06em; box-shadow: 0 2px 10px rgba(60, 40, 20, 0.12); white-space: nowrap; transition: opacity 0.3s; }
.ui .buttons { position: absolute; right: 16px; top: 14px; display: flex; gap: 8px; }
.ui button { pointer-events: auto; font: inherit; font-size: 13px; color: var(--ink); background: var(--paper); border: 1px solid rgba(74, 66, 58, 0.25); border-radius: 999px; padding: 6px 13px; cursor: pointer; letter-spacing: 0.06em; }
.ui button:hover { background: #fffaf0; }
.ui button.on { background: #3f4db0; color: #fff; border-color: #3f4db0; }
.ui .drive { position: absolute; right: 18px; bottom: 18px; width: 74px; height: 74px; border-radius: 50%; font-size: 14px; background: #d8402f; color: #fff; border: 3px solid #fff3e0; box-shadow: 0 3px 12px rgba(120, 40, 20, 0.3); touch-action: none; user-select: none; -webkit-user-select: none; }
.ui .drive:hover { background: #e2513f; }
.ui .drive.held { transform: scale(0.94); background: #b8352a; }
@media (max-width: 640px) {
  .ui .title { font-size: 12px; }
  .ui .title b { font-size: 16px; }
  .ui .title small { display: none; }
  .ui .buttons { top: auto; right: auto; left: 12px; bottom: 30px; }
  .ui .hint { bottom: 104px; font-size: 13px; white-space: normal; width: max-content; max-width: 86vw; text-align: center; border-radius: 16px; }
}
`;

export class UI {
  constructor({ onReset, onToggleView, onToggleSound, onDrive }) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    const root = document.createElement('div');
    root.className = 'ui';
    root.innerHTML = `
      <div class="title"><b>鸭 · 马路也是艺术</b><small>网页 3D 复刻练习 · 灵感来自小红书 AFTERSTILL</small><span class="meter"></span></div>
      <div class="buttons">
        <button data-k="view">俯瞰</button>
        <button data-k="sound" class="on">声音</button>
        <button data-k="reset">重来</button>
      </div>
      <div class="hint"></div>
      <button class="drive" data-k="drive">按住<br>开车</button>
    `;
    document.body.appendChild(root);
    this.root = root;
    this.hintEl = root.querySelector('.hint');
    this.meterEl = root.querySelector('.meter');
    this.viewBtn = root.querySelector('[data-k=view]');
    this.soundBtn = root.querySelector('[data-k=sound]');
    root.querySelector('[data-k=reset]').addEventListener('click', onReset);
    this.viewBtn.addEventListener('click', () => onToggleView());
    this.soundBtn.addEventListener('click', () => {
      const on = !this.soundBtn.classList.contains('on');
      this.soundBtn.classList.toggle('on', on);
      onToggleSound(on);
    });
    const drive = root.querySelector('[data-k=drive]');
    const set = (v) => (e) => { e.preventDefault(); drive.classList.toggle('held', v); onDrive(v); };
    drive.addEventListener('pointerdown', set(true));
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) drive.addEventListener(ev, set(false));
  }

  hint(text) {
    if (this.hintEl.textContent !== text) this.hintEl.textContent = text;
  }

  distance(m) {
    const text = `已修路 ${Math.floor(m)} 米`;
    if (this.meterEl.textContent !== text) this.meterEl.textContent = text;
  }

  setOverview(on) {
    this.viewBtn.textContent = on ? '跟随' : '俯瞰';
    this.viewBtn.classList.toggle('on', on);
  }
}
