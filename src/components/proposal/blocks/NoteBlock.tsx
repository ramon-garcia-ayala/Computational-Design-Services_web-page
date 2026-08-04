import { Reveal } from "@/components/ui/Reveal";
import type { NoteBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { Icon } from "../icons";

/**
 * Aviso corto entre secciones. No lleva la carcasa de bloque: es una nota, no
 * un apartado, y por eso tampoco aparece en el índice lateral.
 */
export function NoteBlock({ block }: { block: NoteBlockData }) {
  return (
    <section id={block.id} className="border-t border-line py-14">
      <div className="shell">
        <Reveal>
          <div
            className={cn(
              "flex max-w-3xl gap-4 rounded-lg border p-6 lg:p-8",
              block.tone === "flag"
                ? "border-accent/40 bg-accent/5"
                : "border-line bg-graphite",
            )}
          >
            <Icon
              name={block.tone === "flag" ? "alert" : "route"}
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                block.tone === "flag" ? "text-accent" : "text-fg-muted",
              )}
            />
            <div>
              <h3 className="font-display text-base font-semibold tracking-tight text-fg">
                {block.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {block.body}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
