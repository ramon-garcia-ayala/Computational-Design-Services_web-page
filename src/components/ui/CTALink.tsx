import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  solid:
    "bg-accent text-on-accent hover:bg-accent-dim border border-transparent",
  /* `border-line` was the divider token (1.37:1 on carbon, "right for a
     decorative divider, wrong for an input" per its own comment in
     globals.css) on a control boundary; and the hover ended in bare
     `accent`, which is 1.00:1 on the pale ground — the button went
     invisible exactly when a visitor pointed at it. `edge` clears WCAG
     1.4.11 everywhere; `accent-ink` is amber's ink role, safe on every
     ground. */
  outline:
    "border border-edge text-fg hover:border-accent-ink hover:text-accent-ink bg-transparent",
  ghost: "border border-transparent text-fg-muted hover:text-fg bg-transparent",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 tracking-wide",
  md: "text-sm px-5 py-2.5 tracking-wide",
  lg: "text-base px-7 py-4 tracking-wide",
};

type CTALinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  /** mailto and external links bypass the Next router. */
  external?: boolean;
  className?: string;
};

/**
 * The site's action link. The single place where CTA styling lives, so that
 * header, overlay, sections and footer never drift apart.
 *
 * `rounded-control` — every interactive control on the site is a pill, per
 * the shape system in `globals.css`. This component is the flagship of that
 * rule; the components that hand-roll their own button instead of reaching
 * for this one are exactly where the radius drifted (`rounded-lg` textareas
 * next to `rounded-full` send buttons in the same widget).
 */
export function CTALink({
  href,
  children,
  variant = "outline",
  size = "md",
  external = false,
  className,
}: CTALinkProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-control font-mono uppercase transition-colors duration-200",
    variants[variant],
    sizes[size],
    className,
  );

  if (external || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noreferrer noopener" }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
