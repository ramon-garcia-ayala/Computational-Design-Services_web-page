"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { FlowBlockData, FlowNode, NodeStatus } from "@/data/proposals";
import { cn } from "@/lib/utils";

/** Alto en píxeles del conector vertical entre etapas. Es también su dasharray. */
const CONNECTOR = 56;

const statusChip: Partial<Record<NodeStatus, string>> = {
  built: "Built & tested",
  pending: "Not built yet",
  deferred: "Future phase",
};

const legend: { status: NodeStatus; label: string }[] = [
  { status: "built", label: "Built & tested" },
  { status: "pending", label: "Not built yet" },
  { status: "deferred", label: "Future phase" },
  { status: "config", label: "Configuration / data contract" },
  { status: "artifact", label: "Artifact passed between stages" },
];

/**
 * El diagrama de flujo del pipeline, dibujado a mano en el lenguaje del sitio
 * en vez de importar Mermaid.
 *
 * La espina son los nodos de proceso en el orden en que vienen en los datos; de
 * las aristas se derivan los ficheros de configuración que alimentan cada etapa
 * y los artefactos que produce. Sólido = construido, discontinuo = propuesto.
 */
export function FlowDiagram({ block }: { block: FlowBlockData }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const byId = new Map(block.nodes.map((node) => [node.id, node]));
  const spine = block.nodes.filter(
    (node) => node.status !== "config" && node.status !== "artifact",
  );

  const inputsOf = (id: string, status: NodeStatus) =>
    block.edges
      .filter((edge) => edge.to === id)
      .map((edge) => byId.get(edge.from))
      .filter((node): node is FlowNode => node?.status === status);

  const outputsOf = (id: string) =>
    block.edges
      .filter((edge) => edge.from === id)
      .map((edge) => byId.get(edge.to))
      .filter((node): node is FlowNode => node?.status === "artifact");

  useGSAP(
    () => {
      /* Un trigger por etapa: el diagrama es más alto que la ventana, así que
         una sola animación escalonada se gastaría fuera de pantalla. */
      const stages = gsap.utils.toArray<HTMLElement>("[data-flow-stage]");

      stages.forEach((stage) => {
        const fades = stage.querySelectorAll("[data-fade]");
        const strokes = stage.querySelectorAll("[data-stroke]");
        const branches = stage.querySelectorAll("[data-branch]");

        if (reducedMotion) {
          /* El hook devuelve false durante la hidratación, así que el estado
             final se restaura explícitamente en vez de salir con un return. */
          gsap.set(fades, { opacity: 1, y: 0, clearProps: "transform" });
          gsap.set(strokes, { strokeDashoffset: 0 });
          gsap.set(branches, { scaleX: 1 });
          return;
        }

        gsap.set(strokes, { strokeDashoffset: CONNECTOR });
        gsap.set(branches, { scaleX: 0, transformOrigin: "left center" });

        const scrollTrigger = { trigger: stage, start: "top 85%", once: true };

        gsap.to(fades, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger,
        });

        gsap.to(branches, {
          scaleX: 1,
          duration: 0.4,
          ease: "power2.out",
          delay: 0.15,
          scrollTrigger,
        });

        gsap.to(strokes, {
          strokeDashoffset: 0,
          duration: 0.5,
          ease: "power1.inOut",
          delay: 0.2,
          scrollTrigger,
        });
      });
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={rootRef} className="mt-14">
      <ol>
        {spine.map((node, index) => {
          const configs = inputsOf(node.id, "config");
          const feeds = index === 0 ? inputsOf(node.id, "artifact") : [];
          const outputs = outputsOf(node.id);
          const last = index === spine.length - 1;

          return (
            <li key={node.id} data-flow-stage>
              {feeds.map((feed) => (
                <ArtifactLabel key={feed.id} node={feed} leading />
              ))}

              {/* Las tres columnas se reservan siempre, lleve o no ficheros de
                  configuración esta etapa: si no, las tarjetas sin chip se
                  estirarían y la espina dejaría de leerse como una columna. */}
              <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_2.5rem_18rem]">
                <NodeCard node={node} />

                <span
                  data-branch
                  aria-hidden="true"
                  className={cn(
                    "hidden h-px w-10 border-t border-dashed border-line lg:block",
                    configs.length === 0 && "lg:invisible",
                  )}
                />

                <ul className="flex flex-col gap-2">
                  {configs.map((config) => (
                    <ConfigChip key={config.id} node={config} />
                  ))}
                </ul>
              </div>

              {last ? null : <Connector />}

              {outputs.map((output) => (
                <ArtifactLabel key={output.id} node={output} />
              ))}
            </li>
          );
        })}
      </ol>

      <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6">
        {legend.map((item) => (
          <li
            key={item.status}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-fg-muted"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-3 w-3 shrink-0 rounded-sm border",
                item.status === "built" && "border-accent bg-accent/20",
                item.status === "pending" && "border-dashed border-line",
                item.status === "deferred" &&
                  "border-dashed border-line opacity-60",
                item.status === "config" &&
                  "rounded-full border-line bg-graphite-hi",
                item.status === "artifact" && "border-transparent bg-line",
              )}
            />
            {item.label}
          </li>
        ))}
      </ul>

      {block.note ? (
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-fg-muted">
          {block.note}
        </p>
      ) : null}
    </div>
  );
}

