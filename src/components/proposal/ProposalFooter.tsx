import type { Proposal } from "@/data/proposals";
import { mailtoHref, site } from "@/data/site";

export function ProposalFooter({ proposal }: { proposal: Proposal }) {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-4 py-10 font-mono text-[10px] uppercase tracking-widest text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <span>
          {proposal.phase} · {proposal.dateLabel}
        </span>
        <span>Prepared for review with {proposal.client}</span>
        <a
          href={mailtoHref}
          className="text-fg transition-colors hover:text-accent"
        >
          {site.contactEmail}
        </a>
      </div>
    </footer>
  );
}
