"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { readSseStream } from "../lib/sse";
import { CHAT_LIMITS } from "../lib/chat-limits";
import { toolHref } from "../lib/encode";
import { stashSpec } from "../lib/handoff";
import { parseSpec } from "../schema/validate";
import { ROUTABLE_TEMPLATE_IDS, type TemplateId } from "../schema/spec";
import {
  confirmQuestion,
  progressMessages,
  widgetCopy,
} from "../data/copy";

type Phase = "idle" | "streaming" | "generating" | "error";

type Entry = {
  id: number;
  role: "user" | "assistant";
  text: string;
  /** Set once a tool has been built and encoded into a link. */
  href?: string;
  linkLabel?: string;
};

/**
 * A proposal Haiku made that the visitor has not yet said yes to. `why` is the
 * one-line justification it had to write before it was allowed to propose
 * anything; empty when it skipped it.
 */
type Pending = { template: TemplateId; brief: string; why: string };

/** Maps a failed response to something a visitor can act on. */
function messageForStatus(status: number): string {
  if (status === 503) return widgetCopy.errors.offline;
  if (status === 429) return widgetCopy.errors.rateLimited;
  return widgetCopy.errors.generic;
}

/** How long each progress line holds before the next one takes over. */
const PROGRESS_STEP_MS = 2600;

/**
 * The wait, made legible: elapsed seconds, a live dot pulse, and a rotating
 * line of what is being worked on. The lines advance on a clock rather than on
 * real signals — Sonnet answers in one pass, so there is nothing to subscribe
 * to — but the last one holds until the tool actually lands. The pulse is
 * plain CSS animation, which the global reduced-motion block already freezes.
 */
function BuildProgress({ template }: { template: TemplateId }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = window.setInterval(
      () => setElapsed((Date.now() - startedAt) / 1000),
      100,
    );
    return () => window.clearInterval(interval);
  }, []);

  const lines = progressMessages(template);
  const line = lines[Math.min(Math.floor((elapsed * 1000) / PROGRESS_STEP_MS), lines.length - 1)];

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-xl border border-line bg-carbon/50 px-4 py-3"
    >
      <span aria-hidden="true" className="flex items-center gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
            style={{ animationDelay: `${dot * 220}ms` }}
          />
        ))}
      </span>
      <span className="flex-1 text-sm text-fg-muted">{line}</span>
      {/* Hidden from assistive tech: the readout changes ten times a second,
          and this region is atomic, so announcing it would re-read the whole
          panel on every tick for as long as the build runs. The rotating line
          above carries the same information at a readable pace. */}
      <span aria-hidden="true" className="font-mono text-xs tabular-nums text-accent">
        {elapsed.toFixed(1)}s
      </span>
    </div>
  );
}

/**
 * The conversational assistant in the hero.
 *
 * Lives inside `ChatPlaceholder`, whose dimensions are fixed so that mounting
 * this does not move the LCP. Everything scrollable is inside the panel, which
 * is why the message list carries `data-lenis-prevent`: without it the wheel
 * would scroll the page out from under someone reading a reply.
 *
 * Building is a two-step: when Haiku proposes a tool the server stops and this
 * shows a confirmation card, and only the visitor's yes sends the `build`
 * request that pays for Sonnet. Sending another message instead dismisses the
 * card — continuing the conversation *is* declining.
 */
