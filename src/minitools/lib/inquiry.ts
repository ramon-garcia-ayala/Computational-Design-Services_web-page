/**
 * Composes the prewritten mailto for the inquiry band.
 *
 * Everything here is derived from fields the spec already carries — nothing
 * is added to the schema, because widening it recompiles the structured
 * outputs JSON Schema, observed at ~110s on first use (see `.claude/CLAUDE.md`).
 * The two visitor fields are optional and the function always returns a
 * working href, even with neither of them and no share URL yet: that is what
 * makes "these are optional" true rather than a claim.
 *
 * Kept deliberately short. An early version wrote a small essay in the
 * visitor's voice — the tagline, the full sales paragraph, every parameter —
 * and it read like something the visitor never actually said. A short draft
 * that says so up front, in `inquiryCopy.mail.draftNote`, is more honest and
 * more likely to survive being sent almost as-is.
 */

import { contactHref, MAILTO_MAX_CHARS, site } from "@/data/site";
import { formatParamValue } from "./format";
import type { Visitor } from "./visitor";
import { inquiryCopy } from "../data/copy";
import { paramDefsFor } from "../schema/validate";
import type { MinitoolSpec } from "../schema/spec";

/** The share link is dropped whole above this, never truncated. See below. */
const LINK_ENCODED_BUDGET = 1100;

/** Params listed by name before the list is summarised as "…and N more". */
const MAX_LISTED_PARAMS = 6;

/** The trim ladder's highest level — see `bodyAtLevel`. */
const MAX_LEVEL = 4;

export type InquiryInput = {
  spec: MinitoolSpec;
  visitor: Visitor;
  /** Absolute href of the version on screen. `null` before the first encode. */
  shareUrl: string | null;
  subject: string;
};

type Section = string | null;

function joinSections(sections: Section[]): string {
  return sections.filter((section): section is string => section !== null).join("\r\n\r\n");
}

/** The one line that keeps this from reading like the visitor's own essay. */
function draftNoteSection(): Section {
  return inquiryCopy.mail.draftNote;
}

function openingSection(spec: MinitoolSpec): string {
  return `Hi ${site.nameFlat} — following up on "${spec.meta.title}".`;
}

/** The single line of context: the tagline for a tool, the problem for a pitch. */
function whatItIsSection(spec: MinitoolSpec): Section {
  const text = spec.template === "pitch" ? spec.problem : spec.meta.tagline;
  return text || null;
}

/**
 * Titles only, never a step's own `detail` or a tool's full parameter set past
 * `MAX_LISTED_PARAMS` — the point of this email is a starting point, not a
 * transcript of the conversation.
 */
function detailSection(spec: MinitoolSpec): Section {
  if (spec.template === "pitch") {
    if (spec.approach.length === 0) return null;
    const steps = spec.approach.map((step, index) => `${index + 1}. ${step.title}`);
    return [inquiryCopy.mail.planLabel, ...steps].join("\r\n");
  }

  const defs = paramDefsFor(spec);
  if (defs.length === 0) return null;

  const values = spec.params as Record<string, number | string>;
  const listed = defs.slice(0, MAX_LISTED_PARAMS);
  const lines = listed.map((def) => `— ${def.label}: ${formatParamValue(def, values[def.key])}`);

  if (defs.length > MAX_LISTED_PARAMS) {
    lines.push(inquiryCopy.mail.moreParams(defs.length - MAX_LISTED_PARAMS));
  }

  return [inquiryCopy.mail.settingsLabel, ...lines].join("\r\n");
}

function extrasSection(spec: MinitoolSpec): Section {
  if (spec.template !== "pitch") return null;

  const parts: string[] = [];
  if (spec.stack.length > 0) parts.push(`${inquiryCopy.mail.stackLabel} ${spec.stack.join(", ")}`);
  if (spec.deliverables.length > 0) {
    parts.push(`${inquiryCopy.mail.deliverablesLabel} ${spec.deliverables.join(", ")}`);
  }
  if (spec.timelineHint) parts.push(`${inquiryCopy.mail.timelineLabel} ${spec.timelineHint}`);

  return parts.length > 0 ? parts.join("\r\n") : null;
}

