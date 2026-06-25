"use client";

import { motion } from "framer-motion";

interface StepItemProps {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}

export const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function StepItem({ number, title, description, isLast }: StepItemProps) {
  return (
    <motion.div variants={stepVariants} className="relative flex gap-4 md:flex-col md:gap-3">
      <div className="flex flex-col items-center md:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
          <span className="font-mono text-xs font-bold text-accent">{number}</span>
        </div>
        {!isLast && (
          <div className="mt-2 w-px flex-1 bg-border md:hidden" />
        )}
      </div>
      <div className="pb-8 md:pb-0">
        <h3 className="font-display text-base font-semibold text-text-primary mb-1.5">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
      </div>
    </motion.div>
  );
}
