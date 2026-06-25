"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ParticleCanvas } from "@/components/ui/ParticleCanvas";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Particle network — mouse-reactive, blue/indigo on dark bg */}
      <ParticleCanvas />
      {/* Radial fade overlay — keeps edges dark and text readable */}
      <div className="absolute inset-0 bg-radial-[ellipse_80%_60%_at_50%_0%] from-transparent to-background pointer-events-none" />
      {/* Bottom fade so scroll indicator is clear */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      {/* Accent glow blobs */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center"
      >
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-accent mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Computational Design Services
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display text-5xl font-bold tracking-tight text-text-primary md:text-6xl lg:text-7xl xl:text-8xl"
        >
          Computational Design{" "}
          <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
            at your scale.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary md:text-xl"
        >
          We transform workflows in architecture, engineering, and construction through
          automation, artificial intelligence, and custom digital tools.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
          >
            Explore Services
            <ArrowRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            Get in Touch
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown size={20} className="text-text-muted animate-bounce" />
      </motion.div>
    </section>
  );
}
