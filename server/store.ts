// store.ts · KV is the source of truth: one record per email, merged on repeat sign-ups 🗄️
import type { KV, Lead, NewLead } from './types.ts';

const key = (email: string): string => `lead:${email}`;

export const read = async (kv: KV, email: string): Promise<Lead | null> => {
  const raw = await kv.get(key(email));
  try { return raw ? (JSON.parse(raw) as Lead) : null; } catch { return null; }
};

export const write = (kv: KV, lead: Lead): Promise<void> => kv.put(key(lead.email), JSON.stringify(lead));

const nextPosition = async (kv: KV): Promise<number> => {
  const n = Number(await kv.get('meta:count')) + 1 || 1;
  await kv.put('meta:count', String(n));
  return n;
};

// same lead id again = a client retry: no double count, no second email ✨
export const upsert = async (kv: KV, n: NewLead, now = new Date().toISOString()): Promise<{ lead: Lead; fresh: boolean }> => {
  const old = await read(kv, n.email);
  const { id, ...fields } = n;
  if (old) {
    const seen = old.ids.includes(id);
    const lead: Lead = {
      ...old, name: n.name || old.name, phone: n.phone || old.phone || '', company: n.company || old.company, build: n.build || old.build,
      sector: n.sector || old.sector, lang: n.lang || old.lang, last: now,
      count: old.count + (seen ? 0 : 1), ids: seen ? old.ids : [...old.ids, id].slice(-20),
    };
    await write(kv, lead);
    return { lead, fresh: false };
  }
  const lead: Lead = { ...fields, ids: [id], position: await nextPosition(kv), first: now, last: now, count: 1, notified: false };
  await write(kv, lead);
  return { lead, fresh: true };
};

export const all = async (kv: KV): Promise<Lead[]> => {
  const out: Lead[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: 'lead:', cursor });
    for (const k of page.keys) {
      const lead = await read(kv, k.name.slice(5));
      if (lead) out.push(lead);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out.sort((a, b) => a.position - b.position);
};
