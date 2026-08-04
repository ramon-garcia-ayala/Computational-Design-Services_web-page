/* Documentos de propuesta: sin navegación del sitio. Cada página monta su
   propia cabecera y pie para que el cliente no se salga del documento. */
export default function ProposalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main id="main">{children}</main>;
}
