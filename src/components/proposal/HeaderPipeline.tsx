"use client";

/**
 * HeaderPipeline — diagrama animado de encabezado (reemplaza el GIF estatico).
 *
 * Recorre en bucle las etapas de la tuberia de automatizacion, una a la vez:
 *   2D  ->  UI-Plugin  ->  BIM 3D  ->  Metadata  ->  Cost Estimate  ->  Schedule
 *
 * Cada etapa tiene su propio dibujo/diagrama SVG que se "construye" al activarse.
 * Abajo, una tira-guion (storyboard) marca el paso activo con un barrido luminoso.
 *
 * Estetica alineada con el sitio: fondo #09090b, acento indigo #6366f1,
 * azul #60a5fa (input), esmeralda #34d399 (output), mas cyan/amber por etapa.
 */

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import type { HeaderStage } from "@/data/proposals/types";

// ---- paleta (hex crudos para SVG) ----
const C = {
  bg: "#09090b",
  panel: "#101014",
  surface: "#18181b",
  border: "#27272a",
  borderHi: "#3f3f46",
  accent: "#6366f1",
  accentHi: "#818cf8",
  blue: "#60a5fa",
  emerald: "#34d399",
  cyan: "#22d3ee",
  amber: "#f59e0b",
  sec: "#a1a1aa",
  muted: "#71717a",
  ink: "#fafafa",
};

// color tematico por etapa (el dibujo); el rol decide la etiqueta INPUT/PROCESS/OUTPUT
const KIND_COLOR: Record<HeaderStage["kind"], string> = {
  plan2d: C.blue,
  plugin: C.accent,
  bim3d: C.accentHi,
  metadata: C.cyan,
  cost: C.amber,
  schedule: C.emerald,
};

const ROLE_TAG: Record<HeaderStage["role"], string> = {
  input: "INPUT",
  process: "PROCESS",
  output: "OUTPUT",
};

const VB_W = 800;
const VB_H = 440;
const CYCLE_MS = 2600;

// ----------------------------------------------------------------------------
// Variants compartidas
// ----------------------------------------------------------------------------
const stageVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.07, delayChildren: 0.08 },
  },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
};

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.78 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// fade + leve ascenso: seguro para <g> (translate no depende de transform-box)
const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// crece desde un origen (para barras / extrusiones)
const growX: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: { duration: 0.55, ease: "easeOut" } },
};
const growY: Variants = {
  hidden: { scaleY: 0, opacity: 0.2 },
  show: { scaleY: 1, opacity: 1, transition: { duration: 0.55, ease: "easeOut" } },
};

// ----------------------------------------------------------------------------
// Proyeccion isometrica (para BIM 3D y Metadata)
// ----------------------------------------------------------------------------
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;
function iso(x: number, y: number, z: number, s: number, cx: number, cy: number) {
  return {
    x: (x - y) * COS30 * s + cx,
    y: (x + y) * SIN30 * s - z * s + cy,
  };
}

