import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { CTALink } from "@/components/ui/CTALink";
import { designLab } from "@/data/design-lab";
import { ServiceMotif } from "./ServiceMotif";

/**
 * The document band: everything between the two cine stretches.
 *
 * This is ordinary scrolling flow, and that is the whole design decision.
 * The rest of Home is a panel machine — 100svh stages with their overflow
 * hidden, one idea per screen — which is right for a statement and actively
 * hostile to an explanation: Services, Featured work and About were all
 * panels, and all three had grown taller than the stage, so their headings
 * and the top of their content were clipped off the screen with no
 * scrollbar and no way to reach them. Three of the four sections here would
 * not fit a panel at any desktop height.
 *
 * The band is `--color-panel`'s warm charcoal, same as every panel in the
 * cine stretches — it used to be pure `carbon` (`#0a0c0b`), which is flat
 * black against the rest of the page's warm tones for the same reason the
 * `--color-panel` comment in `globals.css` gives for the panels themselves:
 * "pure carbon read as flat black against the hero." A shared ground means
 * `fg-muted`/`line`/`ring-line` — all tuned against carbon — read wrong here
 * (a silent contrast failure, not a visual one); every one below is the
 * `panel-*` counterpart instead, the same substitution `Panels.tsx` already
 * makes.
 *
 * All copy comes from `data/design-lab.ts`. Nothing is written here.
 */

const SHELL = "mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16";
/* `py-14` below `sm`. This band is ordinary scrolling flow so nothing here
   can clip, but three sections at `py-20` spend 160px of an 844px phone on
   every seam — a third of a screen, twice, between blocks that are already
   separated by a full-bleed rule.

   `scroll-mt` because all three are anchor targets — the hero's secondary CTA
   points at `#services` and the menu links at the rest — and an anchor lands
   a section's top edge at the top of the viewport, which is behind the fixed
   header. On a phone that put "What we build" and "…at the center" underneath
   the chrome, so the jump appeared to land mid-sentence. Lenis reads the
   computed `scroll-margin-top` in its own `scrollTo`, so this one property
   covers the smooth path, the native path under reduced motion, and a URL
   that simply arrives with the hash.

   The value is the fixed header plus a little (64px mobile / 84px above `sm`),
   not a number tuned against measurements: landing on Home *with* a hash also
   races `Preloader`, which locks scroll and calls `window.scrollTo(0, 0)` for
   its own ~2.75s, so where the jump finally settles varies with viewport
   height in a way no offset can correct. See the note in CLAUDE.md. */
const SECTION = "py-14 sm:py-24 lg:py-28 scroll-mt-20 sm:scroll-mt-24";

/** Section label + heading, in one place so all four sections agree. */
function SectionHead({
  kicker,
  title,
  className,
}: {
  kicker: string;
  title: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ink sm:text-sm">
        {kicker}
      </p>
      <h2 className="mt-4 text-display font-semibold text-fg">{title}</h2>
    </Reveal>
  );
}

/**
 * Four cards, motif first.
 *
 * This was four full-width rows, and before that four one-sentence cards.
 * The rows existed to fit a prose sentence *and* four deliverables side by
 * side, which is a prose measure plus a list measure — the section ran to
 * roughly three screens for four services, and the figure that is supposed to
 * say what each one does sat at 120x60px underneath the words.
 *
 * Not rendering the sentence removes the only thing that needed the width.
 * What is left fits four across: the motif at full column width, the name,
 * and the deliverables in one column. Same information minus one redundant
 * register, in about a third of the height.
 *
 * `item.body` is deliberately unread here and deliberately still in the data —
 * `/services` merges these four items with `data/capabilities.ts` into a
 * ten-card grid where every card carries a sentence. See the note at the
 * `services` block in `data/design-lab.ts` before removing the field.
 *
 * The motif leads because it is the only part of this section that moves, and
 * a 300px figure reads as a diagram where a 120px one read as an ornament.
 * Everything inside it is authored in viewBox units, so it scales whole.
 */
