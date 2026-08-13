import { getBestMove } from '../utils/ChessEngine';

export const fetchComputerMove = async (game, difficulty = 'normal') => {
  // Simulate network latency to the edge worker
  const delay = Math.random() * 800 + 400;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // In a real scenario, this would be a POST to /api/v1/chess/move
  // Here we use our local lightweight engine
  return getBestMove(game, difficulty);
};

export const submitMatchTelemetry = async (pgn, result) => {
  console.log(`[EDGE GATEWAY] Submitting Match: ${result}`);
  // Placeholder for Supabase/Worker integration
  return true;
};