# The visual system

Read this to change the renderer. Nothing here is reachable from a spec, and
that is deliberate — a spec that could set a colour is a spec that produces four
archetypes in four palettes.

## Palette

Derived from the `@theme` block in `src/app/globals.css`, inverted for paper.
The site is carbon; these are white, because they get printed, pasted into decks
and emailed, and a dark rectangle does none of those well.

| Token | Hex | From | Used for |
|---|---|---|---|
| `paper` | `#ffffff` | — | Background. Not off-white: white keeps the GIF palette small and prints clean. |
| `ink` | `#0a0c0b` | `carbon` unchanged | Every stroke, all primary text. This is what keeps it the brand. |
| `ink2` | `#4a524d` | `fg-muted` darkened | Secondary labels, connector captions. |
| `ink3` | `#8a918c` | `fg-muted` unchanged | Ghost strokes, inactive legend dots, "not yet". |
| `rule` | `#d8dcd6` | `line` inverted | Isometric ground grid, hairlines, ticks. |
| `ruleSoft` | `#eceee9` | `line-soft` inverted | Pattern fills, the baseline. |
| `lime` | `#c8f94e` | `accent` unchanged | **Fill only.** |
| `limeDeep` | `#8fb52e` | `accent-dim` darkened | The only legal lime stroke: a 1px outline containing a lime fill. |
| `wash` | `#f4f6f1` | lime at ~6% over paper | The "done" / inactive plate. |
| `surface` | `#f7f8f6` | — | Card fill behind a label. |

### Lime is never a line, always a plane

`#c8f94e` on white is about 1.4:1. As a stroke it is invisible; as a fill under
black ink it is unmistakably the brand. Every appearance of lime in this renderer
is a filled shape with an ink stroke around it.

It is also spent sparingly. Twenty lime volumes on white is a highlighter, not a
drawing, and it uses up the accent before the diagram has anything to say with
it. In `transform` the massing is white with grey shading and the lime arrives
only on the roofs, at the moment the third stage says the model is built.

### Semantic states

The spec sets state; the renderer maps state to colour.

| State | Fill | Stroke |
|---|---|---|
| `active` | lime | ink |
| `done` | wash | ink |
| `pending` | none | ink3, dashed `4 4` |

| Owner | Stroke | Reads as |
|---|---|---|
| `automated` | ink, solid, 1.5 | Ours, runs by itself |
| `manual` / `client` | ink2, dashed `5 4`, 1.25 | Theirs, a person does it |

Solid-versus-dashed is inherited from technical drawing — built versus proposed —
and from the site's own `FlowDiagram`. Anyone who reads drawings gets it without
a legend, which is why one diagram can say *this becomes automatic, this stays
yours* in no words at all.

## Type

Everything is mono, uppercase, tracked. That is not a style choice, it is the
mechanism that keeps the SVG and the GIF looking alike.

```
'JetBrains Mono','Cascadia Mono',Consolas,'DejaVu Sans Mono',ui-monospace,monospace
```

**Measured on this machine:** librsvg resolves `'JetBrains Mono'`, `monospace`
and a deliberately bogus name to the same bundled fallback, 97px advance for ten
glyphs, where Consolas is 108px — a 10% drift. A *proportional* stack drifts 33%
between Arial and the same fallback. Mono keeps the error small enough that
generous gutters absorb it.

One display stack is allowed for a title: `'Sora','Segoe UI',Arial,Helvetica,
sans-serif`. **`system-ui` must never appear in it** — librsvg falls through it
to the same default as a name that does not exist, so the GIF would silently get
the generic face.

`letter-spacing` **is** honoured by librsvg (verified: ten glyphs at 4px come out
exactly 36px wider), so the tracked look survives into the GIF.

| Role | Size | Tracking | Weight |
|---|---|---|---|
| title | 13 | 2.2 | 700 |
| subtitle | 9 | 1.6 | 400 |
| label | 11 | 1.1 | 600 |
| sub | 8.5 | 0.8 | 400 |
| artifact | 8 | 1.0 | 400 |
| legend | 8 | 1.4 | 500 |
| figure | 10 | 0.6 | 700 |

### Never measure text