function Services() {
  const { services } = designLab.panels;

  return (
    /* The anchor the hero's secondary CTA points at. Jumps go through Lenis
       (`SmoothScroll`'s `anchors` option) — a native hash jump moves the
       document without Lenis knowing, and every reveal below stops firing.

       `border-t`, like `Work` and `About` below it: the band's first section
       still wants the same thin rule marking where it starts, now that it
       is not also the seam between two different background colours. */
    <section id={services.id} className={`${SECTION} border-t border-panel-line`}>
      <div className={SHELL}>
        <SectionHead kicker={services.kicker} title={services.title} />

        {/* Four columns divide four items exactly at every breakpoint here
            (1, 2, then 4), so no row is ever left half empty. */}
        <Reveal
          as="ul"
          stagger="[data-reveal]"
          className="mt-14 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
        >
          {services.items.map((item) => (
            <li key={item.name} data-reveal className="reveal-init">
              {/* `w-full h-auto` overrides the motif's default 120x60 box; the
                  `2 / 1` is its own viewBox ratio, restated so the row height
                  is reserved before the SVG paints and the grid does not
                  reflow under the reveal. */}
              <div
                className="text-accent-ink"
                style={{ aspectRatio: "2 / 1" }}
              >
                <ServiceMotif kind={item.motif} className="h-full w-full" />
              </div>

              {/* `lg:min-h-[2.4em]` reserves two lines of the heading's own
                  size (line-height 1.2, so 2.4em is exactly two rows).
                  In a ~300px column three of the four names wrap and
                  "Design Automation" does not, which started its deliverables
                  38px above the other three and made the row read as ragged
                  rather than as a set. Only from `lg`: at `sm` the columns are
                  twice as wide, every name fits one line, and reserving the
                  second would just open a hole. */}
              <h3 className="mt-6 border-t border-panel-line pt-5 text-h3 font-semibold text-fg lg:min-h-[2.4em]">
                {item.name}
              </h3>

              <ul className="mt-5 space-y-3">
                {item.deliverables.map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 text-sm leading-snug text-panel-ink-muted"
                  >
                    {/* A list marker, so it is decorative and hidden from
                        assistive tech — the words carry the content. */}
                    <span
                      aria-hidden="true"
                      className="mt-[0.62em] h-px w-2.5 shrink-0 bg-accent-ink"
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Three projects, each with the context it was made in and what it produced.
 *
 * The context label is not decoration and not modesty: these are IAAC
 * research projects, not client engagements, and `Project` deliberately has
 * no `client` field for exactly that reason. A card that implies a
 * commissioning company would be a lie on a page whose whole job is to be
 * believed — so the label is printed, and the line under each is a research
 * finding rather than a business metric.
 */
function Work() {
  const { work } = designLab.panels;

  return (
    <section id={work.id} className={`${SECTION} border-t border-panel-line`}>
      <div className={SHELL}>
        <SectionHead kicker={work.kicker} title={work.title} />

        <Reveal as="ul" stagger="[data-reveal]" className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-12">
          {work.items.map((item) => (
            <li key={item.id} data-reveal className="reveal-init">
              <figure className="group">
                {/* One frame for three very different sources — 1.00, 1.93
                    and 1.16 — so `object-cover` does the reconciling.
                    Greyscale at rest, true colour on hover, same as the
                    founder portraits. `rounded-surface`, not the `rounded-sm`
                    this carried before: the site has exactly two radii and
                    that was neither of them. */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-surface bg-graphite ring-1 ring-panel-line grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    /* The GIF has to skip the optimiser, which would
                       re-encode it to a still and quietly drop the
                       animation. */
                    unoptimized={item.animated}
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-panel-ink-muted sm:text-[11px]">
                    {item.context}
                  </p>
                  <h3 className="mt-3 text-h3 font-semibold text-fg">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-panel-ink-muted">
                    {item.result}
                  </p>
                </figcaption>
              </figure>
            </li>
          ))}
        </Reveal>

        <Reveal className="mt-14">
          <CTALink href="/projects" variant="outline" size="md">
            See all projects
          </CTALink>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Who is behind it, and the one CTA that closes the document band.
 *
 * Was a cine panel. It is information rather than spectacle, and it was the
 * panel most likely to overflow its own viewport — a paragraph plus two
 * portraits plus captions does not reliably fit 100svh on a laptop.
 */
function About() {
  const { about } = designLab.panels;

  return (
    <section id={about.id} className={`${SECTION} border-t border-panel-line`}>
      <div className={SHELL}>
        <div className="grid items-start gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ink sm:text-sm">
              {about.kicker}
            </p>

            {/* Not justified. At this measure justification opens rivers you
                can put a finger down — the old panel set the same sentence
                `text-justify` and "R²χTECH was founded by two architects who"
                spread across the full column on gaps alone. Ragged right
                keeps the word spacing even, which is the whole reason the
                setting exists. */}
            <p className="mt-6 max-w-2xl font-display text-h3 font-medium leading-[1.5] tracking-tight text-fg">
              {/* The wordmark sits in the sentence as ordinary body copy —
                  same weight and colour as the words around it. Only the
                  superscript is set apart, and that is typography rather
                  than emphasis. */}
              <span className="whitespace-nowrap">
                R<sup className="text-[0.6em]">2</sup>
                {about.lead.replace(/^R²/, "")}
              </span>
              {about.body}
            </p>

            {/* `outline`, not `ghost`. Ghost draws no border and resolves
                `fg-muted`, which on carbon reads as a caption rather than as
                something you can click — a link with no affordance is a link
                nobody uses. */}
            <CTALink href="/about" variant="outline" size="md" className="mt-8">
              More about the studio
            </CTALink>
          </Reveal>

          <Reveal as="ul" stagger="[data-reveal]" className="grid grid-cols-2 gap-5">
            {about.founders.map((founder) => (
              <li key={founder.id} data-reveal className="reveal-init">
                <figure className="group">
                  {/* Square, because the sources are 400x400 — a portrait
                      crop of a square headshot cuts through the face. */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-surface ring-1 ring-panel-line grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0">
                    <Image
                      src={founder.photo}
                      alt={founder.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-fg">
                      {founder.short}
                    </p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * The band, in reading order: what we build, what it produced, who we are.
 *
 * That order is the argument. `StatsBar`, establishing there is a company,
 * sits before the band entirely — between the hero and "The problem" — so
 * services say what is on offer once that is already settled; the work shows
 * it has been done; About says by whom. The ask comes after, on the closing
 * panel, once all three have been answered.
 */
export function HomeDocument() {
  return (
    <div className="relative bg-panel">
      <Services />
      <Work />
      <About />
    </div>
  );
}
