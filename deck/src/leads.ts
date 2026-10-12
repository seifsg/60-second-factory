// leads.ts · sign-ups on the device: shape, merge and retry rules (pure, tested) 🧮
import type { Lang, Sector } from './copy.ts';

export type LeadState = 'queued' | 'sent' | 'rejected';
export interface Lead {
  id: string; name: string; email: string; company: string; build: string;
  sector: Sector; lang: Lang; source: string; ts: number; state: LeadState; tries: number; position?: number;
}

const RANK: Record<LeadState, number> = { queued: 0, rejected: 1, sent: 2 };

export const isLead = (v: unknown): v is Lead => {
  const l = v as Lead;
  return !!l && typeof l === 'object' && typeof l.id === 'string' && typeof l.email === 'string' && typeof l.ts === 'number' && l.state in RANK;
};

// union of every device copy by id; the furthest state wins, so a sent lead never sends twice
export const mergeLeads = (...lists: unknown[][]): Lead[] => {
  const by = new Map<string, Lead>();
  for (const l of lists.flat()) {
    if (!isLead(l)) continue;
    const p = by.get(l.id);
    if (!p || RANK[l.state] > RANK[p.state] || (RANK[l.state] === RANK[p.state] && l.tries > p.tries)) by.set(l.id, l);
  }
  return [...by.values()].sort((a, b) => a.ts - b.ts);
};

// HTTP status → next state: 2xx sent; bad input never fixes itself; anything else (offline, 5xx, 404) retries
export const outcome = (status: number): LeadState =>
  status >= 200 && status < 300 ? 'sent' : [400, 413, 422].includes(status) ? 'rejected' : 'queued';

export const nextDelay = (tries: number): number => Math.min(10 * 60_000, 15_000 * 2 ** Math.max(0, tries - 1));

export const payload = (l: Lead): Record<string, string> =>
  ({ id: l.id, name: l.name, email: l.email, company: l.company, build: l.build, sector: l.sector, lang: l.lang, source: l.source });

// ids work even where crypto.randomUUID is missing (file:// is not a secure context everywhere)
export const uid = (): string => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

export const LEAD_HEAD = ['time', 'name', 'email', 'company', 'build', 'sector', 'lang', 'state', 'position'];
export const leadRows = (all: Lead[]): unknown[][] =>
  all.map(l => [new Date(l.ts).toISOString(), l.name, l.email, l.company, l.build, l.sector, l.lang, l.state, l.position ?? '']);