No box is sized from a measured string. Widths come from
`MONO_ADVANCE = 0.6 × size`, and every label is anchored geometrically. If the
font substitutes wider, text is slightly wider inside a box that was already
generous — nothing collides and nothing reflows.

`fitText()` steps the size down before clipping, because a point smaller than
its neighbours is invisible and a truncated word is not. When it does clip it
returns `clipped: true` and the archetype pushes a note the CLI prints.

Text is never converted to paths. That would kill selection and screen readers,
destroy the size advantage, and there is no font parser in the repo to do it
with.

## Canvas and chrome

800 × 400, with the archetype confined to a stage box inset 76 / 40 / 62 / 40
(top / right / bottom / left). Everything outside belongs to the shared chrome:

- **Top left:** a lime status dot with an ink ring, the tracked title, the
  subtitle beneath.
- **Bottom left:** the stage legend — a dot and a word per stage. The dot fills
  lime and the word darkens as its stage begins, and both stay.
- **Above the legend:** a hairline tying the composition to the bottom edge.

The chrome is what makes four archetypes look like one family, and it means each
archetype only has to lay out the middle.

**The legend is not decoration.** A looping animation is joined halfway by most
readers, and the lit dots are the only thing that tells them where in the story
they landed.

## Isometric projection

True 30° axonometric, not the 2:1 pixel-isometric of game art. We rasterize at
2× with antialiasing so the pixel-crispness argument for 2:1 does not apply, and
30° is what an architect reads off a drawing sheet.

```
sx = (x − z) · cos30 · s
sy = (x + z) · sin30 · s − y · s
```

Right-handed, +y up. `x` goes right-and-down the page, `z` left-and-down.

### Depth order without a sorter

Solids are restricted to axis-aligned boxes on an integer grid, and painted in
ascending `(x + y + z)`. For that case the order is provably back-to-front: no
ties, no BSP tree.

Centroid sorting is the obvious alternative and it is worse in a way that only
shows up in motion: two nearly-equal centroids can swap between consecutive
frames, which flickers on screen and destroys the frame-to-frame coherence the
GIF encoder compresses on. Grid order depends only on position, never on the
animation, so it is stable by construction.

### Faces

Each box is three parallelograms — top, left, right — shaded from one base
colour at ×1.00 / ×0.86 / ×0.72. A three-dimensional look for three `<path>`s
and no lighting model. A ghost box draws the same three faces unfilled and
dashed.

The ground grid is one `<path>` of concatenated segments rather than 200 lines:
cheap in bytes, cheap in the GIF's colour count, and it reads as a site plan
under the massing.

## Animation

Four easing curves, defined once in `lib/easing.mjs` as both a CSS
`cubic-bezier` string and a JS solver from the same table:

| Name | Curve | For |
|---|---|---|
| `linear` | — | Holds, opacity switches |
| `out` | `.22,1,.36,1` | Things arriving. The default. |
| `inOut` | `.65,0,.35,1` | Things moving between two places |
| `step` | `steps(1,end)` | State changes with no in-between |

Channels: `opacity`, `tx`, `ty`, `scale`, `scaleX`, `scaleY`, `rotate`, `dash`.

There is deliberately **no general-purpose "progress" channel** an archetype
interprets for itself. Such a channel could not be expressed as CSS, so the SVG
would re-emit that drawable per frame while the GIF sampled it — two code paths
for one effect, which is exactly the divergence the architecture exists to
prevent. Everything a diagram needs is reachable from a transform about a chosen
origin: a bar grows with `scaleX` from its left edge, a volume extrudes with
`scaleY` from its base.

### A line cannot both draw itself on and look dashed

Both need `stroke-dasharray`. That constraint turned out to be the grammar
rather than a limitation: a line that draws itself reads as something happening
automatically, so solid connectors draw on and dashed ones fade in — which is
exactly the automated-versus-manual distinction.

Use `line({ drawOn: { at, dur } })` rather than building a dash track by hand.
`stroke-dashoffset` wraps modulo `stroke-dasharray`, so an offset that does not
exactly equal the path's own length does not hide the line — it reveals a stub of
the difference, which sits floating in the gap for half the animation.
