export type Client = {
  id: string;
  /** Name shown in the grey placeholder until the real SVG is available. */
  name: string;
  /** Logo path under /public once it exists. If missing, the placeholder is drawn. */
  logo?: string;
};

/**
 * Client logo strip. While `logo` is empty, `LogoPlaceholder` draws a grey
 * block with the name, without depending on any external asset.
 */
export const clients: Client[] = [
  { id: "client-1", name: "Nordhaus" },
  { id: "client-2", name: "Beton Group" },
  { id: "client-3", name: "Arcadia AEC" },
  { id: "client-4", name: "Vector Civil" },
  { id: "client-5", name: "Meridian" },
  { id: "client-6", name: "Solaris Eng" },
];
