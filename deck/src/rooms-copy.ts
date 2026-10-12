// rooms-copy.ts · words for the two bonus rooms and the presenter's sign-up list, EN + FR 💬
import type { Lang } from './copy.ts';
import { nbsp } from './copy.ts';

type Part = [string, string, string, string]; // emoji, title, quote from the real PR, why it matters

const R_EN = {
  cta: { join: 'Join the waitlist', show: 'Show me cool stuff' },
  show: {
    title: 'Behind the line', sub: 'Real output from a real factory run. Sample data, real process.',
    prH: 'Anatomy of a factory PR', prMeta: 'Framehouse client portal · draft PR #12 · built in one Fast run',
    parts: [
      ['🎯', 'Purpose and goal', 'Clients send footage through scattered links and give vague feedback. Goal: one portal for intake, stage tracking, timecoded review, approvals and finals.', 'Every PR opens with the business reason.'],
      ['📍', 'Context and research', 'Frame.io, Filestage and Wipster all do timestamped review. None shows client intake, a visible stage tracker and delivery in one portal.', 'Competitor research comes before code.'],
      ['🔧', 'Before → after', 'Empty repository → landing page, sign-in, client and staff workspace, guest review by link.', 'What changed, at a glance.'],
      ['🧱', 'Guards', 'Clients see only their own projects: done, checked. Every change needs a CSRF header: done, checked. Rate limits: deferred to ticket #7.', 'Security status out loud, with a ticket for what waits.'],
      ['✅', 'Proof per criterion', 'Comment pinned at 0:07, changes requested, guest review by link: each with a screenshot from the done-run.', 'Each acceptance criterion points to proof.'],
      ['⚠️', 'Unverified', 'Create a client and a project: not exercised in the browser, so it is marked unverified.', 'It tells you what it did not check.'],
    ] as Part[],
    proofH: 'Screens it attached', proofs: ['Comment pinned at 0:07', 'Changes requested → Revisions', 'Guest review by link'],
    gifH: 'The done-run, recorded', gifNote: 'Before the PR opens, the factory clicks through the real app (Framehouse POC).',
    builtH: 'Built on the line', builtNote: 'Framehouse, a client portal for video teams: intake, stage tracker, timecoded review, approvals and delivery. Sample data.',
    shots: ['Landing page', 'Staff uploads cut v3', 'Final download', 'Phone view'],
    cta: 'I want in · join the waitlist', back: 'Back to the deck',
  },
  join: {
    title: 'Join the waitlist', h: 'Get your factory badge', sub: 'Only your email is required. Five seconds, promise.',
    email: 'Email', required: 'required', emailPh: 'you@company.com',
    optional: 'Optional · helps us follow up', name: 'Name', phone: 'Phone', phonePh: '+216 20 123 456', company: 'Company',
    consent: 'We only contact you about the AI Software Factory. Unsubscribe any time.',
    submit: 'Punch my badge', busy: 'Punching…', role: 'Factory founder', badgeH: 'Waitlist badge', you: 'Your name here', stamp: 'On the list',
    errEmail: 'That email looks off. Mind checking it?', errPhone: 'Use digits, spaces and + for the phone.', fix: 'Did you mean',
    saved: 'Saved on this device', sent: 'Sent to the factory', queued: 'Sends when the tablet is back online', rejected: 'The server refused it. It stays saved here.',
    welcome: 'Welcome to the line', more: 'Show me cool stuff', guest: 'Next guest',
  },
  leads: {
    h: 'Sign-ups on this device', none: 'No sign-ups on this device yet.', copy: 'Copy CSV', download: 'Download CSV', sync: 'Sync now', copied: 'Copied',
    states: { queued: '⏳ queued', sent: '✅ sent', rejected: '⚠️ refused' },
  },
};
export type RoomCopy = typeof R_EN;

