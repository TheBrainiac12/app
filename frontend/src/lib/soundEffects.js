let ctx = null;
let muted = typeof window !== "undefined" && window.localStorage.getItem("elsewhere-muted") === "1";

const getCtx = () => {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

["pointerdown", "keydown"].forEach((ev) => window.addEventListener(ev, () => getCtx(), { once: true }));

export const isMuted = () => muted;

export const setMuted = (value) => {
  muted = value;
  window.localStorage.setItem("elsewhere-muted", value ? "1" : "0");
  if (value && ctx) ctx.suspend();
};

const tone = (c, { type = "sine", f0, f1, start = 0, dur, gain }) => {
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  if (f1) osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.min(gain, 0.15), t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
};

const noise = (c, { start = 0, dur, gain, freq }) => {
  const t = c.currentTime + start;
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const g = c.createGain();
  src.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = freq;
  g.gain.value = Math.min(gain, 0.15);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t);
};

export const playStampThump = () => {
  const c = getCtx();
  if (!c) return;
  tone(c, { type: "sine", f0: 120, f1: 45, dur: 0.09, gain: 0.15 });
  tone(c, { type: "triangle", f0: 90, f1: 40, dur: 0.12, gain: 0.07 });
  noise(c, { dur: 0.05, gain: 0.06, freq: 900 });
};

export const playApprovedChime = (streak = 0) => {
  const c = getCtx();
  if (!c) return;
  const lift = Math.pow(2, Math.min(streak, 8) / 12);
  tone(c, { type: "triangle", f0: 523.25 * lift, dur: 0.18, gain: 0.1 });
  tone(c, { type: "triangle", f0: 783.99 * lift, start: 0.09, dur: 0.3, gain: 0.1 });
};

export const playDeniedBuzz = () => {
  const c = getCtx();
  if (!c) return;
  tone(c, { type: "triangle", f0: 190, dur: 0.14, gain: 0.1 });
  tone(c, { type: "sawtooth", f0: 190, dur: 0.14, gain: 0.02 });
  tone(c, { type: "triangle", f0: 145, start: 0.16, dur: 0.22, gain: 0.1 });
  tone(c, { type: "sawtooth", f0: 145, start: 0.16, dur: 0.22, gain: 0.02 });
};

export const playPop = () => {
  const c = getCtx();
  if (!c) return;
  tone(c, { type: "sine", f0: 500, f1: 420, dur: 0.03, gain: 0.08 });
};

export const playVerdict = (approved, streak = 0) => {
  playStampThump();
  setTimeout(() => (approved ? playApprovedChime(streak) : playDeniedBuzz()), 90);
};