export function ChatWidget() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [pending, setPending] = useState<Pending | null>(null);
  /** Which archetype the progress panel narrates while Sonnet works. */
  const [building, setBuilding] = useState<TemplateId>("facade");

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buildRef = useRef<HTMLButtonElement>(null);
  const nextId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Keep the latest line in view as the reply streams in.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [entries, phase, pending]);

  const busy = phase === "streaming" || phase === "generating";

  /**
   * The transcript is a browsable log, not a live region — announcing it as it
   * streams would read the same reply back in overlapping fragments, once per
   * token. So the finished turn is mirrored into a polite region instead, and
   * the confirmation question comes with it, since that is the part the
   * visitor has to act on. Empty while busy, which is what makes the arrival
   * of the finished text a change worth announcing.
   */
  const last = entries[entries.length - 1];
  const announcement = busy
    ? ""
    : [
        last?.role === "assistant" && last.text ? last.text : "",
        pending?.why ?? "",
        pending ? confirmQuestion(pending.template) : "",
      ]
        .filter((part) => part.length > 0)
        .join(" ");

  /* Focus follows the conversation: to the decision when there is one to make,
     back to the input when the turn is over. Without this the visitor is left
     wherever the browser dropped them. `preventScroll` because a reply can
     land while they are reading further down the page, and Lenis owns the
     scroll position — the focus should move, the page should not. */
  useEffect(() => {
    if (busy) return;
    if (pending) buildRef.current?.focus({ preventScroll: true });
    else if (entries.length > 0) inputRef.current?.focus({ preventScroll: true });
  }, [busy, pending, entries.length]);

  /* Two rules, both of them the server's: never send an empty turn — the
     router answers a ready-enough message with a tool call and no text, and
     an empty message is not a thing the API accepts — and never send more
     turns than the model is given anyway. */
  const historyOf = (list: Entry[]) =>
    list
      .filter((entry) => entry.text.trim().length > 0)
      .slice(-CHAT_LIMITS.historyMessages)
      .map((entry) => ({ role: entry.role, content: entry.text }));

  /**
   * POSTs one request and folds its stream into the entry `replyId`. Both the
   * chat turn and the build go-ahead run through here; they only differ in the
   * body and in which events they expect back. Reports whether the exchange
   * delivered what it promised, so a failed build can offer itself again.
   */
  const runStream = useCallback(
    async (
      body: Record<string, unknown>,
      replyId: number,
    ): Promise<"ok" | "failed" | "aborted"> => {
      let failed = false;
      const update = (patch: (entry: Entry) => Entry) =>
        setEntries((current) =>
          current.map((entry) => (entry.id === replyId ? patch(entry) : entry)),
        );

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/minitools-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          update((entry) => ({ ...entry, text: messageForStatus(response.status) }));
          setPhase("error");
          return "failed";
        }

        await readSseStream(response, {
          onText: (delta) =>
            update((entry) => ({ ...entry, text: entry.text + delta })),

          onConfirm: (proposal) => {
            if (
              (ROUTABLE_TEMPLATE_IDS as readonly string[]).includes(proposal.template)
            ) {
              setPending({
                template: proposal.template as TemplateId,
                brief: proposal.brief,
                why: proposal.why,
              });
            }
          },

          onStatus: (value) => {
            if (value === "generating") setPhase("generating");
          },

          onSpec: async (raw) => {
            /* Validated again on this side: the link is built from it, and a
               spec that cannot be parsed would produce a dead URL. */
            const spec = parseSpec(raw);
            if (!spec) return;

            /* Same-tab safety net: the tool page falls back to this stash if
               anything mangles the fragment on the way over. */
            stashSpec(spec);

            const href = await toolHref(spec);
            update((entry) => ({
              ...entry,
              text: entry.text || spec.meta.title,
              href,
              linkLabel:
                spec.template === "pitch" ? widgetCopy.openPitch : widgetCopy.openTool,
            }));
          },

          onError: () => {
            failed = true;
            update((entry) => ({
              ...entry,
              text: entry.text || widgetCopy.errors.generic,
            }));
          },
        });

        setPhase("idle");
        return failed ? "failed" : "ok";
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return "aborted";
        update((entry) => ({ ...entry, text: widgetCopy.errors.generic }));
        setPhase("error");
        return "failed";
      } finally {
        abortRef.current = null;

        /* A router turn that went straight to a tool call leaves this entry
           with nothing in it. Dropping it keeps the transcript free of blank
           bubbles and, more to the point, out of the next request. */
        setEntries((current) =>
          current.filter(
            (entry) =>
              entry.id !== replyId ||
              entry.text.trim().length > 0 ||
              entry.href !== undefined,
          ),
        );
      }
    },
    [],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || phase === "streaming" || phase === "generating") return;

      // Typing onward instead of confirming is an answer: not now.
      setPending(null);

      const userEntry: Entry = { id: nextId.current++, role: "user", text: trimmed };
      const replyId = nextId.current++;
      const history = historyOf([...entries, userEntry]);

      setEntries((current) => [
        ...current,
        userEntry,
        { id: replyId, role: "assistant", text: "" },
      ]);
      setDraft("");
      setPhase("streaming");

      await runStream({ messages: history }, replyId);
    },
    [entries, phase, runStream],
  );

  const build = useCallback(async () => {
    if (!pending || phase === "streaming" || phase === "generating") return;

    const replyId = nextId.current++;
    const history = historyOf(entries);

    setEntries((current) => [...current, { id: replyId, role: "assistant", text: "" }]);
    setPhase("generating");

    const request = pending;
    setBuilding(request.template);
    setPending(null);

    /* Only the two fields the server reads. `why` was written for this card
       and has done its job; sending it on would put it in front of Sonnet as
       if it were part of the brief. */
    const outcome = await runStream(
      { messages: history, build: { template: request.template, brief: request.brief } },
      replyId,
    );

    /* Generation can fail transiently — an overloaded upstream, or the first
       request for an archetype paying its one-time schema compilation. The
       card comes back so the visitor can just press Build again instead of
       reconstructing the conversation. */
    if (outcome === "failed") setPending(request);
  }, [entries, pending, phase, runStream]);

  const decline = useCallback(() => {
    setPending(null);
    setEntries((current) => [
      ...current,
      { id: nextId.current++, role: "assistant", text: widgetCopy.confirm.declined },
    ]);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <div
        ref={listRef}
        data-lenis-prevent
        role="log"
        /* Off on purpose: the finished turn is announced through the region
           above, so streaming does not read a growing fragment on every SSE
           delta. The log itself stays browsable. */
        aria-live="off"
        aria-label={widgetCopy.heading}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
      >
        {entries.length === 0 ? (
          <div>
            <p className="max-w-[34ch] text-sm leading-relaxed text-fg-muted">
              {widgetCopy.welcome}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {widgetCopy.suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="rounded-full border border-line px-3 py-1.5 text-xs text-fg-muted transition-colors duration-200 hover:border-accent hover:text-accent"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className={entry.role === "user" ? "flex justify-end" : ""}
              >
                <div
                  className={
                    entry.role === "user"
                      ? "max-w-[85%] rounded-xl rounded-br-sm bg-graphite-hi px-3 py-2 text-sm text-fg"
                      : "max-w-[92%] text-sm leading-relaxed text-fg-muted"
                  }
                >
                  {entry.text}
                  {entry.role === "assistant" && !entry.text && phase === "streaming" ? (
                    <span className="text-fg-muted">{widgetCopy.thinking}…</span>
                  ) : null}

                  {entry.href ? (
                    <Link
                      href={entry.href}
                      /* `flex w-fit`, not inline: on its own line below the
                         title instead of crowding the last line of text. */
                      className="mt-3 flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-xs tracking-wide text-carbon uppercase transition-colors duration-200 hover:bg-accent-dim"
                    >
                      {entry.linkLabel ?? widgetCopy.openTool}
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}

            {pending && !busy ? (
              <li>
                <div className="rounded-xl border border-accent/40 bg-carbon/50 px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                    {widgetCopy.confirm.lead}
                  </p>
                  {/* The router's own sentence leads, because it is the only
                      line on the card that is about the visitor's project
                      rather than about ours. The question follows in a
                      quieter tone: by the time they read it they already know
                      what they are saying yes to. */}
                  {pending.why ? (
                    <p className="mt-2 text-sm leading-relaxed text-fg">{pending.why}</p>
                  ) : null}
                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed",
                      pending.why ? "text-fg-muted" : "text-fg",
                    )}
                  >
                    {confirmQuestion(pending.template)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      ref={buildRef}
                      type="button"
                      onClick={() => void build()}
                      className="rounded-full bg-accent px-4 py-2 font-mono text-xs tracking-wide text-carbon uppercase transition-colors duration-200 hover:bg-accent-dim"
                    >
                      {widgetCopy.confirm.build}
                    </button>
                    <button
                      type="button"
                      onClick={decline}
                      className="rounded-full border border-line px-4 py-2 font-mono text-xs tracking-wide text-fg-muted uppercase transition-colors duration-200 hover:border-accent hover:text-accent"
                    >
                      {widgetCopy.confirm.refine}
                    </button>
                  </div>
                </div>
              </li>
            ) : null}

            {phase === "generating" ? (
              <li>
                <BuildProgress template={building} />
              </li>
            ) : null}
          </ul>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
        className="flex items-end gap-2 border-t border-line px-3 py-3"
      >
        <label htmlFor="minitools-input" className="sr-only">
          {widgetCopy.inputLabel}
        </label>
        {/* `readOnly` rather than `disabled` while a turn is in flight:
            disabling the element the visitor is typing in blurs it, and the
            browser drops focus to the document body on every single message.
            `send` already refuses to run while busy. */}
        <textarea
          ref={inputRef}
          id="minitools-input"
          rows={1}
          value={draft}
          readOnly={busy}
          aria-disabled={busy}
          maxLength={CHAT_LIMITS.messageChars}
          placeholder={widgetCopy.placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends; Shift+Enter is a newline, as in every chat ever.
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send(draft);
            }
          }}
          className={cn(
            "max-h-24 min-h-9 flex-1 resize-none rounded-lg border border-line bg-carbon/60 px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none",
            busy && "opacity-50",
          )}
        />
        <button
          type="submit"
          aria-disabled={busy || draft.trim().length === 0}
          className={cn(
            "rounded-lg bg-accent px-3 py-2 font-mono text-xs tracking-wide text-carbon uppercase transition-colors duration-200 hover:bg-accent-dim",
            (busy || draft.trim().length === 0) && "cursor-not-allowed opacity-40",
          )}
        >
          {busy ? widgetCopy.sending : widgetCopy.send}
        </button>
      </form>
    </div>
  );
}
