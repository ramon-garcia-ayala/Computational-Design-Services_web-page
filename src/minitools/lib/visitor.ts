/**
 * The two optional fields in the inquiry band, remembered between visits.
 *
 * Nothing here is ever sent anywhere — it exists so a returning visitor does
 * not retype their own name into a mailto draft. `localStorage`, one slot,
 * newest wins, same shape as `handoff.ts` but longer-lived on purpose: this is
 * meant to survive across tabs and sessions, not just the one that generated
 * a tool.
 *
 * Never call `readVisitor()` during render. The server has no storage, so a
 * value read at render time would make the first client render disagree with
 * the server-rendered HTML, and React discards the whole subtree. It is read
 * in an effect, same as `ToolViewerPage` reads the URL fragment.
 */

const KEY = "r2ch:minitool:visitor";

/* Both fields end up inside a URL with a hard budget (see `inquiry.ts`), so
   the cap here is what makes that budget's worst case provable. */
const MAX_NAME = 80;
const MAX_EMAIL = 120;

export type Visitor = { name: string; email: string };

export const EMPTY_VISITOR: Visitor = { name: "", email: "" };

/**
 * Storage — and the field itself — is untrusted. Strip control characters (a
 * bare CR in the name would fake a paragraph break in the composed email) and
 * cap the length. Written as an explicit code-point walk rather than a regex
 * control-character class, which does not survive every text pipeline intact.
 *
 * Deliberately does NOT trim. This runs on every keystroke (`InquiryBand`'s
 * `onChange`), and a live-typing trim eats the trailing space the instant it
 * is typed — a visitor typing "Marta Ruiz" would see the space vanish before
 * "Ruiz" ever gets a character to follow it, because that space is the last
 * character in the string exactly once, on the keystroke that types it.
 * Trimming belongs at the boundaries instead: `readVisitor` below, and
 * `inquiry.ts` where the fields are interpolated into the email.
 */
export function cleanVisitorField(value: unknown, max: number): string {
  if (typeof value !== "string") return "";

  let clean = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isControlChar = code < 32 || code === 127;
    clean += isControlChar ? " " : char;
  }

  return clean.slice(0, max);
}

export function readVisitor(): Visitor {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_VISITOR;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_VISITOR;
    const record = parsed as Record<string, unknown>;
    return {
      name: cleanVisitorField(record.name, MAX_NAME).trim(),
      email: cleanVisitorField(record.email, MAX_EMAIL).trim(),
    };
  } catch {
    return EMPTY_VISITOR;
  }
}

export function writeVisitor(visitor: Visitor): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(visitor));
  } catch {
    /* Privacy modes and quota. The fields still work for this visit. */
  }
}

export const VISITOR_FIELD_LIMITS = { name: MAX_NAME, email: MAX_EMAIL } as const;

/** Only to decide whether to show a gentle nudge. Never blocks the CTA. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
