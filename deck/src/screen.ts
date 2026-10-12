// screen.ts · full screen + wake lock, both optional 📱 forms leave full screen so tablet keyboards behave, then come back
type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };

const docEl = document.documentElement as FsEl;
const fsEnter = docEl.requestFullscreen ?? docEl.webkitRequestFullscreen;
let resume = false; // we left full screen for a form: return when it closes

const isFull = (): boolean => { const d = document as FsDoc; return !!(d.fullscreenElement || d.webkitFullscreenElement); };
const tryCall = (f: (() => unknown) | undefined, self: unknown): void => {
  try { Promise.resolve(f?.call(self)).catch(() => { /* the browser said no */ }); } catch { /* unsupported here */ }
};

// a home-screen app is already full screen, so the button only shows in a browser tab
export const canFullscreen = (): boolean => !!fsEnter && !matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches;

export const toggleFullscreen = (): void => {
  const d = document as FsDoc;
  if (isFull()) tryCall(d.exitFullscreen ?? d.webkitExitFullscreen, d);
  else tryCall(fsEnter, docEl);
};

export const leaveFullscreen = (): void => { if (isFull()) { resume = true; toggleFullscreen(); } };
export const resumeFullscreen = (): void => { if (resume && !isFull()) tryCall(fsEnter, docEl); resume = false; }; // call inside a tap

type Lock = { addEventListener(t: 'release', f: () => void): void };
let lock: Lock | null = null;
export function wake(): void {
  const wl = (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<Lock> } }).wakeLock;
  if (lock || !wl) return;
  wl.request('screen').then(l => { lock = l; l.addEventListener('release', () => { lock = null; }); }).catch(() => { /* no wake lock here */ });
}
