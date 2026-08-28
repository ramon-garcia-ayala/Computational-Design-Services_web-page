/**
 * Asset configuration and copy for the `/design-lab` prototype.
 *
 * Isolated sandbox route: nothing here is imported by the live site, and the
 * route is not linked from it. Per repo convention the component holds no
 * copy and no asset paths of its own — they live here.
 */

import { founders } from "./founders";

export const designLab = {
  meta: {
    title: "Design Lab",
    description:
      "Prototype of the scroll-driven visual identity. Isolated test route, not linked from the live site.",
  },

  /** The geodesic clip, exported to stills for frame-by-frame scrubbing. */
  sequence: {
    /* WebP, not the source PNGs. Scrubbing needs every frame decoded and
       resident before the first scroll, and the PNG set is 191 MB against
       9.4 MB here — the same 96 frames at ~101 KB each. The PNGs are still in
       `frames/`, so pointing `dir` and `ext` back at them reverts this. */
    dir: "/geodesic-01/webp",
    ext: "webp",
    /** Frames are 1-based and 4-digit zero-padded: frame-0001 … frame-0096 */
    count: 96,
    /** Source pixel dimensions, used as the canvas backing store. */
    width: 1664,
    height: 1248,
  },

  /* The logo as a CSS mask (spec §12.2). Shared with the preloader, which
     built it: `scripts/logo-mask.mjs` from `public/logo/logo.png`. It is a
     mask rather than an `<img>` because the source ink is near-black, which
     works on the greige hero and disappears on the dark panels and footer —
     a mask takes the colour of wherever it is used. Ratio is the source
     asset's own 3103x611. */
  mask: {
    src: "/logo/logo-mask.png",
    width: 3103,
    height: 611,
  },

  /* Spec §11.3 / §11.1. Shown over the sequence from the first frame. */
  hero: {
    logoAlt: "R²χTECH",
    headline: "Architecture, computed.",
    description:
      "We are a computational studio embedded in architecture, engineering, and construction. We build the parametric pipelines, model automations, and AI-driven systems.",
  },

  /* The bar in the transition between the hero and the first panel.
     Deliberately unrelated to `data/stats.ts` and `data/awards.ts`: those hold
     the original mockup's placeholder figures and are still wired to
     `/archive-home`. These are the real ones, and reusing that shape would
     have tied the live page to numbers nobody has verified. */
  stats: [
    { id: "founded", value: "2026", label: "Founded" },
    { id: "market", value: "US", label: "First market" },
    { id: "projects", value: "4+", label: "Projects delivered" },
    {
      id: "countries",
      value: "3",
      label: "Countries",
      /* Revealed on hover in place of the label. Kept in the DOM either way,
         so assistive tech gets the names without needing the pointer. */
      detail: "Lebanon · Mexico · US",
    },
  ],

  /* Spec §11.1. `from`/`to` are 1-based frame numbers, matching how the spec
     and the filenames count. The component converts them to scroll progress,
     so the ranges stay readable against the spec rather than being pre-baked
     into fractions nobody can check. Statement 2 deliberately runs to the
     last frame: it is still on screen when the first panel rises over it. */
  statements: [
    { id: "complexity", text: "Complexity, computed.", from: 20, to: 45, side: "right" },
    { id: "scales", text: "Design that scales itself.", from: 60, to: 96, side: "left" },
  ],

  /* Spec §11.5–11.9, in scroll order. `kind` picks the body component; the
     copy for each lives with it here. */
  /* No panel carries an index number any more (§13.1): the eyebrow is the
     category alone. */
  panels: {
    services: {
      id: "services",
      kicker: "Services",
      title: "What we build",
      /* `motif` picks the animated figure above each card (§13.2). They are
         behaviours, not decorations: the motion is meant to say what the
         service does, so a card keeps the one that matches it. */
      items: [
        {
          name: "Computational Design",
          motif: "network" as const,
          body: "Parametric modeling and generative workflows that turn design intent into explorable, optimizable systems.",
        },
        {
          name: "Design Automation",
          motif: "pipeline" as const,
          body: "Custom tools and scripts that eliminate repetitive work across your studio's modeling, documentation, and delivery pipeline.",
        },
        {
          name: "AI-Driven Design Tools",
          motif: "inference" as const,
          body: "AI-assisted generation, analysis, and decision-making built directly into your design process, from massing studies to facade systems.",
        },
        {
          name: "Custom Software & Plugins",
          motif: "assembly" as const,
          body: "Bespoke Grasshopper, Revit, and Rhino tooling built for your specific studio workflow, not off-the-shelf.",
        },
      ],
    },

    labs: {
      id: "labs",
      kicker: "Playground",
      title: "Try it yourself",
      /* Transcoded from the supplied .mov: the source is HEVC, which Chrome
         and Firefox cannot decode at all, so the container was never the
         problem — the codec was. See scripts note in the panels README. */
      video: "/videos/panels/labs-loop.mp4",
    },

    /* Spec §11.7: present but intentionally blank. Kept in the scroll order
       so the rhythm of the page is the real one while the content is decided. */
    featured: {
      id: "featured",
      kicker: "Featured work",
      title: "",
      /* A showcase strip, deliberately not the `/projects` system: no routes,
         no detail pages, no entries in `data/projects.ts`. Three images and a
         line each, nothing clickable.

         `animated` marks the one that must bypass Next's image optimiser —
         it re-encodes a GIF to a still by default, which would silently drop
         all 99 frames and leave a frozen first frame that still looks like a
         working image. */
      items: [
        {
          id: "spatial-flow",
          src: "/projects/spatial-flow.gif",
          animated: true,
          title: "Spatial Flow",
          caption: "AI-driven layout optimization for industrial environments.",
          alt: "Generated industrial layouts cycling through machine, workstation and circulation arrangements as the agent searches for a better configuration.",
        },
        {
          id: "hyper-building-automation",
          src: "/projects/hyper-building-automation.jpg",
          animated: false,
          title: "Hyper Building Automation",
          caption: "Automated data workflow linking structural and façade teams.",
          alt: "An automated pipeline extracting and distributing data from published 3D model versions across structural and façade teams.",
        },
        {
          id: "la-cite-radieuse",
          src: "/projects/la-cite-radieuse-topology.png",
          animated: false,
          title: "La Cité Radieuse — Topology",
          caption: "Spatial-graph analysis of circulation and connectivity.",
          alt: "Floor plans of the Unité d'Habitation converted into spatial graphs, showing circulation and connectivity between apartments and rooms.",
        },
      ],
    },

    about: {
      id: "about",
      kicker: "About",
      /* The brand name is split out of the sentence only so the superscript
         can be set properly; it reads as plain body copy otherwise. */
      lead: "R²χTECH",
      body: " was founded by two architects who met at IAAC in Barcelona, studying computational design. We saw an industry where automation and AI were still on the sidelines, and built a studio to put them at the center.",
      /* The same two people as `/about`, read from one place. Two copies
         would drift the moment a title changed on one page and not the other. */
      founders,
    },

    closing: {
      id: "closing",
      kicker: "Next",
      /* §13.6, same arrangement as the Labs loop. */
      video: "/videos/panels/closing-loop.mp4",
      body: "We're already thinking in code. Let's think about your project next.",
    },
  },
};

/** Public URL of a 1-based frame index: 1 -> `/geodesic-01/webp/frame-0001.webp`. */
export function framePath(index: number): string {
  const { dir, ext } = designLab.sequence;
  return `${dir}/frame-${String(index).padStart(4, "0")}.${ext}`;
}
