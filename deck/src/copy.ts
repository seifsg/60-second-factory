// copy.ts · every word on screen, EN + FR 💬 FR gets thin no-break spaces before ? ! : ; by itself
export type Lang = 'en' | 'fr';
export type Sector = 'bank' | 'telco' | 'gov' | 'retail' | 'energy' | 'startup';
type SectorCopy = { label: string; idea: string; miss: string };
type Row = [string, string, string];

export const SECTORS: Sector[] = ['bank', 'telco', 'gov', 'retail', 'energy', 'startup'];
export const SECTOR_EMOJI: Record<Sector, string> = { bank: '🏦', telco: '📶', gov: '🏛️', retail: '🛒', energy: '⚡', startup: '🚀' };
export const STATION_ICONS = ['🔎', '❓', '🎫', '🗺️', '🔨', '🧪', '🧐', '📦'];
const AGENTS = ['Claude Code', 'Codex', 'Cursor', 'GitHub Copilot', 'Gemini CLI', 'OpenCode'];

const EN = {
  ui: { tapIn: 'Tap anywhere to clock in', guest: 'Next guest', close: 'Close', illus: 'Illustrative run', turn: '↻ Turn sideways for the full show' },
  sectors: {
    bank: { label: 'Bank', idea: 'Loan app', miss: 'payment sandbox (needs your keys)' },
    telco: { label: 'Telecom', idea: 'Self-care portal', miss: 'SMS gateway (needs your keys)' },
    gov: { label: 'Public sector', idea: 'e-Permit portal', miss: 'national ID login (needs a test account)' },
    retail: { label: 'Retail', idea: 'Loyalty app', miss: 'card terminal (needs the device)' },
    energy: { label: 'Energy', idea: 'Smart-meter dashboard', miss: 'live meter feed (needs access)' },
    startup: { label: 'Startup', idea: 'MVP launch', miss: 'app store upload (needs your account)' },
  } as Record<Sector, SectorCopy>,
  s1: { eye: 'Aslema 👋', h: 'Got 60 seconds?', sub: 'Not curious by the end? Coffee’s on me.', card: 'Shift · 60 s', btn: 'Clock in', tape: '60 seconds. 10 taps. One factory.' },
  s2: { eye: 'Exhibit A', h: 'I asked an AI to build an app.', bubble: 'Done! Works perfectly ✅', stamp: 'It did not work', sub: 'Fast. Confident. Wrong.', tape: 'Why does this keep happening?' },
  s3: {
    eye: 'The problem', h: 'Meet your new genius intern.', sub: 'And it grades its own homework.', good: 'Codes in seconds',
    bad: ['Skips the research', 'Forgets the ticket', 'Tests nothing', 'Says “done” anyway'],
    card: 'Self-review', found: 'defects found in its own app', note: 'Internal blind test · 1 app · 7 known UX defects', tape: 'So you give it more rules?',
  },
  s4: { eye: 'The obvious fix', h: 'More rules?', sub: 'An agent can ignore any instruction.', rules: ['Always test', 'Never skip the ticket', 'Plan before you code', 'Please 🙏', 'I am begging you'], tape: 'So we stopped asking nicely.' },
  s5: { eye: 'Plot twist #1', h: 'Meet the AI Software Factory.', sub: 'Your coding agent, run like a software team.', door: 'Code', stamp: 'No ticket · No plan · No code', tape: 'What happens inside? Pick an idea.' },
  s6: { eye: 'Inside the factory', h: 'Idea in. Proven code out.', pick: 'Pick an idea', stations: ['Research', 'Questions', 'Tickets', 'Plan', 'Build', 'Test', 'Review', 'Draft PR'], merge: 'You merge', tape: 'But how do you know it actually works?' },
  s7: {
    eye: 'Plot twist #2', h: 'The builder never sees the exam.', sub: 'A fresh AI writes hidden checks before the build. One fail sends it back.',
    env: 'Hidden checks', sealed: 'Sealed', wall: 'No peeking', checks: ['Main journey works', 'Data is saved', 'Phone layout'],
    back: 'Fail · back to the line', pass: 'QC passed', found: 'defects found by fresh eyes', note: 'Same blind test · 1 app · 7 known UX defects', tape: 'Then it shows its receipts.',
  },
  s8: {
    eye: 'Plot twist #3', h: 'Every run ships with receipts.', sub: 'It even tells you what it could not check.', pr: 'Draft PR #42', before: 'Before', after: 'After',
    rows: ['3/3 outcomes proven', 'Before and after for every outcome', 'Ticket linked, checklist ticked'], miss: 'Not verified:', stamp: 'Proof inside', tape: 'Now, the question every CIO asks.',
  },
  s9: {
    eye: 'The CIO question', h: '“Can it break production?”', sub: 'Destructive commands are refused during a run. It never merges, releases or deploys.',
    board: 'Days since an AI wiped a database', btn: 'Drop database', denied: 'Denied',
    blocked: ['force push', 'DROP TABLE', 'database wipe', 'prod migration', 'rm -rf outside the project'], merge: 'You merge. Always.', tape: 'And it runs on the AI you already pay for.',
  },
  s10: {
    eye: 'No lock-in', h: 'Bring your own AI.', sub: 'Your repo. Your AI. Your rules.', strip: 'Factory power', agents: [...AGENTS, 'Any SKILL.md agent'],
    modes: ['Fast', 'Lucky', 'Safe'], facts: ['Windows · macOS · Linux', 'New apps or existing code', 'Web · mobile · desktop · games · APIs'], tape: 'So what would yours build first?',
  },
  s11: {
    eye: 'Clock out', h: 'What will your factory build first?', kept: 'Promise kept.', over: 'Worth the extra seconds?', coffee: 'Coffee’s on me either way.',
    offers: [['☕', 'Coffee + a real run', '10 minutes. I show you a real PR it made.'], ['🎫', 'Pilot', 'One ticket from your backlog. One proven PR back.']] as Row[],
    tape: 'AI Software Factory · Idea in. Proven code out.',
  },
  map: {
    title: 'Story map', say: 'Say:', hook: 'Next hook',
    lanes: ['⚡ 30 s · busy exec: 1 → 2 → 5 → 8 → 11', '🎬 60 s · the full shift: 1 → 11', '🔬 Deep dive · CTO: stay on 6 and 7, then the FAQ'],
    nodes: [
      ['Clock in', 'Promise + stakes', 'Give me 60 seconds. Not curious? Coffee’s on me.'],
      ['The gag', 'Pattern interrupt + a laugh', 'I asked an AI for an app. It said done. Look closer.'],
      ['The intern', 'Relatable villain + a planted number', 'AI agents are genius interns. Fast, and they grade their own homework. Zero out of seven.'],
      ['More rules', 'The obvious fix fails', 'Everyone writes more rules. Agents ignore them.'],
      ['The gate', 'Plot twist #1 + the name', 'So we built a gate. No ticket, no plan, no code. This is the AI Software Factory.'],
      ['The line', 'They pick the idea (participation)', 'Pick your world. Research, questions, tickets, plan, build, test, review. Out comes a draft PR.'],
      ['Secret exam', 'Plot twist #2 + the number pays off', 'A second AI writes the exam in secret. The builder never sees it. Same test: seven out of seven.'],
      ['Receipts', 'Plot twist #3: honesty', 'Every PR shows before and after. And it lists what it could not check.'],
      ['Safety', 'Answer the objection before it comes', 'It can’t drop your database. It never merges or deploys. You press merge.'],
      ['Your AI', 'No lock-in', 'It runs on the AI you already have. Your repo, your rules.'],
      ['Clock out', 'Callback + the ask', 'Promise kept. What would yours build first? Coffee’s on me.'],
    ] as Row[],
    faqT: 'If they ask',
    faq: [
      ['How is this different from Copilot, Cursor or Claude Code?', 'Those are the engines. The factory is the production line around them, and it runs on them.'],
      ['Does it push to production?', 'No. Draft PRs only. Your team marks them ready, merges and releases.'],
      ['Does it work on our existing code?', 'Yes. Feature runs analyze the code and everything that uses it before planning.'],
      ['Where does our code go?', 'Nowhere new. It runs inside the coding agent you already use, in your repo.'],
      ['Does the gate judge quality?', 'No. It proves each step happened. Quality comes from the methods, the hidden checks and the done-run. Safe adds tests and an independent review.'],
      ['What does it cost?', 'It depends on your setup. We start with a pilot and agree on the rest together.'],
    ] as [string, string][],
    vsT: 'Where we fit', vsH: ['Option', 'What you get', 'What the factory adds'] as Row,
    vs: [
      ['AI coding assistants', 'Fast code, a developer drives', 'Runs on them and adds the enforced process and proof'],
      ['Prompt-to-app builders', 'Quick prototypes, often on their platform', 'Your repo and stack, existing code too'],
      ['Autonomous AI engineers', 'An agent that opens PRs', 'A gate, hidden checks, before/after proof, any agent'],
      ['Agencies and outsourcing', 'People, weeks, invoices', 'The same steps, enforced at agent speed; humans approve'],
    ] as Row[],
  },
};
export type Copy = typeof EN;

