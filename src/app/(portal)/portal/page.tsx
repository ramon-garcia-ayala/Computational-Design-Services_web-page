import type { Metadata } from "next";
import Link from "next/link";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";
import { portalCopy } from "@/data/portal/copy";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: `Client access · ${site.nameFlat}` },
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function PortalLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden py-20">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--color-accent)_7%,transparent),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <div className="max-w-xl">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-fg transition-colors hover:text-accent-ink"
          >
            R<sup className="text-accent-ink">2</sup>&#967;TECH
          </Link>

          <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-accent-ink">
            {portalCopy.login.kicker}
          </p>

          <h1 className="mt-4 font-display text-3xl leading-[1.1] font-semibold tracking-tight text-fg sm:text-4xl">
            {portalCopy.login.title}
          </h1>

          <p className="mt-5 text-base leading-relaxed text-fg-muted">
            {portalCopy.login.lead}
          </p>

          <PortalLoginForm />

          {error === "invalid_link" ? (
            <p className="mt-6 rounded-surface border border-edge bg-graphite px-4 py-3 text-sm text-fg-muted">
              {portalCopy.enter.invalidTitle} — {portalCopy.enter.invalidBody}
            </p>
          ) : null}

          <p className="mt-12 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            <Link href="/" className="text-fg transition-colors hover:text-accent-ink">
              {portalCopy.login.backToSite}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
