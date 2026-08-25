/**
 * Builds the project media manifest from the folders and the portfolio order.
 *
 *   node scripts/project-media.mjs
 *
 * Writes `src/data/projects/media.ts`. Re-run after adding or renaming an
 * asset, and after `scripts/gif-to-video.mjs`.
 *
 * WHY THIS IS GENERATED
 *
 * `HorizontalScroll` decides how far to travel from `track.scrollWidth`. Media
 * with no reserved size measures as zero width before it loads, so the pin ends
 * early and the last panels of a case study are simply unreachable — with no
 * error anywhere. Every asset therefore ships with its real dimensions in the
 * markup, and the only way to keep those honest across 120-odd files is to read
 * them off the files themselves.
 *
 * WHY THE ORDER COMES FROM A SNAPSHOT
 *
 * `data/portfolio-computational.json` is the gallery order lifted from
 * ramyayoub.net (its page bundle, found via the sitemap). Sorting the folders
 * by filename does not reproduce it: `flat-dream` numbers from `1.png` while
 * `breathing-mass` uses `01.png`, `le-monstre-merveille` prefixes every file
 * with its own slug and jumps from `-08` to `-009`, `spatial-flow` opens on
 * `00.mp4`, `la-cite-radieuse` has no `1`, and two folders skip a number
 * outright. The snapshot also carries the captions, and it resolves the one
 * real ambiguity on disk — see `posterFor`.
 *
 * It fails on the first missing file or unreadable dimension rather than
 * skipping: a dropped asset is a hole in a sequence that nobody would notice.
 */

import { execFile } from "node:child_process";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);

const SNAPSHOT = "scripts/data/portfolio-computational.json";
const ROOT = "public/projects/projects-tabs";
const OUTPUT = "src/data/projects/media.ts";
/** Public URL of the folders, which is `ROOT` minus the `public/` prefix. */
const BASE = "/projects/projects-tabs";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);

const exists = (file) => stat(file).then(() => true, () => false);

/** Intrinsic size of a still, via sharp. */
async function imageSize(file) {
  const { width, height } = await sharp(file).metadata();
  if (!width || !height) throw new Error(`no dimensions for ${file}`);
  return { width, height };
}

/** Intrinsic size of a video, via ffprobe — sharp cannot read containers. */
async function videoSize(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height",
    "-of", "csv=p=0",
    file,
  ]);
  const [width, height] = stdout.trim().split(",").map(Number);
  if (!width || !height) throw new Error(`no dimensions for ${file}`);
  return { width, height };
}

/**
 * A still for a video: the frame a reduced-motion reader sees, and what
 * `preload="none"` paints until the visitor scrolls to it.
 *
 * `morphing-sands` ships two by hand — `6.png` and `15.png` are the only files
 * on disk absent from the portfolio gallery, and each shares a stem with a
 * video. That is the rule rather than a special case: a still sharing a stem
 * with a video is that video's poster, not a gallery item. Anything else gets
 * its first frame extracted once.
 */
async function posterFor(file, onDisk, claimed) {
  const dir = path.dirname(file);
  const stem = path.basename(file, path.extname(file));

  for (const candidate of onDisk) {
    const ext = path.extname(candidate).toLowerCase();
    if (!IMAGE_EXT.has(ext) || ext === ".gif") continue;
    if (path.basename(candidate, path.extname(candidate)) !== stem) continue;
    if (claimed.has(candidate)) continue;
    return path.join(dir, candidate);
  }

  const generated = path.join(dir, stem + "-poster.jpg");
  if (!(await exists(generated))) {
    await run("ffmpeg", ["-y", "-i", file, "-frames:v", "1", "-q:v", "4", generated]);
  }
  return generated;
}

/** Public URL for a path under `public/`. */
const urlOf = (file) => BASE + "/" + path.relative(ROOT, file).split(path.sep).join("/");

