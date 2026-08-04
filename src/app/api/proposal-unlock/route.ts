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

/** Verifica la contraseña de una propuesta y emite la cookie de acceso. */
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

  /* Mismo error para slug inexistente y contraseña incorrecta: no confirmamos
     qué propuestas existen a quien va probando URLs. */
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
