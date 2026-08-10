"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { StructureSpec } from "../../../schema/spec";
import { analyse } from "../../../lib/structure";
import { utilisationColor } from "../../../lib/palette";

const FIT = 6;

const dummy = new THREE.Object3D();
const scratch = new THREE.Color();
const direction = new THREE.Vector3();
const X_AXIS = new THREE.Vector3(1, 0, 0);
const orientation = new THREE.Quaternion();

/**
 * The span, drawn from whatever `analyse` returned.
 *
 * Every member — chord, web, support — is the same unit box, rotated onto the
 * line between its two endpoints and stretched along it. That uniformity is
 * why three quite different systems cost one component: a truss is not a
 * special case here, it is a longer list.
 *
 * Colour is the output, not the decoration. It comes from utilisation, so the
 * gradient along a beam *is* the bending diagram, and a member that goes warm
 * is one the section cannot carry.
 */
export function StructureMesh({ spec }: { spec: StructureSpec }) {
  const result = useMemo(() => analyse(spec.params), [spec.params]);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const count = result.members.length;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    result.members.forEach((member, index) => {
      direction.set(member.b.x - member.a.x, member.b.y - member.a.y, member.b.z - member.a.z);
      const length = direction.length() || 0.001;
      direction.divideScalar(length);

      orientation.setFromUnitVectors(X_AXIS, direction);

      dummy.position.set(
        (member.a.x + member.b.x) / 2,
        (member.a.y + member.b.y) / 2,
        (member.a.z + member.b.z) / 2,
      );
      dummy.quaternion.copy(orientation);
      /* Slightly over length so consecutive segments of a curved chord overlap
         instead of showing a hairline gap at every station. */
      dummy.scale.set(length * 1.04, member.thickness, member.thickness);

      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, scratch.set(utilisationColor(member.utilisation)));
    });

    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    /* Every instance is a unit box until its matrix says otherwise, so the
       bounds have to come from the matrices or the frustum culls the span the
       moment it is longer than one metre. */
    mesh.computeBoundingSphere();
  }, [result, count]);

  return (
    <group scale={FIT / result.extent}>
      {/* Remounted on the member count: an InstancedMesh sizes its buffer at
          construction, and changing the system or the bay count changes how
          many members there are. Geometry and material are children so R3F
          owns their disposal. */}
      <instancedMesh key={count} ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0.95} />
      </instancedMesh>
    </group>
  );
}
