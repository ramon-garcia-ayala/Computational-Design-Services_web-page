"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import type { FacadeParams } from "../../../schema/spec";
import { ACCENT } from "../../../lib/palette";

/** World units the composition is normalised into, so the camera never moves. */
const FIT = 6;

/** How far a fully open panel swings, in `rotate` mode. */
const MAX_ROTATION = Math.PI * 0.42;

const dummy = new THREE.Object3D();
const scratch = new THREE.Color();
const CLOSED = new THREE.Color("#39424a");
const OPEN = new THREE.Color(ACCENT);

/**
 * Parametric panelisation of a flat or single-curved surface.
 *
 * One `InstancedMesh` for the whole skin: 40 × 24 is 960 panels, which is a
 * single draw call and stays interactive while a slider is being dragged.
 * Everything is recomputed in a layout effect rather than per frame — the
 * canvas runs on `frameloop="demand"`, so nothing renders until something
 * actually changes.
 */
export function FacadeMesh({ params }: { params: FacadeParams }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const count = params.columns * params.rows;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { columns, rows, surface, mode } = params;
    const cell = FIT / columns;
    const gridHeight = rows * cell;
    const panel = cell * 0.86;

    const curved = surface === "curved" && params.curvatureDeg > 1;
    const sweep = (params.curvatureDeg * Math.PI) / 180;
    /* Radius chosen so the arc length matches the flat width: switching
       between surfaces keeps the same amount of facade on screen. */
    const radius = curved ? FIT / sweep : 0;

    const lo = Math.min(params.minOpen, params.maxOpen);
    const hi = Math.max(params.minOpen, params.maxOpen);

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const index = row * columns + column;

        // Normalised surface coordinates, sampled at each panel's centre.
        const u = (column + 0.5) / columns;
        const v = (row + 0.5) / rows;

        const distance = Math.hypot(u - params.attractorX, v - params.attractorY);
        const proximity = Math.pow(
          Math.max(0, 1 - Math.min(1, distance / Math.SQRT2)),
          params.falloff,
        );
        const openness = lo + (hi - lo) * proximity;

        const y = (v - 0.5) * gridHeight;
        const theta = curved ? (u - 0.5) * sweep : 0;

        let x: number;
        let z: number;
        if (curved) {
          x = radius * Math.sin(theta);
          // Pulled back by the radius so the surface stays centred on the origin.
          z = radius * Math.cos(theta) - radius;
        } else {
          x = (u - 0.5) * FIT;
          z = 0;
        }

        if (mode === "depth") {
          const push = openness * cell * 1.4;
          x += Math.sin(theta) * push;
          z += Math.cos(theta) * push;
        }

        dummy.position.set(x, y, z);
        dummy.rotation.set(
          0,
          theta + (mode === "rotate" ? openness * MAX_ROTATION : 0),
          0,
        );

        const scale = mode === "scale" ? 0.15 + 0.85 * openness : 1;
        dummy.scale.set(panel * scale, panel * scale, 1);

        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        mesh.setColorAt(index, scratch.copy(CLOSED).lerp(OPEN, openness));
      }
    }

    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    /* The bounding sphere is derived from the instance matrices, so without
       this the frustum test keeps using the one computed from the empty
       buffer and the skin disappears at some camera angles. */
    mesh.computeBoundingSphere();
  }, [params, count]);

  return (
    <group scale={FIT / Math.max(FIT, (params.rows * FIT) / params.columns)}>
      {/* Remounted when the count changes: an InstancedMesh allocates its
          buffers once, at construction. Geometry and material are children
          rather than constructor arguments so that R3F owns their lifecycle —
          disposing them by hand in an effect breaks under StrictMode, whose
          second mount reuses the objects the first mount's cleanup destroyed. */}
      <instancedMesh key={count} ref={meshRef} args={[undefined, undefined, count]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
}
