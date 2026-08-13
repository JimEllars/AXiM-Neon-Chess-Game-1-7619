import { create } from 'zustand';
import { Chess } from 'chess.js';
import { playMoveSound, playCaptureSound, playCheckmateSound, playCheckSound } from '../utils/SynthAudioEngine';
import { fetchComputerMove, submitMatchTelemetry } from '../services/engineApi';

const getGameStatus = (chess) => {
  if (chess.isCheckmate()) return 'CHECKMATE';
  if (chess.isDraw()) return 'DRAW';
  if (chess.isStalemate()) return 'STALEMATE';
  if (chess.isThreefoldRepetition()) return 'REPETITION';
  if (chess.isCheck()) return 'CHECK';
  return 'ACTIVE';
};

export const useChessStore = create((set, get) => ({
  game: new Chess(),
  fen: 'start',
  status: 'SYSTEM ONLINE',
  gameMode: 'ai', // 'ai' or 'local'
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
  stats: {
    moves: 0,
    captures: 0,
    checks: 0
  },

  setDifficulty: (level) => set({ difficulty: level }),
  setPieceSet: (set) => set({ pieceSet: set }),
  setGameMode: (mode) => {
    get().resetGame();
    set({ gameMode: mode });
  },
  setBoardOrientation: (side) => set({ boardOrientation: side }),
  toggleHints: () => set((state) => ({ showHints: !state, optionSquares: {} })),
  toggleSound: () => set((state) => ({ soundEnabled: !state })),
  setOptionSquares: (squares) => set({ optionSquares: squares }),

  makeMove: async (moveObj) => {
    const { game, isComputerThinking, soundEnabled, stats, gameMode } = get();
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

        const currentStatus = getGameStatus(game);
        const newCaptured = { ...get().capturedPieces };
        if (move.captured) {
          const color = move.color === 'w' ? 'b' : 'w';
          newCaptured[color].push(move.captured);
        }

        set({ 
          fen: game.fen(), 
          status: currentStatus,
          moveHistory: game.history({ verbose: true }),
          capturedPieces: newCaptured,
          optionSquares: {},
          lastMove: { from: move.from, to: move.to },
          stats: {
            ...stats,
            moves: stats.moves + 1,
            captures: move.captured ? stats.captures + 1 : stats.captures,
            checks: game.isCheck() ? stats.checks + 1 : stats.checks
          }
        });

        if (game.isGameOver()) {
          const result = game.isCheckmate() 
            ? (game.turn() === 'b' ? (gameMode === 'ai' ? 'PLAYER DOMINANCE' : 'WHITE VICTORIOUS') : 'SYSTEM OVERTAKE') 
            : 'STALEMATE';
          set({ gameOver: result });
          return true;
        }

        if (gameMode === 'ai' && game.turn() === 'b') {
          get().triggerComputerMove();
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  },

  triggerComputerMove: async () => {
    set({ isComputerThinking: true, status: 'CALCULATING' });
    const { game, difficulty, soundEnabled, stats } = get();
    
    const computerMove = await fetchComputerMove(game, difficulty);
    
    if (computerMove) {
      const move = game.move(computerMove);
      
      if (soundEnabled) {
        if (game.isCheckmate()) playCheckmateSound();
        else if (game.isCheck()) playCheckSound();
        else if (move?.captured) playCaptureSound();
        else playMoveSound();
      }

      const currentStatus = getGameStatus(game);
      const newCaptured = { ...get().capturedPieces };
      if (move?.captured) {
        newCaptured['w'].push(move.captured);
      }

      set({ 
        fen: game.fen(), 
        status: currentStatus,
        isComputerThinking: false,
        moveHistory: game.history({ verbose: true }),
        capturedPieces: newCaptured,
        lastMove: { from: move.from, to: move.to },
        stats: {
          ...stats,
          captures: move?.captured ? stats.captures + 1 : stats.captures,
          checks: game.isCheck() ? stats.checks + 1 : stats.checks
        }
      });

      if (game.isGameOver()) {
        const result = game.isCheckmate() ? 'SYSTEM OVERTAKE' : 'STALEMATE';
        set({ gameOver: result });
      }
    }
  },

  resetGame: () => {
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
      stats: { moves: 0, captures: 0, checks: 0 }
    });
  }
}));