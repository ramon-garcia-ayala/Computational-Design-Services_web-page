---
name: client-deck
description: Build a client-specific R²XTECH presentation (a standalone HTML slide deck in the same narrative style, design system and engine as presentation/value-deck.html) from an analysis of one particular firm, telling them what we found in their industry and their operation, why it matters to them, the program we propose, how it would start and the next step. Use this whenever someone shares discovery notes, an audit, interview findings, a diagnosis or an analysis of a specific client and wants a deck, a pitch, slides, a presentation, "una presentación para el cliente", "diapositivas", or asks to turn an analysis into something to present in a meeting, even if they never say "deck" or name this skill. Not for the studio's own general pitch (that is value-deck.html) and not for the written web proposals in src/data/proposals.
---

# Client decks

A client deck is the R²XTECH pitch for one firm, built from an analysis of that
firm. `presentation/value-deck.html` sells the studio to anyone: what we do, what
it does for you, what you get. A client deck says what the company deck cannot:
**we looked at your operation, this is what we found, this is why it matters to
you, and this is the program we would build for it.** It is proof that we
listened, so every claim on it has to come from the analysis.

Same narrative voice, same design system, same engine as the company deck. What
changes is the spine. The company deck argues from cost; a client deck argues from
the need we identified and the program that answers it. Money is supporting
evidence, used only when the analysis carries real figures.

## Workflow

1. **Read the analysis end to end, then write a findings sheet** before touching
   HTML. For each finding: the observation, its evidence (who said it, which file,
   which measured task), its confidence (measured, reported, our estimate, to
   validate), the consequence for them, and which part of the program answers it.
   Then pick the **lead finding**: biggest consequence with the strongest
   evidence. It becomes the cover line and the hinge slide; the rest support it
   or get cut. `references/narrative.md` has the sheet format and how to choose.
2. **Resolve what is missing.** If the story needs something the analysis does
   not have, do not invent it: an engineer in that room knows their own numbers,
   and one fabricated figure discredits the rest. Ask the user if the gap changes
   the story; otherwise carry it as an open question ("to confirm in week one").
3. **Language.** English by default. Spanish when the user or the analysis asks
   for it, and then everything the audience sees or the presenter says (copy,
   notes, chart labels, aria labels) is Spanish. Code comments stay in English.
4. **Check for a written proposal** for the same client in `src/data/proposals/`
   (folders are `DD.MM.YYYY_client`). If one exists, the deck's scope, phases and
   figures must match it; the proposal is the document, the deck is the spoken
   version of it.
5. **Scaffold** (below), then write slide by slide against the arc.
6. **Check, then walk it.** Run `check-deck.mjs` with `--analysis`, fix every
   FAIL, read every WARN, then open the deck in a browser and look at every slide
   (`references/verification.md`).
7. **Report** (format at the end). Do not commit unless asked.

## Scaffold

```bash
node presentation/.claude/skills/client-deck/scripts/new-deck.mjs \
  --client "Halden Structural" --date 2026-09-24 --lang en
```

This writes `presentation/clients/<DD.MM.YYYY_client>/deck.html` (the date is the
meeting date) with:

- the company deck's `<style>` lifted live from `value-deck.html`, so tokens and
  components are always current (change the design there, never in a client deck);
- the engine (`assets/engine.js`) inlined;
- a nine-slide starter in the default arc, every piece of copy marked `[[...]]`
  with what belongs there, and an HTML comment on each slide stating its job;
- asset paths pointing at the site's own `public/` (the hero's geodesic frames,
  the logo, the project renders), so no studio image is ever copied into
  `presentation/` or a client folder. Only the client's own images, which the
  site does not have, go in `clients/<slug>/assets/`.

`--out <dir>` writes somewhere else (paths are recomputed). `--force` overwrites.
The starter is a starting point, not a form: cut, merge and reorder slides to fit
the analysis, and delete any component the findings do not support.

## The arc

Three acts, the same shape as the company deck: the greige ground opens, hinges
and closes; the warm ground carries the argument.

| # | Ground | Eyebrow | Job |
|---|---|---|---|
| 1 | pale, geodesic | *Prepared for {client}* | The lead finding and the program, in two lines |
| 2 | warm, particles | 01 / What we found | The pattern they share with their industry, so the finding reads as known and solvable, not as blame |
| 3 | warm | 01 / What we found | What we saw in *their* firm: the lead finding and its evidence |
| 4 | pale | 01 / What we found | Why it matters to them: the consequence in time, errors, risk, capacity or money |
| 5 | warm, particles | 02 / What we propose | The program: a name, one line, at most three parts |
| 6 | warm | 02 / What we propose | Their own workflow before and after: which of their steps change |
| 7 | warm | 02 / What we propose | How we would start: the pilot, what it proves, what we need from them |
| 8 | warm | 03 / What changes | What changes for their team, and what they keep when we leave |
| 9 | pale, geodesic | Next step | One small, specific, low-risk ask |

