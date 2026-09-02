import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * The panel's section shell — `BlockShell`'s dense sibling.
 *
 * A proposal is read once; this panel is checked back into repeatedly, often
 * for one line of status. `BlockShell`'s `py-20 sm:py-28 lg:py-32` rhythm was
 * tuned for a document meant to be read start to finish, and at seven
 * sections it turns "did the discovery findings ship yet" into a multi-page
 * scroll. This shell trims that to `py-14 sm:py-16 lg:py-20` and tightens
 * card padding to `p-6 lg:p-8` — a deliberate departure from the proposal
 * rhythm, not a shortcut someone forgot to fix later.
 *
 * ## The head is the landing's, at this page's density
 *
 * It used to delegate to `SectionHeading`, whose kicker is pinned at
 * `text-[10px] tracking-widest` — the proposal chrome's size, which is how
 * every label in the panel ended up smaller than the same label on the site.
 * The kicker here is the document band's: `tracking-[0.3em]`, sized
 * `text-xs sm:text-sm`, in the accent's ink role.
 *
 * The *title* deliberately stays at `text-h2` where the landing's sections
 * use `text-display`. That is the one place this shell does not follow the
 * band, and it is the same trade its padding already makes: `text-display`
 * tops out at 4.6rem, and seven of those stacked is the multi-screen scroll
 * the density exists to avoid. Half a step down, on the same shared scale.
 *
 * `SectionHeading` is untouched — it is shared with `(site)` and the
 * proposals, and rewriting it to suit this page would have repainted every
 * route that uses it.
 *
 * ## `scroll-mt` is what makes the index usable
 *
 * Every entry in `PortalIndex` is an anchor to one of these, and an anchor
 * lands the section's top edge at the top of the viewport — under whatever
 * chrome is pinned there. Below `lg` that is 120px of it: the 56px header plus
 * the 64px sticky section strip. So the jump has to be offset by exactly that,
 * and above `lg`, where the strip is replaced by the margin rail, by the
 * header alone.
 *
 * Lenis honours `scroll-margin-top` — it reads the computed value in its own
 * `scrollTo` — so one CSS property covers the smooth path, the native path
 * under reduced motion, and a URL that simply arrives with a hash. This is
 * worth knowing before reaching for an `offset` on Lenis's `anchors` option,
 * which would apply the same number to every anchor on the site.
 */
export function PortalSection({
  id,
  kicker,
  title,
  lead,
  empty,
  className,
  children,
}: {
  id: string;
  kicker?: string;
  title?: string;
  lead?: string;
  /** Rendered instead of `children` when the section has nothing yet. */
  empty?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      /* Full-bleed rule, not one inset to the content column — the same way
         `Services`, `Work` and `About` mark their seams in the document
         band. `.shell` sits inside the border, so the line runs edge to
         edge. */
      className={cn(
        "relative border-t border-line",
        /* `py-12` at base rather than the `py-14` this carried: with seven
           sections a phone was spending 112px of an 844px screen on every
           seam, and the density this shell exists for is the argument
           against that, not for it. `sm` up is unchanged. */
        "py-12 sm:py-16 lg:py-20",
        "scroll-mt-[7.5rem] lg:scroll-mt-24",
        className,
      )}
    >
      <div className="shell relative">
        {title ? (
          <Reveal className="max-w-3xl">
            {kicker ? (
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ink sm:text-sm">
                {kicker}
              </p>
            ) : null}

            <h2 className="mt-4 text-h2 font-display font-semibold text-fg">{title}</h2>

            {lead ? (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
                {lead}
              </p>
            ) : null}
          </Reveal>
        ) : null}

        {empty ? (
          <Reveal className="mt-10">
            <p className="max-w-3xl rounded-surface border border-dashed border-edge bg-graphite/30 p-6 text-sm leading-relaxed text-fg-muted lg:p-8">
              {empty}
            </p>
          </Reveal>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
