import { NextResponse, type NextRequest } from "next/server";
import {
  PORTAL_SESSION_COOKIE,
  PORTAL_SLUG_COOKIE,
  SESSION_MAX_AGE,
  getPortalSecret,
  signSessionToken,
  verifyMagicToken,
} from "@/lib/portal-auth";
import { getPortalClient } from "@/data/portal";

/**
 * Redeems a magic link: verifies the token, issues the session cookies, and
 * redirects into the dashboard.
 *
 * A GET route rather than a page, so the link in the email can be a plain
 * `<a href>` with no client-side JavaScript involved. It always issues a real
 * redirect (never a client navigation) for the same reason `UnlockForm`
 * forces `window.location.assign`: the cookie has to exist before the proxy
 * evaluates the next request, and a redirect response is a fresh request.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? undefined;
  const slug = request.nextUrl.searchParams.get("slug") ?? "";

  const secret = getPortalSecret();
  const client = slug ? getPortalClient(slug) : undefined;

  const invalid = new URL("/portal?error=invalid_link", request.url);

  if (!secret || !client) {
    return NextResponse.redirect(invalid);
  }

  const valid = await verifyMagicToken(token, slug, secret);
  if (!valid) {
    return NextResponse.redirect(invalid);
  }

  const response = NextResponse.redirect(new URL("/portal/dashboard", request.url));

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };

  response.cookies.set({
    name: PORTAL_SESSION_COOKIE,
    value: await signSessionToken(slug, secret),
    ...cookieOptions,
  });
  response.cookies.set({ name: PORTAL_SLUG_COOKIE, value: slug, ...cookieOptions });

  return response;
}
