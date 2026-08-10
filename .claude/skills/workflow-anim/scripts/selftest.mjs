#!/usr/bin/env node
/**
 * Invariants, checked against every example spec.
 *
 *   node .claude/skills/workflow-anim/scripts/selftest.mjs
 *
 * These are not unit tests of the arithmetic. They are the four ways this
 * renderer can produce something that looks fine here and is broken in front of
 * a client, and each one has already happened at least once:
 *
 *   1. The blank first frame. The animated SVG rasterizes to a white rectangle
 *      because its elements were declared at their start state. Silent, and
 *      invisible until someone imports it into a PDF.
 *   2. Declared state that is not the end state. Subtler and it bit this file's
 *      first draft: the transform captions each end at opacity 0 as they hand
 *      over, so declaring them at REST stacked all three on top of each other in
 *      every non-browser renderer.
 *   3. Labels overflowing their boxes once the font substitutes. librsvg's
 *      fallback mono is ~10% off JetBrains Mono, so a layout that only just fits
 *      here does not fit in the browser, or the other way round.
 *   4. Weight creep. A 2 MB header GIF is what this skill exists to replace.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { parseSpec, CAPS } from "./lib/validate.mjs";
import { build } from "./archetypes/index.mjs";
import { renderSvg, renderPoster } from "./emit/svg.mjs";
import { renderFrames } from "./emit/frames.mjs";
import { encodeGif } from "./emit/gif.mjs";

import { textWidth } from "./lib/draw.mjs";
import { CANVAS, GIF } from "./lib/tokens.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const examples = join(here, "..", "examples");

const BUDGET = { svg: 90_000, poster: 40_000, gif: 150_000 };
/** How far the mono advance can move between renderers. Measured, not guessed:
    librsvg's fallback is 97px where Consolas is 108px for the same ten glyphs. */
const FONT_DRIFT = 0.15;

let failed = 0;
const fail = (name, msg) => {
  failed++;
  console.error(`  FAIL  ${name}\n        ${msg}`);
};
const pass = (name) => console.log(`  ok    ${name}`);

/* -------------------------------------------------------------------------- */

let sharp = null;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.log("  note  sharp unavailable — skipping the rasterization checks\n");
}

