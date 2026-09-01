# Client portal — private documents

Files here are served only through `/api/portal/file/[...path]`, which checks
the visitor's session cookie against the first path segment before reading
anything. Nothing in this directory is reachable any other way: it sits
outside `public/`, so Next never serves it as a static asset.

## Adding a file for a client

1. Drop the file at `private/portal/<slug>/<name>`, matching the client's
   `slug` in `src/data/portal/<slug>/index.ts`.
2. Reference it from that client's `documents` array with
   `{ file: "<name>" }` (a path relative to the client's own folder — the
   route prefixes it with the slug and the private root).
3. Redeploy. `next.config.ts`'s `outputFileTracingIncludes` bundles this
   whole directory into the file route's function — without a fresh deploy,
   a file added after the last build will 404 in production even though it
   works locally.

Never commit anything here that was not meant for that specific client: the
route trusts the folder structure, not the file contents, to keep one
client's documents from another's.
