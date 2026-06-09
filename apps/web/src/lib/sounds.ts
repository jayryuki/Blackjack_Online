// Tactile blackjack sounds using Web Audio API — no external assets needed.
let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq: number, start: number, dur: number, gainValue = 0.12, type: OscillatorType = 'sine') {
  const c = ctx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  gain.gain.setValueAtTime(0, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, c.currentTime + start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  osc.connect(gain); gain.connect(c.destination);
  osc.start(c.currentTime + start); osc.stop(c.currentTime + start + dur + 0.02);
}

function noise(start = 0, dur = 0.08, gainValue = 0.08) {
  const c = ctx();
  const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'highpass'; filter.frequency.value = 600;
  gain.gain.setValueAtTime(gainValue, c.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  src.buffer = buffer; src.connect(filter); filter.connect(gain); gain.connect(c.destination);
  src.start(c.currentTime + start); src.stop(c.currentTime + start + dur);
}

export function playSound(sound: string): void {
  try {
    if (sound === 'chip') { tone(680, 0, 0.07, 0.10, 'triangle'); tone(980, 0.035, 0.06, 0.07, 'sine'); return; }
    if (sound === 'deal') { noise(0, 0.07, 0.055); tone(260, 0.01, 0.06, 0.035, 'triangle'); return; }
    if (sound === 'action') { tone(520, 0, 0.09, 0.08, 'square'); return; }
    if (sound === 'blackjack') { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.28, 0.12)); return; }
    if (sound === 'win') { [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.075, 0.24, 0.10)); return; }
    if (sound === 'lose') { tone(260, 0, 0.22, 0.09, 'triangle'); tone(164, 0.08, 0.32, 0.07, 'triangle'); return; }
    tone(440, 0, 0.08, 0.07);
  } catch {}
}
