import { cn } from "@/lib/utils";

/**
 * Hueco reservado para el chatbot conversacional (FASE 2).
 *
 * Deliberadamente VACÍO: no implementa estado, entrada de texto ni lógica de
 * chat. Solo fija altura y posición dentro del hero para que al montar el
 * componente real no cambie el layout ni se mueva el LCP.
 *
 * Al construir la Fase 2, sustituir el contenido interno por el widget y
 * mantener las dimensiones del contenedor.
 */
export function ChatPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-line bg-graphite/60 backdrop-blur-sm",
        "min-h-[220px] sm:min-h-[280px] lg:aspect-[4/3] lg:min-h-0",
        className,
      )}
      data-slot="chat"
      aria-label="Conversational assistant, coming soon"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          Assistant
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
            Phase 2
          </span>
        </span>
      </div>

      {/* Slot del widget conversacional. No añadir lógica aquí en Fase 1. */}
      <div className="flex h-full min-h-[140px] items-center justify-center p-6">
        <p className="max-w-[22ch] text-center text-sm text-fg-muted">
          Conversational assistant lands here.
        </p>
      </div>
    </div>
  );
}
