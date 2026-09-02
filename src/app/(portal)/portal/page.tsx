import type { Metadata } from "next";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";
import { PortalWordmark } from "@/components/portal/PortalWordmark";
import { PortalColophon } from "@/components/portal/PortalColophon";
import { portalCopy } from "@/data/portal/copy";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: `Client access · ${site.nameFlat}` },
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ error?: string }> };

/**
 * Sign-in.
 *
 * ## Two columns, because one was two thirds empty
 *
 * This was a `max-w-xl` stack pinned to the left of a 1440px page: the form
 * finished around x=620 and nothing followed it to the right edge. On the
 * landing that width never happens — every section there either runs the full
 * `max-w-[1440px]` measure or splits into columns that do. So the form keeps
 * the prose measure it needs and a second column carries what a visitor at
 * this screen actually wants: what is behind the link they are requesting.
 * Both columns are in `data/portal/copy.ts`; nothing is written here.
 *
 * Below `lg` the second column is *not* dropped — it moves under the form,
 * where it is the answer to "is this worth an email round trip". Hiding it on
 * a phone would hide it from the readers most likely to be asking.
 *
 * ## What was removed
 *
 * The amber radial wash (`radial-gradient(… accent 7% …)`). It appears
 * nowhere in the site's own vocabulary — not on the landing, not in the
 * document band, not on a panel — and on the warm ground this route group now
 * renders on it reads as a smudge rather than as light. `grid-bg` stays: it is
 * a project utility, it is the texture the panel's own hero uses, and against
 * `--color-line-soft` on this ground it is a whisper.
 */
export default async function PortalLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const { login } = portalCopy;

  return (
    <div className="flex min-h-[100svh] flex-col">
      {/* `py-16 sm:py-20`, trimmed from `py-20 sm:py-24` once the colophon
          joined the page: the two together ran the document 68px past a
          675px viewport, which put a scrollbar on a page that is one form.
          The stack already carries `mt-14 lg:mt-20` under the lockup, so the
          section's own padding was the part with room to give. */}
      <section className="relative flex flex-1 items-center overflow-hidden py-16 sm:py-20">
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />

        <div className="shell relative">
          <PortalWordmark size="lg" />

          {/* `1.15fr_1fr` rather than even halves: the left column holds a
              heading on the shared display scale plus a form row, and at 1fr
              its heading broke to three lines while the list beside it ran
              short. The `lg:gap-20` matches the document band's own two-column
              About section. */}
          <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <div>
              {/* The landing's kicker idiom — `tracking-[0.3em]`, sized
                  `text-xs sm:text-sm`, in the accent's ink role. The panel
                  previously set every kicker at a flat `text-[10px]
                  tracking-widest`, which is the proposal chrome's size, not
                  the site's. */}
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ink sm:text-sm">
                {login.kicker}
              </p>

              {/* `text-h1` off the shared fluid scale, not the `text-3xl
                  sm:text-4xl` step ladder this carried. `globals.css` is
                  explicit that one scale is used everywhere and that a
                  heading changing *behaviour* by route is the bug the scale
                  exists to close. */}
              <h1 className="mt-4 max-w-2xl text-h1 font-display font-semibold text-fg">
                {login.title}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
                {login.lead}
              </p>

              <PortalLoginForm />

              {error === "invalid_link" ? (
                <p
                  role="alert"
                  className="mt-8 max-w-xl rounded-surface border border-edge bg-graphite px-5 py-4 text-sm leading-relaxed text-fg-muted"
                >
                  <span className="font-semibold text-fg">
                    {portalCopy.enter.invalidTitle}
                  </span>{" "}
                  — {portalCopy.enter.invalidBody}
                </p>
              ) : null}
            </div>

            {/* The hairline dash marker is the document band's own list
                idiom, lifted verbatim from `HomeDocument`'s service
                deliverables: `mt-[0.62em] h-px w-2.5 bg-accent-ink`,
                `aria-hidden` because the words carry the content. */}
            <div className="lg:border-l lg:border-line lg:pl-20">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-ink sm:text-sm">
                {login.inside.kicker}
              </p>

              <ul className="mt-8 space-y-5">
                {login.inside.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-4 text-sm leading-relaxed text-fg-muted sm:text-base"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.62em] h-px w-2.5 shrink-0 bg-accent-ink"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PortalColophon />
    </div>
  );
}
