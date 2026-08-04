import type { ProposalBlock } from "@/data/proposals";
import { CardsBlock } from "./blocks/CardsBlock";
import { FlowBlock } from "./blocks/FlowBlock";
import { NoteBlock } from "./blocks/NoteBlock";
import { ProseBlock } from "./blocks/ProseBlock";
import { QaBlock } from "./blocks/QaBlock";
import { SplitBlock } from "./blocks/SplitBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { StepsBlock } from "./blocks/StepsBlock";
import { TableBlock } from "./blocks/TableBlock";
import { TimelineBlock } from "./blocks/TimelineBlock";

/** Único punto donde un tipo de bloque se traduce a un componente. */
export function ProposalRenderer({ blocks }: { blocks: ProposalBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.kind) {
          case "prose":
            return <ProseBlock key={block.id} block={block} />;
          case "steps":
            return <StepsBlock key={block.id} block={block} />;
          case "flow":
            return <FlowBlock key={block.id} block={block} />;
          case "split":
            return <SplitBlock key={block.id} block={block} />;
          case "cards":
            return <CardsBlock key={block.id} block={block} />;
          case "qa":
            return <QaBlock key={block.id} block={block} />;
          case "table":
            return <TableBlock key={block.id} block={block} />;
          case "stats":
            return <StatsBlock key={block.id} block={block} />;
          case "timeline":
            return <TimelineBlock key={block.id} block={block} />;
          case "note":
            return <NoteBlock key={block.id} block={block} />;
        }
      })}
    </>
  );
}
