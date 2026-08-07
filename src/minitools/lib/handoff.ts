/**
 * Belt-and-braces handoff between the chat and the tool page.
 *
 * The URL fragment is the canonical carrier — it is what makes a tool
 * shareable — but the same-tab click from the widget does not have to depend
 * on it: the widget stashes the freshly generated spec here, and the tool page
 * reads it back only when decoding the fragment fails. A visitor's first
 * sight of their tool should never be the invalid-link screen because of a
 * navigation quirk; whoever they *share* the link with still exercises the
 * URL path in full.
 *
 * Nothing here ties the stash to a particular link, so the tool page only
 * consults it on the arriving read — see `ToolViewerPage`. Applied to any
 * failed decode it would answer a stranger's broken link with whatever this
 * tab happened to generate last.
 *
 * One slot, newest wins. `sessionStorage` so it dies with the tab.
 */

import { parseSpec } from "../schema/validate";
import type { MinitoolSpec } from "../schema/spec";

const KEY = "r2ch:minitool:handoff";

export function stashSpec(spec: MinitoolSpec): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(spec));
  } catch {
    /* Storage can be unavailable (privacy modes, quota). The URL still works. */
  }
}

export function readStashedSpec(): MinitoolSpec | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    /* Kept after reading: a reload of the same failed link should recover the
       same way. The slot is overwritten on every new generation anyway. */
    return parseSpec(JSON.parse(raw));
  } catch {
    return null;
  }
}
