"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type MotifKind =
  | "network"
  | "pipeline"
  | "inference"
  | "assembly"
  /* The secondary capabilities, added when they merged into the same grid as
     the four above. Same rule: each is a *behaviour*, so ten cards still read
     as one set rather than ten illustrations. */
  | "learning"
  | "model"
  | "dashboard"
  | "fabrication"
  | "cloud"
  | "training";

/**
 * Seeded PRNG (mulberry32), inlined on purpose.
 *
 * `src/minitools/lib/random.ts` has the same thing, but that module is
 * self-contained by design — nothing outside it imports from it, so it stays
 * liftable into a package. Six numbers are not worth breaking that boundary.
 *
 * Seeded rather than `Math.random()` because an unseeded figure is a
 * different figure on every render: it would flicker on any re-render and
 * could never be matched to a screenshot.
 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A small animated node figure above each service card (spec §13.2).
 *
 * Same visual family as the hero's geodesic field — points joined by hairlines,
 * light travelling between them — reduced to something that reads at 120px and
 * does not compete with the copy next to it. Each service gets a different
 * *behaviour* rather than a different palette, so four cards still look like
 * one set: `network` connects and reconnects, `pipeline` passes a pulse left to
 * right, `inference` converges on a decision, `assembly` snaps parts into place.
 *
 * **Positions come from `lib/random.ts`, seeded per motif, never `Math.random()`.**
 * Same rule as the mini tools: an unseeded figure is a different figure on every
 * render, so it would flicker on any re-render and could never be reproduced
 * from a screenshot. The seed is derived from the kind, so a given service
 * always draws the same constellation.
 *
 * SVG rather than canvas: four of these are on screen at once, they are tiny,
 * and GSAP can drive SVG attributes directly — a canvas each would mean four
 * more render loops for no visual gain.
 */
