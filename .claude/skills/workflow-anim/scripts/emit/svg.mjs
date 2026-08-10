/**
 * The animated SVG. The primary artifact.
 *
 * White background, CSS keyframes, no JavaScript, no external references — it
 * drops into an <img> tag, into an email, into a slide, and it stays crisp at
 * any size. Roughly a hundredth the weight of the equivalent GIF.
 *
 * THE INVARIANT THIS FILE EXISTS TO ENFORCE
 *
 * Every element is *declared* at the state it holds when the loop ends, and the
 * animation runs toward that state from the keyframes. Anything that does not
 * execute CSS — librsvg (which is how we make the GIF), a PDF importer, an old
 * mail client — renders the attributes as declared and therefore sees the
 * completed diagram.
 *
 * Declare the start state instead, as is the natural way to write it, and all
 * of those render a blank white rectangle. Silently. In front of the client.
 * `animation-fill-mode: backwards` is what makes the browser still show the
 * start state during the delay, so nothing is lost by declaring the end.
 *
 * "The end state" is `sample(track, duration)`, not the drawable's rest values.
 * Those differ more often than they look like they would: a caption that hands
 * over to the next one ends at opacity 0, and declaring it at rest puts all
 * three captions on top of each other in every non-browser renderer. The rest
 * values are where the drawable was authored; the sample is where the animation
 * actually leaves it.
 *
 * This is the same rule the site itself follows for GSAP reveals: settling means
 * writing the end state, never clearing the transform.
 */

import { renderDrawable, sortDrawables, animClass, esc } from "../lib/draw.mjs";
import { toKeyframes, sample, REST } from "../lib/timeline.mjs";
import { CANVAS } from "../lib/tokens.mjs";

export function renderSvg(drawables, spec, { animated = true } = {}) {
  const list = sortDrawables(drawables);
  const duration = spec.duration;

  const end = (d) => (d.track ? sample(d.track, duration) : REST);
  const body = list.map((d) => renderDrawable(d, end(d), { animated })).join("");

  const style = animated ? stylesheet(list, duration) : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}"`,
    ` width="${CANVAS.width}" height="${CANVAS.height}" role="img"`,
    ` aria-label="${esc(spec.meta.alt)}">`,
    `<title>${esc(spec.meta.title)}</title>`,
    `<desc>${esc(spec.meta.alt)}</desc>`,
    style,
    body,
    `</svg>`,
  ].join("");
}

function stylesheet(list, duration) {
  const animated = list.filter((d) => d.track);
  if (!animated.length) return "";

  const frames = animated.map((d) => toKeyframes(animClass(d), d.track, duration));
  const rules = animated.map(
    (d) => `.${animClass(d)}{animation-name:${animClass(d)}}`,
  );

  // One media query around the whole animation layer. A reader who has asked
  // their system for less motion gets the finished diagram — which is exactly
  // what the declared attributes already are, so the branch costs nothing and
  // needs no second rendering path. The site's own rule, applied to a file.
  return (
    `<style>` +
    `@media (prefers-reduced-motion:no-preference){` +
    `.a{animation-duration:${duration}ms;animation-iteration-count:infinite;` +
    `animation-fill-mode:backwards;animation-timing-function:cubic-bezier(.22,1,.36,1);` +
    `transform-box:view-box}` +
    rules.join("") +
    frames.join("") +
    `}` +
    `</style>`
  );
}

/**
 * The poster: the same drawables with every animation resolved to its end state.
 *
 * Proposals get printed to PDF and forwarded as email attachments. An animation
 * that prints as its first frame prints as a blank box, so the poster is what
 * any <img> fallback, any print stylesheet and any reduced-motion branch points
 * at. It is also what the selftest compares the animated file against.
 */
export const renderPoster = (drawables, spec) => renderSvg(drawables, spec, { animated: false });
