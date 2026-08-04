import { mailtoHref } from "./site";

export type NavLink = {
  label: string;
  href: string;
  /** External links and mailto open outside the Next router. */
  external?: boolean;
};

/** Main navigation of the fullscreen overlay menu. */
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: mailtoHref, external: true },
];

/** Secondary highlighted link inside the overlay. */
export const labsLink: NavLink = { label: "Labs", href: "/labs" };
