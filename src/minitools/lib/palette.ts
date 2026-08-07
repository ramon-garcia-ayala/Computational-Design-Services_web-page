/**
 * Colours for the generated scenes.
 *
 * The viewer cannot read the `@theme` tokens from `globals.css` — three.js
 * needs literal values — so the ones it uses are mirrored here. Keep them in
 * step with the palette block of `src/app/globals.css`.
 */

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

/** Readable labels for the legend. */
export const PROGRAM_LABELS = {
  retail: "Retail",
  office: "Office",
  residential: "Residential",
  amenity: "Amenity",
  parking: "Parking",
  core: "Core",
} as const;
