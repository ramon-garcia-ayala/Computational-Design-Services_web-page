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
  name: "R²χTECH",
  /** Flat version for <title>, alt and metadata where the superscript gets in the way. */
  nameFlat: "R²XTECH",
  tagline: "We automate AEC. You ship faster.",
  subcopy:
    "We build custom automation tools and computational workflows for AEC firms, from parametric design pipelines to AI-driven systems.",
  /**
   * Short descriptor for the header and the two footers.
   *
   * It has to actually be short. The 78-character version this replaces was
   * set `whitespace-nowrap` and absolutely centred in the header, so it took
   * whatever width it needed and ran *underneath* the control cluster on the
   * right — the tail of "construction" sat behind the music toggle at every
   * width from 1024 up. Absolute centring is what makes the header's middle
   * slot independent of the logo and the controls; the price is that this
   * string is the only thing keeping it out of them.
   */
  descriptor: "Computational automation for AEC.",
  contactSubject: "Project inquiry",
  /** Visible text of any contact CTA. Never the address. */
  contactLabel: "Get in touch",
  /**
   * Canonical production origin. `www` is the host that serves; the apex
   * redirects to it. Needed as `metadataBase` so Open Graph images resolve to
   * absolute URLs — without it Next falls back to localhost and every shared
   * link previews a dead image.
   */
  origin: "https://www.r-xtech.com",
  location: "Remote · Worldwide",
  foundedYear: 2024,
} as const;

/**
 * Search and social metadata, consumed by the root layout's `metadata` export.
 *
 * Separate from `tagline`/`subcopy` above, which are the *visible* hero copy:
 * a <title> has to carry the discipline words someone would actually search
 * for, while the hero can afford to be short. Keeping them apart is what lets
 * either change without dragging the other with it.
 *
 * There is deliberately no `icons` entry. The icon set lives in `src/app/`
 * under Next's file conventions, which emit the <link> tags themselves —
 * declaring them here as well duplicates every tag. See `scripts/favicon.mjs`.
 */
export const seo = {
  title: "R²XTECH — Computational Design & Automation for AEC",
  description:
    "R²XTECH is a computational studio for architecture, engineering, and construction — parametric design, automation, and AI-driven systems.",
  ogTitle: "R²XTECH — Architecture, computed.",
  ogDescription:
    "A computational studio embedded in architecture, engineering, and construction. We build the parametric pipelines, model automations, and AI-driven systems.",
  /**
   * Built by `scripts/og-image.mjs` from the hero's own geodesic frame, at the
   * 1200x630 every platform crops from.
   */
  ogImage: "/og.jpg",
  ogImageAlt: "The R²XTECH geodesic form, lit from within.",
  /* Near-zero weight with modern search engines, and harmless. Kept because it
     costs nothing and a few smaller crawlers still read it. */
  keywords: [
    "computational design",
    "parametric design",
    "design automation",
    "AI architecture",
    "BIM automation",
    "Grasshopper",
    "Rhino",
    "AEC consultancy",
  ],
} as const;

/** Recipients of every mailto on the site. Both of them, always. */
export const contactRecipients = [
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
  { label: "LinkedIn", href: "https://www.linkedin.com/company/r-xtech/" },
  { label: "Instagram", href: "https://www.instagram.com/r2xtech/" },
] as const;
