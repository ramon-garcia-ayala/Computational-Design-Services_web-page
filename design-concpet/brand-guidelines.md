# R²XTECH — Brand Guidelines

Reference sheet for the design system actually shipping in production
(Direction A · Instrument, from `design-concpet/brand-directions.html`,
implemented on `design-corrections`).

**Source of truth is the code, not this file.** Every value below is copied
from `src/app/globals.css` and `src/data/site.ts`. If the two ever disagree,
the code wins — update this file to match, never the other way around. That
also means: **when a future change edits a token in `globals.css`, update the
matching line here in the same pass.** A stale guideline is worse than none,
because it looks authoritative.

Hand this file to any designer, agent, or tool that needs to stay on-brand for
r2xtech — it does not require reading the codebase.

---

## 1 · Brand concept

**One primary dark ground + one accent.** A second accent was tried in an
early mockup (lime `#c8f94e`) and retired on purpose: two accents read as two
mixed modes, not one brand. There is no "-warm" alias for the accent either —
a second name is exactly what would let the split grow back.

**Voice**: technical, quiet, specific. Eyebrows and labels are set in mono,
uppercase, wide-tracked — the "instrument panel" register the name Instrument
refers to. Body copy is plain sentences, never marketing breathlessness.

**Positioning line** (used as tagline/signature, not the hero headline):
> "Architecture, computed."

**Outcome line** (used in metadata, decks, anywhere the claim needs to be
concrete):
> "We automate AEC. You ship faster."

Keep these two separate jobs separate. The positioning line is what people
repeat; the outcome line is what convinces someone with a budget. Don't merge
them into one sentence — that was Finding 05 of the original brand audit and
the reason both still exist.

---

## 2 · Colour system

Colour is **scoped**, not flat: three grounds, and each token means something
different depending which one is active. Never hardcode a hex in a component —
always the token name, so a component works correctly under all three scopes
without knowing they exist.

### 2.1 The three grounds

| Scope | Where it's used | How it's applied |
|---|---|---|
| **Dark** (default) | Home's panels, every route's base scope before an override | No attribute needed — this is what the bare tokens resolve to |
| **`[data-site-warm]`** | Every `(site)` route's wrapper (`about`, `contact`, `services`, `projects`, `labs` all start here) | `<div data-site-warm>` |
| **`[data-site-pale]`** | `/about` and `/contact` page content specifically (nested inside the warm wrapper); also the `Header` in its `light` variant, wherever it renders | `<div data-site-pale>` (or `data-site-pale={light \|\| undefined}` for a component, never a literal `"false"` string — see §2.4) |

A page can be pale-inside-warm (about, contact): the outer layout sets warm,
the page's own content wrapper sets pale on top of it.

### 2.2 Dark ground (default)

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--color-carbon` | `#0a0c0b` | Page background | — |
| `--color-graphite` | `#14171a` | Surfaces, cards | — |
| `--color-graphite-hi` | `#1c2024` | Elevated surface | — |
| `--color-line` | `#262b2e` | **Decorative dividers only** | 1.37:1 — too low for anything meaningful |
| `--color-line-soft` | `#1a1e21` | Subtle dividers, background grid | — |
| `--color-edge` | `#5e686d` | **Field borders, control boundaries, diagram structure** | 3.44:1 on carbon, 3.15:1 on `--color-graphite` — clears WCAG 1.4.11 against both, not just the page ground |
| `--color-fg` | `#f2f4f0` | Primary text | 17.7:1 |
| `--color-fg-muted` | `#8a918c` | Secondary text | 6.08:1 |
| `--color-accent` | `#e8a94a` | **Fill only** — solid buttons, plates | 9.53:1 (as ink here too, but see §2.5) |
| `--color-accent-dim` | `#c8913a` | Hover/pressed state of the accent | 7.07:1 |
| `--color-accent-ink` | `#e8a94a` | Accent **as text/hairline/border** | same as accent on this ground |
| `--color-on-accent` | `#2a2826` | Ink sitting ON a filled accent plate | 7.14:1 |
| `--color-focus` | `#e8a94a` | Keyboard focus ring | 9.53:1 |
| `--color-danger` | `#d25854` | Error text, invalid-field borders | 4.92:1 on carbon, 4.51:1 on graphite |

