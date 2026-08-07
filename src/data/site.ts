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

/**
 * Builds a mailto to both partners with the given subject and, optionally, a
 * prewritten body.
 *
 * Each part is escaped on its own with `encodeURIComponent` rather than built
 * through `URLSearchParams`, which serialises a space as `+` — correct for a
 * form body, wrong here: several mail clients drop the `+` straight into the
 * message text a visitor is about to read. Line breaks in `body` should be
 * `\r\n` (RFC 6068), which every handler agrees on.
 */
export function contactHref(subject: string = site.contactSubject, body?: string): string {
  const query = [`subject=${encodeURIComponent(subject)}`];
  if (body) query.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${contactRecipients.join(",")}?${query.join("&")}`;
}

/** Ready-to-use href for any contact CTA. */
export const mailtoHref = contactHref();

/**
 * Practical ceiling for a whole mailto href, measured across Outlook and
 * Gmail handlers. Above this, some clients silently truncate the body rather
 * than opening it in full — worse than a shorter, honest draft.
 */
export const MAILTO_MAX_CHARS = 1800;

/** Social links. Emptying the array hides the block in the footer. */
export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
] as const;
