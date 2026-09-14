# Verification

A client deck is checked twice: statically, then by walking every slide in a
browser. The static check catches what is cheap to catch; only looking at the
slides catches a heading that wraps badly, a chart nobody can read, or a slide
that says two things.

## 1. Static check

```bash
node presentation/.claude/skills/client-deck/scripts/check-deck.mjs \
  presentation/clients/<slug>/deck.html --analysis <path-to-analysis>
```

| Level | Examples |
|---|---|
| FAIL | em dash in copy or notes; a slide without notes; unfilled `[[...]]`; a missing asset or missing geodesic frames; an inline script that does not parse; duplicate ids; amber text on a pale slide; a `data-count` that is not a plain number; a hinge chart without Chart.js |
| WARN | over 90 words on a slide; thin notes; slide count outside 6 to 12; a number on screen not found in the analysis; a spaced en dash |
| INFO | language; money figures on screen |

Fix every FAIL. For each "number not found in the analysis": trace it (and give
it a confidence label) or cut it. Derived numbers are fine when labelled *Our
estimate* and explained in the notes.

## 2. Serve from the repo root

Decks read their images straight from the site's `public/` (a client deck at
`presentation/clients/<slug>/` uses `../../../public/`), so serve the repository
root, not `presentation/` or the client folder; served from anywhere lower, that
path escapes the server root and every image 404s. Browser automation cannot open
`file://` URLs, so always serve.

```bash
python -m http.server 8790
# open http://localhost:8790/presentation/clients/<slug>/deck.html#1
```

`#N` in the URL opens slide N, and the hash follows navigation.

## 3. Walk every slide

For each slide, take a screenshot and ask:

- **One thesis?** Could someone at the back of the room say what this slide claims?
- **Legible?** No text over a busy part of an image; amber never used as text on
  greige; chart legend and axis titles readable.
- **Nothing clipped?** Content taller than the frame loses its end, never its
  opening; if the end is lost, cut copy.
- **Numbers right?** Each matches the analysis and wears its confidence label.
- **Motion right?** Counters and sliders run once from their start when you land,
  and end on the correct values. The cover and closing geodesic takes a few
  seconds to decode before it moves; the still meanwhile is expected.

Also:

- Press `N` on two or three slides: notes readable, with a bold cue.
- Read the console: no errors.
- If you can resize, check a dense slide at about 1366×768.

## 4. Traps

- **Background tabs are throttled.** Chrome pauses `requestAnimationFrame` and
  clamps timers to about a second in a tab that is not in front. A script that
  samples a slider or waits for frames in a background tab reads a frozen value and
  looks like a bug. Take a screenshot (which brings the tab forward) or read the
  state synchronously; do not conclude "broken" from a throttled probe, and never
  await animation frames in a probe.
- **Screenshot timeouts.** Capture occasionally times out on an animated page. A
  synchronous read (`document.visibilityState`, the text of an element) tells you
  whether the page is alive; if it is, open a fresh tab and retry.
- **Stale server content.** The server reads files on request, so a reload shows
  edits; if something looks unchanged, hard-reload.
- **Clean up.** Close the tabs you opened and stop the server:

  ```bash
  # Git Bash on Windows
  pid=$(netstat -ano | grep ':8790' | grep LISTENING | awk '{print $5}' | head -1); taskkill //F //PID "$pid"
  # macOS / Linux
  kill $(lsof -t -i :8790)
  ```

## 5. Before reporting

- [ ] `check-deck`: no FAIL; every WARN resolved or explained in the report
- [ ] every number on screen traced to the analysis, with a confidence label
- [ ] no other client named, described or diagrammed
- [ ] every slide walked in the browser; no console errors
- [ ] notes on every slide: what to say, what to ask, what not to overclaim
- [ ] one language throughout: copy, notes, chart labels, aria labels
