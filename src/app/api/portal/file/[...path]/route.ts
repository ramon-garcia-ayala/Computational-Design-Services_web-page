import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import {
  PORTAL_SESSION_COOKIE,
  PORTAL_SLUG_COOKIE,
  getPortalSecret,
  verifySessionToken,
} from "@/lib/portal-auth";

/**
 * Serves a client's private documents. Nothing under `private/portal/` is
 * reachable any other way — unlike `public/`, this directory is outside
 * Next's static file serving entirely, which is the whole reason budgets and
 * deliverables live there instead of under `/public/proposals/<slug>/` the
 * way a proposal's attachments do.
 *
 * `runtime = "nodejs"` because this reads the filesystem — the proxy runtime
 * that the rest of the auth code is written to tolerate does not apply here,
 * this route only ever runs as a full Node function.
 */
export const runtime = "nodejs";

const PRIVATE_ROOT = path.join(process.cwd(), "private", "portal");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  const secret = getPortalSecret();
  const sessionSlug = request.cookies.get(PORTAL_SLUG_COOKIE)?.value;
  const token = request.cookies.get(PORTAL_SESSION_COOKIE)?.value;

  if (!secret || !sessionSlug || !(await verifySessionToken(token, sessionSlug, secret))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  /* The first path segment must be the session's own slug: a client cannot
     request another client's folder just by changing the URL, no matter what
     the rest of the path says. */
  const [requestedSlug, ...rest] = segments;
  if (requestedSlug !== sessionSlug || rest.length === 0) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const relative = path.join(requestedSlug, ...rest);
  const resolved = path.join(PRIVATE_ROOT, relative);

  /* Resolving and re-checking the prefix (rather than trusting a `..` scan)
     is what actually closes path traversal: `path.join` already collapses
     `..` segments, so checking the result's prefix is the reliable test, not
     inspecting the raw input for the literal string. */
  if (!resolved.startsWith(PRIVATE_ROOT + path.sep)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let file: Buffer;
  try {
    file = await readFile(resolved);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const filename = path.basename(resolved);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
