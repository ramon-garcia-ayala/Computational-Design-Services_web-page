/**
 * Global site constants.
 *
 * Contact: every mailto on the site goes to both partners at once, and the
 * address is NEVER printed as visible text — not in the header, not in the
 * footer, not in the CTAs, not in the proposals. CTAs use `contactLabel`;
 * whoever clicks gets their mail client opened prefilled. This also keeps spam
 * harvesters from scraping the addresses out of the HTML.
 */
export const site = {
  name: "R²ch-Tech",
  /** Flat version for <title>, alt and metadata where the superscript gets in the way. */
  nameFlat: "R2ch-Tech",
  tagline: "We automate AEC. You ship faster.",
  subcopy:
    "We build custom automation tools and computational workflows for AEC firms, from parametric design pipelines to AI-driven systems.",
  /** Short descriptor for the header and the metadata. */
  descriptor: "Computational automation studio for architecture, engineering and construction.",
  contactSubject: "Project inquiry",
  /** Visible text of any contact CTA. Never the address. */
  contactLabel: "Get in touch",
  location: "Remote · Worldwide",
  foundedYear: 2024,
} as const;

/** Recipients of every mailto on the site. Both of them, always. */
const contactRecipients = [
  "gramonga4434@gmail.com",
  "ramyayoub8@gmail.com",
] as const;

/** Builds a mailto to both partners with the given subject. */
export function contactHref(subject: string = site.contactSubject): string {
  return `mailto:${contactRecipients.join(",")}?subject=${encodeURIComponent(subject)}`;
}

/** Ready-to-use href for any contact CTA. */
export const mailtoHref = contactHref();

/** Social links. Emptying the array hides the block in the footer. */
export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
] as const;
