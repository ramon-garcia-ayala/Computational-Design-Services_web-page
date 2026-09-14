# Design system

Every client deck's CSS is lifted from `presentation/value-deck.html` by
`new-deck.mjs`. That file is the source of truth, and its comments hold the
measurements behind each rule. This page is the working summary, so decisions can
be made without reading 600 lines of CSS. If the two ever disagree, the company
deck wins; change the design there.

## Two grounds

| Ground | Markup | Carries |
|---|---|---|
| Warm charcoal | `<section class="slide">` | The argument: context, findings, program, workflow, outcomes |
| Greige | `<section class="slide pale">` | The opening, the hinge and the close |

The rhythm is the site's own: cinema, document, cinema. Three pale slides in a
nine-slide deck (cover, why it matters, next step) is the pattern. More than that
flattens the hinge.

The page behind the 16:9 frame is painted to the active slide's ground by the
engine, so letterboxing never reads as a border.

## Tokens

| Token | Warm | Pale | Use |
|---|---|---|---|
| `--carbon` | #3d3934 | #b8b4b1 | Slide ground |
| `--graphite` | #47423c | #c1bdba | Raised surface (plates, stages) |
| `--line` | #55504a | #9c9793 | Decorative hairlines only |
| `--edge` | #96918a | #625d57 | Anything a reader must see: axes, meaningful rules, field borders |
| `--fg` | #f2f4f0 | #2a2826 | Body text, headings |
| `--fg-muted` | #b4aea5 | #4a4642 | Secondary text (5.20:1 warm, 4.54:1 pale) |
| `--accent` | #e8a94a | #e8a94a | Amber: fills, figures on warm |
| `--ink-accent` | amber | #2a2826 | Accented *text*; charcoal on pale |
| `--on-accent` | #2a2826 | #2a2826 | Text on an amber fill |
| `--danger` | #ff9686 | #900e0e | Only the thing that grows or goes wrong |

## Contrast rules that bite

- **Amber is not ink on greige.** #e8a94a on #b8b4b1 is 1.00:1: identical
  luminance, invisible. On pale slides, accented text uses `--ink-accent`, which
  the `.pale` scope already sets to charcoal. Amber appears on pale only as a
  filled plate with dark ink: `.pill.solid` (7.14:1).
- **Muted text on greige has 0.9% of headroom.** Over a photographed or animated
  object it fails, which is why pale slides carrying `.bg.object` render `.lead`
  in full ink. Do not override that.
- **`--line` is decorative; `--edge` is meaningful.** If a line's absence would
  change what the reader understands (a chart axis, a divider that groups), it is
  `--edge`.
- **`--danger` is scoped.** The pale value is a dark red because the warm one is
  unreadable on greige. Use it for the cost that keeps climbing, a removed step,
  an error; never decoratively.
- **Colour is never the only signal.** Pair it with a label, a legend, a line-through
  or a position.

## Type roles

| Class / element | Font | Use |
|---|---|---|
| `h1` | Space Grotesk 600, display size | Cover line, centred statements |
| `h2` (`.wide` for longer) | Space Grotesk 600 | Slide heading, written as a claim |
| `h3` | Space Grotesk 600 | Program parts, small headings |
| `.statement` | JetBrains Mono | The hinge statement, the hero's register |
| `.lead` | Inter | One sentence of support under a heading |
| `p.note` | Inter, body size | A caption or a small paragraph |
| `.figure` / `.figure.huge` | JetBrains Mono 500, amber ink | Numbers |
| `.figure .unit` | Mono, half size, muted | Units and "vs" |
| `.figure-sub` | Mono uppercase, tracked | What a number counts |
| `.confidence` | Mono uppercase, muted | Measured / Reported / Estimate / To validate |
| `.scale-tag` (`.accent`) | Mono uppercase | Which scale a figure is read at: industry vs firm |
| `.eyebrow` (`.act`, `.meta`) | Mono uppercase, 0.3em | The act label; a system label, never ad copy |
| `.source`, `.assumptions` | Mono, small, muted | Citations and model assumptions |
| `.title-meta`, `.outcome` | Mono | Cover and closing meta lines |

## Layout

- `.body` centres vertically with auto margins, which collapse when content is
  tall, so overflow clips the end of a slide and never its opening.
- Two columns: `.split` (equal) or `.split.lean` (0.92 / 1.08, chart side wider).
- Grids of figures or parts: `.cols.c2`, `.c3`, `.c4`, with `.col.ruled` for a
  hairline above each. No boxes: hairline and air, like the site.
- Everything stacks to one column under 900px wide, and the type scale shrinks on
  viewports shorter than 780px. Check a dense slide at 1366×768.
- Shape is exactly two radii: `--radius-surface` (plates, fields) and
  `--radius-control` (pills, buttons).

## Imagery

- **Only the studio's own images.** Stock photography contradicts a studio selling
  its own judgement.
- **Studio images come from the site's `public/`, never a copy.** The geodesic
  sequence `geodesic-01/webp/frame-0001..0096.webp` (cover still frame 20,
  closing still frame 77), the wordmark `logo/logo-mask.png`, and project renders
  under `projects/projects-tabs/<project>/`. A darker or re-cropped version is
  CSS on the original (a `linear-gradient` layer in the same `background-image`,
  `background-position`), not a re-exported file.
- **An image must belong to the claim on its slide, or not be there.** A photo of
  unrelated work beside a client's result reads as "this is their project" and was
  rejected in review. Plain ground, a particle field or a figure drawn from the
  slide's own numbers are all better than a picture that does not belong.
- **The client's own images** (site photos, their drawings) only with permission,
  stored in `clients/<slug>/assets/`. Never another client's material.
- **Photos need a scrim,** chosen by where the text sits: `.scrim.dark` for text on
  the left, `.scrim.even` for text on both sides, `.scrim.darker` for dense text;
  on pale, `.scrim.pale-veil` or `.pale-veil.strong`.
- **`.bg.object` is only for the 4:3 geodesic frames:** it sizes by height and
  masks the left seam. Plain `.bg` is for 16:9 photos and is feathered into the
  ground automatically.

## Motion

- **Every motion has a job:** the geodesic breathes on the cover and closing, a
  slider sweeps to show growth, counters count, reveals settle. Nothing else moves.
- **Motion runs only while its slide is on screen and restarts on entry.** The
  presenter lands on a slide and the motion starts from its beginning.
- **Reduced motion shows the end state,** never a frozen middle. The engine does
  this for everything it drives; a bespoke figure must do the same.
- **Sliders accelerate into their limit** (cubic ease-in). An ease-out tail was
  tried and cut because slowing into the limit undersold the growth.
- **Ranges match the client's scale.** A revenue track to $1bn left a $50M firm in
  the first few percent, where nobody could drag to it.
- **Bespoke figures draw the slide's own data** and stay deterministic (a seeded
  generator, never `Math.random()` for anything that must look the same twice).

## Never

- An em dash in copy, notes, labels or titles.
- Amber text on a pale slide.
- A photo that is not the studio's own, or not about the slide's claim.
- Another client's name, detail or process.
- A number without a source in the analysis and a confidence label.
- More than one thesis on a slide.
- A new colour token or a third radius.
