import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
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
    <html lang="en">
      <body
        className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
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
