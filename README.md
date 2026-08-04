# R²ch-Tech

Sitio del estudio de automatización computacional para AEC.

> **Fase 1.** Estructura, layout, animación y contenido de ejemplo. El chatbot
> conversacional del hero es Fase 2: aquí solo está reservado su espacio.

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (incluye la comprobación de TypeScript)
npm run lint     # ESLint
npm run start    # sirve el build de producción
```

No hay tests. Los errores de TypeScript aparecen al hacer `npm run build`.

## Stack

| Pieza | Versión | Para qué |
|---|---|---|
| Next.js | 16.2.9 | App Router, todo estático |
| React | 19.2.4 | |
| Tailwind CSS | v4 | tokens en `@theme`, sin `tailwind.config.ts` |
| GSAP + ScrollTrigger | 3.15 | animación de scroll |
| `@gsap/react` | 2.1 | `useGSAP`, limpieza automática |
| Lenis | 1.3 | smooth scroll |
| React Three Fiber + three | 9.7 / 0.185 | capa decorativa del hero, carga diferida |

Sobre la versión de Next: el encargo pedía Next 14, pero Node 25 en esta máquina
devuelve `EISDIR` en `fs.readlink` sobre archivos normales y Next 15.5 no lo
maneja, así que el build fallaba antes de empezar. Next 16 sí lo tolera. Tailwind
v4, GSAP, Lenis y R3F funcionan igual en cualquiera de las dos.

## Dónde se edita el contenido

Ningún componente lleva copy ni cifras dentro. Todo vive en `src/data/`:

| Archivo | Contenido |
|---|---|
| `site.ts` | nombre, tagline, subcopy, **email de contacto**, redes |
| `nav.ts` | enlaces del menú y de Labs |
| `stats.ts` | las 5 métricas del home |
| `projects.ts` | proyectos, y los paneles del scroll horizontal de cada uno |
| `clients.ts` | logos de cliente |
| `approach.ts` | manifiesto del home y pasos de metodología |
| `expertise.ts` | áreas de expertise (acordeón / tabs) |
| `awards.ts` | reconocimientos y métricas de estudio |

**Pendientes marcados en el código:**

- `site.contactEmail` es un placeholder (`hello@r2ch.tech`). Cambiarlo actualiza
  a la vez el header, el menú, el CTA final y el footer.
- Las cifras de `stats.ts` y `awards.ts` son de ejemplo.
- Los logos de `clients.ts` se pintan como bloque gris hasta que se rellene el
  campo `logo` con la ruta del SVG en `/public`.
- El formulario de newsletter del menú es solo UI, sin backend.
- La pista de audio del botón de música está desactivada (`AUDIO_SRC = null` en
  `src/components/layout/MusicToggle.tsx`).

## Documentación

`CLAUDE.md` recoge las convenciones del proyecto: tokens de diseño, patrón de
animación, cómo añadir un proyecto y cómo se respeta `prefers-reduced-motion`.
