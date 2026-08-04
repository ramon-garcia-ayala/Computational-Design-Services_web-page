/* Proposal documents: no site navigation. Each page mounts its own header and
   footer so the client never leaves the document. */
export default function ProposalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main id="main">{children}</main>;
}
