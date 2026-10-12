// api.test.ts · the waitlist API end to end against in-memory KV and a fake mailer 🧪
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../server/api.ts';
import { retryNotifications } from '../server/relay.ts';
import { ORIGIN, ctx, env, post, relay } from './fakes.ts';

const ada = { id: 'id-1', name: 'Ada', email: 'Ada@Example.com', phone: '+216 20 123 456', company: 'Engine Co', sector: 'gov', lang: 'en' };
const stored = (e: ReturnType<typeof env>, email: string) => JSON.parse(e.LEADS.m.get(`lead:${email}`) ?? 'null');

test('preflight from the offline file gets CORS headers', async () => {
  const r = await handle(new Request(`${ORIGIN}/api/waitlist`, { method: 'OPTIONS', headers: { origin: 'null' } }), env(), ctx());
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('access-control-allow-origin'), 'null');
});

test('a foreign origin is refused', async () => {
  const r = await handle(post(ada, { origin: 'https://evil.example' }), env(), ctx());
  assert.equal(r.status, 403);
});

test('a sign-up is stored, numbered and emailed once', async () => {
  const e = env(), c = ctx(), m = relay();
  const r = await handle(post(ada), e, c, m.f);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, position: 1, fresh: true });
  await c.done();
  assert.equal(m.calls.length, 1);
  assert.equal(m.calls[0].body.form, 'setup');
  assert.equal(m.calls[0].body.cta, 'waitlist');
  assert.match(m.calls[0].body.bottleneck, /waitlist \(#1\)[\s\S]*Name: Ada[\s\S]*Phone: \+216 20 123 456/);
  assert.equal(stored(e, 'ada@example.com').notified, true);
});

test('the same email again merges without a second email', async () => {
  const e = env(), m = relay();
  await handle(post(ada), e, ctx(), m.f);
  const c = ctx();
  const r = await handle(post({ ...ada, id: 'id-2', company: 'New Co' }), e, c, m.f);
  await c.done();
  assert.deepEqual(await r.json(), { ok: true, position: 1, fresh: false });
  assert.equal(m.calls.length, 1);
  const lead = stored(e, 'ada@example.com');
  assert.equal(lead.count, 2);
  assert.equal(lead.company, 'New Co');
});

test('a client retry with the same id does not double count', async () => {
  const e = env();
  await handle(post(ada), e, ctx(), relay().f);
  await handle(post(ada), e, ctx(), relay().f);
  assert.equal(stored(e, 'ada@example.com').count, 1);
});

test('positions keep counting', async () => {
  const e = env();
  await handle(post(ada), e, ctx(), relay().f);
  const r = await handle(post({ ...ada, id: 'id-9', email: 'grace@navy.mil', name: 'Grace' }), e, ctx(), relay().f);
  assert.equal((await r.json()).position, 2);
});

test('bad input gets 422 with field errors', async () => {
  const r = await handle(post({ email: 'nope', phone: 'call me' }), env(), ctx());
  assert.equal(r.status, 422);
  assert.deepEqual(Object.keys((await r.json()).errors).sort(), ['email', 'phone']);
});

test('an email alone is a complete sign-up', async () => {
  const e = env(), c = ctx(), m = relay();
  const r = await handle(post({ email: 'solo@example.com' }), e, c, m.f);
  await c.done();
  assert.equal(r.status, 200);
  assert.match(m.calls[0].body.bottleneck, /Name: \(not given\)/);
});

test('the honeypot answers ok and stores nothing', async () => {
  const e = env(), m = relay();
  const r = await handle(post({ ...ada, website: 'spam.biz' }), e, ctx(), m.f);
  assert.equal(r.status, 200);
  assert.equal(e.LEADS.m.size, 0);
  assert.equal(m.calls.length, 0);
});

test('oversized, malformed and non-object bodies are refused', async () => {
  assert.equal((await handle(post('x'.repeat(5000)), env(), ctx())).status, 413);
  assert.equal((await handle(post('{oops'), env(), ctx())).status, 400);
  assert.equal((await handle(post('[1,2]'), env(), ctx())).status, 400);
});

test('only POST and OPTIONS are allowed', async () => {
  const r = await handle(new Request(`${ORIGIN}/api/waitlist`, { headers: { origin: ORIGIN } }), env(), ctx());
  assert.equal(r.status, 405);
});

test('the rate limiter can say no', async () => {
  const r = await handle(post(ada), env({ LIMITER: { limit: async () => ({ success: false }) } }), ctx());
  assert.equal(r.status, 429);
});

test('a failed email is retried by the cron until it lands', async () => {
  const e = env(), c = ctx();
  await handle(post(ada), e, c, relay(502).f);
  await c.done();
  assert.equal(stored(e, 'ada@example.com').notified, false);
  assert.equal(await retryNotifications(e, relay(502).f), 0);
  assert.equal(await retryNotifications(e, relay(200).f), 1);
  assert.equal(stored(e, 'ada@example.com').notified, true);
  assert.equal(await retryNotifications(e, relay(200).f), 0);
});

test('our own page on any host is accepted without a list entry', async () => {
  const host = 'https://sixty-second-factory.example.workers.dev';
  const own = new Request(`${host}/api/waitlist`, { method: 'POST', headers: { origin: host }, body: JSON.stringify(ada) });
  const r = await handle(own, env({ ALLOWED_ORIGINS: '' }), ctx(), relay().f);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('access-control-allow-origin'), null); // same origin needs no CORS
});

test('the offline file (origin null) and server calls (no origin) are accepted', async () => {
  assert.equal((await handle(post(ada, { origin: 'null' }), env(), ctx(), relay().f)).status, 200);
  const bare = new Request(`${ORIGIN}/api/waitlist`, { method: 'POST', body: JSON.stringify(ada) });
  assert.equal((await handle(bare, env(), ctx(), relay().f)).status, 200);
});

test('the CSV export needs the admin token', async () => {
  const e = env();
  await handle(post({ ...ada, name: '=HYPERLINK("x")' }), e, ctx(), relay().f);
  const get = (auth?: string) => handle(new Request(`${ORIGIN}/api/leads`, { headers: auth ? { authorization: auth } : {} }), e, ctx());
  assert.equal((await get()).status, 401);
  assert.equal((await get('Bearer wrong')).status, 401);
  const r = await get('Bearer top-secret-token');
  assert.equal(r.status, 200);
  const csv = await r.text();
  assert.match(csv, /^position,email,name,phone,company,/);
  assert.match(csv, /1,ada@example\.com,"'=HYPERLINK\(""x""\)",'\+216 20 123 456,Engine Co/);
});

test('health and unknown routes', async () => {
  assert.equal((await handle(new Request(`${ORIGIN}/api/health`), env(), ctx())).status, 200);
  assert.equal((await handle(new Request(`${ORIGIN}/api/nope`), env(), ctx())).status, 404);
});
