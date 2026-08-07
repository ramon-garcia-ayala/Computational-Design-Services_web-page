import { CTALink } from "@/components/ui/CTALink";
import { contactHref } from "@/data/site";
import { closingLine } from "../data/copy";
import type { TemplateId } from "../schema/spec";

/**
 * The point of the whole exercise: the visitor has just watched something get
 * built out of a two-minute conversation, and this is where that turns into a
 * reason to write to us. Shared by the 3D pages and the proposal page so the
 * argument reads the same either way.
 */
export function ClosingBlock({
  template,
  generationMs,
  subject,
}: {
  template: TemplateId;
  generationMs?: number;
  subject: string;
}) {
  const { headline, body, cta } = closingLine(template, generationMs);

  return (
    <div className="mt-16 border-t border-line pt-10 lg:mt-24">
      <div className="max-w-3xl">
        <p className="font-display text-3xl leading-tight text-accent sm:text-4xl lg:text-5xl">
          {headline}
        </p>
        <p className="mt-5 text-base leading-relaxed text-fg-muted sm:text-lg">{body}</p>
        <div className="mt-8">
          <CTALink href={contactHref(subject)} variant="solid" size="lg" external>
            {cta}
          </CTALink>
        </div>
      </div>
    </div>
  );
}