/** Una caja extruida en isometria (cara izq, der, top + aristas). */
function IsoBox({
  ox,
  oy,
  s,
  cx,
  cy,
  w,
  d,
  h,
  color,
  variant = rise,
}: {
  ox: number;
  oy: number;
  s: number;
  cx: number;
  cy: number;
  w: number;
  d: number;
  h: number;
  color: string;
  variant?: Variants;
}) {
  // nota: animamos el grupo con opacity+translate (variant `rise`), nunca scale,
  // porque transform-box: fill-box sobre un <g> colapsa el grupo en algunos motores.
  const b = [
    iso(ox, oy, 0, s, cx, cy),
    iso(ox + w, oy, 0, s, cx, cy),
    iso(ox + w, oy + d, 0, s, cx, cy),
    iso(ox, oy + d, 0, s, cx, cy),
  ];
  const t = [
    iso(ox, oy, h, s, cx, cy),
    iso(ox + w, oy, h, s, cx, cy),
    iso(ox + w, oy + d, h, s, cx, cy),
    iso(ox, oy + d, h, s, cx, cy),
  ];
  const pts = (arr: { x: number; y: number }[]) => arr.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <motion.g variants={variant}>
      {/* cara izquierda */}
      <polygon points={pts([b[3], b[0], t[0], t[3]])} fill={color} opacity={0.18} />
      {/* cara frontal-derecha */}
      <polygon points={pts([b[1], b[2], t[2], t[1]])} fill={color} opacity={0.32} />
      <polygon points={pts([b[2], b[3], t[3], t[2]])} fill={color} opacity={0.24} />
      {/* top */}
      <polygon points={pts(t)} fill={color} opacity={0.5} />
      {/* aristas top */}
      <polyline
        points={pts([t[0], t[1], t[2], t[3], t[0]])}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
      />
      {/* verticales */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={b[i].x} y1={b[i].y} x2={t[i].x} y2={t[i].y} stroke={color} strokeWidth={1.2} opacity={0.7} />
      ))}
    </motion.g>
  );
}

// ----------------------------------------------------------------------------
// Diagramas por etapa
// ----------------------------------------------------------------------------
function Diagram({ kind, color }: { kind: HeaderStage["kind"]; color: string }) {
  switch (kind) {
    case "plan2d":
      return <Plan2D color={color} />;
    case "plugin":
      return <Plugin color={color} />;
    case "bim3d":
      return <Bim3D color={color} />;
    case "metadata":
      return <Metadata color={color} />;
    case "cost":
      return <Cost color={color} />;
    case "schedule":
      return <Schedule color={color} />;
  }
}

// --- 1. Plano 2D (vista cenital + footprints) ---
function Plan2D({ color }: { color: string }) {
  const x0 = 232;
  const y0 = 118;
  const cols = 4;
  const rows = 3;
  const cw = 78;
  const ch = 34;
  const gx = 16;
  const gy = 20;
  const plotW = cols * cw + (cols - 1) * gx;
  const plotH = rows * ch + (rows - 1) * gy;
  return (
    <>
      {/* marco del plot + grid azul tenue */}
      <motion.rect
        variants={fadeUp}
        x={x0 - 22}
        y={y0 - 22}
        width={plotW + 44}
        height={plotH + 44}
        rx={6}
        fill={C.panel}
        stroke={C.border}
      />
      {[1, 2, 3, 4].map((i) => (
        <motion.line
          key={`v${i}`}
          variants={fadeUp}
          x1={x0 - 22 + ((plotW + 44) / 5) * i}
          y1={y0 - 22}
          x2={x0 - 22 + ((plotW + 44) / 5) * i}
          y2={y0 + plotH + 22}
          stroke={color}
          strokeWidth={0.6}
          opacity={0.14}
        />
      ))}
      {/* footprints */}
      {Array.from({ length: rows * cols }).map((_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        return (
          <motion.rect
            key={i}
            variants={pop}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            x={x0 + c * (cw + gx)}
            y={y0 + r * (ch + gy)}
            width={cw}
            height={ch}
            rx={3}
            fill={color}
            fillOpacity={0.12}
            stroke={color}
            strokeWidth={1.4}
          />
        );
      })}
      {/* cota superior */}
      <motion.g variants={fadeUp} stroke={C.muted} strokeWidth={1}>
        <line x1={x0} y1={y0 - 34} x2={x0 + plotW} y2={y0 - 34} />
        <line x1={x0} y1={y0 - 39} x2={x0} y2={y0 - 29} />
        <line x1={x0 + plotW} y1={y0 - 39} x2={x0 + plotW} y2={y0 - 29} />
      </motion.g>
      {/* rosa de los vientos */}
      <motion.g variants={pop}>
        <circle cx={x0 + plotW + 4} cy={y0 + plotH + 8} r={11} fill="none" stroke={C.muted} strokeWidth={1} />
        <polygon
          points={`${x0 + plotW + 4},${y0 + plotH - 1} ${x0 + plotW + 1},${y0 + plotH + 10} ${x0 + plotW + 7},${y0 + plotH + 10}`}
          fill={color}
        />
        <text x={x0 + plotW + 4} y={y0 + plotH + 26} fill={C.muted} fontSize={9} textAnchor="middle" fontFamily="monospace">
          N
        </text>
      </motion.g>
    </>
  );
}

