// rooms.ts · full-screen rooms over the deck: story map (presenter), cool stuff, waitlist 🚪
import type { Copy, Lang, Sector } from './copy.ts';
import type { Lead } from './leads.ts';
import { ROOMS } from './rooms-copy.ts';
import { leadsHtml, mapHtml } from './map.ts';
import { showHtml } from './show.ts';
import { initJoin, joinHtml } from './join.ts';
import { LEAD_HEAD, leadRows } from './leads.ts';
import { vault } from './vault.ts';
import { syncLeads } from './sync.ts';
import { toCsv } from '../../shared/csv.ts';

export type Room = 'map' | 'show' | 'join';
export const ROOM_KINDS: Room[] = ['map', 'show', 'join'];
export interface Host { copy(): Copy; lang(): Lang; slide(): number; sector(): Sector; go(i: number): void; reset(): void }

const roomEl = document.getElementById('room') as HTMLElement;
let open: Room | null = null, host: Host, shown: Lead[] = [];

const roomHtml = async (r: Room): Promise<string> => {
  const c = host.copy(), rc = ROOMS[host.lang()];
  if (r === 'map') { shown = await vault.load(); return mapHtml(c, host.slide(), leadsHtml(rc, shown)); }
  if (r === 'show') return showHtml(rc, c);
  return joinHtml({ r: rc, c, sector: host.sector(), lang: host.lang() });
};

export const roomOpen = (): Room | null => open;

export async function openRoom(r: Room | null): Promise<void> {
  open = r;
  if (!r) { roomEl.hidden = true; roomEl.innerHTML = ''; return; }
  roomEl.innerHTML = await roomHtml(r);
  roomEl.dataset.room = r;
  roomEl.hidden = false;
  roomEl.scrollTop = 0;
  if (r === 'join') initJoin(roomEl, { r: ROOMS[host.lang()], c: host.copy(), sector: host.sector(), lang: host.lang() });
}

// CSV of this device's sign-ups; copy runs inside the tap so the clipboard says yes, else a select-all box
const csv = (): string => toCsv(LEAD_HEAD, leadRows(shown));
const copyCsv = (btn: HTMLElement): void => {
  (navigator.clipboard?.writeText(csv()) ?? Promise.reject(new Error('no clipboard'))).then(() => { btn.textContent = `✅ ${ROOMS[host.lang()].leads.copied}`; }, () => {
    const box = Object.assign(document.createElement('textarea'), { value: csv(), className: 'csvbox', readOnly: true });
    btn.after(box);
    box.select();
  });
};
const downloadCsv = (): void => {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv()], { type: 'text/csv' })), download: `waitlist-${new Date().toISOString().slice(0, 10)}.csv`,
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};

export function initRooms(h: Host): void {
  host = h;
  roomEl.addEventListener('click', e => {
    const t = (e.target as Element).closest<HTMLElement>('[data-jump],[data-reset],[data-close],[data-room],[data-csv],[data-sync]');
    if (!t) return;
    const kind = t.dataset.room as Room | undefined;
    if (kind && ROOM_KINDS.includes(kind)) { void openRoom(kind); return; }
    if (t.hasAttribute('data-reset')) { host.reset(); return; }
    if (t.hasAttribute('data-close')) { void openRoom(null); return; }
    if (t.dataset.csv === 'copy') { copyCsv(t); return; }
    if (t.dataset.csv === 'download') { downloadCsv(); return; }
    if (t.hasAttribute('data-sync')) { void syncLeads().then(() => openRoom('map')); return; }
    const j = t.getAttribute('data-jump');
    if (j != null) { void openRoom(null); host.go(Number(j)); }
  });
}
