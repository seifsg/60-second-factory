// join.ts · "Join the waitlist": a factory badge that fills in as they type and gets punched on submit 📝
import type { Copy, Lang, Sector } from './copy.ts';
import type { RoomCopy } from './rooms-copy.ts';
import type { Lead } from './leads.ts';
import { isEmail } from '../../shared/email.ts';
import { uid } from './leads.ts';
import { addLead, onLeads, syncLeads } from './sync.ts';
import { bot, logo } from './art.ts';
import { esc, roomHead } from './frame.ts';

export interface JoinCtx { r: RoomCopy; c: Copy; sector: Sector; lang: Lang }
let current = ''; // the sign-up shown on the badge right now
let words: RoomCopy['join'] | null = null;

const field = (id: string, label: string, name: string, attrs: string, err = ''): string =>
  `<label for="${id}">${label}</label><input id="${id}" name="${name}" ${attrs}>${err ? `<p class="err" id="${err}" aria-live="polite"></p>` : ''}`;

export const joinHtml = ({ r, c, sector }: JoinCtx): string => {
  const j = r.join;
  return roomHead(`📝 ${j.title}`, c.ui.close) + '<div class="join">' +
    `<div class="badge" id="badge"><i class="clip"></i><p class="b-top">${logo()} AI Software Factory</p>` +
    `<div class="b-photo">${bot('', ['hat'])}</div><p class="b-name" id="bName">${j.you}</p><p class="b-co" id="bCo">&nbsp;</p>` +
    `<p class="b-role">${j.role}</p><p class="b-no" id="bNo">${j.badgeH} · № ----</p><div class="stamp b-stamp" id="bStamp" hidden>${j.stamp}</div></div>` +
    `<form class="jform" id="jForm" novalidate><h3>${j.h}</h3><p class="rsub">${j.sub}</p>` +
    field('jName', j.name, 'name', 'autocomplete="name" maxlength="100" required', 'eName') +
    field('jEmail', j.email, 'email', 'type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="254" required', 'eEmail') +
    field('jCo', j.company, 'company', 'autocomplete="organization" maxlength="120"') +
    field('jBuild', j.build, 'build', `maxlength="300" placeholder="${esc(c.sectors[sector].idea)}"`) +
    '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    `<p class="consent">${j.consent}</p><button type="submit" class="door-btn join" id="jGo">🔨 ${j.submit}</button>` +
    `<div class="jdone" id="jDone" hidden><p class="welcome" id="jWelcome"></p><p class="status"><span>💾 ${j.saved}</span><span id="jNet"></span></p>` +
    `<div class="rfoot"><button type="button" class="door-btn show" data-room="show">✨ ${j.more}</button><button type="button" class="chip" data-reset>↺ ${j.guest}</button></div></div>` +
    '</form></div>';
};

// keeps the badge number and the network status honest while the sync runs
const paint = (all: Lead[]): void => {
  const l = all.find(x => x.id === current), net = document.getElementById('jNet'), no = document.getElementById('bNo');
  if (!l || !words || !net || !no) return;
  net.textContent = { sent: `📮 ${words.sent}`, queued: `⏳ ${words.queued}`, rejected: `⚠️ ${words.rejected}` }[l.state];
  if (l.position) no.textContent = `${words.badgeH} · № ${String(l.position).padStart(4, '0')}`;
};
onLeads(paint);

export function initJoin(root: HTMLElement, x: JoinCtx): void {
  const j = (words = x.r.join);
  current = '';
  const $ = <T extends HTMLElement>(id: string): T => root.querySelector(`#${id}`) as T;
  const form = $<HTMLFormElement>('jForm'), name = $<HTMLInputElement>('jName'), email = $<HTMLInputElement>('jEmail'), co = $<HTMLInputElement>('jCo');
  // live badge preview, always via textContent (never HTML)
  name.addEventListener('input', () => { $('bName').textContent = name.value.trim() || j.you; });
  co.addEventListener('input', () => { $('bCo').textContent = co.value.trim() || ' '; });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form), val = (k: string): string => String(data.get(k) ?? '').replace(/\s+/g, ' ').trim();
    const okName = !!val('name'), mail = val('email').toLowerCase(), okMail = isEmail(mail);
    $('eName').textContent = okName ? '' : j.errName;
    $('eEmail').textContent = okMail ? '' : j.errEmail;
    if (!okName || !okMail) { (okName ? email : name).focus(); return; }
    if (val('website')) return; // honeypot: bots stop here
    const go = $<HTMLButtonElement>('jGo');
    go.disabled = true;
    go.textContent = `🔨 ${j.busy}`;
    const lead: Lead = {
      id: uid(), name: val('name'), email: mail, company: val('company'), build: val('build'), sector: x.sector, lang: x.lang,
      source: location.host || 'offline', ts: Date.now(), state: 'queued', tries: 0,
    };
    current = lead.id;
    await addLead(lead); // on the device first, then the network
    form.querySelectorAll<HTMLElement>('label, input, .err, .consent, #jGo').forEach(el => { el.hidden = true; });
    $('jWelcome').textContent = `${j.welcome}, ${lead.name.split(' ')[0]}! 🎉`;
    $('jDone').hidden = false;
    $('bStamp').hidden = false;
    $('badge').classList.add('punched');
    paint(await syncLeads());
  });
}
