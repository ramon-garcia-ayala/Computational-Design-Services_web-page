import { Header } from "@/components/layout/Header";
import { BackToTop } from "@/components/ui/BackToTop";
import { Preloader } from "@/components/ui/Preloader";
import { FrameCanvas } from "@/components/design-lab/FrameCanvas";
import { HeroOverlay } from "@/components/design-lab/HeroOverlay";
import { PanelSection } from "@/components/design-lab/PanelSection";
import {
  AboutPanel,
  ClosingPanel,
  FeaturedPanel,
  LabsPanel,
  ServicesPanel,
} from "@/components/design-lab/Panels";
import { LabFooter } from "@/components/design-lab/LabFooter";
import { ScrollProgress } from "@/components/design-lab/ScrollProgress";
import { StatsBar } from "@/components/design-lab/StatsBar";

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

      {/* The four figures, in the ground the hero fades into and the first
          panel rises out of. Sitting between the two rather than on either
          means it needs no blending of its own. */}
      <StatsBar />

      {/* Only the first panel blends its leading edge: it is the one that
          meets the light hero, and every panel after it rises over carbon,
          where there is no seam to soften. */}
      <PanelSection blend>
        <ServicesPanel />
      </PanelSection>

      {/* The Labs plate is the greige its clip is shot on, not the panel
          charcoal: the two backdrops are the same studio plate, measured
          #b4b0ad-#b6b2af against this token's #b8b4b1. */}
      <PanelSection className="bg-lab-bg">
        <LabsPanel />
      </PanelSection>

      <PanelSection>
        <FeaturedPanel />
      </PanelSection>

      <PanelSection>
        <AboutPanel />
      </PanelSection>

      {/* Shorter runway on the last panel: there is nothing after it to hold
          the reader for, and the footer follows immediately. */}
      <PanelSection runway={130}>
        <ClosingPanel />
      </PanelSection>

      <LabFooter />
    </main>
  );
}
