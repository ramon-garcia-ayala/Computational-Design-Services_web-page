import { Reveal } from "@/components/ui/Reveal";
import type { FigureBlockData } from "@/data/proposals";
import { Icon } from "../icons";
import { BlockShell } from "./BlockShell";

/**
 * A generated concept diagram, shown inline.
 *
 * Three things worth knowing about why it looks like this.
 *
 * **The white plate.** The diagrams are drawn on white — they get printed,
 * pasted into decks and emailed, and a dark rectangle does none of those well.
 * Dropped straight onto a `#0a0c0b` page that reads as a hole punched in the
 * sheet, so it sits on a rounded white panel instead, like a drawing pinned to
 * the page.
 *
 * **No client JavaScript.** The SVG carries its own
 * `@media (prefers-reduced-motion: no-preference)` and is declared at its
 * finished state, so a reader who has asked for less motion gets the completed
 * diagram from the file itself. Nothing to hydrate, nothing to swap, and none of
 * the hydration trap that a `useReducedMotion` branch would bring with it.
 *
 * **The print swap.** A browser prints whichever frame the animation is on, so
 * print gets the poster instead — the same picture, resolved. That is the only
 * job `poster` has here; everything else the animated file handles by itself.
 */
export function FigureBlock({ block }: { block: FigureBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      <Reveal>
        <figure className="mt-14">
          <div className="overflow-hidden rounded-lg border border-line bg-white p-4 sm:p-6 lg:p-8">
            {/* Plain <img>, not next/image. The source is an SVG that animates
                itself: the optimizer does not process SVG, and routing it
                through the loader would only add a request in front of a file
                that is already 20 KB of vector and already the right size at
                every breakpoint. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.src}
              alt={block.alt}
              className="block h-auto w-full print:hidden"
              loading="lazy"
              decoding="async"
            />
            {block.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={block.poster}
                alt=""
                aria-hidden="true"
                className="hidden h-auto w-full print:block"
              />
            ) : null}
          </div>

          {block.caption || block.download ? (
            <figcaption className="mt-5 flex flex-col gap-3 text-sm leading-relaxed text-fg-muted sm:flex-row sm:items-baseline sm:justify-between">
              {block.caption ? (
                <span className="max-w-2xl">{block.caption}</span>
              ) : (
                <span />
              )}

              {block.download ? (
                <a
                  href={block.download.file}
                  download
                  className="group inline-flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-fg-muted transition-colors hover:text-accent"
                >
                  <Icon
                    name="file"
                    className="h-3.5 w-3.5 text-accent transition-opacity group-hover:opacity-80"
                  />
                  {block.download.label}
                </a>
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      </Reveal>
    </BlockShell>
  );
}
