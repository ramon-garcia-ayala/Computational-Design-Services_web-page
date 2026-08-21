import { ChatPlaceholder } from "@/components/ui/ChatPlaceholder";
import { mailtoHref } from "@/data/site";
import { designLab } from "@/data/design-lab";

/**
 * The five panel bodies (spec §11.5–11.9). Server Components throughout —
 * the only client piece is the chat widget inside the Labs teaser, which
 * brings its own boundary. `PanelSection` supplies the morph and the
 * full-bleed plate; these supply only what goes on it.
 */

const SHELL = "font-lab mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16";

/** Eyebrow shared by every panel, so the numbering reads as one sequence. */
function Eyebrow({ index, kicker }: { index: string; kicker: string }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-muted">
      <span className="text-accent">{index}</span>
      <span className="mx-3 text-line">/</span>
      {kicker}
    </p>
  );
}

export function ServicesPanel() {
  const { services } = designLab.panels;

  return (
    <div className={SHELL}>
      <Eyebrow index={services.index} kicker={services.kicker} />
      <h2 className="mt-6 font-display text-3xl leading-tight font-semibold tracking-tight text-fg sm:text-4xl lg:text-5xl">
        {services.title}
      </h2>

      {/* Horizontal on wide screens per §11.5. The per-service shape/icon
          treatment is still an open item in §11.3, so each entry is type
          only — there is no placeholder glyph standing in for a design that
          has not been made. */}
      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {services.items.map((item, i) => (
          <li key={item.name} className="border-t border-line pt-5">
            <p className="font-mono text-[10px] tabular-nums text-fg-muted">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-4 font-display text-lg leading-snug font-semibold text-fg">
              {item.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LabsPanel() {
  const { labs } = designLab.panels;

  return (
    <div className={SHELL}>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Eyebrow index={labs.index} kicker={labs.kicker} />
        <h2 className="mt-6 font-display text-3xl leading-tight font-semibold tracking-tight text-fg sm:text-4xl">
          {labs.title}
        </h2>
        {/* §11.6: the existing widget, centred, layout and copy unchanged.
            Its accents are the warm token now; that is the only edit. */}
        <ChatPlaceholder className="mt-10" />
      </div>
    </div>
  );
}

export function FeaturedPanel() {
  const { featured } = designLab.panels;

  /* §11.7: the panel exists so the scroll rhythm is the real one, but the
     content is deferred until there are projects worth showing. Nothing is
     invented to fill it. */
  return (
    <div className={SHELL}>
      <Eyebrow index={featured.index} kicker={featured.kicker} />
    </div>
  );
}

export function AboutPanel() {
  const { about } = designLab.panels;

  return (
    <div className={SHELL}>
      <div className="max-w-3xl">
        <Eyebrow index={about.index} kicker={about.kicker} />
        <p className="mt-8 font-display text-2xl leading-[1.35] font-semibold tracking-tight text-fg sm:text-3xl lg:text-4xl">
          {about.body}
        </p>
      </div>
    </div>
  );
}

export function ClosingPanel() {
  const { closing } = designLab.panels;

  return (
    <div className={SHELL}>
      <div className="max-w-3xl">
        <Eyebrow index={closing.index} kicker={closing.kicker} />
        <p className="mt-8 font-display text-3xl leading-[1.25] font-semibold tracking-tight text-fg sm:text-4xl lg:text-5xl">
          {closing.body}
        </p>
        {/* §11.9 names `/contact`; that route does not exist, so this uses the
            same mailto every other CTA on the site does. */}
        <a
          href={mailtoHref}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-carbon transition-colors duration-200 hover:bg-accent-dim"
        >
          {closing.cta}
        </a>
      </div>
    </div>
  );
}
