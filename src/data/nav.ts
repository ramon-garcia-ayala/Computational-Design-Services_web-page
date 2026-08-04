import { mailtoHref } from "./site";

export type NavLink = {
  label: string;
  href: string;
  /** Los externos y los mailto abren fuera del router de Next. */
  external?: boolean;
};

/** Navegación principal del menú overlay fullscreen. */
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: mailtoHref, external: true },
];

/** Enlace secundario destacado dentro del overlay. */
export const labsLink: NavLink = { label: "Labs", href: "/labs" };