`--color-edge` was `#5a6368` (3.19:1 on carbon) until a redesign pass found it
dropped to 2.93:1 the moment it sat on `--color-graphite` instead of the page
ground — a bordered control on a surface, which is most of them. The value
above clears both by a real margin rather than passing one check by luck.

### 2.3 Warm ground (`[data-site-warm]`)

Redefines only carbon/graphite/line/fg — never the accent tokens, which don't
need it (amber still passes here).

| Token | Hex | Notes |
|---|---|---|
| `--color-carbon` | `#3d3934` | Panel charcoal, not black — reads as its own state, not "the page ending" |
| `--color-graphite` | `#47423c` | |
| `--color-graphite-hi` | `#514b44` | |
| `--color-line` | `#55504a` | |
| `--color-line-soft` | `#494440` | |
| `--color-fg` | `#f2f4f0` | 10.35:1 |
| `--color-fg-muted` | `#b4aea5` | 5.20:1 on carbon, 4.52:1 on graphite |
| `--color-edge` | `#96918a` | 3.66:1 on carbon, 3.18:1 on graphite |
| `--color-danger` | `#ff9686` | 5.43:1 on carbon, 4.71:1 on graphite |

Accent on this ground: `#e8a94a` on `#3d3934` = **5.57:1** — safe as ink.

