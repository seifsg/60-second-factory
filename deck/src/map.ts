// map.ts · presenter-only story map 🗺️ attention curve, every beat, its hook and what to say
import type { Copy } from './copy.ts';
import type { Lead } from './leads.ts';
import type { RoomCopy } from './rooms-copy.ts';
import { esc } from './frame.ts';

const LEVELS = [55, 85, 70, 66, 92, 80, 88, 84, 72, 74, 95];
const MOODS = ['🙂', '😂', '😬', '😤', '🤯', '🤩', '😮', '🤝', '😌', '👍', '☕'];
const FAST = [0, 1, 4, 7, 10]; // the 30-second lane
const tapes = (c: Copy): string[] => [c.s1, c.s2, c.s3, c.s4, c.s5, c.s6, c.s7, c.s8, c.s9, c.s10, c.s11].map(x => x.tape);
const mark = (k: number, cur: number): string => (k === cur ? ' cur' : '') + (FAST.includes(k) ? ' fast' : '');

// attention over the pitch: peaks are the gag, the twists and the close 📈
const curve = (cur: number): string => {
  const x = (k: number): number => 50 + k * 90, y = (v: number): number => 200 - v * 1.6;
  const d = LEVELS.map((v, k) => `${k ? 'L' : 'M'}${x(k)} ${y(v)}`).join('');
  return `<svg class="curve" viewBox="0 0 1000 240" role="img" aria-label="Attention curve">` +
    `<path d="${d}L${x(10)} 200L${x(0)} 200Z" class="area"/><path d="${d}" class="ln"/>` +
    LEVELS.map((v, k) => `<g class="pt${mark(k, cur)}" data-jump="${k}"><circle cx="${x(k)}" cy="${y(v)}" r="15"/>` +
      `<text x="${x(k)}" y="${y(v) - 24}">${MOODS[k]}</text><text x="${x(k)}" y="232" class="n">${k + 1}</text></g>`).join('') +
    '</svg>';
};

export const mapHtml = (c: Copy, cur: number, extra = ''): string => {
  const m = c.map, t = tapes(c);
  return `<div class="mwrap"><header class="mhead"><h2>🗺️ ${m.title}</h2>` +
    `<button type="button" class="chip" data-reset>↺ ${c.ui.guest}</button><button type="button" class="chip" data-close>✕ ${c.ui.close}</button></header>` +
    `<div class="lanes">${m.lanes.map(l => `<span class="chip">${l}</span>`).join('')}</div>${curve(cur)}` +
    `<ol class="nodes">${m.nodes.map(([name, dev, say], k) => `<li class="node${mark(k, cur)}" data-jump="${k}">` +
      `<b class="nn">${k + 1}</b><h3>${MOODS[k]} ${name}</h3><p class="dev">${dev}</p><p class="say"><b>${m.say}</b> ${say}</p>` +
      (k < 10 ? `<p class="hook"><b>${m.hook} ↓</b> ${t[k]}</p>` : '') + '</li>').join('')}</ol>` +
    extra + `<h3>${m.faqT}</h3><dl class="faq">${m.faq.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl>` +
    `<h3>${m.vsT}</h3><div class="tbl"><table><thead><tr>${m.vsH.map(h => `<th>${h}</th>`).join('')}</tr></thead>` +
    `<tbody>${m.vs.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
};

// presenter-only: every sign-up saved on this tablet, with CSV export and a manual sync 📋
export const leadsHtml = (r: RoomCopy, all: Lead[]): string => {
  const L = r.leads;
  const rows = all.slice().reverse().map(l => `<tr><td>${new Date(l.ts).toLocaleString()}</td><td>${esc(l.email)}</td><td>${esc(l.name)}</td>` +
    `<td>${esc(l.phone ?? '')}</td><td>${esc(l.company)}</td><td>${L.states[l.state]}${l.position ? ` #${l.position}` : ''}</td></tr>`).join('');
  return `<h3>📋 ${L.h} (${all.length})</h3>` + (all.length ? `<div class="tbl"><table class="leads"><tbody>${rows}</tbody></table></div>` : `<p class="rsub">${L.none}</p>`) +
    `<div class="rfoot"><button type="button" class="chip" data-csv="copy">📋 ${L.copy}</button><button type="button" class="chip" data-csv="download">⬇️ ${L.download}</button>` +
    `<button type="button" class="chip" data-sync>🔄 ${L.sync}</button></div>`;
};
