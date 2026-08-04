import Link from "next/link";
import type { Proposal } from "@/data/proposals";

/** Barra fija del documento. Sin navegación: el cliente no debe salirse. */
export function ProposalHeader({ proposal }: { proposal: Proposal }) {
  return (
    <header
      data-proposal-chrome
      className="fixed inset-x-0 top-0 z-50 border-b border-line-soft bg-carbon/80 backdrop-blur-sm"
    >
      <div className="shell flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-sm font-semibold tracking-tight text-fg transition-colors hover:text-accent"
        >
          R<sup className="text-accent">2</sup>ch-Tech
        </Link>

        <p className="hidden font-mono text-[10px] uppercase tracking-widest text-fg-muted lg:block">
          {proposal.client} · {proposal.phase}
        </p>

        {proposal.confidential ? (
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            Confidential
          </span>
        ) : null}
      </div>
    </header>
  );
}
