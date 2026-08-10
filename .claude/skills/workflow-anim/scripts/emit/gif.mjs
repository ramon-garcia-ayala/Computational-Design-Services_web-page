/**
 * The GIF. Secondary, and deliberately so.
 *
 * The SVG is better in every way that matters on a web page. The GIF exists for
 * the places an SVG does not go: pasted into an email body, dropped on a
 * PowerPoint slide, sent over WhatsApp to a site manager. Those are real, and
 * they are how a proposal actually circulates in construction.
 *
 * sharp arrives in this repo as an optional transitive dependency of Next.js, so
 * it can vanish under `npm ci --omit=optional` or a Next major that drops it.
 * The whole module therefore fails soft: no sharp means no GIF, a printed note,
 * and an exit code of zero. The SVG, the poster and the metadata are already on
 * disk by then, and those are the parts a proposal cannot ship without.
 */

import { GIF, CANVAS } from "../lib/tokens.mjs";

export async function encodeGif(frameSvgs, { delayMs, scale = GIF.scale, colours = GIF.colours }) {
  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    return { ok: false, reason: "sharp is not installed — SVG and poster were still written" };
  }

  try {
    const pages = [];
    for (const svg of frameSvgs) {
      pages.push(
        await sharp(Buffer.from(svg), {
          // librsvg defaults to 72dpi and will otherwise resize the document for
          // you; setting density and then resizing explicitly is what keeps the
          // output exactly 800x400 no matter what scale we supersample at.
          density: 72 * scale,
        })
          .resize(CANVAS.width, CANVAS.height, { fit: "fill" })
          .flatten({ background: "#ffffff" })
          .png()
          .toBuffer(),
      );
    }

    // The working incantation is an array of encoded buffers with join.animated.
    // Passing raw pixels with {pages, pageHeight} throws "field n-pages not found".
    //
    // `delay` MUST be an array with one entry per frame. Passed as a scalar it
    // reaches only the first frame's Graphic Control Extension and every other
    // frame is written with a delay of zero — the GIF then flashes through the
    // whole animation in a fraction of a second, or plays at whatever the
    // browser clamps zero to. It looks encoded, it reports the right frame
    // count, and it is unwatchable.
    const delays = new Array(pages.length).fill(Math.round(delayMs));

    const buf = await sharp(pages, { join: { animated: true } })
      .gif({
        loop: 0,
        delay: delays,
        colours,
        // Flat-colour vector art dithers badly — it speckles the large white
        // areas — and dithering roughly triples the file for the privilege.
        dither: GIF.dither,
      })
      .toBuffer();

    // libvips merges runs of identical consecutive frames and sums their delays,
    // so a diagram that holds still at the end of its loop encodes as one long
    // frame rather than six. Total playback is unchanged; the frame count is
    // legitimately lower than what went in. Anything checking this file should
    // assert on duration, not on page count.
    return { ok: true, buffer: buf, frames: pages.length, durationMs: delays.reduce((a, b) => a + b, 0) };
  } catch (err) {
    return { ok: false, reason: `sharp failed: ${err.message}` };
  }
}
