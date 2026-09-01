import { Header } from "@/components/layout/Header";
import { BackToTop } from "@/components/ui/BackToTop";
import { Preloader } from "@/components/ui/Preloader";
import { FrameCanvas } from "@/components/design-lab/FrameCanvas";
import { HeroOverlay } from "@/components/design-lab/HeroOverlay";
import { PanelSection } from "@/components/design-lab/PanelSection";
import { ClosingPanel, ProblemPanel } from "@/components/design-lab/Panels";
import { HomeDocument, ProofStrip } from "@/components/design-lab/HomeDocument";
import { LabFooter } from "@/components/design-lab/LabFooter";
import { ScrollProgress } from "@/components/design-lab/ScrollProgress";

/**
 * Home.
 *
 * It sits at the app root rather than inside the `(site)` group because it
 * owns its whole viewport: it mounts its own header in the light variant and
 * its own footer, and inheriting `(site)`'s dark chrome would render both
 * twice. Every other page still lives in `(site)` and is unaffected.
 *
 * `data-design-lab` carries over from the prototype route this grew out of.
 * It is the hook `globals.css` uses to paint the document root greige, which
 * has to happen above `<body>` so overscroll and the paint before hydration
 * do not flash carbon behind a pale page. Renaming it means touching both
 * files together.
 *
 * The geodesic sequence is hero-only: once its runway ends the first panel
 * rises over it and it does not return.
 *
 * ## Shape: cinema, document, cinema
 *
 * The page used to be six panels end to end — six fixed 100svh stages, one
 * idea each. That format sells the studio's temperament and cannot explain
 * its work, and the page paid for it twice over. Of six sections exactly one
 * said what R²χTECH does, in four single sentences; and the three that had
 * outgrown a viewport (Services, Featured work, About) were *clipped* rather
 * than scrolled, so their headings and the top of their content sat off the
 * screen with no scrollbar and no way to reach them.
 *
 * So the panels keep the beats they are good at and get out of the way of the
 * argument:
 *
 *   CINE      hero sequence · proof · "the problem"
 *   DOCUMENT  services · work · about
 *   CINE      closing
 *
 * A third cine panel — Playground, the chat assistant, "try it yourself" —
 * used to close the scroll here. It moved to `/labs`, reachable only from
 * the menu, not from Home's own scroll: an assistant a visitor has to go
 * looking for is a deliberate visit, not a scroll they happened to land on
 * mid-sentence. See `src/data/labs.ts`.
 */
export default function HomePage() {
  return (
    <main id="main" data-design-lab>
      {/* Plays once per full document load, and blocks scroll until it is
          done. It decides that for itself, so mounting it is the wiring. */}
      <Preloader />

      <Header variant="light" />

      {/* Position marker down the right edge, for the whole page. */}
      <ScrollProgress />

      {/* Sits clear of the progress bar's 3px on the right edge. */}
      <BackToTop />

      <FrameCanvas>
        <HeroOverlay />
      </FrameCanvas>

      {/* The four figures, in normal document flow between the hero and the
          first panel — the gap the hero's own runway already reserves as it
          hands off. Ordinary flow, not a panel: it only has to be legible
          for one beat before the geodesic's sticky stage un-pins and this
          scrolls past it, same as everything else below.

          No background of its own: the page ground here is still
          `--color-lab-bg`, the hero's own greige (`data-design-lab` paints
          it at the document root), so an unset background reads as a
          continuation of the hero rather than a plate dropped on top of it.
          `ProofStrip`'s ink follows, using the same `lab-ink` pair
          `HeroOverlay` uses on this exact ground rather than the light-on-dark
          tokens the rest of the document band uses. */}
      <div className="relative pt-16 sm:pt-20">
        <ProofStrip />
      </div>

      {/* The first panel is the only one that blends its leading edge: it is
          the one that meets the light hero, and every panel after it rises
          over a plate of its own, where there is no seam to soften. */}
      <PanelSection blend>
        <ProblemPanel />
      </PanelSection>

      {/* Ordinary scrolling flow, on carbon. Nothing here is pinned and
          nothing can be clipped. */}
      <HomeDocument />

      {/* Shorter runway on the last panel: there is nothing after it to hold
          the reader for, and the footer follows immediately.

          `behind` is the document band's own `bg-panel` — its ground, and
          also what this panel itself renders as (`PanelSection`'s default,
          unblended fill) — because that is what this panel now climbs over
          directly — Playground, which used to sit between them, moved to
          `/labs`. Left unset the section is transparent and the greige
          `html` shows through, so a slab of hero colour appeared under the
          band a beat before the panel covered it. */}
      <PanelSection runway={130} behind="bg-panel">
        <ClosingPanel />
      </PanelSection>

      <LabFooter />
    </main>
  );
}
