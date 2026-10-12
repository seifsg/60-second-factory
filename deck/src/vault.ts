// vault.ts · two copies of every sign-up on the device (localStorage + IndexedDB); either one restores the other 💾
import type { Lead } from './leads.ts';
import { mergeLeads } from './leads.ts';

const KEY = 'sf60.leads.v1', DB = 'sf60', OS = 'leads';

const local = {
  read: (): unknown[] => {
    try { const v = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
  },
  write: (all: Lead[]): void => {
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* full or blocked: IndexedDB still holds it */ }
  },
};

let opening: Promise<IDBDatabase | null> | null = null;
const db = (): Promise<IDBDatabase | null> => (opening ??= new Promise(res => {
  try {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(OS, { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = r.onblocked = () => res(null);
  } catch { res(null); }
}));

const run = async <T>(mode: IDBTransactionMode, op: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | null> => {
  const d = await db();
  if (!d) return null;
  return new Promise(res => {
    try {
      const t = d.transaction(OS, mode), req = op(t.objectStore(OS));
      t.oncomplete = () => res(req ? req.result : null);
      t.onerror = t.onabort = () => res(null);
    } catch { res(null); }
  });
};

export const vault = {
  load: async (): Promise<Lead[]> => mergeLeads(local.read(), (await run<unknown[]>('readonly', s => s.getAll())) ?? []),
  // merge with what is stored right now, so a stale list can never drop a newer sign-up; IndexedDB never deletes
  save: async (all: Lead[]): Promise<void> => {
    local.write(mergeLeads(local.read(), all));
    await run('readwrite', s => { all.forEach(l => s.put(l)); });
  },
  persist: (): void => { navigator.storage?.persist?.().catch(() => false); }, // ask the browser to never evict it
};
