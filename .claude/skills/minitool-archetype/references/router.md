# The router entry and the preset

These are the two pieces of prose in an archetype, and they decide more about
whether it works than any of the code does. An archetype the router never picks
is dead weight; one it picks for the wrong requests is worse, because the
visitor gets a confident answer to a question they did not ask.

## The router entry

It lives in the archetype list of `ROUTER_SYSTEM` (`src/minitools/server/prompts.ts`)
and has two parts, always in this order:

1. **What it is**, in the visitor's vocabulary rather than ours — the requests
   it answers, not the geometry it produces.
2. **What it is not**, naming the nearest existing archetype and the condition
   that separates them.

```
- `xxx` — <what it is>: <three or four kinds of request it answers>. The
  subject is <the thing the tool is actually about>. Not this if <condition>:
  that is `<neighbour>`, and <why the difference matters>.
```

The second half is the part that earns its tokens. Compare:

> `massing` — stacked floor plates with a program mix: towers, mixed-use
> blocks, envelope and area studies.

against what is actually in the file:

> `massing` — stacked floor plates with a program mix: towers, mixed-use
> blocks, envelope and area studies. The subject is the whole volume and what
> sits in it. **Not this for a single storey: many floors seen from outside is
> `massing`, one floor seen from above is `layout`.**

The first version routes "I want to see how a floor could be laid out in a
tower" wrong roughly half the time. The second gives the model the exact
sentence it needs to decide.

**Write the "not" clause before anything else.** If you cannot finish it, the
archetype is a variation on something already here and should be a preset
instead. This is the same test the router now has to pass at runtime — the
`why` field on `create_minitool` — so failing it here is the cheap version.

### Where the entry goes in the list

Order is specific to general. `freeform` and `pitch` stay last because they are
the two catch-alls, and a model reading top-down should reach them only after
everything narrower has failed. A new archetype almost always belongs above
`freeform`.

### Keep it to one bullet

The list is read on every single chat turn, including "what do you do?". Three
sentences per archetype is the budget. If yours needs a paragraph to be
distinguishable, the boundary is wrong, not the description.

## The `why` gate

`create_minitool` requires a `why`: one sentence for the visitor naming what in
their request decides the archetype. It is a gate in two directions. It forces
the model to articulate the discriminator before it is allowed to propose
anything, which is where a keyword-triggered wrong answer usually falls apart.
And the visitor reads it on the confirmation card, so it is also the last
chance to catch a bad route before Sonnet is paid for.

You do not write the `why` — the router does, per conversation. But your entry
is what makes a good one possible: if your bullet gives it no discriminating
condition, it has nothing to say.

## The preset

One hand-written spec in `src/minitools/data/presets/`, doing three jobs.

**It is the few-shot example.** The JSON Schema already guarantees the shape,
so the only thing left for an example to teach is judgement: what a considered
set of numbers looks like for this archetype, and what a title sounds like when
it is not marketing. This is where most of the quality comes from, and it is
much cheaper than prompt instructions.

**It is the fallback.** When generation fails — an overloaded upstream, a first
request paying the schema's one-time compilation — `fallbackSpec` serves the
preset with a tagline that says plainly what happened. The visitor gets a
working tool instead of an error, and the confirmation card still comes back so
retrying is one click.

**It is how you look at your own work.** `node scripts/minitool-link.mjs
src/minitools/data/presets/xxx.ts` prints the URL. No conversation, no API
call.

### What makes a preset good

**Answer a specific brief, not the average of all of them.** "Outpatient clinic
floor, six consulting rooms" teaches far more than "office floor plan". The
model is being shown how much thought to put in, and a generic example
authorises a generic answer.

**Make the numbers cohere.** An architect reads this in two seconds: a
sixty-storey tower does not have 2.8 m floors, and a 40 m² clinic does not hold
six consulting rooms. Incoherent defaults are the single fastest way to lose a
sceptical visitor, and a preset that contains them will propagate them into
every generated spec.

**Say something in the `pitch` field.** Two or three sentences on what the tool
computes and — this is the part usually missing — *which parameter is worth
moving first*. A visitor who does not know where to start moves nothing and
leaves.

**Pick a brief unlike the common request.** The preset is shown as a reference
to depart from. If it answers the request most visitors make, the model will
reasonably conclude that copying it is the job. Make it adjacent rather than
central.

**Comment the file with why this example, not what it contains.** The
configuration is self-describing; the reason a west-facing brise-soleil was
chosen over a flat perforated panel is not, and it is what the next person
needs.

### Two mechanical rules

**Import only types.** `scripts/minitool-link.mjs` loads preset files directly
through Node's type stripping, so a runtime import breaks the fastest
verification path you have.

**The defaults must reproduce the authored scene.** If `params` says
`height: 3.2`, then every piece of geometry the preset describes must be the
geometry `height: 3.2` produces. Otherwise the tool visibly jumps the first
time a slider is touched, and — worse — the model learns from the example that
the two need not agree.
