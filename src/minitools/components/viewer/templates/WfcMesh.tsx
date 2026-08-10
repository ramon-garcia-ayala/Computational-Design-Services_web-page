"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { WfcSpec } from "../../../schema/spec";
import { solveField } from "../../../lib/wfc";
import { LINE, WFC_TILE_COLORS } from "../../../lib/palette";

const FIT = 6;

const dummy = new THREE.Object3D();
const scratch = new THREE.Color();

/**
 * A collapsed field, drawn as one instanced box per occupied cell.
 *
 * All the thinking is in `lib/wfc.ts`; this only places what came out of it.
 * That split is what keeps the archetype honest — the model chooses a ruleset
 * and five numbers, and nothing it writes can reach the renderer except
 * through the solver.
 *
 * The site plate underneath is not decoration. Without it the empty cells read
 * as holes in the model rather than as open ground, and `openness` — the one
 * control whose whole job is to produce absence — looks like it is deleting
 * things at random.
 */
export function WfcMesh({ spec }: { spec: WfcSpec }) {
  const field = useMemo(() => solveField(spec.params), [spec.params]);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const count = field.blocks.length;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    field.blocks.forEach((block, index) => {
      dummy.position.set(block.x, block.height / 2, block.z);
      dummy.scale.set(block.footprint, block.height, block.footprint);
      dummy.updateMatrix();

      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, scratch.set(WFC_TILE_COLORS[block.tile]));
    });

    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    /* Derived from the matrices rather than from the geometry: the boxes are
       unit cubes scaled per instance, so the mesh's own bounds say nothing
       about where the field actually is, and the frustum would cull it whole
       on the first orbit. */
    mesh.computeBoundingSphere();
  }, [field, count]);

  return (
    <group scale={FIT / field.extent}>
      {/* Centred on half the tallest block rather than on the ground plane, so
          a field of towers and a flat lattice both sit in the middle of the
          frame instead of the tall one climbing out of the top of it. */}
      <group position={[0, -field.tallest / 2, 0]}>
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[field.size, field.size]} />
          <meshBasicMaterial
            color={LINE}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Remounted on the block count: an InstancedMesh sizes its buffer at
            construction, and R3F will not rebuild it because a number in
            `args` moved. Geometry and material stay children so R3F owns
            their disposal — doing it by hand breaks under StrictMode. */}
        <instancedMesh key={count} ref={meshRef} args={[undefined, undefined, count]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial transparent opacity={0.94} />
        </instancedMesh>
      </group>
    </group>
  );
}
