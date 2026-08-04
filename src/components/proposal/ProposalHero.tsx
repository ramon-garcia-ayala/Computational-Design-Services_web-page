import { Reveal } from "@/components/ui/Reveal";
import type { Proposal } from "@/data/proposals";

/** Divide el titular para pintar en acento el fragmento marcado en `accent`. */
function splitTitle(title: string, accent?: string) {
  if (!accent) return [title, null, null] as const;
  const at = title.indexOf(accent);
  if (at === -1) return [title, null, null] as const;
  return [
    title.slice(0, at),
    accent,
    title.slice(at + accent.length),
  ] as const;
}

export function ProposalHero({ proposal }: { proposal: Proposal }) {
  const [before, accent, after] = splitTitle(
    proposal.hero.title,
    proposal.hero.accent,
  );

  const meta = [
    { label: "Client", value: proposal.client },
    { label: "Project", value: proposal.project },
    { label: "Issued", value: proposal.dateLabel },
    { label: "Next", value: proposal.reviewLabel },
  ];

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(200,249,78,0.07),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {proposal.hero.kicker}
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-fg sm:text-6xl lg:text-7xl">
            {before}
            {accent ? <span className="text-accent">{accent}</span> : null}
            {after}
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {proposal.hero.lead}
          </p>
        </Reveal>

        <Reveal
          stagger="[data-reveal]"
          className="mt-16 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {meta.map((item) => (
            <div key={item.label} className="reveal-init" data-reveal>
              <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                {item.label}
              </p>
              <p className="mt-2 text-sm text-fg">{item.value}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
