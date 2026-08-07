"use client";

import { useMemo } from "react";
import type { LayoutSpec } from "../../../schema/spec";
import { planFloor } from "../../../lib/subdivide";
import { CARBON, FG_MUTED, PROGRAM_COLORS } from "../../../lib/palette";

const FIT = 6;

/** Gap between rooms, in metres. Stands in for wall thickness. */
const JOINT = 0.18;

/**
 * A floor plan, extruded just enough to read as a model rather than a drawing.
 *
 * Declarative rather than instanced: there are at most ten rooms, and each one
 * needs its own colour and dimensions anyway. The subdivision itself lives in
 * `lib/subdivide.ts` because the legend has to report the same areas.
 */
export function LayoutMesh({ spec }: { spec: LayoutSpec }) {
  const { params, spaces } = spec;
  const floor = useMemo(() => planFloor(spaces, params), [spaces, params]);

  const fit = FIT / Math.max(params.footprintW, params.footprintD, 1);

  return (
    <group scale={fit} rotation={[0, 0, 0]}>
      {/* Slab, so the plan reads against the dark page. */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[params.footprintW, 0.12, params.footprintD]} />
        <meshBasicMaterial color={CARBON} />
      </mesh>

      {floor.corridor ? (
        <mesh position={[floor.corridor.x, 0.02, floor.corridor.z]}>
          <boxGeometry
            args={[floor.corridor.width, 0.04, floor.corridor.depth]}
          />
          <meshBasicMaterial color={FG_MUTED} transparent opacity={0.35} />
        </mesh>
      ) : null}

      {floor.spaces.map((space, index) => {
        const width = Math.max(0.2, space.width - JOINT);
        const depth = Math.max(0.2, space.depth - JOINT);

        return (
          <mesh
            key={`${space.name}-${index}`}
            position={[space.x, params.wallHeight / 2, space.z]}
          >
            <boxGeometry args={[width, params.wallHeight, depth]} />
            <meshBasicMaterial
              color={PROGRAM_COLORS[space.use]}
              transparent
              opacity={0.88}
            />
          </mesh>
        );
      })}
    </group>
  );
}
