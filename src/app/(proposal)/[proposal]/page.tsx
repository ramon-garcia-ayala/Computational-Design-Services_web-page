import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProposalHeader } from "@/components/proposal/ProposalHeader";
import { ProposalHero } from "@/components/proposal/ProposalHero";
import { ProposalIndex } from "@/components/proposal/ProposalIndex";
import { ProposalRenderer } from "@/components/proposal/ProposalRenderer";
import { ProposalFooter } from "@/components/proposal/ProposalFooter";
import { getProposalBySlug, proposals } from "@/data/proposals";
import { site } from "@/data/site";

type PageProps = { params: Promise<{ proposal: string }> };

/** Only slugs in the registry are served; anything else 404s. */
export const dynamicParams = false;

export function generateStaticParams() {
  return proposals.map((proposal) => ({ proposal: proposal.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { proposal: slug } = await params;
  const proposal = getProposalBySlug(slug);
  if (!proposal) return {};

  return {
    /* `absolute` skips the root layout suffix: this is a client document, not
       a site page. And it must never end up in a search engine. */
    title: { absolute: `${proposal.project} · ${proposal.client}` },
    description: proposal.summary,
    robots: { index: false, follow: false },
  };
}

export default async function ProposalPage({ params }: PageProps) {
  const { proposal: slug } = await params;
  const proposal = getProposalBySlug(slug);
  if (!proposal) notFound();

  const entries = proposal.blocks
    .filter((block) => block.title && !block.unlisted)
    .map((block) => ({ id: block.id, label: block.kicker ?? block.title! }));

  return (
    <>
      <ProposalHeader proposal={proposal} />
      <ProposalIndex entries={entries} />
      <ProposalHero proposal={proposal} />
      <ProposalRenderer blocks={proposal.blocks} />
      <ProposalFooter proposal={proposal} />

      <p className="sr-only">
        Confidential document prepared by {site.nameFlat} for {proposal.client}.
      </p>
    </>
  );
}
