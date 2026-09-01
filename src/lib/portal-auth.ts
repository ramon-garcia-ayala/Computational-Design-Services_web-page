import { hmac, safeEqual } from "./proposal-auth";

/**
 * Token verification for the client portal's magic-link sign-in.
 *
 * Reuses `hmac` and `safeEqual` from `proposal-auth.ts` rather than
 * reimplementing them — same Web Crypto constraint applies here: this module
 * has to run unchanged in the proxy runtime, so no `bcrypt`, no native deps.
 *
 * Two token kinds share one signature format, `<expiry>.<signature>`, but the
 * message each signs is prefixed with its own kind (`"magic|"` / `"session|"`)
 * and the client slug. That prefix is domain separation: it is what stops a
 * 15-minute magic link from ever verifying as a 30-day session cookie, or
 * vice versa, even if one leaks into the wrong place. Neither token carries a
 * user identity beyond the client slug — there is no separate user table.
 */

const MAGIC_TTL_MS = 15 * 60 * 1000;
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, same as proposals

export const PORTAL_SESSION_COOKIE = "r2ch_portal_session";

/**
 * The session cookie carries only the signed token. Its subject (the client
 * slug) travels alongside it in this second cookie, so the proxy and the
 * dashboard page know which slug to verify the token's signature against
 * without a database lookup. The signature is what actually proves the pair
 * was not tampered with — this cookie just carries the claim being checked.
 */
export const PORTAL_SLUG_COOKIE = "r2ch_portal_slug";

function parseToken(token: string): { expiresAt: number; signature: string } | null {
  const separator = token.indexOf(".");
  if (separator === -1) return null;

  const expiresAt = Number(token.slice(0, separator));
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  return { expiresAt, signature: token.slice(separator + 1) };
}

/** A single-use-ish link mailed to the visitor. 15 minutes, scoped to `magic`. */
export async function signMagicToken(slug: string, secret: string): Promise<string> {
  const expiresAt = Date.now() + MAGIC_TTL_MS;
  const signature = await hmac(`magic|${slug}|${expiresAt}`, secret);
  return `${expiresAt}.${signature}`;
}

export async function verifyMagicToken(
  token: string | undefined,
  slug: string,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const parsed = parseToken(token);
  if (!parsed) return false;

  const expected = await hmac(`magic|${slug}|${parsed.expiresAt}`, secret);
  return safeEqual(parsed.signature, expected);
}

/** The session cookie issued once the magic link is redeemed. 30 days. */
export async function signSessionToken(slug: string, secret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const signature = await hmac(`session|${slug}|${expiresAt}`, secret);
  return `${expiresAt}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  slug: string,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const parsed = parseToken(token);
  if (!parsed) return false;

  const expected = await hmac(`session|${slug}|${parsed.expiresAt}`, secret);
  return safeEqual(parsed.signature, expected);
}

/**
 * Signing secret for the portal. Same shape as `getSecret()` in
 * `proposal-auth.ts`: shape-validated, returns `null` rather than throwing,
 * and a fixed dev fallback so the site works straight after cloning.
 *
 * Deliberately a *separate* secret from `PROPOSAL_SECRET`: rotating one
 * should not silently invalidate the other's sessions.
 */
export function getPortalSecret(): string | null {
  const secret = process.env.PORTAL_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "development") return "dev-only-insecure-portal-secret";
  return null;
}
