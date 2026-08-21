# R²χTECH — Design Lab Build Spec
Handoff document for Claude Code. Target: isolated test route inside the existing Next.js repo, to be merged into the live site once approved.

---

## 1. Goal

Build a standalone route, `/design-lab`, inside the existing `(site)` route group (or as a sibling route group with zero shared chrome — see §2). This route is a sandbox to prototype the new scroll-driven visual identity before porting it into `Hero.tsx` and the rest of `sections/`. Nothing here touches the live pages until explicitly merged.

## 2. Route setup

- Path: `src/app/(site)/design-lab/page.tsx` (or `src/app/design-lab/page.tsx` outside both existing groups if we want zero risk of inheriting `(site)`'s header/footer layout — recommend the latter, since this page will define its own full-bleed chrome).
- No header/footer from the existing site layout — this page owns 100% of its viewport.
- Reuse existing installed deps only: GSAP + ScrollTrigger, Lenis (via the existing `SmoothScroll` provider pattern in `providers/`), React Three Fiber (only if/when we move from prerendered video to a live 3D scene — not needed for v1).
- All animation must go through the existing `useGSAP({ scope: ref })` convention — no bare `useEffect` tweens, per repo conventions.
- Respect `useReducedMotion.ts` — provide a static-frame fallback (see §6).

## 3. Design tokens (add to `@theme{}` in `globals.css`, scoped or global — TBD on merge)

| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#C2BEBB` | Page background. Measured directly from the reference video's corner pixels (avg RGB 194, 190, 187) so the video canvas and page background are seamless — no visible frame edge. |
| `--color-structure` | charcoal, near `#2A2826` (sample precisely from reference stills before final) | Wireframe / field-line color |
| `--color-accent` | warm amber/gold, near `#E8A94A`–`#F4C572` range (sample from glow nodes) | Pulse nodes, hover states, active indicators, loading/progress elements |
| `--color-panel` | contrasting tone, distinct from `--color-background` (per OPTIMIND reference — likely a deeper charcoal or a lighter warm white; confirm exact value against final palette refs before build) | Full-bleed content panels (§5) |

Typography: minimal, wide letter-spacing, uppercase sans-serif for headings/nav (per OPTIMIND references), small technical-feeling label text (e.g. section counters like "003 / 005") in a monospace or condensed style for the HUD feel.

## 4. Core visual: the geodesic field shape

Reference asset: torus-like geodesic mesh sculpture, charcoal field lines over the warm greige background, with amber-gold light traveling along the lines and pulsing at intersection nodes. This shape is the persistent visual thread across the entire scroll experience — it does not disappear, it morphs.

**v1 implementation = prerendered video, scroll-scrubbed** (not a live R3F scene — that's a possible v2 upgrade, not required now):

- Video source(s): Kling-generated MP4s, currently 3 uploaded (more may follow — treat the segment count as configurable, not hardcoded to 3).
- Each video shows the same shape morphing between distinct "poses" (e.g. bean/kidney form → vertical torus with visible hole). Videos are ~5–6s, 24fps, 1660×1244.
- **Scrubbing mechanism**: bind `video.currentTime` to GSAP ScrollTrigger progress within each segment's trigger zone:
  ```js
  gsap.to(videoEl, {
    currentTime: videoEl.duration,
    ease: "none",
    scrollTrigger: {
      trigger: segmentEl,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
  ```
- Use `preload="auto"`, `muted`, `playsInline`. If seek performance is choppy on the actual MP4 (common with long-GOP h264), fall back to an exploded PNG/WebP frame sequence drawn to `<canvas>` per scroll-progress frame index — flag this as a decision point once the real videos are in and tested, don't pre-optimize.

## 5. Landing state — Video A behavior

1. On page load, Video A (the geodesic sphere) autoplays.
2. If the user has not scrolled, it loops seamlessly (this requires the clip's first and last frame to match, or a crossfade loop point — confirm which Kling clips are authored as seamless loops vs. A→B transition clips).
3. On first scroll input:
   - If playback is mid-loop, do **not** cut — fast-forward (`gsap.to(videoEl, { currentTime: duration, duration: short, ease: "power2.out" })`) to the loop's end point first.
   - Once at the end, hand off directly into the scroll-scrubbed segment (§4) with no visible seam — the next segment's first frame should match this video's last frame.

## 6. Content panels — full-bleed morph

Repeating page structure: **video segment → content panel → video segment → content panel → ...** (segment count driven by content, not fixed).

- Panel is a solid full-bleed div using `--color-panel` (contrasting color, confirmed against OPTIMIND-style reference — distinct from the video's greige so the transition reads clearly).
- **Scroll-scrubbed, not one-shot**: panel morphs upward covering the viewport as the user scrolls into its trigger zone, and reverses smoothly if the user scrolls back up. Implement as a GSAP `scrub: true` ScrollTrigger animating `clipPath` or `transform: translateY()` on the panel element, tied 1:1 to scroll progress — same mechanism family as the video scrubbing, so both feel like one continuous system.
- Suggested morph: panel starts translated fully below viewport (`translateY(100%)`) or clipped via `clip-path: inset(100% 0 0 0)`, animates to `translateY(0)` / `inset(0 0 0 0)` as it covers the screen, holds briefly for content readability (via ScrollTrigger `end` distance / pin if needed), then continues the same scrub logic in reverse or continues off the top as the user keeps scrolling, revealing the next video segment underneath already primed at its starting frame.
- Content inside panels comes from `data/` per existing repo convention — never hardcode copy in the component.

## 7. Reduced motion fallback

Per repo convention (`useReducedMotion.ts` + CSS media block): when reduced motion is active, skip video scrubbing and panel scroll-morphs entirely. Show a static hero frame (last frame of Video A) and render panels in a normal static stacked layout with a simple fade, no scroll-linked transforms.

## 8. Open items (pending final assets/decisions)

- [ ] Exact `--color-structure` and `--color-accent` hex values — sample from final reference stills once palette is locked.
- [ ] Exact `--color-panel` value.
- [ ] Final video count and sequence order (currently 3 uploaded, more possibly coming — build the segment system to accept N videos, not hardcoded to 3).
- [ ] Confirm which video transitions are true seamless loops vs. hand-off points.
- [ ] Decide if any videos need re-export as frame sequences for scrub performance (test on real hardware once in `/design-lab`).

## 9. Explicitly out of scope for v1

- Live R3F/WebGL rebuild of the shape (video-based only for now).
- Merging into the live site — this stays isolated at `/design-lab` until approved.
- Final copy — panels use placeholder content from `data/` stubs until copy is ready.

---

## 10. Preloader (built directly on main — not design-lab scoped)

Plays once on a fresh load of Home only (not on internal nav back to Home, not on other routes). Blocks scroll/interaction until complete. Total duration ~2.7s.

- **Asset**: logo at `public/logo.svg` (preferred) or `public/logo.png` — logo shape on transparent background, used as a CSS mask.
- **Structure**: full-viewport fixed black (`#0a0a0a`) overlay, centered container sized to logo aspect ratio (source 760×149), responsive up to ~600px wide. A grid of cells (`grid-template-columns: repeat(52, 1fr)`, `grid-template-rows: repeat(10, 1fr)`, raise density on wide viewports) is masked to the logo shape via `mask-image` / `-webkit-mask-image` pointing at the logo file, `mask-size: 100% 100%`, `mask-repeat: no-repeat`.
- **Animation**: each cell gets an independent random resolve time between 250–1500ms. Before resolving: renders a random glyph from `{ } < > / \ ; : # 0 1 * + = ~`, white, monospace ~11px, re-randomized every frame. At resolve: cell flips to solid white, glyph cleared. At 1600ms: force all cells solid (clean logo). Hold 550ms, fade overlay out over 600ms revealing Hero underneath (Hero's first frame must already be preloaded so there's no gap).
- Driven by `requestAnimationFrame`, cleaned up on unmount. Respects `useReducedMotion.ts` — reduced motion skips the scramble, shows a simple fade instead. Fade uses `useGSAP({ scope: ref })` per repo convention.
- Reference implementation: `rxtech_preloader_inside_logo_mask.html` (attached separately) — port the same timing/glyph logic to a React component.
- **Status**: already implemented by Claude Code directly on the main branch (not `/design-lab`) — functional, revisit only if issues surface.

---

## 11. Home page — final architecture

Corrects and supersedes any earlier section ordering. The geodesic shape is **Hero-only** — it does not persist as a thread across the whole page. Once its scroll-driven frame sequence ends, continued scrolling hands off entirely to solid full-bleed panels for the rest of the page.

1. **Preloader** — see §10.
2. **Navigation** — hamburger icon (two horizontal lines), top right, persistent. Opens to reveal nav content (not a visible always-on tab bar). Links: Home, About us, Projects, Contact, Labs.
3. **Hero** — geodesic video/frame sequence as background. On load: logo lockup + headline + description, left-aligned, appear immediately over the video. As the user scrolls through the frame sequence, two additional short statements appear at specific frame ranges (see below), positioned right and left respectively, replacing/overlaying the primary statement area without cluttering it.
4. **Hero → panel transition** — once the frame sequence reaches its end, continued scrolling triggers a full-bleed panel (scroll-scrubbed, reversible, per §6 of this doc) that morphs up from the bottom and fully covers the video background. The geodesic video does not linger once its sequence completes.
5. **Services brief** — first panel. Services rendered horizontally with distinct per-service shapes (style reference: OPTIMIND service-card video, each service gets its own icon/shape treatment).
6. **Labs / Playground teaser** — next panel. Existing component (built by Ramon): "ASSISTANT" chat card with quick-prompt pills, wireframe geodesic sphere animating behind it, text input + "SEND" button. **Action needed**: swap the current green/olive accent (live-status dot, button fill, active/hover states) to the site's amber accent token (`--color-accent`, ~`#E8A94A` family). Layout, copy, and background animation stay as-is. Widget is centered within its panel.
7. **Featured work** — panel present but left blank/placeholder for now.
8. **About teaser** — panel. Copy (final): "R²XTECH was founded by two architects who met at IAAC in Barcelona, studying computational design. We saw an industry where automation and AI were still on the sidelines, and built a studio to put them at the center."
9. **Closing CTA** — panel. Copy (final): "We're already thinking in code. Let's think about your project next." Button: "Contact us →" linking to `/contact`.
10. **Footer** — matches existing screenshot reference: logo lockup + tagline ("Computational automation studio for architecture, engineering and construction."), "Get in touch" link, Site links (Home / About us / Projects / Contact / Labs), Elsewhere links (LinkedIn / GitHub / Instagram), copyright line, "Remote · Worldwide" label. **Action needed**: swap "Get in touch" link color from green to the site's amber accent token, matching §6 above.

### 11.1 Hero copy (final)

- **Headline**: "Architecture, computed."
- **Description**: "We are a computational studio embedded in architecture, engineering, and construction. We build the parametric pipelines, model automations, and AI-driven systems."
- **Scroll statement 1** — frame range 20–45, right side: "Complexity, computed."
- **Scroll statement 2** — frame range 60–96, left side: "Design that scales itself."

### 11.2 Services brief copy (final, placement: panel §5)

1. **Computational Design** — Parametric modeling and generative workflows that turn design intent into explorable, optimizable systems.
2. **Design Automation** — Custom tools and scripts that eliminate repetitive work across your studio's modeling, documentation, and delivery pipeline.
3. **AI-Driven Design Tools** — AI-assisted generation, analysis, and decision-making built directly into your design process, from massing studies to facade systems.
4. **Custom Software & Plugins** — Bespoke Grasshopper, Revit, and Rhino tooling built for your specific studio workflow, not off-the-shelf.

### 11.3 Open items

- [ ] Exact frame numbers for scroll statements 1 & 2 depend on final video/frame-sequence length — confirm once assets are locked, adjust the 20–45 / 60–96 ranges proportionally if frame count changes.
- [ ] Per-service shape/icon treatment for the Services panel — needs visual exploration, not yet designed.
- [ ] Featured work content — intentionally deferred, revisit once real projects are ready to showcase.
- [ ] Full About page (beyond the Home teaser) — not yet written.

---

## 12. Round 2 fixes — /design-lab visual review

Findings from the first working review of `/design-lab`. All scoped to `/design-lab` only, per §9 — do not touch the live site. Do not touch the existing scroll-driven frame/canvas scrubbing logic for the geodesic sequence; these are additive/styling fixes around it.

1. **Typeface** — current font doesn't read as technical and doesn't relate to the logo's geometric letterforms. Choose and apply a sharper, geometric/technical typeface site-wide (headline, body copy, scroll statements) — one consistent family, not per-section.
2. **Logo** — the header currently renders "R²XTECH" as plain text instead of the actual logo asset (`public/logo.svg` / `logo.png`, per §10). Replace with the real logo file, sized larger than current.
3. **Headline** — "Architecture, computed." must render on a single line at the viewport widths being tested; currently wraps to two lines.
4. **Hero description paragraph** — set to justified text alignment, not ragged-left.
5. **Hamburger nav on /design-lab** — the hamburger (confirmed working correctly on the live site's `Header.tsx`) is not mounted/visible on `/design-lab` at all. Mount the same component here too, top-right corner.
6. **Hero exit on scroll** — hero text (logo, headline, description) currently disappears abruptly once scroll begins. Change to a gradual opacity fade tied to scroll progress, not a hard cut.
7. **Scroll statement positioning** — "Complexity, computed." (frame 20–45) and "Design that scales itself." (frame 60–96) currently render bottom-aligned. Reposition to vertically centered — right-center of viewport for statement 1, left-center for statement 2.
8. **Scroll statement typography** — must use the same site-wide typeface from point 1, currently inconsistent with it.
9. **Panels are unbuilt/empty** — Services brief, Labs teaser, About teaser, and Closing CTA panels currently render blank after the hero sequence ends. Build them out and populate with the finalized copy from §11.2 (Services), §11.3 (About/Closing), and the existing Labs component (§11 point 6, with the amber token per §6). Featured work stays intentionally blank per §11 point 7 — no action there.
10. **Footer visual style** — content and links are correct (matches the reference screenshot: logo lockup, tagline, "Get in touch", Site/Elsewhere link columns, copyright, "Remote · Worldwide"), but it's currently a direct visual copy of the original mockup's styling. Restyle it to match the new design system — typeface, spacing, color tokens — while keeping all existing content and links unchanged.
11. **Hero → panel transition seam** — the cut from the end of the hero video sequence to the first panel morphing up currently feels abrupt. Add a visual transition element between them (a hairline separator, gradient blend, or similar) so the handoff reads as intentional rather than a jarring cut.

---

## 13. Round 3 fixes — post-promotion visual review

Findings from reviewing the promoted Home page (formerly `/design-lab`). Assume all typography fixes should use the site-wide typeface established in §12.1, applied consistently — several items below are instances of it not yet reaching every panel.

### 13.1 Global

- **Scroll progress indicator** (the small circular icon, bottom-left, visible on every panel) — restyle to something minimal and "black and elegant," not a generic/default-looking progress dot.
- **Hero → panel seam** — still reads as a hard edge, not a gradient. The blend gradient from §12.11 needs to be more pronounced/smoother so the transition from video to panel feels continuous, not cut.
- **Scroll behavior across panels** — each panel currently "holds"/pins the scroll for longer than expected; it takes 2–3 scroll gestures to pass through a single panel. Reduce the pin duration / scrub distance so scrolling through all panels feels smooth and continuous, not sticky.
- **Remove all remaining lime/green (`#c8f94e`)** accent instances site-wide — this color is leftover from the original mockup and should not appear anywhere anymore. Every accent use should come from the site's actual established tokens (amber `--color-accent-warm` per §12, or whichever token is the final single accent). The palette should read as one consistent mode, not mixed.
- **Section index numbers** ("01", "02", "03", "04", "05" before each panel's category label) — remove these across all panels for consistency (explicitly confirmed for Services and Featured Work below; applying the same treatment to Labs, About, and Closing for visual consistency — flag if any panel should keep it).

### 13.2 Services panel ("What we build")

- Background is currently pure black — change to a lighter color, distinct from the hero's warm greige but not black. Pick a tone that reads as "panel state" without matching either the hero or being flat black.
- Remove the "01" prefix before "SERVICES" — keep "SERVICES" alone.
- "What we build" heading: increase size, move toward the upper part of the panel.
- "SERVICES" label and "What we build" heading should align together, sized appropriately relative to each other.
- Service cards: increase size overall.
- Add a small animated network/particle motion graphic above each service card, distinct per service (e.g. nodes connecting/reconfiguring for Computational Design, a different motion pattern for Design Automation, AI-Driven Design Tools, and Custom Software & Plugins) — same visual family as the Hero's geodesic field, just smaller and simplified per-card.
- All colors within this panel must come from the single established site palette — no mixed modes.

### 13.3 Labs / Playground panel ("Try it yourself")

- Increase the "ASSISTANT" chat widget's size, both width and height.
- Add a looping background video behind the widget within this panel. Video file location: `public/videos/panels/labs-loop.mp4` (create this folder). Loop continuously, muted, autoplay.
- The widget itself should be semi-transparent (not fully opaque) so the looping video is visible through it.

### 13.4 Featured Work panel

- Increase "Featured work" label size.
- Move label to the top-left of the panel.
- Remove the "03" prefix — keep "FEATURED WORK" alone.
- Panel content remains blank/placeholder per §11 point 7 — no project content yet, this is layout/label only.

### 13.5 About panel

- Increase body text size.
- Text alignment: justified, positioned on the left side of the panel.
- Reserve space on the right side of the panel for two founder photos (Rami and Ramon) — to be uploaded later. Photos should render in grayscale by default, transitioning to full color on hover (CSS `filter: grayscale(100%)` → `grayscale(0%)` on `:hover`, with a smooth transition).
- The "R²XTECH" mention within the About copy should use the actual logo asset/typography, not plain text — awaiting the exact font/logo file from the user for this inline usage.
- Remove the "04" prefix per §13.1.

### 13.6 Closing CTA panel ("Next")

- Increase heading size ("We're already thinking in code. Let's think about your project next.").
- Align the heading further left, matching the left position of the "Contact us" button beneath it.
- "Contact us" button: change color from lime green to the site's established accent token (same fix as §13.1's global green removal).
- Add a looping background video to this panel as well. Video file location: `public/videos/panels/closing-loop.mp4` (same folder as §13.3). Loop continuously, muted, autoplay.
- Remove the "05" prefix per §13.1.

### 13.7 Footer

- Increase size of all elements: logo lockup, tagline text, and both link columns (Site / Elsewhere).
- Increase horizontal spread: push the right-side content (link columns) further right, and the left-side content (logo/tagline) further left, so the footer uses more of the available width.
- Bottom row: move "Remote · Worldwide" to sit on the left side alongside the copyright line (currently right-aligned opposite it) — both bottom-row items should be grouped on the left.
- The horizontal divider line above the bottom row should span the full width of the page edge-to-edge (currently stops short of the right edge).
- Flag for review: the copyright text currently reads "© 2026 R2CH-TECH" — confirm whether this should be "R²XTECH" to match the current brand name exactly.

### 13.8 Open items

- [ ] Founder photos (Rami, Ramon) — not yet supplied, About panel layout should reserve the space regardless.
- [ ] Exact logo/font file for the inline "R²XTECH" mention in About copy — not yet supplied.
- [ ] Two looping background videos (Labs panel, Closing panel) — not yet supplied; folder convention established at `public/videos/panels/`.
- [ ] Confirm whether section index numbers should be removed from Labs/About/Closing panels too, or only Services/Featured Work as explicitly stated.