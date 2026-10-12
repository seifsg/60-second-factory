// art.ts · the tiny SVG cast and props 🤖 drawn once, reused on every slide
type Kit = 'shades' | 'phones' | 'hat' | 'glass';
const KIT: Record<Kit, string> = {
  shades: '<path d="M55 47h10" class="sy"/><rect x="31" y="40" width="24" height="16" rx="6" class="k sy"/><rect x="65" y="40" width="24" height="16" rx="6" class="k sy"/><path d="M36 45l7-2M70 45l7-2" class="glare"/>',
  phones: '<path d="M14 58C14 4 106 4 106 58" class="band"/><rect x="5" y="40" width="18" height="30" rx="7" class="cup s"/><rect x="97" y="40" width="18" height="30" rx="7" class="cup s"/>',
  hat: '<path d="M26 30C28 4 92 4 94 30Z" class="y s"/><rect x="14" y="26" width="92" height="9" rx="4.5" class="y s"/>',
  glass: '<path d="M110 106l7 12" class="handle"/><circle cx="104" cy="94" r="13" class="lens s"/>',
};

// the coding agent: paper head, screen face, colored body (--botc) ✨
export const bot = (cls = '', kit: Kit[] = []): string =>
  `<svg class="bot ${cls}" viewBox="0 0 120 150" aria-hidden="true">` +
  '<path d="M60 10v14" class="s"/><circle cx="60" cy="9" r="6" class="led s3"/>' +
  '<rect x="20" y="22" width="80" height="58" rx="16" class="p s"/><rect x="30" y="32" width="60" height="38" rx="9" class="k"/>' +
  '<g class="eyes"><rect x="42" y="42" width="10" height="16" rx="5"/><rect x="68" y="42" width="10" height="16" rx="5"/></g>' +
  '<rect x="52" y="78" width="16" height="10" class="k"/>' +
  '<rect x="8" y="92" width="14" height="36" rx="7" class="p s arm-l"/><rect x="98" y="92" width="14" height="36" rx="7" class="p s arm-r"/>' +
  '<rect x="26" y="86" width="68" height="48" rx="12" class="body s"/><circle cx="60" cy="108" r="8" class="p s3"/>' +
  '<rect x="34" y="134" width="18" height="12" rx="4" class="k"/><rect x="68" y="134" width="18" height="12" rx="4" class="k"/>' +
  kit.map(k => KIT[k]).join('') + '</svg>';

const CODE_W = [62, 84, 46, 70, 38];
export const laptop = (): string =>
  '<svg class="laptop" viewBox="0 0 160 100" aria-hidden="true"><rect x="24" y="6" width="112" height="72" rx="6" class="k sp"/>' +
  `<g class="code">${CODE_W.map((w, k) => `<rect x="36" y="${16 + k * 11}" width="${w}" height="5" rx="2.5" style="--k:${k}"/>`).join('')}</g>` +
  '<path d="M6 82h148l-10 14H16z" class="lap sp"/></svg>';

// brand mark: sawtooth factory, chimney puffing 🏭
export const logo = (cls = ''): string =>
  `<svg class="logo ${cls}" viewBox="0 0 64 52" aria-hidden="true"><circle cx="45" cy="8" r="4" class="puff"/><circle cx="51" cy="4" r="3" class="puff p2"/>` +
  '<path d="M4 48V28l12-8v8l12-8v8l12-8V12h12v36z" class="lg"/><path d="M10 34h8v7h-8zM24 34h8v7h-8zM38 34h8v7h-8z" class="lw"/></svg>';

// hand-drawn marker loop around whatever it sits in, drawn at --d 🖍️
export const ring = (d: number): string =>
  `<svg class="ring" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true" style="--d:${d}s"><path d="M54 5C82 4 97 15 96 30S76 56 50 56 3 46 4 30 26 3 60 7" pathLength="1"/></svg>`;

// QR via qrcode-generator (cdnjs); offline or empty link → nothing, the name still shows 📵
type QrLib = (type: number, level: string) => { addData(s: string): void; make(): void; createSvgTag(o: object): string };
export const qr = (text: string): string => {
  const lib = (window as unknown as { qrcode?: QrLib }).qrcode;
  if (!text || typeof lib !== 'function') return '';
  try {
    const q = lib(0, 'M');
    q.addData(text);
    q.make();
    return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  } catch {
    return '';
  }
};
