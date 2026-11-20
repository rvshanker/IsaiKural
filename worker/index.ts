/**
 * isaikural.com Worker
 *  - /api/feedback      POST  : save a visitor's feedback (public)
 *  - /api/feedback      GET   : list feedback (admin, header x-admin-key)
 *  - /api/feedback/:id  PATCH : mark new / done (admin)
 *  - /api/feedback/:id  DELETE: remove (admin)
 * Everything else is served from the static site (dist/).
 *
 * Needs: D1 binding "DB", secret "ADMIN_KEY".
 */

interface Env {
  DB: any; // D1Database
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  ADMIN_KEY?: string;
}

const TYPES = ['suggestion', 'error', 'praise', 'other'];
let tableReady = false;

async function ensureTable(env: Env) {
  if (tableReady) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      name TEXT,
      contact TEXT,
      kural INTEGER,
      page TEXT,
      country TEXT,
      device TEXT,
      ip_hash TEXT,
      status TEXT NOT NULL DEFAULT 'new'
    )`
  ).run();
  tableReady = true;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}

function isAdmin(req: Request, env: Env) {
  const key = req.headers.get('x-admin-key') || '';
  if (!env.ADMIN_KEY || key.length !== env.ADMIN_KEY.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ env.ADMIN_KEY.charCodeAt(i);
  return diff === 0;
}

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

async function handleApi(req: Request, env: Env, url: URL): Promise<Response> {
  if (!env.DB) return json({ error: 'Database not configured' }, 500);
  await ensureTable(env);
  const idMatch = url.pathname.match(/^\/api\/feedback\/(\d+)$/);

  // ---- Public: submit feedback
  if (url.pathname === '/api/feedback' && req.method === 'POST') {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Bad request' }, 400);
    }
    if (body.website) return json({ ok: true }); // honeypot: bots fill hidden fields
    const message = clip(body.message, 3000);
    if (message.length < 3) return json({ error: 'Please write your feedback' }, 400);
    const type = TYPES.includes(body.type) ? body.type : 'other';
    const kural = Number.isInteger(body.kural) && body.kural >= 1 && body.kural <= 1330 ? body.kural : null;

    const ip = req.headers.get('cf-connecting-ip') || '';
    const ipHash = await sha256(ip + '|isaikural');
    // Simple flood guard: at most 5 messages per 10 minutes from one connection
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM feedback WHERE ip_hash = ? AND created_at > ?')
      .bind(ipHash, since)
      .first();
    if (recent && recent.n >= 5) return json({ error: 'Too many messages, please try again later' }, 429);

    const ua = req.headers.get('user-agent') || '';
    const device = /mobile|android|iphone/i.test(ua) ? 'Phone' : /ipad|tablet/i.test(ua) ? 'Tablet' : 'Computer';
    const country = (req as any).cf?.country || '';

    await env.DB.prepare(
      'INSERT INTO feedback (created_at, type, message, name, contact, kural, page, country, device, ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?)'
    )
      .bind(new Date().toISOString(), type, message, clip(body.name, 80), clip(body.contact, 120), kural, clip(body.page, 200), country, device, ipHash)
      .run();
    return json({ ok: true });
  }

  // ---- Admin
  if (!isAdmin(req, env)) return json({ error: 'Unauthorized' }, 401);

  if (url.pathname === '/api/feedback' && req.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT id, created_at, type, message, name, contact, kural, page, country, device, status FROM feedback ORDER BY id DESC LIMIT 500'
    ).all();
    return json({ items: results });
  }
  if (idMatch && req.method === 'PATCH') {
    const body: any = await req.json().catch(() => ({}));
    const status = body.status === 'done' ? 'done' : 'new';
    await env.DB.prepare('UPDATE feedback SET status = ? WHERE id = ?').bind(status, Number(idMatch[1])).run();
    return json({ ok: true });
  }
  if (idMatch && req.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM feedback WHERE id = ?').bind(Number(idMatch[1])).run();
    return json({ ok: true });
  }
  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(req, env, url);
      } catch (e) {
        return json({ error: 'Server error' }, 500);
      }
    }
    return env.ASSETS.fetch(req);
  },
};
