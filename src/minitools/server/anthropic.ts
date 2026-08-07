import Anthropic from "@anthropic-ai/sdk";

/**
 * The one place the API key is read.
 *
 * Same shape as `getSecret()` in `src/lib/proposal-auth.ts`: returns `null`
 * rather than throwing, so the route can answer 503 and the page can say the
 * assistant is offline. There is no development fallback — without a key there
 * is no assistant, and pretending otherwise would only hide the misconfiguration.
 */
export function getApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY;
  return key && key.length > 20 ? key : null;
}

export function createClient(apiKey: string): Anthropic {
  /* One retry: a visitor is watching a chat panel, so failing fast and saying
     so beats a long silence. */
  return new Anthropic({ apiKey, maxRetries: 1 });
}

/** Cheap and fast: holds the conversation and decides when to build. */
export const ROUTER_MODEL = "claude-haiku-4-5";

/** Writes the tool configuration. Worth the step up in capability. */
export const SPEC_MODEL = "claude-sonnet-5";

/** Chat replies are two or three sentences by instruction; this is the ceiling. */
export const ROUTER_MAX_TOKENS = 512;

/** A spec plus its copy. Freeform scenes and five-step pitches are the long
    ones; a truncated JSON is unrepairable, so the ceiling errs high. */
export const SPEC_MAX_TOKENS = 4000;

/** Turns handed to the model. Older ones are dropped before the request. */
export const MAX_HISTORY = 12;
