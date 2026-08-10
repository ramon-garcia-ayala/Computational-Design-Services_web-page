# Writing the component

The archetype's component is a Server-Component-free, animation-free leaf. It
takes a spec and returns geometry. `ViewerCanvas` owns the camera, the orbit
controls and the render loop; `Reveal` owns entrances everywhere else on the
site. A block component that reaches for either is a bug waiting to be filed.

## The shape of one

```tsx
"use client";

import { useMemo } from "react";
import type { XxxSpec } from "../../../schema/spec";
import { solve } from "../../../lib/xxx";

/** Every archetype fits itself into the same cube so the fixed camera works. */
const FIT = 6;

export function XxxMesh({ spec }: { spec: XxxSpec }) {
  const model = useMemo(() => solve(spec.params), [spec.params]);
  const scale = FIT / model.extent;

  return (
    <group scale={scale}>
      {/* … */}
    </group>
  );
}
```

Two conventions do all the work here.

**Build around the origin, then fit.** The camera is fixed at `[7.5, 5, 9.5]`
looking at `(0, 0, 0)`, and it does not move per archetype. So model in
whatever units are natural — metres, storeys, cells — centre the result on the
origin, and divide `FIT` by the largest extent to get the scale for the
wrapping group. Absolute size never matters; proportion is the only thing the
viewer sees. `fitScale` in `lib/scene.ts` is the worked version of this for the
freeform scene graph.

**No lights.** Everything in this module draws with `meshBasicMaterial`, which
is unlit by design: the hero's performance budget is real and the site's visual
language is flat anyway. Colour comes from `lib/palette.ts`. If you find
yourself wanting `meshStandardMaterial` you also want lights in
`ViewerCanvas`, and that is a change to every archetype, not just yours.

## Instancing

Below fifty or so meshes, write them declaratively — `layout` does, with ten
rooms, and it is far easier to read. Past that, use one `InstancedMesh` and set
the matrices in a `useLayoutEffect`; `facade` goes to 960 panels this way.

```tsx
const meshRef = useRef<THREE.InstancedMesh>(null);

useLayoutEffect(() => {
  const mesh = meshRef.current;
  if (!mesh) return;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i += 1) {
    dummy.position.set(/* … */);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}, [/* every param the loop reads */]);

return (
  <instancedMesh key={count} ref={meshRef} args={[undefined, undefined, count]}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.9} />
  </instancedMesh>
);
```

Three details in there are not decoration:

- **`key={count}`** remounts the mesh when the instance count changes. An
  `InstancedMesh` allocates its buffer at construction from `args`, and R3F
  will not rebuild it just because a number in `args` moved.
- **`computeBoundingSphere()`** after writing the matrices. Without it the
  bounding volume is whatever the empty buffer implied, and the frustum culls
  the whole mesh the moment you orbit away from wherever it thinks the object
  is.
- **Geometry and material as children, never as `args`.** Let R3F own their
  lifecycle. Memoising three.js objects and disposing them from an effect
  breaks under StrictMode, whose second mount reuses exactly what the first
  mount's cleanup destroyed.

## Failure modes, by symptom

This canvas fails in a small number of specific ways, and they are much easier
to recognise than to derive.

**Nothing renders until you drag the model.** The render loop is stalled. R3F
drives every root from one global animation frame that shuts down on any tick
where no root asks for work, and it reliably does so in the gap before this
root goes active. `ViewerCanvas` already handles it — `frameloop` is left on
the default and `StartRenderLoop` kicks it once after mount. If you see this,
you have introduced a second `Canvas` or set `frameloop="demand"` somewhere.
Do not "fix" it by animating something continuously.

**The scene is empty but the parameter panel is populated.** Two candidates.
Either your geometry is not near the origin, and the fixed camera is pointed
at empty space — check what `extent` is actually computing. Or your component
is not reached at all, which means the `case` in `templates/index.tsx` is
missing and the switch is falling through.

**The panel is empty but the model renders.** `paramDefsFor` returned nothing:
the `Extract<>` in `PARAM_REGISTRY` was not widened, or the `case` returns the
wrong key. Nothing logs this.

**It renders on first load and disappears on the second, in dev only.** That is
StrictMode's double mount meeting a manual `dispose()`. Stop disposing; hand
the object to R3F as a child.

**Part of the model vanishes when you orbit past it.** Frustum culling against
a stale bounding volume. `computeBoundingSphere()`.

**Dragging a slider is janky and the CPU spikes.** An options object or an
array is being recreated inline in `args`. R3F compares `args` by reference, so
a fresh literal per render tears the geometry down and re-triangulates it —
once per instance, every frame of the drag, to rebuild exactly what was there.
`useMemo` it. `FreeformScene`'s `prismOptions` is the worked example.

**The whole tool page renders blank, including sections that were fine.**
Something in the page threw during the async hash decode. This page carries no
`Reveal` on purpose: its content only exists after that decode, and a
ScrollTrigger built against the pre-decode spinner measures the wrong position
and never fires.

## What not to put in here

- **No scroll animation.** An earlier version of `FlowDiagram` hand-rolled
  per-stage ScrollTriggers that silently never ran and left the diagram blank.
  A block component has no business owning scroll animation.
- **No `useFrame` unless the archetype is genuinely animated.** These are
  tools, not screensavers; the visitor's input is what should move things.
- **No data fetching, no `useEffect` that writes to the spec.** The spec flows
  down; slider writes go up through `ToolViewerPage`.
