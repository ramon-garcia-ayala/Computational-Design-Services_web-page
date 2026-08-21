import { ChatWidget } from "@/minitools/components/ChatWidget";
import { widgetCopy } from "@/minitools/data/copy";
import { cn } from "@/lib/utils";

/**
 * The hero's conversational assistant.
 *
 * The wrapper stays a Server Component; only the inner panel is client-side.
 *
 * Its height is *definite* at every breakpoint, which matters more than it
 * looks: the widget's message list is `flex-1 overflow-y-auto`, and in an
 * auto-height column flex container that resolves to the content's own height,
 * so the list would never overflow and never scroll. The panel would simply
 * grow with the conversation, pushing every section below the hero down
 * mid-chat and leaving the newest reply below the fold with no way back to it.
 * `min-h-*` alone is not a height. Above `lg` the aspect ratio does the job,
 * below it the viewport-relative height does, bounded so it stays sane on a
 * short phone and on a tall desktop window alike.
 */
export function ChatPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-xl border border-line bg-graphite/60 backdrop-blur-sm",
        "h-[60svh] max-h-[440px] min-h-[300px]",
        "lg:aspect-[4/3] lg:h-auto lg:max-h-none lg:min-h-0",
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
