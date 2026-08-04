"use client";

import { useState } from "react";
import { Icon } from "./icons";

type Status = "idle" | "checking" | "invalid" | "unavailable";

const messages: Record<Exclude<Status, "idle" | "checking">, string> = {
  invalid: "That password doesn't match. Check it against the message you were sent.",
  unavailable: "Access is temporarily unavailable. Please contact us directly.",
};

export function UnlockForm({ slug }: { slug: string }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("checking");

    try {
      const response = await fetch("/api/proposal-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      if (response.ok) {
        /* Full reload on purpose: the cookie has to reach the middleware, and
           a client-side navigation never goes through it again. */
        window.location.assign(`/${slug}`);
        return;
      }

      setStatus(response.status === 503 ? "unavailable" : "invalid");
    } catch {
      setStatus("unavailable");
    }
  }

  const error = status === "invalid" || status === "unavailable";

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      <label
        htmlFor="proposal-password"
        className="font-mono text-[10px] uppercase tracking-widest text-fg-muted"
      >
        Access password
      </label>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon
            name="lock"
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-fg-muted"
          />
          <input
            id="proposal-password"
            type="password"
            value={password}
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={error}
            aria-describedby={error ? "proposal-password-error" : undefined}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setStatus("idle");
            }}
            className="w-full rounded-full border border-line bg-graphite py-3 pr-5 pl-11 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={status === "checking" || password.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-accent px-7 py-3 font-mono text-sm tracking-wide text-carbon uppercase transition-colors duration-200 hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "checking" ? "Checking" : "Open"}
        </button>
      </div>

      <p
        id="proposal-password-error"
        role="status"
        className="mt-4 min-h-5 text-sm text-fg-muted"
      >
        {error ? messages[status] : ""}
      </p>
    </form>
  );
}
