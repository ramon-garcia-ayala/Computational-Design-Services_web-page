/**
 * The one pseudo-random generator in the module.
 *
 * Every archetype with a seed slider draws from here, and none of them call
 * `Math.random()`. That is not tidiness — it is the product. The spec travels
 * in the URL fragment, so a link is only a link if it renders the same thing
 * twice; a single random call anywhere in a render path turns a shared tool
 * into a different tool on every load, and the failure is invisible to the
 * person who generated it.
 */

/** mulberry32 — small, fast and identical in every browser. */
export function rng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
