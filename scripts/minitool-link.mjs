#!/usr/bin/env node
/**
 * Turns a mini tool spec into the link that opens it.
 *
 *     node scripts/minitool-link.mjs src/minitools/data/presets/facade.ts
 *     node scripts/minitool-link.mjs some-spec.json --origin http://localhost:3000
 *     node scripts/minitool-link.mjs src/minitools/data/presets/facade.ts --plain
 *
 * A generated tool lives entirely in its URL fragment, which is wonderful for
 * sharing and miserable for development: the only way to see an archetype you
 * just wrote is to hold a conversation with the assistant until it decides to
 * build one, and pay for a Sonnet call at the end of it. This prints the same
 * link straight from a spec file, so a render can be checked in a browser
 * before the model has ever been asked to fill one in.
 *
 * It reimplements `encodeSpec` from `src/minitools/lib/encode.ts` rather than
 * importing it, because that module's imports have no file extensions and
 * Node's ESM resolver will not follow them. Two things have to stay true of
 * the copy: `zlib.deflateRawSync` is the same raw DEFLATE that
 * `CompressionStream("deflate-raw")` produces, and the payload prefix decides
 * how the page reads it — so if the format in `encode.ts` ever changes, this
 * changes with it.
 *
 * `.ts` preset modules are imported directly, which works because Node strips
 * types and a preset only ever imports its own type. Keep it that way: a
 * preset that imports anything at runtime stops being loadable here.
 */

import { deflateRawSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const positional = args.filter((arg) => !arg.startsWith("--"));

const originIndex = args.indexOf("--origin");
const origin = originIndex === -1 ? "" : (args[originIndex + 1] ?? "");
const [target] = positional.filter((arg) => arg !== origin);

if (!target) {
  console.error(
    "Usage: node scripts/minitool-link.mjs <spec.ts|spec.json> [--plain] [--origin http://localhost:3000]",
  );
  process.exit(1);
}

/** Anything shaped like a spec. Presets export one object under their own name. */
function looksLikeSpec(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    value.version === 1 &&
    typeof value.template === "string"
  );
}

async function loadSpec(path) {
  const full = resolve(path);

  if (full.endsWith(".json")) {
    return JSON.parse(await readFile(full, "utf8"));
  }

  /* Not `module`: ESLint's Next.js config forbids assigning that name. */
  const loaded = await import(pathToFileURL(full).href);
  const found = Object.values(loaded).find(looksLikeSpec);

  if (!found) {
    throw new Error(
      `${path} exports nothing that looks like a spec (an object with version: 1 and a template).`,
    );
  }

  return found;
}

function toBase64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const spec = await loadSpec(target);
const json = JSON.stringify(spec);

/* `--plain` is not a curiosity. It is the branch a browser without
   `CompressionStream` takes, it is roughly twenty times longer, and it is the
   one that runs into the payload cap first — so it is worth being able to
   generate on demand rather than only on the browsers that force it. */
const payload = flags.has("--plain")
  ? `v1u.${toBase64Url(Buffer.from(json, "utf8"))}`
  : `v1z.${toBase64Url(deflateRawSync(Buffer.from(json, "utf8")))}`;

const href = `${origin}/labs/tool#${payload}`;

console.log(`\n${spec.meta?.title ?? "(untitled)"} — template "${spec.template}"`);
console.log(`${json.length} chars of JSON, ${payload.length} in the fragment\n`);
console.log(href);

/* The cap in `encode.ts` is sized for the uncompressed form, so a deflated
   payload that trips it means the plain fallback passed that point long ago
   and older Safari would be generating links nobody can open. */
if (payload.length > 24576) {
  console.error(
    "\nThis payload is over MAX_PAYLOAD_CHARS (24576). The tool page will refuse it.",
  );
  process.exit(1);
}

console.log("");
