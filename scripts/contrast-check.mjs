/**
 * Contrast gate for the design tokens.
 *
 * Every contrast failure this repo has shipped was arithmetic: the values were
 * in `globals.css` all along and nobody multiplied them out. `--color-edge`
 * exists to satisfy WCAG 1.4.11 and missed the warm scope entirely, so on most
 * routes the token created to clear 3:1 sat at 1.87:1. That is not a thing a
 * reviewer catches by looking.
 *
 * So this reads the tokens out of `globals.css` — never a copy of them, or the
 * check drifts from the thing it checks — resolves each scope the way the
 * cascade does, and asserts the pairs that carry meaning.
 *
 *   node scripts/contrast-check.mjs
 *
 * Exit 1 on any failure, so it can gate a build.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = join(here, "..", "src", "app", "globals.css");

/* --------------------------------------------------------------------------
   Parsing
   -------------------------------------------------------------------------- */

/** Comments carry braces (and stale hex values); strip them before matching. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Body of the first block opened by `selector`, brace-counted rather than
 * regex-matched so a nested rule cannot end the block early.
 */
function blockBody(css, selector) {
  const start = css.indexOf(selector);
  if (start === -1) return null;
  const open = css.indexOf("{", start);
  if (open === -1) return null;

  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  return null;
}

/** `--color-foo: #abc;` pairs, keyed without the `--color-` prefix. */
function colorTokens(body) {
  const out = {};
  if (!body) return out;
  const re = /--color-([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let m;
  while ((m = re.exec(body)) !== null) out[m[1]] = m[2];
  return out;
}

/* --------------------------------------------------------------------------
   Colour maths (WCAG 2.x relative luminance)
   -------------------------------------------------------------------------- */

function parseHex(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6); // ignore alpha; these tokens are opaque
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/* --------------------------------------------------------------------------
   Scopes, resolved the way the cascade resolves them
   -------------------------------------------------------------------------- */

const css = stripComments(readFileSync(CSS_PATH, "utf8"));

const theme = colorTokens(blockBody(css, "@theme"));
const warm = colorTokens(blockBody(css, "[data-site-warm]"));
/* Finds the first literal occurrence of "[data-site-pale]", which today is
   the opening of the combined selector `[data-site-pale],
   [data-site-pale-chrome] { ... }` — so this happens to read the right
   block, but only because the two selectors share one rule. If they are ever
   split into separate rules, this starts reading the wrong block silently:
   keep them combined, or update this lookup alongside the split. */
const pale = colorTokens(blockBody(css, "[data-site-pale]"));

/* `pale` nests inside `warm` on /about and /contact, but it redefines every
   token warm sets, so the merge order below is the whole story either way. */
const SCOPES = {
  dark: { ...theme },
  warm: { ...theme, ...warm },
  pale: { ...theme, ...warm, ...pale },
};

/* The Home hero plate is not a scope — it is the `lab-*` token family drawn on
   `--color-lab-bg`, reached through utilities rather than a data attribute. */
const LAB = { ...theme };

/* --------------------------------------------------------------------------
   What has to hold
   -------------------------------------------------------------------------- */

const AA_TEXT = 4.5; // body text
const AA_LARGE = 3; // >=24px, or >=18.66px bold
const NON_TEXT = 3; // WCAG 1.4.11 — controls, and graphics you must perceive

/** Pairs asserted in every one of the three scopes. */
const SCOPED_CHECKS = [
  ["fg", "carbon", AA_TEXT, "primary text on the page ground"],
  ["fg-muted", "carbon", AA_TEXT, "secondary text on the page ground"],
  ["fg", "graphite", AA_TEXT, "primary text on a surface"],
  ["fg-muted", "graphite", AA_TEXT, "secondary text on a surface"],
  ["fg", "graphite-hi", AA_TEXT, "primary text on an elevated surface"],
  ["accent-ink", "carbon", AA_TEXT, "accent in its ink role"],
  ["accent-ink", "graphite", AA_TEXT, "accent in its ink role, on a surface"],
  ["on-accent", "accent", AA_TEXT, "ink on a filled accent plate"],
  ["focus", "carbon", NON_TEXT, "keyboard focus ring"],
  ["edge", "carbon", NON_TEXT, "meaningful border (fields, controls)"],
  ["edge", "graphite", NON_TEXT, "meaningful border on a surface"],
  ["danger", "carbon", AA_TEXT, "error text"],
  ["danger", "graphite", AA_TEXT, "error text on a surface"],
];

/** The Home hero plate, plus the panel charcoal Home settles into. */
const LAB_CHECKS = [
  ["lab-ink", "lab-bg", AA_TEXT, "hero ink on the greige plate"],
  ["lab-ink-muted", "lab-bg", AA_TEXT, "hero secondary ink on the greige plate"],
  ["fg", "panel", AA_TEXT, "panel copy"],
  ["panel-ink-muted", "panel", AA_TEXT, "panel secondary copy"],
  ["accent", "panel", AA_LARGE, "accent eyebrow on a panel"],
  ["on-accent", "accent", AA_TEXT, "ink on a filled accent plate"],
];

/* --------------------------------------------------------------------------
   Run
   -------------------------------------------------------------------------- */

let failures = 0;
let skipped = 0;

function run(label, tokens, checks) {
  console.log(`\n  ${label}`);
  console.log("  " + "-".repeat(74));

  for (const [fgName, bgName, min, description] of checks) {
    const fg = tokens[fgName];
    const bg = tokens[bgName];

    if (!fg || !bg) {
      /* A token the scope never defines is a finding in itself: it means the
         scope silently inherits a value tuned for a different ground. */
      console.log(
        `  MISSING  --color-${!fg ? fgName : bgName}` +
          `  (${description})`,
      );
      skipped += 1;
      continue;
    }

    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) failures += 1;

    console.log(
      `  ${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(6)}:1` +
        `  (needs ${min})  ${fgName} on ${bgName}` +
        `  ${fg} / ${bg}\n        ${description}`,
    );
  }
}

console.log("\nContrast gate — tokens read from src/app/globals.css");

for (const [name, tokens] of Object.entries(SCOPES)) {
  run(`scope: ${name}`, tokens, SCOPED_CHECKS);
}
run("Home hero plate and panels (lab-* family)", LAB, LAB_CHECKS);

console.log("\n" + "=".repeat(78));
if (failures === 0 && skipped === 0) {
  console.log("All contrast checks pass.\n");
  process.exit(0);
}
console.log(`${failures} failing, ${skipped} missing token(s).\n`);
process.exit(1);
