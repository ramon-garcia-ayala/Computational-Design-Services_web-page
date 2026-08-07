/**
 * A doorstop, not a lock.
 *
 * `/api/minitools-chat` is public — the proxy's matcher skips `/api`, so
 * nothing else stands in front of it. This keeps one bored visitor from
 * looping the endpoint, and that is all it claims to do: the counters live in
 * process memory, so on serverless each instance counts on its own and a
 * determined attacker just spreads out. The real ceilings are the token caps
 * and the truncated history in `chat-handler.ts`.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const PER_MINUTE = 8;
const PER_HOUR = 40;

/** Stops the map from growing without bound if the process lives a long time. */
const MAX_TRACKED = 5000;

const hits = new Map<string, number[]>();

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** True when the request may proceed. */
export function withinRateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < HOUR);

  if (
    recent.length >= PER_HOUR ||
    recent.filter((time) => now - time < MINUTE).length >= PER_MINUTE
  ) {
    hits.set(ip, recent);
    return false;
  }

  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > MAX_TRACKED) {
    for (const [key, times] of hits) {
      if (times.length === 0 || now - times[times.length - 1] > HOUR) hits.delete(key);
    }
  }

  return true;
}
