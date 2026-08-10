#!/usr/bin/env node
/**
 * workflow-anim — render a spec into an animated SVG, a poster, a GIF and a
 * metadata sidecar.
 *
 *   node .claude/skills/workflow-anim/scripts/render.mjs <spec.json> \
 *        --out public/proposals/<slug>/anim/<name>
 *
 * Options
 *   --out <dir>     where the files land. Default: alongside the spec.
 *   --frames <n>    GIF frame count (default 24). More is smoother and heavier.
 *   --no-gif        skip the raster twin.
 *   --quiet         warnings only.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

import { parseSpec } from "./lib/validate.mjs";
import { build } from "./archetypes/index.mjs";
import { renderSvg, renderPoster } from "./emit/svg.mjs";
import { renderFrames } from "./emit/frames.mjs";
import { encodeGif } from "./emit/gif.mjs";
import { sidecar, figureBlock } from "./emit/meta.mjs";
import { GIF } from "./lib/tokens.mjs";

const args = process.argv.slice(2);
/** Flags that take a value; anything else starting with -- is a switch. */
const VALUED = new Set(["out", "frames"]);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? dflt : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

let specPath = null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith("--")) {
    if (VALUED.has(a.slice(2))) i++;
    continue;
  }
  specPath = a;
  break;
}
if (!specPath) {
  console.error("usage: render.mjs <spec.json> --out <dir>");
  process.exit(2);
}

const quiet = has("quiet");
const say = (...m) => !quiet && console.log(...m);

/* -------------------------------------------------------------------------- */

let raw;
try {
  raw = JSON.parse(readFileSync(resolve(specPath), "utf8"));
} catch (err) {
  console.error(`Could not read ${specPath}: ${err.message}`);
  process.exit(2);
}

const { spec, report } = parseSpec(raw);

for (const w of report.warnings) console.warn(`  warn  ${w}`);
if (!report.ok) {
  for (const e of report.errors) console.error(`  error ${e}`);
  process.exit(1);
}

const outDir = resolve(flag("out", dirname(resolve(specPath))));
mkdirSync(outDir, { recursive: true });

const drawables = build(spec);
// Layout-time complaints — things only the archetype's arithmetic can know.
for (const n of spec.notes) console.warn(`  warn  ${n}`);

const svg = renderSvg(drawables, spec);
const poster = renderPoster(drawables, spec);

const files = {
  svg: `${spec.id}.svg`,
  poster: `${spec.id}.poster.svg`,
};
writeFileSync(join(outDir, files.svg), svg);
writeFileSync(join(outDir, files.poster), poster);
writeFileSync(join(outDir, "spec.json"), `${JSON.stringify(raw, null, 2)}\n`);

const bytes = { svg: Buffer.byteLength(svg), poster: Buffer.byteLength(poster) };

if (!has("no-gif")) {
  const frameCount = Math.max(8, Math.min(48, Number(flag("frames", GIF.frames)) || GIF.frames));
  const frames = renderFrames(drawables, spec, frameCount);
  const gif = await encodeGif(frames, { delayMs: spec.duration / frameCount });
  if (gif.ok) {
    files.gif = `${spec.id}.gif`;
    writeFileSync(join(outDir, files.gif), gif.buffer);
    bytes.gif = gif.buffer.length;
    if (bytes.gif > 150_000) {
      console.warn(
        `  warn  GIF is ${kb(bytes.gif)} — over the 150 KB budget. Try --frames 16, ` +
          `or fewer moving elements.`,
      );
    }
  } else {
    console.warn(`  note  ${gif.reason}`);
  }
}

const meta = sidecar(spec, files, { generatedAt: today(), bytes });
writeFileSync(join(outDir, `${spec.id}.json`), `${JSON.stringify(meta, null, 2)}\n`);

/* -------------------------------------------------------------------------- */

say(`\n  ${spec.meta.title}  (${spec.archetype}, ${(spec.duration / 1000).toFixed(1)}s)`);
say(`  ${outDir}`);
for (const [k, f] of Object.entries(files)) say(`    ${f.padEnd(34)} ${kb(bytes[k] ?? 0)}`);
say(`    ${spec.id}.json`);
say(`    spec.json`);

say(`\n  Paste into the proposal's blocks array:\n`);
say(indent(figureBlock(spec, publicPath(outDir)), 4));

// Printed every run, because it is a content rule and no validator can enforce
// it. A diagram sitting in a document that also carries pricing is a
// representation of what the client is buying.
say(
  `\n  Check before you ship: every stage above should correspond to something\n` +
    `  named in the proposal's own flow / steps / timeline blocks. If it is not\n` +
    `  in the text, it does not go in the picture.\n`,
);

/* -------------------------------------------------------------------------- */

function kb(n) {
  return n >= 1024 ? `${(n / 1024).toFixed(1)} KB` : `${n} B`;
}

function indent(s, n) {
  const pad = " ".repeat(n);
  return s
    .split("\n")
    .map((l) => pad + l)
    .join("\n");
}

/**
 * The path an `<img src>` needs: everything after /public.
 *
 * When the output went somewhere else — a scratch directory, an eval workspace —
 * there is no honest web path to print. Printing the absolute one anyway hands
 * over a paste-ready block that 404s and looks correct while doing it, so say
 * what happened instead.
 */
function publicPath(dir) {
  const parts = dir.split(sep);
  const i = parts.lastIndexOf("public");
  if (i !== -1) return `/${parts.slice(i + 1).join("/")}`;
  console.warn(
    `  warn  --out is not under public/, so the block below has no usable web path.\n` +
      `        Re-render into public/proposals/<slug>/anim/<name>, or fix the\n` +
      `        src / poster / download paths by hand before pasting.`,
  );
  return "/PUT-THESE-UNDER-public";
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
