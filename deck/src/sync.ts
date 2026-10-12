// sync.ts · ships queued sign-ups to the factory, backs off while offline, never drops one 📮
import type { Lead } from './leads.ts';
import { nextDelay, outcome, payload } from './leads.ts';
import { vault } from './vault.ts';
import { CONFIG } from './config.ts';

type Listener = (all: Lead[]) => void;
const listeners: Listener[] = [];
let timer = 0, busy = false, again = false;

// same origin when served by the Worker; the offline file (file://) calls the live API
const api = (): string => (/^https?:$/.test(location.protocol) ? '/api/waitlist' : CONFIG.api);

const send = async (l: Lead): Promise<{ status: number; position?: number }> => {
  try {
    const r = await fetch(api(), {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload(l)),
      signal: AbortSignal.timeout?.(10_000),
    });
    const j = await r.json().catch(() => ({}));
    return { status: r.status, position: typeof j.position === 'number' ? j.position : undefined };
  } catch {
    return { status: 0 }; // offline, DNS, CORS or timeout: try again later
  }
};

export const onLeads = (f: Listener): void => { listeners.push(f); };

export async function syncLeads(): Promise<Lead[]> {
  if (busy) { again = true; return vault.load(); }
  busy = true;
  clearTimeout(timer);
  try {
    const all = await vault.load();
    for (const l of all.filter(x => x.state === 'queued')) {
      const r = await send(l);
      l.tries++;
      l.state = outcome(r.status);
      if (r.position) l.position = r.position;
      await vault.save(all);
      if (l.state === 'queued') break; // network or server down: stop, the timer retries
    }
    const wait = all.filter(x => x.state === 'queued');
    if (wait.length) timer = window.setTimeout(syncLeads, nextDelay(Math.min(...wait.map(x => x.tries))));
    listeners.forEach(f => f(all));
    return all;
  } finally {
    busy = false;
    if (again) { again = false; void syncLeads(); }
  }
}

export async function addLead(l: Lead): Promise<void> {
  await vault.save([...(await vault.load()), l]);
  vault.persist();
}

addEventListener('online', () => { void syncLeads(); });
