"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Phase } from "@/data/phases";

export const phaseVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

interface PhaseCardProps {
  phase: Phase;
}

export function PhaseCard({ phase }: PhaseCardProps) {
  return (
    <motion.div
      variants={phaseVariants}
      className={cn(
        "relative flex flex-col gap-5 rounded-xl border bg-surface p-8 transition-all duration-300",
        phase.highlight
          ? "border-accent/50 shadow-lg shadow-accent/10"
          : "border-border hover:border-border-subtle"
      )}
    >
      {phase.highlight && (
        <div className="absolute -top-3 left-6">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
            Start Here
          </span>
        </div>
      )}
      <div>
        <span className="font-mono text-4xl font-bold text-accent/40">
          {phase.number}
        </span>
      </div>
      <div>
        <h3 className="font-display text-xl font-semibold text-text-primary">
          {phase.title}
        </h3>
        <p className="mt-1 text-sm text-accent font-medium">{phase.subtitle}</p>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{phase.description}</p>
      <ul className="flex flex-col gap-2.5 mt-auto">
        {phase.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-text-secondary">
            <Check size={15} className="mt-0.5 shrink-0 text-accent" />
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
