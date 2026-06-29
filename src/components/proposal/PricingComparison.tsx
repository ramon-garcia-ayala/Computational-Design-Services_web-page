"use client";

import { motion, type Variants } from "framer-motion";
import type { PricingModel } from "@/data/proposals/types";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function PricingComparison({ models }: { models: PricingModel[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="grid md:grid-cols-3 gap-4"
    >
      {models.map((m) => (
        <motion.div
          key={m.title}
          variants={card}
          className={[
            "rounded-lg border p-6 flex flex-col gap-4",
            m.isComparisonBaseline
              ? "border-border bg-background opacity-60"
              : m.highlight
              ? "border-accent/50 bg-accent-muted"
              : "border-border bg-surface",
          ].join(" ")}
        >
          {/* tag */}
          <p
            className={[
              "font-mono text-[10px] uppercase tracking-widest",
              m.isComparisonBaseline
                ? "text-text-muted"
                : m.highlight
                ? "text-accent"
                : "text-text-muted",
            ].join(" ")}
          >
            {m.tag}
          </p>

          {/* titulo */}
          <div>
            <p
              className={[
                "font-display text-lg font-bold leading-tight",
                m.isComparisonBaseline ? "text-text-secondary line-through decoration-text-muted" : "text-text-primary",
              ].join(" ")}
            >
              {m.title}
            </p>
            <p className="text-sm text-text-muted mt-0.5">{m.subtitle}</p>
          </div>

          {/* precio */}
          <div>
            <p
              className={[
                "font-mono text-2xl font-bold",
                m.isComparisonBaseline
                  ? "text-text-muted line-through decoration-text-muted"
                  : m.highlight
                  ? "text-accent"
                  : "text-text-primary",
              ].join(" ")}
            >
              {m.price}
            </p>
            {m.priceNote && (
              <p className="font-mono text-[11px] text-text-muted mt-0.5">{m.priceNote}</p>
            )}
          </div>

          {/* divisor */}
          <hr className="border-border" />

          {/* features */}
          <ul className="space-y-2 flex-1">
            {m.features.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-text-secondary">
                <span
                  className={[
                    "mt-0.5 shrink-0",
                    m.isComparisonBaseline ? "text-text-muted" : "text-accent",
                  ].join(" ")}
                >
                  {m.isComparisonBaseline ? "✕" : "▸"}
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </motion.div>
  );
}
