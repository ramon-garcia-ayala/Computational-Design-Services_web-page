import { NextResponse, type NextRequest } from "next/server";
import { proposalAccess } from "@/data/proposals/access";
import { cookieName, getSecret, verifyToken } from "@/lib/proposal-auth";
import {
  PORTAL_SESSION_COOKIE,
  PORTAL_SLUG_COOKIE,
  getPortalSecret,
  verifySessionToken,
} from "@/lib/portal-auth";

/**
 * Gatekeeper for client proposals and the client portal. (In Next 16 this is
 * `proxy`, the replacement for `middleware`.)
 *
 * It runs BEFORE the page is served, which is the only way either check means
 * anything: both are SSG/dynamic pages whose response would otherwise already
 * carry the content. It also covers RSC requests for the same route, since
 * they share a pathname.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /* The portal branch. `/portal` (the login) and `/portal/enter` (the magic
     link redemption) are unauthenticated on purpose — they are how a session
     gets created in the first place. Everything else under `/portal/*`
     requires a verified session. */
  if (pathname === "/portal" || pathname.startsWith("/portal/enter")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/portal")) {
    const secret = getPortalSecret();
    const slug = request.cookies.get(PORTAL_SLUG_COOKIE)?.value;
    const token = request.cookies.get(PORTAL_SESSION_COOKIE)?.value;

    if (secret && slug && (await verifySessionToken(token, slug, secret))) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/portal", request.url));
  }

  const slug = decodeURIComponent(pathname.slice(1));
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
