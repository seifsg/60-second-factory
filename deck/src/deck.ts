// deck.ts · the engine 🚂 taps, swipes, keys, stories bar, shift clock, EN/FR, story map, wake lock, full screen
import type { Lang, Sector } from './copy.ts';
import type { Scene } from './scenes-1.ts';
import { COPY, SECTORS } from './copy.ts';
import { CONFIG } from './config.ts';
import { mmss } from './frame.ts';
import { mapHtml } from './map.ts';
import { sClock, sOops, sIntern, sRules, sGate, sLine } from './scenes-1.ts';
import { sExam, sProof, sSafe, sPlug, sOut } from './scenes-2.ts';

const SCENES: Scene[] = [sClock, sOops, sIntern, sRules, sGate, sLine, sExam, sProof, sSafe, sPlug, sOut];
const LAST = SCENES.length - 1;
const $ = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;
const deck = $('deck'), prog = $('prog'), clock = $('clock'), langBtn = $('lang'), mapEl = $('map'), fsBtn = $('fs'), turn = $('turn');
const st = { i: 0, lang: 'en' as Lang, sector: CONFIG.sector, t0: 0, t1: 0 };

const store = {
  get: (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, val: string): void => { try { localStorage.setItem(k, val); } catch { /* private mode, no biggie */ } },
};
const pick = <T>(val: unknown, list: readonly T[], dflt: T): T => (list.includes(val as T) ? (val as T) : dflt);
const secs = (): number => (st.t0 ? Math.round(((st.t1 || Date.now()) - st.t0) / 1000) : 0);
const html = (k: number): string => SCENES[k](COPY[st.lang], { sector: st.sector, secs: secs() });

function render(): void {
  deck.innerHTML = SCENES.map((_, k) => html(k)).join('');
  prog.innerHTML = '<i></i>'.repeat(SCENES.length);
  langBtn.textContent = st.lang === 'en' ? 'FR' : 'EN';
  turn.textContent = COPY[st.lang].ui.turn;
  document.documentElement.lang = st.lang;
  show(st.i);
}

function show(i: number): void {
  st.i = Math.max(0, Math.min(LAST, i));
  const slides = [...deck.children] as HTMLElement[];
  slides.forEach(s => s.classList.remove('on'));
  const cur = slides[st.i];
  void cur.offsetWidth; // reflow so the scene replays ✨
  cur.classList.add('on');
  [...prog.children].forEach((b, k) => b.classList.toggle('done', k <= st.i));
  document.body.classList.toggle('lite', cur.matches('.yellow, .paper'));
}

// the shift clock starts on the first tap and stops on the last slide ⏱️
function go(i: number): void {
  if (i < 0 || i > LAST || i === st.i) return;
  if (!st.t0 && i > 0) st.t0 = Date.now();
  st.t1 = i === LAST ? Date.now() : 0;
  if (i === LAST) deck.children[LAST].outerHTML = html(LAST);
  show(i);
}

function reset(): void {
  Object.assign(st, { i: 0, t0: 0, t1: 0, sector: CONFIG.sector });
  toggleMap(false);
  render();
}

function toggleLang(): void {
  st.lang = st.lang === 'en' ? 'fr' : 'en';
  store.set('sf-lang', st.lang);
  render();
  if (!mapEl.hidden) toggleMap(true);
}

function toggleMap(open = mapEl.hidden): void {
  if (open) { mapEl.innerHTML = mapHtml(COPY[st.lang], st.i); mapEl.scrollTop = 0; }
  mapEl.hidden = !open;
}

// full screen + wake lock are bonuses: refused → silently skip 🙈
type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };
const root = document.documentElement as FsEl;
const fsReq = root.requestFullscreen ?? root.webkitRequestFullscreen;
fsBtn.hidden = !fsReq;
function fullscreen(): void {
  const d = document as FsDoc;
  const on = d.fullscreenElement || d.webkitFullscreenElement;
  try {
    Promise.resolve(on ? (d.exitFullscreen ?? d.webkitExitFullscreen)?.call(d) : fsReq?.call(root)).catch(() => { /* frame said no */ });
  } catch { /* unsupported here */ }
}

type Lock = { addEventListener(t: 'release', f: () => void): void };
let lock: Lock | null = null;
function wake(): void {
  const wl = (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<Lock> } }).wakeLock;
  if (lock || !wl) return;
  wl.request('screen').then(l => { lock = l; l.addEventListener('release', () => { lock = null; }); }).catch(() => { /* no wake lock here */ });
}

// taps: left 28% = back, anywhere else = next · swipes both ways · chips and buttons do their own thing 👆
let x0 = 0, y0 = 0, swiped = false;
deck.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; swiped = false; });
deck.addEventListener('pointerup', e => {
  const dx = e.clientX - x0, dy = e.clientY - y0;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; go(st.i + (dx < 0 ? 1 : -1)); }
});
deck.addEventListener('click', e => {
  wake();
  if (swiped) return;
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-sector],[data-reset],[data-next]');
  if (t?.dataset.sector) { st.sector = pick(t.dataset.sector, SECTORS, st.sector); render(); return; }
  if (t?.hasAttribute('data-reset')) { reset(); return; }
  go(st.i + (!t && e.clientX < innerWidth * 0.28 ? -1 : 1));
});
mapEl.addEventListener('click', e => {
  const t = (e.target as Element).closest('[data-jump],[data-reset],[data-close]');
  if (!t) return;
  if (t.hasAttribute('data-reset')) { reset(); return; }
  toggleMap(false);
  const j = t.getAttribute('data-jump');
  if (j != null) go(Number(j));
});

const next = (): void => go(st.i + 1), back = (): void => go(st.i - 1);
const KEYS: Record<string, () => void> = {
  ArrowRight: next, ArrowDown: next, PageDown: next, ' ': next, Enter: next,
  ArrowLeft: back, ArrowUp: back, PageUp: back,
  Home: () => go(0), End: () => go(LAST), m: () => toggleMap(), l: toggleLang, f: fullscreen, Escape: () => toggleMap(false),
};
addEventListener('keydown', e => {
  const f = KEYS[e.key];
  if (!f || e.metaKey || e.ctrlKey || e.altKey) return;
  if ((e.key === ' ' || e.key === 'Enter') && (e.target as Element).closest('button')) return; // let buttons click
  if (!mapEl.hidden && !['m', 'l', 'Escape'].includes(e.key)) return; // map open: arrows scroll it
  e.preventDefault();
  f();
  wake();
});
langBtn.addEventListener('click', toggleLang);
$('mapBtn').addEventListener('click', () => toggleMap());
fsBtn.addEventListener('click', fullscreen);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
setInterval(() => { clock.textContent = mmss(secs()); }, 500);

// boot, and survive live republishes mid-pitch without losing the slide 🔁
type Snap = Partial<{ i: number; lang: Lang; sector: Sector }>;
type Hot = { snapshot?(f: () => Snap): void; ready?(f: (d: Snap) => void): void; data?: Snap };
const hot = (window as unknown as { claude?: { hot?: Hot } }).claude?.hot;
function start(d: Snap = {}): void {
  st.lang = pick(d.lang ?? store.get('sf-lang'), ['en', 'fr'] as const, 'en');
  st.sector = pick(d.sector, SECTORS, CONFIG.sector);
  st.i = Number.isInteger(d.i) ? Math.max(0, Math.min(LAST, d.i as number)) : 0;
  render();
}
hot?.snapshot?.(() => ({ i: st.i, lang: st.lang, sector: st.sector }));
if (hot?.ready) hot.ready(start); else start(hot?.data ?? {});
