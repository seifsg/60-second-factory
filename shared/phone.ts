// phone.ts · optional phone check shared by the deck and the Worker 📞 empty is fine; else digits, spaces, + ( ) - . / and 6+ digits
export const isPhone = (s: string): boolean =>
  !s || (s.length <= 30 && /^[+()\-.\s\d/]+$/.test(s) && (s.match(/\d/g)?.length ?? 0) >= 6);
