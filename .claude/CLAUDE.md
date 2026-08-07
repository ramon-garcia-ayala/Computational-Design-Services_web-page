# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

**Write everything in this repo in English** — code, comments, docs, commit
messages. The team does not read Spanish.

## Commands

```bash
npm run dev      # dev server on localhost:3000
npm run build    # production build (also runs the TypeScript check)
npm run lint     # ESLint
npm run start    # serves the production build
```

There are no tests. TypeScript errors surface on `npm run build`.

## Stack

- **Next.js 16.2.9** — App Router, TypeScript, everything static (`○ Static` / `● SSG`)
- **React 19.2.4** — R3F 9 requires `react >=19 <19.3`; don't bump React without checking that peer
- **Tailwind CSS v4** — CSS-only configuration, there is no `tailwind.config.ts`
- **GSAP 3.15 + ScrollTrigger** and **`@gsap/react`** (`useGSAP`)
- **Lenis 1.3** — smooth scroll
- **React Three Fiber 9 + three 0.185** — hero only, lazy loaded
- **clsx + tailwind-merge** — through `cn()` in `src/lib/utils.ts`

## Tailwind v4: the critical difference

Every token lives in the `@theme {}` block of `src/app/globals.css`. There is no
config file and no `theme()` function. Colours are consumed as utilities
directly:

```css
@theme {
  --color-carbon: #0a0c0b;
  --color-accent: #c8f94e;
  --font-display: var(--font-sora);
}
```

Used as `bg-carbon`, `text-accent`, `font-display`.

**Breakpoints**: the project has only `sm` (640), `lg` (1024) and `xl` (1440).
Tailwind's defaults are cleared with `--breakpoint-*: initial`, so `md:` and
`2xl:` **do not exist** — writing them produces no styles and fails silently.

Project utilities defined in `globals.css`: `.shell` (page container), `grid-bg`
(background grid) and `reveal-init` (initial state for anything GSAP animates).
Note `.shell` is a plain class, not an `@utility`, so it takes no variants:
`lg:shell` does nothing.

## Architecture

Multi-page App Router site, split into two route groups so the client-facing
proposals don't inherit the site navigation:

| Route | File |
|---|---|
| `/` | `src/app/(site)/page.tsx` |
| `/about` | `src/app/(site)/about/page.tsx` |
| `/projects` | `src/app/(site)/projects/page.tsx` |
| `/projects/[slug]` | `src/app/(site)/projects/[slug]/page.tsx` (`generateStaticParams`) |
| `/labs` | `src/app/(site)/labs/page.tsx` (placeholder) |
| `/labs/tool` | `src/app/(site)/labs/tool/page.tsx` (a generated mini tool) |
| `/<proposal-slug>` | `src/app/(proposal)/[proposal]/page.tsx` (`generateStaticParams`) |
| `/unlock` | `src/app/(proposal)/unlock/page.tsx` |
| `/api/proposal-unlock` | `src/app/api/proposal-unlock/route.ts` (checks the password) |
| `/api/minitools-chat` | `src/app/api/minitools-chat/route.ts` (the hero assistant) |

Everything is static except those two route handlers and `src/proxy.ts`.

The root layout holds only what must never be duplicated: `<html>`, the fonts and
the single Lenis instance. `(site)/layout.tsx` adds the header and footer;
`(proposal)/layout.tsx` deliberately does not.

**The data layer** (`src/data/`) holds all copy and all figures. Never hardcode
text in a component. See the table in `README.md`.

**To add a project**: add an entry to `projects` in `src/data/projects.ts`. The
grid, the static route, the horizontal-scroll detail page and the next-project
navigation all come from it. `featured: true` also surfaces it on the home page.

## Client proposals

Each proposal is a standalone page at the site root (`/05.08.2026_ecogen`,
format `DD.MM.YYYY_client`) and excluded from search engines.

**Layout.** One folder per proposal, named after its slug, so the URL and the
folder match one to one. Attachments live under `public/proposals/<slug>/`.

