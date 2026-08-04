import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Small mono label above the title. */
  kicker?: string;
  title: string;
  lead?: string;
  className?: string;
  /** The home uses h2; on pages where it leads the content, h1. */
  as?: "h1" | "h2";
};

export function SectionHeading({
  kicker,
  title,
  lead,
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {kicker ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          {kicker}
        </p>
      ) : null}
      <Tag className="mt-4 font-display text-3xl leading-[1.1] font-semibold tracking-tight text-fg sm:text-4xl lg:text-5xl">
        {title}
      </Tag>
      {lead ? (
        <p className="mt-5 text-base leading-relaxed text-fg-muted sm:text-lg">
          {lead}
        </p>
      ) : null}
    </div>
  );
}
