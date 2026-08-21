import type { CapabilityIcon as Kind } from "@/data/capabilities";

/**
 * Line glyphs for the secondary capability row.
 *
 * Drawn rather than pulled from an icon set so they share the logo's
 * language: one stroke weight throughout, square caps, right angles and
 * 45-degree diagonals only. An off-the-shelf set would bring its own
 * corner radii and optical weight and read as borrowed.
 *
 * They take `currentColor`, so the row that holds them decides the tone —
 * no colour is baked in, which is what keeps them on the site's palette
 * wherever they land.
 */
export function CapabilityIcon({ kind }: { kind: Kind }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {PATHS[kind]}
    </svg>
  );
}

const PATHS: Record<Kind, React.ReactNode> = {
  /* Layered nodes feeding forward: a network learning. */
  learning: (
    <>
      <circle cx="6" cy="9" r="2" />
      <circle cx="6" cy="23" r="2" />
      <circle cx="16" cy="16" r="2" />
      <circle cx="26" cy="9" r="2" />
      <circle cx="26" cy="23" r="2" />
      <path d="M8 9l6 6M8 23l6-6M18 16l6-7M18 16l6 7" />
    </>
  ),

  /* A stack of storeys with one plane pulled out: the model, automated. */
  model: (
    <>
      <path d="M4 11l12-6 12 6-12 6-12-6Z" />
      <path d="M4 16l12 6 12-6" />
      <path d="M4 21l12 6 12-6" />
    </>
  ),

  /* Axes with a plotted series and a bar: figures read live. */
  dashboard: (
    <>
      <path d="M5 5v22h22" />
      <path d="M10 21v4M16 15v10M22 18v7" />
      <path d="M9 14l5-5 4 4 6-7" />
    </>
  ),

  /* A nozzle over a built-up layer: material laid down. */
  fabrication: (
    <>
      <path d="M13 4h6v6l-3 4-3-4V4Z" />
      <path d="M6 22h20M6 26h20" />
      <path d="M16 14v4" />
    </>
  ),

  /* A platform with clients attached: one version, many seats. */
  cloud: (
    <>
      <path d="M8 18h16a4 4 0 0 0 0-8 7 7 0 0 0-13-2 5 5 0 0 0-3 10Z" />
      <path d="M16 18v6M10 24h12" />
    </>
  ),

  /* A definition being handed over: parameters passed on. */
  training: (
    <>
      <path d="M4 8h10v16H4zM18 8h10v16H18z" />
      <path d="M7 13h4M7 17h4M21 13h4M21 17h4" />
      <path d="M14 16h4" />
    </>
  ),
};
