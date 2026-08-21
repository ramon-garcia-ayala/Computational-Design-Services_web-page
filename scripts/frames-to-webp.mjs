/**
 * Converts the design-lab PNG frame sequence to WebP.
 *
 *   node scripts/frames-to-webp.mjs [--quality 82] [--in <dir>] [--out <dir>]
 *
 * Scroll-scrubbing needs every frame decoded and resident in memory before
 * the first scroll, so the sequence's total weight is a hard constraint
 * rather than an optimisation: the source PNGs run ~2.1 MB each, which is
 * some 200 MB over 96 frames and unusable on the web at any connection.
 *
 * Non-destructive by design — the PNGs are read, never touched, so a quality
 * regression is reverted by pointing `src/data/design-lab.ts` back at them.
 *
 * `sharp` is a pinned devDependency (see CLAUDE.md on why it is pinned rather
 * than relied on transitively). This is a build-time script; nothing in the
 * app imports it.
 */

import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const inDir = path.resolve(flag("in", "public/geodesic-01/frames"));
const outDir = path.resolve(flag("out", "public/geodesic-01/webp"));
const quality = Number(flag("quality", "82"));

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function main() {
  const files = (await readdir(inDir))
    .filter((f) => f.toLowerCase().endsWith(".png"))
    // Zero-padded names sort lexicographically in frame order; sorting on the
    // parsed number as well keeps that true if the padding ever changes.
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  if (files.length === 0) {
    console.error(`No PNG frames found in ${inDir}`);
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });

  let sourceBytes = 0;
  let outputBytes = 0;

  for (const file of files) {
    const from = path.join(inDir, file);
    const to = path.join(outDir, file.replace(/\.png$/i, ".webp"));

    sourceBytes += (await stat(from)).size;

    // `effort: 6` is the quality/size sweet spot; the default of 4 leaves a
    // few percent on the table and this runs once.
    const buffer = await sharp(from).webp({ quality, effort: 6 }).toBuffer();
    await writeFile(to, buffer);
    outputBytes += buffer.length;

    process.stdout.write(`\r${file} -> ${path.basename(to)}  (${files.indexOf(file) + 1}/${files.length})`);
  }

  const perFrame = outputBytes / files.length;
  console.log(`\n\n${files.length} frames  q${quality}  ->  ${outDir}`);
  console.log(`  source: ${mb(sourceBytes)}`);
  console.log(`  output: ${mb(outputBytes)}  (${(outputBytes / sourceBytes * 100).toFixed(1)}% of source)`);
  console.log(`  per frame avg: ${(perFrame / 1024).toFixed(0)} KB`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
