import { cn } from "@/lib/utils";

/**
 * The one status vocabulary used everywhere in the panel, extended from what
 * `TimelineBlock` and `QaBlock` already use in the proposals: a filled accent
 * plate for "happening now", an `accent-ink` outline for "done", a dashed
 * `edge` outline for "not yet" — plus the two states a proposal never needed,
 * both drawn in `danger` since either one means "look at this".
 *
 * The label is never optional. No state here is legible from colour alone —
 * a KPI's bullet bar makes that literal by putting the state text right next
 * to the number it describes, not just in this chip.
 */
export type PortalStatus =
  | "active"
  | "done"
  | "planned"
  | "on-track"
  | "at-risk"
  | "off-track"
  | "paused"
  | "complete";

const styles: Record<PortalStatus, string> = {
  active: "bg-accent text-on-accent",
  done: "border border-accent-ink text-accent-ink",
  complete: "border border-accent-ink text-accent-ink",
  planned: "border border-dashed border-edge text-fg-muted",
  paused: "border border-dashed border-edge text-fg-muted",
  "on-track": "border border-accent-ink text-accent-ink",
  "at-risk": "border border-accent-ink text-accent-ink",
  "off-track": "border border-danger text-danger",
};

export function StatusChip({
  status,
  children,
  className,
}: {
  status: PortalStatus;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-control px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest",
        styles[status],
        className,
      )}
    >
      {children}
    </span>
  );
}
