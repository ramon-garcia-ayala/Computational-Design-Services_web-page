"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CTALink } from "@/components/ui/CTALink";
import { decodeSpec, encodeSpec, TOOL_PATH } from "../lib/encode";
import { readStashedSpec } from "../lib/handoff";
import { bandSummaries, formatArea } from "../lib/program";
import { planFloor } from "../lib/subdivide";
import { solveField, WFC_TILES } from "../lib/wfc";
import { analyse, DEFLECTION_LIMIT } from "../lib/structure";
import {
  FG_MUTED,
  PROGRAM_COLORS,
  PROGRAM_LABELS,
  utilisationColor,
  WFC_TILE_COLORS,
  WFC_TILE_LABELS,
} from "../lib/palette";
import { paramDefsFor } from "../schema/validate";
import { isViewerSpec, type MinitoolSpec } from "../schema/spec";
import { viewerCopy } from "../data/copy";
import { ParamPanel, type ParamValues } from "./controls/ParamPanel";
import { ProgramLegend, type LegendEntry } from "./ProgramLegend";
import { InquiryBand } from "./InquiryBand";
import { PitchPage } from "./pitch/PitchPage";

const ViewerCanvas = dynamic(() => import("./viewer/ViewerCanvas"), {
  ssr: false,
});

type Phase = "loading" | "ready" | "invalid";

/**
 * The legend, if this archetype colours anything worth naming.
 *
 * The heading comes back with the rows rather than being decided at the call
 * site, because the two are the same decision: a structural readout is not a
 * program and a tile mix is not one either, and splitting that across two
 * places is how this page starts growing a second switch per archetype.
 */
