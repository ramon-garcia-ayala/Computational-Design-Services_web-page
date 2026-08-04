# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

## Comandos

```bash
npm run dev      # servidor de desarrollo en localhost:3000
npm run build    # build de producción (también corre la comprobación de TypeScript)
npm run lint     # ESLint
npm run start    # sirve el build de producción
```

No hay tests. Los errores de TypeScript salen en `npm run build`.

## Stack

- **Next.js 16.2.9** — App Router, TypeScript, todo estático (`○ Static` / `● SSG`)
- **React 19.2.4** — R3F 9 exige `react >=19 <19.3`; no subir React sin comprobar ese peer
- **Tailwind CSS v4** — configuración solo en CSS, no existe `tailwind.config.ts`
- **GSAP 3.15 + ScrollTrigger** y **`@gsap/react`** (`useGSAP`)
- **Lenis 1.3** — smooth scroll
- **React Three Fiber 9 + three 0.185** — solo en el hero, con carga diferida
- **clsx + tailwind-merge** — vía `cn()` en `src/lib/utils.ts`

## Tailwind v4: diferencia crítica

Todos los tokens viven en el bloque `@theme {}` de `src/app/globals.css`. No hay
archivo de configuración ni función `theme()`. Los colores se consumen como
utilidades directamente:

```css
@theme {
  --color-carbon: #0a0c0b;
  --color-accent: #c8f94e;
  --font-display: var(--font-sora);
}
```

Se usan como `bg-carbon`, `text-accent`, `font-display`.

**Breakpoints**: el proyecto solo tiene `sm` (640), `lg` (1024) y `xl` (1440).
Los defaults de Tailwind se borran con `--breakpoint-*: initial`, así que
`md:` y `2xl:` **no existen** y escribirlos no genera ningún estilo.

Utilidades propias definidas en `globals.css`: `.shell` (contenedor de página),
`grid-bg` (retícula de fondo) y `reveal-init` (estado inicial de lo que anima
GSAP).

## Arquitectura

Sitio multipágina con App Router:

| Ruta | Archivo |
|---|---|
| `/` | `src/app/page.tsx` |
| `/about` | `src/app/about/page.tsx` |
| `/projects` | `src/app/projects/page.tsx` |
| `/projects/[slug]` | `src/app/projects/[slug]/page.tsx` (`generateStaticParams`) |
| `/labs` | `src/app/labs/page.tsx` (placeholder) |

**Capa de datos** (`src/data/`) contiene todo el copy y todas las cifras. Nunca
hardcodear texto en un componente. Ver la tabla del `README.md`.

**Añadir un proyecto**: basta con añadir una entrada a `projects` en
`src/data/projects.ts`. El grid, la ruta estática, el detalle con scroll
horizontal y la navegación al siguiente proyecto salen de ahí. `featured: true`
lo saca además en el home.

## Convenciones de animación

- **Registro de GSAP**: importar siempre `gsap`, `ScrollTrigger` y `useGSAP`
  desde `src/lib/gsap.ts`. Registrar el plugin en más de un sitio duplica
  instancias y deja ScrollTriggers sin limpiar.
- **Entrada de sección**: usar el componente `Reveal` (`src/components/ui/Reveal.tsx`),
  que es la única forma de animar apariciones en el sitio. Con la prop `stagger`
  escalona hijos; en ese caso los hijos llevan la clase `reveal-init` y el
  contenedor no.
- **Siempre `useGSAP` con `{ scope: ref }`**, nunca `useEffect` a pelo: el scope
  limpia los tweens en unmount y sobrevive al doble render de StrictMode.
- **Lenis** se instancia una sola vez en `src/components/providers/SmoothScroll.tsx`
  y se conduce desde el ticker de GSAP. No crear otra instancia ni otro `raf`.
- **Breakpoints en JS**: usar `gsap.matchMedia()` (ver `HorizontalScroll.tsx`),
  no listeners de resize.

## prefers-reduced-motion

`src/lib/useReducedMotion.ts` es la única fuente de verdad. Cuando devuelve
`true`:

1. Lenis no se instancia y el scroll vuelve a ser nativo
2. Los tweens se sustituyen por el estado final, sin `scrub` ni `pin`
3. La escena R3F del hero no se monta

Además `globals.css` tiene el bloque `@media (prefers-reduced-motion: reduce)`
para lo que se anima por CSS. **Cualquier animación nueva debe pasar por este
hook o por ese bloque.**

**Trampa de hidratación**: en el render de hidratación el hook devuelve `false`
(el servidor no conoce la preferencia), así que el primer efecto puede ejecutarse
como si no hubiera reducción y luego revertirse. Dos consecuencias prácticas:

- Si un efecto **modifica el DOM** (escribir un `textContent`, crear un `pin`),
  la rama de reduced motion debe **restaurar el estado final explícitamente**,
  no limitarse a un `return` temprano. Ver `StatItem.tsx`.
- Para animaciones caras de revertir, como el `pin`, se pone la preferencia
  dentro de la propia condición de `gsap.matchMedia`
  (`"... and (prefers-reduced-motion: no-preference)"`), que se evalúa en el
  momento del efecto y nunca llega a crearla. Ver `HorizontalScroll.tsx`.

## Hero y LCP

`src/components/sections/home/Hero.tsx` es un Server Component: tagline, subcopy
y el hueco del chat viajan ya renderizados en el HTML.

- `ChatPlaceholder` (`src/components/ui/ChatPlaceholder.tsx`) está
  **deliberadamente vacío**. Reserva altura y posición para el chatbot de Fase 2.
  Al implementarlo, mantener las dimensiones del contenedor para no mover el LCP.
- `HeroCanvas` importa la escena con `dynamic(..., { ssr: false })` y la monta en
  `requestIdleCallback`, después del primer paint. Así `three` queda fuera del
  bundle inicial. No convertirlo en import estático.
- `HeroScene` debe seguir siendo barata: una geometría, material básico, sin
  luces ni post-procesado, `dpr` limitado a 1.5.

## Scroll horizontal

`src/components/sections/project/HorizontalScroll.tsx` fija la sección (pin) y
desplaza la fila de paneles en X con `scrub`. Por debajo de 1024px o con reduced
motion los paneles se apilan en vertical y no se crea ningún ScrollTrigger.

## Grabación de GIF (verificación visual)

1. Tener el servidor corriendo (`npm run dev`).
2. Cargar el schema con `ToolSearch select:mcp__claude-in-chrome__gif_creator`.
3. Capturar frames extra antes y después de cada acción.
4. Nombrar el archivo de forma descriptiva (`hero_and_menu.gif`,
   `project_horizontal_scroll.gif`).
