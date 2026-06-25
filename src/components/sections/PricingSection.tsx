"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Layers, Calendar, Shield, Sliders, LucideIcon } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { pricingPrinciples } from "@/data/content";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = { Layers, Calendar, Shield, Sliders };

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cardsRef = useRef(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: "-60px" });

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col items-center text-center"
        >
          <SectionLabel className="mb-4">Pricing</SectionLabel>
          <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary md:text-4xl lg:text-5xl">
            How we charge
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            No hourly rates, no surprises. Price reflects the real complexity of the project
            and the services involved, with a clear monthly deliverable itinerary.
          </p>
        </motion.div>

        <motion.div
          ref={cardsRef}
          variants={containerVariants}
          initial="hidden"
          animate={cardsInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {pricingPrinciples.map((principle, i) => {
            const Icon = iconMap[principle.icon] ?? Layers;
            return (
              <motion.div
                key={principle.title}
                variants={cardVariants}
                className={cn(
                  "group flex gap-5 rounded-xl border border-border bg-surface p-7 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
                  i === 0 && "md:border-accent/30"
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-text-primary mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={cardsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-8 text-center"
        >
          <p className="font-display text-lg font-semibold text-text-primary mb-2">
            Not sure where to start?
          </p>
          <p className="text-sm text-text-secondary mb-5">
            Tell us about your project and we'll put together a proposal together — no commitment required.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Let's talk
          </a>
        </motion.div>
      </div>
    </section>
  );
}
