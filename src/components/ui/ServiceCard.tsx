"use client";

import { motion } from "framer-motion";
import {
  Workflow,
  MessageSquare,
  Building2,
  Zap,
  Cloud,
  Palette,
  Wrench,
  Puzzle,
  BrainCircuit,
  Cpu,
  Bot,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service } from "@/data/services";

const iconMap: Record<string, LucideIcon> = {
  Workflow,
  MessageSquare,
  Building2,
  Zap,
  Cloud,
  Palette,
  Wrench,
  Puzzle,
  BrainCircuit,
  Cpu,
  Bot,
};

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface ServiceCardProps {
  service: Service;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const Icon = iconMap[service.icon] ?? Workflow;

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent/20">
          <Icon size={20} />
        </div>
        <h3 className="font-display text-base font-semibold text-text-primary">
          {service.title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">
        {service.description}
      </p>
      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        {service.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
