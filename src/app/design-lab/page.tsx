import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { designLab } from "@/data/design-lab";
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
import { Header } from "@/components/layout/Header";

/* §12.1: the page's one typeface, geometric and technical to sit with the
   logo's squared letterforms. Loaded *here* rather than in the root layout
   so the live site neither downloads it nor changes typeface — §12 is
   design-lab only. `--font-space` is what `--font-lab` in globals.css
   resolves to, and the variable exists only inside this subtree. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

/* Sandbox route (spec §9: this stays isolated until approved, so the live
   Home page is untouched). It sits outside both the (site) and (proposal)
   route groups on purpose, so it inherits neither's chrome and owns the whole
   viewport; only the root layout (fonts, Lenis) is above it. Kept out of the
   index until the approach is ported into the live sections.

   `data-design-lab` is what globals.css hangs the greige page background off,
   so it reaches the document root and covers overscroll and the paint before
   hydration — neither of which a full-height element does. */
export const metadata: Metadata = {
  title: designLab.meta.title,
  description: designLab.meta.description,
  robots: { index: false, follow: false },
};

export default function DesignLabPage() {
  return (
    <main id="main" data-design-lab className={spaceGrotesk.variable}>
      {/* §12.5: the live site's hamburger, reused rather than rebuilt. The
          light variant exists because this page's hero is a pale plate and
          the default near-white chrome would vanish on it. */}
      <Header variant="light" />

      {/* Hero: the geodesic sequence with its overlay riding along inside the
          pinned stage. §11 is explicit that the shape is hero-only — it does
          not thread through the page, and the first panel covers it for good
          the moment its runway ends. */}
      <FrameCanvas>
        <HeroOverlay />
      </FrameCanvas>

      {/* §12.11: only this panel blends its leading edge. It is the one that
          meets the light hero; every panel after it rises over carbon, where
          there is no seam to soften. */}
      <PanelSection blend>
        <ServicesPanel />
      </PanelSection>

      <PanelSection>
        <LabsPanel />
      </PanelSection>

      <PanelSection>
        <FeaturedPanel />
      </PanelSection>

      <PanelSection>
        <AboutPanel />
      </PanelSection>

      {/* The last panel keeps a shorter runway: there is nothing after it to
          hold the reader for, and the footer follows immediately. */}
      <PanelSection runway={130}>
        <ClosingPanel />
      </PanelSection>

      <LabFooter />
    </main>
  );
}
