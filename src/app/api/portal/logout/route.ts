import { NextResponse } from "next/server";
import { PORTAL_SESSION_COOKIE, PORTAL_SLUG_COOKIE } from "@/lib/portal-auth";

/** Clears the portal session. No body required. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(PORTAL_SESSION_COOKIE);
  response.cookies.delete(PORTAL_SLUG_COOKIE);
  return response;
}
