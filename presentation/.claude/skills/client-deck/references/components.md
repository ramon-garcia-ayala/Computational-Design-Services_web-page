# Components

Copy-paste slide patterns for client decks. Every class here exists in the CSS
lifted from `value-deck.html` or in the client-deck additions in the starter;
every `data-*` attribute is read by the inlined engine. Replace sample copy with
the client's; keep the structure.

## Contents

1. Slide shell and notes
2. Cover and closing
3. Centred statement over particles
4. Heading and lead
5. Industry vs firm (scale pair)
6. Live slider bound to figures
7. Figure grid with counters and confidence
8. Observation list (no figures)
9. Hinge: statement and proof strip
10. Hinge chart
11. Program parts
12. Workflow before and after
13. Phases, and what they keep
14. Proof from past work
15. Photo background
16. Source and assumptions lines
17. Bespoke script hooks (`window.Deck`)

---

## 1. Slide shell and notes

```html
<!-- ══ 03 · IN YOUR FIRM ═══════════════════════════════════════════
     Job: one sentence on what this slide must make the audience believe. -->
<section class="slide">
  <div class="eyebrow"><span class="act">01 /</span> What we found</div>
  <div class="body">
    ...
  </div>
  <aside class="notes">
    <b>The cue, bold.</b> The sentence to say.<br>
    <b>Ask:</b> "The question." Write down the answer: it feeds slide 7.<br>
    <b>Do not overclaim:</b> this figure was reported, not measured.
  </aside>
</section>
```

- Only the first slide carries `active` in markup.
- `.slide.pale` switches the ground to greige; the scope rewires the tokens, so
  classes keep their names.
- The eyebrow act numbers are `01 /`, `02 /`, `03 /`; the closing slide's eyebrow
  is just "Next step". `.eyebrow.meta` is a muted variant for a context line.
- The HTML comment states the slide's job. Keep it; it is how the next editor
  knows what can be cut.

## 2. Cover and closing

Cover (frame 20 of the geodesic, playing forward):

```html
<section class="slide pale active">
  <div class="bg object" data-geo-home="20" style="background-image:url('../../../public/geodesic-01/webp/frame-0020.webp')"><div class="geo-anim"><canvas aria-hidden="true"></canvas><canvas aria-hidden="true"></canvas></div></div>
  <div class="scrim pale-veil strong"></div>
  <div class="body">
    <img class="wordmark" src="../../../public/logo/logo-mask.png" alt="R²XTECH">
    <h1 style="margin-top:clamp(24px,3.4vw,50px);max-width:15ch">Every revision costs your steel team three and a half days.</h1>
    <div class="outcome">A connection pipeline that regenerates what goes stale.</div>
    <div class="title-meta">Prepared for Halden Structural · 24 September 2026</div>
  </div>
  <aside class="notes">...</aside>
</section>
```

Closing (frame 77, playing backward):

```html
<section class="slide pale">
  <div class="bg object" data-geo-home="77" data-geo-dir="back" style="background-image:url('../../../public/geodesic-01/webp/frame-0077.webp')"><div class="geo-anim"><canvas aria-hidden="true"></canvas><canvas aria-hidden="true"></canvas></div></div>
  <div class="scrim pale-veil"></div>
  <div class="eyebrow">Next step</div>
  <div class="body">
    <h2 style="font-size:var(--text-display);max-width:16ch">Send us three finished warehouse projects.</h2>
    <p class="lead" style="max-width:46ch">We encode your connection rules against them in two weeks. <strong>If the rules do not reproduce your engineers' calls, we will say so before you commit to a pilot.</strong></p>
    <div class="cta-row"><span class="pill solid">r-xtech.com/contact</span></div>
    <div class="title-meta">Architecture, computed.</div>
  </div>
  <aside class="notes">...</aside>
</section>
```

The `data-geo-home` value must match the still's frame number (20 on the cover,
77 on the closing). Asset paths point at the site's `public/` relative to where
the deck lives; the scaffold writes them for you.

## 3. Centred statement over particles

