import { ecogenFluence } from "./05.08.2026_ecogen";
import { ecogen20260629 } from "./29.06.2026_ecogen";
import { reparametrize20260629 } from "./29.06.2026_reparametrize";
import type { Proposal } from "./types";

export type * from "./types";

/**
 * One entry per proposal, newest first. Adding one here generates its static
 * route at `/<slug>`.
 *
 * Each proposal is a folder named after its slug, so the URL and the folder
 * match one to one. Attachments live alongside, under
 * `public/proposals/<slug>/`.
 */
export const proposals: Proposal[] = [
  ecogenFluence,
  ecogen20260629,
  reparametrize20260629,
];

export const proposalSlugs = proposals.map((proposal) => proposal.slug);

export function getProposalBySlug(slug: string): Proposal | undefined {
  return proposals.find((proposal) => proposal.slug === slug);
}
