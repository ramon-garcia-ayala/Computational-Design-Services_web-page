export type Client = {
  id: string;
  /** Nombre mostrado en el placeholder gris hasta tener el SVG real. */
  name: string;
  /** Ruta del logo en /public cuando exista. Si falta, se dibuja el placeholder. */
  logo?: string;
};

/**
 * Banda de logos de cliente. Mientras `logo` esté vacío, `LogoPlaceholder`
 * dibuja un bloque gris con el nombre, sin depender de ningún asset externo.
 */
export const clients: Client[] = [
  { id: "client-1", name: "Nordhaus" },
  { id: "client-2", name: "Beton Group" },
  { id: "client-3", name: "Arcadia AEC" },
  { id: "client-4", name: "Vector Civil" },
  { id: "client-5", name: "Meridian" },
  { id: "client-6", name: "Solaris Eng" },
];
