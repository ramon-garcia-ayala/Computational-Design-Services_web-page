/**
 * Converts the project GIFs to looping video.
 *
 *   node scripts/gif-to-video.mjs [--force]
 *
 * A GIF has to bypass Next's image optimiser — it re-encodes one to a still and
 * silently drops every frame but the first — so a GIF ships at whatever size it
 * was exported at. The project galleries carry 18 MB of them, one of which is
 * 5 MB on its own, and every byte lands on a visitor who opens that page.
 *
 * H.264 and VP9 of the same frames run one to two orders of magnitude smaller.
 * Each GIF gets an `.mp4` and a `.webm` beside it and the originals are left
 * untouched, so pointing the manifest back at `.gif` reverts this completely.
 *
 * Same trade the repo already made in `scripts/frames-to-webp.mjs`, which cut
 * the geodesic sequence from 191 MB to 9.4 MB.
 *
 * Re-run after adding a GIF. Existing outputs are skipped unless `--force`.
 */

import { execFile } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const ROOT = "public/projects/projects-tabs";
const FORCE = process.argv.includes("--force");

/* yuv420p and the even-dimension scale are both compatibility rather than
   taste: Safari and most hardware decoders reject odd dimensions outright, and
   a GIF is under no obligation to have even ones. */
const MP4 = [
  "-movflags", "+faststart",
  "-pix_fmt", "yuv420p",
  "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
  "-c:v", "libx264",
  "-crf", "23",
  "-preset", "slow",
  "-an",
];

const WEBM = [
  /* Explicit, not inferred. A GIF decodes as `bgra`, from which libvpx picks
     `gbrap` and then refuses to open the encoder at all — so the pixel format
     has to be named here even though the mp4 branch above needs it anyway. */
  "-pix_fmt", "yuv420p",
  "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
  "-c:v", "libvpx-vp9",
  "-crf", "34",
  "-b:v", "0",
  "-row-mt", "1",
  "-an",
];

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function sizeOf(file) {
  return (await stat(file)).size;
}

/** Every `.gif` under the project folders, with its slug. */
async function findGifs() {
  const found = [];
  for (const slug of await readdir(ROOT, { withFileTypes: true })) {
    if (!slug.isDirectory()) continue;
    const dir = path.join(ROOT, slug.name);
    for (const file of await readdir(dir)) {
      if (file.toLowerCase().endsWith(".gif")) found.push(path.join(dir, file));
    }
  }
  return found.sort();
}

async function convert(source, target, args) {
  if (!FORCE && (await exists(target))) return { target, skipped: true };
  await run("ffmpeg", ["-y", "-i", source, ...args, target], {
    maxBuffer: 1024 * 1024 * 32,
  });
  return { target, skipped: false };
}

async function main() {
  const gifs = await findGifs();
  if (gifs.length === 0) {
    console.log(`No GIFs under ${ROOT}.`);
    return;
  }

  let before = 0;
  let after = 0;

  for (const gif of gifs) {
    const base = gif.slice(0, -path.extname(gif).length);
    const source = await sizeOf(gif);
    before += source;

    const mp4 = await convert(gif, `${base}.mp4`, MP4);
    const webm = await convert(gif, `${base}.webm`, WEBM);

    const mp4Size = await sizeOf(mp4.target);
    const webmSize = await sizeOf(webm.target);
    // The browser is served whichever it can play, so the mp4 is the honest
    // figure for "what this asset now costs" — not the pair added together.
    after += mp4Size;

    const note = mp4.skipped && webm.skipped ? " (existing)" : "";
    console.log(
      `${gif}${note}\n` +
        `  gif  ${(source / 1048576).toFixed(2)} MB` +
        `  →  mp4 ${(mp4Size / 1048576).toFixed(2)} MB` +
        `  webm ${(webmSize / 1048576).toFixed(2)} MB` +
        `  (${((1 - mp4Size / source) * 100).toFixed(0)}% smaller)`,
    );
  }

  console.log(
    `\n${gifs.length} GIFs: ${(before / 1048576).toFixed(1)} MB → ` +
      `${(after / 1048576).toFixed(1)} MB served ` +
      `(${((1 - after / before) * 100).toFixed(0)}% smaller). Originals kept.`,
  );
}

main().catch((error) => {
  console.error(error.stderr ?? error);
  process.exit(1);
});
