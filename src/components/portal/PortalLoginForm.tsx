"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { portalCopy } from "@/data/portal/copy";
import { Icon } from "@/components/proposal/icons";

type Status = "idle" | "sending" | "sent" | "error" | "unavailable";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The portal's sign-in form: an email address, nothing else to remember.
 *
 * WCAG 2.2's Accessible Authentication is the reason this exists in this
 * shape at all — no password to transcribe, and the field never blocks paste
 * or autofill (`autoComplete="email"`, no `onPaste` handler).
 *
 * Same submit-state discipline as `ContactForm`: the button stays focusable
 * and reports its state through `aria-disabled` rather than `disabled`, so
 * sending never drops focus to `<body>`. Unlike `ContactForm`, "sent" here
 * always means the same thing whether or not the address is a real client —
 * see the API route's own comment on why.
 */
export function PortalLoginForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError(portalCopy.login.errors.emailRequired);
      return;
    }
    if (!EMAIL.test(trimmed)) {
      setFieldError(portalCopy.login.errors.emailInvalid);
      return;
    }
    setFieldError(null);
    setStatus("sending");

    try {
      const response = await fetch("/api/portal/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, company: honeypot.current?.value ?? "" }),
      });

      setStatus(response.status === 503 ? "unavailable" : response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="mt-10 rounded-surface border border-edge bg-graphite/30 p-8">
        <p className="font-display text-xl font-semibold text-fg">{portalCopy.login.sent.title}</p>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">{portalCopy.login.sent.body}</p>
      </div>
    );
  }

  const error = fieldError ?? (status === "unavailable" ? portalCopy.login.errors.unavailable : null);

  return (
    <form onSubmit={onSubmit} className="mt-10" noValidate>
      <label
        htmlFor={`${id}-email`}
        className="font-mono text-[10px] uppercase tracking-widest text-fg-muted"
      >
        {portalCopy.login.fields.email}
      </label>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon
            name="mail"
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-fg-muted"
          />
          <input
            id={`${id}-email`}
            type="email"
            value={email}
            autoComplete="email"
            autoFocus
            required
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-status`}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldError) setFieldError(null);
              if (status === "error" || status === "unavailable") setStatus("idle");
            }}
            className={cn(
              "w-full rounded-surface border bg-graphite py-3 pr-5 pl-11 text-sm text-fg",
              "placeholder:text-fg-muted focus:outline-none",
              error ? "border-danger focus:border-danger" : "border-edge focus:border-accent-ink",
            )}
            placeholder={portalCopy.login.placeholders.email}
          />
        </div>

        <button
          type="submit"
          aria-disabled={status === "sending"}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-control border border-transparent bg-accent px-7 py-3 font-mono text-sm tracking-wide text-on-accent uppercase transition-colors duration-200 hover:bg-accent-dim",
            status === "sending" && "cursor-not-allowed opacity-60",
          )}
        >
          {status === "sending" ? portalCopy.login.sending : portalCopy.login.submit}
        </button>
      </div>

      <p
        id={`${id}-status`}
        role="status"
        className={cn("mt-4 min-h-5 text-sm", error ? "text-danger" : "text-fg-muted")}
      >
        {error ?? ""}
      </p>

      {/* Honeypot, same shape as ContactForm's. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-company`}>Company</label>
        <input
          ref={honeypot}
          id={`${id}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
    </form>
  );
}
