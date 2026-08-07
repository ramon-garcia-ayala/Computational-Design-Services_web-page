/**
 * The spec travels in the URL fragment, so a generated tool needs no storage
 * and the link is shareable on its own. The site stays fully static: a
 * fragment is never sent to the server, so `/labs/tool` is still one prebuilt
 * page no matter how many tools exist.
 *
 * Format: `<version><encoding>.<payload>` — `v1z.` deflated, `v1u.` plain.
 * The encoding letter matters because `CompressionStream` is missing on older
 * Safari; there the payload is written uncompressed rather than not at all.
 *
 * Isomorphic on purpose: the chat widget encodes, the viewer page decodes.
 */

import { parseSpec } from "../schema/validate";
import type { MinitoolSpec } from "../schema/spec";

export const TOOL_PATH = "/labs/tool";

const VERSION = "v1";
const DEFLATED = `${VERSION}z.`;
const PLAIN = `${VERSION}u.`;

/** Well past the largest real spec; a longer fragment is an attack, not a tool. */
const MAX_PAYLOAD_CHARS = 4096;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * TypeScript 5.7 made `Uint8Array` generic over its backing buffer, and the
 * stream APIs only accept the non-shared form. Naming it once keeps the
 * signatures below readable.
 */
type Bytes = Uint8Array<ArrayBuffer>;

function hasCompression(): boolean {
  return typeof CompressionStream === "function";
}

async function pipe(
  bytes: Bytes,
  /* The compression streams take `BufferSource` in and `Uint8Array` out, so
     the source has to be typed on the wider side for `pipeThrough` to line up. */
  transform: ReadableWritablePair<Uint8Array, BufferSource>,
): Promise<Bytes> {
  const source = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });

  const buffer = await new Response(
    source.pipeThrough<Uint8Array>(transform),
  ).arrayBuffer();

  return new Uint8Array(buffer);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  /* Chunked because `String.fromCharCode(...bytes)` blows the argument limit
     on anything but a tiny array. */
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Bytes | null {
  try {
    const padded = value
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** Serialises a spec into the fragment payload. Never includes the `#`. */
export async function encodeSpec(spec: MinitoolSpec): Promise<string> {
  const bytes = encoder.encode(JSON.stringify(spec));

  if (!hasCompression()) return PLAIN + toBase64Url(bytes);

  try {
    const deflated = await pipe(bytes, new CompressionStream("deflate-raw"));
    return DEFLATED + toBase64Url(deflated);
  } catch {
    return PLAIN + toBase64Url(bytes);
  }
}

/**
 * Reads a fragment back. Accepts the raw `window.location.hash`, leading `#`
 * and all. Everything that comes out still goes through `parseSpec`: the URL
 * is user input, and a hand-edited number must not reach the renderer unclamped.
 */
export async function decodeSpec(hash: string): Promise<MinitoolSpec | null> {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw || raw.length > MAX_PAYLOAD_CHARS) return null;

  const deflated = raw.startsWith(DEFLATED);
  if (!deflated && !raw.startsWith(PLAIN)) return null;

  const bytes = fromBase64Url(raw.slice(DEFLATED.length));
  if (!bytes) return null;

  try {
    const json = deflated
      ? decoder.decode(await pipe(bytes, new DecompressionStream("deflate-raw")))
      : decoder.decode(bytes);
    return parseSpec(JSON.parse(json));
  } catch {
    return null;
  }
}

/** Full href for a generated tool, ready for a link. */
export async function toolHref(spec: MinitoolSpec): Promise<string> {
  return `${TOOL_PATH}#${await encodeSpec(spec)}`;
}
