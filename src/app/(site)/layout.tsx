import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/* Chrome del sitio público. Las propuestas de cliente viven en (proposal) y
   llevan su propia barra, así que no heredan esta navegación. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
