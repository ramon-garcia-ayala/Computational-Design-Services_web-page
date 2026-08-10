import { NextResponse, type NextRequest } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import {
  ROUTER_MAX_TOKENS,
  ROUTER_MODEL,
  SPEC_MAX_TOKENS,
  SPEC_MODEL,
  createClient,
  getApiKey,
} from "./anthropic";
import { ROUTER_SYSTEM, SPEC_SYSTEM, specInstruction } from "./prompts";
import { specSchemaFor } from "../schema/json-schema";
import { parseSpec } from "../schema/validate";
import { ROUTABLE_TEMPLATE_IDS, type MinitoolSpec, type TemplateId } from "../schema/spec";
import { fallbackSpec, presetFor } from "../data/presets";
import { CHAT_LIMITS } from "../lib/chat-limits";
import { clientIp, withinRateLimit } from "../lib/rate-limit";

/**
 * The assistant behind the hero chat.
 *
 * Two models, and the visitor stands between them. Haiku holds the
 * conversation and decides when there is enough to build on; when it calls its
 * tool the server does NOT run Sonnet — it emits a `confirm` frame and stops,
 * and the widget asks the visitor whether to build or keep refining. Only a
 * follow-up request carrying `build` reaches Sonnet. Small talk therefore
 * never touches the expensive model, and neither does a proposal the visitor
 * walks away from.
 *
 * The `build` payload comes back from the client, but it is no more trusted
 * than any chat message: the template is checked against the enum and the
 * brief is just text with a length cap, exactly what Haiku would have handed
 * over directly.
 *
 * The reply streams as Server-Sent Events, which is why this returns a bare
 * `Response` rather than the `NextResponse.json` the rest of the app uses —
 * that would buffer the whole answer and lose the point of streaming. Errors
 * raised before the stream opens still follow the usual convention.
 */

type ChatMessage = { role: "user" | "assistant"; content: string };

type BuildRequest = { template: TemplateId; brief: string };

const encoder = new TextEncoder();

function frame(event: string, data: Record<string, unknown>): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/** The router's only tool. Calling it is how it says "build this now". */
const CREATE_TOOL: Anthropic.Tool = {
  name: "create_minitool",
  description:
    "Build and hand over a parametric mini tool. Call this once you know what the visitor wants and one or two properties that matter.",
  input_schema: {
    type: "object",
    properties: {
      template: {
        type: "string",
        enum: [...ROUTABLE_TEMPLATE_IDS],
        description:
          "The archetype that can honestly demonstrate the request. Use `pitch` when a live browser demo cannot stand in for the work.",
      },
      brief: {
        type: "string",
        description:
          "Everything known about what the visitor wants, in one paragraph and in their own terms.",
      },
      /* The gate. Naming what decides the choice is what stops a one-line
         brief being routed on its first keyword, and since the sentence is
         shown on the confirmation card it also tells the visitor what the
         tool is going to be built around before they pay any attention to
         it. Required, because an optional justification is one the model
         skips exactly when it is least sure. */
      why: {
        type: "string",
        description:
          "One sentence for the visitor, naming the thing in their request that decides which archetype this is. No archetype names — they mean nothing outside our code.",
      },
    },
    required: ["template", "brief", "why"],
  },
};

function parseMessages(payload: unknown): ChatMessage[] | null {
  if (typeof payload !== "object" || payload === null) return null;

  const raw = (payload as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > CHAT_LIMITS.incomingMessages) {
    return null;
  }

  const messages: ChatMessage[] = [];

  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) return null;
    const { role, content } = entry as { role?: unknown; content?: unknown };

    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    if (content.length > CHAT_LIMITS.messageChars) return null;

    /* An empty turn is dropped rather than rejected. The router answers a
       ready-enough first message with a tool call and no text at all, which
       leaves the widget holding a blank assistant entry; failing the whole
       payload over it would 400 every request from that point on, including
       the build the visitor just confirmed. */
    const trimmed = content.trim();
    if (!trimmed) continue;

    messages.push({ role, content: trimmed });
  }

  /* Only the tail is worth paying for, and the API needs the first turn to be
     the visitor's — so anything the truncation left dangling goes too. */
  const tail = messages.slice(-CHAT_LIMITS.historyMessages);
  while (tail.length > 0 && tail[0].role !== "user") tail.shift();

  return tail.length > 0 ? tail : null;
}

/**
 * The go-ahead a confirmed visitor sends back. `undefined` when this is an
 * ordinary chat turn, `null` when a `build` field is present but unusable.
 */
function parseBuild(payload: unknown): BuildRequest | null | undefined {
  const raw = (payload as { build?: unknown }).build;
  if (raw === undefined) return undefined;

  if (typeof raw !== "object" || raw === null) return null;
  const { template, brief } = raw as { template?: unknown; brief?: unknown };

  if (
    typeof template !== "string" ||
    !(ROUTABLE_TEMPLATE_IDS as readonly string[]).includes(template) ||
    typeof brief !== "string"
  ) {
    return null;
  }

  const trimmed = brief.trim();
  if (!trimmed || trimmed.length > CHAT_LIMITS.messageChars) return null;

  return { template: template as TemplateId, brief: trimmed };
}

/**
 * Streams the conversational reply and reports whether the model decided to
 * build something.
 */
