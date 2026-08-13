import { Chess } from 'chess.js';
import { getBestMove } from '../src/utils/ChessEngine.js';

const GAME_PATH = '/games/neon-chess';
const API_PATH = `${GAME_PATH}/api/v1/chess`;
const MAX_REQUEST_BYTES = 64 * 1024;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (body, status = 200) => Response.json(body, { status, headers: corsHeaders });

function handleOptions(request) {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
      },
    });
  }
  return new Response(null, {
    headers: {
      Allow: 'GET, POST, OPTIONS',
    },
  });
}

const parseJson = async (request) => {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new RangeError('Request body is too large.');
  }

  const body = await request.text();
  if (body.length > MAX_REQUEST_BYTES) {
    throw new RangeError('Request body is too large.');
  }

  return JSON.parse(body);
};

const computerMove = async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    const { fen, difficulty = 'normal' } = await parseJson(request);
    if (typeof fen !== 'string' || !['easy', 'normal', 'hard'].includes(difficulty)) {
      return json({ error: 'Invalid chess position or difficulty.' }, 400);
    }

    const game = new Chess(fen);
    const bestMove = getBestMove(game, difficulty);
    return json({ bestMove });
  } catch (error) {
    const status = error instanceof RangeError ? 413 : 400;
    return json({ error: error.message || 'Invalid chess position.' }, status);
  }
};

const submitMatch = async (request, env) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    const { pgn_string, result, match_type } = await parseJson(request);
    if (
      typeof pgn_string !== 'string' ||
      typeof result !== 'string' ||
      typeof match_type !== 'string' ||
      pgn_string.length > MAX_REQUEST_BYTES
    ) {
      return json({ error: 'Invalid match telemetry.' }, 400);
    }

    env.CHESS_ANALYTICS.writeDataPoint({
      blobs: [result.slice(0, 64), match_type.slice(0, 64)],
      doubles: [pgn_string.length],
      indexes: [match_type.slice(0, 64) || 'unknown']
    });

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      const supabaseResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/arcade_chess_matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ pgn_string, result, match_type })
      });
      if (!supabaseResponse.ok) {
        console.error('Failed to submit to Supabase:', await supabaseResponse.text());
      }
    }

    return json({ accepted: true }, 202);
  } catch (error) {
    const status = error instanceof RangeError ? 413 : 400;
    return json({ error: error.message || 'Invalid match telemetry.' }, status);
  }
};

const serveAsset = (request, env) => {
  const url = new URL(request.url);
  const assetPath = url.pathname === GAME_PATH || url.pathname === `${GAME_PATH}/`
    ? '/index.html'
    : url.pathname.slice(GAME_PATH.length);

  url.pathname = assetPath || '/index.html';

  // Attach CORS headers if necessary, but usually static assets have them or we can just return what ASSETS.fetch returns.
  // Actually, we should just return what env.ASSETS.fetch gives.
  return env.ASSETS.fetch(new Request(url, request));
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const { pathname } = new URL(request.url);

    if (pathname === `${API_PATH}/move`) {
      return computerMove(request);
    }

    if (pathname === `${API_PATH}/submit-match`) {
      return submitMatch(request, env);
    }

    return serveAsset(request, env);
  }
};
