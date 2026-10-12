// frame.ts · shared slide skeleton 🧱 head up top, scene box in the middle, hazard tape (the cliffhanger) at the bottom
export type Pos = [x: number, y: number, w?: number, d?: number, h?: number];

const v = (k: string, n: number | undefined, unit: string): string => (n == null ? '' : `;--${k}:${n}${unit}`);

// one absolutely placed scene element: x/y/w/h in % of the box, d = entrance delay in s
export const el = (cls: string, [x, y, w, d, h]: Pos, html = ''): string =>
  `<div class="abs ${cls}" style="--x:${x}%;--y:${y}%${v('w', w, '%')}${v('d', d, 's')}${v('h', h, '%')}">${html}</div>`;

export const at = (d: number): string => `style="--d:${d}s"`;
export const mmss = (t: number): string => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

export interface Head { eye: string; h: string; sub?: string; tape: string }
export interface Opts { cls?: string; hd?: number; sd?: number; td?: number; extra?: string }

// hd = head delay, sd = sub delay, td = tape delay (the tape lands last, it's the cliffhanger)
export const frame = (id: string, c: Head, box: string, o: Opts = {}): string =>
  `<section class="slide ${o.cls ?? ''}" data-id="${id}">` +
  `<header class="head${o.hd == null ? '' : ' a rise'}"${o.hd == null ? '' : ' ' + at(o.hd)}>` +
  `<p class="eye">${c.eye}</p><h2>${c.h}</h2>` +
  (c.sub ? `<p class="sub a fade" ${at(o.sd ?? 0)}>${c.sub}</p>` : '') + (o.extra ?? '') + '</header>' +
  `<div class="stage"><div class="box">${box}</div></div>` +
  `<footer class="tape a rise" ${at(o.td ?? 1.5)}><span>${c.tape}</span><b class="go" aria-hidden="true">›</b></footer></section>`;
