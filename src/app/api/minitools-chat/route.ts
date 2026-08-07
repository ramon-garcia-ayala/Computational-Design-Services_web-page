import type { NextRequest } from "next/server";
import { handleMinitoolsChat } from "@/minitools/server/chat-handler";

/**
 * Spec generation has been observed past two minutes when the API compiles a
 * schema for the first time (pitch, notably). Fluid Compute allows 300s on
 * every plan; anything lower kills the function mid-build and the visitor
 * gets an error for waiting patiently.
 */
export const maxDuration = 300;

/** Streams the hero assistant's reply, and the tool it decides to build. */
export function POST(request: NextRequest) {
  return handleMinitoolsChat(request);
}
