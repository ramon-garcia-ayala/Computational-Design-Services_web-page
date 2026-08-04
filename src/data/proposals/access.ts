/**
 * Contraseñas de acceso a las propuestas.
 *
 * Nunca en texto plano: se guarda un salt aleatorio y el SHA-256 de
 * `salt + contraseña`. Generar la entrada con:
 *
 *     node scripts/proposal-password.mjs "la-contraseña"
 *
 * y pegar el resultado aquí. Un slug SIN entrada en este objeto queda abierto:
 * cualquiera con el enlace lo ve.
 *
 * No anotar la contraseña en claro en un comentario: el hash existe justamente
 * para que el repositorio no la contenga. Guardarla donde se guardan las
 * contraseñas, y compartirla con el cliente por otro canal.
 *
 * La verificación ocurre en `src/proxy.ts`, antes de servir la página —
 * comprobarla en el cliente no protegería nada, el contenido ya habría viajado.
 */
export type ProposalCredentials = { salt: string; hash: string };

export const proposalAccess: Record<string, ProposalCredentials> = {
  "05.08.2026_ecogen": {
    salt: "f5e3205310359188",
    hash: "7f84bae03c106910b9af84018aa401b2f200167ecc74bcff120ccc7808d1c45a",
  },
};

export function getProposalCredentials(
  slug: string,
): ProposalCredentials | undefined {
  return proposalAccess[slug];
}
