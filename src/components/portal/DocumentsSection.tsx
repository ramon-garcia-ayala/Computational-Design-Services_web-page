import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { cardGrid } from "@/components/proposal/blocks/cardGrid";
import { Icon, type IconName } from "@/components/proposal/icons";
import { PortalSection } from "./PortalSection";
import type { PortalDocument, PortalDocumentKind } from "@/data/portal/types";
import { portalCopy } from "@/data/portal/copy";

const kindIcon: Record<PortalDocumentKind, IconName> = {
  proposal: "file",
  budget: "spreadsheet",
  deliverable: "cube",
  reference: "layers",
};

function hrefOf(doc: PortalDocument, slug: string): string {
  if (doc.source === "file") return `/api/portal/file/${slug}/${doc.file}`;
  return doc.href;
}

export function DocumentsSection({
  documents,
  slug,
}: {
  documents: PortalDocument[];
  slug: string;
}) {
  const copy = portalCopy.sections.documents;

  return (
    <PortalSection
      id="documents"
      kicker={copy.kicker}
      title={copy.title}
      empty={documents.length === 0 ? copy.empty : undefined}
    >
      <Reveal
        stagger="[data-reveal]"
        as="ul"
        className={cn(
          "mt-10 grid gap-px overflow-hidden rounded-surface border border-edge bg-edge",
          cardGrid(documents.length),
        )}
      >
        {documents.map((doc) => {
          const isFile = doc.source === "file";
          const external = isFile ? false : (doc.external ?? false);

          return (
            <li key={doc.id} className="reveal-init bg-carbon" data-reveal>
              <a
                href={hrefOf(doc, slug)}
                target={isFile || external ? "_blank" : undefined}
                rel={isFile || external ? "noreferrer noopener" : undefined}
                className="group flex h-full items-start gap-4 p-6 transition-colors hover:bg-graphite lg:p-8"
              >
                <Icon name={kindIcon[doc.kind]} className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" />
                <span className="flex flex-col gap-2">
                  <span className="font-display text-base font-semibold tracking-tight text-fg transition-colors group-hover:text-accent-ink">
                    {doc.label}
                  </span>
                  {doc.date ? (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">{doc.date}</span>
                  ) : null}
                  {doc.note ? <span className="text-sm leading-relaxed text-fg-muted">{doc.note}</span> : null}
                  <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent-ink">
                    <Icon name={isFile ? "download" : "externalLink"} className="h-3 w-3" />
                    {doc.kind === "proposal" ? copy.openProposal : copy.download}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </Reveal>
    </PortalSection>
  );
}
