/**
 * A lightweight Minimax-based chess engine for client-side play.
 * This simulates the 'Edge' engine until a real Stockfish WASM worker is connected.
 */
const pieceValues = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };

const evaluateBoard = (game) => {
  let totalEvaluation = 0;
  const board = game.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = pieceValues[piece.type] || 0;
        totalEvaluation += piece.color === 'w' ? value : -value;
      }
    }
  }
  return totalEvaluation;
};

const minimax = (game, depth, isMaximizingPlayer) => {
  if (depth === 0) return -evaluateBoard(game);

  const moves = game.moves();
  if (isMaximizingPlayer) {
    let bestEval = -9999;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, false);
      game.undo();
      bestEval = Math.max(bestEval, evaluation);
    }
    return bestEval;
  } else {
    let bestEval = 9999;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, true);
      game.undo();
      bestEval = Math.min(bestEval, evaluation);
    }
    return bestEval;
  }
};

export const getBestMove = (game, difficulty = 'normal') => {
  const moves = game.moves();
  if (moves.length === 0) return null;

  // Easy: Random move
  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Normal/Hard: Basic Minimax
  const depth = difficulty === 'hard' ? 3 : 2;
  let bestMove = null;
  let bestValue = 9999;

  for (const move of moves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, true);
    game.undo();
    if (boardValue <= bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  return bestMove || moves[0];
};