import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChatPlaceholder } from "@/components/ui/ChatPlaceholder";
import { CTALink } from "@/components/ui/CTALink";
import { PanelVideo } from "@/components/design-lab/PanelVideo";
import { site } from "@/data/site";
import { labsCopy } from "@/data/labs";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Talk to the assistant that sketches a live parametric tool from your brief, right in the browser.",
};

/**
 * Studio playground — and, since the assistant moved here, the *only* place
 * it lives. It used to sit late in Home's own scroll ("try it yourself"
 * meant more once a visitor knew what "it" was); it now sits behind the
 * menu's "Labs" link instead, reachable on purpose rather than arrived at.
 * See `src/data/labs.ts` for the fuller history of the two routes.
 */
export default function LabsPage() {
  return (
    <>
      <section className="relative flex min-h-[60svh] items-center overflow-hidden pt-32 pb-16">
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,color-mix(in_srgb,var(--color-accent)_6%,transparent),transparent_60%)]"
          aria-hidden="true"
        />

        <div className="shell relative">
          <Reveal>
            <SectionHeading
              as="h1"
              kicker={labsCopy.kicker}
              title={labsCopy.title}
              lead={labsCopy.lead}
            />
          </Reveal>
        </div>
      </section>

      {/* The assistant, moved from Home's own Playground panel — same video,
          same copy, same widget, but not the same plate. That panel sat on
          `bg-lab-bg`, legible only because Home's header runs its `light`
          variant for the whole page to match. `(site)/layout.tsx` renders
          this route's header in its ordinary dark variant with no per-scroll
          switch, so a pale section here would float a dark legibility
          gradient over light content every time it scrolled under the
          header — which is what actually happened, measured. This section
          stays on the page's own dark ground instead: full-bleed video
          (`ClosingPanel`'s treatment, not the contained/feathered one built
          for a pale plate) and `ChatPlaceholder`'s own default surface
          (`bg-graphite/60`), which already reads correctly here — it was
          only overridden to `bg-carbon/85` on Home because that page's
          default carbon was the *pale* one. */}
      <section className="relative isolate overflow-hidden py-20 sm:py-24">
        <PanelVideo src={labsCopy.playground.video} />
        <div className="shell relative">
          <Reveal>
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ink sm:text-sm">
                {labsCopy.playground.kicker}
              </span>
              <h2 className="mt-3 text-h2 font-semibold text-fg">
                {labsCopy.playground.title}
              </h2>

              {/* `lg:aspect-[16/9]`: the same ratio Home's panel used, kept
                  for the transcript's own sake rather than any overflow
                  constraint here — this section is ordinary flow, not a
                  fixed 100svh stage, so nothing clips. Do not try to cap
                  this with `lg:max-h-*`: `ChatPlaceholder`'s own base
                  classes carry `lg:max-h-none`, `cn()` does not dedupe it
                  against an arbitrary value in the same group, and Tailwind
                  sorts `none` last — the cap lands in the class attribute
                  and changes nothing. Size the section's own padding
                  instead. */}
              <ChatPlaceholder className="mt-8 w-full max-w-3xl lg:aspect-[16/9]" />

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <CTALink href="/projects" size="lg">
                  See client work instead
                </CTALink>
                <CTALink href="/contact" variant="ghost" size="lg">
                  {site.contactLabel}
                </CTALink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
