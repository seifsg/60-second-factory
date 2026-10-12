# 🏭 60-Second Factory

A tap-through, 60-second pitch for the **AI Software Factory**: your coding agent, run like a software team. Idea in, proven code out.

**▶ Live:** https://pitch.seif.dev · presenter mode: https://pitch.seif.dev/#presenter

- 11 animated scenes, English and French, made for a tablet (phones and desktops work too).
- Tap right for next, the left edge to go back, or swipe. Keyboard and presentation clickers work.
- The last slide opens two rooms: **Show me cool stuff** (a real factory PR taken apart, its proof, what it built) and **Join the waitlist** (a badge that fills in as guests type).
- Presenter mode adds the 📈 story map: attention curve, what to say, objection answers, and the sign-ups saved on this device with CSV export.
- **On a tablet, install it:** Safari › Share › Add to Home Screen (or Chrome › Install app). It opens full screen like an app, keyboards behave, and it keeps working offline after the first visit.
- The waitlist asks only for an email; name, phone and company are optional. One-tap domains and a "did you mean" fix keep typos out.

## Waitlist: no sign-up gets lost

```text
guest ─► tablet: localStorage + IndexedDB (both, merged on read) ─► POST /api/waitlist (retries with backoff, on reconnect, on next boot)
                                                                     │
Worker ─► KV: one record per email (deduped, numbered) ─► emails Seif through softwarefactory.company's lead mailer
                                                          └─ not delivered yet? the cron retries every 30 minutes
```

- `npm run leads` downloads every sign-up as `waitlist.csv` (needs `ADMIN_TOKEN` in `.dev.vars`).
- The offline file (`deck/dist/offline.html`) works with no network and syncs to the live API once back online.

## Build, test, deploy

Needs Node 24 or newer.

```bash
npm install
npm test          # 39 unit tests: validation, storage, retries, CORS, CSV, merge rules, CSS collisions
npm run dev       # local Worker at http://localhost:8787 (local storage, never emails)
npm run e2e       # the waitlist on iPad Safari (landscape + portrait) and Galaxy Tab Chrome, finger taps only
npm run deploy    # tests, build, then wrangler deploy
```

Every push runs the unit tests, the build and the tablet suite in GitHub Actions. `BASE_URL=https://pitch.seif.dev npm run e2e` smoke-tests production. Add a `CLOUDFLARE_API_TOKEN` repository secret to deploy on every push to `main`.

## Layout

```text
deck/src/    slides, rooms, copy (EN/FR), on-device sign-up storage and sync
deck/assets/ screenshots and the done-run recording (Framehouse sample, sample data)
server/      Cloudflare Worker: /api/waitlist, /api/leads (admin CSV), /api/health, cron
shared/      email check and CSV writer used by both sides
test/        node --test suites
e2e/         Playwright tablet tests for the waitlist
```

Your details (name, booking link, preselected sector, API URL) live in `deck/src/config.ts`.
