// csv.ts · rows to CSV that opens cleanly in Excel and Sheets (quotes, newlines, no formula injection) 📊
const cell = (v: unknown): string => {
  const s = v == null ? '' : String(v);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const toCsv = (head: string[], rows: unknown[][]): string =>
  [head, ...rows].map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';