```
src/data/proposals/
  index.ts                     registry — adding an entry generates the route
  types.ts                     the block union
  access.ts                    passwords
  05.08.2026_ecogen/index.ts
public/proposals/
  29.06.2026_ecogen/header.gif
```

**To add one**: create the folder with an `index.ts` and register it in
`index.ts`. A proposal is a list of typed blocks — `prose`, `steps`, `flow`,
`split`, `cards`, `checklist`, `qa`, `table`, `stats`, `pricing`, `docs`,
`timeline`, `note` — mapped to components by `ProposalRenderer`. To add a new kind, extend the union
in `types.ts`, write the component under `blocks/`, and wire it into the switch;
that switch is the only place a kind maps to a component.

**Every listed block needs a short `kicker`.** The side index labels each entry
with `kicker ?? title`, so a block without one falls back to its full heading
and that single entry runs the width of the rail while the rest are a word or
two. `note` is the easy one to forget, since it draws no eyebrow and its kicker
therefore reaches nothing but the index. Use `unlisted` for a block that should
not appear in the rail at all.

**Picking a block matters.** `flow` defines a *process*: stages, the
configuration each one reads, and what passes between them. It deliberately
carries no build status. Status belongs in `split`, whose solid and dashed
columns already mean done versus planned, and keeping the two apart is what lets
the diagram describe the pipeline without arguing about how much of it exists.
`split` earns its two tones again on a primary-versus-alternative tool list:
committed versus available on request. For a short linear sequence with no
configuration or artifacts to show, `steps` is lighter than `flow`, and it
carries two layouts of its own: `flow` chains the numbered markers left to right
from `lg` up, which is how a pipeline should read and costs a fraction of the
height; `list`, the default, keeps them in a numbered column, which is right for
actions the reader has to take rather than a chain. `checklist` is for items the
client has to hand over or tick off: grouped by category, each with an empty box
and each group with its count, so the reader sees how much is outstanding.
`cards` would flatten exactly that — a grid gives every item equal weight and
hides the total.

**The card grids have no borders.** `cards`, `docs`, `timeline`, `pricing` and
the `prose` checklist draw their dividers with `gap-px` over a `bg-line`
container: the lines you see are the background showing through the gaps. So a
half-empty last row is not blank, it renders as a solid bar of border colour.
The column count must divide the item count exactly, which is what
`blocks/cardGrid.ts` works out — use it rather than hardcoding `sm:grid-cols-2`,
and remember that adding one card to an even set changes the layout.

**Access control** runs in `src/proxy.ts`, before the page is served. Never move
this check to the client: these pages are SSG, so their HTML already carries the
whole document and a client-side check would protect nothing. Passwords are
stored as salt + SHA-256 in `src/data/proposals/access.ts`, generated with
`scripts/proposal-password.mjs`. Never write a password in clear text next to its
hash. A slug with no entry is open to anyone with the link — the two June 2026
proposals are deliberately open, and they carry pricing, so treat their URLs as
public. Production needs `PROPOSAL_SECRET`; without it, protected proposals stay
closed (fails safe).

**The flow diagram** (`FlowDiagram.tsx`) is drawn by hand in the site's own
visual language — don't reach for Mermaid. Config chips and artifact labels are
derived from the edges rather than listed separately, so adding an edge is the
only thing you do. The artifact label sits *on* the connector, not between two
cards, so the rail is never interrupted; the rail stretches to the label's
height for the same reason.

It is a Server Component with no animation of its own. An earlier version
hand-rolled per-stage ScrollTriggers, which silently never ran and left the
whole diagram blank — entrances go through `Reveal`, as everywhere else on the
site, and a block component has no business owning scroll animation.

## The assistant and its mini tools

`src/minitools/` is a self-contained module: the chat in the hero, the API
behind it, and the pages it generates. Nothing outside it imports from it except
`ChatPlaceholder` and the two routes, which is deliberate — it is meant to be
liftable into a package when the other site wants it.

```
src/minitools/
  schema/     spec union, parameter registry, JSON Schema, validation
  lib/        URL encoding, SSE reader, rate limit, geometry helpers
  server/     API key, prompts, the route handler
  components/ chat widget, viewer, param panel, proposal page
  data/copy.ts  all the words
```

