"use client";

import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";
import type { WorkflowStep } from "@/data/proposals/types";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const roleStyle = {
  input: {
    border: "border-t-blue-500",
    label: "text-blue-400",
    tag: "INPUT",
  },
  process: {
    border: "border-t-accent",
    label: "text-accent",
    tag: "PROCESS",
  },
  output: {
    border: "border-t-emerald-500",
    label: "text-emerald-400",
    tag: "OUTPUT",
  },
} as const;

export function WorkflowDiagram({ steps }: { steps: WorkflowStep[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="flex flex-col md:flex-row items-stretch gap-1 md:gap-0"
    >
      {steps.map((step, i) => {
        const s = roleStyle[step.role];
        return (
          <Fragment key={step.label}>
            <motion.div
              variants={item}
              className={`flex-1 rounded-lg border border-border border-t-2 ${s.border} bg-surface p-4 space-y-1.5`}
            >
              <p className={`font-mono text-[10px] uppercase tracking-widest ${s.label}`}>
                {s.tag}
              </p>
              <p className="font-semibold text-sm text-text-primary leading-snug">
                {step.label}
              </p>
              <p className="font-mono text-xs text-text-muted">{step.sublabel}</p>
            </motion.div>

            {i < steps.length - 1 && (
              <motion.div
                variants={item}
                className="flex items-center justify-center shrink-0 text-border-subtle text-xs mx-0.5 rotate-90 md:rotate-0 self-center py-1 md:py-0"
              >
                ▶
              </motion.div>
            )}
          </Fragment>
        );
      })}
    </motion.div>
  );
}
