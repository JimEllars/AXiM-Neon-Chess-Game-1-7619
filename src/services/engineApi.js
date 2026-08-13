export const fetchComputerMove = async (fen, difficulty = 'normal') => {
  try {
    const response = await fetch('/api/v1/chess/move', {
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
    return null;
  }
};

export const submitMatchTelemetry = async (pgn, result, matchType) => {
  console.log(`[EDGE GATEWAY] Submitting Match: ${result}`);
  try {
    const response = await fetch('/api/v1/chess/submit-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pgn, result, matchType })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('[EDGE GATEWAY] Error submitting match telemetry:', error);
    return false;
  }
};
