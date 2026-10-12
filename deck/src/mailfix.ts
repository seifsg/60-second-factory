// mailfix.ts · tablet-friendly email help: one-tap domains and "did you mean" for common typos ✉️ (pure, tested)
export const DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];

// edit distance between two short strings (domains), classic dynamic programming
const dist = (a: string, b: string): number => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
};

// "ada@gmial.com" → "ada@gmail.com"; regional or company domains (yahoo.fr, horizonlux.com) are left alone
export const suggest = (email: string): string | null => {
  const [user, domain, extra] = email.trim().toLowerCase().split('@');
  if (!user || !domain || extra !== undefined || DOMAINS.includes(domain)) return null;
  const [best, d] = DOMAINS.map(x => [x, dist(domain, x)] as const).sort((a, b) => a[1] - b[1])[0];
  return d > 0 && d <= 2 ? `${user}@${best}` : null;
};

// keep what they typed before the @, swap in the tapped domain
export const withDomain = (value: string, domain: string): string => `${value.split('@')[0].trim()}@${domain}`;

// "ada.lovelace@x.com" → "ada lovelace": the badge personalizes before they type a name
export const fromEmail = (email: string): string => email.split('@')[0].replace(/[._+-]+/g, ' ').trim();
