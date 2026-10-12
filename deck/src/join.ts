// join.ts · "Join the waitlist": only the email is required, the badge personalizes as they type, punched with confetti 📝
import type { Copy, Lang, Sector } from './copy.ts';
import type { RoomCopy } from './rooms-copy.ts';
import type { Lead } from './leads.ts';
import { isEmail } from '../../shared/email.ts';
import { isPhone } from '../../shared/phone.ts';
import { uid } from './leads.ts';
import { DOMAINS, fromEmail, suggest, withDomain } from './mailfix.ts';
import { addLead, onLeads, syncLeads } from './sync.ts';
import { bot, logo } from './art.ts';
import { roomHead } from './frame.ts';

export interface JoinCtx { r: RoomCopy; c: Copy; sector: Sector; lang: Lang }
type Words = RoomCopy['join'];

const ORDER = ['jEmail', 'jName', 'jPhone', 'jCo']; // Enter walks this order; the last one submits
const COLORS = ['var(--hazard)', 'var(--signal)', 'var(--pass)', 'var(--inspect)', 'var(--white)'];
let current = ''; // the sign-up on the badge right now
let words: Words | null = null;

const field = (id: string, label: string, attrs: string): string =>
  `<div class="fld"><label for="${id}">${label}</label><input id="${id}" ${attrs}><p class="err" id="${id}Err" aria-live="polite"></p></div>`;

const badgeHtml = (j: Words): string =>
  `<div class="wbadge" id="badge" aria-hidden="true"><i class="clip"></i><p class="b-top">${logo()} AI Software Factory</p>` +
  `<div class="b-photo">${bot('', ['hat'])}</div><p class="b-name" id="bName">${j.you}</p><p class="b-co" id="bCo">&nbsp;</p>` +
  `<p class="b-role">${j.role}</p><p class="b-no" id="bNo">${j.badgeH} · № ----</p><div class="stamp b-stamp" id="bStamp" hidden>${j.stamp}</div></div>`;

export const joinHtml = ({ r, c }: JoinCtx): string => {
  const j = r.join;
  return roomHead(`📝 ${j.title}`, c.ui.close) + '<div class="jwrap"><form class="jform" id="jForm" novalidate>' +
    `<h3>${j.h}</h3><p class="rsub">${j.sub}</p>` +
    `<div class="fld"><label for="jEmail" class="lbl-email">${j.email} <b class="req">${j.required}</b></label>` +
    `<input id="jEmail" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="next" maxlength="254" required placeholder="${j.emailPh}">` +
    `<div class="mailhelp">${DOMAINS.map(d => `<button type="button" class="dom" data-domain="${d}" tabindex="-1">@${d}</button>`).join('')}</div>` +
    `<button type="button" class="fix" id="jFix" hidden></button><p class="err" id="jEmailErr" aria-live="polite"></p></div>` +
    `<p class="optional">${j.optional}</p><div class="row">` +
    field('jName', j.name, 'name="name" autocomplete="name" autocapitalize="words" enterkeyhint="next" maxlength="100"') +
    field('jPhone', j.phone, `name="phone" type="tel" inputmode="tel" autocomplete="tel" enterkeyhint="next" maxlength="30" placeholder="${j.phonePh}"`) +
    '</div>' + field('jCo', j.company, 'name="company" autocomplete="organization" enterkeyhint="send" maxlength="120"') +
    '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    `<button type="submit" class="door-btn join jgo" id="jGo">🔨 ${j.submit}</button><p class="consent">${j.consent}</p>` +
    `<div class="jdone" id="jDone" hidden><p class="welcome" id="jWelcome"></p><p class="status"><span>💾 ${j.saved}</span><span id="jNet"></span></p>` +
    `<div class="rfoot"><button type="button" class="door-btn show" data-room="show">✨ ${j.more}</button><button type="button" class="chip" data-reset>↺ ${j.guest}</button></div></div>` +
    `</form>${badgeHtml(j)}</div>`;
};

// keeps the badge number and network status honest while the sync runs
const paint = (all: Lead[]): void => {
  const l = all.find(x => x.id === current), net = document.getElementById('jNet'), no = document.getElementById('bNo');
  if (!l || !words || !net || !no) return;
  net.textContent = { sent: `📮 ${words.sent}`, queued: `⏳ ${words.queued}`, rejected: `⚠️ ${words.rejected}` }[l.state];
  if (l.position) no.textContent = `${words.badgeH} · № ${String(l.position).padStart(4, '0')}`;
};
onLeads(paint);

