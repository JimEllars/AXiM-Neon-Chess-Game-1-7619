import { Chess } from 'chess.js';
import { getBestMove } from '../src/utils/ChessEngine.js';

const GAME_PATH = '/games/neon-chess';
const API_PATH = `${GAME_PATH}/api/v1/chess`;
const MAX_REQUEST_BYTES = 64 * 1024;

const json = (body, status = 200) => Response.json(body, { status });

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
    const { pgn, result, matchType } = await parseJson(request);
    if (
      typeof pgn !== 'string' ||
      typeof result !== 'string' ||
      typeof matchType !== 'string' ||
      pgn.length > MAX_REQUEST_BYTES
    ) {
      return json({ error: 'Invalid match telemetry.' }, 400);
    }

    env.CHESS_ANALYTICS.writeDataPoint({
      blobs: [result.slice(0, 64), matchType.slice(0, 64)],
      doubles: [pgn.length],
      indexes: [matchType.slice(0, 64) || 'unknown']
    });

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
  return env.ASSETS.fetch(new Request(url, request));
};

export default {
  async fetch(request, env) {
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
