"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import type { MassingSpec } from "../../../schema/spec";
import { floorHeightOf, floorScale, floorUses, planDepth } from "../../../lib/program";
import { PROGRAM_COLORS } from "../../../lib/palette";

const FIT = 6;

const dummy = new THREE.Object3D();
const scratch = new THREE.Color();

/**
 * Stacked floor plates coloured by program.
 *
 * The building is modelled in metres and scaled into view at the end, so the
 * numbers in the panel are the ones an architect would quote and the areas in
 * the legend are real.
 */
export function MassingMesh({ spec }: { spec: MassingSpec }) {
  const { params, program } = spec;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const floors = Math.round(params.floors);
  const floorHeight = floorHeightOf(params);
  const totalHeight = floors * floorHeight;
  const baseDepth = planDepth(params);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const uses = floorUses(program, floors);

    for (let index = 0; index < floors; index += 1) {
      const t = floors <= 1 ? 0 : index / (floors - 1);
      const scale = floorScale(params, index);

      dummy.position.set(0, (index + 0.5) * floorHeight - totalHeight / 2, 0);
      dummy.rotation.set(0, (params.twistDeg * Math.PI * t) / 180, 0);
      dummy.scale.set(
        params.baseWidth * scale,
        // A sliver of air between plates: the stack has to read as floors.
        floorHeight * 0.86,
        baseDepth * scale,
      );

      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, scratch.set(PROGRAM_COLORS[uses[index] ?? "office"]));
    }

    mesh.count = floors;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    /* Derived from the instance matrices: a tower that grew taller than the
       stale bounding sphere would get culled on the way up. */
    mesh.computeBoundingSphere();
  }, [params, program, floors, floorHeight, totalHeight, baseDepth]);

  const fit = FIT / Math.max(totalHeight, params.baseWidth, baseDepth, 1);

  return (
    <group scale={fit}>
      {/* Geometry and material live as children so R3F owns their disposal;
          doing it by hand in an effect breaks under StrictMode. */}
      <instancedMesh
        key={`${floors}-${params.plan}`}
        ref={meshRef}
        args={[undefined, undefined, floors]}
      >
        {params.plan === "ellipse" ? (
          <cylinderGeometry args={[0.5, 0.5, 1, 40]} />
        ) : (
          <boxGeometry args={[1, 1, 1]} />
        )}
        <meshBasicMaterial transparent opacity={0.92} />
      </instancedMesh>
    </group>
  );
}
