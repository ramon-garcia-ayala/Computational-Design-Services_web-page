import { NextResponse, type NextRequest } from "next/server";
import { proposalAccess } from "@/data/proposals/access";
import { cookieName, getSecret, verifyToken } from "@/lib/proposal-auth";

/**
 * Portero de las propuestas de cliente. (En Next 16 esto es `proxy`, el
 * sustituto de `middleware`.)
 *
 * Corre ANTES de servir la página, que es la única forma de que la contraseña
 * sirva de algo: la propuesta es SSG y su HTML ya contiene todo el contenido.
 * Cubre también las peticiones RSC de la misma ruta, porque comparten pathname.
 */
export async function proxy(request: NextRequest) {
  const slug = decodeURIComponent(request.nextUrl.pathname.slice(1));
  const credentials = proposalAccess[slug];

  /* Cualquier otra ruta del sitio, y las propuestas sin contraseña
     configurada, pasan de largo. */
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
  /* Deliberadamente amplio: los slugs de propuesta llevan puntos
     (05.08.2026_ecogen), así que la exclusión habitual de rutas con extensión
     los dejaría fuera del control de acceso. El filtro real es el lookup de
     arriba, que descarta todo lo demás en una comparación. */
  matcher: ["/((?!_next/|api/).*)"],
};