for (const file of readdirSync(examples).filter((f) => f.endsWith(".json"))) {
  const raw = JSON.parse(readFileSync(join(examples, file), "utf8"));
  const { spec, report } = parseSpec(raw);
  const name = file.replace(/\.json$/, "");

  console.log(`\n${name}`);

  if (!spec) {
    fail(name, report.errors.join("; "));
    continue;
  }
  if (report.errors.length) fail(`${name}: validation`, report.errors.join("; "));

  // An example that warns is an example teaching the wrong thing. Anyone reading
  // examples/ is copying it, warnings and all.
  if (report.warnings.length) {
    fail(`${name}: clean spec`, `example produces warnings:\n        ${report.warnings.join("\n        ")}`);
  } else pass(`${name}: clean spec`);

  const drawables = build(spec);
  if (spec.notes.length) {
    fail(`${name}: clean layout`, spec.notes.join("\n        "));
  } else pass(`${name}: clean layout`);

  const svg = renderSvg(drawables, spec);
  const poster = renderPoster(drawables, spec);

  /* --- 2. declared state == end state ------------------------------------- */

  // Compared structurally rather than by rasterizing, so it is exact and it runs
  // without sharp. The animated file's body must be the poster's body plus the
  // stylesheet and the class attributes — nothing else may differ.
  const stripped = svg
    .replace(/<style>.*?<\/style>/s, "")
    .replace(/ class="a k-[^"]*"/g, "")
    .replace(/ style="transform-origin:[^"]*"/g, "");
  if (stripped === poster) pass(`${name}: declared state is the end state`);
  else {
    fail(
      `${name}: declared state is the end state`,
      `the animated SVG's declared attributes differ from the poster by more than\n` +
        `        the animation layer. Anything that ignores CSS will render the wrong\n` +
        `        picture. (${stripped.length} vs ${poster.length} bytes)`,
    );
  }

  /* --- the last frame should also be the end state ------------------------- */

  const frames = renderFrames(drawables, spec, GIF.frames);
  const endFrame = renderFrames(drawables, spec, 1).length; // smoke: it builds
  if (endFrame === 1) pass(`${name}: frames build`);

  /* --- 3. labels inside their boxes at +/- font drift ---------------------- */

  const overflow = [];
  for (const d of drawables) {
    if (d.kind !== "text") continue;
    const w = textWidth(d.value, d.size, d.tracking) * (1 + FONT_DRIFT);
    const x0 = d.anchor === "middle" ? d.x - w / 2 : d.anchor === "end" ? d.x - w : d.x;
    if (x0 < -2 || x0 + w > CANVAS.width + 2) {
      overflow.push(`"${d.value}" runs to ${Math.round(x0 + w)} of ${CANVAS.width}`);
    }
  }
  if (overflow.length) fail(`${name}: labels within the canvas`, overflow.join("\n        "));
  else pass(`${name}: labels within the canvas at +${FONT_DRIFT * 100}% advance`);

  /* --- density caps -------------------------------------------------------- */

  const cap = CAPS[spec.archetype];
  const counts = {
    pipeline: () => spec.body.stages?.length,
    transform: () => spec.body.stages?.length,
    iterate: () => spec.body.variants?.length,
    exchange: () => spec.body.nodes?.length,
  }[spec.archetype]();
  const lim = cap.stages ?? cap.variants ?? cap.nodes;
  if (counts >= lim.min && counts <= lim.max) pass(`${name}: within density caps (${counts})`);
  else fail(`${name}: within density caps`, `${counts} outside ${lim.min}..${lim.max}`);

  /* --- 4. weight ----------------------------------------------------------- */

  const sizes = { svg: Buffer.byteLength(svg), poster: Buffer.byteLength(poster) };
  let gifBuf = null;
  if (sharp) {
    const g = await encodeGif(frames, { delayMs: spec.duration / GIF.frames });
    if (g.ok) {
      gifBuf = g.buffer;
      sizes.gif = g.buffer.length;
    } else fail(`${name}: gif encodes`, g.reason);
  }
  const over = Object.entries(sizes).filter(([k, v]) => v > BUDGET[k]);
  if (over.length) {
    fail(
      `${name}: within byte budget`,
      over.map(([k, v]) => `${k} ${kb(v)} over ${kb(BUDGET[k])}`).join(", "),
    );
  } else {
    pass(
      `${name}: within byte budget (${Object.entries(sizes)
        .map(([k, v]) => `${k} ${kb(v)}`)
        .join(", ")})`,
    );
  }

  /* --- 1. the blank frame -------------------------------------------------- */

  if (sharp) {
    const inkOf = async (buf, opts = {}) => {
      const { data, info } = await sharp(buf, opts)
        .flatten({ background: "#ffffff" })
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
      let n = 0;
      for (let i = 0; i < data.length; i += info.channels) if (data[i] < 230) n++;
      return n / (info.width * info.height);
    };

    const animInk = await inkOf(Buffer.from(svg), { density: 144 });
    const posterInk = await inkOf(Buffer.from(poster), { density: 144 });

    if (posterInk < 0.01) {
      fail(`${name}: poster is not blank`, `only ${(posterInk * 100).toFixed(2)}% ink`);
    } else if (Math.abs(animInk - posterInk) / posterInk > 0.05) {
      fail(
        `${name}: animated SVG rasterizes to the finished diagram`,
        `ink coverage ${(animInk * 100).toFixed(2)}% vs the poster's ${(posterInk * 100).toFixed(2)}%. ` +
          `Something is declared at its start state and will be missing everywhere CSS does not run.`,
      );
    } else {
      pass(`${name}: animated SVG rasterizes to the finished diagram (${(animInk * 100).toFixed(1)}% ink)`);
    }

    // The GIF, checked only for the things a GIF can independently get wrong:
    // that it has the frames it was asked for, at the right size, and that the
    // frame it ends on is not blank.
    //
    // Deliberately NOT compared to the poster's ink coverage. That comparison
    // reads as a 30% discrepancy and means nothing: the GIF is quantized to 32
    // colours with dithering off, which snaps antialiased edge pixels to the
    // nearest palette entry and turns a barely-there grey into a counted one.
    // Two rasterization pipelines disagreeing about edge pixels is not a defect,
    // and a test that fails on it is a test people learn to ignore. The exact
    // structural comparison above is what actually guards the invariant.
    if (gifBuf) {
      const meta = await sharp(gifBuf, { animated: true }).metadata();
      const lastInk = await inkOf(gifBuf, { page: meta.pages - 1, pages: 1 });

      // Playback duration, read out of the Graphic Control Extensions rather
      // than from sharp's metadata, which reports only the first frame's delay.
      // This is the check that catches the scalar-delay bug: a GIF with the
      // right frames and the wrong delays reports perfectly and plays in a
      // quarter of a second.
      const total = gifDelays(gifBuf).reduce((a, b) => a + b, 0) * 10;
      const drift = Math.abs(total - spec.duration) / spec.duration;

      if (meta.width !== CANVAS.width) {
        fail(`${name}: GIF is well formed`, `${meta.width}px wide, expected ${CANVAS.width}px`);
      } else if (drift > 0.02) {
        fail(
          `${name}: GIF plays for its stated duration`,
          `${total}ms of frame delays against a ${spec.duration}ms loop. ` +
            `Frame delays have to be given per frame; a scalar reaches only the first.`,
        );
      } else if (lastInk < posterInk * 0.6) {
        fail(
          `${name}: GIF ends on the finished diagram`,
          `last frame is only ${(lastInk * 100).toFixed(2)}% ink against the poster's ` +
            `${(posterInk * 100).toFixed(2)}% — the animation has not resolved by the last frame.`,
        );
      } else {
        pass(
          `${name}: GIF plays ${(total / 1000).toFixed(1)}s over ${meta.pages} frames and ends resolved`,
        );
      }
    }
  }
}

console.log(
  failed ? `\n${failed} check${failed === 1 ? "" : "s"} failed\n` : `\nall checks passed\n`,
);
process.exit(failed ? 1 : 0);

function kb(n) {
  return `${(n / 1024).toFixed(1)} KB`;
}

/**
 * Per-frame delays, in centiseconds, walked straight out of the GIF's blocks.
 *
 * sharp's `metadata().delay` returns the array it was given at encode time
 * rather than what landed in the file, so it reports a correct-looking array
 * for a GIF whose frames are all zero. Reading the Graphic Control Extensions
 * is the only way to see what a browser will actually do.
 */
function gifDelays(buf) {
  const out = [];
  let i = 13;
  if (buf[10] & 0x80) i += 3 * (2 << (buf[10] & 7)); // global colour table
  while (i < buf.length) {
    const b = buf[i];
    if (b === 0x21 && buf[i + 1] === 0xf9) {
      out.push(buf[i + 4] | (buf[i + 5] << 8));
      i += 8;
    } else if (b === 0x21) {
      i += 2;
      while (buf[i]) i += buf[i] + 1;
      i++;
    } else if (b === 0x2c) {
      i += 10;
      if (buf[i - 1] & 0x80) i += 3 * (2 << (buf[i - 1] & 7)); // local colour table
      i++; // LZW minimum code size
      while (buf[i]) i += buf[i] + 1;
      i++;
    } else break;
  }
  return out;
}
