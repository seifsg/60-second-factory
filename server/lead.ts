// lead.ts · validates one sign-up and says no loudly (no silent truncation) 🧾 only the email is required
import type { NewLead } from './types.ts';
import { isEmail } from '../shared/email.ts';
import { isPhone } from '../shared/phone.ts';

const MAX = { id: 64, name: 100, phone: 30, company: 120, build: 300, sector: 20, lang: 5, source: 60 } as const;
type Field = keyof typeof MAX;

// whitespace runs and control characters become one space, then trim; non-strings count as empty
const clean = (v: unknown): string => (typeof v === 'string' ? v.replace(/[\s\u0000-\u001f\u007f]+/g, ' ').trim() : '');

export type Check = { ok: true; lead: NewLead } | { ok: false; errors: Record<string, string> } | { ok: 'bot' };

export const check = (body: Record<string, unknown>): Check => {
  if (clean(body.website)) return { ok: 'bot' }; // honeypot field humans never see
  const errors: Record<string, string> = {};
  const out = {} as Record<Field, string>;
  for (const k of Object.keys(MAX) as Field[]) {
    out[k] = clean(body[k]);
    if (out[k].length > MAX[k]) errors[k] = 'Too long.';
  }
  const email = clean(body.email).toLowerCase();
  if (!isEmail(email)) errors.email = 'Enter a valid email address.';
  if (!errors.phone && !isPhone(out.phone)) errors.phone = 'Use digits, spaces and + for the phone.';
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, lead: { ...out, email, id: out.id || crypto.randomUUID() } };
};
