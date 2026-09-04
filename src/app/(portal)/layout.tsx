/* The client portal: no site navigation, same reasoning as (proposal). Each
   page mounts its own chrome so the client never leaves the panel.

   `data-site-warm` puts the panel on the same warm charcoal every other route
   already renders on. It used to sit on the default carbon deliberately — the
   note here said the portal should read as its own place, "distinct from the
   marketing site's warm mood" — and what that actually produced was a panel
   that looked like a different product from the site the client had just come
   through. What the old decision was really protecting is that a client's
   proposal and their panel read as one family, and that survives: `(proposal)`
   carries the same attribute, so the two still match each other.

   The scope redefines what the tokens *mean* rather than repainting anything:
   `bg-carbon`, `border-line`, `text-fg-muted` and `border-edge` keep their
   names throughout this route group and resolve warm. That is the whole
   mechanism `globals.css` documents for it, and it is why this is one
   attribute rather than a sweep through every portal component. */
export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main id="main" data-site-warm>
      {children}
    </main>
  );
}
