// relay.ts · emails Seif through softwarefactory.company's existing lead mailer, so no new SMTP secrets 📮
import type { Env, Fetch, Lead } from './types.ts';
import { all, read, write } from './store.ts';

export const relayBody = (l: Lead): Record<string, string> => ({
  form: 'setup',
  email: l.email,
  company: l.company,
  bottleneck: [
    `Joined the 60-Second Factory waitlist (#${l.position}).`,
    `Name: ${l.name}`,
    l.build && `Wants to build first: ${l.build}`,
    l.sector && `Sector picked in the pitch: ${l.sector}`,
    `Language: ${l.lang || 'en'} · Source: ${l.source || 'pitch'}`,
  ].filter(Boolean).join('\n'),
  source_page: 'pitch.seif.dev',
  cta: 'waitlist',
});

export const relay = async (url: string, l: Lead, f: Fetch): Promise<boolean> => {
  try {
    const r = await f(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'sixty-second-factory-waitlist' },
      body: JSON.stringify(relayBody(l)),
      signal: AbortSignal.timeout(10_000),
    });
    return r.ok;
  } catch {
    return false;
  }
};

// mark notified only after the mailer said yes; re-read first so a parallel update is not lost
export const notify = async (env: Env, l: Lead, f: Fetch): Promise<boolean> => {
  if (!env.RELAY_URL || !(await relay(env.RELAY_URL, l, f))) return false;
  const fresh = (await read(env.LEADS, l.email)) ?? l;
  await write(env.LEADS, { ...fresh, notified: true });
  return true;
};

// cron: retry every lead whose email has not gone out yet (bounded per run) 🔁
export const retryNotifications = async (env: Env, f: Fetch, max = 25): Promise<number> => {
  const pending = (await all(env.LEADS)).filter(l => !l.notified).slice(0, max);
  let sent = 0;
  for (const l of pending) if (await notify(env, l, f)) sent++;
  return sent;
};
