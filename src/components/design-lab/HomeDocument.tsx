import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { CTALink } from "@/components/ui/CTALink";
import { designLab } from "@/data/design-lab";
import { ServiceMotif } from "./ServiceMotif";

/**
 * The document band: everything between the two cine stretches.
 *
 * This is ordinary scrolling flow on carbon, and that is the whole design
 * decision. The rest of Home is a panel machine — 100svh stages with their
 * overflow hidden, one idea per screen — which is right for a statement and
 * actively hostile to an explanation: Services, Featured work and About were
 * all panels, and all three had grown taller than the stage, so their
 * headings and the top of their content were clipped off the screen with no
 * scrollbar and no way to reach them. Three of the four sections here would
 * not fit a panel at any desktop height.
 *
 * The band is carbon while the panels are `--color-panel` charcoal, so the
 * switch between reading and watching is visible without a label.
 *
 * All copy comes from `data/design-lab.ts`. Nothing is written here.
 */

const SHELL = "mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16";
const SECTION = "py-20 sm:py-24 lg:py-28";

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
 * The four figures, as a strip at the head of the band.
 *
 * They used to sit in the gap between the hero and the first panel, where the
 * panel rose over them within about one gesture of their becoming legible.
 * Proof nobody has time to read is not proof, and this is the first hard
 * evidence on the page that there is a company behind the animation.
 */
function ProofStrip() {
  const { stats } = designLab;

  return (
    <Reveal as="ul" stagger="[data-reveal]" className="grid grid-cols-2 gap-8 border-y border-line py-10 sm:grid-cols-4">
      {stats.map((stat) => (
        <li key={stat.id} data-reveal className="reveal-init">
          <p className="font-display text-h3 font-semibold text-fg">
            {stat.value}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-fg-muted sm:text-[11px]">
            {stat.label}
          </p>
          {"detail" in stat && stat.detail ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-ink sm:text-[11px]">
              {stat.detail}
            </p>
          ) : null}
        </li>
      ))}
    </Reveal>
  );
}

/**
 * Four rows, not four cards.
 *
 * A 4-across grid of one-sentence cards was the entire account of what this
 * studio sells, and a grid is what forces that: four equal columns leave no
 * room for the deliverables, so the deliverables were left out and the
 * sentence had to carry the sale on its own. Rows give the right-hand two
 * thirds to a list, which is the part a buyer actually scans for the thing
 * they need.
 *
 * The deliverables are lifted from `data/expertise.ts` — they were already
 * written, and rendered only on `/about`.
 */
function Services() {
  const { services } = designLab.panels;

  return (
    /* The anchor the hero's secondary CTA points at. Jumps go through Lenis
       (`SmoothScroll`'s `anchors` option) — a native hash jump moves the
       document without Lenis knowing, and every reveal below stops firing. */
    <section id={services.id} className={SECTION}>
      <div className={SHELL}>
        <SectionHead kicker={services.kicker} title={services.title} />

        <ul className="mt-14 lg:mt-20">
          {services.items.map((item) => (
            <Reveal as="li" key={item.name} className="block border-t border-line py-12 first:border-t-0 first:pt-0 lg:py-16">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] lg:gap-16">
                {/* Name above figure, not below it. The motif is a fixed
                    120px box, so putting it first pushed the service name
                    ~85px down the column while the sentence it belongs to
                    started at the top of the next one — two halves of the
                    same row on two different baselines. The name leads, the
                    figure supports it. */}
                <div>
                  <h3 className="text-h3 font-semibold text-fg">{item.name}</h3>
                  {/* The figure is a fixed 120px box and its links inherit
                      `currentColor`. */}
                  <div className="mt-6 text-accent-ink" aria-hidden="true">
                    <ServiceMotif kind={item.motif} />
                  </div>
                </div>

                <div>
                  <p className="max-w-2xl text-lead text-fg-muted">
                    {item.body}
                  </p>

                  <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                    {item.deliverables.map((line) => (
                      <li key={line} className="flex gap-3 text-sm leading-relaxed text-fg">
                        {/* A list marker, so it is decorative and hidden from
                            assistive tech — the words carry the content. */}
                        <span
                          aria-hidden="true"
                          className="mt-[0.7em] h-px w-3 shrink-0 bg-accent-ink"
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * The four steps, chained left to right from `lg`.
 *
 * A pipeline should read as one, and horizontal costs a fraction of the
 * height of a numbered column — the same reasoning a proposal's `steps` block
 * already applies to its `flow` layout. `border-edge` on the rail, not
 * `border-line`: the rule is what makes four cards read as four stages, so
 * its absence would change what the reader understands.
 */
function Method() {
  const { method } = designLab.panels;

  return (
    <section id={method.id} className={`${SECTION} border-t border-line`}>
      <div className={SHELL}>
        <SectionHead kicker={method.kicker} title={method.title} />

        <Reveal stagger="[data-reveal]" className="mt-14 lg:mt-20">
          <ol className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {method.steps.map((step) => (
              <li key={step.id} data-reveal className="reveal-init border-t border-edge pt-6">
                <span className="font-mono text-xs tracking-[0.3em] text-accent-ink">
                  {step.number}
                </span>
                <h3 className="mt-4 text-h3 font-semibold text-fg">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
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
    <section id={work.id} className={`${SECTION} border-t border-line`}>
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
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-surface bg-graphite ring-1 ring-line grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0">
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
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-muted sm:text-[11px]">
                    {item.context}
                  </p>
                  <h3 className="mt-3 text-h3 font-semibold text-fg">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-fg-muted">
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
    <section id={about.id} className={`${SECTION} border-t border-line`}>
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
                  <div className="relative aspect-square w-full overflow-hidden rounded-surface ring-1 ring-line grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0">
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
 * The band, in reading order: proof, what we build, how we work, what it
 * produced, who we are.
 *
 * That order is the argument. Figures establish there is a company; services
 * say what is on offer; the method answers "how would this actually go";
 * the work shows it has been done; About says by whom. The ask comes after,
 * on the closing panel, once all five have been answered.
 */
export function HomeDocument() {
  return (
    <div className="relative bg-carbon">
      <div className={`${SHELL} pt-20 sm:pt-24 lg:pt-28`}>
        <ProofStrip />
      </div>
      <Services />
      <Method />
      <Work />
      <About />
    </div>
  );
}
