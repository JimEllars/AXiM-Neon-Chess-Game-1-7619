// Procedural Web Audio Synthesizer
let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playTone = (freq, type, duration, vol = 0.1) => {
  initAudio();
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  // Envelope
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const playMoveSound = () => {
  playTone(440, 'sine', 0.1, 0.05); // Clean digital blip
};

export const playCaptureSound = () => {
  playTone(180, 'square', 0.2, 0.1); // Glitchy hit
  setTimeout(() => playTone(320, 'sawtooth', 0.1, 0.05), 40);
};

export const playCheckSound = () => {
  playTone(550, 'triangle', 0.1, 0.1);
  setTimeout(() => playTone(650, 'triangle', 0.1, 0.1), 100);
};

export const playCheckmateSound = () => {
  const freqs = [880, 660, 440, 220];
  freqs.forEach((f, i) => {
    setTimeout(() => playTone(f, 'sawtooth', 0.6, 0.1), i * 150);
  });
};