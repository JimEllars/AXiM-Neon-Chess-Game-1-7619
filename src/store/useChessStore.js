import { create } from 'zustand';
import { Chess } from 'chess.js';
import { playMoveSound, playCaptureSound, playCheckmateSound } from '../utils/SynthAudioEngine';
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
  status: 'SYSTEM READY',
  isComputerThinking: false,
  moveHistory: [],
  difficulty: 'normal',
  showHints: true,
  soundEnabled: true,
  capturedPieces: { w: [], b: [] },
  optionSquares: {},
  gameOver: null,

  setDifficulty: (level) => set({ difficulty: level }),
  toggleHints: () => set((state) => ({ showHints: !state, optionSquares: {} })),
  toggleSound: () => set((state) => ({ soundEnabled: !state })),
  setOptionSquares: (squares) => set({ optionSquares: squares }),

  makeMove: async (moveObj) => {
    const { game, isComputerThinking, soundEnabled } = get();
    if (isComputerThinking || get().gameOver) return false;

    try {
      const move = game.move(moveObj);
      if (move) {
        if (soundEnabled) {
          if (game.isCheckmate()) playCheckmateSound();
          else if (move.captured) playCaptureSound();
          else playMoveSound();
        }

        const currentStatus = getGameStatus(game);
        
        // Update captured pieces
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
          optionSquares: {}
        });

        if (game.isGameOver()) {
          const result = game.isCheckmate() ? (game.turn() === 'b' ? 'WHITE WINS' : 'BLACK WINS') : 'DRAW';
          set({ gameOver: result });
          submitMatchTelemetry(game.pgn(), result);
          return true;
        }

        if (game.turn() === 'b') {
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
    const { game, difficulty, soundEnabled } = get();
    
    const computerMove = await fetchComputerMove(game, difficulty);
    
    if (computerMove) {
      const move = game.move(computerMove);
      
      if (soundEnabled) {
        if (game.isCheckmate()) playCheckmateSound();
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
        capturedPieces: newCaptured
      });

      if (game.isGameOver()) {
        const result = game.isCheckmate() ? 'SYSTEM WINS' : 'DRAW';
        set({ gameOver: result });
        submitMatchTelemetry(game.pgn(), result);
      }
    }
  },

  resetGame: () => {
    set({ 
      game: new Chess(), 
      fen: 'start', 
      status: 'SYSTEM READY', 
      isComputerThinking: false,
      moveHistory: [],
      capturedPieces: { w: [], b: [] },
      optionSquares: {},
      gameOver: null
    });
  }
}));