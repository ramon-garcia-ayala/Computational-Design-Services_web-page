import type { Metadata } from "next";
import Link from "next/link";
import { UnlockForm } from "@/components/proposal/UnlockForm";
import { getProposalBySlug } from "@/data/proposals";
import { mailtoHref, site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: `Protected document · ${site.nameFlat}` },
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ to?: string; error?: string }>;
};

export default async function UnlockPage({ searchParams }: PageProps) {
  const { to = "", error } = await searchParams;
  const proposal = getProposalBySlug(to);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden py-20">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,249,78,0.07),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <div className="max-w-xl">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-fg transition-colors hover:text-accent"
          >
            R<sup className="text-accent">2</sup>ch-Tech
          </Link>

          <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-accent">
            Protected document
          </p>

          <h1 className="mt-4 font-display text-3xl leading-[1.1] font-semibold tracking-tight text-fg sm:text-4xl">
            {proposal ? proposal.project : "This document is password protected"}
          </h1>

          <p className="mt-5 text-base leading-relaxed text-fg-muted">
            {proposal
              ? `Prepared for ${proposal.client}. Enter the password you were sent to open it.`
              : "Enter the password you were sent to open this document."}
          </p>

          {to ? (
            <UnlockForm slug={to} />
          ) : (
            <p className="mt-10 text-sm text-fg-muted">
              No document was requested. Open the link you were sent.
            </p>
          )}

          {error === "config" ? (
            <p className="mt-6 rounded-lg border border-line bg-graphite px-4 py-3 text-sm text-fg-muted">
              Access is not configured on this deployment yet. Please contact us
              and we&apos;ll send the document another way.
            </p>
          ) : null}

          <p className="mt-12 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            Lost the password?{" "}
            <a
              href={mailtoHref}
              className="text-fg transition-colors hover:text-accent"
            >
              {site.contactEmail}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
