// css.test.ts · every stylesheet shares one page, so a class may only live in one file unless it is meant to be shared 🧪
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const FILES = ['tokens', 'base', 'scenes-1', 'scenes-2', 'map', 'rooms'];
const SHARED = ['bad', 'chip', 'logo', 'on', 'pick', 'slide', 'yellow']; // deliberate: components and state modifiers

test('no class name is styled in two stylesheets by accident', () => {
  const owners = new Map<string, Set<string>>();
  for (const f of FILES) {
    const css = readFileSync(new URL(`../deck/src/${f}.css`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [, sel] of css.matchAll(/([^{}]+)\{/g)) {
      if (sel.trim().startsWith('@')) continue;
      for (const [, cls] of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) owners.set(cls, (owners.get(cls) ?? new Set()).add(f));
    }
  }
  const clashes = [...owners].filter(([cls, fs]) => fs.size > 1 && !SHARED.includes(cls)).map(([cls, fs]) => `${cls}: ${[...fs].join(', ')}`);
  assert.deepEqual(clashes, []);
});
