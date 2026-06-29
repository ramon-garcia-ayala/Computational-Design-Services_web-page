import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProposal, getAllProposalSlugs } from "@/data/proposals";
import { ProposalPage } from "@/components/proposal/ProposalPage";
import { COMPANY_NAME } from "@/data/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProposalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProposal(slug);
  if (!data) return {};
  return {
    title: `${data.projectTitle} | ${COMPANY_NAME}`,
    description: data.summary,
    robots: { index: false, follow: false },
  };
}

export default async function ProposalRoute({ params }: Props) {
  const { slug } = await params;
  const data = await getProposal(slug);
  if (!data) notFound();
  return <ProposalPage data={data} />;
}
