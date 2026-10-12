// leads.test.ts · the tablet-side rules: merge, retry, payload 🧪
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Lead } from '../deck/src/leads.ts';
import { mergeLeads, nextDelay, outcome, payload, uid } from '../deck/src/leads.ts';

const lead = (over: Partial<Lead> = {}): Lead => ({
  id: 'a', name: 'Ada', email: 'ada@example.com', company: '', build: '', sector: 'gov', lang: 'en', source: 'pitch.seif.dev',
  ts: 1, state: 'queued', tries: 0, ...over,
});

test('merging two device copies keeps one lead per id, furthest state wins', () => {
  const merged = mergeLeads([lead(), lead({ id: 'b', ts: 2 })], [lead({ state: 'sent', tries: 1 }), { junk: true }, null]);
  assert.deepEqual(merged.map(l => [l.id, l.state]), [['a', 'sent'], ['b', 'queued']]);
});

test('a stale copy never downgrades a sent lead', () => {
  assert.equal(mergeLeads([lead({ state: 'sent' })], [lead({ state: 'queued', tries: 9 })])[0].state, 'sent');
});

test('status codes map to the next state', () => {
  assert.equal(outcome(200), 'sent');
  for (const s of [400, 413, 422]) assert.equal(outcome(s), 'rejected');
  for (const s of [0, 403, 404, 429, 500, 502]) assert.equal(outcome(s), 'queued');
});

test('retries back off and cap at ten minutes', () => {
  assert.deepEqual([0, 1, 2, 3].map(nextDelay), [15_000, 15_000, 30_000, 60_000]);
  assert.equal(nextDelay(50), 600_000);
});

test('the payload carries only what the server needs', () => {
  assert.deepEqual(Object.keys(payload(lead())).sort(), ['build', 'company', 'email', 'id', 'lang', 'name', 'sector', 'source']);
});

test('ids are unique', () => {
  assert.notEqual(uid(), uid());
});
