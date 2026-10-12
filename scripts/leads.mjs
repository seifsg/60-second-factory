// leads.mjs · downloads every waitlist sign-up as waitlist.csv (needs ADMIN_TOKEN in .dev.vars) 📥
import { readFileSync, writeFileSync } from 'node:fs';

const vars = Object.fromEntries(readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
if (!vars.ADMIN_TOKEN) throw new Error('ADMIN_TOKEN is missing from .dev.vars');

const r = await fetch(process.env.LEADS_URL ?? 'https://pitch.seif.dev/api/leads', { headers: { authorization: `Bearer ${vars.ADMIN_TOKEN}` } });
if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
const csv = await r.text();
writeFileSync(new URL('../waitlist.csv', import.meta.url), csv);
console.log(`📥 waitlist.csv · ${Math.max(0, csv.trim().split(/\r?\n/).length - 1)} sign-ups`);
