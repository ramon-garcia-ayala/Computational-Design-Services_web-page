import { Space_Grotesk } from "next/font/google";
import { Header } from "@/components/layout/Header";
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

/* The page's one typeface, geometric and technical to sit with the logo's
   squared letterforms. Loaded here rather than in the root layout so the
   rest of the site keeps Sora/Inter and never downloads this: `--font-space`
   is what `--font-lab` in globals.css resolves to, and the variable exists
   only inside this subtree. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

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
    <main id="main" data-design-lab className={spaceGrotesk.variable}>
      {/* Plays once per full document load, and blocks scroll until it is
          done. It decides that for itself, so mounting it is the wiring. */}
      <Preloader />

      <Header variant="light" />

      {/* Position marker down the right edge, for the whole page. */}
      <ScrollProgress />

      <FrameCanvas>
        <HeroOverlay />
      </FrameCanvas>

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
