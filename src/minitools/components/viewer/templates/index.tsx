"use client";

import type { ViewerSpec } from "../../../schema/spec";
import { FacadeMesh } from "./FacadeMesh";
import { FreeformScene } from "./FreeformScene";
import { LayoutMesh } from "./LayoutMesh";
import { MassingMesh } from "./MassingMesh";
import { StructureMesh } from "./StructureMesh";
import { WfcMesh } from "./WfcMesh";

/**
 * The one place an archetype maps to a component — same rule as the proposal
 * renderer. Adding an archetype means extending the union in `spec.ts`,
 * writing the component here and wiring this switch; nothing else changes.
 */
export function TemplateScene({ spec }: { spec: ViewerSpec }) {
  switch (spec.template) {
    case "facade":
      return <FacadeMesh params={spec.params} />;
    case "massing":
      return <MassingMesh spec={spec} />;
    case "layout":
      return <LayoutMesh spec={spec} />;
    case "structure":
      return <StructureMesh spec={spec} />;
    case "wfc":
      return <WfcMesh spec={spec} />;
    case "freeform":
      return <FreeformScene spec={spec} />;
  }
}
