import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-accent",
        className
      )}
    >
      <span className="w-4 h-px bg-accent" />
      {children}
    </div>
  );
}
