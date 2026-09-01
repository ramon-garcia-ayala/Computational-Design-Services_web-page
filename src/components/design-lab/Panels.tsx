import { ChatPlaceholder } from "@/components/ui/ChatPlaceholder";
import { CTALink } from "@/components/ui/CTALink";
import { site } from "@/data/site";
import { designLab } from "@/data/design-lab";
import { cn } from "@/lib/utils";
import { PanelVideo } from "./PanelVideo";

/**
 * The three cine panel bodies.
 *
 * Server Components apart from the pieces that animate — the looping
 * backgrounds and the chat widget bring their own client boundaries.
 * `PanelSection` supplies the morph and the full-bleed plate; these supply
 * only what goes on it.
 *
 * There used to be five. Services, Featured work and About moved into the
 * document band (`HomeDocument`), because a panel is a fixed 100svh box with
 * its overflow hidden and all three had outgrown it — Featured lost its
 * heading and the top of every image off the top of the screen, at every
 * desktop height. What is left is the three that are genuinely one idea on
 * one screen.
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
 */
export function Eyebrow({
  children,
  /* Amber carries every panel's eyebrow except the Playground one, whose
     plate is the pale greige the clip is shot on — amber on that is barely a
     shade apart from its background. Dark ink is the only legible option
     there. */
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: "accent" | "ink";
}) {
  return (
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-[0.3em] sm:text-sm",
        tone === "ink" ? "text-lab-ink" : "text-accent-ink",
      )}
    >
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

export function PlaygroundPanel() {
  const { playground } = designLab.panels;

  return (
    <>
      {/* Looping backdrop behind everything on this panel. */}
      <PanelVideo src={playground.video} contained />

      {/* Type is dark here, not light: this panel's plate is the greige the
          clip is shot on, so the light copy every other panel uses would be
          unreadable.

          Tighter than `BODY_PAD` on purpose, and the one panel that needs its
          own figure. It carries a 432px widget, so at `BODY_PAD` the body
          measures 729px against a 675px stage — it is the only body dense
          enough for the padding to be what pushes it over. 633px at this
          value, measured, with 42px to spare. */}
      <div className={`${SHELL} relative my-auto py-10 sm:py-12`}>
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <Eyebrow tone="ink">{playground.kicker}</Eyebrow>
          <h2 className="mt-3 text-h2 font-semibold text-lab-ink">
            {playground.title}
          </h2>

          {/* Translucent on its own shell rather than on the widget's inner
              surfaces, so the clip still shows through at the edges without
              costing the transcript its legibility. Was `bg-carbon/55` with
              `border-lab-ink/15`: at 55% the moving clip behind it competed
              directly with the chat text, and a 15%-opacity dark border is
              below anything WCAG 1.4.11 calls visible. 85% keeps the loop
              readable around the frame while the plate itself carries the
              conversation.

              `lg:aspect-[16/10]` was the shape that overflowed this panel:
              heading plus a 16:10 widget in a 1440-wide column is taller than
              100svh on any laptop, and the widget's own "Assistant / live"
              header row was the part clipped off the top. 16/9 fits, and the
              transcript is wider for it. */}
          {/* Do not try to cap this with `lg:max-h-*`. `ChatPlaceholder`'s own
              base classes carry `lg:max-h-none`, `cn()` does not dedupe it
              against an arbitrary value in the same group, and Tailwind sorts
              `none` last — so the cap lands in the class attribute, computes
              to `max-height: none`, and changes nothing. Measured: the widget
              stayed at exactly 432px with the cap applied. The panel's own
              padding is the knob that works. */}
          <ChatPlaceholder className="mt-6 max-w-3xl border-edge bg-carbon/85 backdrop-blur-md lg:aspect-[16/9]" />
        </div>
      </div>
    </>
  );
}

export function ClosingPanel() {
  const { closing } = designLab.panels;

  return (
    <>
      {/* Looping backdrop, same arrangement as the Playground panel. */}
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
