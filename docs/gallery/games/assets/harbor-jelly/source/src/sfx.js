// Tiny WebAudio sound effects, synthesised (no audio files): a water "plip" and a ship horn.
let ctx = null;
let master = null;
export const sfx = { enabled: false };

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSound(on) {
  sfx.enabled = on;
  if (on) ensure();
}

export function plip(strength = 1) {
  if (!sfx.enabled || !ensure()) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  const f0 = 520 + Math.random() * 260;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f0 * 2.4, t + 0.09);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.25 * strength, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.25);
}

let noiseBuf = null;
function noise() {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  return src;
}

/** The wave machine: a low rush of water swelling up. */
export function swell() {
  if (!sfx.enabled || !ensure()) return;
  const t = ctx.currentTime;
  const src = noise();
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(220, t);
  f.frequency.exponentialRampToValueAtTime(900, t + 1.4);
  f.frequency.exponentialRampToValueAtTime(300, t + 3.2);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 1.0);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + 3.5);
}

/** The crest breaking on the quay: a bright splash. */
export function crash(strength = 1) {
  if (!sfx.enabled || !ensure()) return;
  const t = ctx.currentTime;
  const src = noise();
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(1800, t);
  f.frequency.exponentialRampToValueAtTime(500, t + 1.1);
  f.Q.value = 0.7;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35 * strength, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + 1.4);
}

export function horn() {
  if (!sfx.enabled || !ensure()) return;
  const t = ctx.currentTime;
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 700;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.15);
  g.gain.setValueAtTime(0.18, t + 1.2);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
  for (const fr of [110, 138.6]) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = fr;
    o.connect(f);
    o.start(t);
    o.stop(t + 1.9);
  }
  f.connect(g).connect(master);
}