export function ServiceMotif({ kind }: { kind: MotifKind }) {
  const rootRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();

  const { nodes, links } = layoutFor(kind);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) return;

      const dots = root.querySelectorAll("[data-node]");
      const lines = root.querySelectorAll("[data-link]");

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });

      switch (kind) {
        case "network":
          // Connections forming and dissolving.
          tl.fromTo(
            lines,
            { opacity: 0.15 },
            { opacity: 0.9, duration: 1.1, stagger: { each: 0.12, from: "random" } },
          ).to(lines, { opacity: 0.15, duration: 1.1, stagger: { each: 0.1, from: "random" } });
          break;

        case "pipeline":
          // A pulse travelling along the chain, left to right.
          tl.fromTo(
            dots,
            { opacity: 0.25, scale: 0.8 },
            {
              opacity: 1,
              scale: 1.35,
              duration: 0.42,
              stagger: 0.16,
              transformOrigin: "center",
            },
          ).to(dots, { opacity: 0.25, scale: 0.8, duration: 0.42, stagger: 0.16 }, 0.3);
          break;

        case "inference":
          // Many inputs resolving onto one point.
          tl.fromTo(
            lines,
            { opacity: 0.1 },
            { opacity: 0.85, duration: 0.9, stagger: { each: 0.08, from: "edges" } },
          )
            .to("[data-hub]", { opacity: 1, scale: 1.6, duration: 0.5, transformOrigin: "center" }, "-=0.3")
            .to("[data-hub]", { scale: 1, duration: 0.6 })
            .to(lines, { opacity: 0.1, duration: 0.7 }, "-=0.4");
          break;

        case "learning":
          // Weights settling: links firm up, then the whole net holds.
          tl.fromTo(
            lines,
            { opacity: 0.12 },
            { opacity: 0.8, duration: 1.3, stagger: { each: 0.05, from: "random" } },
          )
            .to(dots, { opacity: 1, duration: 0.4 }, "-=0.5")
            .to(lines, { opacity: 0.35, duration: 0.9 })
            .to(dots, { opacity: 0.5, duration: 0.6 }, "-=0.7");
          break;

        case "model":
          // Storeys resolving from the ground up.
          tl.fromTo(
            dots,
            { opacity: 0.2, y: 6 },
            { opacity: 1, y: 0, duration: 0.55, stagger: { each: 0.13, from: "end" } },
          )
            .to(lines, { opacity: 0.85, duration: 0.5 }, "-=0.5")
            .to({}, { duration: 0.6 })
            .to([dots, lines], { opacity: 0.22, duration: 0.7 });
          break;

        case "dashboard":
          // A reading that keeps updating.
          tl.fromTo(
            dots,
            { opacity: 0.25, scale: 0.85 },
            { opacity: 1, scale: 1.2, duration: 0.5, stagger: 0.11, transformOrigin: "center" },
          )
            .to(lines, { opacity: 0.9, duration: 0.45 }, "-=0.6")
            .to(dots, { opacity: 0.35, scale: 0.9, duration: 0.55, stagger: 0.09 })
            .to(lines, { opacity: 0.15, duration: 0.5 }, "-=0.5");
          break;

        case "fabrication":
          // Material laid down in passes.
          tl.fromTo(
            lines,
            { opacity: 0.1 },
            { opacity: 0.95, duration: 0.4, stagger: { each: 0.18, from: "start" } },
          )
            .to({}, { duration: 0.5 })
            .to(lines, { opacity: 0.18, duration: 0.6 })
            .to(dots, { opacity: 0.8, duration: 0.4 }, "-=0.6")
            .to(dots, { opacity: 0.4, duration: 0.5 });
          break;

        case "cloud":
          // One centre, many seats checking in.
          tl.fromTo(
            lines,
            { opacity: 0.12 },
            { opacity: 0.85, duration: 0.5, stagger: { each: 0.14, from: "center" } },
          )
            .to(dots, { opacity: 1, duration: 0.4 }, "-=0.5")
            .to(lines, { opacity: 0.12, duration: 0.6, stagger: { each: 0.1, from: "center" } })
            .to(dots, { opacity: 0.45, duration: 0.5 }, "-=0.5");
          break;

        case "training":
          // A definition passed from one side to the other.
          tl.fromTo(
            dots,
            { opacity: 0.3 },
            { opacity: 1, duration: 0.45, stagger: { each: 0.12, from: "start" } },
          )
            .to(lines, { opacity: 0.9, duration: 0.5 }, "-=0.4")
            .to({}, { duration: 0.5 })
            .to([dots, lines], { opacity: 0.25, duration: 0.7 });
          break;

        case "assembly":
          // Parts arriving into position.
          tl.fromTo(
            dots,
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.5, stagger: { each: 0.1, from: "start" } },
          )
            .to(lines, { opacity: 0.9, duration: 0.5 }, "-=0.4")
            .to({}, { duration: 0.7 })
            .to(lines, { opacity: 0.12, duration: 0.4 })
            .to(dots, { opacity: 0.2, duration: 0.4 }, "-=0.3");
          break;
      }

      return () => {
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [kind, reducedMotion] },
  );

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 120 60"
      aria-hidden="true"
      className="h-[60px] w-[120px] overflow-visible"
    >
      {links.map(([a, b], i) => (
        <line
          key={`l${i}`}
          data-link
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="currentColor"
          strokeWidth="0.6"
          /* Reduced motion never runs the timeline, so the rest state has to
             be the legible one rather than the near-invisible start state. */
          opacity={reducedMotion ? 0.55 : 0.15}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={`n${i}`}
          data-node
          {...(kind === "inference" && i === nodes.length - 1 ? { "data-hub": true } : {})}
          cx={x}
          cy={y}
          r={kind === "inference" && i === nodes.length - 1 ? 2.2 : 1.5}
          fill="var(--color-accent)"
          opacity={reducedMotion ? 0.9 : 0.55}
        />
      ))}
    </svg>
  );
}

