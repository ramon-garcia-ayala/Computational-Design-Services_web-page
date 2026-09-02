import Link from "next/link";
import { site } from "@/data/site";
import { portalCopy } from "@/data/portal/copy";

/**
 * How both portal pages end.
 *
 * They used to end at nothing: the dashboard's last section is Updates, which
 * for a project with no log yet is a single dashed empty-state box, and below
 * it the document simply stopped — a screen and a half of bare ground with no
 * edge on it. The sign-in page did the same under its form.
 *
 * This is `LabFooter`'s closing rule and nothing else: the full-bleed
 * `border-t`, the same `tracking-[0.3em]` mono colophon, the copyright and the
 * location. Deliberately *not* the footer itself — `(portal)/layout.tsx` gives
 * these pages no site navigation on purpose, and `LabFooter` carries the whole
 * Site column, so mounting it here would reopen exactly the door the route
 * group closes. One link back to the site is the entire concession, and the
 * client already has it in the header lockup.
 *
 * `data-portal-chrome` so it hides in print alongside the header and the rail:
 * a printed panel wants the content, not the navigation furniture.
 */
export function PortalColophon() {
  const year = new Date().getFullYear();
  const line = "font-mono text-[11px] uppercase tracking-[0.3em] text-fg-muted sm:text-xs";

  return (
    <footer data-portal-chrome className="border-t border-line">
      <div className="shell flex flex-col gap-3 py-10 sm:flex-row sm:items-center sm:gap-10">
        <p className={line}>
          © {year} {site.nameFlat}
        </p>
        <p className={line}>{site.location}</p>

        <Link
          href="/"
          className={`${line} transition-colors hover:text-accent-ink sm:ml-auto`}
        >
          {portalCopy.login.backToSite}
        </Link>
      </div>
    </footer>
  );
}
