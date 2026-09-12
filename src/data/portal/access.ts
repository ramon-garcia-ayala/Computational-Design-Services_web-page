import { hashPassword, safeEqual } from "@/lib/proposal-auth";

/**
 * Access list for the client portal, keyed by a hash of the client's email —
 * never the address itself.
 *
 * Client emails are personal data and this repository is not the place to
 * store them: a random salt and `SHA-256(salt + email)` are kept instead,
 * exactly like `data/proposals/access.ts` keeps a password hash rather than
 * the password. This works because the magic link is mailed to the address
 * the visitor just typed — the system never needs to remember it to prove
 * who they are.
 *
 * Generate an entry with:
 *
 *     node scripts/portal-email.mjs "client@example.com" ecogen
 *
 * and paste the result here. An email with no matching entry gets the same
 * "check your inbox" response as a real one — the endpoint never confirms who
 * is a client.
 */
export type PortalCredentials = { salt: string; hash: string; slug: string };

export const portalAccess: PortalCredentials[] = [
  {
    slug: "ecogen",
    salt: "2393bc624880962d",
    hash: "e11d9a79199613374bc80c89e0d7df4fc1cfe1e6253e5764866005fcdf296d42",
  },
  {
    slug: "ecogen",
    salt: "c126345fac9b9973",
    hash: "bf9a3536f44748532f09b95ac80307929d23730e7dde61d6bbdc0644266432b7",
  },
];

/**
 * Normalises an email the same way the generator script does — trim and
 * lowercase — then checks it against every stored entry. The list is small
 * (a studio's active clients, not its whole history), so a linear scan is
 * simpler than a lookup table and, unlike a shared salt, never lets a leaked
 * repo be turned into a rainbow table against common addresses.
 */
export async function resolvePortalSlug(
  email: string,
): Promise<string | undefined> {
  const normalized = email.trim().toLowerCase();

  for (const entry of portalAccess) {
    const hash = await hashPassword(normalized, entry.salt);
    if (safeEqual(hash, entry.hash)) return entry.slug;
  }

  return undefined;
}
