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

    if (response.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.bestMove;
  } catch (error) {
    console.error('[EDGE GATEWAY] Error fetching computer move:', error);

    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      throw error;
    }

    try {
      return getBestMove(new Chess(fen), difficulty);
    } catch (fallbackError) {
      console.error('[LOCAL ENGINE] Error calculating computer move:', fallbackError);
      return null;
    }
  }
};

export const submitMatchTelemetry = async (pgn, result, matchType = 'pve_free') => {
  console.log(`[EDGE GATEWAY] Submitting Match: ${result}`);

  try {
    const response = await fetch(apiUrl('submit-match'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer AXIM_TEMP_DEV_TOKEN'
      },
      body: JSON.stringify({
        pgn_string: pgn,
        result,
        match_type: matchType
      })
    });
    return response.status;
  } catch (error) {
    console.error('[EDGE GATEWAY] Error submitting match telemetry:', error);
    return null;
  }
};
