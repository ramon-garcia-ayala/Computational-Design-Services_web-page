import { readFile } from "node:fs/promises";
import path from "node:path";

/* The sales deck at /presentation, a link that can be sent to a client.

   The deck stays a standalone file, `presentation/value-deck.html`, and this
   serves it as it is rather than a copy in `public/`: a second copy drifts
   from the one being edited, which is exactly what the deck's own assets
   were cleaned of. It is read at build time (`force-static`), so the
   response is a static file and the deployed function never needs the
   source on disk.

   The deck reaches the site's images as `../public/…`, which resolves when
   the file is opened from the repo root. On the site `public/` is the web
   root, so that prefix becomes `/`. Nothing else in the file is touched.

   Not for search engines, same as the proposals: it is shared by link. */
export const dynamic = "force-static";

const DECK = path.join(process.cwd(), "presentation", "value-deck.html");

export async function GET() {
  const html = await readFile(DECK, "utf8");

  return new Response(html.replaceAll("../public/", "/"), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
