import Link from "next/link";
import { labsLink, navLinks } from "@/data/nav";
import { site, socialLinks } from "@/data/site";
import { designLab } from "@/data/design-lab";

/**
 * `/design-lab`'s footer (spec §12.10).
 *
 * **Same content, different clothes.** Every string and every href is read
 * from the same `data/nav.ts` and `data/site.ts` the live footer reads, so
 * the two cannot drift: the logo lockup, tagline, "Get in touch", the Site
 * and Elsewhere columns, the copyright and the location label are identical
 * by construction, which is what §12.10 asks for. Only the styling differs —
 * the design-lab typeface, wider rhythm, and the lockup as the real logo
 * asset rather than set type.
 *
 * It is a separate component rather than a `variant` prop on the live
 * `Footer` because §12 is explicit that nothing on the live site may change,
 * and the restyle touches nearly every class in that file — a prop would
 * have left the original threaded with conditionals for a page it does not
 * serve.
 */
export function LabFooter() {
  const year = new Date().getFullYear();
  const { mask } = designLab;

  /* `min-h-9` (36px) and an `inline-flex` box. As bare text these links
     stood 20px tall — under WCAG 2.2's 24px pointer-target floor and a poor
     thumb target stacked in a column. The list gap drops from `gap-4` to
     `gap-1` to pay for it, so the column ends up only ~28px taller while
     every target nearly doubles. 36 rather than 44: the 24px figure is the
     web criterion, 44 is the iOS *guideline*, and a marketing footer's link
     list is not a primary control surface. */
  const linkClass =
    "inline-flex min-h-9 items-center text-base text-fg-muted transition-colors hover:text-fg sm:text-lg";

  /* Was `text-fg-muted/70` — `--color-fg-muted` is tuned against carbon
     (6.08:1) and this footer's plate is `--color-panel`, much lighter than
     carbon, where the base token already drops to 3.55:1 before the 70%
     alpha even applies; the two together measured 3.01:1 at 11px. Every
     column heading, the copyright and the location line used this class.
     `panel-ink-muted` is the token built for text on this specific plate. */
  const headingClass =
    "font-mono text-[11px] uppercase tracking-[0.3em] text-panel-ink-muted sm:text-xs";

  return (
    <footer className="font-display border-t border-line bg-panel">
      {/* Trimmed below `sm`: this footer measured 823px on a 390px phone —
          a full screen of it — mostly in padding and column gaps sized for
          the two-column desktop layout it collapses out of. */}
      <div className="flex w-full flex-col gap-12 px-6 py-16 sm:gap-16 sm:px-10 sm:py-24 lg:flex-row lg:justify-between lg:px-16 lg:py-28 xl:px-24">
        <div className="max-w-lg">
          {/* The real asset, filled through the mask so it reads light on
              this dark plate — the source ink is near-black. */}
          <span
            role="img"
            aria-label={site.nameFlat}
            className="block w-[228px] bg-fg sm:w-[264px]"
            style={{
              aspectRatio: `${mask.width} / ${mask.height}`,
              WebkitMaskImage: `url('${mask.src}')`,
              maskImage: `url('${mask.src}')`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />

          <p className="mt-8 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg">
            {site.descriptor}
          </p>

          {/* The warm accent, exactly as on the live footer (§11.10 / §6).
              Points at /contact, not a mailto — see FinalCTA and the header
              for the same call. */}
          <Link
            href="/contact"
            className="mt-10 inline-block border-b border-accent-ink pb-1 text-base text-accent-ink transition-opacity hover:opacity-70 sm:text-lg"
          >
            {site.contactLabel}
          </Link>
        </div>

        <div className="flex gap-12 sm:gap-32 lg:gap-40">
          <nav aria-label="Footer">
            <p className={headingClass}>Site</p>
            <ul className="mt-6 flex flex-col gap-1 sm:mt-8">
              {[...navLinks, labsLink].map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className={headingClass}>Elsewhere</p>
            <ul className="mt-6 flex flex-col gap-1 sm:mt-8">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={linkClass}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* §13.7: the rule runs the full width of the page. It used to sit on
          the padded column, which is why it stopped short of the right edge —
          the padding was inside the bordered element, so the border inherited
          the inset. The border is on the full-width wrapper now and the
          padding moved to the row inside it. */}
      <div className="w-full border-t border-line">
        <div className="flex flex-col gap-2 px-6 py-8 sm:flex-row sm:gap-10 sm:px-10 sm:py-10 lg:px-16 xl:px-24">
          {/* Both items grouped on the left: the location used to be pushed
              opposite the copyright, which read as two unrelated notes rather
              than one colophon. */}
          <p className={headingClass}>
            © {year} {site.nameFlat}
          </p>
          <p className={headingClass}>{site.location}</p>
        </div>
      </div>
    </footer>
  );
}
