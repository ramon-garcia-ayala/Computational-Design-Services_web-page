#!/usr/bin/env node
/* Static checks for a client deck, run before anyone opens it in a browser.

     node check-deck.mjs <deck.html> [--analysis <analysis file>]

   FAIL means fix it before presenting. WARN means look at it and decide.
   INFO lists what a human should eyeball against the analysis. Exits 1 when
   anything fails. None of this replaces walking the deck in a browser; it
   catches the mistakes that are cheap to catch without one. */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

let deckPath = null;
let analysisPath = null;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--analysis') analysisPath = argv[++i];
  else if (!deckPath) deckPath = argv[i];
}
if (!deckPath) {
  console.error('usage: node check-deck.mjs <deck.html> [--analysis <analysis file>]');
  process.exit(2);
}

const html = readFileSync(deckPath, 'utf8');
const deckDir = dirname(resolve(deckPath));
const report = { FAIL: [], WARN: [], INFO: [] };
const fail = m => report.FAIL.push(m);
const warn = m => report.WARN.push(m);
const info = m => report.INFO.push(m);

const decode = s => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/&mdash;/g, '—')
  .replace(/&[a-z]+;/g, ' ');
const textOf = s => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
const markup = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ');

const NOTES_RE = /<aside\b[^>]*\bclass="[^"]*\bnotes\b[^"]*"[^>]*>([\s\S]*?)<\/aside>/i;
const slides = [...markup.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
  .filter(m => /\bclass="[^"]*\bslide\b/.test(m[1]))
  .map((m, i) => {
    const attrs = m[1];
    const inner = m[2];
    const notes = inner.match(NOTES_RE);
    const screenHtml = inner.replace(NOTES_RE, ' ');
    return {
      n: i + 1,
      pale: /\bclass="[^"]*\bpale\b/.test(attrs),
      active: /\bclass="[^"]*\bactive\b/.test(attrs),
      inner,
      screenHtml,
      screen: textOf(screenHtml),
      notes: notes ? textOf(notes[1]) : null
    };
  });

/* ── Structure ───────────────────────────────────────────────────── */

if (!slides.length) fail('no <section class="slide"> found');
else if (slides.length < 6 || slides.length > 12) warn(`${slides.length} slides; client decks land best at 7 to 11`);

const actives = slides.filter(s => s.active).length;
if (slides.length && actives !== 1) warn(`${actives} slides carry "active" in markup; exactly one should (the first)`);

const lang = (html.match(/<html[^>]*\blang="([^"]+)"/i) || [])[1];
if (!lang) warn('<html> has no lang attribute');
else info(`language: ${lang}`);

/* ── Per slide ───────────────────────────────────────────────────── */

