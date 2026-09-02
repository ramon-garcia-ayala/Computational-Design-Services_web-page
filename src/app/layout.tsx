import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { seo, site } from "@/data/site";

/* Fonts exposed as CSS variables and consumed from the @theme in globals.css.
   Sora was retired here: it and Space Grotesk were both loaded as display
   faces with nothing declaring which was the brand face, and Space Grotesk was
   already sitewide chrome (Header, MenuOverlay, LabFooter all rendered it via
   `font-lab`, now folded into `--font-display`) — this removes the duplicate
   instead of keeping two. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

/* The site's geometric face. It moved here from the Home page once the header
   and the menu had to carry it too: both render on every route, so scoping the
   font to one page would have left the nav in Sora everywhere else — the exact
   inconsistency it exists to remove. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  /* Absolute-URL base for everything below. Without it Next resolves the
     Open Graph image against localhost and every shared link previews a dead
     image. */
  metadataBase: new URL(site.origin),
  title: {
    default: seo.title,
    /* Kept: child routes set a bare `title` and inherit the suffix, so
       /projects reads "Projects · R²XTECH" rather than repeating the whole
       search title on every page. */
    template: `%s · ${site.nameFlat}`,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  openGraph: {
    type: "website",
    siteName: site.nameFlat,
    url: site.origin,
    title: seo.ogTitle,
    description: seo.ogDescription,
    images: [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.ogImageAlt }],
  },
  /* X/Twitter reads Open Graph when its own tags are absent, but defaults to
     the small square card — `summary_large_image` is what actually surfaces
     the 1200x630 above. */
  twitter: {
    card: "summary_large_image",
    title: seo.ogTitle,
    description: seo.ogDescription,
    images: [seo.ogImage],
  },
};

/* Each route group provides its own chrome (header, footer, <main>): (site)
   uses the site navigation, (proposal) its own bar. Only what must never be
   duplicated stays here: <html>, the fonts and the single Lenis instance. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* The font variables belong on <html>, not <body>.

       Tailwind v4 declares every `@theme` token on `:root`, so
       `--font-display: var(--font-space)` is substituted *there*. next/font's
       classes were on <body>, one level below — and a `var()` on :root cannot
       see a variable defined on a descendant. Every font token was therefore
       invalid at computed-value time and silently fell back: measured, `h1`
       and `body` alike were resolving to the system stack, so none of the
       loaded faces ever actually rendered anywhere on the site. Moving the
       classes up one element is the whole fix. */
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased">
        <SmoothScroll>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-60 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-on-accent"
          >
            Skip to content
          </a>
          {children}
          {/* Site-wide, so it belongs with the other things that must exist
              exactly once: every route group renders through this layout, and
              a cursor that stopped at a route boundary would be worse than
              none. It draws nothing until a fine pointer moves. */}
          <CustomCursor />
        </SmoothScroll>
      </body>
    </html>
  );
}
