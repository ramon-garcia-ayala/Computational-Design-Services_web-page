"use client";

import Image from "next/image";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { ProjectAsset } from "@/data/projects/media";
import { cn } from "@/lib/utils";

/** Height a media panel aims to fill inside the pinned track. */
const MEDIA_HEIGHT = "72vh";
/** Nothing may run wider than the screen, however panoramic. */
const MEDIA_MAX_WIDTH = "86vw";
/** Floor, so a portrait asset is a picture rather than a sliver. */
const MEDIA_MIN_WIDTH = "20rem";

/**
 * Beyond this a caption moves beside the media instead of under it.
 *
 * Four of these run 535 to 1048 characters, one of them ten lines. Stacked
 * under a 72vh image inside a 100vh panel there is simply no room, and the
 * panel clips them. Beside it there is a whole column going spare.
 */
const LONG_CAPTION = 120;

/**
 * One asset in the horizontal walkthrough.
 *
 * **In the pinned track the size is driven by height, not width.** Inheriting
 * the text panel's `46rem` — a width chosen for a readable line of prose — left
 * every asset 640px wide whatever its shape, so heights ran from 116px to 589px
 * and the average filled 37% of the panel: a 5.5:1 diagram became a thin strip
 * floating in a tall empty box. Fixing the height instead puts nearly every
 * asset at the same size and lets the panel width follow the picture, which is
 * what a horizontal filmstrip wants anyway.
 *
 * The width is `max(min-width, min(max-width, height × ratio))` so the two
 * limits resolve in CSS rather than in a branch: a panorama hits the width cap
 * and gets shorter, a portrait hits the floor. `aspectRatio` then derives the
 * height, which also reserves the box before the file loads — `HorizontalScroll`
 * measures `track.scrollWidth` to size its pin, and unreserved media measures
 * as nothing.
 */
export function MediaPanel({
  asset,
  alt,
  priority,
}: {
  asset: ProjectAsset;
  alt: string;
  priority?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const ratio = asset.width / asset.height;
  const asideCaption = Boolean(asset.caption && asset.caption.length > LONG_CAPTION);

  /* Only the pinned layout is height-driven. Stacked — below `lg`, or under
     reduced motion at any width — media stays full-bleed in its column with a
     cap so a square asset does not run past the fold. */
  const pinnedWidth = {
    "--media-w": `max(${MEDIA_MIN_WIDTH}, min(${MEDIA_MAX_WIDTH}, calc(${MEDIA_HEIGHT} * ${ratio})))`,
  } as React.CSSProperties;

  return (
    <figure
      className={cn(
        "flex w-full flex-col items-start justify-center",
        /* `w-auto` at `lg`, not `w-full`. The article shrink-wraps this figure,
           so a percentage here would be resolving against a width that is
           itself derived from this figure's content — the one case where
           intrinsic sizing can collapse. The frame below carries the only
           definite width in the chain. */
        !reducedMotion && "lg:w-auto",
        asideCaption && !reducedMotion && "lg:flex-row lg:items-center lg:gap-10",
      )}
    >
      <div
        className={cn(
          "relative max-h-[62vh] w-full shrink-0 overflow-hidden rounded-surface border border-line bg-graphite",
          !reducedMotion && "lg:max-h-none lg:w-[var(--media-w)]",
        )}
        style={{ ...pinnedWidth, aspectRatio: `${asset.width} / ${asset.height}` }}
      >
        {asset.kind === "image" ? (
          <Image
            src={asset.src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            /* Set by the manifest on a GIF that has no converted sibling.
               Next's optimiser re-encodes one to a still and drops every frame
               but the first, which still looks like a working image. */
            unoptimized={asset.unoptimized}
            priority={priority}
            className="object-contain"
          />
        ) : reducedMotion ? (
          /* The poster, not a paused <video>. A video element with autoPlay
             left off still fetches metadata and still offers controls on some
             platforms; the reduced-motion contract here is a still image. */
          <Image
            src={asset.poster}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-contain"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            /* `none` rather than `metadata`: a case study can carry five of
               these, and the dimensions the player would fetch metadata for
               are already declared on the frame above. */
            preload="none"
            poster={asset.poster}
            aria-label={alt}
            className="h-full w-full object-contain"
          >
            {asset.sources.map((src) => (
              <source
                key={src}
                src={src}
                type={src.endsWith(".webm") ? "video/webm" : "video/mp4"}
              />
            ))}
          </video>
        )}
      </div>

      {asset.caption ? (
        <figcaption
          className={cn(
            "mt-5 max-w-xl text-sm leading-relaxed whitespace-pre-line text-fg-muted",
            asideCaption &&
              !reducedMotion &&
              "lg:mt-0 lg:max-h-[72vh] lg:w-[20rem] lg:shrink-0 lg:overflow-y-auto",
          )}
          /* Lenis owns the wheel everywhere else, so a caption tall enough to
             scroll would otherwise move the page instead of itself. */
          data-lenis-prevent={asideCaption ? "" : undefined}
        >
          {asset.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
