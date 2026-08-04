/**
 * Constantes globales del sitio.
 *
 * Contacto: todo mailto del sitio va a los dos socios a la vez, y la dirección
 * NUNCA se imprime como texto visible — ni en el header, ni en el footer, ni en
 * los CTA, ni en las propuestas. Los CTA usan `contactLabel`; quien pulsa abre
 * su cliente de correo ya relleno. Esto también evita que los rastreadores de
 * spam cosechen las direcciones del HTML.
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
  contactSubject: "Project inquiry",
  /** Texto visible de cualquier CTA de contacto. Nunca la dirección. */
  contactLabel: "Get in touch",
  location: "Remote · Worldwide",
  foundedYear: 2024,
} as const;

/** Destinatarios de todo mailto del sitio. Los dos, siempre. */
const contactRecipients = [
  "gramonga4434@gmail.com",
  "ramyayoub8@gmail.com",
] as const;

/** Construye un mailto a ambos socios con el asunto indicado. */
export function contactHref(subject: string = site.contactSubject): string {
  return `mailto:${contactRecipients.join(",")}?subject=${encodeURIComponent(subject)}`;
}

/** href listo para usar en cualquier CTA de contacto. */
export const mailtoHref = contactHref();

/** Enlaces sociales. Vaciar el array oculta el bloque en el footer. */
export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
] as const;
