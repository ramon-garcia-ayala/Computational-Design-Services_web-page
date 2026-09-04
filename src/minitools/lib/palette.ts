/**
 * Colours for the generated scenes.
 *
 * The viewer cannot read the `@theme` tokens from `globals.css` — three.js
 * needs literal values — so the ones it uses are mirrored here. Keep them in
 * step with the palette block of `src/app/globals.css`.
 */

import type { WfcTile } from "./wfc";

export const ACCENT = "#e8a94a";
export const ACCENT_DIM = "#c8913a";
export const LINE = "#262b2e";
export const FG_MUTED = "#8a918c";
export const CARBON = "#0a0c0b";

/**
 * The "site plate" ground colour used inside the R3F scenes themselves
 * (`LayoutMesh`'s slab, `WfcMesh`'s ground plane) — not `CARBON` above.
 *
 * This viewer only ever renders on `/labs/tool`, which is always under
 * `[data-site-warm]` (`--color-carbon: #3d3934`, a warm charcoal), never on
 * the site's cool dark scope this file otherwise mirrors. `CARBON`
 * (`#0a0c0b`) and `LINE` (`#262b2e`) were both used for this exact "ground
 * the model sits on" role, and both are noticeably cooler than the warm
 * canvas backdrop (`bg-graphite/40`) they render inside — a cold-toned plate
 * floating in a warm-tinted frame. This is deliberately its own value, tuned
 * for the one ground this scene actually renders on, rather than a token
 * this file otherwise keeps in lockstep with `globals.css`.
 */
export const SCENE_GROUND = "#221e1b";

/**
 * One colour per program use. Derived from the site's accent so a massing
 * study still reads as this studio's work rather than a generic BIM viewer:
 * the accent marks what people occupy, cooler greys the servant spaces.
 *
 * The comment above predates this file drifting: every one of these except
 * `parking`/`core` was a lime-green family (`#e8ff8a`…`#5f8f4a`) — the exact
 * second accent `globals.css` retired site-wide because "a second accent is
 * what made the palette read as two mixed modes." Nothing here ever imported
 * that decision; the viewer just kept its original mockup colours. This ramp
 * is what the comment always described: occupied space steps down from a
 * pale tint of the accent to the accent itself, servant space steps down
 * through the site's own cool neutrals (`FG_MUTED`, `LINE` — `parking` and
 * `core` needed no change, they were already this family).
 */
export const PROGRAM_COLORS = {
  retail: "#f6dfae",
  office: "#eec27f",
  residential: ACCENT,
  amenity: "#7d7268",
  parking: "#4a5459",
  core: "#2f373b",
} as const;

/**
 * One colour per aggregation tile. Height reads as brightness — open ground is
 * the same near-black the site grid uses, and a tower is the palest thing on
 * the canvas — so the generated field can be read at a glance without a
 * legend, which is what makes reseeding it worth doing repeatedly.
 *
 * Same fix as `PROGRAM_COLORS`: `low`/`court`/`mid`/`tall` were the retired
 * lime family, `mid` was that colour's exact hex. The ramp now walks from
 * `void`'s near-black neutral through a warm-neutral midpoint into the
 * accent and a pale tint of it — one hue family, brightness still doing all
 * the work.
 */
export const WFC_TILE_COLORS: Record<WfcTile, string> = {
  void: "#2f373b",
  low: "#54493f",
  court: "#8a7357",
  mid: ACCENT,
  tall: "#f6dfae",
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
 * The docstring's own description — "everything else here is a shade of the
 * accent" — never matched the implementation: the first two stops were green
 * and lime, and only the last, an orange, was even close to warm. This ramp
 * is what the description always meant: comfortable and working-hard are
 * genuinely a light tint and the full accent, and past-the-limit breaks into
 * a colour that cannot read as "a bit more amber" — exceeding a structural
 * limit is a different kind of state, not a further degree of the one below
 * it, and the colour now says so.
 */
const STRUCTURE_STOPS = ["#f0c67a", ACCENT, "#c0392b"] as const;

/* There was a `STRUCTURE_LABELS` here — three band names for a legend that
   ended up reading out numbers rather than bands. Nothing imported it, and
   copy belongs in `data/copy.ts` regardless, where `viewerCopy.structure`
   now holds every word this archetype shows. */

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
