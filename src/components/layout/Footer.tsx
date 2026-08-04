import Link from "next/link";
import { labsLink, navLinks } from "@/data/nav";
import { mailtoHref, site, socialLinks } from "@/data/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-carbon">
      <div className="shell flex flex-col gap-10 py-12 lg:flex-row lg:justify-between lg:py-16">
        <div className="max-w-sm">
          <p className="font-display text-xl font-semibold tracking-tight text-fg">
            R<sup className="text-accent">2</sup>ch-Tech
          </p>
          <p className="mt-3 text-sm text-fg-muted">{site.descriptor}</p>
          <a
            href={mailtoHref}
            className="mt-5 inline-block border-b border-accent pb-0.5 text-sm text-accent transition-opacity hover:opacity-70"
          >
            {site.contactLabel}
          </a>
        </div>

        <div className="flex gap-12 sm:gap-20">
          <nav aria-label="Footer">
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              Site
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {[...navLinks, labsLink].map((link) =>
                link.external ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-fg transition-colors hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              Elsewhere
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-fg transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-line py-6 sm:flex-row sm:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          © {year} {site.nameFlat}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {site.location}
        </p>
      </div>
    </footer>
  );
}