async function runRouter(
  client: Anthropic,
  messages: ChatMessage[],
  emit: (chunk: Uint8Array) => void,
): Promise<{ template: TemplateId; brief: string; why: string } | null> {
  const stream = client.messages.stream({
    model: ROUTER_MODEL,
    max_tokens: ROUTER_MAX_TOKENS,
    system: ROUTER_SYSTEM,
    tools: [CREATE_TOOL],
    messages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      emit(frame("text", { delta: event.delta.text }));
    }
  }

  const message = await stream.finalMessage();

  for (const block of message.content) {
    if (block.type !== "tool_use" || block.name !== CREATE_TOOL.name) continue;

    const input = block.input as { template?: unknown; brief?: unknown; why?: unknown };
    const template = input.template;
    const brief = input.brief;
    const why = input.why;

    if (
      typeof template === "string" &&
      (ROUTABLE_TEMPLATE_IDS as readonly string[]).includes(template) &&
      typeof brief === "string" &&
      brief.trim().length > 0
    ) {
      /* `why` is required of the model but not of this branch: it is a gate on
         the model's reasoning, and a build that is otherwise well-formed is
         not worth throwing away over a missing sentence. The card falls back
         to its own question when there is nothing to show. */
      return {
        template: template as TemplateId,
        brief: brief.trim(),
        why: typeof why === "string" ? why.trim().slice(0, CHAT_LIMITS.messageChars) : "",
      };
    }
  }

  return null;
}

/** Writes the configuration. Structured output, so the shape is guaranteed. */
async function runSpec(
  client: Anthropic,
  template: TemplateId,
  brief: string,
): Promise<MinitoolSpec | null> {
  const schema = specSchemaFor(template);
  if (!schema) return null;

  const message = await client.messages.create(
    {
      model: SPEC_MODEL,
      max_tokens: SPEC_MAX_TOKENS,
      system: SPEC_SYSTEM,
      /* Sonnet 5 thinks by default. A spec is a well-specified filling-in job,
         and the demo's whole claim is that it lands in seconds. */
      thinking: { type: "disabled" },
      output_config: { format: { type: "json_schema", schema } },
      messages: [
        {
          role: "user",
          content: specInstruction(template, brief, presetFor(template) ?? undefined),
        },
      ],
    },
    /* The client fails fast (one retry) so chat turns feel alive; this call is
       the one the visitor already confirmed and is watching a progress bar
       for, so an overloaded-API blip is worth riding out. */
    { maxRetries: 3 },
  );

  /* A truncated object is not repairable, and a refusal has no content to
     read. Either way the client hears `generation_failed`. */
  if (message.stop_reason === "max_tokens" || message.stop_reason === "refusal") {
    console.error(
      `[minitools] spec generation stopped: ${message.stop_reason} (template ${template})`,
    );
    return null;
  }

  const text = message.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") {
    console.error(`[minitools] spec response had no text block (template ${template})`);
    return null;
  }

  try {
    const spec = parseSpec(JSON.parse(text.text));
    if (!spec) {
      console.error(`[minitools] spec failed validation (template ${template})`);
    }
    return spec;
  } catch (error) {
    console.error(`[minitools] spec was not valid JSON (template ${template})`, error);
    return null;
  }
}

export async function handleMinitoolsChat(request: NextRequest): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return fail("bad_request", 400);
  }

  const messages = parseMessages(payload);
  if (!messages) return fail("bad_request", 400);

  const build = parseBuild(payload);
  if (build === null) return fail("bad_request", 400);

  if (!withinRateLimit(clientIp(request.headers))) {
    return fail("rate_limited", 429);
  }

  const apiKey = getApiKey();
  if (!apiKey) return fail("not_configured", 503);

  const client = createClient(apiKey);
  const startedAt = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let open = true;

      /* The visitor can close the tab mid-answer; enqueueing into a cancelled
         stream throws, and that is not an error worth reporting. */
      const emit = (chunk: Uint8Array) => {
        if (!open) return;
        try {
          controller.enqueue(chunk);
        } catch {
          open = false;
        }
      };

      try {
        if (build) {
          emit(frame("status", { phase: "generating", template: build.template }));

          const generated = await runSpec(client, build.template, build.brief);

          /* A visitor who pressed Build and got an error learned nothing about
             the studio. The archetype's preset is a working tool of the same
             kind, and `fallbackSpec` relabels it so that nobody is told it was
             built for them. */
          const spec = generated ?? fallbackSpec(build.template);

          if (spec) {
            emit(
              frame("spec", {
                spec: {
                  ...spec,
                  /* Only a real build gets to claim a time. The preset was
                     written months ago; "built in 0.4 seconds" over someone
                     else's numbers is the kind of boast that reads as a lie
                     the moment the tagline underneath admits the swap. */
                  meta: generated
                    ? { ...spec.meta, generationMs: Date.now() - startedAt }
                    : spec.meta,
                },
              }),
            );
          }

          /* Emitted after the spec, not instead of it. The frame is what
             brings the confirmation card back on the client, so retrying a
             transient failure — an overloaded upstream, or a first request
             paying the schema's one-time compilation — stays one click, and
             the visitor has something to look at in the meantime. */
          if (!generated) {
            emit(frame("error", { error: "generation_failed" }));
          }
        } else {
          const proposal = await runRouter(client, messages, emit);

          /* The tool call is a proposal, not an order: the visitor gets the
             last word, and Sonnet is not paid for until they give it. */
          if (proposal) {
            emit(
              frame("confirm", {
                template: proposal.template,
                brief: proposal.brief,
                why: proposal.why,
              }),
            );
          }
        }

        emit(frame("done", {}));
      } catch (error) {
        /* The one place every model-call failure lands. Without this line the
           visitor's "something broke" is undiagnosable, here and in the
           Vercel logs alike. */
        console.error(
          `[minitools] chat stream failed (${build ? `build ${build.template}` : "chat"})`,
          error,
        );
        emit(frame("error", { error: "upstream_error" }));
      } finally {
        if (open) controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