**Two models, and the visitor between them.** Haiku 4.5 holds the conversation
and decides when there is enough to build on; its tool call is a *proposal* —
the server emits a `confirm` frame and stops, the widget shows a card, and only
the visitor's yes sends the `build` request that pays for Sonnet 5. Typing
another message instead dismisses the card: continuing the conversation is
declining. Small talk therefore never touches the expensive model, and neither
does a proposal nobody confirmed. Both calls live in `server/chat-handler.ts`.

**The model writes data, never code.** It fills in one of five archetypes —
`facade`, `massing`, `layout`, `freeform`, `pitch` — through structured outputs.
Even `freeform`, which looks the most open-ended, is a bounded scene graph of
five primitives that `lib/scene.ts` walks; there is no evaluator anywhere, which
is the only reason it is safe to render generated content on this domain.

**`pitch` is the one that keeps the promise.** Some requests cannot honestly be
demonstrated in a browser — they need an uploaded DWG, a Revit session, the
client's own data. Rather than refuse, the assistant scopes the work and the
page renders a short proposal instead. The router prompt says so explicitly:
never end a conversation empty-handed.

**`registry.ts` is the single source of truth for ranges.** The sliders, the
clamping in `validate.ts` and the bounds written into the JSON Schema are all
derived from it. Widen a range there, not in three places.

**Everything is validated twice.** `parseSpec` runs on the model's output *and*
on whatever comes out of the URL, and it clamps rather than rejects — someone
who edits a number in the address bar should still see their tool. It only
returns `null` when there is no usable `template`.

Two exceptions to "clamp, don't reject", both deliberate. A binding whose node
index is out of range is *dropped*: clamping it would hand the slider to
whichever node sits at the end of the scene, and a control labelled "Roof
pitch" quietly rotating something else is worse than one that does nothing.
And a clamped value that lands back in a *loop bound* has to be re-clamped
where it is applied — `resolveScene` caps `repeat.count` at `LIMITS.repeatCount`
again, because a binding is `value * factor + offset` and both sides of that
reach a thousand. Every other bindable property ends in a transform, where an
absurd number is only absurd to look at; that one ends in a `for`.

**The spec travels in the URL fragment** (`/labs/tool#v1z.<deflated base64url>`),
so the page stays static and a link carries its tool with it. Two consequences
worth remembering: the fragment never reaches the server, and it is not a
selector — `SmoothScroll` has to guard its `querySelector(hash)` or Lenis throws
on every one of these links and takes the whole page's reveals with it.

`MAX_PAYLOAD_CHARS` is sized for the *uncompressed* fallback, not the deflated
form. A 48-node scene deflates to under a kilobyte and runs to some 17 KB
written plain, and plain is the branch a browser without `CompressionStream`
takes — a cap that only fits the deflated size would let those browsers
generate links nobody could open, including their author on the next reload.

**The sessionStorage handoff is for the arriving read only.** Nothing ties the
stash to a particular link, so `ToolViewerPage` consults it on mount and only
when there was a fragment that failed; applied to any failed decode it answers
a stranger's broken link with whatever this tab generated last, and the slider
writeback then rewrites the address bar to match.

**The viewer's canvas leaves `frameloop` on the default.** `"demand"` is the
obvious choice for a scene that only changes on input, and it fails here: R3F
drives every root from one global animation frame that shuts down on any tick
where nothing asks for work, and it reliably stops in the gap before this root
goes active. The tool then renders nothing until the visitor happens to drag it.
`StartRenderLoop` in `ViewerCanvas` kicks it once after mount for the same
reason — without that, even the default frameloop starts out stalled.

**A camera with a `position` still looks down -Z.** Every template builds itself
around the origin, so `ViewerCanvas` calls `camera.lookAt(0, 0, 0)` in
`onCreated`. Without it the framing misses the model entirely.

**Geometry and material go in as children, not as `args`.** Disposing memoized
three.js objects from an effect breaks under StrictMode, whose second mount
reuses what the first mount's cleanup destroyed. Let R3F own the lifecycle.

