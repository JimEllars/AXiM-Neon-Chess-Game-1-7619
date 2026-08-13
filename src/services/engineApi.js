import { Chess } from 'chess.js';
import { getBestMove } from '../utils/ChessEngine';

const apiUrl = (path) => `${import.meta.env.BASE_URL}api/v1/chess/${path}`;

export const fetchComputerMove = async (fen, difficulty = 'normal') => {
  try {
    const response = await fetch(apiUrl('move'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fen, difficulty })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.bestMove;
  } catch (error) {
    console.error('[EDGE GATEWAY] Error fetching computer move:', error);
    try {
      return getBestMove(new Chess(fen), difficulty);
    } catch (fallbackError) {
      console.error('[LOCAL ENGINE] Error calculating computer move:', fallbackError);
      return null;
    }
  }
};

export const submitMatchTelemetry = (pgn, result, matchType = 'pve_free') => {
  console.log(`[EDGE GATEWAY] Submitting Match: ${result}`);

  // Fire and forget, don't await or block
  fetch(apiUrl('submit-match'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pgn_string: pgn,
      result,
      match_type: matchType
    })
  }).catch(error => {
    console.error('[EDGE GATEWAY] Error submitting match telemetry:', error);
  });

  return true;
};
