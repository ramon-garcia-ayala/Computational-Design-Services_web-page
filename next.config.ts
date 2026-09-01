import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