async function resolveAsset(dir, entry, onDisk, claimed) {
  const file = path.join(dir, entry.file);
  if (!(await exists(file))) throw new Error(`missing file: ${file}`);

  const ext = path.extname(entry.file).toLowerCase();
  const stem = path.basename(entry.file, ext);

  // A converted GIF is served as video. `gif-to-video.mjs` leaves the original
  // in place, so the presence of the sibling is what decides — delete the mp4
  // and this reverts to shipping the GIF.
  const mp4 = path.join(dir, stem + ".mp4");
  const webm = path.join(dir, stem + ".webm");
  const converted = ext === ".gif" && (await exists(mp4));

  if (VIDEO_EXT.has(ext) || converted) {
    const primary = converted ? mp4 : file;
    const sources = [urlOf(primary)];
    if (await exists(webm)) sources.push(urlOf(webm));
    const { width, height } = await videoSize(primary);
    return {
      kind: "video",
      sources,
      poster: urlOf(await posterFor(primary, onDisk, claimed)),
      width,
      height,
      caption: entry.caption,
    };
  }

  if (!IMAGE_EXT.has(ext)) throw new Error(`unsupported asset: ${file}`);
  const { width, height } = await imageSize(file);
  return {
    kind: "image",
    src: urlOf(file),
    // Only reachable when a GIF has no converted sibling. Next's optimiser
    // re-encodes a GIF to a still and drops the animation, so it has to be
    // told to leave this one alone.
    ...(ext === ".gif" ? { unoptimized: true } : {}),
    width,
    height,
    caption: entry.caption,
  };
}

/** The card cover is always a still — a grid of nine autoplaying videos is not a grid. */
async function resolveCover(dir, coverFile) {
  const file = path.join(dir, coverFile);
  if (!(await exists(file))) throw new Error(`missing cover: ${file}`);

  const ext = path.extname(coverFile).toLowerCase();
  if (IMAGE_EXT.has(ext) && ext !== ".gif") {
    return { src: urlOf(file), ...(await imageSize(file)) };
  }

  const stem = path.basename(coverFile, ext);
  const still = path.join(dir, stem + "-poster.jpg");
  if (!(await exists(still))) {
    await run("ffmpeg", ["-y", "-i", file, "-frames:v", "1", "-q:v", "4", still]);
  }
  return { src: urlOf(still), ...(await imageSize(still)) };
}

const HEADER = [
  "/**",
  " * GENERATED by `node scripts/project-media.mjs` — do not edit by hand.",
  " *",
  " * Order and captions come from the portfolio snapshot in `scripts/data/`;",
  " * dimensions are read off the files. The sizes are load-bearing: without",
  " * them the pinned horizontal scroll measures its travel before the media",
  " * loads and stops short of the last panel.",
  " */",
  "",
  "export type ProjectAsset =",
  "  | {",
  '      kind: "image";',
  "      src: string;",
  "      /** Set on a GIF: Next's optimiser would flatten it to a still. */",
  "      unoptimized?: boolean;",
  "      width: number;",
  "      height: number;",
  "      caption?: string;",
  "    }",
  "  | {",
  '      kind: "video";',
  "      /** mp4 first, webm after it; the browser takes the first it can play. */",
  "      sources: string[];",
  "      poster: string;",
  "      width: number;",
  "      height: number;",
  "      caption?: string;",
  "    };",
  "",
  "export type ProjectMedia = {",
  "  cover: { src: string; width: number; height: number };",
  "  assets: ProjectAsset[];",
  "};",
  "",
].join("\n");

async function main() {
  const snapshot = JSON.parse(await readFile(SNAPSHOT, "utf8"));
  const manifest = {};

  for (const project of snapshot) {
    const dir = path.join(ROOT, project.id);
    if (!(await exists(dir))) throw new Error(`missing folder: ${dir}`);

    const onDisk = (await readdir(dir)).filter((f) => f !== ".gitkeep");
    const claimed = new Set(project.gallery.map((g) => g.file));
    claimed.add(project.cover);

    const assets = [];
    for (const entry of project.gallery) {
      assets.push(await resolveAsset(dir, entry, onDisk, claimed));
    }

    manifest[project.id] = {
      cover: await resolveCover(dir, project.cover),
      assets,
    };

    const videos = assets.filter((a) => a.kind === "video").length;
    console.log(
      project.id.padEnd(48) +
        ` ${String(assets.length).padStart(2)} assets ` +
        `(${assets.length - videos} still, ${videos} video)`,
    );
  }

  const declaration =
    "export const projectMedia: Record<string, ProjectMedia> = " +
    JSON.stringify(manifest, null, 2) +
    ";\n";

  await writeFile(OUTPUT, HEADER + "\n" + declaration);

  const total = Object.values(manifest).reduce((n, p) => n + p.assets.length, 0);
  console.log(`\n${OUTPUT}  ${Object.keys(manifest).length} projects, ${total} assets`);
}

main().catch((error) => {
  console.error(error.stderr ?? error);
  process.exit(1);
});
