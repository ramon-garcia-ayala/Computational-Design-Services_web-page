"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * Punto único de registro de plugins de GSAP.
 *
 * Importar SIEMPRE `gsap` y `ScrollTrigger` desde aquí, nunca desde el paquete
 * directamente: registrar el plugin en varios sitios provoca instancias
 * duplicadas y ScrollTriggers que no se limpian.
 *
 * `useGSAP` se reexporta por comodidad. Úsalo con `{ scope: ref }` para que la
 * limpieza sea automática en unmount y en el doble render de StrictMode.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export { gsap, ScrollTrigger, useGSAP };
