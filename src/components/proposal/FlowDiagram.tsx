import { Reveal } from "@/components/ui/Reveal";
import type { FlowBlockData, FlowNode } from "@/data/proposals";
import { cn } from "@/lib/utils";

/**
 * The pipeline diagram, drawn by hand in the site's own visual language rather
 * than pulling in Mermaid.
 *
 * The spine is the stages in the order the data lists them. Everything else is
 * derived from the edges: the configuration a stage reads hangs to its side,
 * and the artifact travelling to the next stage is labelled *on* the connector
 * rather than dropped between two cards, so the line is never interrupted.
 *
 * Entrances go through `Reveal`, like every other appearance on the site. An
 * earlier version hand-rolled its own ScrollTriggers and silently failed to run,
 * leaving the diagram blank — there is no reason for this component to own
 * animation at all, which is also why it needs no client boundary.
 */
export function FlowDiagram({ block }: { block: FlowBlockData }) {
  const byId = new Map(block.nodes.map((node) => [node.id, node]));
  const spine = block.nodes.filter((node) => node.status === "stage");

  const inputsOf = (id: string, status: FlowNode["status"]) =>
    block.edges
      .filter((edge) => edge.to === id)
      .map((edge) => byId.get(edge.from))
      .filter((node): node is FlowNode => node?.status === status);

  const outputsOf = (id: string) =>
    block.edges
      .filter((edge) => edge.from === id)
      .map((edge) => byId.get(edge.to))
      .filter((node): node is FlowNode => node?.status === "artifact");

  return (
    <div className="mt-12">
      <ol>
        {spine.map((node, index) => {
          const configs = inputsOf(node.id, "config");
          const outputs = outputsOf(node.id);
          /* What feeds the first stage has no connector above it, so it gets
             its own line. */
          const feeds = index === 0 ? inputsOf(node.id, "artifact") : [];

          return (
            <Reveal key={node.id} as="li" stagger="[data-reveal]">
              {feeds.map((feed) => (
                <p
                  key={feed.id}
                  className="reveal-init pb-3 font-mono text-[10px] uppercase tracking-widest text-fg-muted"
                  data-reveal
                >
                  {feed.title}
                </p>
              ))}

              {/* The side column is a fixed track, held open whether or not
                  this stage reads configuration, so every card is the same
                  width and the spine stays a straight column. */}
              <div className="grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_2rem_14rem]">
                <article
                  className="reveal-init rounded-lg border border-line bg-graphite p-5"
                  data-reveal
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    {node.stage ? (
                      <span className="font-mono text-xs text-accent">
                        {node.stage}
                      </span>
                    ) : null}
                    <h3 className="font-display text-base font-semibold tracking-tight text-fg">
                      {node.title}
                    </h3>
                    {node.meta ? (
                      <span className="font-mono text-[10px] text-fg-muted">
                        {node.meta}
                      </span>
                    ) : null}
                  </div>

                  {node.detail ? (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">
                      {node.detail}
                    </p>
                  ) : null}
                </article>

                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden h-px w-8 border-t border-dashed border-line lg:block",
                    configs.length === 0 && "lg:invisible",
                  )}
                />

                <ul className="flex flex-col gap-1.5">
                  {configs.map((config) => (
                    <li
                      key={config.id}
                      className="reveal-init rounded-md border border-line bg-graphite-hi px-3 py-2"
                      data-reveal
                    >
                      <p className="font-mono text-[10px] text-fg">
                        ⌗ {config.title}
                      </p>
                      {config.meta ? (
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                          {config.meta}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              {outputs.length > 0 ? (
                /* The rail stretches to whatever height the labels beside it
                   need, so the line always reaches the next card instead of
                   stopping short of it. */
                <div className="flex items-stretch gap-4">
                  <span
                    aria-hidden="true"
                    className="ml-6 w-px shrink-0 bg-line"
                  />
                  <ul className="flex min-h-10 flex-1 flex-wrap items-center gap-x-5 gap-y-1 py-2">
                    {outputs.map((output) => (
                      <li
                        key={output.id}
                        className="reveal-init font-mono text-[10px] uppercase tracking-widest text-fg-muted"
                        data-reveal
                      >
                        {output.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Reveal>
          );
        })}
      </ol>

      <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
        <span>⌗ Configuration the stage reads</span>
        <span>— What passes to the next stage</span>
      </p>

      {block.note ? (
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-fg-muted">
          {block.note}
        </p>
      ) : null}
    </div>
  );
}
