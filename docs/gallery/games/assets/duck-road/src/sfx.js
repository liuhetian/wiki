// Tiny synthesized sound effects (no audio files): plot pops and duck quacks.
export class Sfx {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastPop = 0;
  }

  /** Must be called from a user gesture before anything is audible. */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? 0.5 : 0;
  }

  ok() { return this.ctx && this.enabled && this.ctx.state === 'running'; }

  pop(band = 0) {
    if (!this.ok()) return;
    const t = this.ctx.currentTime;
    if (t - this.lastPop < 0.05) return; // don't stack when many plots pop together
    this.lastPop = t;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    const f = 520 + Math.random() * 260 - band * 50;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 1.9, t + 0.07);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.2);
  }

  quack(pitch = 1) {
    if (!this.ok()) return;
    const t0 = this.ctx.currentTime;
    for (let k = 0; k < 2; k++) {
      const t = t0 + k * 0.13;
      const o = this.ctx.createOscillator();
      const bp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(420 * pitch, t);
      o.frequency.exponentialRampToValueAtTime(260 * pitch, t + 0.1);
      bp.type = 'bandpass';
      bp.frequency.value = 1100 * pitch;
      bp.Q.value = 3;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      o.connect(bp).connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.13);
    }
  }

  chime() {
    if (!this.ok()) return;
    const t0 = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const t = t0 + i * 0.11;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.65);
    });
  }
}
