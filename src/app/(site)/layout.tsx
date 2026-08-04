import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/* Chrome for the public site. Client proposals live in (proposal) and carry
   their own bar, so they do not inherit this navigation. */
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