/** Deterministic node/link layout per motif. */
function layoutFor(kind: MotifKind): {
  nodes: [number, number][];
  links: [number, number][];
} {
  const random = rng(seedOf(kind));
  const nodes: [number, number][] = [];
  const links: [number, number][] = [];

  switch (kind) {
    case "network": {
      for (let i = 0; i < 9; i++) {
        nodes.push([8 + random() * 104, 8 + random() * 44]);
      }
      // Join each node to its two nearest, which is what gives the mesh its
      // even weave instead of a few long crossing spans.
      nodes.forEach((from, i) => {
        const near = nodes
          .map((to, j) => ({ j, d: Math.hypot(to[0] - from[0], to[1] - from[1]) }))
          .filter((n) => n.j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        near.forEach((n) => {
          if (!links.some(([a, b]) => (a === n.j && b === i) || (a === i && b === n.j))) {
            links.push([i, n.j]);
          }
        });
      });
      break;
    }

    case "pipeline": {
      for (let i = 0; i < 6; i++) {
        nodes.push([10 + i * 20, 30 + (random() - 0.5) * 16]);
        if (i > 0) links.push([i - 1, i]);
      }
      break;
    }

    case "inference": {
      for (let i = 0; i < 7; i++) {
        nodes.push([8 + random() * 46, 6 + random() * 48]);
      }
      nodes.push([100, 30]); // the hub, always last
      const hub = nodes.length - 1;
      for (let i = 0; i < hub; i++) links.push([i, hub]);
      break;
    }

    case "learning": {
      // Three layers, every node joined to the next layer: a small net.
      const layers = [3, 4, 3];
      const cols = layers.map((_, i) => 14 + i * 46);
      const idx: number[][] = [];
      layers.forEach((count, c) => {
        const here: number[] = [];
        for (let i = 0; i < count; i++) {
          here.push(nodes.length);
          nodes.push([cols[c], (60 / (count + 1)) * (i + 1)]);
        }
        idx.push(here);
      });
      for (let c = 0; c < idx.length - 1; c++)
        for (const a of idx[c]) for (const b of idx[c + 1]) links.push([a, b]);
      break;
    }

    case "model": {
      // Stacked plates, seen square on.
      for (let row = 0; row < 4; row++) {
        const y = 48 - row * 12;
        const half = 30 - row * 3;
        const left = nodes.length;
        nodes.push([60 - half, y], [60 + half, y]);
        links.push([left, left + 1]);
        if (row > 0) links.push([left - 2, left], [left - 1, left + 1]);
      }
      break;
    }

    case "dashboard": {
      // A plotted series over its own baseline.
      const vals = [40, 26, 33, 18, 24, 10];
      vals.forEach((y, i) => {
        nodes.push([12 + i * 19, y]);
        if (i > 0) links.push([i - 1, i]);
      });
      break;
    }

    case "fabrication": {
      // Passes of deposited material, alternating direction.
      for (let row = 0; row < 5; row++) {
        const y = 14 + row * 8;
        const a = nodes.length;
        nodes.push([16, y], [104, y]);
        links.push([a, a + 1]);
      }
      break;
    }

    case "cloud": {
      // A hub with clients around it.
      nodes.push([60, 30]);
      const ring = 6;
      for (let i = 0; i < ring; i++) {
        const angle = (Math.PI * 2 * i) / ring - Math.PI / 2;
        nodes.push([60 + Math.cos(angle) * 42, 30 + Math.sin(angle) * 22]);
        links.push([0, i + 1]);
      }
      break;
    }

    case "training": {
      // Two definitions side by side, joined across.
      for (const baseX of [10, 66]) {
        const start = nodes.length;
        for (let i = 0; i < 4; i++) nodes.push([baseX + (i % 2) * 30, 16 + Math.floor(i / 2) * 26]);
        links.push([start, start + 1], [start + 2, start + 3], [start, start + 2], [start + 1, start + 3]);
      }
      links.push([1, 4]);
      break;
    }

    case "assembly": {
      // A loose grid: parts that belong in slots.
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          nodes.push([20 + col * 27, 20 + row * 22]);
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        if (i % 4 !== 3) links.push([i, i + 1]);
        if (i < 4) links.push([i, i + 4]);
      }
      break;
    }
  }

  return { nodes, links };
}

function seedOf(kind: MotifKind): number {
  let seed = 0;
  for (let i = 0; i < kind.length; i++) seed = (seed * 31 + kind.charCodeAt(i)) >>> 0;
  return seed;
}
