# Outputs, and the constraints behind them

## The files

```
public/proposals/<slug>/anim/<name>/
  <id>.svg          animated, white, CSS keyframes, no JS   10–60 KB
  <id>.gif          800×400, 24 frames, ≤32 colours         20–90 KB
  <id>.poster.svg   the end state, static                    6–21 KB
  <id>.json         the sidecar
  spec.json         the input, verbatim
```

A subfolder per animation, not a flat directory. A proposal accumulates two or
three of these plus real attachments, and `header.gif` beside `plan.pdf` beside
`network.svg` gets unnavigable fast. `spec.json` sits next to its output or the
regeneration promise is theatre.

### Why a poster exists

Proposals get printed to PDF and forwarded as attachments. An animation that
prints as its first frame prints as a blank box. The poster is the end state as
a static SVG, and it is what the `<img>` fallback, the print path and the
reduced-motion branch point at. It is also what the selftest compares the
animated file against.

## The sidecar

```json
{
  "version": 1,
  "id": "model-generation",
  "archetype": "transform",
  "title": "Automated model generation",
  "description": "A 2D site layout becomes a coordinated Revit model without anyone redrawing it.",
  "alt": "Animated diagram on a white background. Flat plates appear one by one across an isometric site grid, then rise into three-dimensional volumes…",
  "caption": "Each stage is a scripted step. The layout you send is the only input.",
  "tags": ["revit", "automation", "geometry", "massing"],
  "durationMs": 6400,
  "dimensions": { "width": 800, "height": 400 },
  "outputs": { "svg": "…", "poster": "…", "gif": "…" },
  "bytes": { "svg": 60723, "poster": 21540, "gif": 49072 },
  "generatedAt": "2026-08-07",
  "specPath": "spec.json"
}
```

Every field maps one-to-one onto a field of the `figure` block. That
correspondence is the entire reason the sidecar exists: without it, whoever wires
the animation into the proposal a week later re-invents the alt text and the
caption, and writes something worse.

## The three librsvg facts this pipeline is built around

All three measured in this repo, not assumed.

**1. librsvg ignores CSS `@keyframes` and rasterizes the declared attribute
state.** So the animated SVG can never be the GIF's input; each frame is a
separate document with its transforms baked in. And every element in the animated
file must be *declared at its end state*, or every non-browser renderer shows a
blank rectangle.

"End state" means `sample(track, duration)`, not the drawable's authored rest
values. Those differ more often than they look like they would — a caption that
hands over to the next one ends at opacity 0, and declaring it at rest stacks all
three captions on top of each other. That exact bug shipped in the first draft
and the selftest now compares the two files structurally.

**2. `letter-spacing` is honoured.** Ten glyphs at 4px come out exactly 36px
wider. The tracked-uppercase-mono house style survives into the GIF.

**3. Font resolution is by real name only.** `'JetBrains Mono'`, `monospace`,
`system-ui` and a bogus name all resolve to one bundled fallback. Real names have
to be spelled out, and `system-ui` is worthless in a stack.

## GIF encoding

`sharp` arrives as an *optional transitive* dependency of Next.js. It is pinned
in `devDependencies` so `npm ci --omit=optional` or a Next major cannot silently
remove it, and the GIF path fails soft anyway: no sharp means a printed note, no
GIF, and an exit code of zero. The SVG, poster and sidecar are already written by
then, and those are the parts a proposal cannot ship without.

### Frame delays must be an array

```js
sharp(pages, { join: { animated: true } })
  .gif({ loop: 0, delay: new Array(pages.length).fill(ms), colours: 32, dither: 0 })
```

Passed as a **scalar**, `delay` reaches only the first frame's Graphic Control
Extension; every other frame is written with a delay of zero. The result reports
the right frame count and the right dimensions, and flashes through the entire
animation in a fraction of a second. This shipped once. The selftest now parses
the GCE blocks out of the file and asserts total playback matches the spec's
duration — `sharp.metadata().delay` echoes back what it was *given*, so it
reports a healthy array for a broken file and cannot catch this.

### libvips merges identical consecutive frames

24 frames in, 18 out, and the delays of the merged run are **summed** — a
diagram that holds still at the end of its loop encodes as one long frame rather
than six. Total playback is unchanged. This is a pure size win, so anything
checking the file should assert on duration, never on page count.

### Other encoding notes

- `density: 72 × scale`, then an explicit `.resize()`. librsvg defaults to 72 dpi
  and will otherwise resize the document for you — a 800×400 SVG at density 96
  comes out 1066×533.
- `dither: 0`. Flat-colour vector art dithers badly, speckling the large white
  areas, and dithering roughly triples the file.
- 32 colours is ample: the design is ten flats plus antialiasing.
- Passing raw pixels with `{ pages, pageHeight }` throws
  `vips_image_get: field "n-pages" not found`. An array of encoded PNG buffers
  with `join: { animated: true }` is the path that works.
- Over 150 KB the CLI warns. Try `--frames 16` first; frame count is nearly
  linear in size and 16 still reads smoothly at these durations.

## Font embedding

`--embed-font` is not implemented and is deliberately left out. It would inline a
base64 WOFF2 `@font-face` for JetBrains Mono so the file is byte-identical on a
client's Mac, at the cost of 18–30 KB — roughly tripling the SVG. The
mono-anchored, never-measured layout already absorbs the ~10% substitution drift,
and the SVG is embedded in a page that loads JetBrains Mono anyway.

Add it only if a client complains about a specific rendering, and keep it off by
default.

## Where the animation is displayed

Inline, through the `figure` block — see `proposal-integration.md`. The output is
white and every proposal page is `#0a0c0b`, so the block puts it on a white plate
rather than dropping it straight onto the page, which would look like a hole
punched in it.
