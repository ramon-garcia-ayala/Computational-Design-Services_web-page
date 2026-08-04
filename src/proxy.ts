import { NextResponse, type NextRequest } from "next/server";
import { proposalAccess } from "@/data/proposals/access";
import { cookieName, getSecret, verifyToken } from "@/lib/proposal-auth";

/**
 * Gatekeeper for client proposals. (In Next 16 this is `proxy`, the
 * replacement for `middleware`.)
 *
 * It runs BEFORE the page is served, which is the only way the password means
 * anything: proposals are SSG and their HTML already contains all the content.
 * It also covers RSC requests for the same route, since they share a pathname.
 */
export async function proxy(request: NextRequest) {
  const slug = decodeURIComponent(request.nextUrl.pathname.slice(1));
  const credentials = proposalAccess[slug];

  /* Any other route on the site, and proposals with no password configured,
     pass straight through. */
  if (!credentials) return NextResponse.next();

  const secret = getSecret();
  const token = request.cookies.get(cookieName(slug))?.value;

  if (secret && (await verifyToken(token, slug, secret))) {
    return NextResponse.next();
  }

  const unlock = new URL("/unlock", request.url);
  unlock.searchParams.set("to", slug);
  if (!secret) unlock.searchParams.set("error", "config");

  return NextResponse.redirect(unlock);
}

export const config = {
  /* Deliberately broad: proposal slugs contain dots (05.08.2026_ecogen), so
     the usual exclusion of paths with an extension would leave them outside
     access control. The real filter is the lookup above, which discards
     everything else in a single comparison. */
  matcher: ["/((?!_next/|api/).*)"],
};
