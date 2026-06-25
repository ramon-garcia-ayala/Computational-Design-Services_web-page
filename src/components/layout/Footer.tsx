import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { COMPANY_EMAIL, COMPANY_NAME, COMPANY_SHORT, footerLinks } from "@/data/content";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <span className="font-display text-lg font-bold text-text-primary">
              {COMPANY_SHORT}<span className="text-accent">.</span>
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-text-secondary">
              Computational design, automation, and artificial intelligence in service of architecture and engineering.
            </p>
            <div className="flex gap-3 mt-2">
              <a
                href={`mailto:${COMPANY_EMAIL}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
                aria-label="Email"
              >
                <Mail size={15} />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon size={15} />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:border-accent/50 hover:text-accent transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={15} />
              </a>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">Services</p>
            <ul className="flex flex-col gap-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">Company</p>
            <ul className="flex flex-col gap-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            {COMPANY_EMAIL}
          </p>
        </div>
      </div>
    </footer>
  );
}
