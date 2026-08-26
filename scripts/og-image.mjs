/**
 * Builds the Open Graph card from the hero's own geodesic frame.
 *
 *   node scripts/og-image.mjs
 *
 * Writes `public/og.jpg` at 1200x630, the size every social platform crops
 * from. Re-run if the frame sequence or the logo changes.
 *
 * The source is one frame of the sequence the home page already scrubs
 * through, so the card shows the same object a visitor lands on rather than a
 * separately art-directed image that would date the moment the hero changed.
 *
 * **The frame is cropped, never composited onto a flat plate.** The sequence
 * is rendered on a greige that runs roughly #a7a5a3 to #c0bcb8 across the
 * frame — close to the site's `--color-lab-bg` (#b8b4b1) but not equal to it,
 * and not equal across its own width either. Dropping a resized frame onto a
 * flat swatch of the token therefore leaves a visible rectangle. Cropping the
 * frame full-bleed has no seam to hide, which is the same reasoning
 * `HeroOverlay`'s bottom gradient is built on.
 *
 * JPEG rather than PNG: this is a photographic gradient, and the PNG runs
 * several times larger for no visible gain. Some scrapers also cap the file
 * size they will fetch.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const FRAME = "public/geodesic-01/webp/frame-0001.webp";
const LOGO = "public/logo/logo-mask.png";
const OUTPUT = "public/og.jpg";

/** The size every platform crops from; 1.91:1. */
const WIDTH = 1200;
const HEIGHT = 630;

/** `--color-lab-ink`, the ink the hero wordmark uses on this plate. */
const INK = { r: 0x2a, g: 0x28, b: 0x26 };

/** Wordmark placement, in output pixels. */
const LOGO_WIDTH = 300;
const LOGO_LEFT = 64;
const LOGO_TOP = 56;

async function main() {
  const frame = sharp(path.resolve(FRAME));
  const { width, height } = await frame.metadata();
  if (!width || !height) throw new Error(`no dimensions for ${FRAME}`);

  /* Widest crop the frame can give at 1.91:1, taken from the middle: the
     geodesic sits centred in the frame, so a centred band keeps it whole. */
  const cropHeight = Math.round(width / (WIDTH / HEIGHT));
  if (cropHeight > height) throw new Error(`${FRAME} is too short to crop to 1.91:1`);

  const base = await frame
    .extract({
      left: 0,
      top: Math.round((height - cropHeight) / 2),
      width,
      height: cropHeight,
    })
    .resize(WIDTH, HEIGHT)
    .toBuffer();

  /* The wordmark as a mask filled with ink, exactly as the hero does it — the
     source PNG's own ink is near-black and only its alpha carries the shape. */
  const logoMeta = await sharp(path.resolve(LOGO)).metadata();
  const logoHeight = Math.round((LOGO_WIDTH * logoMeta.height) / logoMeta.width);
  const alpha = await sharp(path.resolve(LOGO))
    .resize(LOGO_WIDTH, logoHeight)
    .extractChannel("alpha")
    .toBuffer();
  const wordmark = await sharp({
    create: { width: LOGO_WIDTH, height: logoHeight, channels: 3, background: INK },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer();

  const card = await sharp(base)
    .composite([{ input: wordmark, left: LOGO_LEFT, top: LOGO_TOP }])
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();

  await writeFile(path.resolve(OUTPUT), card);
  console.log(`${OUTPUT}  ${WIDTH}x${HEIGHT}  ${(card.length / 1024).toFixed(0)} KB`);
  console.log(`source: ${FRAME} (${width}x${height}), cropped to ${width}x${cropHeight}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
