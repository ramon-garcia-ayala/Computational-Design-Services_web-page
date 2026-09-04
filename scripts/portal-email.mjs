#!/usr/bin/env node
/**
 * Generates the `src/data/portal/access.ts` entry for a client's email.
 *
 *     node scripts/portal-email.mjs "client@example.com" ecogen
 *
 * Prints salt + hash + slug ready to paste. The email is normalised (trim +
 * lowercase) before hashing, matching `resolvePortalSlug` — an entry
 * generated from a differently-cased address would never match. The email
 * itself is never stored.
 */

const [email, slug] = process.argv.slice(2);

if (!email || !slug) {
  console.error(
    'Usage: node scripts/portal-email.mjs "client@example.com" <slug>',
  );
  process.exit(1);
}

const normalized = email.trim().toLowerCase();

const salt = Buffer.from(crypto.getRandomValues(new Uint8Array(8))).toString(
  "hex",
);

const digest = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode(salt + normalized),
);

const hash = Array.from(new Uint8Array(digest))
  .map((byte) => byte.toString(16).padStart(2, "0"))
  .join("");

console.log("\nPaste this into src/data/portal/access.ts's portalAccess array:\n");
console.log("  {");
console.log(`    slug: "${slug}",`);
console.log(`    salt: "${salt}",`);
console.log(`    hash: "${hash}",`);
console.log("  },\n");
console.log(
  "The email is not stored anywhere. Keep it wherever you track client\n" +
    "contacts, and make sure src/data/portal/<slug>/index.ts exists.\n",
);
