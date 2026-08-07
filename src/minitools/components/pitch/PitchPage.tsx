import { pitchCopy } from "../../data/copy";
import type { PitchSpec } from "../../schema/spec";

/**
 * The archetype with no canvas.
 *
 * Some briefs cannot be demonstrated in a browser in ten seconds — they need a
 * DWG uploaded, a Revit session, a client's data. Answering "I can't do that"
 * would waste the only moment the visitor is paying attention, so the
 * assistant scopes the work instead and this page shows the result. Same URL
 * mechanics, no 3D.
 *
 * The closing argument is not this component's to render — `ToolViewerPage`
 * mounts `InquiryBand` once, full-bleed and outside `Shell`, shared with the
 * viewer archetypes. This is pure content.
 */
export function PitchPage({ spec }: { spec: PitchSpec }) {
  return (
      <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
        <div className="max-w-2xl">
          {spec.problem ? (
            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                {pitchCopy.problemLabel}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-fg">{spec.problem}</p>
            </section>
          ) : null}

          <section className="mt-12">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              {pitchCopy.approachLabel}
            </h2>
            <ol className="mt-6 flex flex-col gap-8">
              {spec.approach.map((step, index) => (
                <li key={step.title} className="flex gap-5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line font-mono text-xs text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg text-fg">{step.title}</h3>
                    {step.detail ? (
                      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                        {step.detail}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="flex flex-col gap-10 lg:border-l lg:border-line lg:pl-10">
          {spec.stack.length > 0 ? (
            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                {pitchCopy.stackLabel}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {spec.stack.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line px-3 py-1 font-mono text-xs text-fg-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {spec.deliverables.length > 0 ? (
            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                {pitchCopy.deliverablesLabel}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {spec.deliverables.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-fg">
                    <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {spec.timelineHint ? (
            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                {pitchCopy.timelineLabel}
              </h2>
              <p className="mt-3 text-sm text-fg">{spec.timelineHint}</p>
            </section>
          ) : null}
        </aside>
      </div>
  );
}
