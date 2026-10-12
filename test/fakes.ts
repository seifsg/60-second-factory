// fakes.ts · in-memory stand-ins for KV, waitUntil and the relay, so server tests need no Cloudflare 🧪
import type { Env, Fetch } from '../server/types.ts';

export const ORIGIN = 'https://pitch.seif.dev';

export const kv = () => {
  const m = new Map<string, string>();
  return {
    m,
    get: async (k: string) => m.get(k) ?? null,
    put: async (k: string, v: string) => { m.set(k, v); },
    list: async ({ prefix }: { prefix: string }) => ({ keys: [...m.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }),
  };
};

export const ctx = () => {
  const jobs: Promise<unknown>[] = [];
  return { jobs, waitUntil: (p: Promise<unknown>) => { jobs.push(p); }, done: () => Promise.all(jobs) };
};

export const env = (over: Partial<Env> = {}) => ({
  LEADS: kv(), RELAY_URL: 'https://relay.test/api/lead', ALLOWED_ORIGINS: `${ORIGIN},null`, ADMIN_TOKEN: 'top-secret-token', ...over,
});

// relay that records calls and answers with the given status
export const relay = (status = 200) => {
  const calls: { url: string; body: Record<string, string> }[] = [];
  const f = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) });
    return new Response('{}', { status });
  }) as unknown as Fetch;
  return { calls, f };
};

export const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request(`${ORIGIN}/api/waitlist`, {
    method: 'POST',
    headers: { origin: ORIGIN, 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
