import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { contactRecipients, site } from "@/data/site";

/**
 * Contact form endpoint.
 *
 * **Everything about who this mails is configuration, not code.** The domain
 * it sends from and the inbox it reaches are both env vars, so pointing them
 * at a verified domain later is a deploy setting rather than an edit. Until
 * one exists, Resend only allows `onboarding@resend.dev` as the sender and
 * only delivers to the address that owns the account — which is why the
 * recipient falls back to the site's own list rather than being hardcoded to
 * one person.
 *
 * Fails closed, like `ANTHROPIC_API_KEY` does for the assistant: no key means
 * 503 and a form that says it could not send, never a silent success.
 */

/** Caps: generous for a real message, tight enough to be worth rejecting past. */
const LIMITS = { name: 120, email: 200, message: 5000 } as const;

/* One submission every 30s per address. In-process on purpose — this is a
   single form, not the mini tools, whose own limiter is deliberately not
   imported from outside that module. A restart forgets everyone, which is the
   right trade for an endpoint a honeypot already filters. */
const RATE_WINDOW_MS = 30_000;
const seen = new Map<string, number>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  for (const [k, at] of seen) if (now - at > RATE_WINDOW_MS) seen.delete(k);
  const last = seen.get(key);
  if (last && now - last < RATE_WINDOW_MS) return true;
  seen.set(key, now);
  return false;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Strips control characters and trims, then caps. */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  /* The honeypot. A field no visitor can see and none can tab into, so
     anything in it came from something filling the form blind. Answering 200
     is deliberate: a bot told it failed simply tries again differently, while
     one told it succeeded has no reason to. */
  if (clean(payload.company, 200) !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = clean(payload.name, LIMITS.name);
  const email = clean(payload.email, LIMITS.email);
  const message = clean(payload.message, LIMITS.message);

  if (!name || !email || !message || !EMAIL.test(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (rateLimited(email.toLowerCase())) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }

  const to = (process.env.CONTACT_TO ?? contactRecipients.join(","))
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  const from = process.env.CONTACT_FROM ?? "onboarding@resend.dev";

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      /* So a reply goes to the visitor rather than back to the sending
         domain, which is the whole point of a contact form. */
      replyTo: email,
      subject: `${site.contactSubject} — ${name}`,
      text: [
        `From:    ${name}`,
        `Email:   ${email}`,
        "",
        "Message",
        "-------",
        message,
        "",
        `— sent from the contact form at ${site.nameFlat}`,
      ].join("\n"),
    });

    if (error) {
      console.error("[contact] resend rejected the send:", error);
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
  } catch (cause) {
    console.error("[contact] resend threw:", cause);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
