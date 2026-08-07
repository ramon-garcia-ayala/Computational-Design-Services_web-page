"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CTALink } from "@/components/ui/CTALink";
import { decodeSpec, encodeSpec, TOOL_PATH } from "../lib/encode";
import { readStashedSpec } from "../lib/handoff";
import { bandSummaries, formatArea } from "../lib/program";
import { planFloor } from "../lib/subdivide";
import { PROGRAM_LABELS } from "../lib/palette";
import { paramDefsFor } from "../schema/validate";
import { isViewerSpec, type MinitoolSpec } from "../schema/spec";
import { viewerCopy } from "../data/copy";
import { ParamPanel, type ParamValues } from "./controls/ParamPanel";
import { ProgramLegend, type LegendEntry } from "./ProgramLegend";
import { ClosingBlock } from "./ClosingBlock";
import { PitchPage } from "./pitch/PitchPage";

const ViewerCanvas = dynamic(() => import("./viewer/ViewerCanvas"), {
  ssr: false,
});

type Phase = "loading" | "ready" | "invalid";

/** Legend rows, if this archetype has a program worth naming. */
function legendFor(spec: MinitoolSpec): LegendEntry[] {
  if (spec.template === "massing") {
    return bandSummaries(spec.program, spec.params).map((band) => ({
      use: band.use,
      name: PROGRAM_LABELS[band.use],
      value: `${band.floors} fl · ${formatArea(band.area)}`,
    }));
  }

  if (spec.template === "layout") {
    return planFloor(spec.spaces, spec.params).spaces.map((space) => ({
      use: space.use,
      name: space.name,
      value: formatArea(space.area),
    }));
  }

  return [];
}

function withParam(
  spec: MinitoolSpec,
  key: string,
  value: number | string,
): MinitoolSpec {
  if (spec.template === "pitch") return spec;
  return { ...spec, params: { ...spec.params, [key]: value } } as MinitoolSpec;
}

/**
 * The page behind every generated link.
 *
 * The whole spec lives in the URL fragment, which never reaches the server —
 * so this route ships as one static page no matter how many tools exist, and
 * a link carries its tool with it.
 *
 * Note there is no `Reveal` here. Its ScrollTriggers are built on mount, and
 * this content only exists after an async decode; a trigger created against a
 * page that was still a spinner measures the wrong position and the section
 * never appears. A plain opacity transition costs nothing and cannot fail that
 * way.
 */
export function ToolViewerPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [spec, setSpec] = useState<MinitoolSpec | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      decodeSpec(window.location.hash).then((parsed) => {
        if (cancelled) return;

        /* The fragment is canonical, but a same-tab arrival from the chat has
           a second chance: the widget stashed the spec it just generated. Only
           when both fail is the link truly empty. */
        const recovered = parsed ?? readStashedSpec();
        if (!recovered) {
          setPhase("invalid");
          return;
        }

        setSpec(recovered);
        setPhase("ready");
      });
    };

    load();

    /* Pasting a different tool's link into the same tab only changes the
       fragment, so there is no navigation and nothing would re-read it.
       `replaceState` — how the sliders write back — does not fire this event,
       so the listener never sees our own updates. */
    window.addEventListener("hashchange", load);

    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", load);
    };
  }, []);

  /* Every adjustment goes back into the address bar, so the link the visitor
     copies is the version they are looking at, not the one they were sent. */
  useEffect(() => {
    if (!spec) return;

    const timeout = window.setTimeout(() => {
      encodeSpec(spec).then((payload) => {
        window.history.replaceState(null, "", `${TOOL_PATH}#${payload}`);
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [spec]);

  const handleParam = useCallback((key: string, value: number | string) => {
    setSpec((current) => (current ? withParam(current, key, value) : current));
  }, []);

  const defs = useMemo(() => (spec ? paramDefsFor(spec) : []), [spec]);
  const legend = useMemo(() => (spec ? legendFor(spec) : []), [spec]);

  if (phase === "loading") {
    return (
      <Shell>
        <p className="text-sm text-fg-muted">{viewerCopy.loading}</p>
      </Shell>
    );
  }

  if (phase === "invalid" || !spec) {
    return (
      <Shell>
        <h1 className="max-w-2xl font-display text-3xl leading-tight text-fg sm:text-4xl">
          {viewerCopy.invalid.title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted">
          {viewerCopy.invalid.body}
        </p>
        <div className="mt-8">
          <CTALink href="/" size="lg">
            {viewerCopy.invalid.cta}
          </CTALink>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          {spec.template === "pitch" ? "Scoped for you" : "Generated tool"}
        </p>
        <h1 className="mt-4 font-display text-3xl leading-tight text-fg sm:text-4xl lg:text-5xl">
          {spec.meta.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-fg-muted sm:text-lg">
          {spec.meta.tagline}
        </p>
      </header>

      <div className="mt-12 lg:mt-16">
        {spec.template === "pitch" ? (
          <PitchPage spec={spec} />
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
              <div>
                {/* Lenis owns the wheel everywhere else on the site; inside the
                    canvas it has to mean zoom, not scroll. */}
                <div
                  data-lenis-prevent
                  className="h-[58svh] min-h-[340px] overflow-hidden rounded-xl border border-line bg-graphite/40 lg:h-[620px]"
                >
                  {isViewerSpec(spec) ? <ViewerCanvas spec={spec} /> : null}
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                  {viewerCopy.orbitHint}
                </p>
              </div>

              <aside className="flex flex-col gap-8">
                {spec.meta.pitch ? (
                  <p className="text-sm leading-relaxed text-fg-muted">
                    {spec.meta.pitch}
                  </p>
                ) : null}

                <section>
                  <h2 className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                    {viewerCopy.parameters}
                  </h2>
                  <div className="mt-4">
                    <ParamPanel
                      defs={defs}
                      values={spec.params as ParamValues}
                      onChange={handleParam}
                    />
                  </div>
                </section>

                <ProgramLegend entries={legend} />

                <p className="text-xs leading-relaxed text-fg-muted">
                  {viewerCopy.shareHint}
                </p>
              </aside>
            </div>

            <ClosingBlock
              template={spec.template}
              generationMs={spec.meta.generationMs}
              subject={viewerCopy.contactSubject}
            />
          </>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-32 pb-24">
      <div className="grid-bg absolute inset-0 opacity-30" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(200,249,78,0.05),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="shell relative">{children}</div>
    </section>
  );
}
