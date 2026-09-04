import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { AboutLoop } from "@/components/sections/about/AboutLoop";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { about } from "@/data/about";
import { founders } from "@/data/founders";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About us",
  description: `Who ${site.nameFlat} is: two architects who met studying computational design at IAAC Barcelona, and the studio they built to put automation at the centre of AEC work.`,
};

/**
 * `/about`: story, facts, founders. Nothing else.
 *
 * The process and expertise sections that used to sit here moved to
 * `/services`, where they answer a question the reader is actually asking.
 * The client logos, the metrics block and the closing CTA went with them for
 * a different reason — this page is meant to read as one continuous piece
 * about the people behind the studio, and a logo wall halfway down turns it
 * back into a pitch.
 *
 * The founder portraits use the same greyscale-to-colour treatment as Home's
 * About panel, from the same files.
 */
export default function AboutPage() {
  return (
    <div data-site-pale>
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_35%,color-mix(in_srgb,var(--color-accent)_6%,transparent),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="shell relative">
          {/* One grid, stretched: the loop on the right takes its height from
              *both* text blocks on the left — the heading and the story — so
              it spans the whole column rather than lining up with one of them
              and leaving the other beside empty ground. */}
          <div className="grid items-stretch gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] lg:gap-16">
            <div>
              <Reveal>
                <SectionHeading
                  as="h1"
                  kicker={about.kicker}
                  title={about.title}
                  lead={about.lead}
                />
              </Reveal>

              <Reveal className="mt-16">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-accent-ink">
                  {about.storyKicker}
                </p>
                {about.story.map((paragraph, i) => (
                  <p
                    key={i}
                    className="mt-6 text-justify hyphens-auto text-base leading-relaxed text-fg-muted sm:text-lg"
                  >
                    {paragraph}
                  </p>
                ))}
              </Reveal>
            </div>

            {/* No frame, no rounding, no ring: the clip is meant to sit on the
                page rather than on a card, and any border is exactly the edge
                that should not be visible. It dissolves into the ground
                instead — see AboutLoop. */}
            <div className="relative min-h-[320px] lg:min-h-0">
              <AboutLoop src={about.video} />
            </div>
          </div>
        </div>
      </section>

      {/* The facts, said plainly. Home gates the same figures behind a hover
          because they sit in a scroll sequence; here they are read. */}
      <section className="relative border-y border-line py-10 sm:py-12">
        <div className="shell">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent-ink sm:text-sm">
              {about.facts}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative py-20 sm:py-28">
        <div className="shell">
          <Reveal>
            <SectionHeading kicker={about.foundersKicker} title="Who you would be working with" />
          </Reveal>

          <Reveal stagger="[data-founder]" className="mt-14">
            <ul className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {founders.map((founder) => (
                <li key={founder.id} data-founder className="reveal-init">
                  <figure className="group">
                    {/* Square, matching the 400x400 sources — a portrait crop
                        would cut through the face. Greyscale at rest, true
                        colour on hover, as on Home. */}
                    <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-sm ring-1 ring-line grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0">
                      <Image
                        src={founder.photo}
                        alt={founder.name}
                        fill
                        sizes="(min-width: 1024px) 280px, 60vw"
                        className="object-cover"
                      />
                    </div>

                    <figcaption className="mt-6">
                      <h3 className="font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                        {founder.name}
                      </h3>
                      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-ink">
                        {founder.title}
                      </p>
                      <p className="text-justify hyphens-auto mt-5 text-sm leading-relaxed text-fg-muted sm:text-base">
                        {founder.bio}
                      </p>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