// --- 2. UI Plugin (ventana de herramienta pyRevit) ---
function Plugin({ color }: { color: string }) {
  const wx = 250;
  const wy = 96;
  const ww = 300;
  const wh = 212;
  const rows = ["MODULE TYPE", "ROWS / COLS", "SPACING", "ELEVATION"];
  return (
    <>
      <motion.rect variants={pop} x={wx} y={wy} width={ww} height={wh} rx={8} fill={C.surface} stroke={C.borderHi} />
      {/* title bar */}
      <motion.g variants={fadeUp}>
        <rect x={wx} y={wy} width={ww} height={26} rx={8} fill={C.panel} />
        <rect x={wx} y={wy + 18} width={ww} height={8} fill={C.panel} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={wx + 16 + i * 14} cy={wy + 13} r={3.5} fill={i === 2 ? color : C.borderHi} />
        ))}
        <text x={wx + ww - 14} y={wy + 17} fill={C.sec} fontSize={9} textAnchor="end" fontFamily="monospace">
          pyRevit · BESS
        </text>
      </motion.g>
      {/* filas de parametros */}
      {rows.map((label, i) => (
        <motion.g key={label} variants={fadeUp}>
          <text x={wx + 18} y={wy + 56 + i * 30} fill={C.sec} fontSize={9.5} fontFamily="monospace">
            {label}
          </text>
          <rect
            x={wx + 150}
            y={wy + 45 + i * 30}
            width={132}
            height={17}
            rx={3}
            fill={C.panel}
            stroke={C.border}
          />
          <rect x={wx + 155} y={wy + 49 + i * 30} width={28 + i * 18} height={9} rx={2} fill={color} opacity={0.55} />
        </motion.g>
      ))}
      {/* boton RUN con pulso */}
      <motion.g variants={pop}>
        <motion.rect
          x={wx + 18}
          y={wy + wh - 38}
          width={ww - 36}
          height={26}
          rx={5}
          fill={color}
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <text
          x={wx + ww / 2}
          y={wy + wh - 21}
          fill={C.bg}
          fontSize={11}
          fontWeight={700}
          textAnchor="middle"
          fontFamily="monospace"
          letterSpacing={2}
        >
          RUN
        </text>
      </motion.g>
      {/* cursor que hace click */}
      <motion.g
        variants={pop}
        initial={false}
        animate={{ y: [0, -3, 0], x: [0, 0, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <polygon
          points={`${wx + ww / 2 + 24},${wy + wh - 20} ${wx + ww / 2 + 24},${wy + wh - 4} ${wx + ww / 2 + 28},${wy + wh - 9} ${wx + ww / 2 + 34},${wy + wh - 9}`}
          fill={C.ink}
          stroke={C.bg}
          strokeWidth={0.8}
        />
      </motion.g>
    </>
  );
}

// --- 3. BIM 3D (extrusion isometrica) ---
function Bim3D({ color }: { color: string }) {
  const s = 30;
  const cx = 400;
  const cy = 250;
  const cols = 4;
  const rows = 3;
  const step = 1.42;
  const off = -((Math.max(cols, rows) - 1) * step) / 2;
  // pintar de atras hacia delante
  const cells: { c: number; r: number }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ c, r });
  cells.sort((a, b) => a.c + a.r - (b.c + b.r));
  return (
    <>
      {/* suelo blueprint */}
      <motion.g variants={fadeUp} opacity={0.5}>
        {Array.from({ length: rows + 2 }).map((_, i) => {
          const yy = off - step + i * step;
          const p0 = iso(off - step, yy, 0, s, cx, cy);
          const p1 = iso(off + cols * step, yy, 0, s, cx, cy);
          return <line key={`a${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={color} strokeWidth={0.6} opacity={0.3} />;
        })}
        {Array.from({ length: cols + 2 }).map((_, i) => {
          const xx = off - step + i * step;
          const p0 = iso(xx, off - step, 0, s, cx, cy);
          const p1 = iso(xx, off + rows * step, 0, s, cx, cy);
          return <line key={`b${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={color} strokeWidth={0.6} opacity={0.3} />;
        })}
      </motion.g>
      {cells.map(({ c, r }) => (
        <IsoBox
          key={`${c}-${r}`}
          ox={off + c * step}
          oy={off + r * step}
          s={s}
          cx={cx}
          cy={cy}
          w={1.05}
          d={1.05}
          h={0.95}
          color={color}
          variant={rise}
        />
      ))}
    </>
  );
}

// --- 4. Metadata (modelo + panel de propiedades) ---
function Metadata({ color }: { color: string }) {
  const s = 34;
  const mcx = 280;
  const mcy = 250;
  const props: [string, string][] = [
    ["TYPE", "Capsule-A"],
    ["QTY", "12 units"],
    ["CAPACITY", "3.2 MWh"],
    ["VOLTAGE", "1500 V"],
    ["FAMILY", "BESS_Mod"],
  ];
  const px = 458;
  const py = 116;
  const pw = 250;
  const ph = 196;
  return (
    <>
      {/* cubo modelo */}
      <IsoBox ox={-0.7} oy={-0.7} s={s} cx={mcx} cy={mcy} w={1.4} d={1.4} h={1.3} color={color} variant={rise} />
      {/* linea guia hacia el panel */}
      <motion.line variants={fadeUp} x1={mcx + 40} y1={mcy - 36} x2={px} y2={py + 30} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
      <motion.circle variants={pop} cx={mcx + 40} cy={mcy - 36} r={3} fill={color} />
      {/* panel propiedades */}
      <motion.rect variants={pop} x={px} y={py} width={pw} height={ph} rx={6} fill={C.surface} stroke={C.border} />
      <motion.g variants={fadeUp}>
        <rect x={px} y={py} width={pw} height={24} rx={6} fill={C.panel} />
        <rect x={px} y={py + 16} width={pw} height={8} fill={C.panel} />
        <text x={px + 12} y={py + 16} fill={color} fontSize={9.5} fontFamily="monospace" letterSpacing={1.5}>
          PROPERTIES
        </text>
      </motion.g>
      {props.map(([k, v], i) => (
        <motion.g key={k} variants={fadeUp}>
          <text x={px + 12} y={py + 46 + i * 28} fill={C.muted} fontSize={9.5} fontFamily="monospace">
            {k}
          </text>
          <text x={px + pw - 12} y={py + 46 + i * 28} fill={C.ink} fontSize={9.5} fontFamily="monospace" textAnchor="end">
            {v}
          </text>
          <line x1={px + 12} y1={py + 52 + i * 28} x2={px + pw - 12} y2={py + 52 + i * 28} stroke={C.border} strokeWidth={0.6} />
        </motion.g>
      ))}
    </>
  );
}

// --- 5. Cost Estimate (lineas + barras + total) ---
function Cost({ color }: { color: string }) {
  const items: [string, string, number][] = [
    ["Revit families", "4,500", 0.62],
    ["Placement engine", "5,250", 0.74],
    ["Automation + QA", "5,250", 0.74],
  ];
  const lx = 210;
  const ly = 120;
  const barX = 470;
  const barTop = 128;
  const barMaxH = 120;
  const barBase = barTop + barMaxH;
  return (
    <>
      {/* hoja de costos */}
      <motion.rect variants={pop} x={lx - 22} y={ly - 22} width={250} height={188} rx={6} fill={C.surface} stroke={C.border} />
      <motion.text variants={fadeUp} x={lx - 8} y={ly} fill={color} fontSize={9.5} fontFamily="monospace" letterSpacing={1.5}>
        COST BREAKDOWN
      </motion.text>
      {items.map(([label, amt], i) => (
        <motion.g key={label} variants={fadeUp}>
          <text x={lx - 8} y={ly + 28 + i * 26} fill={C.sec} fontSize={10} fontFamily="monospace">
            {label}
          </text>
          <text x={lx + 200} y={ly + 28 + i * 26} fill={C.ink} fontSize={10} fontFamily="monospace" textAnchor="end">
            ${amt}
          </text>
        </motion.g>
      ))}
      <motion.g variants={fadeUp}>
        <line x1={lx - 8} y1={ly + 116} x2={lx + 200} y2={ly + 116} stroke={C.borderHi} strokeWidth={1} />
        <text x={lx - 8} y={ly + 138} fill={C.muted} fontSize={9} fontFamily="monospace">
          TOTAL
        </text>
        <text x={lx + 200} y={ly + 138} fill={color} fontSize={15} fontWeight={700} fontFamily="monospace" textAnchor="end">
          USD 15,000
        </text>
      </motion.g>
      {/* barras */}
      {items.map(([, , frac], i) => (
        <motion.rect
          key={i}
          variants={growY}
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          x={barX + i * 56}
          y={barBase - barMaxH * frac}
          width={36}
          height={barMaxH * frac}
          rx={3}
          fill={color}
          opacity={0.8}
        />
      ))}
      <motion.line variants={fadeUp} x1={barX - 10} y1={barBase} x2={barX + 3 * 56} y2={barBase} stroke={C.borderHi} strokeWidth={1} />
    </>
  );
}

// --- 6. Schedule (gantt) ---
function Schedule({ color }: { color: string }) {
  const gx = 250;
  const gy = 120;
  const gw = 320;
  const weeks = 12;
  const colW = gw / weeks;
  const bars: [string, number, number, string][] = [
    ["Phase 01", 0, 3, C.blue],
    ["Phase 02", 3, 8, C.accent],
    ["Phase 03", 8, 12, C.emerald],
  ];
  const rowH = 34;
  return (
    <>
      {/* columnas de semanas */}
      <motion.g variants={fadeUp}>
        {Array.from({ length: weeks + 1 }).map((_, i) => (
          <line
            key={i}
            x1={gx + i * colW}
            y1={gy}
            x2={gx + i * colW}
            y2={gy + bars.length * rowH + 6}
            stroke={C.border}
            strokeWidth={i % 3 === 0 ? 0.9 : 0.5}
            opacity={i % 3 === 0 ? 0.8 : 0.4}
          />
        ))}
        {[0, 3, 6, 9, 12].map((w) => (
          <text key={w} x={gx + w * colW} y={gy - 8} fill={C.muted} fontSize={8.5} textAnchor="middle" fontFamily="monospace">
            W{w}
          </text>
        ))}
      </motion.g>
      {/* barras */}
      {bars.map(([label, start, end, col], i) => (
        <motion.g key={label}>
          <text x={gx - 12} y={gy + i * rowH + 21} fill={C.sec} fontSize={9.5} textAnchor="end" fontFamily="monospace">
            {label}
          </text>
          <motion.rect
            variants={growX}
            style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}
            x={gx + start * colW + 2}
            y={gy + i * rowH + 8}
            width={(end - start) * colW - 4}
            height={16}
            rx={4}
            fill={col}
            opacity={0.85}
          />
        </motion.g>
      ))}
      {/* marcador NOW */}
      <motion.g variants={pop}>
        <line x1={gx + 3 * colW} y1={gy - 4} x2={gx + 3 * colW} y2={gy + bars.length * rowH + 8} stroke={color} strokeWidth={1.4} />
        <polygon
          points={`${gx + 3 * colW - 4},${gy - 4} ${gx + 3 * colW + 4},${gy - 4} ${gx + 3 * colW},${gy + 2}`}
          fill={color}
        />
      </motion.g>
    </>
  );
}

