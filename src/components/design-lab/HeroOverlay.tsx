"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { designLab } from "@/data/design-lab";
import { CTALink } from "@/components/ui/CTALink";
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
          // frame maths honest.
          start: "top top",
          end: "bottom bottom",
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
          <h1 className="mt-5 font-semibold tracking-tight whitespace-nowrap text-lab-ink text-[clamp(1.28rem,4.96vw,2.56rem)] leading-[1.05] sm:mt-8">
            {hero.headline}
          </h1>

          {/* The outcome line, where a three-sentence justified paragraph used
              to sit. Two reasons it went. It ran to `max-w-lg` at every width,
              which on this plate reaches into the geodesic — the model owns
              the middle of the frame, so the last third of every line was set
              over mesh. And it was justified at 0.7rem across a narrow
              measure, which opens rivers you can put a finger down. What is
              left is one line that never reaches the model and says the thing
              a buyer needs to hear. */}
          <p className="mt-4 max-w-md text-[0.85rem] leading-snug font-medium text-lab-ink sm:mt-6 sm:text-[1.15rem]">
            {hero.outcome}
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
                control on the page a phone visitor is meant to hit. */}
            <CTALink
              href={hero.ctaPrimary.href}
              variant="solid"
              size="md"
              className="py-3"
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

      {/* §12.7: vertically centred, statement 1 right, statement 2 left. The
          flex wrapper does the centring so GSAP owns `x` alone — animating a
          transform on an element that also carries a `-translate-y-1/2` would
          have GSAP overwrite the centring on its first tick. */}
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
               restores the original placement untouched. */
            statement.side === "right" ? "items-start pt-[15svh]" : "items-end pb-[18svh]",
          )}
        >
          <p
            data-statement={statement.id}
            className={cn(
              /* One line, never two. The `max-w` that used to sit here is
                 what forced the wrap, so it is gone rather than widened; the
                 clamp floor is what keeps the longer of the two statements
                 ("Design that scales itself.", 25 characters) inside a 375px
                 viewport once wrapping is off the table. */
              "whitespace-nowrap font-semibold leading-tight tracking-tight text-lab-ink opacity-0 text-[clamp(1.05rem,2.9vw,2.5rem)]",
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
