/* Proposal documents: no site navigation. Each page mounts its own header and
   footer so the client never leaves the document.

   `data-site-warm` for the same reason `(portal)` carries it: these are the
   two surfaces a client sees, and they have to read as one family and as part
   of the site they were linked from. See that file's note for what the scope
   does to the tokens. */
export default function ProposalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main id="main" data-site-warm>
      {children}
    </main>
  );
}
