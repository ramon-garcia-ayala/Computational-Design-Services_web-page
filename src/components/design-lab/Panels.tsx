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
 *
 * `py-12` below `sm`, not `py-20`. A panel is a fixed 100svh box with its
 * overflow hidden, so the figure that matters is the body against the stage
 * on the *shortest* phone: at 360x640 these measured 576 and 525 against
 * 640, which is 90% full and one line of copy away from clipping — and what
 * a clipped panel loses is its end, silently. Halving the padding on the
 * width where the stage is smallest buys back 64px at both panels.
 */
const BODY_PAD = "py-10 sm:py-24";

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
      {/* `mt-4`/`mt-5` below `sm`. Measured at 320x568 — the shortest
          viewport still in use — this body ran 581px against a 568px stage
          and lost its last 13px off the bottom, silently, because the stage
          is `overflow-hidden` and there is no scrollbar to show for it. The
          margins are where the height was, not the type: cutting the copy or
          the display size would change what the panel says. */}
      <div className="max-w-4xl">
        <Eyebrow>{problem.kicker}</Eyebrow>
        <p className="mt-4 text-display font-semibold text-fg sm:mt-6">
          {problem.lead}
        </p>
        {/* `panel-ink-muted`, not `fg-muted`: this plate is `--color-panel`,
            which is much lighter than carbon, and the muted grey tuned for
            carbon drops to 3.55:1 here. */}
        <p className="mt-5 max-w-2xl text-lead text-panel-ink-muted sm:mt-8">
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
          edge instead of sitting inside a framed, feathered rectangle.

          `boomerang` because this clip's last frame does not meet its first:
          on a plain loop the panel's only motion ended in a jump cut, which
          is the one thing a background loop must not do. Playing it back out
          the way it came in removes the seam without touching the file. */}
      <PanelVideo src={closing.video} boomerang />

      {/* Heading and buttons share one left edge — all three sit in the same
          flow column, rather than the button being centred under a wider
          block, which is what made them look unrelated. */}
      <div className={`${SHELL} ${BODY_PAD} relative my-auto`}>
        <div className="max-w-4xl">
          <Eyebrow>{closing.kicker}</Eyebrow>
          <p className="mt-4 text-h1 font-semibold text-fg sm:mt-6">{closing.body}</p>

          {/* `/contact`, not a mailto: a `mailto:` does nothing at all for a
              visitor on webmail, so the primary CTA silently failed for most
              people. Routed through `CTALink`, the single place CTA styling
              lives, rather than a hand-rolled button.

              The secondary is new. A closing screen with one button asks for
              the whole commitment or nothing; the reader who is interested
              but not ready to write an email now has somewhere to go that
              is not the back button. */}
          {/* Stacked and full width below `sm`, side by side above it. At
              178px each plus a 16px gap they needed 372px inside a 342px
              column on a 390px phone, so `flex-wrap` broke them onto two
              rows anyway — but as two left-aligned pills with a ragged right
              edge rather than as a deliberate stack. Full width makes the
              wrap intentional, and turns the primary into a 58px target
              running the whole column. */}
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:mt-12 sm:flex-row sm:items-center sm:gap-4">
            <CTALink
              href="/contact"
              variant="solid"
              size="lg"
              className="w-full sm:w-auto"
            >
              {site.contactLabel}
            </CTALink>
            <CTALink
              href={closing.secondary.href}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              {closing.secondary.label}
            </CTALink>
          </div>
        </div>
      </div>
    </>
  );
}
