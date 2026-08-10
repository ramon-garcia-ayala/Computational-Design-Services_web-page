/**
 * A span, sized against a load.
 *
 * **This is not a finite element solver, and the copy never claims it is.**
 * It is closed-form simply-supported behaviour — the equations an engineer
 * checks a scheme against in thirty seconds before anyone opens a model — with
 * a per-system efficiency factor standing in for how differently a beam, a
 * truss and an arch use the same depth. That is enough to be *right about the
 * trends*: doubling the load doubles the stress, halving the depth quadruples
 * the deflection, and a truss beats a beam at the same depth. Those trends are
 * what the visitor is here to feel. Precise numbers for their actual project
 * are what the enquiry at the bottom of the page is for.
 *
 * Being honest about that is not modesty, it is the product: an engineer who
 * catches us implying FEM stops believing the rest of the site.
 */

import type { StructureParams, StructureSystem } from "../schema/spec";

/** Tributary width per frame, metres. Fixed so `load` stays the only demand. */
const BAY_SPACING = 6;

/** Steel: Young's modulus and an allowable stress, both kN/m². */
const E = 210e6;
const SIGMA_ALLOW = 275e3;

/** Serviceability: the deflection limit the readout is judged against. */
export const DEFLECTION_LIMIT = 250;

/**
 * Area of one chord, m². Around a 250 square hollow section, which is what a
 * 20-something-metre span actually gets built with.
 *
 * The section is modelled as two chords separated by the depth, rather than as
 * a solid rectangle. That is not a simplification of a truss, it *is* a truss —
 * and it is also close enough to a plate girder, whose flanges do the same job.
 * The first version here used a solid rectangle of depth × depth/8, which at
 * 1.4 m deep is an enormous plate and put every default configuration at five
 * percent utilisation: the colour ramp never moved, so the one output the tool
 * exists to show said nothing.
 */
const CHORD_AREA = 0.012;

/** Stations along the span. Enough for a smooth curve, few enough to be cheap. */
const STATIONS = 24;

/** Truss panels, and therefore the number of web diagonals per frame. */
const PANELS = 8;

/** Arch rise as a fraction of the span. A shallower arch is just a bent beam. */
const ARCH_RISE = 0.2;

/**
 * What each system does with the same depth, taking the truss as the unit. A
 * solid web puts material where bending needs it least; an arch turns most of
 * the bending into thrust and barely uses the section in flexure at all.
 *
 * Rounded numbers on purpose — they are a stand-in for a real analysis, and a
 * figure like 2.63 would imply one nobody ran. What they have to get right is
 * the ordering and roughly the gaps, because the visitor's takeaway is "the
 * truss halves my utilisation", not the second decimal.
 */
const EFFICIENCY: Record<StructureSystem, number> = {
  beam: 0.65,
  truss: 1,
  arch: 2.6,
};

/**
 * Deflection is drawn larger than it is, because at L/800 the honest curve is
 * a straight line and the tool would appear broken. The factor is fixed rather
 * than normalised per case: normalising would make every configuration sag by
 * the same amount on screen and destroy the one comparison the tool exists to
 * make. The true figure goes to the legend unexaggerated.
 */
const EXAGGERATION = 25;

export type Member = {
  a: { x: number; y: number; z: number };
  b: { x: number; y: number; z: number };
  /** 0 to 1 and beyond; past 1 the section is overstressed. */
  utilisation: number;
  thickness: number;
};

export type StructureResult = {
  members: Member[];
  /** True mid-span deflection, metres. */
  deflection: number;
  /** Span over deflection, the number specifications are written in. */
  ratio: number;
  /** Peak stress over allowable. */
  utilisation: number;
  passesDeflection: boolean;
  /** Structural depth as a fraction of span, the other rule of thumb. */
  depthRatio: number;
  extent: number;
};

/**
 * Stiffness and strength of the assumed section, adjusted for the system.
 *
 * Two chords of `CHORD_AREA` at ±depth/2 give `I = A·d²/2`, and dividing by
 * the extreme fibre leaves a section modulus of `A·d`. Both scale with depth,
 * but the inertia scales with its square — which is why the deflection reacts
 * to the depth slider so much faster than the stress does, and why that is
 * the first thing the preset tells the visitor to try.
 */
function section(params: StructureParams): { inertia: number; modulus: number } {
  const efficiency = EFFICIENCY[params.system];
  return {
    inertia: ((CHORD_AREA * params.depth ** 2) / 2) * efficiency,
    modulus: CHORD_AREA * params.depth * efficiency,
  };
}

