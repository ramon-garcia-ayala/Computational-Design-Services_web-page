"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { FreeformSpec, SceneNode } from "../../../schema/spec";
import { fitScale, instancesOf, resolveScene } from "../../../lib/scene";
import { ACCENT, FG_MUTED } from "../../../lib/palette";

const DEGREES = Math.PI / 180;

const MATERIAL_COLORS = {
  solid: "#9ccb4a",
  wire: ACCENT,
  ghost: FG_MUTED,
} as const;

/** Builds the geometry for one node. Profiles are only used where they apply. */
function NodeGeometry({ node }: { node: SceneNode }) {
  const size = node.size ?? { x: 1, y: 1, z: 1 };

  const lathePoints = useMemo(
    () =>
      node.shape === "lathe" && node.profile
        ? node.profile.map((point) => new THREE.Vector2(Math.abs(point.x), point.y))
        : null,
    [node.shape, node.profile],
  );

  const prismShape = useMemo(() => {
    if (node.shape !== "prism" || !node.profile) return null;
    const shape = new THREE.Shape();
    node.profile.forEach((point, index) => {
      if (index === 0) shape.moveTo(point.x, point.y);
      else shape.lineTo(point.x, point.y);
    });
    shape.closePath();
    return shape;
  }, [node.shape, node.profile]);

  switch (node.shape) {
    case "cylinder":
      return <cylinderGeometry args={[size.x / 2, size.x / 2, size.y, 32]} />;
    case "sphere":
      return <sphereGeometry args={[size.x / 2, 28, 18]} />;
    case "lathe":
      /* A revolution needs a profile; without one there is nothing to revolve,
         so it falls back to the primitive the validator left intact. */
      return lathePoints ? (
        <latheGeometry args={[lathePoints, 48]} />
      ) : (
        <cylinderGeometry args={[size.x / 2, size.x / 2, size.y, 32]} />
      );
    case "prism":
      return prismShape ? (
        <extrudeGeometry
          args={[prismShape, { depth: size.z, bevelEnabled: false }]}
        />
      ) : (
        <boxGeometry args={[size.x, size.y, size.z]} />
      );
    default:
      return <boxGeometry args={[size.x, size.y, size.z]} />;
  }
}

function NodeMeshes({ node }: { node: SceneNode }) {
  const material = node.material ?? "solid";
  const scale = node.scale ?? { x: 1, y: 1, z: 1 };
  const color = MATERIAL_COLORS[material];

  return (
    <>
      {instancesOf(node).map((instance, index) => (
        <mesh
          key={index}
          position={[instance.position.x, instance.position.y, instance.position.z]}
          rotation={[
            instance.rotationDeg.x * DEGREES,
            instance.rotationDeg.y * DEGREES,
            instance.rotationDeg.z * DEGREES,
          ]}
          scale={[scale.x, scale.y, scale.z]}
        >
          <NodeGeometry node={node} />
          <meshBasicMaterial
            color={color}
            wireframe={material === "wire"}
            transparent
            opacity={material === "ghost" ? 0.22 : 0.92}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * The escape hatch that still ends in a model.
 *
 * When a request is a vessel, a pavilion, a piece of furniture or a schematic
 * house — real work, but nothing the three fixed archetypes describe — the
 * assistant writes a small scene graph instead, and this renders it. The
 * vocabulary is deliberately narrow: five primitives, one repeat, and sliders
 * that can only drive a node's position, rotation, scale or repeat count.
 */
export function FreeformScene({ spec }: { spec: FreeformSpec }) {
  const nodes = useMemo(() => resolveScene(spec), [spec]);
  const scale = useMemo(() => fitScale(nodes), [nodes]);

  return (
    <group scale={scale}>
      {nodes.map((node, index) => (
        <NodeMeshes key={index} node={node} />
      ))}
    </group>
  );
}
