/**
 * Minimal Server-Sent Events reader for the chat stream.
 *
 * `EventSource` would be the obvious tool, but it can only issue GET requests
 * and the conversation has to be POSTed. So the response body is read directly
 * and the frames — `event: <name>\ndata: <json>\n\n` — are split out here.
 */

/**
 * Handlers may be async — `onSpec` has to encode the spec into a link before
 * it can finish — and each one is awaited before the next frame is read. The
 * caller is therefore entitled to assume that when `readSseStream` resolves,
 * every handler it triggered has run to completion.
 */
export type SseHandlers = {
  onText?: (delta: string) => void | Promise<void>;
  onStatus?: (phase: string) => void | Promise<void>;
  onConfirm?: (proposal: {
    template: string;
    brief: string;
    /** Empty when the router skipped its justification. */
    why: string;
  }) => void | Promise<void>;
  onSpec?: (spec: unknown) => void | Promise<void>;
  onError?: (error: string) => void | Promise<void>;
};

async function dispatch(frame: string, handlers: SseHandlers): Promise<void> {
  let event = "";
  const dataLines: string[] = [];

  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }

  if (!event || dataLines.length === 0) return;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(dataLines.join("\n"));
  } catch {
    return;
  }

  switch (event) {
    case "text":
      if (typeof data.delta === "string") await handlers.onText?.(data.delta);
      break;
    case "status":
      if (typeof data.phase === "string") await handlers.onStatus?.(data.phase);
      break;
    case "confirm":
      if (typeof data.template === "string" && typeof data.brief === "string") {
        await handlers.onConfirm?.({
          template: data.template,
          brief: data.brief,
          /* Not part of the guard above: the proposal is still actionable
             without it, and dropping a whole build over a missing sentence
             would be the wrong trade. */
          why: typeof data.why === "string" ? data.why : "",
        });
      }
      break;
    case "spec":
      await handlers.onSpec?.(data.spec);
      break;
    case "error":
      await handlers.onError?.(
        typeof data.error === "string" ? data.error : "upstream_error",
      );
      break;
  }
}

export async function readSseStream(
  response: Response,
  handlers: SseHandlers,
): Promise<void> {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    /* Frames are separated by a blank line; anything after the last one is a
       partial frame and waits for the next chunk. */
    let split = buffer.indexOf("\n\n");
    while (split !== -1) {
      await dispatch(buffer.slice(0, split), handlers);
      buffer = buffer.slice(split + 2);
      split = buffer.indexOf("\n\n");
    }
  }
}
