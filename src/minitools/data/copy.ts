/**
 * Every word the mini tools show. Components import from here and never
 * hardcode text, same rule as `src/data/`.
 */

import type { TemplateId } from "../schema/spec";

export const widgetCopy = {
  /** Replaces the "Phase 2" tag once the widget is live. */
  statusLabel: "Live",
  heading: "Assistant",
  welcome:
    "Tell me what you would automate, and I will build you a working tool in seconds.",
  suggestions: [
    "Panelise a curved facade",
    "Stack a mixed-use tower",
    "Lay out a floor plan",
  ],
  inputLabel: "Message the assistant",
  placeholder: "Describe the tool you want…",
  send: "Send",
  sending: "…",
  thinking: "Thinking",
  generating: "Building your tool",
  scoping: "Scoping your project",
  openTool: "Open your tool",
  openPitch: "See your proposal",
  restart: "Start over",
  confirm: {
    /** Shown when the assistant is ready but the visitor has not said go. */
    lead: "Ready to build",
    build: "Build it now",
    refine: "Keep refining",
    declined: "No problem — tell me what to adjust.",
  },
  errors: {
    offline: "The assistant is offline right now. Get in touch and we will answer in person.",
    rateLimited: "That was a lot of questions at once. Give it a minute and try again.",
    generic: "Something broke on our side. Try again, or get in touch directly.",
  },
} as const;

export const viewerCopy = {
  /** Browser tab and metadata for `/labs/tool`. */
  pageTitle: "Your tool",
  pageDescription: "A parametric tool generated from a conversation.",
  loading: "Opening your tool…",
  invalid: {
    title: "This link has no tool in it",
    body: "The address carries the whole tool, so a truncated or edited link leaves nothing to open. Generate a new one from the assistant on the home page.",
    cta: "Back to the assistant",
  },
  parameters: "Parameters",
  legend: "Program",
  emptyParameters: "This one has no dials — drag to orbit and look around.",
  orbitHint: "Drag to orbit · scroll to zoom",
  shareHint: "Every change is in the address bar. Copy it to share this exact version.",
  contactSubject: "About the tool your assistant built",
} as const;

export const pitchCopy = {
  problemLabel: "What you asked for",
  approachLabel: "How we would build it",
  stackLabel: "Stack",
  deliverablesLabel: "What you would get",
  timelineLabel: "Timeline",
  contactSubject: "About the project your assistant scoped",
} as const;

/**
 * The closing band: the kicker, the two optional fields, and the templates
 * the prewritten email body is assembled from. Never hardcoded in
 * `InquiryBand` or `inquiry.ts`.
 */
export const inquiryCopy = {
  kicker: "Built by",
  nameLabel: "Your name",
  namePlaceholder: "Ana Ruiz",
  /* Not "Email" — in a mailto flow the address already travels in the From
     header, so asking for it needs a reason of its own. Framed as where the
     reply should land, it earns its place: the handler that opens the draft
     is often not the account someone wants an answer at, and with no handler
     at all the draft gets copied out by hand, at which point the From header
     is gone but this line survives inside the body. */
  emailLabel: "Reply to",
  emailPlaceholder: "you@studio.com",
  /* Literally true, which is what makes it work as reassurance without
     asking for anyone's trust. */
  trust: "Both optional. Nothing leaves this page — these only fill in the draft your own mail app opens.",
  emailNudge: "That doesn't look like an address — we'll reply to whatever you send from.",

  /**
   * The prewritten email itself. Short on purpose — a starting point, not a
   * transcript of the conversation — and `draftNote` says so up front, so it
   * never reads as something the visitor supposedly wrote unprompted.
   */
  mail: {
    draftNote:
      "[This is a draft based on your conversation with the assistant — edit it however you like before sending.]",
    settingsLabel: "Settings:",
    planLabel: "Plan:",
    stackLabel: "Stack:",
    deliverablesLabel: "Deliverables:",
    timelineLabel: "Timeline:",
    linkLabel: "Link:",
    linkOmitted: "(The link is too long for an email — it's in my address bar, I'll paste it separately.)",
    moreParams: (n: number) => `…and ${n} more`,
    signoffEmail: (email: string) => `Best reached at ${email}`,
  },
} as const;

/** What the confirmation card says is about to be built. */
export const templateLabels: Record<TemplateId, string> = {
  facade: "a facade panelisation tool",
  massing: "a massing study with a program mix",
  layout: "a floor layout generator",
  freeform: "a parametric model",
  pitch: "a scoped proposal",
};

export function confirmQuestion(template: TemplateId): string {
  return template === "pitch"
    ? `This one needs your files to demo live, so I would scope it as ${templateLabels.pitch} instead. Put it together, or keep refining?`
    : `I have enough to build ${templateLabels[template]}. Build it now, or keep refining the brief?`;
}

/**
 * What the visitor reads while Sonnet works. Rotated every few seconds; the
 * last line holds until the tool arrives, so it has to survive being stared
 * at. The stages are honest about the order things happen in, even though the
 * model does them in one pass.
 */
export function progressMessages(template: TemplateId): string[] {
  const closing = ["Writing the pitch…", "Almost ready…"];

  switch (template) {
    case "facade":
      return ["Reading your brief…", "Laying out the panel grid…", "Placing the attractor…", ...closing];
    case "massing":
      return ["Reading your brief…", "Stacking the floor plates…", "Distributing the program…", ...closing];
    case "layout":
      return ["Reading your brief…", "Subdividing the floor plate…", "Sizing the rooms…", ...closing];
    case "freeform":
      return ["Reading your brief…", "Composing the geometry…", "Wiring up the sliders…", ...closing];
    case "pitch":
      return ["Reading your brief…", "Restating the problem…", "Sequencing the approach…", "Choosing the stack…", "Almost ready…"];
  }
}

/**
 * The closing argument. Two variants because the two page kinds earn their
 * claim differently: a 3D tool was *built*, a proposal was *scoped*. The
 * headline is split in two so the band can set the second half in the accent
 * colour — the claim, then the turn toward the visitor.
 */
export function closingLine(
  template: TemplateId,
  generationMs?: number,
): { headline: string; headlineAccent: string; body: string; cta: string } {
  const verb = template === "pitch" ? "Scoped" : "Built";
  /* Past half a minute the number stops being a boast — a first request for an
     archetype pays the API's one-time schema compilation and can run long, and
     "Scoped in 111 seconds" would undercut the whole page. The fallback line
     makes the same claim without a stopwatch. */
  const seconds =
    generationMs && generationMs > 0 && generationMs <= 30_000
      ? Math.max(1, Math.round(generationMs / 1000))
      : null;

  return {
    headline: seconds ? `${verb} in ${seconds} seconds.` : `${verb} from one conversation.`,
    headlineAccent: "Now build the real one.",
    body:
      template === "pitch"
        ? "That is a scope, a stack and a plan, from a few sentences you typed. Bring us the real constraints — the standards, the file formats, the deadline — and the first working version lands just as fast."
        : "This came from a short conversation and a handful of parameters. Your real project has drawings, standards and a deadline attached. That is the interesting version, and it is the one we build.",
    cta: "Let's build the real one",
  };
}