const FR: Copy = {
  ui: { tapIn: 'Touchez n’importe où pour pointer', guest: 'Invité suivant', close: 'Fermer', illus: 'Run illustratif', turn: '↻ Tournez l’écran pour le show complet' },
  sectors: {
    bank: { label: 'Banque', idea: 'App de crédit', miss: 'sandbox de paiement (vos clés requises)' },
    telco: { label: 'Télécom', idea: 'Espace client', miss: 'passerelle SMS (vos clés requises)' },
    gov: { label: 'Administration', idea: 'Permis en ligne', miss: 'connexion identité nationale (compte test requis)' },
    retail: { label: 'Commerce', idea: 'App fidélité', miss: 'terminal de paiement (appareil requis)' },
    energy: { label: 'Énergie', idea: 'Suivi des compteurs', miss: 'flux compteurs en direct (accès requis)' },
    startup: { label: 'Startup', idea: 'Lancement MVP', miss: 'publication sur le store (votre compte requis)' },
  },
  s1: { eye: 'Aslema 👋', h: 'Vous avez 60 secondes ?', sub: 'Pas curieux à la fin ? Le café est pour moi.', card: 'Poste · 60 s', btn: 'Pointer', tape: '60 secondes. 10 touches. Une usine.' },
  s2: { eye: 'Pièce à conviction A', h: 'J’ai demandé une app à une IA.', bubble: 'Fini ! Ça marche ✅', stamp: 'Ça ne marchait pas', sub: 'Rapide. Sûre d’elle. Et fausse.', tape: 'Pourquoi ça arrive tout le temps ?' },
  s3: {
    eye: 'Le problème', h: 'Voici votre nouveau stagiaire génial.', sub: 'Et il corrige sa propre copie.', good: 'Code en quelques secondes',
    bad: ['Saute la recherche', 'Oublie le ticket', 'Ne teste rien', 'Dit « fini » quand même'],
    card: 'Auto-évaluation', found: 'défauts trouvés dans sa propre app', note: 'Test interne à l’aveugle · 1 app · 7 défauts UX connus', tape: 'Alors on lui donne plus de règles ?',
  },
  s4: { eye: 'La solution évidente', h: 'Plus de règles ?', sub: 'Un agent peut ignorer n’importe quelle consigne.', rules: ['Toujours tester', 'Ne jamais sauter le ticket', 'Planifier avant de coder', 'S’il te plaît 🙏', 'Je t’en supplie'], tape: 'Alors on a arrêté de demander gentiment.' },
  s5: { eye: 'Coup de théâtre n°1', h: 'Voici l’AI Software Factory.', sub: 'Votre agent de code, piloté comme une équipe logicielle.', door: 'Code', stamp: 'Pas de ticket · Pas de plan · Pas de code', tape: 'Que se passe-t-il dedans ? Choisissez une idée.' },
  s6: { eye: 'Dans l’usine', h: 'Une idée entre. Du code prouvé sort.', pick: 'Choisissez une idée', stations: ['Recherche', 'Questions', 'Tickets', 'Plan', 'Code', 'Tests', 'Revue', 'PR brouillon'], merge: 'Vous validez', tape: 'Mais comment savoir que ça marche vraiment ?' },
  s7: {
    eye: 'Coup de théâtre n°2', h: 'Le codeur ne voit jamais l’examen.', sub: 'Une IA neuve écrit des contrôles cachés avant le code. Un seul échec et tout repart.',
    env: 'Contrôles cachés', sealed: 'Scellé', wall: 'Pas de triche', checks: ['Parcours principal OK', 'Données enregistrées', 'Affichage mobile'],
    back: 'Échec · retour à la chaîne', pass: 'Contrôle OK', found: 'défauts trouvés par un œil neuf', note: 'Même test à l’aveugle · 1 app · 7 défauts UX connus', tape: 'Ensuite, il montre ses preuves.',
  },
  s8: {
    eye: 'Coup de théâtre n°3', h: 'Chaque livraison arrive avec ses preuves.', sub: 'Il vous dit même ce qu’il n’a pas pu vérifier.', pr: 'PR brouillon n°42', before: 'Avant', after: 'Après',
    rows: ['3/3 résultats prouvés', 'Avant/après pour chaque résultat', 'Ticket lié, checklist cochée'], miss: 'Non vérifié :', stamp: 'Preuves incluses', tape: 'Maintenant, la question de chaque DSI.',
  },
  s9: {
    eye: 'La question du DSI', h: '« Peut-il casser la prod ? »', sub: 'Les commandes destructrices sont refusées pendant un run. Il ne fusionne, ne publie et ne déploie jamais.',
    board: 'Jours depuis qu’une IA a effacé une base', btn: 'Supprimer la base', denied: 'Refusé',
    blocked: ['force push', 'DROP TABLE', 'effacement de base', 'migration en prod', 'rm -rf hors du projet'], merge: 'C’est vous qui validez. Toujours.', tape: 'Et il tourne avec l’IA que vous payez déjà.',
  },
  s10: {
    eye: 'Zéro verrouillage', h: 'Apportez votre IA.', sub: 'Votre dépôt. Votre IA. Vos règles.', strip: 'Alimentation usine', agents: [...AGENTS, 'Tout agent SKILL.md'],
    modes: ['Fast', 'Lucky', 'Safe'], facts: ['Windows · macOS · Linux', 'Nouvelles apps ou code existant', 'Web · mobile · desktop · jeux · API'], tape: 'Alors, que construirait la vôtre en premier ?',
  },
  s11: {
    eye: 'Fin de poste', h: 'Que construira votre usine en premier ?', kept: 'Promesse tenue.', over: 'Ça valait quelques secondes de plus ?', coffee: 'Le café est pour moi, dans tous les cas.',
    offers: [['☕', 'Café + un vrai run', '10 minutes. Je vous montre une vraie PR.'], ['🎫', 'Pilote', 'Un ticket de votre backlog. Une PR prouvée en retour.']],
    tape: 'AI Software Factory · Une idée entre. Du code prouvé sort.',
  },
  map: {
    title: 'Carte du récit', say: 'À dire :', hook: 'Accroche suivante',
    lanes: ['⚡ 30 s · dirigeant pressé : 1 → 2 → 5 → 8 → 11', '🎬 60 s · le poste complet : 1 → 11', '🔬 Approfondir · DSI ou CTO : restez sur 6 et 7, puis la FAQ'],
    nodes: [
      ['Pointage', 'Promesse + enjeu', 'Donnez-moi 60 secondes. Pas curieux ? Le café est pour moi.'],
      ['Le gag', 'Rupture + un rire', 'J’ai demandé une app à une IA. Elle a dit fini. Regardez bien.'],
      ['Le stagiaire', 'Méchant familier + chiffre planté', 'Les agents IA sont des stagiaires géniaux. Rapides, et ils corrigent leur propre copie. Zéro sur sept.'],
      ['Plus de règles', 'La solution évidente échoue', 'Tout le monde ajoute des règles. Les agents les ignorent.'],
      ['La barrière', 'Coup de théâtre n°1 + le nom', 'Alors on a construit une barrière. Pas de ticket, pas de plan, pas de code. Voici l’AI Software Factory.'],
      ['La chaîne', 'Ils choisissent l’idée (participation)', 'Choisissez votre secteur. Recherche, questions, tickets, plan, code, tests, revue. Une PR sort.'],
      ['L’examen secret', 'Coup de théâtre n°2 + le chiffre revient', 'Une deuxième IA écrit l’examen en secret. Le codeur ne le voit jamais. Même test : sept sur sept.'],
      ['Les preuves', 'Coup de théâtre n°3 : l’honnêteté', 'Chaque PR montre l’avant et l’après. Et ce qui n’a pas pu être vérifié.'],
      ['Sécurité', 'Répondre à l’objection avant qu’elle arrive', 'Il ne peut pas effacer votre base. Il ne fusionne et ne déploie jamais. C’est vous qui validez.'],
      ['Votre IA', 'Zéro verrouillage', 'Il tourne avec l’IA que vous avez déjà. Votre dépôt, vos règles.'],
      ['Fin de poste', 'Rappel + la demande', 'Promesse tenue. Que construirait la vôtre en premier ? Le café est pour moi.'],
    ],
    faqT: 'S’ils demandent',
    faq: [
      ['Quelle différence avec Copilot, Cursor ou Claude Code ?', 'Ce sont les moteurs. L’usine est la chaîne de production autour, et elle tourne dessus.'],
      ['Est-ce que ça pousse en production ?', 'Non. Seulement des PR en brouillon. Votre équipe les valide, fusionne et publie.'],
      ['Ça marche sur notre code existant ?', 'Oui. Les runs de fonctionnalité analysent le code et tout ce qui l’utilise avant de planifier.'],
      ['Où va notre code ?', 'Nulle part de nouveau. Tout tourne dans l’agent de code que vous utilisez déjà, dans votre dépôt.'],
      ['La barrière juge-t-elle la qualité ?', 'Non. Elle prouve que chaque étape a eu lieu. La qualité vient des méthodes, des contrôles cachés et du run final. Safe ajoute tests et revue indépendante.'],
      ['Combien ça coûte ?', 'Ça dépend de votre contexte. On commence par un pilote, puis on décide ensemble.'],
    ],
    vsT: 'Notre place', vsH: ['Option', 'Ce que vous obtenez', 'Ce que l’usine ajoute'],
    vs: [
      ['Assistants de code IA', 'Du code rapide, piloté par un dev', 'Tourne dessus et ajoute le process imposé et les preuves'],
      ['Générateurs d’apps par prompt', 'Des prototypes rapides, souvent sur leur plateforme', 'Votre dépôt et votre stack, code existant compris'],
      ['Ingénieurs IA autonomes', 'Un agent qui ouvre des PR', 'Une barrière, des contrôles cachés, des preuves avant/après, tout agent'],
      ['Agences et sous-traitance', 'Des gens, des semaines, des factures', 'Les mêmes étapes, imposées à vitesse d’agent ; validation humaine'],
    ],
  },
};

// French typography: thin no-break space before ? ! : ; » and after «, so marks never wrap alone 🇫🇷
export const nbsp = (v: unknown): unknown =>
  typeof v === 'string' ? v.replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ')
    : Array.isArray(v) ? v.map(nbsp)
      : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, nbsp(x)]))
        : v;

export const COPY: Record<Lang, Copy> = { en: EN, fr: nbsp(FR) as Copy };
