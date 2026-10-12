// email.ts · one email check shared by the deck and the Worker 📧
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (s: string): boolean => s.length <= 254 && EMAIL_RE.test(s);
