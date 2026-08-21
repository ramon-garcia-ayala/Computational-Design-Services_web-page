/**
 * Builds the preloader's CSS mask from the full-resolution logo.
 *
 *   node scripts/logo-mask.mjs
 *
 * The preloader clips its glyph grid to the letterforms with `mask-image`,
 * so the only channel that matters is alpha. The source logo is 3103x611 and
 * 161 KB, which is far more than a mask needs and — more to the point — big
 * enough to arrive late, which would show the grid as a bare rectangle for a
 * frame or two before the mask clipped it. Palette-quantising to 16 colours
 * at 1520px brings it to ~7 KB while keeping 13 distinct alpha levels, which
 * is more than the edges need once the browser downscales to the ~600px the
 * overlay actually renders at.
 *
 * Re-run this whenever `public/logo/logo.png` changes.
 */

import { stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "public/logo/logo.png";
const OUTPUT = "public/logo/logo-mask.png";
const WIDTH = 1520;
const COLORS = 16;

async function main() {
  const source = path.resolve(SOURCE);
  const output = path.resolve(OUTPUT);

  const meta = await sharp(source).metadata();
  if (!meta.hasAlpha) {
    console.error(
      `${SOURCE} has no alpha channel. The mask needs the letterforms in ` +
        `alpha (transparent background), not ink on white.`,
    );
    process.exit(1);
  }

  const buffer = await sharp(source)
    .resize(WIDTH)
    .ensureAlpha()
    .png({ palette: true, colors: COLORS, compressionLevel: 9, effort: 10 })
    .toBuffer();

  await writeFile(output, buffer);

  const before = (await stat(source)).size;
  const after = buffer.length;
  console.log(`${SOURCE}  ${meta.width}x${meta.height}  ${(before / 1024).toFixed(0)} KB`);
  console.log(`${OUTPUT}  ${WIDTH}px  ${(after / 1024).toFixed(1)} KB`);
  console.log(`aspect ratio: ${meta.width} / ${meta.height}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
