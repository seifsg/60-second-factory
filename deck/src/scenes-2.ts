// scenes-2.ts · twists, safety net and the ask 🎯 secret exam, receipts, safety, your AI, clock out
import type { Scene } from './scenes-1.ts';
import { SECTOR_EMOJI } from './copy.ts';
import { ROOMS } from './rooms-copy.ts';
import { CONFIG } from './config.ts';
import { bot, logo, qr, ring } from './art.ts';
import { el, frame, mmss } from './frame.ts';

const flip = '<b class="flip"><i class="x">✗</i><i class="v">✓</i></b>';

// 7 · plot twist #2: the inspector seals the exam behind a wall, the builder never peeks 🕵️
export const sExam: Scene = c => frame('exam', c.s7,
  el('insp', [2, 16, 17], bot('', ['hat', 'glass'])) +
  el('env a pop', [21, 22, 24, .5], `<b>🔒</b><span>${c.s7.env}</span>`) +
  el('stamp sm a slam', [24, 11, 18, 1.1], c.s7.sealed) +
  el('wall', [48.5, 0, 3, 0, 100], `<span>${c.s7.wall}</span>`) +
  el('builder', [58, 16, 17], bot('typing')) +
  el('checks a rise', [3, 58, 44, 1.8], c.s7.checks.map((t, k) =>
    `<p class="a fade" style="--d:${2 + k * .3}s">${k < 2 ? '<b class="ok">✓</b>' : flip} ${t}</p>`).join('')) +
  el('chip bad back', [60, 62], `↩ ${c.s7.back}`) +
  el('stamp pass a slam', [57, 74, 41, 4.3], c.s7.pass) +
  el('badge a pop', [80, 12, 18, 4.8], `<b>7<span>/7</span></b><small>${c.s7.found}</small>`) +
  el('note a fade', [0, 95, 100, 5], c.s7.note),
  { sd: .2, td: 5.4 });

// 8 · plot twist #3: the packing slip, and the line it admits it could not check ⚠️
export const sProof: Scene = (c, s) => frame('proof', c.s8,
  el('slip a rise', [4, 0, 60, .3], `<header><b>${c.s8.pr}</b><span>${SECTOR_EMOJI[s.sector]} ${c.sectors[s.sector].idea}</span></header>` +
    `<div class="ba"><figure><figcaption>${c.s8.before}</figcaption><div class="scr old"></div></figure>` +
    `<figure><figcaption>${c.s8.after}</figcaption><div class="scr new"><i></i><i></i><i></i><i></i></div></figure></div>` +
    `<ul>${c.s8.rows.map((r, k) => `<li class="a fade" style="--d:${1 + k * .25}s">✅ ${r}</li>`).join('')}` +
    `<li class="miss a fade" style="--d:1.8s">⚠️ ${c.s8.miss} ${c.sectors[s.sector].miss}${ring(2.3)}</li></ul>`) +
  el('stamp a slam', [68, 4, 30, 1], c.s8.stamp) +
  el('arrow', [67, 62, 14], '⟵') +
  el('illus', [0, 95, 40], c.ui.illus),
  { cls: 'paper', sd: 2.6, td: 3.2 });

// 9 · the CIO question: the red button gets DENIED, humans merge 🛡️
export const sSafe: Scene = c => frame('safe', c.s9,
  el('board', [2, 2, 40], `<small>${c.s9.board}</small><b class="digit">0</b>`) +
  el('reach', [50, 8, 16], bot()) +
  el('redbtn', [70, 16, 24], `<div class="cap"></div><div class="base"></div><span>${c.s9.btn}</span>`) +
  el('stamp solid a slam', [62, 22, 36, 1.3], c.s9.denied) +
  el('blocked', [2, 55, 96], c.s9.blocked.map((b, k) => `<span class="chip bad a pop" style="--d:${(1.8 + k * .15).toFixed(2)}s">🚫 ${b}</span>`).join('')) +
  el('mergebtn a rise', [2, 81, undefined, 2.8], `👆 ${c.s9.merge}`),
  { sd: 3.1, td: 3.5 });

// 10 · no lock-in: their AI plugs into the factory, modes on a dial 🔌
export const sPlug: Scene = c => frame('plug', c.s10,
  el('strip', [2, 4, 96], `<small>⚡ ${c.s10.strip}</small><div class="sockets">${c.s10.agents.map((a, k) =>
    `<span class="plug" style="--d:${(.3 + k * .18).toFixed(2)}s">${a}</span>`).join('')}</div>`) +
  el('dial', [4, 52, 24], `<div class="knob"><i></i></div><div class="modes">${c.s10.modes.map(m => `<b>${m}</b>`).join('')}</div>`) +
  el('facts', [34, 56, 64], c.s10.facts.map((f, k) => `<span class="chip a pop" style="--d:${(1.8 + k * .2).toFixed(1)}s">${f}</span>`).join('')),
  { sd: 2.4, td: 2.8 });

// 11 · callback (real shift time + coffee) and the ask 💌
export const sOut: Scene = (c, s) => {
  const code = qr(CONFIG.link);
  const sub = s.secs ? `⏱ ${mmss(s.secs)} · ${s.secs <= 75 ? c.s11.kept : c.s11.over}` : c.s11.kept;
  return frame('out', { eye: c.s11.eye, h: c.s11.h, sub, tape: c.s11.tape },
    el('offers', [0, 2, 56], c.s11.offers.map(([e, t, d], k) =>
      `<div class="offer a pop" style="--d:${.3 + k * .2}s"><b>${e}</b><h3>${t}</h3><p>${d}</p></div>`).join('')) +
    el('contact a rise', [60, 2, 40, .6], `${logo()}<b>${CONFIG.name}</b>${CONFIG.line ? `<span>${CONFIG.line}</span>` : ''}` +
      `${code ? `<div class="qr">${code}</div>` : ''}<small>☕ ${c.s11.coffee}</small>`) +
    el('doors', [0, 84, 100], `<button type="button" class="door-btn join" data-room="join">📝 ${ROOMS[s.lang].cta.join}</button>` +
      `<button type="button" class="door-btn show" data-room="show">✨ ${ROOMS[s.lang].cta.show}</button>` +
      `<button type="button" class="chip" data-reset>↺ ${c.ui.guest}</button>`),
    { cls: 'yellow', td: 1.2 });
};
