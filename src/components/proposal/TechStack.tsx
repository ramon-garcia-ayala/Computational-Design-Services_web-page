"use client";

import { motion } from "framer-motion";
import type { TechItem } from "@/data/proposals/types";

export function TechStack({ items }: { items: TechItem[] }) {
  const primary = items.filter((i) => i.category === "primary");
  const alternative = items.filter((i) => i.category === "alternative");

  return (
    <div className="rounded-lg border border-border bg-surface p-5 space-y-5">
      <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
        Tools &amp; Technology
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-text-secondary font-medium">Primary Stack</p>
          <div className="flex flex-wrap gap-2">
            {primary.map((item, i) => (
              <motion.span
                key={item.name}
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
                className="inline-flex items-center rounded-full border border-accent/40 bg-accent-muted px-3 py-1 font-mono text-xs text-accent"
              >
                {item.name}
              </motion.span>
            ))}
          </div>
        </div>

        {alternative.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary font-medium">
              Alternative Workflow
            </p>
            <div className="flex flex-wrap gap-2">
              {alternative.map((item, i) => (
                <motion.span
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.88 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: i * 0.06 + 0.18,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                  className="inline-flex items-center rounded-full border border-border-subtle px-3 py-1 font-mono text-xs text-text-secondary"
                >
                  {item.name}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
