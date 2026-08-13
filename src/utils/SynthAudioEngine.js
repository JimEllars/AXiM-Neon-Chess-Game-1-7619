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
  playTone(440, 'sine', 0.1, 0.1); // Short clean beep
};

export const playCaptureSound = () => {
  playTone(150, 'square', 0.2, 0.15); // Deeper, harsher glitch sound
  setTimeout(() => playTone(300, 'sawtooth', 0.1, 0.1), 50);
};

export const playCheckmateSound = () => {
  playTone(880, 'sawtooth', 0.5, 0.2);
  setTimeout(() => playTone(440, 'square', 0.8, 0.2), 200);
};