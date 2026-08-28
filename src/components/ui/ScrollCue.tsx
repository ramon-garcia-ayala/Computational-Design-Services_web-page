import { cn } from "@/lib/utils";

/**
 * The hero's scroll indicator. Purely decorative (CSS, no JS) so it adds no
 * work before the LCP.
 */
export function ScrollCue({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-3 text-fg-muted", className)}
      aria-hidden="true"
    >
      {/* `aria-hidden`, so this isn't a WCAG failure — but a scroll hint
          nobody can see over the page's own busy background defeats the one
          job it has. Was `bg-line` (1.38:1). */}
      <span className="relative h-10 w-px overflow-hidden bg-edge">
        <span className="absolute inset-x-0 top-0 h-4 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-accent" />
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
