# Narrative: from an analysis to a client deck

## Contents

1. What a client deck is for
2. Reading the analysis: the findings sheet
3. Choosing the lead finding
4. Confidence labels
5. The arc, slide by slide
6. Variations
7. Copy voice
8. Presenter notes
9. The close

---

## 1. What a client deck is for

The company deck (`presentation/value-deck.html`) answers three questions any
prospect asks: what do you do, what does it do for me, what do I get. It argues
from the industry's cost of doing nothing.

A client deck answers different questions for one firm:

- **What did you actually see in our operation?**
- **Why should we care about it now?**
- **What would you build, and what would it change for our people?**
- **How would it start, and what do you need from us?**

The spine is the need we identified and the program that answers it. The deck
succeeds when the client recognises their own firm in it ("that is exactly how
revisions go here") and can picture the program running on their work. Money is
one possible piece of evidence, never the story by itself.

## 2. Reading the analysis: the findings sheet

Read the whole analysis before deciding anything. Extract:

- **Who they are:** name, industry, size, offices, what they deliver, who their
  clients are, the tools they use (by product name).
- **Who we spoke to:** names and roles, so notes can say who raised what.
- **Their workflow:** the actual steps in their words, who does each, which
  software, where work gets re-entered.
- **Findings,** each as a row of the sheet below.
- **What they said:** direct quotes, only if the analysis records them.
- **Constraints:** systems that stay, IT rules, liability, what cannot change.
- **Figures:** every number, with who produced it and how.
- **The program idea** the studio already has, if any, and its pilot.
- **Open questions** the analysis lists or that you notice.

Write the sheet in your working notes (it does not go in the deck):

```
F1  Observation   Revisions are redrawn by hand after every model change
    Evidence      Measured on one revision, 21 Aug: 26 sheets, 2 people, 3.5 days
    Confidence    Measured
    Consequence   Time (3.5 days per revision), errors (4 caught at check)
    Program part  Phase 2: regenerate affected sheets
```

If a slide needs something the sheet does not have, stop and choose: ask the
user (when the gap changes the story), or carry it as an open question on the
"how we would start" slide. Never fill it with a plausible guess.

## 3. Choosing the lead finding

One finding leads. It goes on the cover, it is proven on slide 3, and slide 4 is
about its consequence. Choose by:

1. **Consequence for them:** what it costs in time, errors, risk, capacity or
   client relationships, in their terms.
2. **Strength of evidence:** measured beats reported beats estimated.
3. **Fit with the program:** the program must visibly answer it.

Other findings support (a second figure on slide 3, a line in the notes) or are
cut. A deck that presents five equal findings persuades nobody; the analysis can
be exhaustive, the deck cannot.

## 4. Confidence labels

Every figure on screen carries one. Use the same four words everywhere so the
audience learns them once.

| Meaning | English | Español |
|---|---|---|
| We timed or counted it ourselves | Measured | Medido |
| Someone at the client told us | Reported by your team | Reportado por su equipo |
| We derived it, and can show how | Our estimate | Estimación nuestra |
| We think so, and the pilot will check | To validate | Por validar |

On a figure: `<div class="confidence">Measured</div>` under its `.figure-sub`.
On the hinge proof strip: the label goes in the `.pill.solid`.

## 5. The arc, slide by slide

### 1 · Cover (pale, geodesic)

The lead finding as one line, and the program as one line under it. In the
client's own terms, not the studio's.

- Good: *Every revision costs your steel team three and a half days.* /
  *A connection pipeline that regenerates what goes stale.*
- Weak: *Digital transformation for Halden.* (a topic, not a finding)

`title-meta` reads *Prepared for {Client} · {date}*.

### 2 · Your industry (warm, particles)

The pattern this firm shares with its industry, at macro scale, sourced. Its job
is to make the next slide land as "known and solvable" rather than as criticism.
One claim. If there is no sourced industry claim that fits, use a pattern the
studio sees across its own work, say so in the notes, and delete the source line.

Skip or merge this slide when the meeting is short or the audience already agrees
the problem is industry-wide.

### 3 · In your firm (warm)

The lead finding, stated plainly as a heading, with its evidence. Two to four
figures with confidence labels when the analysis has numbers; otherwise a short
dash list of observations, each with where it came from.

The heading is a claim: *Revisions are redrawn, not regenerated.* Not a topic:
*Revision process.*

### 4 · Why it matters (pale, the hinge)

The consequence, in one statement, plus one proof. This is the slide that turns
"interesting" into "worth doing now". Options, pick one:

- Statement + `hinge-proof` strip with the single strongest figure.
- Statement + a `data-hinge` chart when there is a genuine "keep doing it this
  way vs change it once" shape. Its axes do not have to be money: *hours spent*,
  *revisions redrawn*, *checks rebuilt*. It stays conceptual ("shape only").

Frame the consequence around what they already feel: client pressure, the people
who are the bottleneck, errors caught late.

### 5 · The program (warm, particles)

Give the program a working name and a one-line description of what it does for
them. At most three parts, each a short heading and one line on what it changes
for their team. Describe outcomes and responsibilities, not internal technique:
*"Sorts every joint into standard, simplified or full check using your rules"*,
not a description of algorithms or another client's pipeline.

### 6 · Your workflow, before and after (warm)

Their own steps, in their words, as a `pipeline` strip. Mark which steps the
program removes and which it automates; keep the ones that stay with their people
(sign-off, judgement) visibly theirs. One sentence under it on what stays human
and why. If the analysis does not describe the workflow step by step, skip this
slide rather than invent steps.

### 7 · How we would start (warm)

The pilot: one project or one workflow, what it proves, how long, and what we need
from them (files, access, a person's time). Open questions from the analysis go
here as "to confirm in week one". This slide is where honesty about unknowns
builds trust.

### 8 · What changes, and what you keep (warm)

Left: two or three outcomes for their team, in their terms, with figures only when
the analysis supports them. Right: what they keep (code and rules transfer, it is
documented and tested, training and handover included). Keep the ownership lines
consistent with the company deck and with any written proposal.

### 9 · Next step (pale, geodesic)

One small, specific, low-risk ask tied to the lead finding, and what happens after
yes. Include the honest escape hatch: *if the pilot does not prove it, we will say
so*.

## 6. Variations

**The analysis has real money figures** (a loaded rate, a cost, a budget):
- Use them where they strengthen the consequence (slide 4 or 8), labelled.
- A live slider (`data-sweep` + `data-bind`) can scale a *reported* rate by a
  *measured* quantity in front of them. Cap the range to their scale.
- A payback calculator (company deck slide 7) only with their own inputs and
  visible assumptions.

**No figures at all:**
- Slide 3 becomes a dash list of observations with evidence tags.
- Slide 4 is a statement plus a qualitative consequence (who is the bottleneck,
  where errors surface, what client pressure exists). No invented numbers, no
  chart with fabricated data; a conceptual chart is acceptable only if its labels
  say it is a shape.
- Slide 8 outcomes are qualitative and specific: *drawings and rebar schedules
  come from the same piece*, not *faster and better*.

**Several needs:** one program with parts, not several programs. Lead with the
strongest; mention the others in notes as "we also saw", or as a later phase.

**Proof from past work:** optional slide after the program. Counts, never method;
no client names or identifying detail; see the proof slide pattern in
`components.md`.

**A short meeting (under 30 minutes):** seven slides. Merge 2 into 3 (put the
industry line as a `scale-tag` pair) and merge 7 into 8.

**An existing written proposal:** match its program name, phases and figures.
Where the deck simplifies, the notes point to the proposal section.

## 7. Copy voice

The studio sounds like a senior engineer who has seen the problem many times and
is careful with claims.

- **Headings are claims.** A reader skimming only headings should get the argument.
- **Their vocabulary.** Their product names (Tekla, Intelisis), their role titles
  (jefa de oficina técnica), their step names. Never generic "stakeholders".
- **Exact numbers,** with units and confidence. Never round in the flattering
  direction.
- **One idea per sentence.** Short sentences. No stacked clauses.
- **Say what stays human.** Credibility comes from limits: sign-off stays with
  their engineer, the tool flags exceptions for review.
- **Avoid:** revolutionary, seamless, cutting-edge, game-changer, unlock,
  leverage, empower, synergy, delve, "in today's fast-paced world", "not just X,
  but Y", triplets used for rhythm, rhetorical question chains, exclamation marks.
- **No em dashes** anywhere the audience or presenter reads. Rewrite the sentence.
- **Spanish decks:** formal register for a B2B client (*ustedes, su equipo, su
  empresa*); their industry's standard Spanish terms (*planos de taller,
  despiece, colado*) over anglicisms; the em dash rule applies to the raya as
  well.

## 8. Presenter notes

Every slide, in `<aside class="notes">`, as short paragraphs each starting with a
bold cue. Cover:

- **The sentence to say**, verbatim-ready.
- **What to ask** and **what to write down** from the answer.
- **Who raised it** ("Joost described this in the connections session").
- **What not to overclaim** (a reported figure is not measured; the pilot has not
  run).
- **Where it links** ("this number comes back on slide 8").

Examples from the company deck, for tone:

> **Ask it for real and let it sit: five seconds of quiet is fine.** It isn't a
> rhetorical opener: whatever they answer is the thread for the next nine slides.

> **Say the proof number exactly, never round it.** Baseline was 5 days, it is 3
> today, the target is same-day.

## 9. The close

The ask is small enough to say yes to in the room: send three past projects, name
the pilot project, book a half-day session with the person who holds the method.
Tie it to the lead finding, state what happens next and when, and keep the escape
hatch honest.
