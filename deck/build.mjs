// build.mjs · stitches src/ into three outputs 🧵
//   dist/site/index.html   GitHub Pages (full page)
//   dist/offline.html      same page, one file, opens straight from a tablet
//   dist/artifact.html     page fragment for claude.ai artifacts (the host adds the skeleton)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

const CSS = ['tokens', 'base', 'scenes-1', 'scenes-2', 'map'];
const TS = ['copy', 'config', 'art', 'frame', 'scenes-1', 'scenes-2', 'map', 'deck']; // dependency order, one shared scope
const src = f => readFileSync(new URL(`./src/${f}`, import.meta.url), 'utf8');
const strip = f => stripTypeScriptTypes(src(`${f}.ts`)).replace(/^import .*$/gm, '').replace(/^export /gm, '');

const page = src('index.html')
  .replace('/*CSS*/', () => CSS.map(f => src(`${f}.css`)).join('\n'))
  .replace('/*JS*/', () => `(() => {\n'use strict';\n${TS.map(strip).join('\n')}\n})();`);
const doc = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n${src('head.html')}${page}</html>\n`;

const out = new URL('./dist/', import.meta.url);
mkdirSync(new URL('site/', out), { recursive: true });
writeFileSync(new URL('site/index.html', out), doc);
writeFileSync(new URL('offline.html', out), doc);
writeFileSync(new URL('artifact.html', out), page);
console.log(`built ✨ ${(Buffer.byteLength(doc) / 1024).toFixed(1)} KB`);
