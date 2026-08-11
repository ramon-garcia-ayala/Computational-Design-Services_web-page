/**
 * Wave function collapse over a square site.
 *
 * The archetype exists because its subject is the *ruleset*, not the shape:
 * nobody draws this result, they describe what may sit next to what and then
 * look at what falls out. So the tool has to make reseeding cheap and make the
 * rules visible — hence a seed slider that regenerates a different valid
 * answer, and a ruleset control as the first thing in the panel.
 *
 * Domains are bitmasks over `WFC_TILES`, which keeps propagation to integer
 * ands and lets the whole thing run synchronously inside a slider drag.
 *
 * The one deliberate departure from textbook WFC is what happens on a
 * contradiction. The literature restarts the grid. Restarting inside a render
 * is unbounded work on the main thread, and a tool that occasionally hangs is
 * worse than one that is occasionally impure — so a cell with no options left
 * is *forced* to the heaviest tile it had before the clash and the solve
 * carries on. The count is reported as `forced` rather than hidden, and the
 * substitution is still a subset of that cell's previous domain, which is what
 * keeps propagation monotone and therefore guaranteed to terminate.
 */

import type { WfcParams, WfcRuleset } from "../schema/spec";
import { rng } from "./random";

export const WFC_TILES = ["void", "low", "court", "mid", "tall"] as const;

export type WfcTile = (typeof WFC_TILES)[number];

const TILE_COUNT = WFC_TILES.length;

/** Cell side is 1, so everything below is in cells and the view fits at the end. */
const STOREY_HEIGHT = 0.42;

/** Side of a block as a fraction of its cell: what makes the types read apart. */
const FOOTPRINT: Record<WfcTile, number> = {
  void: 0,
  low: 0.88,
  court: 0.94,
  mid: 0.76,
  tall: 0.6,
};

/** Storeys as a fraction of the `height` slider, which sets the tallest tile. */
const STOREY_FRACTION: Record<WfcTile, number> = {
  void: 0,
  low: 0.22,
  court: 0.34,
  mid: 0.6,
  tall: 1,
};

/** Relative likelihood before `openness` is applied. */
const BASE_WEIGHT: Record<WfcTile, number> = {
  void: 1,
  low: 3,
  court: 1.6,
  mid: 2,
  tall: 1,
};

type Adjacency = Partial<Record<WfcTile, readonly WfcTile[]>>;

/**
 * What may touch what, per ruleset. A tile left out of a ruleset never enters
 * a domain at all, which is how `terrace` gets to be four tiles rather than
 * five without a second mechanism.
 *
 * The three are not variations on a theme; they are three different questions.
 * `city` spaces its towers because towers may only meet mid-rise or open
 * ground. `terrace` forbids a jump of more than one level, so the field reads
 * as topography. `lattice` allows no two solids to touch at all, which turns
 * the same solver into a porosity study.
 */
const RULESETS: Record<WfcRuleset, Adjacency> = {
  city: {
    void: ["void", "low", "court", "mid", "tall"],
    low: ["void", "low", "court", "mid"],
    court: ["void", "low", "court"],
    mid: ["void", "low", "mid", "tall"],
    tall: ["void", "mid"],
  },
  terrace: {
    void: ["void", "low"],
    low: ["void", "low", "mid"],
    mid: ["low", "mid", "tall"],
    tall: ["mid", "tall"],
  },
  lattice: {
    void: ["void", "low", "court", "mid", "tall"],
    low: ["void"],
    court: ["void"],
    mid: ["void"],
    tall: ["void"],
  },
};

function bit(tile: WfcTile): number {
  return 1 << WFC_TILES.indexOf(tile);
}

function maskOf(tiles: readonly WfcTile[]): number {
  let mask = 0;
  for (const tile of tiles) mask |= bit(tile);
  return mask;
}

function popcount(mask: number): number {
  let value = mask;
  let total = 0;
  while (value) {
    value &= value - 1;
    total += 1;
  }
  return total;
}

