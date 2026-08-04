import { Reveal } from "@/components/ui/Reveal";
import type { Priority, QaBlockData } from "@/data/proposals";
import { cn } from "@/lib/utils";
import { BlockShell } from "./BlockShell";

const priorityOrder: Record<Priority, number> = {
  Blocking: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const priorityStyle: Record<Priority, string> = {
  Blocking: "bg-accent text-carbon",
  High: "border border-accent text-accent",
  Medium: "border border-line text-fg-muted",
  Low: "border border-line text-fg-muted",
};

/**
 * The open questions for the client. They are designed to be answered, not
 * skimmed: grouped by topic, with the priority visible and a line explaining
 * what each answer unblocks.
 */
export function QaBlock({ block }: { block: QaBlockData }) {
  const questions = block.groups.flatMap((group) => group.questions);

  const tally = (["Blocking", "High", "Medium", "Low"] as const)
    .map((priority) => ({
      priority,
      count: questions.filter((question) => question.priority === priority)
        .length,
    }))
    .filter((entry) => entry.count > 0);

  /* Groups containing anything blocking come first. */
  const groups = [...block.groups].sort(
    (a, b) => groupWeight(a.questions) - groupWeight(b.questions),
  );

  return (
    <BlockShell
      id={block.id}
      kicker={block.kicker}
      title={block.title}
      lead={block.lead}
      grid
    >
      <Reveal className="mt-10 flex flex-wrap items-center gap-3">
        {tally.map((entry) => (
          <span
            key={entry.priority}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest",
              priorityStyle[entry.priority],
            )}
          >
            {entry.count} {entry.priority}
          </span>
        ))}
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {questions.length} open questions
        </span>
      </Reveal>

      <div className="mt-10 flex flex-col gap-10">
        {groups.map((group) => (
          <Reveal key={group.id} stagger="[data-reveal]">
            <h3
              className="reveal-init font-mono text-[10px] uppercase tracking-widest text-accent"
              data-reveal
            >
              {group.category} · {group.questions.length}
            </h3>

            <ul className="mt-3">
              {group.questions.map((question) => (
                <li
                  key={question.id}
                  className="reveal-init border-t border-line py-3.5"
                  data-reveal
                >
                  {/* Reference, priority and question share one line so the
                      list scans as a list, not as a stack of cards. */}
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                      {question.id}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                        priorityStyle[question.priority],
                      )}
                    >
                      {question.priority}
                    </span>
                    <p className="min-w-0 flex-1 font-display text-base leading-snug font-semibold tracking-tight text-fg">
                      {question.question}
                    </p>
                  </div>

                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-fg-muted">
                    {question.why}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      {block.note ? (
        <Reveal className="mt-10">
          <p className="max-w-2xl border-t border-line pt-6 text-sm leading-relaxed text-fg-muted">
            {block.note}
          </p>
        </Reveal>
      ) : null}
    </BlockShell>
  );
}

function groupWeight(questions: { priority: Priority }[]): number {
  return Math.min(...questions.map((q) => priorityOrder[q.priority]));
}