const confetti = (): void => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = Object.assign(document.createElement('div'), { className: 'confetti' });
  box.innerHTML = Array.from({ length: 30 }, (_, k) =>
    `<i style="--c:${COLORS[k % 5]};--tx:${Math.round((Math.random() - .5) * 900)}px;--ty:${Math.round(-180 - Math.random() * 420)}px;--rot:${Math.round(Math.random() * 900)}deg;animation-delay:${(Math.random() * .12).toFixed(2)}s"></i>`).join('');
  document.body.append(box);
  setTimeout(() => box.remove(), 1800);
};

export function initJoin(root: HTMLElement, x: JoinCtx): void {
  const j = (words = x.r.join);
  current = '';
  let busy = false;
  const $ = <T extends HTMLElement>(id: string): T => root.querySelector(`#${id}`) as T;
  const form = $<HTMLFormElement>('jForm'), email = $<HTMLInputElement>('jEmail'), name = $<HTMLInputElement>('jName');
  const phone = $<HTMLInputElement>('jPhone'), co = $<HTMLInputElement>('jCo'), fix = $<HTMLButtonElement>('jFix'), badge = $('badge');
  const say = (id: string, msg: string): void => { $(id).textContent = msg; };

  // the badge fills in live: name, else the email's first part; a happy hop once the email is valid
  const preview = (): void => {
    $('bName').textContent = name.value.trim() || fromEmail(email.value) || j.you;
    $('bCo').textContent = co.value.trim() || ' ';
    const ok = isEmail(email.value.trim().toLowerCase());
    if (ok !== badge.classList.contains('valid')) badge.classList.toggle('valid', ok);
    const hint = suggest(email.value);
    fix.hidden = !hint;
    if (hint) { fix.textContent = `${j.fix} ${hint}?`; fix.dataset.value = hint; }
  };
  form.addEventListener('input', preview);

  // domain chips + the typo fix keep the keyboard up: no focus steal on press, refocus after
  form.addEventListener('pointerdown', e => { if ((e.target as Element).closest('.dom, .fix')) e.preventDefault(); });
  form.addEventListener('click', e => {
    const t = (e.target as Element).closest<HTMLElement>('.dom, .fix');
    if (!t) return;
    email.value = t.dataset.domain ? withDomain(email.value, t.dataset.domain) : t.dataset.value ?? email.value;
    say('jEmailErr', '');
    preview();
    email.focus();
  });

  // Enter moves to the next field like a paper form; the last field submits
  form.addEventListener('keydown', e => {
    const i = ORDER.indexOf((e.target as HTMLElement).id);
    if (e.key !== 'Enter' || i < 0 || i === ORDER.length - 1) return;
    e.preventDefault();
    $(ORDER[i + 1]).focus();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(form), val = (k: string): string => String(data.get(k) ?? '').replace(/\s+/g, ' ').trim();
    const mail = val('email').toLowerCase(), tel = val('phone');
    say('jEmailErr', isEmail(mail) ? '' : j.errEmail);
    say('jPhoneErr', isPhone(tel) ? '' : j.errPhone);
    if (!isEmail(mail)) { email.focus(); return; }
    if (!isPhone(tel)) { phone.focus(); return; }
    if (val('website')) return; // honeypot: bots stop here
    busy = true;
    const go = $<HTMLButtonElement>('jGo');
    go.disabled = true;
    go.textContent = `🔨 ${j.busy}`;
    const lead: Lead = {
      id: uid(), name: val('name'), email: mail, phone: tel, company: val('company'), sector: x.sector, lang: x.lang,
      source: location.host || 'offline', ts: Date.now(), state: 'queued', tries: 0,
    };
    current = lead.id;
    await addLead(lead); // on the device first, then the network
    (document.activeElement as HTMLElement | null)?.blur(); // drop the keyboard so the party is visible
    form.querySelectorAll<HTMLElement>('.fld, .row, .optional, .consent, .rsub, #jGo').forEach(el => { el.hidden = true; });
    say('jWelcome', `${j.welcome}, ${lead.name.split(' ')[0] || fromEmail(mail).split(' ')[0]}! 🎉`);
    $('jDone').hidden = false;
    $('bStamp').hidden = false;
    badge.classList.add('punched');
    confetti();
    navigator.vibrate?.([20, 40, 30]);
    paint(await syncLeads());
  });
}
