/**
 * Builds the site's icon set from the full-resolution logo.
 *
 *   node scripts/favicon.mjs
 *
 * The logo is a 3103x611 wordmark, and a wordmark at 16px is a smear. So the
 * icons carry only the `R²` glyph — measured out of the source by its own
 * alpha profile rather than hardcoded, so a re-exported logo re-crops itself
 * instead of silently shifting off-centre. The glyph is repainted in `fg` on
 * a solid `carbon` plate: the source ink is near-black on transparent, which
 * vanishes into a dark browser tab, and a plate is also what Google's favicon
 * crawler wants (it rejects anything not square).
 *
 * Three outputs, all under `src/app/` where Next's file conventions pick them
 * up and write the <link> tags themselves — do not also declare `icons` in
 * the metadata export, that duplicates every tag.
 *
 *   favicon.ico    16 / 32 / 48, for the address bar and Google's crawler
 *   icon.png       192, a multiple of 48 as Google's favicon docs require
 *   apple-icon.png 180, Apple's touch-icon size
 *
 * Re-run this whenever `public/logo/logo.png` changes.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "public/logo/logo.png";
const OUT_DIR = "src/app";

/** Site tokens, straight from the `@theme` block in globals.css. */
const INK = { r: 0xf2, g: 0xf4, b: 0xf0 }; // --color-fg
const PLATE = { r: 0x0a, g: 0x0c, b: 0x0b }; // --color-carbon

/**
 * Fraction of the plate left empty on each side.
 *
 * Two values because the two jobs disagree. A touch icon is cropped and
 * rounded by the OS, so it wants a margin; a 16px tab favicon has 16 pixels
 * total and spending three a side on air is what turned the R's bowl and leg
 * into one grey bar. `TIGHT` is roughly a pixel at 16, two at 32, three at 48.
 */
const INSET = 0.18;
const INSET_TIGHT = 0.06;

/** At and below this, use `INSET_TIGHT` and sharpen the downscaled edges. */
const SMALL = 48;

/** Sizes packed into favicon.ico. 48 is the one Google reads. */
const ICO_SIZES = [16, 32, 48];

/**
 * Bounding box of the leading glyph.
 *
 * Columns whose alpha sums to nothing separate the letters, so the first run
 * of inked columns is `R²` and the first-to-last inked rows are its height.
 * The superscript sits above the R's cap, which is why the vertical extent is
 * taken over the whole image rather than over that column range.
 */
async function firstGlyphBox(source) {
  const { data, info } = await sharp(source).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const columns = new Array(width).fill(0);
  const rows = new Array(height).fill(0);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * channels + 3];
      columns[x] += alpha;
      rows[y] += alpha;
    }
  }

  // A threshold rather than `> 0`: PNG edges carry a haze of 1-2 alpha that
  // would otherwise merge every glyph into one run.
  const inked = (total) => total > 255 * 2;

  let left = columns.findIndex(inked);
  if (left < 0) throw new Error(`${SOURCE} has no inked pixels`);
  let right = left;
  while (right + 1 < width && inked(columns[right + 1])) right += 1;

  const top = rows.findIndex(inked);
  let bottom = height - 1;
  while (bottom > top && !inked(rows[bottom])) bottom -= 1;

  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

/** The glyph, repainted in `INK`, at the given pixel size. */
async function markBuffer(source, box, width, height, sharpen) {
  let pipeline = sharp(source)
    .extract(box)
    .extractChannel("alpha")
    .resize(width, height, { fit: "fill" });

  // Lanczos leaves a 540px glyph reduced to ~14px as a grey smear; a light
  // unsharp pass puts the strokes back without haloing at this scale.
  if (sharpen) pipeline = pipeline.sharpen({ sigma: 0.6 });

  const alpha = await pipeline.toBuffer();

  return sharp({ create: { width, height, channels: 3, background: INK } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
}

/** One square icon: the glyph centred on a carbon plate. */
async function plate(source, box, size) {
  const small = size <= SMALL;
  const inset = small ? INSET_TIGHT : INSET;
  const inner = Math.round(size * (1 - inset * 2));
  const ratio = box.width / box.height;
  const width = ratio >= 1 ? inner : Math.round(inner * ratio);
  const height = ratio >= 1 ? Math.round(inner / ratio) : inner;
  const mark = await markBuffer(source, box, width, height, small);

  return sharp({
    create: { width: size, height: size, channels: 4, background: { ...PLATE, alpha: 1 } },
  })
    .composite([
      {
        input: mark,
        left: Math.round((size - width) / 2),
        top: Math.round((size - height) / 2),
      },
    ])
    /* No `effort` here, deliberately. Above the default it switches sharp's
       PNG encoder to a quantised palette, which drops a constant alpha
       channel — and Next's ICO decoder rejects any payload that is not RGBA,
       failing the whole route with "The PNG is not in RGBA format!" rather
       than just the icon. */
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Packs PNGs into an ICO container.
 *
 * PNG-compressed entries are legal at every size in the format and are what
 * every browser in the support matrix reads; the BMP payload the format also
 * allows would mean hand-writing a bottom-up DIB with a separate AND mask for
 * no gain.
 */
function ico(images) {
  const HEADER = 6;
  const ENTRY = 16;
  const header = Buffer.alloc(HEADER);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = HEADER + ENTRY * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(ENTRY);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette size, 0 for truecolour
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

async function main() {
  const source = path.resolve(SOURCE);
  const meta = await sharp(source).metadata();
  if (!meta.hasAlpha) {
    console.error(
      `${SOURCE} has no alpha channel. The icons are cut from the letterforms ` +
        `in alpha (transparent background), not ink on white.`,
    );
    process.exit(1);
  }

  const box = await firstGlyphBox(source);
  console.log(`${SOURCE}  ${meta.width}x${meta.height}`);
  console.log(`glyph      ${box.width}x${box.height} at ${box.left},${box.top}`);

  const written = [];
  const write = async (name, data) => {
    await writeFile(path.resolve(OUT_DIR, name), data);
    written.push([name, data.length]);
  };

  const scaled = await Promise.all(
    ICO_SIZES.map(async (size) => ({ size, data: await plate(source, box, size) })),
  );
  await write("favicon.ico", ico(scaled));
  await write("icon.png", await plate(source, box, 192));
  await write("apple-icon.png", await plate(source, box, 180));

  for (const [name, bytes] of written) {
    console.log(`${OUT_DIR}/${name}`.padEnd(24), `${(bytes / 1024).toFixed(1)} KB`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
