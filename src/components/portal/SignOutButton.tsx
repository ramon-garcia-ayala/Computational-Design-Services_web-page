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
      /* `min-h-11` is 44px. At `px-3 py-1.5 text-[10px]` this pill stood
         about 25px tall — over WCAG 2.2's 24px web minimum by a pixel, and
         the only control in the header, which on a phone is the only control
         on the page. The header is `h-14`, so 44px fits inside it with room
         to spare. */
      className="inline-flex min-h-11 items-center rounded-control border border-edge px-4 font-mono text-[11px] uppercase tracking-widest text-fg transition-colors hover:border-accent-ink hover:text-accent-ink sm:text-xs"
    >
      {portalCopy.chrome.signOut}
    </button>
  );
}
