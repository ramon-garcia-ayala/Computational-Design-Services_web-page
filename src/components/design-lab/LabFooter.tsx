import Link from "next/link";
import { labsLink, navLinks } from "@/data/nav";
import { mailtoHref, site, socialLinks } from "@/data/site";
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

  const linkClass =
    "text-sm text-fg-muted transition-colors hover:text-fg";

  const headingClass =
    "font-mono text-[10px] uppercase tracking-[0.25em] text-fg-muted/70";

  return (
    <footer className="font-lab border-t border-line/60 bg-carbon">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-6 py-20 sm:px-10 lg:flex-row lg:justify-between lg:px-16 lg:py-24">
        <div className="max-w-sm">
          {/* The real asset, filled through the mask so it reads light on
              this dark plate — the source ink is near-black. */}
          <span
            role="img"
            aria-label={site.nameFlat}
            className="block w-[172px] bg-fg"
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

          <p className="mt-6 text-sm leading-relaxed text-fg-muted">
            {site.descriptor}
          </p>

          {/* The warm accent, exactly as on the live footer (§11.10 / §6). */}
          <a
            href={mailtoHref}
            className="mt-8 inline-block border-b border-accent-warm pb-1 text-sm text-accent-warm transition-opacity hover:opacity-70"
          >
            {site.contactLabel}
          </a>
        </div>

        <div className="flex gap-16 sm:gap-24">
          <nav aria-label="Footer">
            <p className={headingClass}>Site</p>
            <ul className="mt-6 flex flex-col gap-3">
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
            <ul className="mt-6 flex flex-col gap-3">
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

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 border-t border-line/60 px-6 py-8 sm:flex-row sm:justify-between sm:px-10 lg:px-16">
        <p className={headingClass}>
          © {year} {site.nameFlat}
        </p>
        <p className={headingClass}>{site.location}</p>
      </div>
    </footer>
  );
}
