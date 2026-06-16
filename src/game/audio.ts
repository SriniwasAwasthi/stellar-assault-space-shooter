// ============================================================
// STELLAR ASSAULT — Web Audio Engine (Procedural Sounds)
// ============================================================

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicOscillators: OscillatorNode[] = [];
let musicPlaying = false;
let muted = false;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(masterGain);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.25;
    musicGain.connect(masterGain);
  }
  return ctx;
}

function getSfxGain(): GainNode {
  getCtx();
  return sfxGain!;
}

function getMusicGain(): GainNode {
  getCtx();
  return musicGain!;
}

export function setMuted(val: boolean) {
  muted = val;
  if (masterGain) masterGain.gain.value = val ? 0 : 0.7;
}

export function toggleMute(): boolean {
  setMuted(!muted);
  return muted;
}

export function isMuted(): boolean { return muted; }

// Generic tone helper
function playTone(
  freq: number,
  type: OscillatorType,
  duration: number,
  gainVal: number,
  freqEnd?: number,
  gainEnd?: number,
  delay = 0,
) {
  if (muted) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), c.currentTime + delay + duration);
    }
    g.gain.setValueAtTime(gainVal, c.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(gainEnd ?? 0.001, c.currentTime + delay + duration);
    osc.connect(g);
    g.connect(getSfxGain());
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration + 0.05);
  } catch {}
}

function playNoise(duration: number, gainVal: number, freqLow: number, freqHigh: number, delay = 0) {
  if (muted) return;
  try {
    const c = getCtx();
    const bufSize = c.sampleRate * duration;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = (freqLow + freqHigh) / 2;
    filter.Q.value = 0.5;
    const g = c.createGain();
    g.gain.setValueAtTime(gainVal, c.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(getSfxGain());
    src.start(c.currentTime + delay);
  } catch {}
}

// ── Sound effects ──────────────────────────────────────────

export function playShoot(weapon = 'laser') {
  switch (weapon) {
    case 'laser':
      playTone(880, 'sawtooth', 0.08, 0.15, 440, 0.001);
      break;
    case 'spread':
      playTone(660, 'sawtooth', 0.1, 0.12, 330, 0.001);
      playTone(770, 'sawtooth', 0.1, 0.1, 385, 0.001, 0.02);
      playTone(550, 'sawtooth', 0.1, 0.1, 275, 0.001, 0.04);
      break;
    case 'rapid':
      playTone(1200, 'square', 0.06, 0.1, 600, 0.001);
      break;
    case 'missile':
      playNoise(0.2, 0.3, 100, 400);
      playTone(200, 'sawtooth', 0.2, 0.2, 100, 0.001);
      break;
    case 'plasma':
      playTone(400, 'sine', 0.15, 0.3, 800, 0.001);
      playTone(200, 'sine', 0.15, 0.2, 400, 0.001);
      break;
    case 'beam':
      playTone(1500, 'sawtooth', 0.05, 0.2, 800, 0.1);
      break;
    default:
      playTone(880, 'sawtooth', 0.08, 0.15, 440, 0.001);
  }
}

export function playExplosion(size: 'small' | 'medium' | 'large' = 'medium') {
  const gainMap = { small: 0.3, medium: 0.5, large: 0.8 };
  const freqMap = { small: [400, 800], medium: [200, 600], large: [80, 400] };
  const durMap  = { small: 0.2, medium: 0.4, large: 0.7 };
  playNoise(durMap[size], gainMap[size], freqMap[size][0], freqMap[size][1]);
  playTone(freqMap[size][0], 'sine', durMap[size], gainMap[size] * 0.5, 50, 0.001);
}

export function playHit() {
  playTone(300, 'square', 0.05, 0.2, 150, 0.001);
  playNoise(0.08, 0.2, 500, 1500);
}

export function playPlayerHit() {
  playTone(150, 'sawtooth', 0.15, 0.4, 75, 0.001);
  playNoise(0.15, 0.4, 100, 800);
}

export function playPowerUp(type = 'health') {
  const freqs: Record<string, number[]> = {
    health:   [440, 660, 880],
    shield:   [330, 550, 770],
    speed:    [880, 1100, 1320],
    weapon:   [550, 880, 1100, 1320],
    score:    [660, 990, 1320],
    bomb:     [220, 440, 660, 880],
  };
  const notes = freqs[type] ?? freqs.health;
  notes.forEach((f, i) => playTone(f, 'sine', 0.15, 0.3, f * 1.2, 0.001, i * 0.07));
}

export function playBossAlert() {
  for (let i = 0; i < 3; i++) {
    playTone(110, 'sawtooth', 0.3, 0.5, 55, 0.01, i * 0.4);
    playNoise(0.3, 0.3, 60, 300, i * 0.4);
  }
}

export function playVictory() {
  const melody = [523, 659, 784, 1047, 784, 1047, 1319];
  melody.forEach((f, i) => playTone(f, 'sine', 0.25, 0.4, f, 0.001, i * 0.18));
}

export function playGameOver() {
  const notes = [440, 330, 220, 165, 110];
  notes.forEach((f, i) => playTone(f, 'sawtooth', 0.4, 0.4, f * 0.7, 0.001, i * 0.25));
}

export function playLevelUp() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => playTone(f, 'sine', 0.2, 0.5, f * 1.1, 0.001, i * 0.12));
}