Aim for 7 to 11 slides. Each slide has one job; if two slides share one, merge
them, and if one slide has two, split or cut. Variations (figures or no figures,
several needs, proof from past work, a short meeting) are in
`references/narrative.md`.

## Rules, and the corrections behind them

These came from reviewing the company deck slide by slide. They are why the
decks look the way they do, so apply the reasoning, not just the letter.

- **One thesis per slide; detail goes to the notes.** A slide carrying a
  statement, a paragraph, a proof strip and a caption was sent back as "too much
  text". The fix was one line of thesis, one proof, and everything else moved to
  the presenter notes. `check-deck` warns past 90 words on screen; most good
  slides are under 50.
- **Every number traces to the analysis and wears its confidence.** Label figures
  *Measured*, *Reported by your team*, *Our estimate* or *To validate*. Say a
  baseline, today and target exactly as they are; "5 days to 1 day" was kept honest
  as "baseline 5 · today 3 · target same-day" because rounding it into "5x
  faster" is a claim about the future dressed as the present.
- **The need is the spine; money is optional.** If the analysis has real
  figures (a rate, hours, a cost), use them. If it does not, express the
  consequence in hours, errors, rework, risk, capacity or client pressure, and
  never borrow an industry ratio and present it as theirs.
- **Make the argument a shape, not a sum.** A monochrome two-line chart that asked
  the viewer to notice lines drifting apart was rejected; the version that stuck
  gave the growing cost the danger colour and filled the widening gap. Any chart
  or figure should make its point visible without mental arithmetic, and should
  draw the slide's own data.
- **Images must belong to the claim.** A photograph of unrelated studio work
  placed next to a client result was flagged immediately: it reads as "this is
  their project". Use the studio's own imagery only where it is relevant (the
  geodesic on the cover and closing), otherwise plain ground, a particle field,
  or a figure drawn from the slide's numbers.
- **Confidentiality cuts both ways.** The client is named in their own deck. No
  other client's name, sector detail or process ever appears, and proof from past
  work shows counts, never method: a diagram of a real pipeline was replaced because
  it described a process under NDA.
- **No em dashes** in anything the audience or presenter reads (copy, notes, chart
  labels, titles). They are one of the most recognisable tells of AI-written text,
  and copy that reads as machine-written undermines a studio selling judgement.
  Rewrite with a period, comma, colon or parentheses. This applies in Spanish too.
- **Amber is not ink on the greige ground** (1.00:1, invisible). On pale slides
  accented text uses `--ink-accent`; amber appears only as a filled `.pill.solid`.
- **Presenter notes on every slide**: a bold cue, the sentence to say, what to ask,
  what to write down, what not to overclaim. The notes carry the detail the slide
  no longer does.
- **Motion has a job and only runs on its own slide.** Sliders accelerate into
  their limit (a slow-down tail undersold the growth); ranges match the client's
  own scale (a track to $1bn put a $50M firm in its first few percent).
  The engine handles lifecycle and reduced motion for its components.

## Where things are

| Need | Read |
|---|---|
| Turning an analysis into findings, the arc slide by slide, variations, copy voice, notes | `references/narrative.md` |
| Grounds, tokens, contrast, type, imagery, motion | `references/design-system.md` |
| Copy-paste slide patterns and the engine's data attributes | `references/components.md` |
| Checking and walking the deck in a browser, and the traps | `references/verification.md` |
| Scaffold / static check | `scripts/new-deck.mjs`, `scripts/check-deck.mjs` |

## Check

```bash
node presentation/.claude/skills/client-deck/scripts/check-deck.mjs \
  presentation/clients/<slug>/deck.html --analysis <path-to-analysis>
```

Fix every FAIL. Each WARN about a number not found in the analysis means either
trace it (and label it) or cut it.

## Report

End with:

- **Deck:** the path, and how to open it (`python -m http.server 8790` from the
  repo root, then `http://localhost:8790/presentation/clients/<slug>/deck.html`;
  `N` toggles notes).
- **Slides:** one line each, number and what it says.
- **Figures used:** each number on screen, its confidence label and where in the
  analysis it came from.
- **To confirm before presenting:** gaps, assumptions, open questions.
- **Deviations from the default arc** and why.
