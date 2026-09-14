#!/usr/bin/env node
/* Scaffolds a client deck.

     node new-deck.mjs --client "Halden Structural" [--date 2026-09-24] [--lang en|es] [--out <dir>] [--force]

   Writes presentation/clients/<DD.MM.YYYY_client>/deck.html, the same folder
   format as the site's written proposals, unless --out names another
   directory. The date is the meeting date and defaults to today.

   The <style> block is lifted from presentation/value-deck.html on every run
   rather than copied into this skill once, so a client deck always carries
   the company deck's current tokens and components. Its comments are
   stripped: they narrate that deck's own slides and would mislead here.
   Asset paths are written relative to wherever the deck lands and point at
   the site's own public/ (the hero's geodesic frames, the logo), so no image
   is ever copied into presentation/ or into a client folder: a copy drifts
   from the file the site ships. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const presentationDir = resolve(skillDir, '..', '..', '..');
const companyDeck = join(presentationDir, 'value-deck.html');
const sharedAssets = resolve(presentationDir, '..', 'public');

const USAGE = 'usage: node new-deck.mjs --client "Client Name" [--date YYYY-MM-DD] [--lang en|es] [--out <dir>] [--force]';

const LABELS = {
  en: {
    prepared: 'Prepared for', act1: 'What we found', act2: 'What we propose', act3: 'What changes',
    next: 'Next step', hint: 'N · notes', prev: 'Previous slide', nextSlide: 'Next slide',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    date: (d, m, y) => `${d} ${m} ${y}`
  },
  es: {
    prepared: 'Preparado para', act1: 'Lo que encontramos', act2: 'Lo que proponemos', act3: 'Lo que cambia',
    next: 'Siguiente paso', hint: 'N · notas', prev: 'Diapositiva anterior', nextSlide: 'Diapositiva siguiente',
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    date: (d, m, y) => `${d} de ${m} de ${y}`
  }
};

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

const opts = { lang: 'en', force: false };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--force') opts.force = true;
  else if (argv[i].startsWith('--')) opts[argv[i].slice(2)] = argv[++i];
}
if (!opts.client) die(USAGE, 2);
const L = LABELS[opts.lang];
if (!L) die(`--lang must be one of: ${Object.keys(LABELS).join(', ')}`, 2);

const date = opts.date ? new Date(`${opts.date}T12:00:00`) : new Date();
if (Number.isNaN(date.getTime())) die(`--date must be YYYY-MM-DD, got "${opts.date}"`, 2);
const dd = String(date.getDate()).padStart(2, '0');
const mm = String(date.getMonth() + 1).padStart(2, '0');
const yyyy = date.getFullYear();

const clientSlug = opts.client
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
if (!clientSlug) die('--client needs at least one letter or digit', 2);
const slug = `${dd}.${mm}.${yyyy}_${clientSlug}`;

const outDir = resolve(opts.out || join(presentationDir, 'clients', slug));
const deckFile = join(outDir, 'deck.html');
if (existsSync(deckFile) && !opts.force) die(`${deckFile} already exists; pass --force to overwrite it`);

const source = readFileSync(companyDeck, 'utf8');
const styleMatch = source.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) die(`no <style> block found in ${companyDeck}`);
const css = styleMatch[1]
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/[ \t]+$/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const starter = readFileSync(join(skillDir, 'assets', 'starter.html'), 'utf8');
const engine = readFileSync(join(skillDir, 'assets', 'engine.js'), 'utf8');

let assets = relative(outDir, sharedAssets).split(sep).join('/');
if (!assets.endsWith('/')) assets += '/';

const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tokens = {
  LANG: opts.lang,
  CLIENT: escapeHtml(opts.client),
  DATE_LABEL: L.date(date.getDate(), L.months[date.getMonth()], yyyy),
  ASSETS: assets,
  PREPARED: L.prepared,
  ACT1: L.act1,
  ACT2: L.act2,
  ACT3: L.act3,
  NEXT: L.next,
  HINT: L.hint,
  PREV: L.prev,
  NEXTSLIDE: L.nextSlide
};

// split/join rather than replace(): the engine and the CSS contain `$`, which
// String.prototype.replace would read as a substitution pattern.
let deck = starter;
for (const [key, value] of Object.entries(tokens)) deck = deck.split(`{{${key}}}`).join(value);
deck = deck.split('/*{{STYLE}}*/').join(css).split('/*{{ENGINE}}*/').join(engine);

mkdirSync(outDir, { recursive: true });
writeFileSync(deckFile, deck);

const shown = relative(process.cwd(), deckFile) || deckFile;
console.log(`Created   ${shown}`);
console.log(`Slug      ${slug}`);
console.log(`Language  ${opts.lang}`);
console.log(`Assets    ${assets} (shared, relative to the deck)`);
console.log('');
console.log('Next: replace every [[...]] from the analysis, cut or add slides to fit it, then run');
console.log(`  node ${relative(process.cwd(), join(skillDir, 'scripts', 'check-deck.mjs')) || 'check-deck.mjs'} ${shown} --analysis <analysis file>`);
