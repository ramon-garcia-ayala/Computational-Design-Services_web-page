import { Reveal } from "@/components/ui/Reveal";
import type { NoteBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { Icon } from "../icons";

/**
 * Short aside between sections. It carries no block shell: it is a note, not a
 * section, which is also why it never shows up in the side index.
 */
export function NoteBlock({ block }: { block: NoteBlockData }) {
  return (
    <section id={block.id} className="border-t border-line py-14">
      <div className="shell">
        <Reveal>
          {/* `border-accent/40` was low-contrast alpha on a border meant to
              flag the note as worth noticing; `border-line` on the default
              tone was the same decorative-divider token drawn as a card
              outline. Both now use tokens built to stay visible. */}
          <div
            className={cn(
              "flex max-w-3xl gap-4 rounded-surface border p-6 lg:p-8",
              block.tone === "flag"
                ? "border-accent-ink bg-accent/5"
                : "border-edge bg-graphite",
            )}
          >
            <Icon
              name={block.tone === "flag" ? "alert" : "route"}
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                block.tone === "flag" ? "text-accent-ink" : "text-fg-muted",
              )}
            />
            <div>
              <h3 className="font-display text-base font-semibold tracking-tight text-fg">
                {block.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {block.body}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