slides.forEach(s => {
  if (s.notes === null) fail(`slide ${s.n}: no presenter notes (<aside class="notes">)`);
  else if (s.notes.length < 60) warn(`slide ${s.n}: notes are ${s.notes.length} characters; give the presenter what to say, what to ask, what not to overclaim`);

  const words = s.screen.split(' ').filter(w => /[\p{L}\p{N}]/u.test(w)).length;
  if (words > 90) warn(`slide ${s.n}: ${words} words on screen; keep one thesis and move the rest to the notes`);

  const raw = decode(s.inner);
  const dash = raw.indexOf('—');
  if (dash !== -1) {
    const around = textOf(raw.slice(Math.max(0, dash - 60), dash + 60));
    fail(`slide ${s.n}: em dash in copy or notes ("${around}"); rewrite with a period, comma, colon or parentheses`);
  }
  if (/\s–\s/.test(raw)) warn(`slide ${s.n}: a spaced en dash reads as an em dash substitute; rewrite the sentence`);

  if (s.pale) {
    if (/color\s*:\s*var\(--accent\)/.test(s.screenHtml)) fail(`slide ${s.n}: amber text on a pale slide is invisible (1.00:1); use var(--ink-accent), or amber only as a filled .pill.solid`);
    if (/class="[^"]*\bfloat-word\b[^"]*\baccent\b/.test(s.screenHtml)) fail(`slide ${s.n}: .float-word.accent is amber text on a pale slide; drop "accent" or move the slide to the warm ground`);
  }
});

const head = html.match(/<head[\s\S]*?<\/head>/i);
if (head && textOf(head[0].replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ')).includes('—')) {
  fail('em dash in <head> (the title)');
}

/* ── Placeholders, ids, attributes ───────────────────────────────── */

const placeholders = markup.match(/\[\[[\s\S]*?\]\]|\{\{[A-Z_]+\}\}/g);
if (placeholders) {
  const sample = [...new Set(placeholders)].slice(0, 3).map(p => p.replace(/\s+/g, ' ').slice(0, 60));
  fail(`${placeholders.length} unfilled placeholder(s), e.g. ${sample.join(' | ')}`);
}

const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
if (duplicates.length) fail(`duplicate id(s): ${duplicates.join(', ')}`);

for (const m of markup.matchAll(/\sdata-count="([^"]*)"/g)) {
  if (!/^-?\d+(\.\d+)?$/.test(m[1])) fail(`data-count="${m[1]}" is not a plain number (no commas, units or placeholders)`);
}

for (const m of markup.matchAll(/\sdata-bind="([^"]*)"/g)) {
  if (!new RegExp(`<input[^>]*\\sid="${m[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(markup)) {
    fail(`data-bind="${m[1]}" has no <input id="${m[1]}">`);
  }
}

if (/\sdata-hinge\b/.test(markup) && !/<script[^>]*chart[^>]*\.js/i.test(html)) {
  fail('a data-hinge chart needs the Chart.js <script> in <head>');
}

/* ── Scripts ─────────────────────────────────────────────────────── */

inlineScripts.forEach((code, i) => {
  try { new vm.Script(code, { filename: `inline-script-${i + 1}.js` }); }
  catch (e) { fail(`inline script ${i + 1} does not parse: ${e.message}`); }
});
if (!inlineScripts.some(code => code.includes('window.Deck'))) warn('the deck engine is not inlined; navigation will not work');

/* ── Assets ──────────────────────────────────────────────────────── */

const refs = new Set();
for (const m of markup.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) refs.add(m[1]);
for (const m of markup.matchAll(/\s(?:src|href)="([^"]+)"/g)) refs.add(m[1]);
refs.forEach(ref => {
  if (/^(https?:|data:|mailto:|tel:|#)/.test(ref)) return;
  if (!existsSync(resolve(deckDir, ref.split(/[?#]/)[0]))) fail(`missing asset: ${ref}`);
});

if (/\sdata-geo-home=/.test(markup)) {
  const base = (html.match(/<body[^>]*\sdata-assets="([^"]*)"/i) || [])[1] ?? '../public/';
  if (!existsSync(resolve(deckDir, base, 'geodesic-01', 'webp', 'frame-0001.webp'))) {
    fail(`geodesic frames not found under ${base}geodesic-01/webp/; the cover and closing would stay still`);
  }
}

/* ── Numbers against the analysis ─────────────────────────────────── */

const numbersIn = text => (text.match(/\d[\d,]*(?:\.\d+)?/g) || [])
  .map(x => x.replace(/,/g, ''))
  .filter(x => !/^0\d$/.test(x))                                // act labels and step numbers: 01, 02
  .filter(x => !(x.length === 4 && +x >= 1900 && +x <= 2100));  // years

const scanText = s => textOf(s.screenHtml.replace(/<(div|span)\b[^>]*class="[^"]*\b(title-meta|eyebrow|counter|act)\b[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, ' '));

// The magnitude suffix has to touch the digits and end the word: "$1bn" is a
// billion, but "$55 Build" is fifty-five dollars followed by a label.
const money = slides.flatMap(s => (s.screen.match(/(?:US\$|MX\$|€|£|\$)\s?\d[\d,]*(?:\.\d+)?(?:bn|[KMB](?![A-Za-z]))?(?:\/\w+)?|\b\d[\d,]*(?:\.\d+)?\s?(?:USD|MXN|EUR)\b/g) || [])
  .map(x => `slide ${s.n}: ${x}`));
if (money.length) info(`money on screen (each must come from the analysis): ${money.join('; ')}`);

if (analysisPath) {
  const analysis = readFileSync(analysisPath, 'utf8');
  const known = new Set(numbersIn(analysis).map(Number));
  slides.forEach(s => {
    const unknown = [...new Set(numbersIn(scanText(s)))].filter(x => !known.has(Number(x)));
    if (unknown.length) warn(`slide ${s.n}: number(s) on screen not found in the analysis: ${unknown.join(', ')}; trace each one (and label it) or cut it`);
  });
} else {
  slides.forEach(s => {
    const found = [...new Set(numbersIn(scanText(s)))];
    if (found.length) info(`slide ${s.n} numbers: ${found.join(', ')} (pass --analysis to check them)`);
  });
}

/* ── Report ──────────────────────────────────────────────────────── */

for (const level of ['FAIL', 'WARN', 'INFO']) {
  for (const message of report[level]) console.log(`${level.padEnd(4)}  ${message}`);
}
console.log(`\n${slides.length} slides · ${report.FAIL.length} fail · ${report.WARN.length} warn`);
process.exit(report.FAIL.length ? 1 : 0);
