// scenes-1.ts · hook, problem and reveal 🎬 clock in, the gag, the intern, more rules, the gate, the line
import type { Copy, Lang, Sector } from './copy.ts';
import type { Pos } from './frame.ts';
import { SECTORS, SECTOR_EMOJI, STATION_ICONS } from './copy.ts';
import { CONFIG } from './config.ts';
import { bot, laptop, logo, ring } from './art.ts';
import { el, frame } from './frame.ts';

export interface State { sector: Sector; secs: number; lang: Lang }
export type Scene = (c: Copy, s: State) => string;

// 1 · promise + stakes: 60 s on a punch clock whose second hand really sweeps 60 s ⏱️
export const sClock: Scene = c => frame('clock', c.s1,
  el('cin a pop', [3, 16, 36, .5], `<button type="button" class="big" data-next>${c.s1.btn}</button><small>${c.ui.tapIn}</small>`) +
  el('machine', [56, 0, 30], '<div class="face"><i class="hh"></i><i class="mh"></i><i class="sh"></i></div><div class="slot"></div>') +
  el('card', [56, 68, 30], `<small>${CONFIG.event}</small><b>${c.s1.card}</b><i></i><i></i>`),
  { cls: 'hero', td: 1.2 });

// 2 · pattern interrupt: the AI builds, brags, and the app falls apart 🔥
const BLOCKS: [number, number, number][] = [[.3, 3, 18], [.55, 3.15, -30], [.8, 3.3, 40], [1.05, 3.45, -20], [1.3, 3.6, 28]];
const BUGS: [number, string, string, number][] = [[8, '-140%', '60%', 3.2], [44, '30%', '90%', 3.4], [78, '150%', '40%', 3.6]];
export const sOops: Scene = c => frame('oops', c.s2,
  el('coder', [3, 24, 17], bot('typing')) +
  el('', [13, 47, 23], laptop()) +
  el('bubble a pop', [1, 0, 34, 1.8], c.s2.bubble) +
  el('app', [42, 3, 54], `<div class="win"><i></i><div class="ui">${BLOCKS.map(([d, fd, r], k) =>
    `<b class="blk b${k + 1}" style="--d:${d}s;--fd:${fd}s;--rot:${r}deg"></b>`).join('')}</div></div>`) +
  el('bugs', [46, 66, 48, 0, 20], BUGS.map(([x, tx, ty, d]) => `<span style="left:${x}%;--tx:${tx};--ty:${ty};--d:${d}s">🐛</span>`).join('')) +
  el('fire', [87, 0, 10], '🔥') +
  el('stamp a slam', [38, 30, 56, 3.8], c.s2.stamp),
  { sd: 4.2, td: 4.6 });

// 3 · relatable villain + the planted number (0/7) 😎
const BAD_AT: Pos[] = [[2, 27, undefined, .7], [2, 48, undefined, 1], [2, 69, undefined, 1.3], [64, 4, undefined, 1.6]];
export const sIntern: Scene = c => frame('intern', c.s3,
  el('cool', [36, 6, 25], bot('', ['shades'])) +
  el('chip good a pop', [2, 6, undefined, .3], `⚡ ${c.s3.good}`) +
  c.s3.bad.map((b, k) => el('chip bad a pop', BAD_AT[k], `✗ ${b}`)).join('') +
  el('report a rise', [66, 24, 30, 2.1], `<small>${c.s3.card}</small><b class="aplus">A+${ring(2.5)}</b>`) +
  el('badge bad a pop', [66, 52, 30, 2.7], `<b>0<span>/7</span></b><small>${c.s3.found}</small>`) +
  el('note a fade', [0, 95, 100, 3], c.s3.note),
  { sd: 2.2, td: 3.2 });

// 4 · the obvious fix fails: a scroll of rules vs a bot in headphones 🎧
export const sRules: Scene = c => frame('rules', c.s4,
  el('roll', [4, 6, 46], c.s4.rules.map((r, k) => `<p class="a fade" style="--d:${(.6 + k * .32).toFixed(2)}s">${k + 1}. ${r}</p>`).join('')) +
  el('dj', [60, 14, 26], bot('', ['phones'])) +
  el('notes', [56, 0, 36, 0, 34], [[4, .2], [40, .9], [72, 1.6]].map(([x, d]) => `<i style="left:${x}%;--d:${d}s">♪</i>`).join('')),
  { sd: 2.3, td: 2.8 });

// 5 · plot twist #1: the gate slams, then the name lands 🚧
export const sGate: Scene = c => frame('gate', { ...c.s5, h: `${logo('hl')} ${c.s5.h}` },
  el('door', [72, 2, 24, 0, 80], `<b>&lt;/&gt;</b><span>${c.s5.door}</span>`) +
  el('post', [67, 28, 2.6, 0, 62]) +
  el('arm', [37, 26, 31, 0, 7]) +
  el('runner', [2, 30, 17], bot()) +
  el('stars a pop', [21, 14, 9, 1.25], '💫') +
  el('stamp gate-stamp a slam', [3, 76, 64, 1.5], c.s5.stamp),
  { cls: 'yellow', hd: 1.9, td: 2.6 });

// 6 · participation: they pick a sector, the crate rides past every station 📦
const picker = (c: Copy, s: State): string => `<div class="pick" role="group" aria-label="${c.s6.pick}">${SECTORS.map(k =>
  `<button type="button" class="chip${k === s.sector ? ' sel' : ''}" data-sector="${k}" aria-pressed="${k === s.sector}">${SECTOR_EMOJI[k]} ${c.sectors[k].label}</button>`).join('')}</div>`;
export const sLine: Scene = (c, s) => frame('line', c.s6,
  el('stations', [0, 12, 100], c.s6.stations.map((t, k) =>
    `<div class="st" style="--d:${(.98 + k * .73).toFixed(2)}s"><b>${STATION_ICONS[k]}</b><span>${t}</span></div>`).join('')) +
  el('crate', [-11, 50, 10], `<span>${SECTOR_EMOJI[s.sector]}</span>`) +
  el('belt', [0, 66, 100, 0, 7]) +
  el('rollers', [1, 74, 98], '<i></i>'.repeat(14)) +
  el('chip merge a pop', [74, 85, undefined, 6.4], `👆 ${c.s6.merge}`) +
  el('illus', [0, 93, 50], c.ui.illus),
  { extra: picker(c, s), td: 6.8 });
