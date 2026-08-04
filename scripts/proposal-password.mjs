#!/usr/bin/env node
/**
 * Generates the `src/data/proposals/access.ts` entry for a password.
 *
 *     node scripts/proposal-password.mjs "the-password"
 *     node scripts/proposal-password.mjs "the-password" 05.08.2026_ecogen
 *
 * Prints salt + hash ready to paste. The password is never stored.
 */

const [password, slug] = process.argv.slice(2);

if (!password) {
  console.error('Usage: node scripts/proposal-password.mjs "the-password" [slug]');
  process.exit(1);
}

const salt = Buffer.from(crypto.getRandomValues(new Uint8Array(8))).toString(
  "hex",
);

const digest = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode(salt + password),
);

const hash = Array.from(new Uint8Array(digest))
  .map((byte) => byte.toString(16).padStart(2, "0"))
  .join("");

console.log("\nPaste this into src/data/proposals/access.ts:\n");
console.log(`  "${slug ?? "<slug>"}": {`);
console.log(`    salt: "${salt}",`);
console.log(`    hash: "${hash}",`);
console.log("  },\n");
console.log(
  "The password is not stored anywhere. Save it wherever you keep your own\n" +
    "before closing this terminal, and share it with the client over another\n" +
    "channel.\n",
);