// ----------------------------------------------------------------------------
// Tira-guion (storyboard) inferior con barrido
// ----------------------------------------------------------------------------
function Strip({ stages, active }: { stages: HeaderStage[]; active: number }) {
  const n = stages.length;
  const x0 = 80;
  const x1 = 720;
  const y = 404;
  const xs = stages.map((_, i) => x0 + (i * (x1 - x0)) / (n - 1));
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.border} strokeWidth={1.5} />
      {/* progreso recorrido */}
      <motion.line
        x1={x0}
        y1={y}
        x2={x1}
        y2={y}
        stroke={KIND_COLOR[stages[active].kind]}
        strokeWidth={1.5}
        initial={false}
        animate={{ pathLength: n === 1 ? 1 : active / (n - 1) }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {stages.map((st, i) => {
        const on = i === active;
        const col = KIND_COLOR[st.kind];
        return (
          <g key={st.label}>
            {on && (
              <motion.circle
                cx={xs[i]}
                cy={y}
                r={12}
                fill={col}
                initial={{ opacity: 0.35, scale: 0.6 }}
                animate={{ opacity: [0.3, 0.12, 0.3], scale: [1, 1.5, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <rect
              x={xs[i] - 5}
              y={y - 5}
              width={10}
              height={10}
              rx={2}
              fill={on ? col : C.bg}
              stroke={on ? col : C.borderHi}
              strokeWidth={1.4}
            />
            <text
              x={xs[i]}
              y={y + 22}
              fill={on ? col : C.muted}
              fontSize={9}
              fontWeight={on ? 700 : 400}
              textAnchor="middle"
              fontFamily="monospace"
              letterSpacing={0.5}
            >
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ----------------------------------------------------------------------------
// Componente principal
// ----------------------------------------------------------------------------
export function HeaderPipeline({ stages }: { stages: HeaderStage[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    if (reduce || stages.length <= 1) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setActive((a) => (a + 1) % stages.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce, stages.length]);

  const st = stages[active];
  const color = KIND_COLOR[st.kind];

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full h-auto block"
      role="img"
      aria-label={`Automation pipeline: ${stages.map((s) => s.label).join(" to ")}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <rect x={0} y={0} width={VB_W} height={VB_H} fill={C.bg} />

      {/* total de pasos — estático, no anima */}
      <text x={VB_W - 12} y={47} fill={C.borderHi} fontSize={13} fontFamily="monospace" textAnchor="end" letterSpacing={1}>
        / {String(stages.length).padStart(2, "0")}
      </text>

      {/* label + counter + diagrama en un único AP → siempre sincronizados */}
      <AnimatePresence mode="wait">
        <motion.g
          key={`stage-${active}`}
          variants={stageVars}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {/* etiqueta (izquierda) */}
          <motion.g variants={fadeUp}>
            <circle cx={46} cy={42} r={5} fill={color} />
            <text x={60} y={47} fill={color} fontSize={15} fontWeight={700} fontFamily="monospace" letterSpacing={1.5}>
              {st.label.toUpperCase()}
            </text>
            <text x={46} y={68} fill={C.muted} fontSize={10} fontFamily="monospace" letterSpacing={1}>
              {ROLE_TAG[st.role]} · {st.sublabel}
            </text>
          </motion.g>
          {/* counter (derecha) — dentro del AP para sincronizar con label y diagrama */}
          <motion.text
            variants={fadeUp}
            x={VB_W - 52}
            y={47}
            fill={C.muted}
            fontSize={13}
            fontFamily="monospace"
            textAnchor="end"
            letterSpacing={1}
          >
            {String(active + 1).padStart(2, "0")}
          </motion.text>
          {/* diagrama */}
          <Diagram kind={st.kind} color={color} />
        </motion.g>
      </AnimatePresence>

      {/* storyboard inferior */}
      <Strip stages={stages} active={active} />
    </svg>
  );
}
