import { CTALink } from "@/components/ui/CTALink";
import { site } from "@/data/site";
import { designLab } from "@/data/design-lab";
import { PanelVideo } from "./PanelVideo";

/**
 * The two cine panel bodies.
 *
 * Server Components apart from the pieces that animate — the looping
 * backgrounds bring their own client boundaries. `PanelSection` supplies the
 * morph and the full-bleed plate; these supply only what goes on it.
 *
 * There used to be five, then three. Services, Featured work and About moved
 * into the document band (`HomeDocument`) because a panel is a fixed 100svh
 * box with its overflow hidden and all three had outgrown it. Playground —
 * the chat assistant, "try it yourself" — moved out entirely, to `/labs`;
 * see `src/data/labs.ts`. What is left is the two that are genuinely one
 * idea on one screen and belong to Home specifically.
 *
 * Every body is `my-auto`, not centred by the plate. See the note on
 * `PanelSection`'s `justify-start`: auto margins centre when the content fits
 * and fall back to top-aligned when it does not, so overflow can only ever
 * clip the end of a panel, never its opening.
 */

const SHELL = "font-display mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16";

/**
 * Vertical padding on a panel body.
 *
 * Under `prefers-reduced-motion` `PanelSection` drops the runway and the
 * sticky stage entirely and renders a plain `<section>`, so the 100svh box
 * that used to supply this panel's breathing room is gone — without a `py` of
 * its own the copy would sit flush against the section above and below. In
 * the animated tree it just makes the centred block taller, and every body
 * still clears the stage with room to spare (measured at 1440x675: the
 * longest is 618px against 675).
 */
const BODY_PAD = "py-20 sm:py-24";

/**
 * The category label above each panel.
 *
 * The index numbers ("01", "02", …) are gone from every panel, so this is the
 * category alone. The rule that used to separate number from label went with
 * them: a lone hairline before a single word reads as debris.
 *
 * Amber only, now that both remaining panels sit on the dark plate — the
 * `tone="ink"` variant existed for Playground's pale greige and left with it.
 */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ink sm:text-sm">
      {children}
    </p>
  );
}

/**
 * The turn from atmosphere to argument, and the first thing the reader meets
 * after the sequence.
 *
 * The sentence in it was written for this studio and then stranded: it lived
 * in `data/approach.ts` and rendered only on `/archive-home`, which nothing
 * links to. The landing page's own account of the work was four one-sentence
 * cards. This is the sharper half of what already existed.
 */
export function ProblemPanel() {
  const { problem } = designLab.panels;

  return (
    <div className={`${SHELL} ${BODY_PAD} my-auto`}>
      <div className="max-w-4xl">
        <Eyebrow>{problem.kicker}</Eyebrow>
        <p className="mt-6 text-display font-semibold text-fg">
          {problem.lead}
        </p>
        {/* `panel-ink-muted`, not `fg-muted`: this plate is `--color-panel`,
            which is much lighter than carbon, and the muted grey tuned for
            carbon drops to 3.55:1 here. */}
        <p className="mt-8 max-w-2xl text-lead text-panel-ink-muted">
          {problem.body}
        </p>
      </div>
    </div>
  );
}

export function ClosingPanel() {
  const { closing } = designLab.panels;

  return (
    <>
      {/* Looping backdrop, full-bleed rather than `contained` — this panel
          is dark type on dark plate, so the clip can run under it edge to
          edge instead of sitting inside a framed, feathered rectangle. */}
      <PanelVideo src={closing.video} />

      {/* Heading and buttons share one left edge — all three sit in the same
          flow column, rather than the button being centred under a wider
          block, which is what made them look unrelated. */}
      <div className={`${SHELL} ${BODY_PAD} relative my-auto`}>
        <div className="max-w-4xl">
          <Eyebrow>{closing.kicker}</Eyebrow>
          <p className="mt-6 text-h1 font-semibold text-fg">{closing.body}</p>

          {/* `/contact`, not a mailto: a `mailto:` does nothing at all for a
              visitor on webmail, so the primary CTA silently failed for most
              people. Routed through `CTALink`, the single place CTA styling
              lives, rather than a hand-rolled button.

              The secondary is new. A closing screen with one button asks for
              the whole commitment or nothing; the reader who is interested
              but not ready to write an email now has somewhere to go that
              is not the back button. */}
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <CTALink href="/contact" variant="solid" size="lg">
              {site.contactLabel}
            </CTALink>
            <CTALink href={closing.secondary.href} variant="outline" size="lg">
              {closing.secondary.label}
            </CTALink>
          </div>
        </div>
      </div>
    </>
  );
}
