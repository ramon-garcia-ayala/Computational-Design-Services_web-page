"use client";

import { motion, type Variants } from "framer-motion";
import type { ProposalData } from "@/data/proposals/types";
import { COMPANY_NAME, COMPANY_EMAIL } from "@/data/content";
import { WorkflowDiagram } from "./WorkflowDiagram";
import { TechStack } from "./TechStack";
import { GanttChart } from "./GanttChart";
import { HeaderPipeline } from "./HeaderPipeline";
import { PricingComparison } from "./PricingComparison";

const fade: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export function ProposalPage({ data }: { data: ProposalData }) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div>
            <p className="font-mono text-xs text-text-muted uppercase tracking-widest">
              {COMPANY_NAME}
            </p>
            <p className="font-mono text-xs text-accent mt-0.5">Project Proposal</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-text-muted">{data.date}</p>
            <p className="font-mono text-xs text-text-muted mt-0.5">Ref: {data.slug}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 space-y-20">
        {/* Hero */}
        <motion.section variants={stagger} initial="hidden" animate="show">
          <motion.p variants={fade} className="font-mono text-sm text-accent mb-3">
            Prepared for {data.client}
          </motion.p>
          <motion.h1
            variants={fade}
            className="font-display text-4xl font-bold text-text-primary leading-tight"
          >
            {data.projectTitle}
          </motion.h1>
          <motion.p variants={fade} className="mt-3 text-xl text-text-secondary">
            {data.projectSubtitle}
          </motion.p>

          {data.headerStages ? (
            <motion.div
              variants={fade}
              className="mt-8 overflow-hidden rounded-xl border border-border bg-surface"
            >
              <HeaderPipeline key={data.slug} stages={data.headerStages} />
            </motion.div>
          ) : (
            data.headerImage && (
              <motion.div
                variants={fade}
                className="mt-8 overflow-hidden rounded-xl border border-border bg-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.headerImage}
                  alt={`${data.projectTitle} — concept diagram`}
                  className="w-full h-auto block"
                />
              </motion.div>
            )
          )}

          <motion.p
            variants={fade}
            className="mt-8 text-text-secondary leading-relaxed max-w-2xl"
          >
            {data.summary}
          </motion.p>
        </motion.section>

        <Divider />

        {/* Challenge & Approach */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 gap-8"
        >
          <motion.div variants={fade} className="space-y-3">
            <SectionLabel>The Challenge</SectionLabel>
            <p className="text-text-secondary leading-relaxed">{data.challenge}</p>
          </motion.div>
          <motion.div variants={fade} className="space-y-3">
            <SectionLabel>Our Approach</SectionLabel>
            <p className="text-text-secondary leading-relaxed">{data.approach}</p>
          </motion.div>
        </motion.section>

        {/* Workflow Diagram */}
        {data.workflow && (
          <>
            <Divider />
            <motion.section
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="space-y-5"
            >
              <motion.div variants={fade}>
                <SectionLabel>Automation Pipeline</SectionLabel>
                <h2 className="font-display text-2xl font-semibold mt-1">
                  How the System Works
                </h2>
              </motion.div>
              <motion.div variants={fade}>
                <WorkflowDiagram steps={data.workflow} />
              </motion.div>
            </motion.section>
          </>
        )}

        <Divider />

        {/* Services */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-6"
        >
          <motion.div variants={fade}>
            <SectionLabel>Scope of Work</SectionLabel>
            <h2 className="font-display text-2xl font-semibold mt-1">
              Services Involved
            </h2>
          </motion.div>
          <motion.div variants={stagger} className="grid sm:grid-cols-2 gap-4">
            {data.services.map((s) => (
              <motion.div
                key={s.name}
                variants={fade}
                className="rounded-lg border border-border bg-surface p-5 space-y-1"
              >
                <p className="font-semibold text-text-primary">{s.name}</p>
                <p className="text-sm text-text-secondary">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Tech Stack */}
          {data.techStack && (
            <motion.div variants={fade}>
              <TechStack items={data.techStack} />
            </motion.div>
          )}
        </motion.section>

        <Divider />

        {/* Phases */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-6"
        >
          <motion.div variants={fade}>
            <SectionLabel>Timeline</SectionLabel>
            <h2 className="font-display text-2xl font-semibold mt-1">
              Project Phases
            </h2>
          </motion.div>

          {/* Gantt chart */}
          <motion.div variants={fade}>
            <GanttChart phases={data.phases} />
          </motion.div>

          {/* Detailed phase list */}
          <div className="space-y-4">
            {data.phases.map((phase) => (
              <motion.div
                key={phase.number}
                variants={fade}
                className="rounded-lg border border-border bg-surface p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs text-accent border border-accent/30 rounded px-2 py-1 shrink-0">
                    {phase.number}
                  </span>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <h3 className="font-semibold text-text-primary">{phase.title}</h3>
                      <span className="font-mono text-xs text-text-muted">
                        {phase.duration}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {phase.deliverables.map((d) => (
                        <li
                          key={d.title}
                          className="flex gap-2 text-sm text-text-secondary"
                        >
                          <span className="text-accent mt-0.5">▸</span>
                          <span>
                            <span className="text-text-primary font-medium">
                              {d.title}
                            </span>
                            {d.description && `: ${d.description}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <Divider />

        {/* Investment */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-6"
        >
          <motion.div variants={fade}>
            <SectionLabel>Investment</SectionLabel>
            <h2 className="font-display text-2xl font-semibold mt-1">Pricing</h2>
          </motion.div>

          {data.pricingModels ? (
            <PricingComparison models={data.pricingModels} />
          ) : (
            <motion.div
              variants={fade}
              className="rounded-lg border border-accent/30 bg-accent-muted p-8 space-y-4"
            >
              {data.investment.breakdown && (
                <div className="space-y-2 mb-6">
                  {data.investment.breakdown.map((item) => (
                    <div key={item.label} className="flex justify-between text-sm gap-4">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-mono text-text-primary shrink-0">
                        {item.amount}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border/50 pt-2" />
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-text-muted uppercase">Total</span>
                <span className="font-display text-3xl font-bold text-accent">
                  {data.investment.currency} {data.investment.total}
                </span>
              </div>
              <p className="text-sm text-text-secondary">{data.investment.note}</p>
            </motion.div>
          )}
        </motion.section>

        <Divider />

        {/* Next Steps */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-6"
        >
          <motion.div variants={fade}>
            <SectionLabel>Next Steps</SectionLabel>
            <h2 className="font-display text-2xl font-semibold mt-1">How to Proceed</h2>
          </motion.div>
          <motion.ol variants={stagger} className="space-y-3">
            {data.nextSteps.map((step, i) => (
              <motion.li
                key={i}
                variants={fade}
                className="flex gap-4 text-text-secondary"
              >
                <span className="font-mono text-xs text-accent w-5 shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </motion.li>
            ))}
          </motion.ol>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-4xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            Valid until {data.validUntil} · {COMPANY_NAME}
          </p>
          <a
            href={`mailto:${COMPANY_EMAIL}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {COMPANY_EMAIL}
          </a>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs text-accent uppercase tracking-widest">{children}</p>
  );
}

function Divider() {
  return <hr className="border-border" />;
}
