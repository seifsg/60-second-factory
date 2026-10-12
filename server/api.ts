// api.ts · /api/waitlist (sign-up), /api/leads (private CSV), /api/health 🚦
import type { Ctx, Env, Fetch } from './types.ts';
import { check } from './lead.ts';
import { all, upsert } from './store.ts';
import { notify } from './relay.ts';
import { toCsv } from '../shared/csv.ts';

const MAX_BODY = 4096;
type Hdrs = Record<string, string>;

const json = (data: unknown, status: number, h: Hdrs = {}): Response =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...h } });

// only our own pages get CORS; "null" is the offline file opened from the tablet
export const cors = (origin: string | null, allowed: string[]): Hdrs =>
  origin && allowed.includes(origin)
    ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'Origin' }
    : {};

// constant-time compare so the admin token cannot be guessed by timing 🔐
const same = (a: string, b: string): boolean => {
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
};

const leadsCsv = async (req: Request, env: Env): Promise<Response> => {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || !token || !same(token, env.ADMIN_TOKEN)) return json({ ok: false, error: 'Unauthorized.' }, 401);
  const head = ['position', 'email', 'name', 'company', 'build', 'sector', 'lang', 'source', 'first', 'last', 'count', 'notified'];
  const rows = (await all(env.LEADS)).map(l => [l.position, l.email, l.name, l.company, l.build, l.sector, l.lang, l.source, l.first, l.last, l.count, l.notified]);
  return new Response(toCsv(head, rows), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="waitlist.csv"', 'cache-control': 'no-store' } });
};

const waitlist = async (req: Request, env: Env, ctx: Ctx, f: Fetch, h: Hdrs): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  if (req.method !== 'POST') return json({ ok: false, error: 'Use POST.' }, 405, { ...h, allow: 'POST, OPTIONS' });
  if (env.LIMITER && !(await env.LIMITER.limit({ key: req.headers.get('cf-connecting-ip') ?? 'anon' })).success) {
    return json({ ok: false, error: 'Too many requests. Try again in a minute.' }, 429, h);
  }
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY) return json({ ok: false, error: 'Request too large.' }, 413, h);
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'Request too large.' }, 413, h);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { body = null; }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ ok: false, error: 'Send a JSON object.' }, 400, h);
  const c = check(body as Record<string, unknown>);
  if (c.ok === 'bot') return json({ ok: true }, 200, h); // bots get a smile, nothing is stored
  if (!c.ok) return json({ ok: false, errors: c.errors }, 422, h);
  const { lead, fresh } = await upsert(env.LEADS, c.lead);
  if (fresh) ctx.waitUntil(notify(env, lead, f));
  return json({ ok: true, position: lead.position, fresh }, 200, h);
};

export const handle = async (req: Request, env: Env, ctx: Ctx, f: Fetch = fetch): Promise<Response> => {
  const url = new URL(req.url), origin = req.headers.get('origin');
  const cross = !!origin && origin !== url.origin; // our own page on any of our hosts never needs a list entry
  const h = cross ? cors(origin, (env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean)) : {};
  if (url.pathname === '/api/health') return json({ ok: true }, 200);
  if (url.pathname === '/api/leads') return leadsCsv(req, env);
  if (url.pathname !== '/api/waitlist') return json({ ok: false, error: 'Not found.' }, 404);
  if (cross && !h['access-control-allow-origin']) return json({ ok: false, error: 'Origin not allowed.' }, 403);
  return waitlist(req, env, ctx, f, h);
};