```html
<section class="slide">
  <canvas class="bg-particles" aria-hidden="true"></canvas>
  <div class="scrim vignette"></div>
  <div class="body center">
    <h1 style="max-width:20ch;margin:0 auto">What would your engineers do with a week back?</h1>
  </div>
  <div class="float-words" aria-hidden="true">
    <span class="float-word" style="left:7%;top:15%;--fd:0.9s">Revisions</span>
    <span class="float-word right" style="right:6%;top:13%;--fd:1.4s">Connection checks</span>
  </div>
  <aside class="notes">...</aside>
</section>
```

Float words settle in after the slide opens (`--fd` staggers them) and are hidden
under 900px wide. `.float-word.accent` is amber: warm slides only.

## 4. Heading and lead

```html
<div class="body">
  <h2>Revisions are redrawn, not regenerated.</h2>
  <p class="lead">The model is updated in hours. <strong>The drawings around it take days.</strong></p>
</div>
```

`h2.wide` allows a longer line. One `.lead`, one sentence or two.

## 5. Industry vs firm (scale pair)

```html
<div class="split">
  <div>
    <div class="scale-tag">Across the industry</div>
    <div class="figure huge" style="margin-top:10px">14<span class="unit">%</span></div>
    <div class="figure-label" style="margin-top:14px;max-width:26ch">Of construction rework traces back to bad project data.</div>
  </div>
  <div>
    <div class="scale-tag accent">In your firm</div>
    <div class="figure huge" style="margin-top:10px">3.5<span class="unit"> days</span></div>
    <div class="figure-label" style="margin-top:14px;max-width:28ch">To bring one revision's drawings back in line with the model.</div>
    <div class="confidence" style="margin-top:8px">Measured</div>
  </div>
</div>
<!-- after .body -->
<div class="source">FMI &amp; Autodesk: Harnessing the Data Advantage in Construction</div>
```

The macro figure needs a source line; the firm figure needs a confidence label.

## 6. Live slider bound to figures

Only with figures from the analysis. The slider holds one of their quantities; the
bound figures multiply it by a reported or measured factor.

```html
<div class="ctrl">
  <div class="row"><label for="revisions">Revisions per year</label><output data-bind="revisions" data-format="int"></output></div>
  <input type="range" id="revisions" min="2" max="40" step="1" value="12" data-sweep aria-label="Revisions per year">
</div>
<div class="figure huge" data-bind="revisions" data-factor="3.5" data-format="int" data-unit=" days/yr"></div>
```

| Attribute | On | Meaning |
|---|---|---|
| `data-sweep` | the range input | Runs itself on slide entry: min to target, cubic ease-in, 600ms after entry |
| `data-sweep-to` | the range input | Target value (default: `max`) |
| `data-sweep-ms` | the range input | Duration (default 3400) |
| `data-bind="<id>"` | any element | Shows the input's value times `data-factor` |
| `data-factor` | bound element | Multiplier (default 1) |
| `data-format` | bound element | `int` (1,400), `dec1` (3.5), `compact` (350K, 1.2M) |
| `data-prefix` / `data-unit` | bound element | Text before; unit after, rendered as `.unit` |

The first touch (pointer, key or drag) hands the slider to the presenter and it
never sweeps again on that page load. Under reduced motion it jumps to the target.
Cap `max` to the client's real scale.

## 7. Figure grid with counters and confidence

```html
<div class="cols c2">
  <div class="col ruled">
    <div class="figure"><span data-count="1400">1,400</span></div>
    <div class="figure-sub">Steel connections on a mid-size warehouse</div>
    <div class="confidence">Reported by your team</div>
  </div>
  <div class="col ruled">
    <div class="figure"><span data-count="3.5">3.5</span><span class="unit"> days</span></div>
    <div class="figure-sub">For one revision, 26 sheets, 2 people</div>
    <div class="confidence">Measured</div>
  </div>
</div>
```

- `data-count` is a plain number (no commas, no units); the span's text is the
  formatted final value, so print, no-script and reduced motion show the truth.
- Wrap only the digits. Units and prefixes stay outside the span.
- On slide entry the counters run in document order from 0 (`data-count-from`
  to change that), and the `.col.ruled` a counter sits in lights amber while it
  runs.

## 8. Observation list (no figures)

