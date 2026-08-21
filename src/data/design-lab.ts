/**
 * Asset configuration and copy for the `/design-lab` prototype.
 *
 * Isolated sandbox route: nothing here is imported by the live site, and the
 * route is not linked from it. Per repo convention the component holds no
 * copy and no asset paths of its own — they live here.
 */

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
    logoAlt: "R²XTECH",
    headline: "Architecture, computed.",
    description:
      "We are a computational studio embedded in architecture, engineering, and construction. We build the parametric pipelines, model automations, and AI-driven systems.",
  },

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
  panels: {
    services: {
      id: "services",
      index: "01",
      kicker: "Services",
      title: "What we build",
      /* Spec §11.2. The per-service shape/icon treatment is an open item in
         §11.3 and is not designed yet, so these render as text only. */
      items: [
        {
          name: "Computational Design",
          body: "Parametric modeling and generative workflows that turn design intent into explorable, optimizable systems.",
        },
        {
          name: "Design Automation",
          body: "Custom tools and scripts that eliminate repetitive work across your studio's modeling, documentation, and delivery pipeline.",
        },
        {
          name: "AI-Driven Design Tools",
          body: "AI-assisted generation, analysis, and decision-making built directly into your design process, from massing studies to facade systems.",
        },
        {
          name: "Custom Software & Plugins",
          body: "Bespoke Grasshopper, Revit, and Rhino tooling built for your specific studio workflow, not off-the-shelf.",
        },
      ],
    },

    labs: {
      id: "labs",
      index: "02",
      kicker: "Playground",
      title: "Try it yourself",
    },

    /* Spec §11.7: present but intentionally blank. Kept in the scroll order
       so the rhythm of the page is the real one while the content is decided. */
    featured: {
      id: "featured",
      index: "03",
      kicker: "Featured work",
      title: "",
    },

    about: {
      id: "about",
      index: "04",
      kicker: "About",
      body: "R²XTECH was founded by two architects who met at IAAC in Barcelona, studying computational design. We saw an industry where automation and AI were still on the sidelines, and built a studio to put them at the center.",
    },

    closing: {
      id: "closing",
      index: "05",
      kicker: "Next",
      body: "We're already thinking in code. Let's think about your project next.",
      /* §11.9 specifies `/contact`, which does not exist yet; the mailto is
         what every other CTA on the site uses. Swap to the route when it
         exists. */
      cta: "Contact us →",
    },
  },
};

/** Public URL of a 1-based frame index: 1 -> `/geodesic-01/webp/frame-0001.webp`. */
export function framePath(index: number): string {
  const { dir, ext } = designLab.sequence;
  return `${dir}/frame-${String(index).padStart(4, "0")}.${ext}`;
}
