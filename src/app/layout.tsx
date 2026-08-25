import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/data/site";

/* Fonts exposed as CSS variables and consumed from the @theme in globals.css */
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

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
  metadataBase: new URL(site.origin),
  title: {
    default: `${site.nameFlat} · ${site.tagline}`,
    template: `%s · ${site.nameFlat}`,
  },
  description: site.subcopy,
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
       `--font-display: var(--font-sora)` is substituted *there*. next/font's
       classes were on <body>, one level below — and a `var()` on :root cannot
       see a variable defined on a descendant. Every font token was therefore
       invalid at computed-value time and silently fell back: measured, `h1`
       and `body` alike were resolving to the system stack, so Sora, Inter and
       JetBrains never actually rendered anywhere on the site. Moving the
       classes up one element is the whole fix. */
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased">
        <SmoothScroll>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-60 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-carbon"
          >
            Skip to content
          </a>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
