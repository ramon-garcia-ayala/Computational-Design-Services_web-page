import { Reveal } from "@/components/ui/Reveal";
import type { TableBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { BlockShell } from "./BlockShell";

/**
 * Data table. No full borders — just horizontal separators, which is what the
 * rest of the site already does. On mobile it scrolls inside its own container
 * so that the `<body>` never scrolls horizontally.
 */
export function TableBlock({ block }: { block: TableBlockData }) {
  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
    >
      <Reveal className="mt-14">
        <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {block.columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="pb-4 pr-6 font-mono text-[10px] font-normal uppercase tracking-widest text-fg-muted last:pr-0"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {block.rows.map((row, index) => (
                <tr
                  key={block.columns[0] ? row[block.columns[0].key] : index}
                  className="border-b border-line-soft align-top"
                >
                  {block.columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "py-4 pr-6 text-sm leading-relaxed last:pr-0",
                        column.emphasis ? "text-fg" : "text-fg-muted",
                      )}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {block.note ? (
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-fg-muted">
            {block.note}
          </p>
        ) : null}
      </Reveal>
    </BlockShell>
  );
}