**Anything scrollable or draggable inside the panel needs `data-lenis-prevent`** —
the message list and the canvas both carry it. Lenis owns the wheel everywhere
else, so without it reading a reply scrolls the page instead.

**`ChatPlaceholder` needs a *definite* height at every breakpoint**, not a
`min-h-*`. The message list is `flex-1 overflow-y-auto`, and in an auto-height
column flex container that resolves to the content's own height: the list never
overflows, never scrolls, and the panel grows with the conversation instead —
pushing every section below the hero down mid-chat, leaving the newest reply
under the fold, and making both `data-lenis-prevent` and the scroll-to-bottom
effect no-ops. Above `lg` the aspect ratio supplies the height; below it a
bounded `svh` does.

**An empty turn never goes to the API.** The router answers a ready-enough
message with a tool call and *no text at all*, which leaves the widget holding a
blank assistant entry. `historyOf` filters those out and the route drops them
rather than rejecting the payload — an empty message the API will not accept,
answered with a 400, poisons every later request in the conversation including
the build the visitor just confirmed. The two sides agree on the caps through
`lib/chat-limits.ts`; enforce a new one in both places or not at all.

**`readSseStream` awaits its handlers.** `onSpec` has to encode the spec into a
link before it can finish, so when the reader resolves, every handler it fired
has run. Anything the caller does after the stream — the widget prunes the
empty entry there — would otherwise race the handler that fills it.

**The transcript is `aria-live="off"`.** Announcing it as it streams reads the
same reply back in overlapping fragments, once per SSE delta; the finished turn
is mirrored into a `role="status"` region instead, together with the
confirmation question. For the same reason the build timer is `aria-hidden` —
it ticks ten times a second inside an atomic live region. And the input is
`readOnly` rather than `disabled` while a turn is in flight: disabling the
focused element blurs it, and the browser drops focus to `<body>` on every
single message.

`ANTHROPIC_API_KEY` is read only in `server/anthropic.ts` and fails closed: no
key means 503 and a chat that says it is offline. There is no development
fallback, unlike `PROPOSAL_SECRET`.

**The first build of each archetype can take minutes.** Structured outputs
compiles a new JSON Schema once (then caches it for 24h server-side); the pitch
schema has been observed at 110 s on first use. Three consequences already
handled — keep them: a failed build restores the confirmation card so retrying
is one click; `closingLine` drops the seconds figure above 30 s rather than
bragging about a slow one; and the same-tab handoff also passes the spec
through `sessionStorage` (`lib/handoff.ts`), so the tool page never shows the
invalid-link screen to the visitor who just generated it.

## Animation conventions

- **GSAP registration**: always import `gsap`, `ScrollTrigger` and `useGSAP` from
  `src/lib/gsap.ts`. Registering the plugin in more than one place duplicates
  instances and leaves ScrollTriggers uncleaned.
- **Section entrance**: use the `Reveal` component (`src/components/ui/Reveal.tsx`).
  It is the only way appearances are animated on this site. The `stagger` prop
  staggers children; in that case the children carry the `reveal-init` class and
  the container does not.
- **Always `useGSAP` with `{ scope: ref }`**, never a bare `useEffect`: the scope
  cleans up tweens on unmount and survives StrictMode's double render.
- **Lenis** is instantiated once in `src/components/providers/SmoothScroll.tsx`
  and driven from the GSAP ticker. Do not create another instance or another
  `raf`.
- **Anchor jumps must go through Lenis.** A native hash jump moves the document
  without Lenis knowing, so ScrollTrigger still thinks it is at the top and
  nothing reveals — the page looks blank. `SmoothScroll` handles this with the
  `anchors` option plus an initial jump for URLs that arrive with a hash.
- **A URL that arrives with a hash is a second, separate trap.** By the time the
  reveals are created the browser has already scrolled past the landing section,
  which therefore never receives the scroll event its trigger waits for and
  stays invisible. `Reveal` settles anything at or above the landing point
  immediately when the page loaded on an anchor, and animates the rest as usual.
  Proposals link to their own sections, so real readers hit this, not just
  people pasting deep links — test any new animated block by loading its anchor
  directly, not only by scrolling to it.
