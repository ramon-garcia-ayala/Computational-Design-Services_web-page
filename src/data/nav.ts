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

/** Main navigation of the fullscreen overlay menu. */
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
  /* Reading here, not just in `Header.tsx`'s own pill: the header at 375px
     already carries the logo, the contact pill and the menu trigger, so a
     third pill crowds it. `Header.tsx` shows `portalLink` separately from
     `sm` up; this entry is what keeps the portal reachable below that
     breakpoint, through the menu instead. */
  portalLink,
];

/** Secondary highlighted link inside the overlay. */
export const labsLink: NavLink = { label: "Labs", href: "/labs" };
