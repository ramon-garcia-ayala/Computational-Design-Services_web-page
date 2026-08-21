import { ChatPlaceholder } from "@/components/ui/ChatPlaceholder";
import { mailtoHref } from "@/data/site";
import { designLab } from "@/data/design-lab";
import { ServiceMotif } from "./ServiceMotif";
import { PanelVideo } from "./PanelVideo";
import { ExploreMore } from "./ExploreMore";
import Image from "next/image";

/**
 * The five panel bodies (spec §11.5–11.9, revised by §13.2–13.6).
 *
 * Server Components apart from the pieces that animate — the service motifs,
 * the looping backgrounds and the chat widget bring their own client
 * boundaries. `PanelSection` supplies the morph and the full-bleed plate;
 * these supply only what goes on it.
 */

const SHELL = "font-lab mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16";

/**
 * The category label above each panel.
 *
 * §13.1 removed the index numbers ("01", "02", …) from every panel, so this
 * is the category alone. The rule that used to separate number from label
 * went with them: a lone hairline before a single word reads as debris.
 */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent sm:text-sm">
      {children}
    </p>
  );
}

export function ServicesPanel() {
  const { services } = designLab.panels;

  return (
    /* §13.2: heading toward the top rather than centred, so the four cards
       get the room they need at their new size. `justify-start` with a
       generous top pad beats vertical centring here — centring would push the
       cards further down as the copy grows. */
    <div className={`${SHELL} flex h-full flex-col justify-start pt-[14svh] pb-[8svh]`}>
      <Eyebrow>{services.kicker}</Eyebrow>

      {/* §13.2: larger, and set tight under the label so the two read as one
          block rather than two stacked items. */}
      <h2 className="mt-4 font-semibold leading-[1.02] tracking-tight text-fg text-[clamp(2.4rem,5.6vw,4.6rem)]">
        {services.title}
      </h2>

      <ul className="mt-[7svh] grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {services.items.map((item) => (
          <li key={item.name} className="flex flex-col">
            {/* The figure is centred over the card, not aligned to its left
                edge: the SVG is a fixed 120px box, so in a wider column it
                needs the flex centring or it reads as hanging off to one
                side. Its links inherit `currentColor`. */}
            <div className="flex justify-center text-accent/70">
              <ServiceMotif kind={item.motif} />
            </div>

            <h3 className="mt-6 border-t border-panel-line pt-5 font-semibold leading-snug text-fg text-[clamp(1.15rem,1.5vw,1.5rem)]">
              {item.name}
            </h3>
            <p className="mt-4 text-justify text-sm leading-relaxed text-fg/70 sm:text-base">
              {item.body}
            </p>
          </li>
        ))}
      </ul>

      {/* The way out of this panel and into the full Services page. */}
      <ExploreMore />
    </div>
  );
}

export function LabsPanel() {
  const { labs } = designLab.panels;

  return (
    <>
      {/* §13.3: looping backdrop behind everything on this panel. */}
      <PanelVideo src={labs.video} contained />

      {/* The heading sits high so the enlarged clip has the middle of the
          panel to itself. Type is dark here, not light: this panel's plate is
          the greige the clip is shot on, so the light copy every other panel
          uses would be unreadable. */}
      <div className={`${SHELL} relative flex h-full flex-col justify-start pt-[9svh]`}>
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <Eyebrow>{labs.kicker}</Eyebrow>
          <h2 className="mt-3 font-semibold leading-tight tracking-tight text-lab-ink text-[clamp(2rem,4.4vw,3.6rem)]">
            {labs.title}
          </h2>

          {/* Translucent on its own shell rather than on the widget's inner
              surfaces, so the clip shows through without costing the
              transcript any legibility. */}
          <ChatPlaceholder className="mt-8 max-w-3xl border-lab-ink/15 bg-carbon/55 backdrop-blur-md lg:aspect-[16/10]" />
        </div>
      </div>
    </>
  );
}

export function FeaturedPanel() {
  const { featured } = designLab.panels;

  /* §11.7 / §13.4: content is deferred until there are projects worth
     showing, so this is label and layout only — nothing invented to fill it.
     §13.4 moves the label to the top-left and enlarges it. */
  return (
    <div className={`${SHELL} flex h-full flex-col justify-start pt-[14svh]`}>
      <Eyebrow>{featured.kicker}</Eyebrow>
      <h2 className="mt-4 font-semibold leading-[1.02] tracking-tight text-fg text-[clamp(2.4rem,5.6vw,4.6rem)]">
        {featured.kicker}
      </h2>
    </div>
  );
}

export function AboutPanel() {
  const { about } = designLab.panels;

  return (
    <div className={`${SHELL} flex h-full flex-col justify-center`}>
      <Eyebrow>{about.kicker}</Eyebrow>

      {/* §13.5: copy left and justified, photographs reserved on the right. */}
      <div className="mt-8 grid items-start gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        <p className="text-justify font-medium leading-[1.45] tracking-tight text-fg text-[clamp(1.25rem,2.2vw,2rem)]">
          {/* The wordmark sits in the sentence as ordinary body copy — same
              weight and colour as the words around it. Only the superscript
              is set apart, and that is typography rather than emphasis. */}
          <span className="whitespace-nowrap">
            R<sup className="text-[0.6em]">2</sup>
            {about.lead.replace(/^R²/, "")}
          </span>
          {about.body}
        </p>

        {/* §13.5: two founder portraits, greyscale until hovered. The slots
            are reserved now so the panel's proportions do not shift when the
            real images land — dropping them in means replacing the inner
            div with an <Image>, nothing else. */}
        <ul className="grid grid-cols-2 gap-5">
          {about.founders.map((founder) => (
            <li key={founder.id}>
              <figure className="group">
                {/* Square, because the sources are 400x400 — a portrait crop
                    of a square headshot cuts through the face. Greyscale at
                    rest, true colour on hover. */}
                <div className="relative aspect-square w-full overflow-hidden rounded-sm ring-1 ring-fg/10 grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0">
                  <Image
                    src={founder.photo}
                    alt={founder.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-widest text-fg/60">
                  {founder.name}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ClosingPanel() {
  const { closing } = designLab.panels;

  return (
    <>
      {/* §13.6: looping backdrop, same arrangement as the Labs panel. */}
      <PanelVideo src={closing.video} />

      {/* §13.6: heading and button share one left edge — both sit in the same
          flow column, rather than the button being centred under a wider
          block, which is what made the two look unrelated. */}
      <div className={`${SHELL} relative flex h-full flex-col justify-center`}>
        <div className="max-w-4xl">
          <Eyebrow>{closing.kicker}</Eyebrow>
          <p className="mt-6 font-semibold leading-[1.1] tracking-tight text-fg text-[clamp(2.2rem,5vw,4.2rem)]">
            {closing.body}
          </p>
          {/* §11.9 names `/contact`; that route does not exist, so this uses
              the same mailto every other CTA on the site does. */}
          <a
            href={mailtoHref}
            className="mt-12 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-mono text-xs uppercase tracking-widest text-carbon transition-colors duration-200 hover:bg-accent-dim sm:text-sm"
          >
            {closing.cta}
          </a>
        </div>
      </div>
    </>
  );
}