const R_FR: RoomCopy = {
  cta: { join: 'Rejoindre la liste', show: 'Montrez-moi du concret' },
  show: {
    title: 'Dans les coulisses', sub: 'Un vrai livrable d’un vrai run de l’usine. Données d’exemple, vrai process.',
    prH: 'Anatomie d’une PR de l’usine', prMeta: 'Portail client Framehouse · PR brouillon n°12 · un seul run Fast',
    parts: [
      ['🎯', 'But et objectif', 'Les clients envoient leurs rushes par des liens éparpillés et donnent des retours flous. Objectif : un portail pour le dépôt, le suivi, la revue horodatée, les validations et les livrables.', 'Chaque PR commence par la raison business.'],
      ['📍', 'Contexte et recherche', 'Frame.io, Filestage et Wipster font tous de la revue horodatée. Aucun ne réunit dépôt client, suivi visible et livraison dans un seul portail.', 'La recherche concurrentielle passe avant le code.'],
      ['🔧', 'Avant → après', 'Dépôt vide → page d’accueil, connexion, espace client et équipe, revue invité par lien.', 'Ce qui a changé, en un coup d’œil.'],
      ['🧱', 'Garde-fous', 'Chaque client ne voit que ses projets : fait, vérifié. Chaque modification exige un en-tête CSRF : fait, vérifié. Limites de débit : reportées au ticket n°7.', 'La sécurité dite à voix haute, avec un ticket pour ce qui attend.'],
      ['✅', 'Une preuve par critère', 'Commentaire épinglé à 0:07, modifications demandées, revue invité par lien : chacun avec une capture du run final.', 'Chaque critère d’acceptation renvoie à une preuve.'],
      ['⚠️', 'Non vérifié', 'Créer un client et un projet : pas testé dans le navigateur, donc marqué non vérifié.', 'Il vous dit ce qu’il n’a pas vérifié.'],
    ],
    proofH: 'Les captures jointes', proofs: ['Commentaire épinglé à 0:07', 'Modifications demandées → Révisions', 'Revue invité par lien'],
    gifH: 'Le run final, enregistré', gifNote: 'Avant d’ouvrir la PR, l’usine clique dans la vraie app (POC Framehouse).',
    builtH: 'Sorti de la chaîne', builtNote: 'Framehouse, un portail client pour les équipes vidéo : dépôt, suivi des étapes, revue horodatée, validations et livraison. Données d’exemple.',
    shots: ['Page d’accueil', 'L’équipe envoie la v3', 'Téléchargement final', 'Vue mobile'],
    cta: 'Je veux en être · rejoindre la liste', back: 'Retour au pitch',
  },
  join: {
    title: 'Rejoindre la liste', h: 'Votre badge de l’usine', sub: 'Seul l’e-mail est obligatoire. Cinq secondes, promis.',
    email: 'E-mail', required: 'obligatoire', emailPh: 'vous@entreprise.com',
    optional: 'Facultatif · pour mieux vous recontacter', name: 'Nom', phone: 'Téléphone', phonePh: '+216 20 123 456', company: 'Entreprise',
    consent: 'On vous contacte seulement au sujet de l’AI Software Factory. Désinscription à tout moment.',
    submit: 'Poinçonner mon badge', busy: 'Poinçonnage…', role: 'Fondateur d’usine', badgeH: 'Badge liste d’attente', you: 'Votre nom ici', stamp: 'Sur la liste',
    errEmail: 'Cet e-mail semble incorrect. Vous vérifiez ?', errPhone: 'Chiffres, espaces et + pour le téléphone.', fix: 'Vouliez-vous dire',
    saved: 'Enregistré sur cet appareil', sent: 'Envoyé à l’usine', queued: 'Partira dès que la tablette sera en ligne', rejected: 'Le serveur a refusé. Ça reste enregistré ici.',
    welcome: 'Bienvenue sur la chaîne', more: 'Montrez-moi du concret', guest: 'Invité suivant',
  },
  leads: {
    h: 'Inscriptions sur cet appareil', none: 'Aucune inscription sur cet appareil.', copy: 'Copier le CSV', download: 'Télécharger le CSV', sync: 'Synchroniser', copied: 'Copié',
    states: { queued: '⏳ en attente', sent: '✅ envoyé', rejected: '⚠️ refusé' },
  },
};

export const ROOMS: Record<Lang, RoomCopy> = { en: R_EN, fr: nbsp(R_FR) as RoomCopy };
