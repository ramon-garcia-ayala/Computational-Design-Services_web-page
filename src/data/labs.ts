/**
 * Every word on `/labs`.
 *
 * This route used to be a "coming soon" placeholder, deliberately kept apart
 * from the Home page's chat assistant — an earlier version of this copy
 * conflated the two, describing the assistant as if it were this page's own
 * content, and got pulled apart into the assistant staying on Home and this
 * page staying empty. That split is now the other way round: the assistant
 * ("Playground · Try it yourself") no longer lives on the landing page at
 * all, and `/labs` — reachable only from the menu's "Labs" link, never from
 * Home's own scroll — is the only place it lives. `playground` is the copy
 * for that block specifically; `kicker`/`title`/`lead` are the page's own
 * intro above it.
 */
export const labsCopy = {
  kicker: "Labs",
  title: "The studio's own playground",
  lead: "Prototypes and small open tools land here as they're ready. The first one — a live parametric assistant — already has.",
  playground: {
    kicker: "Playground",
    title: "Try it yourself",
    /* Transcoded from the supplied .mov: the source is HEVC, which Chrome
       and Firefox cannot decode at all, so the container was never the
       problem — the codec was. See scripts note in the panels README. */
    video: "/videos/panels/labs-loop.mp4",
  },
};
