/**
 * Resolving a freeform scene: sliders in, concrete transforms out.
 *
 * Everything here is arithmetic on a bounded set of fields. The model writes
 * data, never code, and a binding can only ever be `value * factor + offset`
 * applied to one of eleven named properties — so there is nothing to evaluate
 * and no way for a generated scene to do anything but sit there and be looked
 * at.
 */

import type {
  BindableProp,
  FreeformSpec,
  SceneNode,
  Vec3,
} from "../schema/spec";
import { LIMITS } from "../schema/registry";

/** World units the whole composition is normalised into. */
const FIT = 6;

function cloneVec(vec: Vec3 | undefined, fallback: number): Vec3 {
  return vec ? { ...vec } : { x: fallback, y: fallback, z: fallback };
}

function cloneNode(node: SceneNode): SceneNode {
  return {
    ...node,
    size: cloneVec(node.size, 1),
    position: cloneVec(node.position, 0),
    rotationDeg: cloneVec(node.rotationDeg, 0),
    scale: cloneVec(node.scale, 1),
    repeat: node.repeat ? { ...node.repeat, offset: cloneVec(node.repeat.offset, 0) } : undefined,
  };
}

function applyBinding(node: SceneNode, property: BindableProp, value: number): void {
  const [group, axis] = property.split(".") as [string, string];

  if (group === "repeat") {
    if (!node.repeat) return;
    /* The same ceiling the validator applies to an authored count. A binding
       is `value * factor + offset`, and both sides of that reach a thousand,
       so without the clamp a slider could ask for a million copies of a mesh
       and take the tab down with it. Every other bindable property lands in a
       transform, where an absurd number is only ever absurd to look at; this
       one lands in a loop bound. */
    if (axis === "count") {
      node.repeat.count = Math.min(
        LIMITS.repeatCount,
        Math.max(1, Math.round(value)),
      );
    } else {
      node.repeat.angleDeg = Math.min(360, Math.max(0, value));
    }
    return;
  }

  const target =
    group === "position"
      ? node.position
      : group === "rotationDeg"
        ? node.rotationDeg
        : node.scale;

  if (!target) return;
  if (axis === "x") target.x = value;
  else if (axis === "y") target.y = value;
  else target.z = value;
}

/** The scene with the current slider values folded in. */
export function resolveScene(spec: FreeformSpec): SceneNode[] {
  const nodes = spec.scene.map(cloneNode);

  for (const control of spec.controls) {
    const raw = spec.params[control.key];
    const value = typeof raw === "number" ? raw : control.default;

    for (const binding of control.bindings) {
      const node = nodes[binding.node];
      if (!node) continue;
      applyBinding(
        node,
        binding.property,
        value * (binding.factor ?? 1) + (binding.offset ?? 0),
      );
    }
  }

  return nodes;
}

export type NodeInstance = {
  position: Vec3;
  rotationDeg: Vec3;
};

/**
 * The copies a node draws. `linear` steps along an offset, `radial` sweeps
 * around the origin — both common enough in this kind of geometry that leaving
 * them out would push the model into emitting forty near-identical nodes.
 */
export function instancesOf(node: SceneNode): NodeInstance[] {
  const position = node.position ?? { x: 0, y: 0, z: 0 };
  const rotationDeg = node.rotationDeg ?? { x: 0, y: 0, z: 0 };

  if (!node.repeat || node.repeat.count <= 1) {
    return [{ position, rotationDeg }];
  }

  const { mode, count } = node.repeat;
  const instances: NodeInstance[] = [];

  if (mode === "linear") {
    const offset = node.repeat.offset ?? { x: 0, y: 0, z: 0 };
    for (let i = 0; i < count; i += 1) {
      instances.push({
        position: {
          x: position.x + offset.x * i,
          y: position.y + offset.y * i,
          z: position.z + offset.z * i,
        },
        rotationDeg,
      });
    }
    return instances;
  }

  const sweep = node.repeat.angleDeg ?? 360;
  /* A full turn puts the last copy back on the first, so the step divides by
     the count; a partial sweep should reach its end angle, so it divides by
     the gaps between copies. */
  const step = (sweep >= 359.5 ? sweep / count : sweep / (count - 1)) * (Math.PI / 180);

  for (let i = 0; i < count; i += 1) {
    const angle = step * i;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    instances.push({
      position: {
        x: position.x * cos + position.z * sin,
        y: position.y,
        z: -position.x * sin + position.z * cos,
      },
      rotationDeg: {
        ...rotationDeg,
        y: rotationDeg.y + (angle * 180) / Math.PI,
      },
    });
  }

  return instances;
}

/**
 * Scale that brings the whole scene into view.
 *
 * A generous bound rather than an exact one: the model is free to work in
 * whatever units it likes, and the camera is fixed, so what matters is that
 * nothing ends up off screen or the size of a speck.
 */
export function fitScale(nodes: SceneNode[]): number {
  let extent = 0;

  for (const node of nodes) {
    const size = node.size ?? { x: 1, y: 1, z: 1 };
    const scale = node.scale ?? { x: 1, y: 1, z: 1 };
    const half = {
      x: (size.x * scale.x) / 2,
      y: (size.y * scale.y) / 2,
      z: (size.z * scale.z) / 2,
    };

    for (const instance of instancesOf(node)) {
      extent = Math.max(
        extent,
        Math.abs(instance.position.x) + half.x,
        Math.abs(instance.position.y) + half.y,
        Math.abs(instance.position.z) + half.z,
      );
    }
  }

  return extent > 0 ? FIT / (extent * 2) : 1;
}
