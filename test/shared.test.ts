// shared.test.ts · email check + CSV export 🧪
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isEmail } from '../shared/email.ts';
import { toCsv } from '../shared/csv.ts';

test('isEmail accepts real addresses', () => {
  for (const ok of ['a@b.co', 'seif.s+tag@horizon-lux.com', 'Ada@Example.COM']) assert.equal(isEmail(ok), true, ok);
});

test('isEmail rejects junk and overlong input', () => {
  for (const bad of ['', 'a@b', 'a b@c.com', '@c.com', 'a@.c', 'a@b.c', `${'x'.repeat(250)}@b.co`]) assert.equal(isEmail(bad), false, bad);
});

test('toCsv quotes commas, quotes and newlines, and defuses formulas', () => {
  const csv = toCsv(['a', 'b'], [['x,y', 'say "hi"'], ['=1+1', null], ['line\nbreak', 3]]);
  assert.equal(csv, 'a,b\r\n"x,y","say ""hi"""\r\n\'=1+1,\r\n"line\nbreak",3\r\n');
});
