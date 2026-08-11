# Verifying an archetype

There are no tests in this repo. The safety net is TypeScript's exhaustiveness
checking and looking at the screen — and the characteristic failure here is a
scene that compiles perfectly and renders nothing, which only the second of
those catches. So the browser step is not optional.

Each step below tests something specific. Skipping one means shipping that
thing unverified, not saving time.

## 1. Build

```bash
npm run build
```

Tests the four exhaustive switches: `parseSpec`, `paramDefsFor`,
`TemplateScene` and `progressMessages`. It says nothing at all about
`PARAM_REGISTRY`, `SCHEMAS` or the router entry, which is why the checklist in
`SKILL.md` splits them.

`npx tsc --noEmit` is the faster loop while iterating; run the real build
before declaring anything done.

**If it fails with `EPERM` on `.next/types`**, that is VS Code's TypeScript
server holding the directory, not your code — `tsconfig.json` includes it.
Close the editor and rerun, or verify from a clean clone.

## 2. The link

```bash
node scripts/minitool-link.mjs src/minitools/data/presets/xxx.ts
```

Tests that the preset is loadable, that it serialises, and that it fits inside
the fragment cap. Prints the URL to open. Add `--origin http://localhost:3000`
for a clickable one, and `--plain` to check the uncompressed branch that older
Safari takes — that is the one that hits `MAX_PAYLOAD_CHARS` first, and it can
be twenty times longer.

If the script reports that the preset exports nothing spec-shaped, the file is
importing something at runtime and Node's resolver gave up on the chain.

## 3. The browser

```bash
npm run dev
```

Open the URL from step 2. Then, in this order:

**Does the scene appear without touching anything?** This is the single most
important check in the list. A canvas that only draws once you drag it is a
stalled render loop, not a slow one — see the symptom list in
`references/scene.md`. Watch the first paint, do not just confirm that
something is there after you have been orbiting for ten seconds.

**Does every control change something visible?** Move each one across its full
range. A slider that does nothing at either end is either bound to the wrong
key or driving a value the geometry ignores, and it is invisible in the build.
While you are here, ask whether each one earns its place — this is the moment
the "five controls, each one changes the design" rule is actually enforceable.

**Does the archetype's own headline output move across that range?** This is
the subtler version of the same question and it is the one that gets missed,
because everything *works*: the sliders respond, the geometry updates, nothing
errors. What fails is calibration.

`structure` shipped its first draft assuming a solid rectangular section, which
at any plausible depth is an enormous plate — so every configuration in the
slider ranges came out around five percent utilisation, and the colour ramp,
the single output the archetype exists to show, sat at one end and never moved.
The geometry was right, the arithmetic was right, and the tool was useless.

So after the controls work, look at whatever number or colour the archetype is
*for* and push the inputs to both extremes. It has to travel: comfortable to
overloaded, sparse to dense, one valid answer to a visibly different one. If it
does not, the constants you assumed are wrong for the ranges you chose — fix
the constants, or move the ranges to where the interesting behaviour lives.

**Does the address bar rewrite as you drag?** The spec round-trips through the
URL on a 250 ms debounce. If it does not update, the writeback is broken and
nothing the visitor does is shareable.

**Does reloading that rewritten URL restore the same state?** Tests encode and
decode against each other. A mismatch here usually means a param key exists in
the registry but not in the spec type, or vice versa.

**If you changed an existing archetype's params, does a link written before
your change still render what it rendered?** Encode a spec in the *old* shape
with `scripts/minitool-link.mjs` and open it. `params()` drops unknown keys
silently, so the link will open either way — it will just be a different
building, and nobody finds out until a client reopens the one they were sent.
Migrate the key if its meaning survives, carry it if it does not.

**Does an out-of-range edit clamp instead of failing?** Take the fragment,
change a number in it to something absurd, reload. The tool must still open,
with the value clamped. The invalid-link screen is the wrong answer:
`parseSpec` clamps rather than rejects precisely so a curious visitor is not
punished for it. If your archetype has a value that becomes a loop bound,
push it hard here — that is the one place clamping in `parseSpec` alone is not
enough.

**Record it.** `mcp__claude-in-chrome__gif_creator`, named for what it shows
(`wfc_tool_sliders.gif`). Capture extra frames before and after each action so
the playback is readable.

## 4. End to end, through the chat

Everything above tests the renderer. This tests whether the archetype is
reachable at all.

Open `/`, and ask the assistant for the thing your archetype exists for.

**Does it route to your archetype?** If it picks a neighbour, the router entry
is not discriminating — reread the `why` sentence it shows on the confirmation
card, which is exactly the model telling you what it thought the request was
about. Fix the "not this if…" clause rather than adding emphasis.

**Then ask for something adjacent that should *not* route to it**, and confirm
it does not. An archetype that swallows its neighbours' requests is a
regression for every tool that already worked.

**Confirm the build and open the tool.** The first build of a new archetype can
take minutes while the API compiles its JSON Schema; that is expected and
cached for about a day afterwards. If it fails, the preset now stands in and
the confirmation card returns, so you get a second attempt without rebuilding
the conversation.

Requires `ANTHROPIC_API_KEY` in the environment. Without it the chat answers
that it is offline — by design, there is no development fallback.

## What "done" means

- `npm run build` passes.
- The preset renders on first paint, and every control moves something.
- A reloaded link restores the state; a tampered one clamps.
- The assistant routes the intended request here, and does not steal an
  adjacent one.
