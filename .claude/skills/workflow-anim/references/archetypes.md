# Archetype reference

Field-by-field. Read the section for the archetype you are writing; the others
will not help.

- [Shared fields](#shared-fields)
- [pipeline](#pipeline)
- [transform](#transform)
- [iterate](#iterate)
- [exchange](#exchange)
- [Choosing between them](#choosing-between-them)

---

## Shared fields

Every spec has these at the top level.

| Field | Required | Notes |
|---|---|---|
| `archetype` | yes | `pipeline` \| `transform` \| `iterate` \| `exchange` |
| `id` | no | Slug used for every output filename. Derived from the title if absent. |
| `duration` | no | Loop length in ms. Clamped to 4200–9600, default 6400. |
| `meta` | yes | See below. |

### `meta`

| Field | Required | Budget | Notes |
|---|---|---|---|
| `title` | yes | 34 chars | Set uppercase and tracked at the top left. |
| `kicker` | no | 18 chars | The side-index label on the proposal page. Derived from the title when absent. |
| `subtitle` | no | 46 chars | The line beneath. Often the "so what". |
| `description` | no | — | One sentence. Becomes the figure block's `lead`. |
| `alt` | **yes** | ≥40 chars | What a reader sees *and* what it means. |
| `caption` | no | — | Sits under the figure on the page. A caveat or a claim. |
| `tags` | no | 8 max | From `tags.md`. Unknown ones are dropped with a warning. |

`kicker` is worth setting whenever the title does not shorten gracefully. The
derivation drops leading function words and never ends on one, so "How our tools
connect" gives "Tools connect" — but it cannot know that "Cost estimate and 4D
sequence" is really about the estimate. Two words, and the rail reads cleanly.

`alt` is the only hard requirement in the whole schema. Write it as if
describing the animation over the phone: name each stage, say what moves, say
what comes out. It ends up in the `figure` block, so it is also the accessible
text a screen reader announces.

**Duration.** Under about 4.5 s a reader cannot finish before the loop restarts,
which is the single commonest failure of this kind of GIF. Over about 9 s nobody
watches twice. More stages need more time: 3 stages at 5.5 s, 5 stages at 7.2 s,
a seven-node `exchange` at 8 s.

---

## pipeline

*"You give us this, these steps run, you get that back."*

```json
{
  "archetype": "pipeline",
  "duration": 7200,
  "meta": { "...": "..." },
  "stages": [
    { "id": "model", "label": "Revit model", "sub": "Your live model", "kind": "input", "owner": "client" },
    { "id": "takeoff", "label": "Quantities", "sub": "Element by element", "kind": "process" },
    { "id": "cost", "label": "Cost estimate", "sub": "A spreadsheet", "kind": "output" }
  ],
  "flows": [
    { "from": "model", "to": "takeoff", "label": "Model file", "owner": "client" },
    { "from": "takeoff", "to": "cost", "label": "Element list" }
  ]
}
```

### `stages[]`

| Field | Required | Notes |
|---|---|---|
| `id` | no | Referenced by `flows`. Auto-generated if absent, but then you cannot write flows. |
| `label` | yes | ≤24 chars, and much less at 5+ stages — see the width table. |
| `sub` | no | ≤40 chars. The second line. Where detail goes. |
| `kind` | no | `input` \| `process` \| `output` \| `decision`. First stage defaults to `input`, the rest to `process`. |
| `owner` | no | `automated` (default) \| `manual` \| `client`. |

**`kind`** drives emphasis, not colour you choose: `output` stages get the lime
plate, `input` and `output` get a small square marker so the eye finds the two
ends first.

**`owner`** is the field that earns its keep. `automated` draws a solid border
and a connector that draws itself on — which reads as something happening by
itself. `client` and `manual` draw dashed, fade in instead of drawing, and get a
caption underneath ("YOU PROVIDE" / "MANUAL"). One diagram then says *this
becomes automatic, this stays yours* with no legend at all.

### `flows[]`

| Field | Required | Notes |
|---|---|---|
| `from`, `to` | yes | Stage ids. An unknown id drops the flow with a warning. |
| `label` | no | ≤22 chars. What travels: a file, a list, a structure. |
| `owner` | no | As above. |

Omit `flows` entirely and the stages chain in declared order with no labels —
fine for a simple sequence, but the labels are most of the value. Name what
travels.

### Label widths

Card width falls out of the stage count, so a label inside the 24-character
budget can still be too wide. Approximate room for the primary label:

| Stages | Card width | Comfortable label |
|---|---|---|
| 3 | ~213 px | 20 chars |
| 4 | ~157 px | 15 chars |
| 5 | ~120 px | 11 chars |
| 6 | ~ 95 px | 8 chars |

The renderer steps the type size down before clipping and warns when it clips.
The fix is never a smaller font: move the words into `sub`, or drop a stage.

**Artifact labels** go on the connector when the gap can hold them, and lift
above the row with a tick when it cannot. That happens automatically at 5+
stages. It means artifact labels can be longer than the gap, so keep naming them.

---

## transform

*"The same information, re-expressed, without redrawing it."*

```json
{
  "archetype": "transform",
  "duration": 6400,
  "meta": { "...": "..." },
  "stages": [
    { "label": "2D site layout", "legend": "2D", "mode": "plan" },
    { "label": "Extruding geometry", "legend": "Extrude", "mode": "extrude" },
    { "label": "3D Revit model", "legend": "3D", "mode": "model" }
  ],
  "subject": {
    "cols": 5,
    "rows": 4,
    "heights": [2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 3, 1, 4, 2, 2, 2, 3, 1, 2, 3]
  }
}
```

### `stages[]` — exactly three

| Field | Required | Notes |
|---|---|---|
| `label` | yes | ≤24 chars. Set at the top right, one at a time. |
| `legend` | no | ≤12 chars for the bottom legend. Falls back to `label`, which is usually too long. Set it. |
| `mode` | no | `plan` \| `extrude` \| `model`. Defaults by position. |

The renderer enforces three. If the process genuinely has four steps, either two
of them are one step to a client, or you want `pipeline`.

### `subject`

| Field | Required | Notes |
|---|---|---|
| `cols` | no | 2–7, default 5. |
| `rows` | no | 2–6, default 4. |
| `heights` | no | One per cell, row-major, each 1–6. Generated deterministically if absent. |

`heights` is worth setting when the real massing has a recognisable shape — a
tower and a podium, a perimeter block, a stepped section. A client who can see
their own project in the silhouette reads the whole diagram differently. Total
cells are capped at 24; past that the volumes are too small to read at 800×400.

Never randomise. The same spec has to produce the same bytes, or the `spec.json`
sitting beside the output is a promise the generator cannot keep.

---

## iterate

*"We generated many, scored them, and you chose."*

```json
{
  "archetype": "iterate",
  "duration": 7000,
  "meta": { "...": "..." },
  "total": 40,
  "variants": [
    { "id": "a", "label": "01", "score": 0.42 },
    { "id": "f", "label": "06", "score": 0.91 }
  ],
  "criteria": ["Daylight", "Net area", "Cost per m2"],
  "winner": "f",
  "selectedBy": "Reviewed with you"
}
```

| Field | Required | Notes |
|---|---|---|
| `variants[]` | yes | 4–12. More than 12 stops being readable at this size. |
| `variants[].id` | no | Needed if you want to name a `winner`. Also seeds the silhouette. |
| `variants[].label` | no | ≤6 chars. Defaults to a two-digit index. |
| `variants[].score` | no | 0–1, default 0.5. Drives the bar and the silhouette. |
| `total` | no | How many were actually studied. Never less than the tile count. |
| `criteria` | no | ≤3, ≤18 chars each. What the score means. |
| `winner` | no | A variant id. Defaults to the highest score, with a warning if the id was wrong. |
| `selectedBy` | no | Default "Reviewed with you". The most important string in the spec. |

**`selectedBy` is the point of the archetype.** The fear behind "computational
design" is that the machine decides. The line reads `REVIEWED WITH YOU > 1` in
the bottom right, and it is what turns a grid of options from a threat into a
service. Change it to match reality — "Chosen by your design team", "Shortlisted
with the cost consultant" — but do not remove it.

**`total` vs tile count.** Nine tiles standing for forty options is honest and
the caption says so: `40 OPTIONS, 9 SHOWN`. Nine tiles standing for nine options
is also fine. Nine tiles with a title claiming forty and no `total` is the kind
of small dishonesty that costs a proposal its credibility.

---

## exchange

*"Here is the toolchain, and what moves through it."*

```json
{
  "archetype": "exchange",
  "duration": 8000,
  "meta": { "...": "..." },
  "nodes": [
    { "id": "rhino", "label": "Rhino", "sub": "Concept geometry", "role": "authoring" },
    { "id": "gh", "label": "Grasshopper", "sub": "Rules", "role": "compute" },
    { "id": "cost", "label": "Cost system", "sub": "Your platform", "role": "client" }
  ],
  "links": [
    { "from": "rhino", "to": "gh", "payload": "Surfaces" },
    { "from": "gh", "to": "cost", "payload": "Priced lines", "owner": "client" }
  ],
  "hub": null
}
```

| Field | Required | Notes |
|---|---|---|
| `nodes[]` | yes | 3–7. Seven is a hard cap. |
| `nodes[].label` | yes | ≤16 chars. A tool the client can name. |
| `nodes[].sub` | no | ≤20 chars. What it holds or does. |
| `nodes[].role` | no | `authoring` \| `compute` \| `store` \| `view` \| `client`. |
| `links[]` | yes | ≤12. At least one, or it refuses to render. |
| `links[].payload` | no | ≤22 chars. **Write it.** |
| `links[].owner` | no | `automated` (default) or `client`. |
| `hub` | no | A node id to place in the centre instead of on the ring. |

**Role** decides the box treatment and the caption above or below it:
`compute` is lime and captioned AUTOMATED, `client` is dashed and captioned
YOURS, the rest are neutral. This is what answers the question the client is
actually asking — how much of this do I have to run?

**Ring order is computed, not declared.** The renderer walks the link graph and
lays nodes out in the order work travels through them, so consecutive steps end
up adjacent and most links become short arcs. Declaring them in a sensible order
still helps for anything the walk cannot reach.

**If you cannot name a payload, do not draw the link.** An unlabelled line
between two tools is a claim that they are connected, with no content. That is
the hairball this archetype exists to avoid.

---

## Choosing between them

| The client is asking… | Archetype |
|---|---|
| What do I send you and what do I get back? | `pipeline` |
| Why is this cheaper than doing it by hand? | `transform` |
| Does the computer design it? | `iterate` |
| Will this fit with the tools we already run? | `exchange` |

Some genuine ambiguities:

- **A process with a decision in it** — `pipeline` with a `decision` stage, not
  `iterate`. `iterate` is for choosing among generated options, not for a
  branch in a workflow.
- **"Show our whole service"** — usually `pipeline` at a coarse grain. Resist
  the temptation to draw every tool; that is `exchange`, and it answers a
  different question.
- **A migration or a data cleanup** — `pipeline`, with the client's messy input
  drawn `manual` and the clean output `automated`. The contrast is the argument.
- **Two of these at once** — make two animations. A diagram that answers two
  questions answers neither, and two 20 KB SVGs cost less than one crowded one.
