# 🏭 60-Second Factory

A tap-through, 60-second pitch for the **AI Software Factory**: your coding agent, run like a software team. Idea in, proven code out.

**▶ Live:** https://seifsg.github.io/60-second-factory/

- 11 animated scenes, English and French, made for a tablet (works on phones and desktops too).
- Tap right for next, the left edge to go back, or swipe. Keyboard and presentation clickers work.
- The 📈 button opens the presenter story map: attention curve, what to say, objection answers.

## Build

Needs Node 24 or newer, no dependencies.

```bash
npm run build   # deck/dist/site/index.html, deck/dist/offline.html, deck/dist/artifact.html
npm test
```

Every push to `main` runs the tests, builds the deck and publishes it to GitHub Pages.

## Layout

```text
deck/src/   copy (EN/FR), config, scenes, styles, engine
deck/build.mjs   stitches src into single-file pages
```

Your details (name, booking link, preselected sector) live in `deck/src/config.ts`.
