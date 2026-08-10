import type { ProposalBlock } from "@/data/proposals";
import { CardsBlock } from "./blocks/CardsBlock";
import { ChecklistBlock } from "./blocks/ChecklistBlock";
import { DocsBlock } from "./blocks/DocsBlock";
import { FigureBlock } from "./blocks/FigureBlock";
import { FlowBlock } from "./blocks/FlowBlock";
import { NoteBlock } from "./blocks/NoteBlock";
import { PricingBlock } from "./blocks/PricingBlock";
import { ProseBlock } from "./blocks/ProseBlock";
import { QaBlock } from "./blocks/QaBlock";
import { SplitBlock } from "./blocks/SplitBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { StepsBlock } from "./blocks/StepsBlock";
import { TableBlock } from "./blocks/TableBlock";
import { TimelineBlock } from "./blocks/TimelineBlock";

/** The single place where a block kind maps to a component. */
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
          case "checklist":
            return <ChecklistBlock key={block.id} block={block} />;
          case "qa":
            return <QaBlock key={block.id} block={block} />;
          case "table":
            return <TableBlock key={block.id} block={block} />;
          case "stats":
            return <StatsBlock key={block.id} block={block} />;
          case "pricing":
            return <PricingBlock key={block.id} block={block} />;
          case "docs":
            return <DocsBlock key={block.id} block={block} />;
          case "figure":
            return <FigureBlock key={block.id} block={block} />;
          case "timeline":
            return <TimelineBlock key={block.id} block={block} />;
          case "note":
            return <NoteBlock key={block.id} block={block} />;
        }
      })}
    </>
  );
}
