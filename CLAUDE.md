# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (also runs TypeScript check)
npm run lint     # ESLint
npm run start    # Serve production build
```

There are no tests. TypeScript errors surface during `npm run build`.

## Stack

- **Next.js 16.2.9** — App Router, TypeScript, static generation (all pages are `○ Static`)
- **React 19**
- **Tailwind CSS v4** — CSS-based config only; there is no `tailwind.config.ts`
- **Framer Motion v12** — scroll-triggered animations, stagger children
- **Lucide React v1.21** — this version does **not** export `Github` or `Linkedin`; use `src/components/ui/BrandIcons.tsx` for those instead
- **clsx + tailwind-merge** — via `cn()` in `src/lib/utils.ts`

## Tailwind v4 — Critical Difference

All design tokens live in the `@theme {}` block in `src/app/globals.css`, not in a config file. Custom colors are consumed as Tailwind utilities directly:

```css
/* globals.css */
@import "tailwindcss";
@theme {
  --color-accent: #6366f1;
  --font-display: var(--font-space-grotesk);
  /* etc. */
}
```

Use them as `bg-accent`, `text-accent`, `font-display`, etc. — no `theme()` function or `extend` needed.

## Architecture

Single-page marketing site. All sections live on one page assembled in `src/app/page.tsx`. Navigation uses anchor links (`#services`, `#how-we-work`, `#pricing`, `#phases`, `#contact`).

**Data layer** (`src/data/`) holds all copy — never hardcode text in components:
- `services.ts` — 11 services; `icon` field is a Lucide icon name string resolved in `ServiceCard.tsx` via `iconMap`
- `phases.ts` — 3 project phases; `highlight: true` triggers accent border + "Start Here" badge in `PhaseCard.tsx`
- `content.ts` — nav links, process steps, pricing principles, footer links, company constants

**Adding a new Lucide icon to a service**: add the icon name string to `services.ts` and import + register it in the `iconMap` object in `src/components/ui/ServiceCard.tsx`.

**Pricing principles** use the same icon-name-as-string pattern but resolve in `src/components/sections/PricingSection.tsx` inline — there is no shared icon map for that section.

## Animation Conventions

- Section entrance: `useInView(ref, { once: true, margin: "-80px" })` + `motion.div` animating `opacity 0→1, y 24→0`
- Stagger children: parent `motion.div` with `variants` containing `staggerChildren`, children use `cardVariants` from `ServiceCard.tsx` or inline `itemVariants`
- Always type `Variants` explicitly from `framer-motion` when using `ease: "easeOut"` to avoid TypeScript errors

## Hero Background

`src/components/ui/ParticleCanvas.tsx` — canvas-based particle network with mouse repel and click-to-burst isovist rays. Color is hardcoded to indigo (`99,102,241`) to match `--color-accent`. Rendered behind all content with `pointer-events: none`.

## Contact Form

`src/components/sections/ContactSection.tsx` uses Formspree when `NEXT_PUBLIC_FORMSPREE_ID` is set; falls back to a `mailto:` redirect if the env var is absent. Set the variable in `.env.local` locally and in Vercel project settings for production.

## Fonts

Loaded via `next/font/google` in `layout.tsx` and exposed as CSS variables:
- `--font-space-grotesk` → `font-display` utility (headings)
- `--font-inter` → `font-sans` utility (body)
- `--font-geist-mono` → `font-mono` utility (step numbers, code)

## GIF Recording (verificacion visual)

Para grabar un GIF de la aplicacion en el navegador y verificar cambios visuales:

1. Asegurarse de que el servidor de desarrollo esta corriendo (`npm run dev`).
2. Usar la herramienta `mcp__claude-in-chrome__gif_creator` (primero cargar el schema con `ToolSearch select:mcp__claude-in-chrome__gif_creator`).
3. Capturar frames extras antes y despues de cada accion para que la reproduccion sea fluida.
4. Nombrar el archivo de forma descriptiva, por ejemplo `hero_animation.gif` o `contact_form_flow.gif`.

**Flujo tipico:**
```
ToolSearch → gif_creator schema
tabs_context_mcp → obtener tab activo o crear uno nuevo
navigate → ir a localhost:3000
gif_creator → iniciar grabacion
<interacciones: scroll, clicks, hover>
gif_creator → detener y guardar
```

Los GIFs se usan para confirmar que animaciones, transiciones y flujos de UI funcionan correctamente antes de reportar la tarea como completada.

## Client Proposal Pages

Individual client proposals are served as static pages at `/<slug>` (e.g. `/29.06.2026_ecogen`).
They live in a separate route group `(proposals)` with their own layout (no site Navbar/Footer).

**To create a new proposal:** see `src/data/proposals/CLAUDE.md` for the full spec — slug format, all data fields, available diagram components, copy rules, and file locations.

The short version:
1. **Always ask the user for `headerStages`** before writing any code (see CLAUDE.md step 0).
2. Create `src/data/proposals/DD.MM.YYYY_clientname.ts` using `ProposalData` type
3. Register it in `src/data/proposals/index.ts`
4. Run `npm run build` to verify the route generates correctly

### Proposal-specific components (`src/components/proposal/`)

| Component | Triggered by | Purpose |
|---|---|---|
| `HeaderPipeline` | `data.headerStages` | Animated SVG hero with looping pipeline stages (3–5 steps, unique per proposal). Takes priority over `headerImage`. |
| `WorkflowDiagram` | `data.workflow` | Mid-page horizontal "How it Works" pipeline cards. |
| `TechStack` | `data.techStack` | Badge grid: Primary / Alternative stacks. |
| `GanttChart` | any phase with `startWeek`/`endWeek` | Phase timeline bar chart. |
| `PricingComparison` | `data.pricingModels` | 3-column pricing comparison (replaces standard Investment section). Use when presenting multiple engagement models. |

### `headerStages` — key rules

- Each proposal defines its **own** stages — never copy from another proposal.
- **3 to 5 stages** is the sweet spot (max 6).
- Available `kind` values: `"plan2d"` `"plugin"` `"bim3d"` `"metadata"` `"cost"` `"schedule"` — pick by visual concept, not tool name.
- `role` drives the color: `"input"` = blue, `"process"` = indigo, `"output"` = emerald.
- Full spec in `src/data/proposals/CLAUDE.md` → "Header diagram" section.
