/**
 * Asset configuration and copy for the Home page.
 *
 * The name is historical: this began as the `/design-lab` prototype route and
 * was promoted to `/`. Per repo convention the components hold no copy and no
 * asset paths of their own — they live here.
 *
 * Home is a sandwich: two cinema stretches around a document band.
 *
 *   CINE      hero sequence  ->  "the problem" panel
 *   DOCUMENT  proof strip · services · method · work · about
 *   CINE      playground panel  ->  closing panel
 *
 * The cine panels are 100svh stages that morph up over what precedes them.
 * The document band is ordinary flow, and that is the point: a panel is a
 * fixed viewport with its overflow hidden, so anything taller than the screen
 * is *clipped*, not scrolled. Services with deliverables, a four-step method
 * and three work cards do not fit that format — they used to be panels, and
 * the top of each one was silently cut off. Content that has to be read lives
 * in the band; content that has to land lives in a panel.
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

  /* Shown over the sequence from the first frame.
     Two lines and two buttons, where there used to be two lines and a
     three-sentence justified paragraph. The paragraph ran under the geodesic
     at every desktop width — the model occupies the middle of the plate and
     the copy column reached into it — and it repeated, at length, what the
     "problem" panel two screens later says better. What replaced it is the
     brand guide's own outcome line: `headline` is the positioning line, this
     is the one that speaks to a budget. */
  hero: {
    logoAlt: "R²χTECH",
    headline: "Architecture, computed.",
    outcome: "We automate AEC. You ship faster.",
    /* The hero had no call to action at all: four screen-heights of the most
       expensive real estate on the site, and nothing to click. */
    ctaPrimary: { label: "Start a project", href: "/contact" },
    ctaSecondary: { label: "See what we build", href: "#services" },
  },

  /* Deliberately unrelated to `data/stats.ts` and `data/awards.ts`: those hold
     the original mockup's placeholder figures and are still wired to
     `/archive-home`. These are the real ones, and reusing that shape would
     have tied the live page to numbers nobody has verified.

     They sit inside the document band now, not in the gap between the hero and
     the first panel. In that gap they were readable for about one gesture
     before the panel rose over them — proof that scrolls past unread is not
     proof. */
  stats: [
    { id: "founded", value: "2026", label: "Founded" },
    { id: "market", value: "US", label: "First market" },
    { id: "projects", value: "4+", label: "Projects delivered" },
    {
      id: "countries",
      value: "3",
      label: "Countries",
      /* Rendered under the label in the proof strip, not swapped in on hover —
         a hover-only reveal on a non-focusable stat had no keyboard
         equivalent. */
      detail: "Lebanon · Mexico · US",
    },
  ],

  /* `from`/`to` are 1-based frame numbers, matching how the spec and the
     filenames count. The component converts them to scroll progress, so the
     ranges stay readable against the spec rather than being pre-baked into
     fractions nobody can check. Statement 2 deliberately runs to the last
     frame: it is still on screen when the first panel rises over it.

     Both were atmosphere ("Complexity, computed." restated the headline one
     word over; "Design that scales itself." is a claim with no referent).
     They are the only words on screen for two full viewports, so they now say
     something a buyer can act on. Kept under 25 characters — `HeroOverlay`
     sets them `whitespace-nowrap` and the clamp floor is sized for that
     length at 375px. */
  statements: [
    { id: "hours", text: "Hours back, every week.", from: 20, to: 45, side: "right" },
    { id: "handover", text: "Tools your team keeps.", from: 60, to: 96, side: "left" },
  ],

  panels: {
    /* CINE. The manifesto that was stranded on `/archive-home`: the sharpest
       sentence written for this studio, and the live landing page never
       showed it. One panel, two blocks, nothing else — it is the turn from
       atmosphere to argument. */
    problem: {
      id: "problem",
      kicker: "The problem",
      lead: "AEC teams lose their best hours to work that software should be doing.",
      body: "We build the pipelines, automations and AI systems that take that work off your team — and hand them over documented, so they keep running without us.",
    },

    /* DOCUMENT. Four cards, motif first.

       **`body` is still here, and Home no longer renders it.** That is not an
       oversight: `/services` reads these same four items and merges them with
       `data/capabilities.ts` into one ten-card grid, where every card needs a
       sentence — deleting the field breaks that page, and giving that page its
       own copy would hand the site two answers to the same question.

       Home drops it because on Home it is the second of two registers saying
       the same thing: a sentence, and under it four deliverables saying it
       concretely. The sentence was also what forced the layout — a paragraph
       needs a prose measure, which is what turned four services into four
       full-width rows running to roughly three screens, with the figure that
       is supposed to say what each service does sitting at 120x60 underneath
       the words. */
    services: {
      id: "services",
      kicker: "Services",
      title: "What we build",
      /* `motif` picks the animated figure at the top of each card. They are
         behaviours, not decorations: the motion is meant to say what the
         service does, so a card keeps the one that matches it. */
      items: [
        {
          name: "Computational Design",
          motif: "network" as const,
          body: "Design logic encoded once, reused across every revision.",
          deliverables: [
            "Grasshopper and Dynamo, built for handover",
            "Rhino.Compute geometry services",
            "Option studies and browser configurators",
            "Fabrication and CNC-ready export",
          ],
        },
        {
          name: "Design Automation",
          motif: "pipeline" as const,
          body: "Model work that runs on its own, overnight and unattended.",
          deliverables: [
            "Revit and IFC tooling via API",
            "Automated model quality audits",
            "Parameter and classification management",
            "Drawing and schedule generation",
          ],
        },
        {
          name: "AI-Driven Design Tools",
          motif: "inference" as const,
          body: "AI where it earns its place: document-heavy, judgement-light, reviewed by a human.",
          deliverables: [
            "Document and drawing extraction",
            "Retrieval over standards and archives",
            "Takeoff, compliance and review agents",
            /* Was "Evaluation harnesses, so quality stays measurable" — the
               longest line in the set by eight characters, and in a 300px
               column that is what decides whether a card runs to three rows
               of text or four. */
            "Evaluation harnesses for measurable quality",
          ],
        },
        {
          name: "Custom Software & Plugins",
          motif: "assembly" as const,
          body: "Bespoke tooling, and the connective work that moves data between your systems.",
          deliverables: [
            "Custom connectors and ETL",
            "Project dashboards and reporting",
            "Common data environment integration",
            "Cost, programme and model data joined",
          ],
        },
      ],
    },

    /* DOCUMENT. The four steps from `data/approach.ts`, cut to one line each.
       The titles are duplicated from there rather than imported: `/about`
       needs the full paragraph and this needs a clause, and reading one from
       the other would mean rendering a paragraph here or shipping a stub
       there. If a step is renamed, both change. */
    method: {
      id: "method",
      kicker: "How we work",
      title: "Four steps, no surprises",
      steps: [
        {
          id: "map",
          number: "01",
          title: "Map the bottleneck",
          body: "We trace where the hours actually go before choosing any tool.",
        },
        {
          id: "prototype",
          number: "02",
          title: "Prototype in days",
          body: "A rough working version inside the first sprint. Arguing with something real is faster.",
        },
        {
          id: "build",
          number: "03",
          title: "Build for handover",
          body: "Documented, versioned, testable — so your team extends it without us.",
        },
        {
          id: "measure",
          number: "04",
          title: "Measure and iterate",
          body: "If a workflow is not measurably faster, it is not finished.",
        },
      ],
    },

    /* DOCUMENT. Was `featured` — three images with a caption, no result and
       no context, in a panel that clipped the top 40% of every one of them.

       These are research projects, not client engagements, and the page says
       so: every card carries its `context` and the line under it is a
       *finding*, never a business metric. `result` is quoted from the
       project's own write-up in `data/projects.ts` where one exists —
       inventing "saved 40% of hours" for an IAAC thesis would be a lie on a
       page whose entire job is to be believed. */
    work: {
      id: "work",
      kicker: "Selected work",
      title: "What it produced",
      items: [
        {
          id: "spatial-flow",
          src: "/projects/spatial-flow.gif",
          animated: true,
          title: "Spatial Flow",
          context: "IAAC · Barcelona",
          /* `projects.ts`, panel `outcome`, verbatim intent. */
          result:
            "Several defensible layouts, and the reasoning behind each — a comparison, not a verdict.",
          alt: "Generated industrial layouts cycling through machine, workstation and circulation arrangements as the agent searches for a better configuration.",
        },
        {
          id: "hyper-building-automation",
          src: "/projects/hyper-building-automation.jpg",
          animated: false,
          title: "Hyper Building Automation",
          /* This one is not in `projects.ts` — it is a loose file in
             `public/projects/`, so there is no write-up to quote and no
             verified context string. The line below is its existing caption,
             which describes what the pipeline does rather than what it
             showed. It needs a real finding in the studio's own words before
             this section is published. */
          context: "Studio pipeline",
          result:
            "An automated data workflow linking the structural and façade teams off one published model version.",
          alt: "An automated pipeline extracting and distributing data from published 3D model versions across structural and façade teams.",
        },
        {
          id: "la-cite-radieuse",
          src: "/projects/la-cite-radieuse-topology.png",
          animated: false,
          title: "La Cité Radieuse",
          context: "IAAC · Barcelona",
          /* `projects.ts`, panel `prediction`, verbatim intent. */
          result:
            "Where the models predict a room's function, the plan's logic is legible in its topology alone.",
          alt: "Floor plans of the Unité d'Habitation converted into spatial graphs, showing circulation and connectivity between apartments and rooms.",
        },
      ],
    },

    /* DOCUMENT. Moved out of the cine stretch: it is information, not
       spectacle, and it was the panel most likely to overflow its viewport. */
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

    /* CINE. Named `playground`, not `labs` — the chat widget this panel hosts
       has nothing to do with the separate `/labs` route (a placeholder page
       for future experiments). The two shared the `labs` key for a while,
       which is exactly what let `/labs`'s own copy drift into describing this
       panel's assistant as if it were the page's own content.

       It comes *after* the document band on purpose: "try it yourself" means
       something once the reader knows what "it" is. */
    playground: {
      id: "playground",
      kicker: "Playground",
      title: "Try it yourself",
      /* Transcoded from the supplied .mov: the source is HEVC, which Chrome
         and Firefox cannot decode at all, so the container was never the
         problem — the codec was. See scripts note in the panels README. */
      video: "/videos/panels/labs-loop.mp4",
    },

    /* CINE. */
    closing: {
      id: "closing",
      kicker: "Next",
      video: "/videos/panels/closing-loop.mp4",
      body: "We're already thinking in code. Let's think about your project next.",
      /* A second, lower-friction way in beside the primary CTA. Someone not
         ready to write an email will still open a page. */
      secondary: { label: "See the work", href: "/projects" },
    },
  },
};

/** Public URL of a 1-based frame index: 1 -> `/geodesic-01/webp/frame-0001.webp`. */
export function framePath(index: number): string {
  const { dir, ext } = designLab.sequence;
  return `${dir}/frame-${String(index).padStart(4, "0")}.${ext}`;
}
