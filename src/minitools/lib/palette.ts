/**
 * Colours for the generated scenes.
 *
 * The viewer cannot read the `@theme` tokens from `globals.css` — three.js
 * needs literal values — so the ones it uses are mirrored here. Keep them in
 * step with the palette block of `src/app/globals.css`.
 */

import type { WfcTile } from "./wfc";

export const ACCENT = "#c8f94e";
export const ACCENT_DIM = "#a3cc3e";
export const LINE = "#262b2e";
export const FG_MUTED = "#8a918c";
export const CARBON = "#0a0c0b";

/**
 * One colour per program use. Derived from the site's accent so a massing
 * study still reads as this studio's work rather than a generic BIM viewer:
 * the accent marks what people occupy, cooler greys the servant spaces.
 */
export const PROGRAM_COLORS = {
  retail: "#e8ff8a",
  office: "#c8f94e",
  residential: "#8fbf3a",
  amenity: "#5f8f4a",
  parking: "#4a5459",
  core: "#2f373b",
} as const;

/**
 * One colour per aggregation tile. Height reads as brightness — open ground is
 * the same near-black the site grid uses, and a tower is the palest thing on
 * the canvas — so the generated field can be read at a glance without a
 * legend, which is what makes reseeding it worth doing repeatedly.
 */
export const WFC_TILE_COLORS: Record<WfcTile, string> = {
  void: "#2f373b",
  low: "#5f8f4a",
  court: "#8fbf3a",
  mid: "#c8f94e",
  tall: "#e8ff8a",
};

export const WFC_TILE_LABELS: Record<WfcTile, string> = {
  void: "Open ground",
  low: "Low-rise",
  court: "Courtyard",
  mid: "Mid-rise",
  tall: "Tower",
};

/**
 * The utilisation ramp for the structural archetype: comfortable, working
 * hard, past the allowable.
 *
 * The last stop leaves the site's greens on purpose. Everything else here is
 * a shade of the accent, so a warm colour is the only thing on the canvas
 * that cannot be mistaken for "more of the same" — and exceeding a limit is
 * exactly the state that must not read as a degree of the state below it.
 */
const STRUCTURE_STOPS = ["#4f7f46", "#c8f94e", "#ff8f5e"] as const;

export const STRUCTURE_LABELS = {
  low: "Comfortable",
  working: "Working hard",
  over: "Over allowable",
} as const;

function mix(from: string, to: string, t: number): string {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [ar, ag, ab] = parse(from);
  const [br, bg, bb] = parse(to);
  const channel = (a: number, b: number) =>
    Math.round(a + (b - a) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`;
}

/** Colour for a utilisation of 0 to 1 and beyond. Saturates past the limit. */
export function utilisationColor(utilisation: number): string {
  const value = Math.max(0, Math.min(1.2, utilisation));
  if (value <= 0.7) return mix(STRUCTURE_STOPS[0], STRUCTURE_STOPS[1], value / 0.7);
  return mix(STRUCTURE_STOPS[1], STRUCTURE_STOPS[2], Math.min(1, (value - 0.7) / 0.3));
}

/** Readable labels for the legend. */
export const PROGRAM_LABELS = {
  retail: "Retail",
  office: "Office",
  residential: "Residential",
  amenity: "Amenity",
  parking: "Parking",
  core: "Core",
} as const;
