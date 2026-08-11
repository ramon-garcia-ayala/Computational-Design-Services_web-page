/**
 * Program maths for the massing archetype, shared by the model and the legend
 * so the coloured bands and the reported areas can never disagree.
 */

import type { MassingParams, ProgramBand, ProgramUse } from "../schema/spec";

/**
 * Metres. A plausible floor-to-floor for the mixed-use towers this archetype
 * gets asked for, and the number the reported areas are quoted against. It
 * was a slider; it measured rather than moved, and five rows are worth more
 * than an adjustable constant.
 */
export const FLOOR_HEIGHT = 3.5;

/** Plate proportion. Square plates read as a diagram rather than a building. */
const DEPTH_RATIO = 0.75;

/**
 * Plate depth, in metres. Derived so the plan never becomes an odd sliver —
 * unless the spec came from a link written while depth was still a control,
 * in which case that link's own number wins and the tower it was shared as is
 * the tower it reopens as.
 */
export function planDepth(params: MassingParams): number {
  return params.baseDepth ?? params.baseWidth * DEPTH_RATIO;
}

/** Floor-to-floor, in metres. Same legacy rule as `planDepth`. */
export function floorHeightOf(params: MassingParams): number {
  return params.floorHeight ?? FLOOR_HEIGHT;
}

/**
 * Spreads the program across the current floor count.
 *
 * `ProgramBand.floors` is treated as a weight rather than an absolute, so
 * dragging the floors slider keeps the mix the assistant proposed instead of
 * dumping every extra storey on the top band. Largest-remainder rounding keeps
 * the totals exact.
 */
export function floorUses(program: ProgramBand[], floors: number): ProgramUse[] {
  if (program.length === 0) return new Array<ProgramUse>(floors).fill("office");

  const weight = program.reduce((sum, band) => sum + Math.max(0, band.floors), 0);
  if (weight <= 0) return new Array<ProgramUse>(floors).fill(program[0].use);

  const exact = program.map((band) => (Math.max(0, band.floors) / weight) * floors);
  const counts = exact.map((value) => Math.floor(value));

  const remainders = exact
    .map((value, index) => ({ index, fraction: value - counts[index] }))
    .sort((a, b) => b.fraction - a.fraction);

  let assigned = counts.reduce((sum, value) => sum + value, 0);
  for (let i = 0; assigned < floors; i += 1) {
    counts[remainders[i % remainders.length].index] += 1;
    assigned += 1;
  }

  const uses: ProgramUse[] = [];
  program.forEach((band, index) => {
    for (let i = 0; i < counts[index]; i += 1) uses.push(band.use);
  });

  return uses.slice(0, floors);
}

/** Footprint scale at a given storey, from the taper. */
export function floorScale(params: MassingParams, index: number): number {
  const t = params.floors <= 1 ? 0 : index / (params.floors - 1);
  return 1 + (params.taper - 1) * t;
}

/** Gross area of one storey, in square metres. */
export function floorArea(params: MassingParams, index: number): number {
  const scale = floorScale(params, index);
  const width = params.baseWidth * scale;
  const depth = planDepth(params) * scale;
  return params.plan === "ellipse" ? (Math.PI / 4) * width * depth : width * depth;
}

export type BandSummary = {
  use: ProgramUse;
  floors: number;
  /** Gross area of the band, in square metres. */
  area: number;
};

/** Per-band floor counts and areas for the legend. */
export function bandSummaries(
  program: ProgramBand[],
  params: MassingParams,
): BandSummary[] {
  const uses = floorUses(program, params.floors);
  const summaries: BandSummary[] = [];

  uses.forEach((use, index) => {
    const previous = summaries[summaries.length - 1];
    /* Consecutive floors of the same use read as one band, which is how
       anyone describes a building: "six floors of retail", not six entries. */
    if (previous && previous.use === use) {
      previous.floors += 1;
      previous.area += floorArea(params, index);
      return;
    }
    summaries.push({ use, floors: 1, area: floorArea(params, index) });
  });

  return summaries;
}

/** Compact area label: 1 240 m² becomes "1.2k m²". */
export function formatArea(area: number): string {
  if (area >= 10_000) return `${Math.round(area / 1000)}k m²`;
  if (area >= 1000) return `${(area / 1000).toFixed(1)}k m²`;
  return `${Math.round(area)} m²`;
}
