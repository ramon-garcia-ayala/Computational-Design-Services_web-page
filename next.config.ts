import type { NextConfig } from "next";

/* Hosts allowed to pull `/_next/*` dev resources.
 *
 * `next dev` blocks these for any origin but localhost, and the block is
 * silent where it matters: the page still returns 200 and the HTML still
 * renders, but `/_next/webpack-hmr` is refused, the dev runtime never
 * finishes hydrating, and every client effect on the page simply never runs.
 * On Home that reads as a *black screen* — `Preloader` is server-rendered as
 * a full-viewport carbon plate and only its own effect ever takes it away —
 * and on the portal as a page with its chrome but no content, since `Reveal`
 * holds everything at `opacity: 0` until GSAP settles it. Both look like
 * rendering faults and are neither; the only clue is a warning in the dev
 * server's own log.
 *
 * That is what opening the site on a phone over the LAN costs, which is the
 * one way this project's mobile layout can actually be checked. Set
 * `DEV_ORIGINS` to a comma-separated list of hosts (see `.env.example`); the
 * fallback covers the three private IPv4 ranges so the common case needs no
 * configuration at all. Dev-only — `next build` ignores it entirely. */
const devOrigins = (process.env.DEV_ORIGINS ?? "192.168.*.*,10.*.*.*,172.16.*.*,100.*.*.*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: devOrigins,
  /* Without this, `private/portal/**` never reaches the deployed function's
     bundle — Vercel traces each route's file dependencies from its imports,
     and a plain `fs.readFile` at request time is invisible to that trace.
     The route works in `next dev` (it reads straight off disk) and then 404s
     in production, which is the kind of gap that only shows up after
     deploy. */
  outputFileTracingIncludes: {
    "/api/portal/file/[...path]": ["./private/portal/**/*"],
  },
};

export default nextConfig;
