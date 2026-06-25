import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Computational Design Services",
  description:
    "Computational design, automation, and artificial intelligence for architecture, engineering, and construction. Grasshopper, BIM, AI Agents, and more.",
  keywords: [
    "computational design",
    "grasshopper",
    "BIM",
    "automation",
    "artificial intelligence",
    "AI agents",
    "architecture",
    "engineering",
  ],
  openGraph: {
    title: "Computational Design Services",
    description:
      "Computational design, automation, and artificial intelligence at your scale.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} scroll-smooth`}
    >
      <body className="flex min-h-screen flex-col bg-background text-text-primary antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