```html
<ul class="dash roomy" style="margin-top:clamp(18px,2.3vw,32px);max-width:52ch">
  <li>Every project is drawn from zero<span>: no piece library, 30 to 45 panel types each time</span></li>
  <li>The rebar schedule is typed twice<span>: into Excel, then again into Intelisis</span></li>
  <li>Errors surface in the plant<span>: at casting or erection, not in the office</span></li>
</ul>
```

The label is the observation; the span is its evidence. The glyph before each item
is drawn by CSS and is not copy.

## 9. Hinge: statement and proof strip (pale slide)

```html
<div class="split lean">
  <div>
    <div class="statement" style="font-size:clamp(1.7rem,3.1vw,3.3rem);max-width:16ch">The model is right. Everything around it goes stale.</div>
    <p class="lead"><strong>Each revision pulls two engineers off design for most of a week.</strong></p>
    <div class="hinge-proof">
      <span class="pill solid">Measured</span>
      <span class="hinge-proof-figure">26 sheets · 3.5 days</span>
      <span class="hinge-proof-caption">One revision, DC Tilburg, 21 August: 2 people, 4 inconsistencies caught at check.</span>
    </div>
  </div>
  <div>
    <!-- a hinge chart, or delete this column and widen the statement -->
  </div>
</div>
```

The pill is the only way amber appears on a pale slide.

## 10. Hinge chart

```html
<div class="chart-wrap tall">
  <canvas data-hinge data-grow="Redraw every revision" data-flat="Regenerate once built" data-x="Revisions" data-y="Engineering hours" data-cross-label="pays back"></canvas>
</div>
<div class="assumptions">Shape only, not measured data.</div>
```

| Attribute | Meaning |
|---|---|
| `data-grow` | Legend label for the line that keeps climbing (danger colour) |
| `data-flat` | Legend label for the line that flattens (ink on pale, amber on warm) |
| `data-x`, `data-y` | Axis titles, rendered uppercase with an arrow; need not be money |
| `data-cross-label` | Label on the crossing marker (default "break-even") |

Conceptual by design: no axis numbers, crossing a third of the way along, and the
gap past the crossing filled with the danger colour so the growing cost reads as a
widening wedge. Needs the Chart.js script in `<head>` (the starter has it) and a
`.chart-wrap` for height. Keep the "shape only" caption.

## 11. Program parts

```html
<h2 class="wide">Connection Pipeline: your rules, applied to every joint.</h2>
<div class="cols c3" style="margin-top:clamp(22px,2.8vw,40px)">
  <div class="col ruled">
    <div class="figure-sub">01</div>
    <h3>Read the models</h3>
    <p class="note">Forces and geometry straight from SCIA and Tekla, no copying into sheets.</p>
  </div>
  <div class="col ruled">
    <div class="figure-sub">02</div>
    <h3>Sort by your rules</h3>
    <p class="note">Standard detail, simplified check or full check, decided the way Joost decides.</p>
  </div>
  <div class="col ruled">
    <div class="figure-sub">03</div>
    <h3>Engineers sign</h3>
    <p class="note">Full checks arrive in IDEA StatiCa pre-filled, for review and sign-off.</p>
  </div>
</div>
```

What each part changes for their team, in their tools' names. Never a description
of internal technique.

## 12. Workflow before and after

```html
<h2 class="wide">Six steps today. Two stay with your engineers.</h2>
<div class="pipeline" style="grid-template-columns:repeat(6,1fr);margin-top:clamp(22px,2.8vw,40px)">
  <div class="stage"><span class="n">01</span><span class="t">Model updated in Tekla</span></div>
  <div class="stage gone"><span class="n">02</span><span class="t">Forces copied to Excel</span></div>
  <div class="stage new"><span class="n">03</span><span class="t">Joints sorted by rules</span></div>
  <div class="stage gone"><span class="n">04</span><span class="t">Geometry re-entered in IDEA</span></div>
  <div class="stage"><span class="n">05</span><span class="t">Engineer reviews and signs</span></div>
  <div class="stage new"><span class="n">06</span><span class="t">Drawings regenerated</span></div>
</div>
<div class="pipeline-key"><span class="k gone">Removed</span><span class="k new">Automated</span></div>
<p class="lead">Judgement and sign-off stay with your engineers, where the liability sits.</p>
```

