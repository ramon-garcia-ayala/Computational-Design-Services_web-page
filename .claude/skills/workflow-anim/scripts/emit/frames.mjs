/**
 * Static frames, sampled off the same drawables the animated SVG declares.
 *
 * This exists because librsvg rasterizes the *declared* attribute state and
 * ignores CSS keyframes entirely — verified, not assumed. So the animated file
 * cannot be the GIF's input: every frame has to be a separate document with the
 * transforms already baked in.
 *
 * That is a constraint, not a duplication. These frames go through the same
 * renderDrawable the animated file does; only the second argument differs.
 */

import { renderDrawable, sortDrawables, esc } from "../lib/draw.mjs";
import { sample, REST } from "../lib/timeline.mjs";
import { CANVAS } from "../lib/tokens.mjs";

/**
 * `count` documents evenly spaced across the loop.
 *
 * The last frame lands one step short of `duration` rather than on it, because
 * the loop's end and its start are the same instant — emitting both gives a
 * visible stutter every cycle.
 */
export function renderFrames(drawables, spec, count) {
  const list = sortDrawables(drawables);
  const step = spec.duration / count;

  return Array.from({ length: count }, (_, i) => {
    const t = i * step;
    const body = list
      .map((d) => renderDrawable(d, d.track ? sample(d.track, t) : REST))
      .join("");
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}"` +
      ` width="${CANVAS.width}" height="${CANVAS.height}">` +
      `<title>${esc(spec.meta.title)}</title>` +
      body +
      `</svg>`
    );
  });
}
