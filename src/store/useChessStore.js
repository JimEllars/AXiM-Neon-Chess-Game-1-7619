import { create } from 'zustand';
import { Chess } from 'chess.js';
import { playMoveSound, playCaptureSound, playCheckmateSound, playCheckSound, playTickSound } from '../utils/SynthAudioEngine';
import { fetchComputerMove, submitMatchTelemetry } from '../services/engineApi';

const DEFAULT_TIME = 600; // 10 minutes

export const useChessStore = create((set, get) => ({
  game: new Chess(),
  fen: 'start',
  status: 'SYSTEM ONLINE',
  gameMode: 'ai',
  boardOrientation: 'white',
  isComputerThinking: false,
  moveHistory: [],
  difficulty: 'normal',
  showHints: true,
  soundEnabled: true,
  pieceSet: 'retro',
  capturedPieces: { w: [], b: [] },
  optionSquares: {},
  lastMove: null,
  gameOver: null,
  
  // Timer State
  initialTime: DEFAULT_TIME,
  timers: { w: DEFAULT_TIME, b: DEFAULT_TIME },
  isPaused: true,
  
  // Stats
  stats: { moves: 0, captures: 0, checks: 0 },

  setInitialTime: (seconds) => {
    set({ initialTime: seconds, timers: { w: seconds, b: seconds }, isPaused: true });
    get().resetGame();
  },

  setGameMode: (mode) => {
    get().resetGame();
    set({ gameMode: mode });
  },

  setPieceSet: (set) => set({ pieceSet: set }),
  setDifficulty: (level) => set({ difficulty: level }),
  setBoardOrientation: (side) => set({ boardOrientation: side }),
  toggleHints: () => set((state) => ({ showHints: !state, optionSquares: {} })),
  toggleSound: () => set((state) => ({ soundEnabled: !state })),

  tickTimers: () => {
    const { game, timers, isPaused, gameOver, gameMode } = get();
    if (isPaused || gameOver) return;

    const turn = game.turn();
    const newTimers = { ...timers, [turn]: Math.max(0, timers[turn] - 1) };
    
    if (newTimers[turn] === 0) {
      const result = turn === 'w' ? 'BLACK WINS BY TIME' : 'WHITE WINS BY TIME';
      set({ gameOver: result });
      submitMatchTelemetry(game.pgn(), result, gameMode);
    }
    
    set({ timers: newTimers });
    if (get().soundEnabled && newTimers[turn] < 10) playTickSound();
  },

  makeMove: async (moveObj) => {
    const { game, isComputerThinking, soundEnabled, stats, gameMode, difficulty } = get();
    if (isComputerThinking || get().gameOver) return false;

    try {
      const move = game.move(moveObj);
      if (move) {
        if (soundEnabled) {
          if (game.isCheckmate()) playCheckmateSound();
          else if (game.isCheck()) playCheckSound();
          else if (move.captured) playCaptureSound();
          else playMoveSound();
        }

        set({ 
          fen: game.fen(), 
          status: game.isCheck() ? 'CHECK DETECTED' : 'ACTIVE',
          moveHistory: game.history({ verbose: true }),
          capturedPieces: {
            w: move.color === 'b' && move.captured ? [...get().capturedPieces.w, move.captured] : get().capturedPieces.w,
            b: move.color === 'w' && move.captured ? [...get().capturedPieces.b, move.captured] : get().capturedPieces.b
          },
          optionSquares: {},
          lastMove: { from: move.from, to: move.to },
          isPaused: false,
          stats: {
            ...stats,
            moves: stats.moves + 1,
            captures: move.captured ? stats.captures + 1 : stats.captures,
            checks: game.isCheck() ? stats.checks + 1 : stats.checks
          }
        });

        if (game.isGameOver()) {
          let result = 'DRAW';
          if (game.isCheckmate()) result = 'CHECKMATE';
          set({ gameOver: result });
          submitMatchTelemetry(game.pgn(), result, gameMode);
          return true;
        }

        if (gameMode === 'ai' && game.turn() === 'b') {
          set({ isComputerThinking: true, status: 'CALCULATING' });
          fetchComputerMove(game.fen(), difficulty).then(computerMove => {
            if (computerMove) {
              set({ isComputerThinking: false });
              get().makeMove(computerMove);
            } else {
              set({ isComputerThinking: false, status: 'ERROR CALCULATING' });
            }
          });
        }
        return true;
      }
    } catch (e) { return false; }
    return false;
  },



  resetGame: () => {
    const { initialTime } = get();
    set({ 
      game: new Chess(), 
      fen: 'start', 
      status: 'SYSTEM ONLINE', 
      isComputerThinking: false,
      moveHistory: [],
      capturedPieces: { w: [], b: [] },
      optionSquares: {},
      lastMove: null,
      gameOver: null,
      timers: { w: initialTime, b: initialTime },
      isPaused: true,
      stats: { moves: 0, captures: 0, checks: 0 }
    });
  }
}));