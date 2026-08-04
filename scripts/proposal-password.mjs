#!/usr/bin/env node
/**
 * Genera la entrada de `src/data/proposals/access.ts` para una contraseña.
 *
 *     node scripts/proposal-password.mjs "la-contraseña"
 *     node scripts/proposal-password.mjs "la-contraseña" 05.08.2026_ecogen
 *
 * Imprime salt + hash listos para pegar. La contraseña nunca se guarda.
 */

const [password, slug] = process.argv.slice(2);

if (!password) {
  console.error('Uso: node scripts/proposal-password.mjs "la-contraseña" [slug]');
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

console.log("\nPega esto en src/data/proposals/access.ts:\n");
console.log(`  // Contraseña: ${password}`);
console.log(`  "${slug ?? "<slug>"}": {`);
console.log(`    salt: "${salt}",`);
console.log(`    hash: "${hash}",`);
console.log("  },\n");
