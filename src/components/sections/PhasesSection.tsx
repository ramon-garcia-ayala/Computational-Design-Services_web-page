"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PhaseCard } from "@/components/ui/PhaseCard";
import { phases } from "@/data/phases";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

export function PhasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cardsRef = useRef(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: "-60px" });

  return (
    <section id="phases" className="py-24 md:py-32 bg-surface/40">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col items-center text-center"
        >
          <SectionLabel className="mb-4">Methodology</SectionLabel>
          <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary md:text-4xl lg:text-5xl">
            Project phases
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            Every project starts with a functional MVP. Then we expand, optimize, and train your
            team. The scope of each phase depends on the project.
          </p>
        </motion.div>

        <motion.div
          ref={cardsRef}
          variants={containerVariants}
          initial="hidden"
          animate={cardsInView ? "visible" : "hidden"}
          className="relative grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {phases.map((phase, index) => (
            <div key={phase.number} className="relative flex items-stretch">
              <PhaseCard phase={phase} />
              {index < phases.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full bg-surface border border-border text-text-muted">
                  <ArrowRight size={12} />
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
