/**
 * Verificación de contraseña de las propuestas.
 *
 * Todo va sobre Web Crypto (`crypto.subtle`), así que el mismo módulo corre
 * igual en el middleware, en el Route Handler y en el script de Node que genera
 * los hashes. Nada de `bcrypt`: es una dependencia nativa y no funciona en el
 * runtime del middleware.
 */

const encoder = new TextEncoder();

/** 30 días. Lo que dura el acceso antes de volver a pedir la contraseña. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export const COOKIE_PREFIX = "r2ch_proposal_";

export function cookieName(slug: string): string {
  /* El slug lleva puntos, que son válidos en un nombre de cookie pero no en
     todas las implementaciones antiguas. Se normaliza a guiones bajos. */
  return COOKIE_PREFIX + slug.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** SHA-256 de `salt + password`, en hexadecimal. */
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

/** Comparación en tiempo constante: no revela cuántos caracteres acertaste. */
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
 * Token de sesión: `<caducidad>.<firma>`. La firma cubre el slug, así que una
 * cookie de una propuesta no sirve para abrir otra.
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
 * Secreto de firma. En producción es obligatorio: sin él se deniega el acceso
 * en vez de firmar con algo adivinable. En desarrollo se permite un valor fijo
 * para que el sitio funcione recién clonado.
 */
export function getSecret(): string | null {
  const secret = process.env.PROPOSAL_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "development") return "dev-only-insecure-secret";
  return null;
}
