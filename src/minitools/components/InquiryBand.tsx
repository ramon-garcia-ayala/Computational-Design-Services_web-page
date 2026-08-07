"use client";

import { useEffect, useMemo, useState } from "react";
import { CTALink } from "@/components/ui/CTALink";
import { site } from "@/data/site";
import { inquiryHref } from "../lib/inquiry";
import {
  cleanVisitorField,
  EMPTY_VISITOR,
  looksLikeEmail,
  readVisitor,
  VISITOR_FIELD_LIMITS,
  writeVisitor,
  type Visitor,
} from "../lib/visitor";
import { closingLine, inquiryCopy, pitchCopy, viewerCopy } from "../data/copy";
import type { MinitoolSpec } from "../schema/spec";

/** How long to wait after the last keystroke before persisting to storage. */
const PERSIST_DEBOUNCE_MS = 500;

/**
 * The single closing argument for every generated page. The 3D viewer and the
 * pitch page render this once, as a sibling of the page's `Shell` rather than
 * inside it, so it can run full-bleed — the same slot `FinalCTA` occupies on
 * the marketing pages, turned up: this is meant to be the brightest thing on
 * the page.
 *
 * The two fields are optional and feed nothing but the mailto below; nothing
 * here is ever sent anywhere else. No `Reveal` — same reason as the rest of
 * `ToolViewerPage`: this only exists after an async hash decode, and a
 * ScrollTrigger built against the pre-decode spinner measures the wrong
 * position and never fires.
 */
export function InquiryBand({
  spec,
  shareUrl,
}: {
  spec: MinitoolSpec;
  shareUrl: string | null;
}) {
  const [visitor, setVisitor] = useState<Visitor>(EMPTY_VISITOR);
  const [loaded, setLoaded] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  /* Storage only exists client-side; reading it during render would make the
     first client render disagree with the server-rendered HTML and React
     would discard the subtree. Read once, after mount — deferred to a
     microtask so the state update is not the first synchronous act of the
     effect, which is what the exhaustive-deps rule flags as a smell even when
     genuinely needed here. */
  useEffect(() => {
    queueMicrotask(() => {
      setVisitor(readVisitor());
      setLoaded(true);
    });
  }, []);

  /* Guarded on `loaded` so the empty initial state is never written back over
     whatever was already stored, before the read above has landed. */
  useEffect(() => {
    if (!loaded) return;
    const timeout = window.setTimeout(() => writeVisitor(visitor), PERSIST_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [visitor, loaded]);

  const subject = spec.template === "pitch" ? pitchCopy.contactSubject : viewerCopy.contactSubject;
  const { headline, headlineAccent, body, cta } = closingLine(spec.template, spec.meta.generationMs);

  const href = useMemo(
    () => inquiryHref({ spec, visitor, shareUrl, subject }),
    [spec, visitor, shareUrl, subject],
  );

  /* Trimmed before the check: `inquiryHref` trims the email at compose time
     (see `visitor.ts` — the field itself never trims live, to avoid eating a
     trailing space while the visitor is still typing), so a pasted address
     with incidental leading/trailing whitespace must not fail validation here
     when it would compose into a perfectly valid mailto. */
  const emailInvalid =
    emailTouched && visitor.email.trim().length > 0 && !looksLikeEmail(visitor.email.trim());

  return (
    <section
      aria-labelledby="inquiry-title"
      className="relative overflow-hidden border-t border-line"
    >
      <div aria-hidden="true" className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_115%,rgba(200,249,78,0.16),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(200,249,78,0.55),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent,var(--color-carbon))]"
      />

      <div className="shell relative py-24 sm:py-32 lg:py-40">
        <div className="max-w-4xl">
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-accent">
            <span aria-hidden="true" className="h-px w-8 bg-accent/60" />
            <span>
              {inquiryCopy.kicker} R<sup className="text-accent">2</sup>ch-Tech
            </span>
          </p>

          <h2
            id="inquiry-title"
            className="mt-6 font-display text-4xl leading-[0.95] font-semibold tracking-tight text-fg sm:text-6xl lg:text-7xl"
          >
            {headline} <span className="text-accent">{headlineAccent}</span>
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">{body}</p>

          <form className="mt-10 max-w-2xl" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="inquiry-name"
                  className="font-mono text-[10px] uppercase tracking-widest text-fg-muted"
                >
                  {inquiryCopy.nameLabel}
                </label>
                <input
                  id="inquiry-name"
                  type="text"
                  autoComplete="name"
                  maxLength={VISITOR_FIELD_LIMITS.name}
                  value={visitor.name}
                  placeholder={inquiryCopy.namePlaceholder}
                  onChange={(event) =>
                    setVisitor((current) => ({
                      ...current,
                      name: cleanVisitorField(event.target.value, VISITOR_FIELD_LIMITS.name),
                    }))
                  }
                  className="mt-2 w-full rounded-full border border-line bg-graphite px-5 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="inquiry-reply"
                  className="font-mono text-[10px] uppercase tracking-widest text-fg-muted"
                >
                  {inquiryCopy.emailLabel}
                </label>
                <input
                  id="inquiry-reply"
                  type="email"
                  autoComplete="email"
                  maxLength={VISITOR_FIELD_LIMITS.email}
                  value={visitor.email}
                  placeholder={inquiryCopy.emailPlaceholder}
                  aria-invalid={emailInvalid}
                  aria-describedby="inquiry-note"
                  onBlur={() => setEmailTouched(true)}
                  onChange={(event) =>
                    setVisitor((current) => ({
                      ...current,
                      email: cleanVisitorField(event.target.value, VISITOR_FIELD_LIMITS.email),
                    }))
                  }
                  className="mt-2 w-full rounded-full border border-line bg-graphite px-5 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <p
              id="inquiry-note"
              role="status"
              className="mt-4 min-h-5 text-xs leading-relaxed text-fg-muted"
            >
              {emailInvalid ? inquiryCopy.emailNudge : inquiryCopy.trust}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <CTALink href={href} variant="solid" size="lg" external>
                {cta}
              </CTALink>
              <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                {site.location}
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
