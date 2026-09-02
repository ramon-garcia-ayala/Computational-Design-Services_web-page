"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { designLab } from "@/data/design-lab";
import { CTALink } from "@/components/ui/CTALink";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { cn } from "@/lib/utils";

/** Fraction of the runway a statement takes to fade in or out (~4 frames). */
const FADE = 0.04;

/** Progress at which the opening lockup has fully faded (spec §12.6). */
const LOCKUP_OUT = 0.18;

/**
 * Everything that sits over the geodesic sequence: the lockup, headline and
 * description, and the two statements that come and go at specific frames
 * (spec §11.1).
 *
 * **The statements are driven off scroll progress, not off the frame the
 * canvas is painting.** `FrameCanvas` owns that scrub and is deliberately
 * untouched here, so instead this reads the same runway with its own
 * ScrollTrigger and converts the spec's frame numbers into progress. The two
 * stay in step because the canvas tween is linear (`ease: "none"`) across the
 * identical start/end, so progress `p` is frame `p * (count - 1)` by
 * definition — invert that and a frame number becomes a timeline position.
 *
 * Frame numbers in the data are 1-based, matching the spec and the filenames,
 * so they convert through `(frame - 1) / (count - 1)`.
 *
 * One scrubbed timeline drives the lockup's exit and both statements.
 * Scrubbing is what makes them reversible for free: scrolling back up plays
 * every fade backwards rather than needing a second set of triggers.
 *
 * The lockup fades out by frame ~18, just before the first statement arrives
 * at frame 20 — so the hero hands over to the statements rather than cutting
 * (§12.6), and the two never compete for the same screen.
 */