/**
 * Adjacency is symmetrised rather than trusted. An edge written in only one
 * direction is a typo every time, and a solver that honours it produces a
 * field whose rules depend on which cell happened to collapse first — which
 * looks like a bug in the seed, not in the table.
 */
function adjacencyMasks(rules: Adjacency): number[] {
  const masks = new Array<number>(TILE_COUNT).fill(0);

  WFC_TILES.forEach((from, index) => {
    const permitted = rules[from];
    if (!permitted) return;

    for (const to of permitted) {
      if (rules[to]?.includes(from)) masks[index] |= bit(to);
    }
  });

  return masks;
}

function tileOf(mask: number): WfcTile {
  for (let index = 0; index < TILE_COUNT; index += 1) {
    if (mask & (1 << index)) return WFC_TILES[index];
  }
  return "void";
}

/** The single heaviest option in a mask. Used to resolve a forced cell. */
function heaviest(mask: number, weights: number[]): number {
  let best = 0;
  let bestWeight = -1;

  for (let index = 0; index < TILE_COUNT; index += 1) {
    if (!(mask & (1 << index))) continue;
    if (weights[index] > bestWeight) {
      bestWeight = weights[index];
      best = 1 << index;
    }
  }

  return best || mask;
}

function weightedPick(mask: number, weights: number[], random: () => number): number {
  let total = 0;
  for (let index = 0; index < TILE_COUNT; index += 1) {
    if (mask & (1 << index)) total += weights[index];
  }

  let roll = random() * total;
  for (let index = 0; index < TILE_COUNT; index += 1) {
    if (!(mask & (1 << index))) continue;
    roll -= weights[index];
    if (roll <= 0) return 1 << index;
  }

  return heaviest(mask, weights);
}

export type WfcBlock = {
  tile: WfcTile;
  /** Cell centre, with the site centred on the origin. */
  x: number;
  z: number;
  storeys: number;
  /** Side of the block as a fraction of the cell. */
  footprint: number;
  height: number;
};

export type WfcField = {
  size: number;
  blocks: WfcBlock[];
  /** Largest dimension of the result, so the component can fit the camera. */
  extent: number;
  /** Height of the tallest block, which is what the view is centred on. */
  tallest: number;
  /** Cells the solver had to force. Zero on a clean run. */
  forced: number;
  counts: Record<WfcTile, number>;
};

/** One field per params object; see the note on the same cache in `structure.ts`. */
const cache = new WeakMap<WfcParams, WfcField>();

export function solveField(params: WfcParams): WfcField {
  const hit = cache.get(params);
  if (hit) return hit;

  const field = collapse(params);
  cache.set(params, field);
  return field;
}

