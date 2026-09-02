import { cn } from "@/lib/utils";

/**
 * The hero's scroll indicator: the label with an open chevron under it.
 * Purely decorative (CSS, no JS) so it adds no work before the LCP.
 *
 * It was a vertical hairline with a segment travelling down it, set beside
 * the label. The chevron says "down" on its own, without needing the motion
 * to be read as direction.
 *
 * **The angle is deliberately open (~116°), not a tight V.** Drawn as two
 * strokes from (4,10) to the apex at (12,15) and back out to (20,10) on the
 * site's usual 24 viewBox — the same line-icon convention as
 * `proposal/icons.tsx` and the header's portal mark (1.5 stroke,
 * `currentColor`, no fill), so it inherits its colour and introduces no
 * palette of its own.
 *
 * `variant` mirrors `Header`'s. `"dark"` is the original, for the carbon
 * ground `/archive-home` uses. `"lab"` is for Home's greige hero plate, and
 * it is not a nicety: the dark variant's moving part is the accent, and
 * amber on `--color-lab-bg` measures 1.00:1 — identical luminance, so the
 * chevron would be *invisible* on exactly the page the cue matters most on.
 * The `lab-*` pair is the one `HeroOverlay` already uses for type there:
 * `lab-ink-muted` for the label (4.54:1), full `lab-ink` for the chevron
 * (7.13:1) so the mark carries more weight than the word.
 *
 * The bob is transform-only, with no opacity change, so the chevron's
 * contrast is the same at every point in the loop. Its `100%` keyframe is
 * the rest position rather than the end of the travel — which is what the
 * reduced-motion rule in `globals.css` collapses to, so with motion off the
 * chevron simply sits still where it belongs.
 */
export function ScrollCue({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "lab";
}) {
  const lab = variant === "lab";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        lab ? "text-lab-ink-muted" : "text-fg-muted",
        className,
      )}
      aria-hidden="true"
    >
      <span className="font-mono text-[10px] uppercase tracking-widest">
        Scroll
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "h-5 w-5 animate-[scrollcue_1.8s_ease-in-out_infinite]",
          lab ? "text-lab-ink" : "text-accent",
        )}
      >
        <path d="M4 10 12 15 20 10" />
      </svg>
      <style>{`
        @keyframes scrollcue {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