function legendFor(spec: MinitoolSpec): { heading: string; entries: LegendEntry[] } {
  if (spec.template === "massing") {
    return {
      heading: viewerCopy.legend,
      entries: bandSummaries(spec.program, spec.params).map((band) => ({
      name: PROGRAM_LABELS[band.use],
        value: `${band.floors} fl · ${formatArea(band.area)}`,
        color: PROGRAM_COLORS[band.use],
      })),
    };
  }

  if (spec.template === "layout") {
    return {
      heading: viewerCopy.legend,
      entries: planFloor(spec.spaces, spec.params).spaces.map((space) => ({
        name: space.name,
        value: formatArea(space.area),
        color: PROGRAM_COLORS[space.use],
        /* The room's own name says nothing about what the colour means, so the
           program still has to be read out. */
        srLabel: PROGRAM_LABELS[space.use],
      })),
    };
  }

  /* The readout is the archetype. A structural tool that shows a bent line
     and no numbers is a picture of a beam, and the visitor this is aimed at
     will say so. The swatch doubles as the pass/fail indicator — which is why
     each row also carries an `srLabel`: a verdict delivered only in colour is
     no verdict for anyone who cannot see it. */
  if (spec.template === "structure") {
    const words = viewerCopy.structure;
    const result = analyse(spec.params);
    const verdict = result.passesDeflection ? words.withinLimits : words.overLimit;
    const limitColor = utilisationColor(result.passesDeflection ? 0.2 : 1);

    return {
      heading: viewerCopy.performance,
      entries: [
        {
          name: words.deflection,
          value: `${Math.round(result.deflection * 1000)} mm`,
          color: limitColor,
          srLabel: verdict,
        },
        {
          name: words.ratio,
          value: Number.isFinite(result.ratio) ? `L/${Math.round(result.ratio)}` : "L/∞",
          color: limitColor,
          srLabel: `${verdict}, ${words.against(DEFLECTION_LIMIT)}`,
        },
        {
          name: words.utilisation,
          value: `${Math.round(result.utilisation * 100)}%`,
          color: utilisationColor(result.utilisation),
          srLabel:
            result.utilisation > 1 ? words.overAllowable : words.withinAllowable,
        },
        {
          name: words.depth,
          value: `L/${Math.round(result.depthRatio)}`,
          color: FG_MUTED,
        },
      ],
    };
  }

  /* Counting the field is the only way to read a generated result as a mix
     rather than as a picture — "eleven towers out of a hundred and twenty-one
     cells" is the number an architect actually argues about. Empty ground is
     listed too, and deliberately: `openness` exists to produce it, so a
     control whose whole job is absence needs somewhere its effect shows up as
     a figure.

     Solving twice — here and in the mesh — is the same trade `layout` already
     makes with `planFloor`, and it is the cheaper coupling: the alternative is
     lifting an archetype's solver into this page and threading its result
     down, which is how a generic viewer starts growing archetype-shaped
     branches. Both callers memoise, and the field is bounded by
     `LIMITS.wfcCells`. */
  if (spec.template === "wfc") {
    const field = solveField(spec.params);
    const cells = field.size * field.size;

    return {
      heading: viewerCopy.mix,
      entries: WFC_TILES.filter((tile) => field.counts[tile] > 0).map((tile) => ({
        name: WFC_TILE_LABELS[tile],
        value: `${field.counts[tile]} · ${Math.round((field.counts[tile] / cells) * 100)}%`,
        color: WFC_TILE_COLORS[tile],
      })),
    };
  }

  return { heading: viewerCopy.legend, entries: [] };
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
  /** The absolute link the closing band composes its mailto around. */
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    /**
     * `arriving` marks the first read, the one that may be the same-tab click
     * out of the chat widget. Only that read may fall back to the stash, and
     * only when there was a fragment to fail: the stash holds whatever this
     * tab generated last, with nothing tying it to the link being opened, so
     * using it later would render one visitor's tool under another's URL — and
     * the writeback below would then rewrite the address bar to match it.
     */
    const load = (arriving: boolean) => {
      const hash = window.location.hash;

      decodeSpec(hash).then((parsed) => {
        if (cancelled) return;

        const recovered =
          parsed ?? (arriving && hash.length > 1 ? readStashedSpec() : null);

        if (!recovered) {
          setPhase("invalid");
          return;
        }

        setSpec(recovered);
        setPhase("ready");
      });
    };

    load(true);

    /* Pasting a different tool's link into the same tab only changes the
       fragment, so there is no navigation and nothing would re-read it.
       `replaceState` — how the sliders write back — does not fire this event,
       so the listener never sees our own updates. */
    const onHashChange = () => load(false);
    window.addEventListener("hashchange", onHashChange);

    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  /* Every adjustment goes back into the address bar, so the link the visitor
     copies is the version they are looking at, not the one they were sent.
     The closing band's mailto rides the same encode rather than running its
     own: a second debounced encoder would call `CompressionStream` twice per
     slider drag and could disagree with what actually landed in the URL. */
  useEffect(() => {
    if (!spec) return;

    /* Consecutive edits overlap two in-flight encodes when the first is slow
       enough (CompressionStream on a large freeform scene) for the second to
       finish first. Without this flag the slower, older encode would resolve
       last and clobber both the address bar and `shareUrl` with a stale link. */
    let cancelled = false;

    const timeout = window.setTimeout(() => {
      encodeSpec(spec).then((payload) => {
        if (cancelled) return;
        const href = `${TOOL_PATH}#${payload}`;
        window.history.replaceState(null, "", href);
        setShareUrl(`${window.location.origin}${href}`);
      });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [spec]);

  const handleParam = useCallback((key: string, value: number | string) => {
    setSpec((current) => (current ? withParam(current, key, value) : current));
  }, []);

  const defs = useMemo(() => (spec ? paramDefsFor(spec) : []), [spec]);
  const legend = useMemo(
    () => (spec ? legendFor(spec) : { heading: viewerCopy.legend, entries: [] }),
    [spec],
  );

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
    <>
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

                <ProgramLegend entries={legend.entries} heading={legend.heading} />

                <p className="text-xs leading-relaxed text-fg-muted">
                  {viewerCopy.shareHint}
                </p>
              </aside>
            </div>
          )}
        </div>
      </Shell>

      <InquiryBand spec={spec} shareUrl={shareUrl} />
    </>
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
