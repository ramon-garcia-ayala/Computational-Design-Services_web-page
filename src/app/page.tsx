import { Header } from "@/components/layout/Header";
import { BackToTop } from "@/components/ui/BackToTop";
import { Preloader } from "@/components/ui/Preloader";
import { FrameCanvas } from "@/components/design-lab/FrameCanvas";
import { HeroOverlay } from "@/components/design-lab/HeroOverlay";
import { PanelSection } from "@/components/design-lab/PanelSection";
import {
  ClosingPanel,
  PlaygroundPanel,
  ProblemPanel,
} from "@/components/design-lab/Panels";
import { HomeDocument } from "@/components/design-lab/HomeDocument";
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
 *   CINE      hero sequence · "the problem"
 *   DOCUMENT  proof · services · method · work · about
 *   CINE      playground · closing
 *
 * The Playground is late on purpose. "Try it yourself" means more once the
 * reader knows what "it" is, and the assistant is the strongest proof on the
 * page — spending it before the services have been named wastes it.
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

      {/* The first panel is the only one that blends its leading edge: it is
          the one that meets the light hero, and every panel after it rises
          over a plate of its own, where there is no seam to soften.

          It rises directly out of the sequence now — the stats strip that
          used to sit in this gap was legible for about one gesture before the
          panel covered it, and it does more work at the head of the document
          band. */}
      <PanelSection blend>
        <ProblemPanel />
      </PanelSection>

      {/* Ordinary scrolling flow, on carbon. Nothing here is pinned and
          nothing can be clipped. */}
      <HomeDocument />

      {/* The Playground plate is the greige its clip is shot on, not the
          panel charcoal: the two backdrops are the same studio plate,
          measured #b4b0ad-#b6b2af against this token's #b8b4b1.

          `behind` is the document band's carbon, because that is what this
          panel climbs over. Left unset the section is transparent and the
          greige `html` shows through, so a slab of hero colour appeared under
          the carbon band a beat before the panel covered it. */}
      <PanelSection behind="bg-carbon" className="bg-lab-bg">
        <PlaygroundPanel />
      </PanelSection>

      {/* Shorter runway on the last panel: there is nothing after it to hold
          the reader for, and the footer follows immediately.

          `behind` is the Playground's greige — a charcoal panel rising over a
          pale plate is the strongest morph on the page, and it only reads
          that way if the ground is the plate it is actually covering. */}
      <PanelSection runway={130} behind="bg-lab-bg">
        <ClosingPanel />
      </PanelSection>

      <LabFooter />
    </main>
  );
}
