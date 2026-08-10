/**
 * Floor plan subdivision for the layout archetype.
 *
 * Slice-and-dice: split the room list into two groups of roughly equal area,
 * cut the rectangle across its longer side in that proportion, recurse. It is
 * the simplest scheme that always produces rectangles with sane proportions —
 * which matters more here than optimality, because the visitor is dragging a
 * slider and every intermediate state has to look deliberate.
 *
 * The seed only shuffles the room order, so "reshuffle" moves rooms around
 * without ever changing their areas.
 */

import type { LayoutParams, LayoutSpace, ProgramUse } from "../schema/spec";
import { rng } from "./random";

export type PlacedSpace = {
  name: string;
  use: ProgramUse;
  /** Centre of the room, in metres, relative to the footprint centre. */
  x: number;
  z: number;
  width: number;
  depth: number;
  area: number;
};

export type PlannedFloor = {
  spaces: PlacedSpace[];
  /** Present only when the footprint is deep enough to carry one. */
  corridor: { x: number; z: number; width: number; depth: number } | null;
};

function shuffled<T>(items: T[], random: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type Rect = { x: number; z: number; width: number; depth: number };

function slice(items: LayoutSpace[], rect: Rect): PlacedSpace[] {
  if (items.length === 0) return [];

  if (items.length === 1) {
    return [
      {
        name: items[0].name,
        use: items[0].use,
        x: rect.x,
        z: rect.z,
        width: rect.width,
        depth: rect.depth,
        area: rect.width * rect.depth,
      },
    ];
  }

  const total = items.reduce((sum, item) => sum + item.ratio, 0);

  let running = 0;
  let cut = 1;
  for (let i = 0; i < items.length; i += 1) {
    running += items[i].ratio;
    if (running >= total / 2) {
      cut = Math.min(Math.max(i + 1, 1), items.length - 1);
      break;
    }
  }

  const first = items.slice(0, cut);
  const second = items.slice(cut);
  const share =
    first.reduce((sum, item) => sum + item.ratio, 0) / (total || 1);

  // Always cut the longer side: rooms stay closer to square that way.
  if (rect.width >= rect.depth) {
    const width = rect.width * share;
    return [
      ...slice(first, {
        x: rect.x - rect.width / 2 + width / 2,
        z: rect.z,
        width,
        depth: rect.depth,
      }),
      ...slice(second, {
        x: rect.x + rect.width / 2 - (rect.width - width) / 2,
        z: rect.z,
        width: rect.width - width,
        depth: rect.depth,
      }),
    ];
  }

  const depth = rect.depth * share;
  return [
    ...slice(first, {
      x: rect.x,
      z: rect.z - rect.depth / 2 + depth / 2,
      width: rect.width,
      depth,
    }),
    ...slice(second, {
      x: rect.x,
      z: rect.z + rect.depth / 2 - (rect.depth - depth) / 2,
      width: rect.width,
      depth: rect.depth - depth,
    }),
  ];
}

export function planFloor(spaces: LayoutSpace[], params: LayoutParams): PlannedFloor {
  const random = rng(Math.round(params.seed) || 1);
  const ordered = shuffled(spaces, random);

  const { footprintW: width, footprintD: depth } = params;

  /* A double-loaded corridor down the middle only makes sense if it leaves
     usable depth on both sides; otherwise the plan is a single band. */
  const usable = depth - params.corridor;
  if (params.corridor <= 0.05 || usable < 4) {
    return {
      spaces: slice(ordered, { x: 0, z: 0, width, depth }),
      corridor: null,
    };
  }

  const bandDepth = usable / 2;
  const offset = params.corridor / 2 + bandDepth / 2;

  const total = ordered.reduce((sum, item) => sum + item.ratio, 0) || 1;
  let running = 0;
  let cut = ordered.length > 1 ? 1 : 0;
  for (let i = 0; i < ordered.length; i += 1) {
    running += ordered[i].ratio;
    if (running >= total / 2) {
      cut = Math.min(Math.max(i + 1, 1), Math.max(ordered.length - 1, 1));
      break;
    }
  }

  return {
    spaces: [
      ...slice(ordered.slice(0, cut), {
        x: 0,
        z: -offset,
        width,
        depth: bandDepth,
      }),
      ...slice(ordered.slice(cut), {
        x: 0,
        z: offset,
        width,
        depth: bandDepth,
      }),
    ],
    corridor: { x: 0, z: 0, width, depth: params.corridor },
  };
}
