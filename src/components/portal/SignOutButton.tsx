"use client";

import { portalCopy } from "@/data/portal/copy";

/**
 * Full reload on purpose, same reasoning as `UnlockForm`'s
 * `window.location.assign`: the cookie has to be gone before the proxy
 * evaluates the next request, and a client-side navigation never revisits it.
 */
export function SignOutButton() {
  async function onClick() {
    await fetch("/api/portal/logout", { method: "POST" });
    window.location.assign("/portal");
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-control border border-edge px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-fg transition-colors hover:border-accent-ink hover:text-accent-ink sm:px-4 sm:text-xs"
    >
      {portalCopy.chrome.signOut}
    </button>
  );
}
