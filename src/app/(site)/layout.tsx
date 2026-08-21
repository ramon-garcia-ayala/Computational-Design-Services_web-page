import { Header } from "@/components/layout/Header";
import { LabFooter } from "@/components/design-lab/LabFooter";

/**
 * Chrome for the public site. Client proposals live in `(proposal)` and carry
 * their own bar, so they do not inherit this navigation.
 *
 * It is Home's chrome, not a second set: the same header in its light variant
 * and the same footer, so moving from Home to a subpage changes the content
 * and nothing else. `Footer` — the original dark one — is now used only by
 * `/archive-home`, which is kept as it was on purpose.
 *
 * `data-site-light` is what `globals.css` hangs the light palette off. It
 * redefines the tokens rather than the components, so every section inside
 * renders on the warm ground without knowing a second mood exists.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-site-light>
      <Header variant="light" />
      <main id="main">{children}</main>
      <LabFooter />
    </div>
  );
}
