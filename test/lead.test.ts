// lead.test.ts · sign-up validation says no loudly and never truncates 🧪
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check } from '../server/lead.ts';

test('a valid sign-up is normalized', () => {
  const c = check({ name: '  Ada \n Lovelace ', email: ' ADA@Example.com ', company: 'Engine Co', id: 'abc', sector: 'gov', lang: 'fr' });
  assert.equal(c.ok, true);
  if (c.ok !== true) return;
  assert.deepEqual(c.lead, { id: 'abc', name: 'Ada Lovelace', email: 'ada@example.com', company: 'Engine Co', build: '', sector: 'gov', lang: 'fr', source: '' });
});

test('missing name and bad email are both reported', () => {
  assert.deepEqual(check({ email: 'nope' }), { ok: false, errors: { email: 'Enter a valid email address.', name: 'Tell us your name.' } });
});

test('overlong fields are rejected, not cut', () => {
  const c = check({ name: 'x'.repeat(101), email: 'a@b.co', build: 'y'.repeat(301) });
  assert.deepEqual(c, { ok: false, errors: { name: 'Too long.', build: 'Too long.' } });
});

test('non-string values count as empty', () => {
  const c = check({ name: 42, email: 'a@b.co', company: { evil: true } });
  assert.deepEqual(c, { ok: false, errors: { name: 'Tell us your name.' } });
});

test('the honeypot flags bots', () => {
  assert.deepEqual(check({ name: 'Bot', email: 'b@o.t', website: 'http://spam' }), { ok: 'bot' });
});

test('a missing id gets a fresh one', () => {
  const c = check({ name: 'Ada', email: 'a@b.co' });
  assert.ok(c.ok === true && /^[0-9a-f-]{36}$/.test(c.lead.id));
});
