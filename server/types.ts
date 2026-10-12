// types.ts · the slice of the Workers runtime we use, so tests can fake it 🧩
export interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  list(o: { prefix: string; cursor?: string }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>;
}
export interface Env {
  LEADS: KV;
  ASSETS?: { fetch(req: Request): Promise<Response> };
  LIMITER?: { limit(o: { key: string }): Promise<{ success: boolean }> };
  RELAY_URL?: string; // softwarefactory.company lead mailer
  ALLOWED_ORIGINS?: string; // comma list, "null" allows the offline file
  ADMIN_TOKEN?: string; // secret for /api/leads
}
export interface Ctx { waitUntil(p: Promise<unknown>): void }
export type Fetch = typeof fetch;

export interface NewLead { id: string; email: string; name: string; company: string; build: string; sector: string; lang: string; source: string }
export interface Lead extends Omit<NewLead, 'id'> { ids: string[]; position: number; first: string; last: string; count: number; notified: boolean }
