// build.mjs · stitches src/ into three outputs 🧵
//   dist/site/            what the Worker serves: page, assets/, home-screen app files, offline service worker
//   dist/offline.html     one self-contained file, images inlined, opens straight from a tablet
//   dist/artifact.html    page fragment for claude.ai artifacts (the host adds the skeleton)
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { stripTypeScriptTypes } from 'node:module';

const CSS = ['tokens', 'base', 'scenes-1', 'scenes-2', 'map', 'rooms'];
const TS = ['../../shared/email', '../../shared/csv', '../../shared/phone', 'copy', 'rooms-copy', 'config', 'art', 'frame', 'leads', 'vault',
  'sync', 'mailfix', 'screen', 'scenes-1', 'scenes-2', 'map', 'show', 'join', 'rooms', 'deck']; // dependency order, one shared scope
const MIME = { jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
const at = p => new URL(p, import.meta.url);
const src = f => readFileSync(at(`./src/${f}`), 'utf8');
const strip = f => stripTypeScriptTypes(src(`${f}.ts`)).replace(/^import .*$/gm, '').replace(/^export /gm, '');
const inline = html => html.replace(/assets\/([\w.-]+)\.(jpg|png|gif|webp)/g, (_, f, ext) =>
  `data:${MIME[ext]};base64,${readFileSync(at(`./assets/${f}.${ext}`)).toString('base64')}`);

const page = src('index.html')
  .replace('/*CSS*/', () => CSS.map(f => src(`${f}.css`)).join('\n'))
  .replace('/*JS*/', () => `(() => {\n'use strict';\n${TS.map(strip).join('\n')}\n})();`);
const doc = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n${src('head.html')}${page}</html>\n`;

// site: page + assets + app shell; the worker's cache name changes whenever the page does
const assets = readdirSync(at('./assets/')).map(f => `assets/${f}`);
const build = createHash('sha256').update(doc).digest('hex').slice(0, 10);
mkdirSync(at('./dist/site/'), { recursive: true });
writeFileSync(at('./dist/site/index.html'), doc);
cpSync(at('./assets/'), at('./dist/site/assets/'), { recursive: true });
cpSync(at('./public/'), at('./dist/site/'), { recursive: true });
writeFileSync(at('./dist/site/sw.js'), readFileSync(at('./public/sw.js'), 'utf8')
  .replace('__BUILD__', build).replace('__ASSETS__', JSON.stringify(assets)));

writeFileSync(at('./dist/offline.html'), inline(doc));
writeFileSync(at('./dist/artifact.html'), inline(page));
console.log(`built ✨ ${build} · page ${(Buffer.byteLength(doc) / 1024).toFixed(1)} KB · offline ${(Buffer.byteLength(inline(doc)) / 1024).toFixed(0)} KB`);
