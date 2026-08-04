import { NextResponse, type NextRequest } from "next/server";
import { proposalAccess } from "@/data/proposals/access";
import {
  SESSION_MAX_AGE,
  cookieName,
  getSecret,
  hashPassword,
  safeEqual,
  signToken,
} from "@/lib/proposal-auth";

/** Verifies a proposal password and issues the access cookie. */
export async function POST(request: NextRequest) {
  let slug: unknown;
  let password: unknown;

  try {
    ({ slug, password } = await request.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (typeof slug !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const credentials = proposalAccess[slug];
  const secret = getSecret();

  if (!secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  /* Same error for an unknown slug and a wrong password: we don't confirm
     which proposals exist to anyone probing URLs. */
  if (
    !credentials ||
    !safeEqual(await hashPassword(password, credentials.salt), credentials.hash)
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: cookieName(slug),
    value: await signToken(slug, secret),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
