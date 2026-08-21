import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { approachSteps } from "@/data/approach";

/** "Our Approach": the methodology as numbered steps. */
export function Approach() {
  return (
    <section
      aria-labelledby="approach-heading"
      className="border-t border-line py-20 sm:py-28 lg:py-32"
    >
      <div className="shell">
        <Reveal>
          <SectionHeading
            kicker="Our approach"
            title="How an engagement actually runs"
            lead="Four steps, in this order. No discovery phase that never ends and no tool nobody asked for."
          />
        </Reveal>

        <Reveal
          stagger="[data-reveal]"
          className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2"
        >
          {approachSteps.map((step) => (
            <article
              key={step.id}
              className="reveal-init flex flex-col gap-4 bg-carbon p-8 lg:p-10"
              data-reveal
            >
              <span
                className="font-mono text-sm text-accent"
                aria-hidden="true"
              >
                {step.number}
              </span>
              <h3 className="font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-fg-muted">
                {step.body}
              </p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
