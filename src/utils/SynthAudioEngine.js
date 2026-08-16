// High-Fidelity Procedural Audio Engine
let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playTone = (freq, type, duration, vol = 0.1, decay = true) => {
  initAudio();
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  if (decay) {
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  } else {
    gain.gain.setValueAtTime(vol, audioCtx.currentTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
  }
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const playMoveSound = () => {
  playTone(440, 'sine', 0.08, 0.05);
};

export const playCaptureSound = () => {
  playTone(150, 'square', 0.15, 0.08);
  setTimeout(() => playTone(300, 'sawtooth', 0.1, 0.04), 50);
};

export const playCheckSound = () => {
  playTone(880, 'triangle', 0.1, 0.06);
  setTimeout(() => playTone(880, 'triangle', 0.1, 0.06), 120);
};

export const playCheckmateSound = () => {
  [440, 330, 220].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sawtooth', 0.8, 0.1), i * 200);
  });
};

export const playTickSound = () => {
  playTone(1200, 'sine', 0.02, 0.02);
};
export const playSelectSound = () => {
  playTone(440, 'sine', 0.05, 0.05);
};
