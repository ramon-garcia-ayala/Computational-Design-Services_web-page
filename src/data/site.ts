/**
 * Constantes globales del sitio.
 *
 * TODO (pendiente de confirmar): `contactEmail` es un placeholder. Cambiarlo
 * aquí actualiza el mailto del header, del menú overlay, del CTA final y del
 * footer a la vez.
 */
export const site = {
  name: "R²ch-Tech",
  /** Versión plana para <title>, alt y metadatos donde el superíndice estorba. */
  nameFlat: "R2ch-Tech",
  tagline: "We automate AEC. You ship faster.",
  subcopy:
    "We build custom automation tools and computational workflows for AEC firms, from parametric design pipelines to AI-driven systems.",
  /** Descriptor corto para el header y los metadatos. */
  descriptor: "Computational automation studio for architecture, engineering and construction.",
  contactEmail: "hello@r2ch.tech",
  contactSubject: "Project inquiry",
  location: "Remote · Worldwide",
  foundedYear: 2024,
} as const;

/** href listo para usar en cualquier CTA de contacto. */
export const mailtoHref = `mailto:${site.contactEmail}?subject=${encodeURIComponent(
  site.contactSubject,
)}`;

/** Enlaces sociales. Vaciar el array oculta el bloque en el footer. */
export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
] as const;
