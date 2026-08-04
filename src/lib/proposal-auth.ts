/**
 * Password verification for proposals.
 *
 * Everything runs on Web Crypto (`crypto.subtle`), so the same module works
 * unchanged in the proxy, in the Route Handler and in the Node script that
 * generates the hashes. No `bcrypt`: it is a native dependency and does not
 * work in the proxy runtime.
 */

const encoder = new TextEncoder();

/** 30 days. How long access lasts before the password is asked for again. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export const COOKIE_PREFIX = "r2ch_proposal_";

export function cookieName(slug: string): string {
  /* Slugs contain dots, which are valid in a cookie name but not in every
     older implementation. They are normalised to underscores. */
  return COOKIE_PREFIX + slug.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** SHA-256 of `salt + password`, in hexadecimal. */
export async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(salt + password),
  );
  return toHex(digest);
}

/** Constant-time comparison: it leaks no hint of how many characters matched. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmac(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

/**
 * Session token: `<expiry>.<signature>`. The signature covers the slug, so one
 * proposal's cookie cannot be used to open another.
 */
export async function signToken(
  slug: string,
  secret: string,
  expiresAt = Date.now() + SESSION_MAX_AGE * 1000,
): Promise<string> {
  const signature = await hmac(`${slug}|${expiresAt}`, secret);
  return `${expiresAt}.${signature}`;
}

export async function verifyToken(
  token: string | undefined,
  slug: string,
  secret: string,
): Promise<boolean> {
  if (!token) return false;

  const separator = token.indexOf(".");
  if (separator === -1) return false;

  const expiresAt = Number(token.slice(0, separator));
  const signature = token.slice(separator + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return safeEqual(signature, await hmac(`${slug}|${expiresAt}`, secret));
}

/**
 * Signing secret. Required in production: without it access is denied rather
 * than signed with something guessable. In development a fixed value is
 * allowed so the site works straight after cloning.
 */
export function getSecret(): string | null {
  const secret = process.env.PROPOSAL_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "development") return "dev-only-insecure-secret";
  return null;
}
