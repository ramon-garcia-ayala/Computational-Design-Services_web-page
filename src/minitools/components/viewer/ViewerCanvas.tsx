"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { ViewerSpec } from "../../schema/spec";
import { TemplateScene } from "./templates";

/**
 * Kicks the render loop once the scene is mounted.
 *
 * R3F drives every canvas from a single global animation frame, and that loop
 * shuts itself down on any tick where no root asks for work. On this page the
 * loop reliably stops in the gap between the canvas being created and this
 * root going active, and nothing restarts it — so the tool renders nothing at
 * all until the visitor happens to drag it, which reads as a broken page. One
 * `invalidate` after mount restarts the loop for good.
 *
 * Both calls are needed: the direct one covers the common case, the deferred
 * one covers a mount where the root is not active yet (and StrictMode's first,
 * discarded mount, whose cleanup cancels its own frame).
 */
function StartRenderLoop() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
    const handle = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(handle);
  }, [invalidate]);

  return null;
}

/**
 * The canvas for a generated tool.
 *
 * Unlike the hero's scene this is the page's content, not decoration: it takes
 * pointer events, it is reachable, and it is what the visitor came to play
 * with. The frameloop is left on the default for the same reason `HeroScene`
 * does — nothing here animates on its own, so a steady loop simply redraws the
 * same frame, and demand mode would make every future template responsible for
 * remembering to request one.
 *
 * Default export because `ToolViewerPage` pulls it in with `dynamic`.
 */
export default function ViewerCanvas({ spec }: { spec: ViewerSpec }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [7.5, 5, 9.5], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      /* A camera given a position still points down -Z, so from up here it
         would frame empty space beside the model. Every template builds itself
         around the origin, so that is what to aim at. */
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <StartRenderLoop />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={32}
        maxPolarAngle={Math.PI * 0.92}
      />
      <TemplateScene spec={spec} />
    </Canvas>
  );
}
