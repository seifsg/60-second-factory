// show.ts · "Show me cool stuff": a real factory PR taken apart, the proof it carried, what came off the line ✨
import type { Copy } from './copy.ts';
import type { RoomCopy } from './rooms-copy.ts';
import { roomHead } from './frame.ts';

// literal paths, so the offline build can inline each image
const PROOF = ['assets/proof-comment.jpg', 'assets/proof-changes.jpg', 'assets/proof-guest.jpg'];
const BUILT = ['assets/built-landing.jpg', 'assets/built-cut.jpg', 'assets/built-final.jpg', 'assets/built-phone.jpg']; // last = phone, portrait frame
const TILT = [-3, 2, -1.5, 3];

const img = (path: string, alt: string): string => `<img src="${path}" alt="${alt}" loading="lazy" decoding="async">`;
const polaroid = (file: string, caption: string, k: number, tall = false): string =>
  `<figure class="pola${tall ? ' tall' : ''}" style="--r:${TILT[k % 4]}deg">${img(file, caption)}<figcaption>${caption}</figcaption></figure>`;

export const showHtml = (r: RoomCopy, c: Copy): string => {
  const s = r.show;
  return roomHead(`✨ ${s.title}`, c.ui.close) + `<p class="rsub">${s.sub}</p>` +
    `<section class="pr"><header class="pr-head"><b>${s.prH}</b><span>${s.prMeta}</span></header><ol class="parts">` +
    s.parts.map(([emoji, title, quote, why], k) =>
      `<li class="part" style="--d:${(.1 + k * .12).toFixed(2)}s"><b class="tag">${k + 1}</b><h3>${emoji} ${title}</h3><blockquote>${quote}</blockquote><p class="why">${why}</p></li>`).join('') +
    `</ol></section><h3 class="rh">${s.proofH}</h3><div class="strip">${PROOF.map((f, k) => polaroid(f, s.proofs[k], k)).join('')}</div>` +
    `<h3 class="rh">${s.gifH}</h3><figure class="tv">${img('assets/journey.gif', s.gifH)}<figcaption>${s.gifNote}</figcaption></figure>` +
    `<h3 class="rh">${s.builtH}</h3><p class="rsub">${s.builtNote}</p><div class="strip">${BUILT.map((f, k) => polaroid(f, s.shots[k], k, k === BUILT.length - 1)).join('')}</div>` +
    `<div class="rfoot"><button type="button" class="door-btn join" data-room="join">📝 ${s.cta}</button><button type="button" class="chip" data-close>↩ ${s.back}</button></div>`;
};
