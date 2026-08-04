import { cn } from "@/lib/utils";

/**
 * Slot reserved for the conversational chatbot (PHASE 2).
 *
 * Deliberately EMPTY: it implements no state, no text input and no chat logic.
 * It only pins height and position inside the hero so that mounting the real
 * component does not shift the layout or move the LCP.
 *
 * When building Phase 2, replace the inner content with the widget and keep
 * the container's dimensions.
 */
export function ChatPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-line bg-graphite/60 backdrop-blur-sm",
        "min-h-[220px] sm:min-h-[280px] lg:aspect-[4/3] lg:min-h-0",
        className,
      )}
      data-slot="chat"
      aria-label="Conversational assistant, coming soon"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          Assistant
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            Phase 2
          </span>
        </span>
      </div>

      {/* Slot for the conversational widget. Add no logic here in Phase 1. */}
      <div className="flex h-full min-h-[140px] items-center justify-center p-6">
        <p className="max-w-[22ch] text-center text-sm text-fg-muted">
          Conversational assistant lands here.
        </p>
      </div>
    </div>
  );
}