function collapse(params: WfcParams): WfcField {
  /* `grid` is bounded by its registry range, and `parseSpec` is the only way
     in — from the model and from the URL alike — so it has already been
     clamped by the time it reaches here.

     There used to be a second ceiling at this line, derived from a
     `LIMITS.wfcCells` constant. It could never fire, and it was worse than
     dead: widening the slider in `registry.ts`, which is where the file says
     ranges live, would have left the panel and the schema agreeing on a range
     the solver silently truncated, with the only clue a constant in another
     file. */
  const size = Math.max(2, Math.round(params.grid));
  const cells = size * size;

  const rules = RULESETS[params.rules] ?? RULESETS.city;
  const allowed = adjacencyMasks(rules);
  const available = WFC_TILES.filter((tile) => rules[tile] !== undefined);
  const full = maskOf(available);

  const weights = WFC_TILES.map((tile) =>
    /* Openness only ever pushes on the empty tile. Reweighting the solids
       against each other as well would make the control mean two things at
       once, and the second one would be invisible. */
    tile === "void" ? BASE_WEIGHT.void + params.openness * 12 : BASE_WEIGHT[tile],
  );

  const random = rng(Math.max(1, Math.round(params.seed)));
  const domain = new Array<number>(cells).fill(full);

  /* Tie-breaking noise drawn once, before any collapse. Rolling for it inside
     the scan would make the number of random calls depend on the order cells
     are visited, and the seed would stop being a stable name for a result. */
  const noise = Array.from({ length: cells }, () => random() * 0.5);

  let forced = 0;

  const neighboursOf = (index: number): number[] => {
    const column = index % size;
    const row = (index - column) / size;
    const out: number[] = [];

    if (column > 0) out.push(index - 1);
    if (column < size - 1) out.push(index + 1);
    if (row > 0) out.push(index - size);
    if (row < size - 1) out.push(index + size);

    return out;
  };

  const propagate = (seeded: number[]) => {
    const queue = seeded;

    while (queue.length > 0) {
      const index = queue.pop() as number;
      const mask = domain[index];

      let permits = 0;
      for (let tile = 0; tile < TILE_COUNT; tile += 1) {
        if (mask & (1 << tile)) permits |= allowed[tile];
      }

      for (const neighbour of neighboursOf(index)) {
        const before = domain[neighbour];
        const next = before & permits;
        if (next === before) continue;

        if (next === 0) {
          const salvaged = heaviest(before, weights);
          forced += 1;

          /* The monotonicity this loop's termination rests on is that a
             domain only ever shrinks. The forced branch is the one place that
             can break it: when `before` is already a single bit, `heaviest`
             hands back the same mask, and because the adjacency table is
             symmetrised the neighbour's own pass then contradicts straight
             back — two collapsed cells re-queueing each other forever, on the
             main thread, inside a slider drag.

             None of the three shipped rulesets can reach it. The next one
             added might, and "the page hangs" is not how that should be
             discovered, so the queue is only fed when something actually
             changed. */
          if (salvaged === before) continue;
          domain[neighbour] = salvaged;
        } else {
          domain[neighbour] = next;
        }

        queue.push(neighbour);
      }
    }
  };

  for (;;) {
    let target = -1;
    let best = Infinity;

    for (let index = 0; index < cells; index += 1) {
      const options = popcount(domain[index]);
      if (options <= 1) continue;

      const score = options + noise[index];
      if (score < best) {
        best = score;
        target = index;
      }
    }

    if (target === -1) break;

    domain[target] = weightedPick(domain[target], weights, random);
    propagate([target]);
  }

  const blocks: WfcBlock[] = [];
  const counts: Record<WfcTile, number> = { void: 0, low: 0, court: 0, mid: 0, tall: 0 };
  const half = (size - 1) / 2;
  let tallest = 0;

  for (let index = 0; index < cells; index += 1) {
    const tile = tileOf(domain[index]);
    counts[tile] += 1;
    if (tile === "void") continue;

    const column = index % size;
    const row = (index - column) / size;
    const storeys = Math.max(1, Math.round(params.height * STOREY_FRACTION[tile]));
    const height = storeys * STOREY_HEIGHT;
    tallest = Math.max(tallest, height);

    blocks.push({
      tile,
      x: column - half,
      z: row - half,
      storeys,
      footprint: FOOTPRINT[tile],
      height,
    });
  }

  /* A field that collapsed entirely to void is legal and unwatchable. It takes
     a high openness on a permissive ruleset to get there, but a visitor who
     drags a slider to its end and gets a blank canvas reads it as a broken
     tool, not as an extreme setting. */
  if (blocks.length === 0) {
    const fallback = tileOf(heaviest(full & ~bit("void"), weights));
    const storeys = Math.max(1, Math.round(params.height * STOREY_FRACTION[fallback]));

    blocks.push({
      tile: fallback,
      x: 0,
      z: 0,
      storeys,
      footprint: FOOTPRINT[fallback],
      height: storeys * STOREY_HEIGHT,
    });
    tallest = storeys * STOREY_HEIGHT;
    counts[fallback] += 1;
    counts.void -= 1;
  }

  return { size, blocks, extent: Math.max(size, tallest, 1), tallest, forced, counts };
}
