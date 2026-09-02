import { cn } from "@/lib/utils";

/**
 * The hero's scroll indicator. Purely decorative (CSS, no JS) so it adds no
 * work before the LCP.
 *
 * `variant` mirrors `Header`'s. `"dark"` is the original, for the carbon
 * ground `/archive-home` uses. `"lab"` is for Home's greige hero plate, and
 * it is not a nicety: the dark variant's travelling segment is `bg-accent`,
 * and amber on `--color-lab-bg` measures 1.00:1 — identical luminance, so
 * the one moving part would be *invisible* on exactly the page the cue
 * matters most on. The `lab-*` pair is the same one `HeroOverlay` already
 * uses for type on that plate.
 *
 * Under reduced motion the global rule in `globals.css` collapses the
 * animation to its end state, which parks the segment past the bottom of the
 * rail — so what is left is a plain hairline and the label. That is a
 * deliberate resting state rather than an accident: a static cue still reads
 * as "there is more below", and nothing moves.
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
        "flex items-center gap-3",
        lab ? "text-lab-ink-muted" : "text-fg-muted",
        className,
      )}
      aria-hidden="true"
    >
      {/* `aria-hidden`, so this isn't a WCAG failure — but a scroll hint
          nobody can see over the page's own busy background defeats the one
          job it has. Was `bg-line` (1.38:1). On the greige, `edge` is the
          token that fails instead (2.78:1), so the rail takes
          `lab-ink-muted` (4.54:1) and the segment the full `lab-ink`. */}
      <span
        className={cn(
          "relative h-10 w-px overflow-hidden",
          lab ? "bg-lab-ink-muted" : "bg-edge",
        )}
      >
        <span
          className={cn(
            "absolute inset-x-0 top-0 h-4 animate-[scrollcue_1.8s_ease-in-out_infinite]",
            lab ? "bg-lab-ink" : "bg-accent",
          )}
        />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest">
        Scroll
      </span>
      <style>{`
        @keyframes scrollcue {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(250%); }
        }
      `}</style>
    </div>
  );
}
