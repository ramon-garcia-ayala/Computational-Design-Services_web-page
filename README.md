# R²ch-Tech

Site for the computational automation studio for AEC, plus the client proposal
system it hosts.

> **Phase 1.** Structure, layout, motion and sample content. The conversational
> chatbot in the hero is Phase 2 — only its space is reserved here.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (runs the TypeScript check too)
npm run lint     # ESLint
npm run start    # serves the production build
```

There are no tests. TypeScript errors surface on `npm run build`.

## Stack

| Piece | Version | What for |
|---|---|---|
| Next.js | 16.2.9 | App Router, everything static |
| React | 19.2.4 | |
| Tailwind CSS | v4 | tokens in `@theme`, no `tailwind.config.ts` |
| GSAP + ScrollTrigger | 3.15 | scroll animation |
| `@gsap/react` | 2.1 | `useGSAP`, automatic cleanup |
| Lenis | 1.3 | smooth scroll |
| React Three Fiber + three | 9.7 / 0.185 | decorative hero layer, lazy loaded |

On the Next version: the brief asked for Next 14, but Node 25 on this machine
returns `EISDIR` from `fs.readlink` on regular files and Next 15.5 doesn't handle
it, so the build failed before it started. Next 16 tolerates it. Tailwind v4,
GSAP, Lenis and R3F behave identically on either.

## Where the content lives

No component carries copy or figures inside it. Everything lives in `src/data/`:

| File | Contents |
|---|---|
| `site.ts` | name, tagline, subcopy, **contact recipients**, socials |
| `nav.ts` | menu and Labs links |
| `stats.ts` | the five home metrics |
| `projects.ts` | projects, and the horizontal-scroll panels of each one |
| `clients.ts` | client logos |
| `approach.ts` | home manifesto and method steps |
| `expertise.ts` | expertise areas (accordion / tabs) |
| `awards.ts` | recognitions and studio metrics |
| `proposals/` | client proposals — see below |

## Client proposals

Each proposal is its own shareable page at the site root, e.g.
`/05.08.2026_ecogen` (`DD.MM.YYYY_client`). They use the site's design system but
not its navigation, and they are password protected.

**To write one**, add a file to `src/data/proposals/` and register it in
`index.ts`. A proposal is a list of typed blocks — prose, steps, flow diagram,
split, cards, questions, table, stats, timeline, note — rendered by
`ProposalRenderer`. All copy stays in the data layer.

**To set its password:**

```bash
node scripts/proposal-password.mjs "the-password" 05.08.2026_ecogen
```

Paste the output into `src/data/proposals/access.ts`. Only a salt and a SHA-256
hash are stored, never the password itself — keep it wherever you keep passwords
and share it with the client through another channel. A slug with no entry in
that file is **open**: anyone with the link can read it.

The check runs in `src/proxy.ts`, before the page is served. Checking on the
client would protect nothing, since these pages are static and their HTML already
carries the whole document.

**Production needs `PROPOSAL_SECRET`** (see `.env.example`), the key the access
cookie is signed with. Without it, protected proposals stay closed to everyone —
it fails safe.

## Contact

Every mailto on the site goes to both partners at once, and the address is never
rendered as visible text — CTAs read "Get in touch". Clicking still opens a
prefilled mail client, and the addresses aren't sitting in the page for spam
harvesters. Edit `contactRecipients` in `src/data/site.ts`.

## Known placeholders

- The figures in `stats.ts` and `awards.ts` are samples.
- Logos in `clients.ts` render as a grey block until the `logo` field points at
  an SVG in `/public`.
- The newsletter form in the menu is UI only, with no backend.
- The music button's audio track is disabled (`AUDIO_SRC = null` in
  `src/components/layout/MusicToggle.tsx`).

## Documentation

`CLAUDE.md` holds the project conventions: design tokens, the animation pattern,
how to add a project or a proposal, and how `prefers-reduced-motion` is honoured.
