"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { contactCopy } from "@/data/contact";

type Status = "idle" | "sending" | "sent" | "error";
type Field = "name" | "email" | "message";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The contact form.
 *
 * Validation runs on submit and then live per field, rather than on every
 * keystroke from the start: flagging an address as malformed while someone is
 * still typing the third character is noise, not help. Once a field has been
 * judged, it re-checks as they fix it.
 *
 * The submit button is never `disabled` while sending. Disabling the focused
 * element blurs it, dropping focus to `<body>` — the same reason the
 * assistant's input is `readOnly` mid-turn. It stays focusable and reports
 * its state through `aria-disabled` instead.
 */
export function ContactForm() {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState(false);
  /* The honeypot's value never enters React state — nothing re-renders on it,
     and a controlled hidden field is one more thing to keep in sync. */
  const honeypot = useRef<HTMLInputElement>(null);

  const validate = (next: typeof values) => {
    const found: Partial<Record<Field, string>> = {};
    if (!next.name.trim()) found.name = contactCopy.errors.name;
    if (!next.email.trim()) found.email = contactCopy.errors.emailRequired;
    else if (!EMAIL.test(next.email.trim())) found.email = contactCopy.errors.emailInvalid;
    if (!next.message.trim()) found.message = contactCopy.errors.message;
    return found;
  };

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched) setErrors(validate(next));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: honeypot.current?.value ?? "" }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
      setValues({ name: "", email: "", message: "" });
      setTouched(false);
    } catch {
      setStatus("error");
    }
  };

  const field = (name: Field) => ({
    id: `${id}-${name}`,
    name,
    value: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update(name, e.target.value),
    className: cn(
      "mt-2 w-full rounded-surface border bg-graphite/40 px-4 py-3 text-sm text-fg",
      "placeholder:text-fg-muted focus:outline-none",
      /* `--color-danger` (Fase 1) replaces the site's one non-token colour:
         `text-red-400` measured ~1.3:1 on the pale ground `/contact` renders
         on, so a failed field and the error banner below were both
         effectively invisible there. */
      errors[name] ? "border-danger focus:border-danger" : "border-edge focus:border-accent-ink",
    ),
  });

  /* Sent is a terminal state with its own view: leaving the emptied form on
     screen next to a confirmation invites a second identical submission. */
  if (status === "sent") {
    return (
      <div
        role="status"
        /* Was `border-accent/40`: on the pale ground this form renders on,
           amber measures 1.00:1 against it — the brand guide's own rule is
           that amber never carries an ink or border role there, only a
           filled plate does, so no amount of alpha fixes it. `border-edge`
           is the token built to be a visible, meaningful border everywhere. */
        className="rounded-surface border border-edge bg-graphite/30 p-8 text-center"
      >
        <p className="font-display text-xl font-semibold text-fg">
          {contactCopy.success.title}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          {contactCopy.success.body}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 font-mono text-[11px] uppercase tracking-widest text-accent-ink transition-opacity hover:opacity-70"
        >
          {contactCopy.success.again}
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <label htmlFor={`${id}-name`} className="font-mono text-[11px] uppercase tracking-widest text-fg-muted">
          {contactCopy.fields.name}
        </label>
        <input {...field("name")} type="text" autoComplete="name" placeholder={contactCopy.placeholders.name} />
        {errors.name ? (
          <p id={`${id}-name-error`} className="mt-2 text-xs text-danger">{errors.name}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${id}-email`} className="font-mono text-[11px] uppercase tracking-widest text-fg-muted">
          {contactCopy.fields.email}
        </label>
        <input {...field("email")} type="email" autoComplete="email" placeholder={contactCopy.placeholders.email} />
        {errors.email ? (
          <p id={`${id}-email-error`} className="mt-2 text-xs text-danger">{errors.email}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="font-mono text-[11px] uppercase tracking-widest text-fg-muted">
          {contactCopy.fields.message}
        </label>
        <textarea {...field("message")} rows={6} placeholder={contactCopy.placeholders.message} />
        {errors.message ? (
          <p id={`${id}-message-error`} className="mt-2 text-xs text-danger">{errors.message}</p>
        ) : null}
      </div>

      {/* Honeypot. Not `type="hidden"` — some bots skip those and some fill
          them regardless; a real field moved out of view and taken out of the
          tab order catches the ones that fill everything they can see in the
          DOM. `aria-hidden` and `tabIndex={-1}` keep it away from anyone
          using the page properly. */}
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

      {status === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {contactCopy.errors.send}
        </p>
      ) : null}

      <button
        type="submit"
        aria-disabled={status === "sending"}
        className={cn(
          "self-start rounded-control bg-accent px-8 py-3 font-mono text-xs uppercase tracking-widest text-on-accent",
          "transition-colors duration-200 hover:bg-accent-dim",
          status === "sending" && "cursor-not-allowed opacity-60",
        )}
      >
        {status === "sending" ? contactCopy.sending : contactCopy.submit}
      </button>
    </form>
  );
}
