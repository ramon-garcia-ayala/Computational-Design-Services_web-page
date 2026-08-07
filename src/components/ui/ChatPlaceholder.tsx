import { ChatWidget } from "@/minitools/components/ChatWidget";
import { widgetCopy } from "@/minitools/data/copy";
import { cn } from "@/lib/utils";

/**
 * The hero's conversational assistant.
 *
 * The wrapper stays a Server Component and keeps the exact dimensions it had
 * while this was an empty slot, so mounting the widget did not move the LCP.
 * Only the inner panel is client-side.
 */
export function ChatPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-xl border border-line bg-graphite/60 backdrop-blur-sm",
        "min-h-[220px] sm:min-h-[280px] lg:aspect-[4/3] lg:min-h-0",
        className,
      )}
      data-slot="chat"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {widgetCopy.heading}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            {widgetCopy.statusLabel}
          </span>
        </span>
      </div>

      <ChatWidget />
    </div>
  );
}
