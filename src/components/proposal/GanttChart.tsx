"use client";

import { motion } from "framer-motion";
import type { ProposalPhase } from "@/data/proposals/types";

const barColors = [
  "bg-blue-500/30 border-blue-500/60",
  "bg-accent/50 border-accent",
  "bg-emerald-500/40 border-emerald-500/70",
  "bg-amber-500/30 border-amber-500/60",
] as const;

const labelColors = [
  "text-blue-400",
  "text-accent",
  "text-emerald-400",
  "text-amber-400",
] as const;

export function GanttChart({ phases }: { phases: ProposalPhase[] }) {
  const withWeeks = phases.filter((p) => p.startWeek != null && p.endWeek != null);
  if (withWeeks.length === 0) return null;

  const totalWeeks = Math.max(...withWeeks.map((p) => p.endWeek!));
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  return (
    <div className="rounded-lg border border-border bg-surface p-5 space-y-4">
      <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
        Timeline Overview · {totalWeeks} Weeks
      </p>

      {/* Week ruler */}
      <div className="flex">
        <div className="w-28 sm:w-36 shrink-0" />
        <div className="flex-1 flex">
          {weeks.map((w) => (
            <div key={w} className="flex-1 text-center">
              <span className="font-mono text-[9px] text-text-muted select-none">
                {w % 2 === 1 ? w : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase bars */}
      <div className="space-y-2.5">
        {withWeeks.map((phase, i) => {
          const leftPct = ((phase.startWeek! - 1) / totalWeeks) * 100;
          const widthPct = ((phase.endWeek! - phase.startWeek! + 1) / totalWeeks) * 100;

          return (
            <div key={phase.number} className="flex items-center gap-3">
              <div className="w-28 sm:w-36 shrink-0">
                <p className={`text-xs font-medium truncate ${labelColors[i] ?? "text-text-secondary"}`}>
                  {phase.title}
                </p>
                <p className="font-mono text-[10px] text-text-muted">{phase.duration}</p>
              </div>

              <div className="flex-1 relative h-6 rounded bg-background border border-border overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className={`absolute top-0 h-full rounded border ${barColors[i] ?? "bg-accent/30 border-accent/60"}`}
                  style={{ left: `${leftPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Week legend */}
      <div className="flex justify-between pt-1">
        <span className="font-mono text-[10px] text-text-muted">Week 1</span>
        <span className="font-mono text-[10px] text-text-muted">Week {totalWeeks}</span>
      </div>
    </div>
  );
}
