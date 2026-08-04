import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  solid:
    "bg-accent text-carbon hover:bg-accent-dim border border-transparent",
  outline:
    "border border-line text-fg hover:border-accent hover:text-accent bg-transparent",
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
  /** Los mailto y los enlaces externos evitan el router de Next. */
  external?: boolean;
  className?: string;
};

/**
 * Enlace de acción del sitio. Único punto donde vive el estilo de los CTAs,
 * para que header, overlay, secciones y footer no diverjan.
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
    "inline-flex items-center justify-center gap-2 rounded-full font-mono uppercase transition-colors duration-200",
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