function linkSection(shareUrl: string | null, keepLink: boolean): Section {
  if (!shareUrl) return null;
  return keepLink ? `${inquiryCopy.mail.linkLabel} ${shareUrl}` : inquiryCopy.mail.linkOmitted;
}

function signoffSection(visitor: Visitor): Section {
  const lines: string[] = [];
  if (visitor.name) lines.push(`— ${visitor.name}`);
  if (visitor.email) lines.push(inquiryCopy.mail.signoffEmail(visitor.email));
  return lines.length > 0 ? lines.join("\r\n") : null;
}

/**
 * Builds the body at a given trim level. Levels only ever remove sections —
 * they never change what survives at a lower level, so probing upward through
 * the levels is safe. The draft note, the opening line, the link and the
 * signoff are never dropped; only the middle grows or shrinks.
 *
 * 0  everything (already short: capped params, step titles only, no full
 *    parameter set or per-step description — see `detailSection`)
 * 1  extras dropped (pitch stack / deliverables / timeline)
 * 2  detail dropped entirely (the parameter list or the plan)
 * 3  "what it is" dropped (tagline / problem)
 * 4  link dropped, replaced by `linkOmitted` — the minimum viable body
 */
function bodyAtLevel(input: InquiryInput, level: number, keepLink: boolean): string {
  const { spec, visitor } = input;

  return joinSections([
    draftNoteSection(),
    openingSection(spec),
    level >= 3 ? null : whatItIsSection(spec),
    level >= 2 ? null : detailSection(spec),
    level >= 1 ? null : extrasSection(spec),
    linkSection(input.shareUrl, keepLink),
    signoffSection(visitor),
  ]);
}

/**
 * The finished `mailto:` for the CTA. Always returns a valid href.
 *
 * Measured on the encoded href, not the raw body: a `\r\n\r\n` alone costs 12
 * encoded characters, and ordinary English inflates roughly 1.3x under
 * `encodeURIComponent` because of the space-heavy text.
 */
export function inquiryHref(rawInput: InquiryInput): string {
  const { shareUrl, subject } = rawInput;
  /* The visitor state can legitimately hold an untrimmed trailing space while
     the visitor is still typing — that is normal input behaviour, and the
     field must not fight it. Composing the email is the boundary where that
     stops mattering, so it is trimmed once, here. */
  const input: InquiryInput = {
    ...rawInput,
    visitor: { name: rawInput.visitor.name.trim(), email: rawInput.visitor.email.trim() },
  };

  /* The link is decided once, before the ladder runs, because it is the only
     section with no bound: a freeform scene near `LIMITS.sceneNodes` deflates
     to roughly a kilobyte, and on a browser without `CompressionStream` the
     uncompressed fallback runs into the tens of kilobytes. Left inside the
     ladder it would starve every other section without ever fitting. A link
     is never truncated — half a link looks like a working one and lands the
     visitor on the invalid-link screen — so it is kept whole or dropped whole. */
  const linkFitsAlone =
    shareUrl !== null && encodeURIComponent(shareUrl).length <= LINK_ENCODED_BUDGET;

  for (let level = 0; level <= MAX_LEVEL; level += 1) {
    /* The top level forces the link off even if it fit alone: a link that
       passed the check above but is still large (say 900 of the 1100 budget)
       can combine with unavoidable overhead to push every earlier level over
       the ceiling, and this level is the guaranteed-to-fit floor. */
    const keepLink = level < MAX_LEVEL && linkFitsAlone;
    const href = contactHref(subject, bodyAtLevel(input, level, keepLink));
    if (href.length <= MAILTO_MAX_CHARS) return href;
  }

  /* The top level is bounded by construction (the draft note, the opening,
     linkOmitted and the signoff, each capped by LIMITS or by the visitor
     field caps), so this line is unreachable in practice — but the function
     must never fail to return a working href. */
  return contactHref(subject, bodyAtLevel(input, MAX_LEVEL, false));
}
