/**
 * The sidecar, and the block that gets pasted into the proposal.
 *
 * Every field on the sidecar maps one-to-one onto a field of the `figure` block
 * in src/data/proposals/types.ts. That correspondence is the entire reason the
 * sidecar exists: without it, whoever wires the animation into the proposal has
 * to re-invent the alt text and the caption a week after the diagram was made,
 * and they will write something worse.
 */

import { CANVAS } from "../lib/tokens.mjs";

export function sidecar(spec, files, { generatedAt, bytes }) {
  return {
    version: 1,
    id: spec.id,
    archetype: spec.archetype,
    title: spec.meta.title,
    description: spec.meta.description,
    alt: spec.meta.alt,
    caption: spec.meta.caption || undefined,
    tags: spec.meta.tags,
    durationMs: spec.duration,
    dimensions: { width: CANVAS.width, height: CANVAS.height },
    outputs: files,
    bytes,
    generatedAt,
    specPath: "spec.json",
  };
}

/**
 * A paste-ready `figure` block.
 *
 * Printed rather than written into src/, because which proposal it belongs to
 * and where in the running order it sits are editorial decisions, and a
 * generator that edits the proposal data behind your back is a generator you
 * stop trusting.
 */
export function figureBlock(spec, publicDir) {
  const p = (ext) => `${publicDir}/${spec.id}.${ext}`;
  const q = (s) => JSON.stringify(s);
  const lines = [
    `{`,
    `  kind: "figure",`,
    `  id: ${q(spec.id)},`,
    `  kicker: ${q(kicker(spec))},`,
    `  title: ${q(spec.meta.title)},`,
  ];
  if (spec.meta.description) lines.push(`  lead: ${q(spec.meta.description)},`);
  lines.push(
    `  src: ${q(p("svg"))},`,
    `  poster: ${q(`${publicDir}/${spec.id}.poster.svg`)},`,
    `  download: { label: "Animation (GIF)", file: ${q(p("gif"))} },`,
    `  alt: ${q(spec.meta.alt)},`,
  );
  if (spec.meta.caption) lines.push(`  caption: ${q(spec.meta.caption)},`);
  if (spec.meta.tags.length) lines.push(`  tags: ${JSON.stringify(spec.meta.tags)},`);
  lines.push(`},`);
  return lines.join("\n");
}

/**
 * The side index labels each entry with `kicker ?? title`, so a block without a
 * kicker runs the full width of the rail while its neighbours are one word.
 *
 * The first cut of this took the title's first two words, which is wrong more
 * often than it is right: "Quantities to cost and sequence" became "Quantities
 * to" and "How our tools connect" became "How our". A rail entry ending on a
 * preposition reads as a truncation bug, and it is the sort of thing nobody
 * notices until it is in front of a client.
 *
 * So: drop the leading function words a title tends to open with, take content
 * words up to the rail's width, and never end on a word that needs another one
 * after it.
 */

/** Words that cannot end a kicker, and that a title may safely open with. */
const FUNCTION_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "for", "in", "on", "at", "by",
  "as", "with", "from", "into", "onto", "our", "your", "their", "its", "this",
  "that", "how", "what", "why", "when", "where", "which",
]);

const MAX_KICKER = 18;

function kicker(spec) {
  if (spec.meta.kicker) return spec.meta.kicker;

  const words = spec.meta.title
    .split(/\s+/)
    .map((w) => w.replace(/^[^\w]+|[^\w]+$/g, ""))
    .filter(Boolean);

  // Trim the opening: "How our tools connect" is about tools, not about how.
  let i = 0;
  while (i < words.length - 1 && FUNCTION_WORDS.has(words[i].toLowerCase())) i++;
  const rest = words.slice(i);

  // Take as much as the rail holds.
  const taken = [];
  for (const w of rest) {
    if ([...taken, w].join(" ").length > MAX_KICKER) break;
    taken.push(w);
  }
  if (!taken.length) taken.push(rest[0] ?? words[0] ?? spec.id);

  // Then give back anything dangling at the end.
  while (taken.length > 1 && FUNCTION_WORDS.has(taken[taken.length - 1].toLowerCase())) {
    taken.pop();
  }

  const out = taken.join(" ");
  return out.charAt(0).toUpperCase() + out.slice(1);
}
