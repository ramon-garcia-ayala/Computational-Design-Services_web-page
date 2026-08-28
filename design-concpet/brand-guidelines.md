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
| `--color-edge` | `#5a6368` | **Field borders, focus-adjacent UI** | 3.19:1 — clears WCAG 1.4.11 |
| `--color-fg` | `#f2f4f0` | Primary text | 17.7:1 |
| `--color-fg-muted` | `#8a918c` | Secondary text | 6.08:1 |
| `--color-accent` | `#e8a94a` | **Fill only** — solid buttons, plates | 9.53:1 (as ink here too, but see §2.5) |
| `--color-accent-dim` | `#c8913a` | Hover/pressed state of the accent | 7.07:1 |
| `--color-accent-ink` | `#e8a94a` | Accent **as text/hairline/border** | same as accent on this ground |
| `--color-on-accent` | `#2a2826` | Ink sitting ON a filled accent plate | 7.14:1 |
| `--color-focus` | `#e8a94a` | Keyboard focus ring | 9.53:1 |

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
| `--color-fg-muted` | `#a8a29a` | 4.53:1 |

Accent on this ground: `#e8a94a` on `#3d3934` = **5.57:1** — safe as ink.

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
| `--color-edge` | `#66615b` | 2.98:1 vs this ground (`#5a6368` only read 1.40:1 here) |

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
| `text-display` | `clamp(2.4rem, 5.6vw, 4.6rem)` | 1.05 | -0.02em | The largest heading on a panel/page (Services, Featured, project H1) |
| `text-h1` | `clamp(2.1rem, 4.8vw, 3.9rem)` | 1.08 | -0.02em | Stat figures, closing-panel body, FinalCTA heading |
| `text-h2` | `clamp(1.75rem, 3.4vw, 2.75rem)` | 1.12 | -0.015em | `SectionHeading`, sub-panel headings |
| `text-h3` | `clamp(1.35rem, 2.2vw, 1.85rem)` | 1.2 | *(none set)* | Card-level headings inside a horizontal-scroll panel |
| `text-lead` | `clamp(1.15rem, 1.5vw, 1.5rem)` | 1.55 | *(none set)* | Reserved — defined, not yet consumed anywhere in the codebase |

Usage: `className="text-display font-display font-semibold text-fg"` — the
token supplies size/line-height/letter-spacing; add `font-display` and a
weight utility on top.

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

- **Buttons**: solid (`bg-accent text-on-accent`), outline (`border-line
  text-fg hover:border-accent hover:text-accent`), ghost (text + underline on
  hover). Defined once in `CTALink.tsx` — reuse it rather than hand-rolling a
  new button.
- **Cards / grids** (`cards`, `docs`, `timeline`, service grids): borderless,
  drawn with `gap-px` over a `bg-line` container — the visible lines are the
  background showing through the gaps. A half-empty last row renders as a
  solid bar of border colour, so column count must divide item count exactly.
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
   change (and an update to this file), not a one-off literal.

---

*Last synced to code: Direction A · Instrument implementation, branch
`design-corrections`. If `src/app/globals.css` or `src/data/site.ts` change
after this, this file is stale until someone updates it in the same pass.*
