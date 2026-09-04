import { ecogenPortal } from "./ecogen";
import type { PortalClient } from "./types";

export const portalClients: PortalClient[] = [ecogenPortal];

export function getPortalClient(slug: string): PortalClient | undefined {
  return portalClients.find((client) => client.slug === slug);
}

export type * from "./types";
