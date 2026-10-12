// mailfix.test.ts · one-tap domains and "did you mean" never mangle real addresses 🧪
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromEmail, suggest, withDomain } from '../deck/src/mailfix.ts';
import { isPhone } from '../shared/phone.ts';

test('common typos get one suggestion', () => {
  assert.equal(suggest('ada@gmial.com'), 'ada@gmail.com');
  assert.equal(suggest('Ada@GMAI.com'), 'ada@gmail.com');
  assert.equal(suggest('ada@gmail.co'), 'ada@gmail.com');
  assert.equal(suggest('ada@hotmial.com'), 'ada@hotmail.com');
  assert.equal(suggest('ada@outlok.com'), 'ada@outlook.com');
});

test('real, regional and company domains are left alone', () => {
  for (const ok of ['ada@gmail.com', 'ada@yahoo.fr', 'ada@hotmail.fr', 'ada@outlook.fr', 'seif@horizonlux.com', 'ada@topnet.tn', 'ada', 'ada@', '@gmail.com', 'a@b@c.com']) {
    assert.equal(suggest(ok), null, ok);
  }
});

test('a tapped domain replaces whatever came after the @', () => {
  assert.equal(withDomain('ada', 'gmail.com'), 'ada@gmail.com');
  assert.equal(withDomain(' ada@gm ', 'gmail.com'), 'ada@gmail.com');
  assert.equal(withDomain('ada@yahoo.com', 'outlook.com'), 'ada@outlook.com');
});

test('the badge reads a name out of the email', () => {
  assert.equal(fromEmail('ada.lovelace@x.com'), 'ada lovelace');
  assert.equal(fromEmail('grace_hopper+pitch@navy.mil'), 'grace hopper pitch');
  assert.equal(fromEmail(''), '');
});

test('phone is optional, but junk is refused', () => {
  for (const ok of ['', '+216 20 123 456', '(216) 20-123-456', '20123456', '+33 6 12 34 56 78']) assert.equal(isPhone(ok), true, ok);
  for (const bad of ['abc', '12345', '+216 20 12x 456', '1'.repeat(31), 'call me']) assert.equal(isPhone(bad), false, bad);
});