Set `grid-template-columns:repeat(N,1fr)` to the step count (it stacks to two
columns on narrow screens). `.gone` strikes the step through in the danger colour;
`.new` gets the raised plate with an amber top rule. The key is required: colour
and line style must be named.

## 13. Phases, and what they keep

```html
<ul class="dash roomy" style="margin-top:clamp(18px,2.3vw,32px);max-width:52ch">
  <li>Pilot on one live warehouse<span>: run in parallel with your current process</span></li>
  <li>Rules library from three past projects<span>: owned and maintained by your team</span></li>
  <li>Drawing regeneration<span>: phase 2, once the pilot proves the rules</span></li>
</ul>
<p class="note" style="margin-top:clamp(16px,2vw,26px)"><strong>To confirm in week one:</strong> IDEA StatiCa API licensing on your current plan.</p>
```

What they keep (ownership), consistent with the company deck:

```html
<div class="scale-tag accent">What you keep</div>
<ul class="dash" style="margin-top:14px">
  <li>The code and the rules transfer to you<span>: no licence retained, nothing rented back</span></li>
  <li>Documented, versioned, testable<span>: your team extends it without us</span></li>
  <li>Training and handover<span>: included, never an upsell</span></li>
</ul>
```

## 14. Proof from past work

Optional, after the program. Counts, never method; no client name or identifying
detail beyond a broad sector.

```html
<div class="eyebrow meta">A utility-scale energy client · under NDA</div>
<div class="body">
  <h2>The numbers, not the name.</h2>
  <div class="cols c2" style="margin-top:clamp(18px,2.3vw,30px)">
    <div class="col ruled"><div class="figure"><span data-count="121">121</span></div><div class="figure-sub">Tests passing on real files</div></div>
    <div class="col ruled"><div class="figure"><span data-count="16">16</span></div><div class="figure-sub">Manual steps mapped · 4 gone</div></div>
  </div>
</div>
```

Use only figures the studio has already cleared for the company deck. Never a
diagram, screenshot or step list of that engagement.

## 15. Photo background

```html
<section class="slide">
  <div class="bg" style="background-image:linear-gradient(rgba(20,10,0,0.56),rgba(20,10,0,0.56)),url('../../../public/projects/projects-tabs/geomorphing-terrascape-chihuahua/12.png')"></div>
  <div class="scrim even"></div>
  ...
</section>
```

The image is the site's own file; the gradient layer before it is what darkens
it, so there is never a second, pre-darkened copy to keep in sync.

Only when the image belongs to the slide's claim. `.scrim.dark` when text sits
left, `.scrim.even` when both sides carry text, `.scrim.darker` for dense text.
`background-position` shifts the subject away from the text.

## 16. Source and assumptions lines

```html
<div class="source">FMI &amp; Autodesk: Harnessing the Data Advantage in Construction</div>
<div class="assumptions">Reported rate €68/h (finance) · hours measured on one revision · no discounting.</div>
```

`.source` sits after `.body`, at the foot of the slide. `.assumptions` sits under
the figure or chart it qualifies.

## 17. Bespoke script hooks

For a figure the engine does not cover (a calculator, a custom canvas), add a
`<script>` after the engine's and use `window.Deck`:

| Member | Use |
|---|---|
| `Deck.onSlide(fn)` | `fn(activeSlideNumber)` on every change; runs at once if registered late |
| `Deck.go(n)`, `Deck.current`, `Deck.total` | Navigation |
| `Deck.formats.int / dec1 / compact` | Number formatting consistent with bound figures |
| `Deck.colors.pale / .warm` | `ink`, `muted`, `edge`, `danger`, `fill` (and `line` on warm) for charts |
| `Deck.breakevenMarker` | The Chart.js plugin behind the hinge chart: `plugins: { breakeven: { month, color, fillColor, label } }` |

A bespoke figure must start when its slide opens, stop when it leaves, show its
end state under `prefers-reduced-motion`, and draw only the slide's own data. The
company deck's slide 6 records figure and slide 7 calculator are the reference
implementations.
