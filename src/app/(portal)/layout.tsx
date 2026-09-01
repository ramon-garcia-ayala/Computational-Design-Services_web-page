/* The client portal: no site navigation, same reasoning as (proposal). Each
   page mounts its own chrome so the client never leaves the panel. No
   `data-site-warm` / `data-site-pale` either — the portal stays on the
   default carbon ground, the same one the client's own proposal already
   renders on, deliberately distinct from the marketing site's warm mood. */
export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main id="main">{children}</main>;
}