export function playCombo(level: number) {
  const f = 440 + level * 110;
  playTone(f, 'sine', 0.12, 0.4, f * 1.5, 0.001);
}

export function playBombExplosion() {
  playNoise(1.0, 0.9, 50, 2000);
  playTone(80, 'sine', 1.0, 0.8, 40, 0.001);
  playTone(160, 'sawtooth', 0.8, 0.6, 80, 0.001);
}

// ── Background music ───────────────────────────────────────

const MUSIC_SCALE = [110, 130.81, 146.83, 164.81, 174.61, 196, 220, 261.63];

function makeMusicalNote(freq: number, when: number, dur: number, gain: number) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    const filter = c.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, when);
    filter.frequency.exponentialRampToValueAtTime(400, when + dur);
    g.gain.setValueAtTime(0.001, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(filter);
    filter.connect(g);
    g.connect(getMusicGain());
    osc.start(when);
    osc.stop(when + dur + 0.1);
    musicOscillators.push(osc);
  } catch {}
}

function scheduleMusicLoop(startTime: number, bpm = 100) {
  if (!musicPlaying) return;
  const beat = 60 / bpm;
  const pattern = [0, 4, 2, 5, 3, 6, 1, 4, 2, 3, 0, 5];
  const bassPattern = [0, 0, 2, 2, 4, 4, 2, 2];

  // Melody
  pattern.forEach((ni, i) => {
    const freq = MUSIC_SCALE[ni] * 2;
    makeMusicalNote(freq, startTime + i * beat * 0.5, beat * 0.4, 0.06);
  });

  // Bass
  bassPattern.forEach((ni, i) => {
    const freq = MUSIC_SCALE[ni];
    makeMusicalNote(freq, startTime + i * beat, beat * 0.8, 0.12);
  });

  // Arp
  [0, 2, 4, 6].forEach((ni, i) => {
    makeMusicalNote(MUSIC_SCALE[ni] * 4, startTime + i * beat * 0.25, beat * 0.15, 0.03);
  });

  const loopDur = pattern.length * beat * 0.5;
  setTimeout(() => scheduleMusicLoop(getCtx().currentTime + 0.1, bpm), (loopDur - 0.2) * 1000);
}

export function startMusic(bpm = 110) {
  if (musicPlaying) return;
  musicPlaying = true;
  try {
    const c = getCtx();
    scheduleMusicLoop(c.currentTime + 0.1, bpm);
  } catch {}
}

export function stopMusic() {
  musicPlaying = false;
  musicOscillators.forEach(o => { try { o.stop(); } catch {} });
  musicOscillators = [];
}

export function resumeAudioContext() {
  try { ctx?.resume(); } catch {}
}
