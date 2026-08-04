import type { FlowBlockData } from "@/data/proposals";
import { FlowDiagram } from "../FlowDiagram";
import { BlockShell } from "./BlockShell";

export function FlowBlock({ block }: { block: FlowBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
      grid
    >
      <FlowDiagram block={block} />
    </BlockShell>
  );
}