/** Normalised bending demand along the span: parabolic, zero at the supports. */
function momentShape(t: number): number {
  return 4 * t * (1 - t);
}

export function analyse(params: StructureParams): StructureResult {
  const span = params.span;
  const load = params.load * BAY_SPACING;
  const { inertia, modulus } = section(params);

  const deflection = (5 * load * span ** 4) / (384 * E * inertia);
  const moment = (load * span ** 2) / 8;
  const utilisation = moment / modulus / SIGMA_ALLOW;

  const bays = Math.max(1, Math.round(params.bays));
  const arch = params.system === "arch";
  const rise = arch ? span * ARCH_RISE : 0;

  /* Clamped so a deliberately hopeless case bends rather than folds in half.
     An over-limit span should look alarming, not like a rendering fault. */
  const sag = Math.min(span * 0.22, deflection * EXAGGERATION);

  const members: Member[] = [];
  const halfSpan = span / 2;
  const halfWidth = ((bays - 1) * BAY_SPACING) / 2;

  /** Centreline of the frame at normalised position `t`. */
  const centreline = (t: number) => ({
    x: t * span - halfSpan,
    y: rise * momentShape(t) - sag * momentShape(t),
  });

  for (let bay = 0; bay < bays; bay += 1) {
    const z = bay * BAY_SPACING - halfWidth;

    if (params.system === "truss") {
      /* Chords first, then the webs between panel points. The chords carry the
         bending as a couple, so their utilisation follows the moment; the webs
         carry shear, which peaks at the supports — the inverse. Getting that
         inversion right is what makes the colouring read as structure rather
         than as decoration. */
      for (const side of [1, -1]) {
        for (let i = 0; i < STATIONS; i += 1) {
          const t0 = i / STATIONS;
          const t1 = (i + 1) / STATIONS;
          const c0 = centreline(t0);
          const c1 = centreline(t1);
          const offset = (side * params.depth) / 2;

          members.push({
            a: { x: c0.x, y: c0.y + offset, z },
            b: { x: c1.x, y: c1.y + offset, z },
            utilisation: utilisation * momentShape((t0 + t1) / 2),
            thickness: Math.max(0.06, params.depth * 0.12),
          });
        }
      }

      for (let panel = 0; panel < PANELS; panel += 1) {
        const t0 = panel / PANELS;
        const t1 = (panel + 1) / PANELS;
        const c0 = centreline(t0);
        const c1 = centreline(t1);
        const up = panel % 2 === 0;

        members.push({
          a: { x: c0.x, y: c0.y + (up ? -1 : 1) * (params.depth / 2), z },
          b: { x: c1.x, y: c1.y + (up ? 1 : -1) * (params.depth / 2), z },
          utilisation: utilisation * (1 - momentShape((t0 + t1) / 2)) * 0.8,
          thickness: Math.max(0.04, params.depth * 0.07),
        });
      }
    } else {
      for (let i = 0; i < STATIONS; i += 1) {
        const t0 = i / STATIONS;
        const t1 = (i + 1) / STATIONS;
        const c0 = centreline(t0);
        const c1 = centreline(t1);

        members.push({
          a: { x: c0.x, y: c0.y, z },
          b: { x: c1.x, y: c1.y, z },
          /* An arch is close to uniformly stressed once the thrust line sits
             inside it, so the gradient a beam shows would be a lie. */
          utilisation: arch
            ? utilisation * (0.75 + 0.25 * momentShape((t0 + t1) / 2))
            : utilisation * momentShape((t0 + t1) / 2),
          thickness: arch ? params.depth * 0.45 : params.depth,
        });
      }
    }

    /* Supports. Small, but without them the span floats and the whole thing
       stops reading as something bearing on anything. */
    for (const side of [-1, 1]) {
      const x = side * halfSpan;
      members.push({
        a: { x, y: -params.depth / 2 - span * 0.03, z },
        b: { x, y: -params.depth / 2, z },
        utilisation: 0,
        thickness: Math.max(0.12, params.depth * 0.3),
      });
    }
  }

  return {
    members,
    deflection,
    ratio: deflection > 0 ? span / deflection : Infinity,
    utilisation,
    passesDeflection: deflection <= span / DEFLECTION_LIMIT,
    depthRatio: span / params.depth,
    extent: Math.max(span, (bays - 1) * BAY_SPACING, params.depth + rise + sag, 1),
  };
}
