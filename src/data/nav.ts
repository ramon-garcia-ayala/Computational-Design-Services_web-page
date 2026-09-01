export type NavLink = {
  label: string;
  href: string;
  /** External links and mailto open outside the Next router. */
  external?: boolean;
};

/**
 * The client portal's entry point. Declared first so both `navLinks` below
 * and `Header.tsx`'s own header pill read the same object — one label,
 * defined once, never re-typed at either call site.
 */
export const portalLink: NavLink = { label: "Client access", href: "/portal" };

/**
 * Main navigation of the fullscreen overlay menu.
 *
 * `portalLink` is deliberately absent: it stays a header-only pill
 * (`Header.tsx`, `sm` up), not a menu entry. It used to also close this list
 * — the reasoning was that the header at 375px has no room for it, so the
 * menu was the only way to reach the portal below `sm` — but the client
 * portal is a returning-client bookmark, not a route a first-time visitor
 * needs surfaced in the primary nav.
 */
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

/**
 * Secondary highlighted link inside the overlay.
 *
 * `description` is the card's second line, which used to be hardcoded in
 * `MenuOverlay.tsx`. It says what it says because this card is now the only
 * way in: the assistant moved off Home's scroll and onto `/labs`, so a
 * visitor who is never told it is there will never find it.
 */
export const labsLink: NavLink & { description: string } = {
  label: "Labs",
  href: "/labs",
  description: "Build a tool with the assistant",
};
