// deck.ts · the engine 🚂 taps, swipes, keys, stories bar, shift clock, EN/FR, rooms, wake lock, full screen
import type { Lang, Sector } from './copy.ts';
import type { Scene } from './scenes-1.ts';
import { COPY, SECTORS } from './copy.ts';
import { CONFIG } from './config.ts';
import { mmss } from './frame.ts';
import { ROOM_KINDS, initRooms, openRoom, refreshRoom, roomOpen } from './rooms.ts';
import { canFullscreen, toggleFullscreen, wake } from './screen.ts';
import { syncLeads } from './sync.ts';
import { sClock, sOops, sIntern, sRules, sGate, sLine } from './scenes-1.ts';
import { sExam, sProof, sSafe, sPlug, sOut } from './scenes-2.ts';

const SCENES: Scene[] = [sClock, sOops, sIntern, sRules, sGate, sLine, sExam, sProof, sSafe, sPlug, sOut];
const LAST = SCENES.length - 1;
const $ = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;
const deck = $('deck'), prog = $('prog'), clock = $('clock'), langBtn = $('lang'), fsBtn = $('fs'), turn = $('turn');
const st = { i: 0, lang: 'en' as Lang, sector: CONFIG.sector, t0: 0, t1: 0 };

const store = {
  get: (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, val: string): void => { try { localStorage.setItem(k, val); } catch { /* private mode, no biggie */ } },
};
const pick = <T>(val: unknown, list: readonly T[], dflt: T): T => (list.includes(val as T) ? (val as T) : dflt);
const secs = (): number => (st.t0 ? Math.round(((st.t1 || Date.now()) - st.t0) / 1000) : 0);
const html = (k: number): string => SCENES[k](COPY[st.lang], { sector: st.sector, secs: secs(), lang: st.lang });

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

// next guest: fresh deck, fresh clock, empty form, no previous guest's data on screen
function reset(): void {
  Object.assign(st, { i: 0, t0: 0, t1: 0, sector: CONFIG.sector });
  void openRoom(null);
  render();
}

function toggleLang(): void {
  st.lang = st.lang === 'en' ? 'fr' : 'en';
  store.set('sf-lang', st.lang);
  render();
  void refreshRoom();
}

const toggleMap = (): void => { void openRoom(roomOpen() === 'map' ? null : 'map'); };

fsBtn.hidden = !canFullscreen();

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
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-sector],[data-reset],[data-next],[data-room]');
  if (t?.dataset.room) { void openRoom(pick(t.dataset.room, ROOM_KINDS, 'join')); return; }
  if (t?.dataset.sector) { st.sector = pick(t.dataset.sector, SECTORS, st.sector); render(); return; }
  if (t?.hasAttribute('data-reset')) { reset(); return; }
  go(st.i + (!t && e.clientX < innerWidth * 0.28 ? -1 : 1));
});

const next = (): void => go(st.i + 1), back = (): void => go(st.i - 1);
const KEYS: Record<string, () => void> = {
  ArrowRight: next, ArrowDown: next, PageDown: next, ' ': next, Enter: next,
  ArrowLeft: back, ArrowUp: back, PageUp: back,
  Home: () => go(0), End: () => go(LAST), m: toggleMap, l: toggleLang, f: toggleFullscreen, Escape: () => { void openRoom(null); },
};
addEventListener('keydown', e => {
  const el = e.target as Element;
  if (el.closest?.('input, textarea, select') && e.key !== 'Escape') return; // typing a name must never flip slides
  const f = KEYS[e.key];
  if (!f || e.metaKey || e.ctrlKey || e.altKey) return;
  if ((e.key === ' ' || e.key === 'Enter') && el.closest?.('button')) return; // let buttons click
  if (roomOpen() && !['m', 'l', 'Escape'].includes(e.key)) return; // a room is open: arrows scroll it
  e.preventDefault();
  f();
  wake();
});
langBtn.addEventListener('click', toggleLang);
$('mapBtn').addEventListener('click', toggleMap);
fsBtn.addEventListener('click', toggleFullscreen);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
setInterval(() => { clock.textContent = mmss(secs()); }, 500);

// #presenter unlocks the story map on this device, #audience locks it again 🎤
const presenter = (): boolean => {
  if (location.hash === '#presenter') store.set('sf-presenter', '1');
  if (location.hash === '#audience') store.set('sf-presenter', '0');
  return store.get('sf-presenter') === '1';
};
addEventListener('hashchange', () => document.body.classList.toggle('presenter', presenter()));

// boot, and survive live republishes mid-pitch without losing the slide 🔁
type Snap = Partial<{ i: number; lang: Lang; sector: Sector }>;
type Hot = { snapshot?(f: () => Snap): void; ready?(f: (d: Snap) => void): void; data?: Snap };
const hot = (window as unknown as { claude?: { hot?: Hot } }).claude?.hot;
function start(d: Snap = {}): void {
  st.lang = pick(d.lang ?? store.get('sf-lang'), ['en', 'fr'] as const, 'en');
  st.sector = pick(d.sector, SECTORS, CONFIG.sector);
  st.i = Number.isInteger(d.i) ? Math.max(0, Math.min(LAST, d.i as number)) : 0;
  document.body.classList.toggle('presenter', presenter());
  render();
  void syncLeads(); // flush anything captured while offline last time
  // offline after the first visit (served pages only; file:// and embedded frames skip it)
  try {
    if (/^https?:$/.test(location.protocol)) navigator.serviceWorker?.register('sw.js').catch(() => { /* not allowed here */ });
  } catch { /* sandboxed frame */ }
}
initRooms({ copy: () => COPY[st.lang], lang: () => st.lang, slide: () => st.i, sector: () => st.sector, go, reset });
hot?.snapshot?.(() => ({ i: st.i, lang: st.lang, sector: st.sector }));
if (hot?.ready) hot.ready(start); else start(hot?.data ?? {});
