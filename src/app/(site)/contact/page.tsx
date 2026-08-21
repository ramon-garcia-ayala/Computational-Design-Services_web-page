import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { contactCopy } from "@/data/contact";
import { mailtoHref, site, socialLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Tell ${site.nameFlat} what should not be manual. Describe the workflow and we will tell you whether it is worth automating.`,
};

/**
 * `/contact`: the form, and the ways round it.
 *
 * The address is never printed. `contactHref` carries it and the visible text
 * stays a label, which is the site's rule everywhere — a page whose whole job
 * is to be contacted is the worst place to break it.
 *
 * The social links are the footer's own array, not a second list. They repeat
 * visually because this page is where someone looks for them; they do not
 * repeat as content, so adding one to `data/site.ts` still adds it once.
 */
export default function ContactPage() {
  return (
    <div data-site-pale>
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-28">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,rgba(232,169,74,0.06),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <Reveal>
          <SectionHeading
            as="h1"
            kicker={contactCopy.kicker}
            title={contactCopy.title}
            lead={contactCopy.lead}
          />
        </Reveal>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              {contactCopy.formKicker}
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal>
            <div className="flex flex-col gap-10 border-t border-line pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-fg-muted">
                  {contactCopy.direct.kicker}
                </p>
                <a
                  href={mailtoHref}
                  className="mt-4 inline-block border-b border-accent pb-1 font-display text-xl font-semibold text-accent transition-opacity hover:opacity-70 sm:text-2xl"
                >
                  {site.contactLabel}
                </a>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {contactCopy.direct.body}
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-fg-muted">
                  Where we are
                </p>
                <p className="mt-4 font-display text-lg font-semibold text-fg">
                  {site.location}
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-fg-muted">
                  {contactCopy.elsewhere}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {socialLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-base text-fg-muted transition-colors hover:text-fg"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
    </div>
  );
}
