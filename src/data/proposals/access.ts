/**
 * Access passwords for the proposals.
 *
 * Never in plain text: a random salt and the SHA-256 of `salt + password` are
 * stored instead. Generate the entry with:
 *
 *     node scripts/proposal-password.mjs "the-password"
 *
 * and paste the result here. A slug with NO entry in this object is left open:
 * anyone with the link can see it.
 *
 * Do not write the password down in the clear in a comment: the hash exists
 * precisely so the repository does not contain it. Keep it wherever passwords
 * are kept, and share it with the client through another channel.
 *
 * Verification happens in `src/proxy.ts`, before the page is served — checking
 * it on the client would protect nothing, the content would already have
 * travelled.
 */
export type ProposalCredentials = { salt: string; hash: string };

export const proposalAccess: Record<string, ProposalCredentials> = {
  "05.08.2026_ecogen": {
    salt: "f5e3205310359188",
    hash: "7f84bae03c106910b9af84018aa401b2f200167ecc74bcff120ccc7808d1c45a",
  },
};

export function getProposalCredentials(
  slug: string,
): ProposalCredentials | undefined {
  return proposalAccess[slug];
}
