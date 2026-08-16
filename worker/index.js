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


let wasmModule = null;
let wasmInstance = null;

async function loadStockfishWasm(env) {
  if (wasmInstance) return wasmInstance;

  if (!wasmModule) {
    try {
      const wasmResponse = await fetch('https://unpkg.com/stockfish.wasm@0.10.0/stockfish.wasm');
      if (!wasmResponse.ok) {
        throw new Error('Failed to fetch stockfish.wasm from CDN');
      }
      const wasmBuffer = await wasmResponse.arrayBuffer();
      wasmModule = await WebAssembly.compile(wasmBuffer);
    } catch (e) {
      console.error('Failed to load WASM module', e);
      return null;
    }
  }

  const importObject = {
    env: {
      memory: new WebAssembly.Memory({ initial: 32, maximum: 256 })
    }
  };

  try {
    wasmInstance = await WebAssembly.instantiate(wasmModule, importObject);
  } catch (e) {
    console.error('WASM Instantiation failed', e);
    wasmInstance = { error: true };
  }

  return wasmInstance;
}

const computerMove = async (request, env) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const clientIP = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'unknown';
  const kvKey = `rate_limit_move_${clientIP}`;

  if (env.CHESS_STATE) {
    try {
      const now = Date.now();
      const windowStart = now - 60000;
      let timestamps = await env.CHESS_STATE.get(kvKey, 'json');
      if (!Array.isArray(timestamps)) {
        timestamps = [];
      }
      timestamps = timestamps.filter(t => t > windowStart);

      if (timestamps.length >= 10) {
        return json({ error: 'Too many requests.' }, 429);
      }

      timestamps.push(now);
      // expirationTtl of 60 seconds is enough since window is 60s
      await env.CHESS_STATE.put(kvKey, JSON.stringify(timestamps), { expirationTtl: 60 });
    } catch (err) {
      console.error('KV rate limit error', err);
    }
  }

  try {
    const { fen, difficulty = 'normal' } = await parseJson(request);
    if (typeof fen !== 'string' || !['easy', 'normal', 'hard'].includes(difficulty)) {
      return json({ error: 'Invalid chess position or difficulty.' }, 400);
    }

    const instance = await loadStockfishWasm(env);
    let bestMove = null;

    if (instance && !instance.error && typeof instance.exports.calculateMove === 'function') {
        // Assuming a `calculateMove` or similar signature. But since it's just a raw binary, we fallback
        try {
            bestMove = instance.exports.calculateMove(fen);
        } catch(e) {
            console.error('WASM calculation error', e);
        }
    }

    if (!bestMove) {
        const game = new Chess(fen);
        bestMove = getBestMove(game, difficulty);
    }

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

  // Telemetry Authentication Scaffold
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader.trim() === '') {
    return json({ error: 'Unauthorized.' }, 401);
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

    let savedToQueue = false;

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      try {
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
          throw new Error('Supabase responded with an error: ' + await supabaseResponse.text());
        }
      } catch (err) {
        console.error('Failed to submit to Supabase:', err);
        if (env.CHESS_STATE) {
          const matchId = crypto.randomUUID();
          await env.CHESS_STATE.put(`queue:telemetry:${matchId}`, JSON.stringify({ pgn_string, result, match_type }));
          savedToQueue = true;
        }
      }
    } else if (env.CHESS_STATE) {
        const matchId = crypto.randomUUID();
        await env.CHESS_STATE.put(`queue:telemetry:${matchId}`, JSON.stringify({ pgn_string, result, match_type }));
        savedToQueue = true;
    }

    if (savedToQueue) {
      return json({ accepted: true }, 202);
    } else {
      return json({ success: true }, 200);
    }
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
      return computerMove(request, env);
    }

    if (pathname === `${API_PATH}/submit-match`) {
      return submitMatch(request, env);
    }

    return serveAsset(request, env);
  }
,
  async scheduled(event, env, ctx) {
    if (!env.CHESS_STATE) {
      return;
    }
    try {
      const keys = await env.CHESS_STATE.list({ prefix: 'queue:telemetry:' });
      if (!keys || !keys.keys || keys.keys.length === 0) {
        return;
      }

      for (const keyObj of keys.keys) {
        const key = keyObj.name;
        const valStr = await env.CHESS_STATE.get(key);
        if (!valStr) {
          continue;
        }

        const data = JSON.parse(valStr);

        if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
          const supabaseResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/arcade_chess_matches`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
          });

          if (supabaseResponse.status === 200 || supabaseResponse.status === 201 || supabaseResponse.status === 204) {
            await env.CHESS_STATE.delete(key);
          }
        }
      }
    } catch (e) {
      console.error('Scheduled task error', e);
    }
  }
};
