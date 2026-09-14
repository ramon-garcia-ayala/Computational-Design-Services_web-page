/* ═══════════════════════════════════════════════════════════════
   R²XTECH client deck engine

   The runtime every client deck inlines. It is driven by markup, classes
   and data attributes, so a deck needs no slide-specific script unless it
   carries a bespoke figure, which hooks in through `window.Deck`. Each
   behaviour here was first built and measured in
   presentation/value-deck.html; carry real fixes across in both directions.

   Markup it reads:
     .slide, .slide.pale, .slide.active        slides and their ground
     .nav [data-go="prev|next"], #cur, #tot     navigation chrome
     #progress, .hint                            chrome
     aside.notes                                 presenter notes (N toggles)
     .float-words, .float-diagrams               settle-in reveals
     canvas.bg-particles                         drifting node field
     .bg.object[data-geo-home]                   the geodesic sequence
     input[type=range][data-sweep]               a slider that runs itself
     [data-bind="<input id>"]                    a figure bound to a slider
     [data-count="<number>"]                     a counter that runs on entry
     canvas[data-hinge]                          a conceptual two-path chart
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The site's public/ folder, relative to the deck. Images are read from it,
  // never copied next to the deck.
  const ASSETS = document.body.dataset.assets || '../public/';
  const syncers = [];
  let cur = 1;
  let started = false;

  const slideOf = el => Array.prototype.indexOf.call(slides, el.closest('.slide')) + 1;
  const isPale = el => el.closest('.slide').classList.contains('pale');

  /* Registers a handler called with the active slide number on every change.
     Registered after the deck has started, it also runs at once, so a bespoke
     script placed after the engine still sees the slide it opened on. */
  function onSlide(fn) {
    syncers.push(fn);
    if (started) fn(cur);
  }

  /* ── Navigation and chrome ──────────────────────────────────────── */

  document.getElementById('tot').textContent = total;

  // The chrome sits outside the slides, so it is told which ground it is
  // over: amber on greige is invisible, and so is pale grey on greige. The
  // body is the 16:9 letterbox, painted to match so it never reads as a frame.
  function syncChrome() {
    const pale = slides[cur - 1].classList.contains('pale');
    document.body.style.background = pale ? '#b8b4b1' : '#3d3934';
    const fg = pale ? '#4a4642' : '#b4aea5';
    const edge = pale ? '#625d57' : '#96918a';
    document.querySelectorAll('.nav button').forEach(b => { b.style.color = fg; b.style.borderColor = edge; });
    document.querySelectorAll('.counter, .hint').forEach(el => { el.style.color = fg; });
  }

  function go(n) {
    cur = Math.max(1, Math.min(total, n));
    slides.forEach((s, i) => s.classList.toggle('active', i === cur - 1));
    document.getElementById('cur').textContent = cur;
    const progress = document.getElementById('progress');
    if (progress) progress.style.width = (cur / total * 100) + '%';
    syncChrome();
    // A chart built while its slide was hidden can hold a stale size.
    if (window.Chart) {
      slides[cur - 1].querySelectorAll('canvas').forEach(c => {
        const chart = Chart.getChart(c);
        if (chart) chart.resize();
      });
    }
    syncers.forEach(fn => fn(cur));
    // The hash follows the slide, so a reload lands where you were and a link
    // can open on a given slide. replaceState, so no history entry per slide.
    try { history.replaceState(null, '', '#' + cur); } catch (e) { /* some file:// contexts refuse */ }
  }

  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(1); }
    else if (e.key === 'End') { e.preventDefault(); go(total); }
    else if (e.key === 'n' || e.key === 'N') document.body.classList.toggle('notes-on');
  });

  // Controls, the notes panel and every canvas (charts, figures) keep the
  // click; anywhere else advances the deck.
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-go]');
    if (nav) { go(cur + (nav.dataset.go === 'prev' ? -1 : 1)); return; }
    if (e.target.closest('.nav, a, button, input, select, textarea, label, output, .notes, canvas')) return;
    go(cur + 1);
  });

  /* ── Settle-in reveals ──────────────────────────────────────────────
     `.float-words` and `.float-diagrams` settle in a beat after their slide
     opens, each item staggered by its own `--fd`. A revisit replays them;
     pressing past the last slide does not. */
  let revealTimer = null;
  let revealedFor = 0;
  onSlide(active => {
    if (active === revealedFor) return;
    revealedFor = active;
    clearTimeout(revealTimer);
    slides.forEach(s => s.classList.remove('reveal-in'));
    const slide = slides[active - 1];
    if (!slide.querySelector('.float-words, .float-diagrams')) return;
    revealTimer = setTimeout(() => slide.classList.add('reveal-in'), reduceMotion ? 0 : 550);
  });

  /* ── Particle fields ────────────────────────────────────────────────
     A drifting node field on each `canvas.bg-particles`, the geodesic's
     node-and-edge language abstracted to points. Runs only while its slide
     is on screen; under reduced motion it draws one still frame. Random on
     purpose: it is texture, and nobody needs it to repeat. */
  document.querySelectorAll('canvas.bg-particles').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const slide = canvas.closest('.slide');
    const index = slideOf(canvas);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LINK = 130;
    let particles = [];
    let raf = null;

    function size() {
      const r = slide.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      const w = canvas.width / dpr, h = canvas.height / dpr;
      const count = Math.round(Math.max(36, Math.min(80, (w * h) / 16000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        accent: Math.random() < 0.08
      }));
    }

    function draw() {
      const w = canvas.width / dpr, h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK) {
            ctx.strokeStyle = `rgba(150,145,138,${(1 - dist / LINK) * 0.32})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        ctx.fillStyle = p.accent ? 'rgba(232,169,74,0.85)' : 'rgba(180,174,165,0.75)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.accent ? 2.1 : 1.5, 0, Math.PI * 2); ctx.fill();
      });
    }

    function step() {
      const w = canvas.width / dpr, h = canvas.height / dpr;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });
      draw();
      raf = requestAnimationFrame(step);
    }

    size(); seed(); draw();
    window.addEventListener('resize', () => { size(); seed(); draw(); });

    onSlide(active => {
      if (active !== index) {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        return;
      }
      if (reduceMotion) { draw(); return; }
      if (!raf) raf = requestAnimationFrame(step);
    });
  });

  /* ── The geodesic (cover and closing) ───────────────────────────────
     The site hero's 96-frame render of the studio's geodesic, played on its
     own: a cosine through the sequence, so it slows into each end and turns
     around instead of bouncing; adjacent frames cross-faded on two stacked
     canvases, so a redraw happens only when the pair changes; and the hero's
     dolly and 8s breath multiplied on top, both only ever scaling up. The
     host's still (frame-0020 on the cover, frame-0077 on the closing) is a
     poster while the frames decode, and the canvas takes over on
     that same frame at scale 1, so nothing visibly changes. All frames or
     none: a player missing one would show a stale frame. */
  (function () {
    const hosts = document.querySelectorAll('[data-geo-home]');
    if (!hosts.length || reduceMotion) return;

    const COUNT = 96, FW = 1664, FH = 1248, LAST = COUNT - 1, MID = LAST / 2;
    const CYCLE = 32000, BREATH = 8000, BREATH_AMP = 0.04, DOLLY = 0.05;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const frames = [];
    let ready = false;
    let active = 0;

    const players = Array.from(hosts, host => {
      const home = +host.dataset.geoHome - 1;
      const a = Math.acos(1 - home / MID);
      return {
        host,
        layer: host.querySelector('.geo-anim'),
        slots: Array.from(host.querySelectorAll('canvas'), canvas => ({ canvas, ctx: canvas.getContext('2d'), index: -1 })),
        home,
        phase0: host.dataset.geoDir === 'back' ? 2 * Math.PI - a : a,
        slideIndex: slideOf(host),
        painted: -1,
        upper: null,
        raf: null,
        t0: 0
      };
    }).filter(pl => pl.layer && pl.slots.length === 2);

    function size(pl) {
      const r = pl.host.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      pl.slots.forEach(s => {
        if (s.canvas.width === w && s.canvas.height === h) return;
        s.canvas.width = w;
        s.canvas.height = h;
        s.index = -1;
      });
      pl.painted = -1;
    }

    // Same geometry as `.bg.object`'s `auto 110%` at `right center`.
    function draw(slot, index) {
      const { canvas, ctx } = slot;
      const dh = canvas.height * 1.1, dw = dh * FW / FH;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frames[index], canvas.width - dw, (canvas.height - dh) / 2, dw, dh);
      slot.index = index;
    }

    function paint(pl, p) {
      const base = Math.floor(p), next = Math.min(LAST, base + 1);
      if (base !== pl.painted) {
        let lower = pl.slots.find(s => s.index === base);
        if (!lower) { lower = pl.slots.find(s => s.index !== next) || pl.slots[0]; draw(lower, base); }
        const upper = pl.slots.find(s => s !== lower);
        if (upper.index !== next) draw(upper, next);
        lower.canvas.style.zIndex = '0';
        lower.canvas.style.opacity = '1';
        upper.canvas.style.zIndex = '1';
        pl.upper = upper;
        pl.painted = base;
      }
      pl.upper.canvas.style.opacity = next === base ? '0' : String(p - base);
    }

    function frame(pl, now) {
      if (!pl.t0) pl.t0 = now;
      const t = now - pl.t0;
      const p = MID - MID * Math.cos(pl.phase0 + (t / CYCLE) * Math.PI * 2);
      paint(pl, p);
      const dolly = 1 + DOLLY * Math.abs(p - pl.home) / LAST;
      const breath = 1 + BREATH_AMP * (1 - Math.cos((t / BREATH) * Math.PI * 2)) / 2;
      pl.layer.style.transform = `scale(${dolly * breath})`;
      pl.raf = requestAnimationFrame(n => frame(pl, n));
    }

    function start(pl) {
      if (!ready || pl.raf) return;
      size(pl);
      pl.t0 = 0;
      pl.layer.style.transform = 'scale(1)';
      paint(pl, pl.home);
      pl.host.classList.add('geo-live');
      pl.raf = requestAnimationFrame(n => frame(pl, n));
    }

    function stop(pl) {
      if (pl.raf) { cancelAnimationFrame(pl.raf); pl.raf = null; }
    }

    const sync = () => players.forEach(pl => (pl.slideIndex === active ? start(pl) : stop(pl)));
    onSlide(i => { active = i; sync(); });
    window.addEventListener('resize', () => players.forEach(size));

    const load = i => {
      const img = new Image();
      img.src = ASSETS + 'geodesic-01/webp/frame-' + String(i + 1).padStart(4, '0') + '.webp';
      // decode(), not onload: onload fires before the bitmap is paintable.
      return img.decode().then(() => { frames[i] = img; }, () => {});
    };

    if (!players.length) return;
    Promise.all(Array.from({ length: COUNT }, (_, i) => load(i))).then(() => {
      ready = frames.filter(Boolean).length === COUNT;
      if (ready) sync();
    });
  })();

  /* ── Figures bound to a slider ──────────────────────────────────────
     A bound element shows its slider's value times `data-factor`, in
     `data-format`, with `data-prefix` before and `data-unit` after (as a
     `.unit` span). A slider with `data-sweep` runs itself when its slide
     opens: from min to `data-sweep-to` (default max) on a cubic ease-in, so
     it only ever speeds up into its limit; a slow-down tail undersold the
     growth. The first touch hands the slider to the presenter for good, so
     a value they set is never swept away by returning to the slide. */
  const FORMATS = {
    int: n => Math.round(n).toLocaleString('en-US'),
    dec1: n => (Math.round(n * 10) / 10).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    compact: n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
      : n >= 1e3 ? Math.round(n / 1e3) + 'K'
      : String(Math.round(n))
  };

  function paintBound(el, value) {
    const fmt = FORMATS[el.dataset.format] || FORMATS.int;
    el.textContent = (el.dataset.prefix || '') + fmt(value * (parseFloat(el.dataset.factor) || 1));
    if (el.dataset.unit) {
      const unit = document.createElement('span');
      unit.className = 'unit';
      unit.textContent = el.dataset.unit;
      el.appendChild(unit);
    }
  }

  document.querySelectorAll('input[type=range]').forEach(input => {
    const bound = input.id ? document.querySelectorAll('[data-bind="' + input.id + '"]') : [];
    const sweeps = 'sweep' in input.dataset;
    if (!bound.length && !sweeps) return;

    const render = v => bound.forEach(el => paintBound(el, v));
    render(+input.value);

    let touched = false;
    let timer = null;
    let raf = null;
    const cancel = () => {
      clearTimeout(timer);
      timer = null;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    };
    // A programmatic `value` write fires no `input` event, so these only ever
    // see the presenter.
    const takeOver = () => { touched = true; cancel(); };
    input.addEventListener('pointerdown', takeOver);
    input.addEventListener('keydown', takeOver);
    input.addEventListener('input', () => { takeOver(); render(+input.value); });

    if (!sweeps) return;
    const index = slideOf(input);
    const MIN = +input.min;
    const TO = input.dataset.sweepTo !== undefined ? +input.dataset.sweepTo : +input.max;
    const DURATION = +(input.dataset.sweepMs || 3400);
    // The display follows the raw value, not the input's step, or small
    // figures stutter from one step to the next.
    const set = v => { input.value = v; render(v); };

    onSlide(active => {
      cancel();
      if (active !== index || touched) return;
      if (reduceMotion) { set(TO); return; }
      set(MIN);
      timer = setTimeout(() => {
        let t0 = 0;
        const frame = now => {
          if (!t0) t0 = now;
          const t = Math.min(1, (now - t0) / DURATION);
          set(t < 1 ? MIN + (TO - MIN) * t * t * t : TO);
          raf = t < 1 ? requestAnimationFrame(frame) : null;
        };
        raf = requestAnimationFrame(frame);
      }, 600);
    });
  });

  /* ── Counters ───────────────────────────────────────────────────────
     `<span data-count="121">121</span>`: the markup holds the final value,
     so print, no-script and reduced motion all show the truth. When the
     slide opens, its counters run in document order from 0 (or
     `data-count-from`), and the `.col.ruled` each sits in lights while it
     counts. Wrap only the digits; units and prefixes stay outside. */
  (function () {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const bySlide = new Map();
    counters.forEach(el => {
      const i = slideOf(el);
      if (!bySlide.has(i)) bySlide.set(i, []);
      bySlide.get(i).push(el);
    });

    const decimals = el => (el.dataset.count.split('.')[1] || '').length;
    const show = (el, v) => {
      const d = decimals(el);
      el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    };

    let raf = null;
    onSlide(active => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      document.querySelectorAll('.col.ruled.live').forEach(c => c.classList.remove('live'));
      counters.forEach(el => show(el, +el.dataset.count));

      const list = bySlide.get(active);
      if (!list || reduceMotion) return;

      const DURATION = 1100, STAGGER = 650, LEAD = 500;
      const runs = list.map((el, k) => ({
        el,
        from: +(el.dataset.countFrom || 0),
        to: +el.dataset.count,
        start: LEAD + k * STAGGER,
        col: el.closest('.col.ruled')
      }));
      runs.forEach(r => show(r.el, r.from));

      let t0 = 0;
      const frame = now => {
        if (!t0) t0 = now;
        const t = now - t0;
        let running = false;
        runs.forEach(r => {
          const p = Math.min(1, Math.max(0, (t - r.start) / DURATION));
          show(r.el, r.from + (r.to - r.from) * (1 - Math.pow(1 - p, 3)));
          if (r.col) r.col.classList.toggle('live', p > 0 && p < 1);
          if (p < 1) running = true;
        });
        raf = running ? requestAnimationFrame(frame) : null;
      };
      raf = requestAnimationFrame(frame);
    });
  })();

  /* ── Hinge charts ───────────────────────────────────────────────────
     A conceptual "keep doing it this way vs change it once" chart. No axis
     numbers, on purpose. The line that never stops climbing takes the danger
     colour, and the gap past the crossing is filled with it, so the growing
     cost reads as a widening wedge instead of a subtraction the viewer has
     to do. Axes need not be money: hours, revisions, checks rebuilt. Colours
     follow the slide's ground, because amber is invisible on greige. */
  const COLORS = {
    pale: { ink: '#2a2826', muted: '#4a4642', edge: '#625d57', danger: '#900e0e', fill: 'rgba(144,14,14,0.16)' },
    warm: { ink: '#e8a94a', muted: '#b4aea5', edge: '#96918a', danger: '#ff9686', fill: 'rgba(255,150,134,0.14)', line: '#55504a' }
  };

  /* Marks the crossing: a dashed rule, a label, and with `fillColor` the
     wedge between dataset 0 (upper past the crossing) and dataset 1, walked
     along the datasets' own rendered points so it stays right for any data. */
  const breakevenMarker = {
    id: 'breakeven',
    afterDatasetsDraw(chart, args, opts) {
      const m = opts.month;
      if (!m || !isFinite(m) || m > 36) return;
      const { left, right, top, bottom } = chart.chartArea;
      const x = left + (m / 36) * (right - left);
      const ctx = chart.ctx;

      if (opts.fillColor) {
        const upper = chart.getDatasetMeta(0).data;
        const lower = chart.getDatasetMeta(1).data;
        const start = Math.round(m);
        if (upper.length > start && lower.length > start) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(upper[start].x, upper[start].y);
          for (let i = start + 1; i < upper.length; i++) ctx.lineTo(upper[i].x, upper[i].y);
          for (let i = lower.length - 1; i >= start; i--) ctx.lineTo(lower[i].x, lower[i].y);
          ctx.closePath();
          ctx.fillStyle = opts.fillColor;
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.save();
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
      ctx.setLineDash([]);

      // Only an integer crossing lands exactly on a data point.
      if (opts.fillColor && Number.isInteger(m)) {
        const crossing = chart.getDatasetMeta(1).data[m];
        if (crossing) {
          ctx.beginPath();
          ctx.arc(crossing.x, crossing.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = opts.color;
          ctx.fill();
        }
      }

      ctx.fillStyle = opts.color;
      ctx.font = '500 10px "JetBrains Mono", monospace';
      const flip = x > right - 90;
      ctx.textAlign = flip ? 'right' : 'left';
      ctx.fillText(opts.label || 'break-even', x + (flip ? -6 : 6), top + 11);
      ctx.restore();
    }
  };

  if (window.Chart) {
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.font.size = 10;

    document.querySelectorAll('canvas[data-hinge]').forEach(canvas => {
      const c = isPale(canvas) ? COLORS.pale : COLORS.warm;
      const d = canvas.dataset;
      const months = Array.from({ length: 37 }, (_, i) => i);
      const axis = text => ({
        title: { display: true, text: text.toUpperCase() + ' →', color: c.muted, font: { size: 9 } },
        grid: { display: false },
        border: { color: c.edge },
        ticks: { display: false }
      });
      new Chart(canvas, {
        plugins: [breakevenMarker],
        type: 'line',
        data: {
          labels: months,
          // Slopes chosen so the crossing lands a third of the way along,
          // where it reads as a real turn rather than a rounding error.
          datasets: [
            { label: d.grow || 'Keep doing it by hand', data: months.map(m => m * 100), borderColor: c.danger, borderWidth: 2, pointRadius: 0, tension: 0 },
            { label: d.flat || 'Build it once', data: months.map(m => 900 + m * 25), borderColor: c.ink, borderWidth: 3, pointRadius: 0, tension: 0 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: reduceMotion ? false : {},
          interaction: { intersect: false },
          plugins: {
            breakeven: { month: 12, color: c.ink, fillColor: c.fill, label: d.crossLabel || 'break-even' },
            legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 2, padding: 14, color: c.muted } },
            tooltip: { enabled: false }
          },
          scales: { x: axis(d.x || 'Time'), y: axis(d.y || 'Cumulative cost') }
        }
      });
    });
  }

  /* ── Public hooks and start ─────────────────────────────────────── */

  window.Deck = {
    go,
    onSlide,
    get current() { return cur; },
    get total() { return total; },
    formats: FORMATS,
    colors: COLORS,
    breakevenMarker
  };

  const fromHash = parseInt(location.hash.slice(1), 10);
  go(fromHash >= 1 && fromHash <= total ? fromHash : 1);
  started = true;
})();
