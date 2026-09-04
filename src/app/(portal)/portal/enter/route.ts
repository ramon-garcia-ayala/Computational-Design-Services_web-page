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
 *
 * **The `Location` is relative, and that is load-bearing.** This used to build
 * it with `NextResponse.redirect(new URL(path, request.url))`, the idiom the
 * docs lead with — and `request.url` in a route handler does not carry the
 * `Host` the client actually asked for. Reached over a LAN address it emitted
 * `Location: http://localhost:3000/portal/dashboard`, so redeeming the link on
 * a phone sent the phone to *itself* and died on `ERR_CONNECTION_REFUSED`;
 * started with `-H 0.0.0.0` it emitted `http://0.0.0.0:3000/…`, which fails the
 * same way. A relative `Location` is resolved by the browser against whatever
 * origin it used, so the link works from a LAN IP, a preview deployment and
 * the production domain without any of them being named here. It is also what
 * `src/proxy.ts` already emits — Next normalises same-origin middleware
 * redirects to relative — so this brings the two halves of the same sign-in
 * flow into agreement rather than inventing a convention.
 */

/**
 * Same-origin redirect carrying cookies. `NextResponse.redirect` rejects a
 * relative URL, so the response is constructed directly.
 */
function redirectTo(path: string): NextResponse {
  return new NextResponse(null, { status: 307, headers: { Location: path } });
}
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? undefined;
  const slug = request.nextUrl.searchParams.get("slug") ?? "";

  const secret = getPortalSecret();
  const client = slug ? getPortalClient(slug) : undefined;

  if (!secret || !client) {
    return redirectTo("/portal?error=invalid_link");
  }

  const valid = await verifyMagicToken(token, slug, secret);
  if (!valid) {
    return redirectTo("/portal?error=invalid_link");
  }

  const response = redirectTo("/portal/dashboard");

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
