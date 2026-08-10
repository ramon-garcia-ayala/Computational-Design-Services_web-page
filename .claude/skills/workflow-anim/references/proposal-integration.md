# Putting the animation into a proposal

## The `figure` block

```ts
{
  kind: "figure",
  id: "model-generation",
  kicker: "Model generation",
  title: "Automated model generation",
  lead: "A 2D site layout becomes a coordinated Revit model without anyone redrawing it.",
  src: "/proposals/29.06.2026_ecogen/anim/model-generation/model-generation.svg",
  poster: "/proposals/29.06.2026_ecogen/anim/model-generation/model-generation.poster.svg",
  download: { label: "Animation (GIF)", file: "…/model-generation.gif" },
  alt: "Animated diagram on a white background. Flat plates appear one by one…",
  caption: "Each stage is a scripted step. The layout you send is the only input.",
  tags: ["revit", "automation", "geometry", "massing"],
}
```

The CLI prints this filled in. Paste it into the `blocks` array in
`src/data/proposals/<slug>/index.ts` at the point in the argument where the
reader should see it — usually straight after the prose that sets it up, and
before the `flow` block that gives the technical version.

Every field comes from the sidecar. Do not rewrite the `alt` by hand; if it is
wrong, fix `meta.alt` in the spec and render again, so the file and the block
never disagree.

## Why a block rather than an attachment

The one existing animation in this repo,
`public/proposals/29.06.2026_ecogen/header.gif`, is referenced from a `docs`
block — a link the reader clicks to open the file in a new tab. It is the
strongest thing in that proposal for an architect and it is never displayed on
the page it belongs to.

A link the reader must click to reach the thing that explains the proposal is a
design failure. `docs` is right for a PDF, a drawing set, a spreadsheet —
attachments that leave the page. A diagram that *is* the argument belongs in the
argument.

Attach the GIF as well, through the block's `download` field. That is what gets
forwarded, pasted into a deck and sent to a site manager, and it is the reason
the raster twin exists at all.

## What the component has to do

`src/components/proposal/blocks/FigureBlock.tsx`, wired into the switch in
`ProposalRenderer.tsx` — the only place a kind maps to a component.

**A white plate.** The animation is white and every proposal page is `#0a0c0b`.
Dropped in raw it looks like a hole punched in the page; on a rounded white plate
with padding it reads as a drawing pinned to the sheet.

**`Reveal` for the entrance,** like every sibling block. Never a bare `useEffect`,
never a hand-rolled ScrollTrigger.

**Reduced motion swaps `src` for `poster`.** Through `useReducedMotion`, the
single source of truth. Note the hydration trap: the hook returns `false` on the
hydration render, so the poster swap has to be an attribute the effect *sets*
rather than something the server guessed.

**No `cardGrid`.** The `gap-px`-over-`bg-line` rule that governs `cards`, `docs`,
`timeline` and `pricing` does not apply — `figure` is one full-width element, not
a grid, so a half-empty last row cannot happen.

**A `kicker`.** The side index labels each entry with `kicker ?? title`, so a
block without one runs the full width of the rail while its neighbours are a word
or two.

## Placement

- **Header.** First block, before the prose. Good for `transform` — it states
  what the project is about before anyone reads a word.
- **Mid-argument.** After the prose that sets it up. Good for `pipeline` and
  `exchange`, where the reader needs a little context to know what they are
  looking at.
- **Beside the commercial section.** Good for `iterate`: forty options studied,
  read immediately before a price, is the clearest justification of a fee the
  studio has.

One per proposal is usually right. Two is fine if they answer different
questions. Three means the proposal is doing the diagram's job badly in text.

## Testing it

Load the block's anchor **directly** — `/<slug>#<block-id>` — not just by
scrolling to it. A URL that arrives with a hash is a known trap on this site: the
browser has scrolled past the section before the reveals are created, so it never
receives the scroll event its trigger waits for. Proposals link to their own
sections, so real readers hit this.

Then check reduced motion: the poster should show, and nothing should move.