export function HeroOverlay() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { hero, statements, sequence, mask } = designLab;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const lockup = root.querySelector<HTMLElement>("[data-lockup]");
      const targets = statements.map((statement) =>
        root.querySelector<HTMLElement>(`[data-statement="${statement.id}"]`),
      );

      if (reducedMotion) {
        // No scroll-linked reveal: everything is simply legible at rest.
        if (lockup) gsap.set(lockup, { opacity: 1 });
        targets.forEach((target) => target && gsap.set(target, { opacity: 1, x: 0 }));
        return;
      }

      const runway = document.querySelector<HTMLElement>("[data-sequence-runway]");
      if (!runway) return;

      const lastIndex = sequence.count - 1;
      const toProgress = (frame: number) =>
        Math.min(1, Math.max(0, (frame - 1) / lastIndex));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: runway,
          // Identical to the canvas tween's window, which is what keeps the
          // frame maths honest. `end: "bottom top"` specifically — see
          // `FrameCanvas`'s doc comment — spans the runway's full height
          // rather than stopping the instant the canvas un-pins, which
          // both used to do; drifting apart here would fade a statement on
          // a different scroll-to-progress scale than the frame it is
          // supposed to land on.
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // §12.6: a gradual fade tied to scroll, not a hard cut.
      if (lockup) {
        tl.fromTo(
          lockup,
          { opacity: 1 },
          { opacity: 0, ease: "power1.out", duration: LOCKUP_OUT },
          0,
        );
      }

      statements.forEach((statement, i) => {
        const target = targets[i];
        if (!target) return;

        const from = toProgress(statement.from);
        const to = toProgress(statement.to);
        const offset = statement.side === "right" ? 32 : -32;

        /* Slides in from its own edge — "hours" from further right, then
           "handover" from further left ten frames later — so the two read
           as arriving from opposite sides even though they land in the
           same beat. */
        tl.fromTo(
          target,
          { opacity: 0, x: offset },
          { opacity: 1, x: 0, ease: "power2.out", duration: FADE },
          from,
        );

        /* A statement that runs to the final frame is still on screen when
           the first panel rises over it, which is the intended handoff — so
           it is never faded out. */
        if (to < 1) {
          tl.to(
            target,
            { opacity: 0, x: -offset, ease: "power2.in", duration: FADE },
            Math.max(from + FADE, to - FADE),
          );
        }
      });

      // Pin the timeline's length to the full runway so the positions above
      // are read as the progress fractions they are, whatever the last tween
      // happens to end at.
      tl.set({}, {}, 1);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 font-display">
      {/* The hero's bottom edge, dissolved into the page colour.

          The hard line that survived the panel-gradient work was never the
          panel: it is where the *canvas* ends. `FrameCanvas` fills its stage
          by stretching the frame's own outermost pixels outward, and the
          frame's bottom row runs #a7a5a3 to #c0bcb8 — close to the page's
          #b8b4b1 but not equal to it, and not equal across its width either.
          So the canvas met flat greige at a step that shifted along the join.
          Fading the last stretch to the page colour removes the meeting
          point altogether, and does it without touching the scrub. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[22svh]"
        style={{
          background:
            "linear-gradient(to bottom, rgb(184 180 177 / 0) 0%, rgb(184 180 177 / 0.6) 55%, var(--color-lab-bg) 100%)",
        }}
      />

      {/* Scroll cue, centred under the model.

          It lives in the overlay rather than being fixed to the viewport,
          and that is the whole behaviour: the overlay sits inside the
          canvas's `sticky` stage, so the cue holds its place for as long as
          the model is centred and then travels up and out with it, clearing
          the top at ~250svh — just before the runway ends and the stats bar
          takes over. A `fixed` cue would instead follow the reader down the
          whole page, still saying "scroll" long after they had.

          After the bottom gradient in the DOM, so it paints over it rather
          than being dissolved by it — it sits inside that 22svh band.

          Positioned the way the statements above are — a full-inset flex box
          with padding, not `bottom-[7svh]`. That is not a style preference:
          the arbitrary `bottom-*` produced no rule at all here (the class
          reached the DOM and Tailwind emitted nothing for it), so the cue
          fell back to its static position and sat at the *top* of the hero,
          behind the header. `pb-[7svh]` is the same utility family as the
          `pb-[18svh]` the second statement already uses and which is known
          to compile.

          The 7svh clears that statement's own 18svh on a phone, where the
          two are the only things in the lower half; from `sm` up the
          statements are centred beside the model and there is nothing down
          here at all. No `pointer-events-auto`: this is a hint, not a
          control, so the sequence behind it stays scrollable. */}
      <div className="absolute inset-0 flex items-end justify-center pb-[7svh]">
        <ScrollCue variant="lab" />
      </div>
      {/* Opening lockup, present from the first frame and faded out by ~18.

          Centred from `sm` up, but held near the top below it. On a phone the
          geodesic fills the middle of the screen and this block is a third of
          the viewport tall, so centring put the wordmark, headline and
          description straight through the model — legible as neither. There is
          only one band of empty plate on a narrow screen, above the model, so
          the lockup goes there. Desktop has width to spare and is unchanged. */}
      <div
        data-lockup
        /* `pt-[6svh]` below `sm`, was 9. The two buttons added ~45px to this
           stack and the mobile hero has about 34px of clearance above the
           geodesic — measured off a screenshot on a 390x844 phone, not
           computed — so the block had to give the height back somewhere. It
           comes out of the gap to the header, which had it to spare, rather
           than out of the type. Everything here is still reset at `sm:`, so
           the desktop layout resolves to exactly what it was. */
        className="absolute inset-0 flex flex-col justify-start pt-[6svh] px-6 sm:justify-center sm:pt-0 sm:px-10 lg:px-16"
      >
        <div className="w-full max-w-3xl">
          {/* §12.2: the real logo asset, not type. Rendered as a mask filled
              with `currentColor` rather than an <img>, because the file's ink
              is near-black — fine on this greige plate, invisible on the dark
              panels and footer that reuse the same asset. A mask takes the
              colour of whatever context it lands in. */}
          <span
            role="img"
            aria-label={hero.logoAlt}
            className="block w-[160px] bg-lab-ink sm:w-[208px] lg:w-[360px]"
            style={{
              aspectRatio: `${mask.width} / ${mask.height}`,
              WebkitMaskImage: `url('${mask.src}')`,
              maskImage: `url('${mask.src}')`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />

          {/* §12.3: one line at every width. The clamp floor is sized so the
              longest word run still fits a 375px viewport without wrapping,
              which is what `whitespace-nowrap` would otherwise overflow.
              Deliberately not on the shared `--text-*` scale: this value and
              the mobile stack spacing below were tuned together against the
              geodesic's measured position (~34px of clearance on a 390×844
              phone, per the hero-on-mobile notes), so swapping in a generic
              step is exactly the kind of change that grazes the model. */}
          {/* Tighter stack below `sm` (`mt-5`/`mt-4` against `mt-8`/`mt-6`).
              The block has to fit between the header and the top of the
              geodesic, which is about a quarter of a phone screen; the ~28px
              this saves is what takes it from grazing the model to clearing
              it, without pushing the wordmark up against the header. */}
          {/* The base clamp maxes out at 2.56rem once the viewport clears
              ~825px and then sits there all the way to 4K — fine on a phone,
              where it was tuned, but on a laptop panel (1280–1440 CSS px is
              the common "small screen" range, not just a resize-the-window
              exercise) the geodesic is *also* still close: `FrameCanvas`
              fits it to a fraction of the same viewport, so a headline held
              at its widest right where the model is at its narrowest is what
              put "computed." under the mesh — measured, not eyeballed, on a
              1366×768 laptop viewport. `sm:` scales the headline down again
              and holds it at a flat 2rem from 640 to ~1483px — the exact
              band where the model has the least room — before it grows back
              toward the same 2.56rem ceiling on genuinely wide screens.
              Below `sm` this rule does not apply and the base clamp (tuned
              on a real phone, see above) is untouched. */}
          <h1 className="mt-5 font-semibold tracking-tight whitespace-nowrap text-lab-ink text-[clamp(1.28rem,4.96vw,2.56rem)] leading-[1.05] sm:mt-8 sm:text-[clamp(2rem,2.16vw,2.56rem)]">
            {hero.headline}
          </h1>

          {/* Below `sm` only: one line, because three sentences do not fit
              between the header and the top of the model on a phone (~34px
              of margin on a 390x844 — see the mobile notes above). */}
          <p className="mt-4 max-w-md text-[0.85rem] leading-snug font-medium text-lab-ink sm:hidden">
            {hero.outcome}
          </p>

          {/* The spec's paragraph (§12.4), from `sm` up.

              **`max-w` is measured against the model, not chosen.** This is
              the one thing that has to be right: the geodesic owns the middle
              of the plate, and `FrameCanvas` fits it to a fraction of the
              viewport, so the gap between this column and the nearest mesh
              is a function of width — 11.6rem at 640, 18.6rem at 1024,
              24.2rem at 1280, 27.8rem at 1440, 29.1rem at 1920 (the model
              grows too, so the gap stops opening), 34.1rem at 2560. The
              original set this to a flat `max-w-lg`, which is 32rem and
              therefore overflowed into the mesh at every width up to 2560 —
              that, not the copy, is why it was cut.

              `min(28rem,28vw)` stays under every one of those figures with
              room to spare, and it tracks the viewport rather than stepping
              at breakpoints, which is what the gap itself does. Re-derive it
              with the numbers above if `PLATE_WIDTH`, `GEOMETRY_EDGE_FRAC`
              or `LOCKUP_SAFE_RIGHT` ever move.

              Ragged right, not justified. The original was justified and it
              is the one part of it not restored: at this measure — narrower
              now than the one that was rejected — justification opens rivers
              you can put a finger down, which is the same call `Panels.tsx`
              makes for the About lead, for the same reason. */}
          <p className="mt-4 hidden max-w-[min(28rem,28vw)] text-[0.8rem] leading-relaxed text-lab-ink-muted sm:mt-6 sm:block">
            {hero.description}
          </p>

          {/* The hero had nothing to click. Four screen-heights of the best
              real estate on the site and no way to act on it — a visitor who
              was sold by the first frame had to find the header.

              `pointer-events-auto` is required: the overlay root is
              `pointer-events-none` so that the sequence behind it stays
              scrollable, and that inherits to every descendant. Without it
              these render, highlight on hover and do nothing at all. */}
          <div className="pointer-events-auto mt-5 flex flex-wrap items-center gap-3 sm:mt-8">
            {/* `py-3` over the size's own `py-2.5`: 41px is under the 44px
                minimum a touch target has to clear, and this is the one
                control on the page a phone visitor is meant to hit.

                Ink, not the amber `solid` plate. Amber is the accent for a
                dark ground; filling a button with it on this pale greige
                makes the loudest object on the hero a colour swatch rather
                than the model, and the two CTAs stop reading as primary and
                secondary — they read as two different kinds of thing. Ink
                against greige is the strongest contrast this plate has
                (7.13:1, the same pair as the headline), so it is still
                unmistakably the primary. Overridden here rather than added
                to `CTALink` as a variant, exactly like the `outline`
                override below it: `lab-*` is Home's palette, and a shared
                component has no business carrying it. Hover deepens to
                `carbon` rather than lightening, so the plate never washes
                out toward the background it sits on. */}
            <CTALink
              href={hero.ctaPrimary.href}
              variant="solid"
              size="md"
              className="border-lab-ink bg-lab-ink py-3 text-lab-bg hover:border-carbon hover:bg-carbon"
            >
              {hero.ctaPrimary.label}
            </CTALink>
            {/* `CTALink`'s `outline` resolves `text-fg` — near-white, and this
                plate is greige. The ink and its border are overridden to the
                pale scope's own pair rather than a new variant being added,
                since this is the only place on the site where a CTA sits on
                the hero plate.

                Hidden below `sm`. Side by side the two labels are ~348px of
                pill against 327px of usable width on a 375px screen, so they
                wrap to a second row — and the second row is the ~45px the
                mobile hero does not have. The anchor is a convenience for
                someone browsing with a mouse; the primary is what converts,
                and on a phone it gets the space to itself. */}
            <CTALink
              href={hero.ctaSecondary.href}
              variant="outline"
              size="md"
              className="hidden border-edge text-lab-ink hover:border-lab-ink hover:text-lab-ink sm:inline-flex"
            >
              {hero.ctaSecondary.label}
            </CTALink>
          </div>
        </div>
      </div>

      {/* Vertically centred, statement 1 right, statement 2 left — reading
          on the same row rather than one above the other, so the model sits
          between two lines that answer each other. The flex wrapper does
          the centring so GSAP owns `x` alone — animating a transform on an
          element that also carries a `-translate-y-1/2` would have GSAP
          overwrite the centring on its first tick. */}
      {statements.map((statement) => (
        <div
          key={statement.id}
          className={cn(
            "absolute inset-y-0 flex px-6 sm:items-center sm:px-10 sm:pt-0 sm:pb-0 lg:px-16",
            statement.side === "right" ? "right-0 justify-end" : "left-0 justify-start",
            /* Below `sm` the two statements clear the geodesic by going round
               it rather than through it: the first sits above the model, the
               second below. Left centred they land on top of it, which is what
               the phone screenshots showed. On desktop the model has margins on
               both sides and the statements read beside it, so `sm:items-center`
               keeps them aligned on one row. */
            statement.side === "right" ? "items-start pt-[15svh]" : "items-end pb-[18svh]",
          )}
        >
          <p
            data-statement={statement.id}
            className={cn(
              /* Monospace, not the headline's `font-display` — a
                 deliberate step down in register: these are asides after
                 the main claim, not a second headline, and the mono family
                 is already how the site marks supporting text (`Eyebrow`).
                 One line, never two: the clamp floor fits the longer line
                 at 375px so `whitespace-nowrap` never has to wrap it. */
              "whitespace-nowrap font-mono font-medium tracking-tight text-lab-ink opacity-0 text-[clamp(1rem,2.4vw,1.75rem)]",
              statement.side === "right" ? "text-right" : "text-left",
            )}
          >
            {statement.text}
          </p>
        </div>
      ))}
    </div>
  );
}
