import { Header } from "@/components/layout/Header";
import { LabFooter } from "@/components/design-lab/LabFooter";

/**
 * Chrome for the public site. Client proposals live in `(proposal)` and carry
 * their own bar, so they do not inherit this navigation.
 *
 * It is Home's chrome exactly: the same header in the same light variant, on
 * the same pale plate, and the same footer. The header is not re-themed per
 * route — moving from Home to a subpage changes the content and nothing else.
 *
 * **The ground is a gradient, not a fill.** A single flat colour across a whole
 * page reads as a slab; Home never does that, it opens pale and settles into
 * the panel charcoal. This band is that transition: the hero's greige holds
 * behind the chrome, then gives way to the page ground before any copy starts.
 * So the type that sits on the pale part is the header's — dark ink, as on
 * Home — and everything below is light on charcoal.
 *
 * `data-site-warm` sets what the tokens mean for the content underneath, so
 * every section renders light-on-warm without knowing a second mood exists.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-site-warm className="relative">
      {/* Solid behind the chrome, gone before the first heading. Absolute
          rather than fixed: it belongs to the top of the document, the way
          Home's hero does, instead of following the viewport down. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[250px] bg-[linear-gradient(to_bottom,var(--color-lab-bg)_0,var(--color-lab-bg)_96px,transparent_100%)]"
      />

      <Header variant="light" />
      <main id="main" className="relative pt-20">
        {children}
      </main>
      <LabFooter />
    </div>
  );
}