- **Settling means writing the end state, never `clearProps: "transform"`.**
  Clearing hands control back to `reveal-init`, whose entire job is to hold the
  element 24px low, so the element settles *offset*. It reads as a rendering
  fault rather than an animation one: on the `gap-px` card grids it uncovers a
  bar of border colour along the top of the grid.
- **Breakpoints in JS**: use `gsap.matchMedia()` (see `HorizontalScroll.tsx`), not
  resize listeners.

## prefers-reduced-motion

`src/lib/useReducedMotion.ts` is the single source of truth. When it returns
`true`:

1. Lenis is not instantiated and scrolling goes back to native
2. Tweens are replaced by their end state, with no `scrub` and no `pin`
3. The hero's R3F scene is not mounted

`globals.css` also has a `@media (prefers-reduced-motion: reduce)` block for
anything animated in CSS. **Every new animation must go through this hook or that
block.**

**Hydration trap**: on the hydration render the hook returns `false` (the server
cannot know the preference), so the first effect may run as if there were no
reduction and then be reverted. Two practical consequences:

- If an effect **mutates the DOM** (writing a `textContent`, creating a `pin`),
  the reduced-motion branch must **restore the end state explicitly** rather than
  just returning early. See `StatItem.tsx` and `FlowDiagram.tsx`.
- For animations that are expensive to revert, such as a `pin`, put the
  preference inside the `gsap.matchMedia` condition itself
  (`"... and (prefers-reduced-motion: no-preference)"`), which is evaluated when
  the effect runs so the pin is never created. See `HorizontalScroll.tsx`.

## Hero and LCP

`src/components/sections/home/Hero.tsx` is a Server Component: tagline, subcopy
and the chat slot ship already rendered in the HTML.

- `ChatPlaceholder` (`src/components/ui/ChatPlaceholder.tsx`) is **deliberately
  empty**. It reserves height and position for the Phase 2 chatbot. When
  implementing it, keep the container's dimensions so the LCP doesn't move.
- `HeroCanvas` imports the scene with `dynamic(..., { ssr: false })` and mounts it
  in `requestIdleCallback`, after first paint. That keeps `three` out of the
  initial bundle. Do not turn it into a static import.
- `HeroScene` must stay cheap: one geometry, basic material, no lights, no
  post-processing, `dpr` capped at 1.5.

## Horizontal scroll

`src/components/sections/project/HorizontalScroll.tsx` pins the section and moves
the panel row along X with `scrub`. Below 1024px, or with reduced motion, the
panels stack vertically and no ScrollTrigger is created.

## Contact links

Every mailto goes to both partners at once, built by `contactHref()` in
`src/data/site.ts`. **Never render the address as visible text** — CTAs use
`site.contactLabel` ("Get in touch"). This keeps the addresses out of the page
for spam harvesters.

## Deployment

Vercel project `computational-design-services`, deploying `main` from
`ramon-garcia-ayala/Computational-Design-Services_web-page`. The state before
this site replaced it is kept on the `archive/pre-rewrite` branch.

**`vercel.json` must stay.** The project's framework preset is `null` on Vercel,
so that one-line file is the only thing telling it to build as Next.js. Deleting
it does not fail the build — the deployment reports READY and then every route
404s, which is a slow thing to diagnose. The tell is in the deployment metadata:
a real Next.js build records `lambdaRuntimeStats` and `bundler`, and a broken one
records neither.

`PROPOSAL_SECRET` is set in the project's environment variables. Environment
variables do not apply to deployments that already exist, so after changing one,
redeploy.

**Local builds can fail with `EPERM` on `.next/types`** while VS Code is open —
its TypeScript server holds the directory, and `tsconfig.json` includes it. Close
the editor, or verify with a build from a clean clone instead.

## GIF recording (visual verification)

1. Have the server running (`npm run dev`).
2. Load the schema with `ToolSearch select:mcp__claude-in-chrome__gif_creator`.
3. Capture extra frames before and after each action.
4. Name the file descriptively (`hero_and_menu.gif`,
   `project_horizontal_scroll.gif`).