`--color-fg-muted` was `#a8a29a` (4.53:1 on this scope's own carbon) until the
same graphite check that caught `--color-edge` above caught it too: 3.93:1 on
`--color-graphite`, failing AA the moment secondary text sat on a surface
instead of the page. `--color-edge` didn't exist in this scope at all before
that pass — it silently inherited the dark scope's value, which measured
1.87:1 here. Every route under `[data-site-warm]` (`/projects`, `/services`,
`/labs`, `/labs/tool`, every project page) was depending on a token that had
never actually been tuned for this ground.

### 2.4 Pale ground (`[data-site-pale]`)

The one ground where amber cannot be ink at any size — `#e8a94a` on `#b8b4b1`
is **1.00:1**, identical relative luminance. This is a structural fact of the
ground's mid-scale luminance (0.4601), not a fixable colour choice: the
maximum any colour can reach against it is 10.2:1 (pure black), and even a
desaturated bronze only reaches ~2.9:1 — nowhere near AA. **Don't try to
"just pick a darker amber" for this ground; it doesn't work, and this file
exists partly so nobody re-discovers that the hard way.**

| Token | Hex | Notes |
|---|---|---|
| `--color-carbon` | `#b8b4b1` | The hero's own plate |
| `--color-graphite` | `#c1bdba` | |
| `--color-graphite-hi` | `#c9c5c2` | |
| `--color-line` | `#9c9793` | |
| `--color-line-soft` | `#aaa6a2` | |
| `--color-fg` | `#2a2826` | 7.13:1 |
| `--color-fg-muted` | `#4a4642` | 4.54:1 |
| `--color-accent-ink` | `#2a2826` | **The fg colour carries the accent's ink role here** — amber itself is never redefined |
| `--color-focus` | `#2a2826` | 7.13:1 — see §2.6, this used to be the site's one real accessibility bug |
| `--color-edge` | `#625d57` | 3.17:1 on carbon, 3.49:1 on graphite |
| `--color-danger` | `#900e0e` | 4.52:1 on carbon, 4.99:1 on graphite — a dark red, not a bright one: this ground is light, so the readable direction inverts |

`--color-edge` was `#66615b` here, at exactly **2.98:1** — under the 3:1 this
token exists to clear, by a margin small enough to read as passing at a
glance. The value above clears 3:1 against both carbon and graphite with room
to spare.

`--color-accent` itself stays `#e8a94a` on every ground — it still works
as a **filled plate** (with `--color-on-accent` `#2a2826` on it, 7.14:1). The
rule this whole section encodes:

> **Amber is a dark-ground colour when used as ink. On a light ground it only
> ever appears as a filled shape with dark type on it — never as text, an
> underline, or a border, at any size.**

### 2.5 Which class to use, always

| You're styling… | Use | Never |
|---|---|---|
| Amber body text, an eyebrow label, a link, a hairline | `text-accent-ink` / `border-accent-ink` | `text-accent` / `border-accent` |
| A solid filled button, a plate, a swatch | `bg-accent` + `text-on-accent` | — |
| A field border, a toggle border, anything meaningful under WCAG 1.4.11 | `border-edge` | `border-line` |
| A decorative divider, a background grid line | `border-line` | `border-edge` (over-strong) |
| Error text, an invalid field's border | `text-danger` / `border-danger` | `text-red-400` or any other unscoped Tailwind colour |

**"Meaningful" is broader than form fields.** The rule above reads narrowly —
"field borders, toggle borders" — and that reading is exactly what let
`border-line` (1.37:1) become the rail and dashed connector of the site's own
hand-drawn pipeline diagram (`FlowDiagram.tsx`), the row rules of every data
table, and the empty box of every checklist item: none of those are form
fields, but every one of them is a line a reader has to actually see for the
component to do its job. **If a line's absence would change what the reader
understands, it's `edge`. If removing it changes nothing — a divider between
unrelated sections, a background grid — it's `line`.** A `gap-px` card grid's
divider colour (the classic case: `bg-line` showing through the gap) is
"meaningful" by this test too, since it's the only thing separating one card
from the next.

**`--color-panel-ink-muted`** (dark scope only) is a third muted-text value,
alongside `--color-fg-muted` and the pale/warm scopes' own. It exists because
Home's panels sit on `--color-panel` (`#3d3934`) while still living in the
*base dark scope*, not `[data-site-warm]` — so `--color-fg-muted` (tuned
against carbon, 6.08:1) measures only 3.55:1 there. Use it for any muted text
that sits directly on `bg-panel` without a warm/pale scope wrapping it —
`Panels.tsx`'s captions and `LabFooter`'s column headings are the two current
examples. Likewise `--color-lab-ink-muted` is the equivalent for text on the
hero's own `--color-lab-bg` plate.

**`--color-lab-line`** is the `lab-*` family's decorative hairline — the
counterpart of `--color-line` for anything drawn on `--color-lab-bg`, such as
`StatsBar`'s top and bottom rules. Not a fourth value invented for the
purpose: `[data-site-pale]`'s `--color-line` is already the verified rule for
this exact greige (`--color-carbon` and `--color-lab-bg` are both `#b8b4b1`
there), so `lab-line` just reuses it — 1.40:1 on `lab-bg`, matching the
1.37:1 `--color-line` measures on carbon. As with `--color-line` itself, this
is for a rule whose absence would not change what the reader understands;
anything load-bearing on this plate still takes `--color-edge`.

### 2.6 The one accessibility rule worth repeating

A component that visually sits on the pale plate **must** carry
`data-site-pale`, even if it renders outside the page's own content wrapper.
The site's shared `Header` in its `light` variant is the example that actually
broke this once: it renders one level *above* the `[data-site-pale]` div that
`/about` and `/contact` wrap their content in, so its keyboard focus ring
stayed hardwired to amber-on-greige (1.00:1, invisible) even after the page
content itself was fixed. The fix was tagging the header
`data-site-pale={light || undefined}` — note the `|| undefined`, not a bare
boolean: React would otherwise render `data-site-pale="false"`, which CSS
attribute selectors (`[data-site-pale]`) match regardless of its string value,
silently applying pale-ground overrides to the dark header too.

**Rule: scope by what a component visually sits on, not by which div
technically wraps it.**

---

## 3 · Typography

**Two families, one for data.** Down from four — Sora was retired; Space
Grotesk was already sitewide chrome (Header, nav, footer) under a separate
token (`font-lab`) and is now simply the one display face.

| Role | Family | Weight range | Token |
|---|---|---|---|
| Display / headings / nav / buttons | **Space Grotesk** | 500–700 | `font-display` |
| Body / UI / everything read in sentences | **Inter** | 400–600 | `font-sans` (also `body`'s default — no class needed) |
| Labels, eyebrows, data, figures | **JetBrains Mono** | 400–500 | `font-mono` |

Why Space Grotesk for display: its squared, monolinear letterforms are the
closest match to the `R²XTECH` wordmark's own geometry.

### 3.1 The fluid scale

One scale, used everywhere — it replaced a split where Home's panels scaled
fluidly (`clamp()`) while every other route stepped at Tailwind breakpoints,
so the same heading changed *behaviour*, not just size, depending on the
route.

| Token | `font-size` | `line-height` | `letter-spacing` | Use for |
|---|---|---|---|---|
| `text-display` | `clamp(2.4rem, 3.8vw, 4.6rem)` | 1.05 | -0.02em | The largest heading on a panel/page (Services, Featured, project H1) |
| `text-h1` | `clamp(2.1rem, 3.25vw, 3.9rem)` | 1.08 | -0.02em | Stat figures, closing-panel body, FinalCTA heading |
| `text-h2` | `clamp(1.75rem, 2.3vw, 2.75rem)` | 1.12 | -0.015em | `SectionHeading`, sub-panel headings |
| `text-h3` | `clamp(1.35rem, 1.55vw, 1.85rem)` | 1.2 | *(none set)* | Card-level headings inside a horizontal-scroll panel |
| `text-lead` | `clamp(1.15rem, 1.25vw, 1.5rem)` | 1.55 | *(none set)* | Reserved — defined, not yet consumed anywhere in the codebase |

Usage: `className="text-display font-display font-semibold text-fg"` — the
token supplies size/line-height/letter-spacing; add `font-display` and a
weight utility on top.

**The `vw` coefficient is the load-bearing number, not the max.** A `clamp()`
stops growing at `max ÷ coefficient`, and that width is where the design
stops adapting. The first version of this scale ended every ramp at ~1300px
(display `4.6rem/5.6vw` = 1314px, h1 1300, h2 1294, h3 1345) — which is not
"desktop", it is precisely where a 14" laptop lands: 1920 physical at
Windows' 150% scaling is **1280 CSS px**, a 14" MacBook Pro is 1512, older
panels are 1366. Every laptop was therefore served the *full 32"-monitor
maximum* on a canvas 30–50% narrower, and the whole page read as cramped,
while the 32" itself looked correct — there the same maximum finally had the
width it was drawn for. The coefficients now end each ramp at ~1920px, so
the laptop band (1024–1440) sits mid-ramp and scales with its actual canvas.

If you change a `max` here, recompute the coefficient as `max ÷ 1920` rather
than keeping the old one — otherwise the ramp end silently walks back toward
laptop territory and the same regression returns. `HeroOverlay`'s measured
lockup clamp already ends at 1896px (`2.56rem/2.16vw`), which is where the
~1920 figure comes from.

**Two deliberate exceptions, both documented at their call site — don't
"fix" them into the scale:**

1. **`HeroOverlay`'s headline and scroll statements** (`src/components/design-lab/HeroOverlay.tsx`)
   keep their own bespoke `clamp()` values. They're tuned together with the
   mobile stack spacing against the geodesic model's measured position
   (~34px clearance on a 390×844 phone) — a generic scale step would graze
   the model.
2. **The About panel's lead paragraph** (`Panels.tsx`, `AboutPanel`) keeps its
   own `clamp(1.25rem,2.2vw,2rem)` at `leading-[1.45]`. It's justified running
   prose, not a heading — the scale's tightest line-height (1.2) visibly
   loosens a paragraph tuned for reading comfort.

### 3.2 Breakpoints

Only three: `sm` 640px, `lg` 1024px, `xl` 1440px. Tailwind's defaults (`md`,
`2xl`) are cleared — writing them produces no styles and fails silently.

---

## 4 · Logo & lockups

| Asset | Path | Native size |
|---|---|---|
| Wordmark (source) | `public/logo/logo.png` | 3103 × 611 |
| Wordmark (alpha mask, used in code) | `public/logo/logo-mask.png` | same ratio |

**Always rendered as a CSS `mask`, never an `<img>`** — that's what lets it
recolour per scope (`bg-fg` on dark, `bg-lab-ink` on the pale hero plate)
without a second asset. Pattern:

```css
mask-image: url('/logo/logo-mask.png');
mask-size: contain;
mask-repeat: no-repeat;
```

with a `background-color` (or `bg-*` utility) supplying the ink.

There is currently **one lockup only** — the horizontal wordmark. No stacked
lockup, no separate icon mark beyond the auto-cropped `R²` favicon glyph
(built by `scripts/favicon.mjs`, which measures the glyph out of the source
by its own alpha profile). If a stacked or icon-only lockup is ever needed,
build it as a second masked asset rather than approximating the wordmark with
CSS transforms.

**No stated clear-space or minimum-size rule exists yet in code** — treat
roughly one cap-height of clear space and ~96px minimum width as a sane
default until a real rule is set.

---

## 5 · Voice & messaging

### 5.1 One call to action, one destination

Every primary CTA site-wide reads **"Get in touch"** (`site.contactLabel` in
`src/data/site.ts`) and points at **`/contact`** — not a `mailto:`. `/contact`
carries a working form and still offers the mailto as a secondary path on the
page that owns it, so nobody loses the option.

**Why not mailto directly**: it does nothing at all for a visitor with no
desktop mail client configured, which is most people on webmail. Every CTA
that used to be a bare `mailto:` silently failed for them.

**Where a mailto is still correct** (don't unify these):
- The `/contact` page's own secondary "prefer your own mail client" link.
- Proposal reply links (`contactHref(subject)`) — each proposal needs its own
  subject line.
- The minitools `InquiryBand` composed draft — a structured pre-filled draft
  built from the generated spec, its own documented system.

### 5.2 Key strings (`src/data/site.ts`)

| Key | Value |
|---|---|
| `name` | R²χTECH |
| `nameFlat` | R²XTECH |
| `tagline` | We automate AEC. You ship faster. |
| `descriptor` | Computational automation studio for architecture, engineering and construction. |
| `contactLabel` | Get in touch |
| `contactSubject` | Project inquiry |
| `location` | Remote · Worldwide |

### 5.3 Eyebrow / label register

Set in `font-mono`, uppercase, wide tracking (`tracking-[0.2em]` to
`tracking-[0.3em]`), small (10–12px). This is the "instrument panel" voice —
system labels, not marketing copy: `SERVICES`, `PLAYGROUND`, `HOW IT STARTED`,
not "Our Amazing Services!!"

---

## 6 · Component patterns worth knowing before building a new one

### 6.1 Shape: exactly two radii

```css
--radius-surface: 0.25rem; /* container, card, field, diagram node */
--radius-control: 9999px;  /* button, chip, toggle, pill marker */
```

Consumed as `rounded-surface` / `rounded-control`. Before these existed the
site carried six radius values (`rounded-full`, `-lg`, `-xl`, `-md`, `-sm`,
bare `rounded`) mixed within single components — `ContactForm` and
`ChatWidget` each used three. The rule now has exactly two cases:

| It's a… | Use |
|---|---|
| Container, card, panel, media frame, text **field** (including a textarea) | `rounded-surface` |
| Button, chip, toggle, badge, a small circular marker | `rounded-control` |

A text field is a surface, not a control, even though it's interactive — it
holds content the way a card does, it doesn't trigger an action the way a
button does. This is the one place the rule reads as unintuitive; it's also
exactly the split that had drifted (`InquiryBand`'s pill-shaped inputs next to
`ContactForm`'s rectangular ones, for the same kind of field).

Tokens rather than reaching for Tailwind's own `rounded-sm`/`rounded-full`
directly, so the rule stays greppable: any `rounded-*` in the codebase other
than these two is a violation to fix, not a judgement call to make again.

### 6.2 Buttons, cards, entrances, focus

- **Buttons**: solid (`bg-accent text-on-accent`), outline (`border-edge
  text-fg hover:border-accent-ink hover:text-accent-ink`), ghost (text +
  underline on hover). Defined once in `CTALink.tsx` — reuse it rather than
  hand-rolling a new button. Several components used to bypass it entirely
  (`ContactForm`, `UnlockForm`, `ChatWidget`'s Build/Send, `Panels.tsx`'s
  Closing CTA), which is exactly how `text-carbon` ended up standing in for
  `text-on-accent` in five places and one widget ended up with a pill button
  next to a rectangular one.
- **Cards / grids** (`cards`, `docs`, `timeline`, `pricing`, service grids):
  drawn with `gap-px` over a `bg-edge` container, with a matching `border-edge`
  frame — the visible lines are the background showing through the gaps. This
  was `bg-line` (1.37:1) with no frame at all on one page's variant; both
  read as a single unbroken block instead of distinct cards. A half-empty
  last row still renders as a solid bar of the divider colour, so column
  count must divide item count exactly — see `blocks/cardGrid.ts`.
- **Section entrances**: always through the `Reveal` component, never a bare
  scroll listener or ad-hoc GSAP tween.
- **Focus states**: never removed. The global rule is
  `outline: 2px solid var(--color-focus); outline-offset: 3px` — if a custom
  component needs its own visible focus treatment, match this, don't invent
  a new one.

---

## 7 · What NOT to do (lessons already paid for)

1. **Don't add a second accent colour.** Tried once (lime), retired on
   purpose — see §1.
2. **Don't put amber text on a pale ground**, ever, for any reason — see §2.4.
   If it needs to be legible there, it's `--color-accent-ink`
   (which resolves to dark ink on pale), not literal amber.
3. **Don't scope a shared/chrome component by its wrapping div.** Scope by
   what it visually sits on — see §2.6.
4. **Don't add a third type scale.** If an existing token doesn't fit, that's
   a signal to reconsider the layout, not to reach for another `clamp()`.
5. **Don't wire a new CTA to a bare `mailto:`.** Point at `/contact`, or use
   `contactHref(subject)` if the destination genuinely needs its own subject
   line (proposals) — see §5.1.
6. **Don't hardcode a hex value in a component.** Every colour used above has
   a token name. If a colour you need doesn't have one, that's a `globals.css`
   change (and an update to this file), not a one-off literal. Where a
   `bg-[radial-gradient(...)]` genuinely needs the accent at low opacity, use
   `color-mix(in srgb, var(--color-accent) 6%, transparent)` inside the
   arbitrary value, not a literal `rgba(232,169,74,0.06)` — ten of those had
   drifted into the codebase as copies of the accent's hex.
7. **Don't dilute an accent border with alpha instead of using its ink
   token.** `border-accent/40` was tried more than once as "a softer accent
   border" — on the pale ground it's still 1.00:1 regardless of alpha, since
   alpha doesn't change relative luminance against an opaque background; the
   border was simply gone. `border-accent-ink` at full opacity is the correct
   softer read on every ground.
8. **Don't add a third or fourth radius for "just this one marker."** A
   checkbox, a legend swatch and a chip are all small square/round shapes
   that drifted into `rounded-md`, `rounded-[3px]`, `rounded-[2px]` and
   `rounded-sm` for what is the same conceptual object — see §6.1.

---

*Last synced to code: the contrast-and-shape redesign pass on branch
`design-corrections` — `--color-edge` fixed in all three scopes,
`--color-fg-muted` fixed in warm, `--color-danger` and `--color-lab-ink-muted`/
`--color-panel-ink-muted` added, the `rounded-surface`/`rounded-control` shape
system introduced, and the retired lime accent (`#c8f94e`) removed from
`src/minitools/lib/palette.ts`, where it had survived independently of
`globals.css` since the original brand consolidation. If `src/app/globals.css`
or `src/data/site.ts` change after this, this file is stale until someone
updates it in the same pass.*
