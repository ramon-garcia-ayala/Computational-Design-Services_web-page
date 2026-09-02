import Link from "next/link";
import { designLab } from "@/data/design-lab";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * The logo, as the real asset rather than set type.
 *
 * Both the panel header and the sign-in page used to hand-set the lockup:
 * `R<sup>2</sup>&#967;TECH`. Two things were wrong with that. It printed a
 * *Latin* letterform where the wordmark's third glyph is a chi, so the panel
 * spelled the studio's name differently from every other page. And it sized
 * itself off the surrounding text, which is why the header's read at 14px
 * against a 228px lockup in the site's own footer.
 *
 * `LabFooter` and `Preloader` already solved this: the source ink is
 * near-black, so an `<img>` disappears on a dark plate, and the asset is
 * therefore drawn as a CSS mask that takes the colour of wherever it is used.
 * This is that same treatment, reduced to the two sizes the portal needs.
 * Ratio comes from the source asset (3103x611), so the box is reserved before
 * the mask paints and nothing shifts.
 */
export function PortalWordmark({
  size = "sm",
  className,
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const { mask } = designLab;

  return (
    <Link
      href="/"
      aria-label={`${site.nameFlat} — back to the site`}
      className={cn(
        "group inline-block shrink-0",
        /* The lockup is 3103x611 — a 5.08:1 strip — so its width sets a
           height five times smaller. At 92px the glyphs stood 18px tall in a
           56px bar and read as a hairline; 112/124 puts them at 22/24px,
           which is the weight the site's own chrome carries. */
        size === "lg" ? "w-[176px] sm:w-[208px]" : "w-[112px] sm:w-[124px]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="block w-full bg-fg transition-colors duration-200 group-hover:bg-accent-ink"
        style={{
          aspectRatio: `${mask.width} / ${mask.height}`,
          WebkitMaskImage: `url('${mask.src}')`,
          maskImage: `url('${mask.src}')`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />
    </Link>
  );
}