function Connector() {
  return (
    <svg
      width="2"
      height={CONNECTOR}
      viewBox={`0 0 2 ${CONNECTOR}`}
      className="ml-6 block overflow-visible"
      aria-hidden="true"
    >
      <line
        data-stroke
        x1="1"
        y1="0"
        x2="1"
        y2={CONNECTOR}
        strokeWidth="1"
        strokeDasharray={CONNECTOR}
        className="stroke-line"
      />
    </svg>
  );
}

function NodeCard({ node }: { node: FlowNode }) {
  const chip = statusChip[node.status];

  return (
    <article
      data-fade
      className={cn(
        "reveal-init rounded-lg border p-5 sm:p-6",
        node.status === "built"
          ? "border-accent/60 bg-graphite"
          : "border-dashed border-line bg-transparent",
        node.status === "deferred" && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {node.stage ? (
          <span
            className={cn(
              "font-mono text-xs",
              node.status === "built" ? "text-accent" : "text-fg-muted",
            )}
          >
            {node.stage}
          </span>
        ) : null}

        {chip ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
              node.status === "built"
                ? "border border-accent text-accent"
                : "border border-dashed border-line text-fg-muted",
            )}
          >
            {chip}
          </span>
        ) : null}

        {node.owner ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            Owner · {node.owner}
          </span>
        ) : null}
      </div>

      <h3
        className={cn(
          "mt-4 font-display text-lg font-semibold tracking-tight",
          node.status === "built" ? "text-fg" : "text-fg-muted",
        )}
      >
        {node.title}
      </h3>

      {node.meta ? (
        <p className="mt-1 font-mono text-xs text-fg-muted">{node.meta}</p>
      ) : null}

      {node.detail ? (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
          {node.detail}
        </p>
      ) : null}
    </article>
  );
}

function ConfigChip({ node }: { node: FlowNode }) {
  return (
    <li
      data-fade
      className="reveal-init rounded-lg border border-line bg-graphite-hi px-4 py-3"
    >
      <p className="font-mono text-[10px] text-fg">⌗ {node.title}</p>
      {node.meta ? (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {node.meta}
        </p>
      ) : null}
    </li>
  );
}

function ArtifactLabel({
  node,
  leading,
}: {
  node: FlowNode;
  leading?: boolean;
}) {
  return (
    <p
      data-fade
      className={cn(
        "reveal-init flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-fg-muted",
        leading ? "pb-4" : "pt-4 pl-12",
      )}
    >
      {leading ? null : (
        <span aria-hidden="true" className="h-px w-4 shrink-0 bg-line" />
      )}
      {node.title}
    </p>
  );
}
