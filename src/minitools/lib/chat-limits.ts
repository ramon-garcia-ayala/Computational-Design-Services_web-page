/**
 * The bounds the chat is held to, on both sides of the wire.
 *
 * The widget and the route that answers it have to agree on these: the server
 * rejects an over-long message or an over-long history outright, and a
 * rejection is not recoverable in the widget — the offending turn stays in the
 * transcript and every later request carries it again. So the widget enforces
 * the same numbers up front, and the server's checks become the guard against
 * a caller that is not the widget rather than something a visitor can trip.
 *
 * Deliberately free of imports so both a client component and a route handler
 * can read it.
 */
export const CHAT_LIMITS = {
  /** Longest single message. The textarea caps it; the server checks it again. */
  messageChars: 2000,

  /** Turns actually sent to the model. The widget trims to this before posting. */
  historyMessages: 12,

  /**
   * Hard ceiling on an incoming payload. Above the widget's own budget on
   * purpose: it is a bound on abuse, not a limit a conversation can reach.
   */
  incomingMessages: 16,
} as const;
