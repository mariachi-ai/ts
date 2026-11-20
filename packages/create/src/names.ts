import { ValidationError } from '@mariachi/core';

/** The Postgres database a project uses, from its package name: `@acme/my-app` → `_acme_my_app`. */
export function databaseName(name: string): string {
  return name.replace(/[^a-z0-9_]/gi, '_');
}

export interface Names {
  /** `invoice-item` */
  kebab: string;
  /** `InvoiceItem` */
  pascal: string;
  /** `invoiceItem` */
  camel: string;
  /** `invoice-items` */
  pluralKebab: string;
  /** `InvoiceItems` */
  pluralPascal: string;
  /** `invoiceItems` (procedure namespace) */
  pluralCamel: string;
  /** `invoice_items` (SQL table) */
  pluralSnake: string;
}

const NAME = /^[a-zA-Z][a-zA-Z0-9]*(?:[-_ ][a-zA-Z0-9]+)*$/;

function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

/** Words whose plural is the same word. */
const UNCOUNTABLE = new Set([
  'aircraft',
  'data',
  'deer',
  'equipment',
  'feedback',
  'fish',
  'hardware',
  'information',
  'media',
  'metadata',
  'moose',
  'news',
  'offspring',
  'series',
  'sheep',
  'software',
  'species',
  'staff',
  'wildlife',
]);

/** Plurals no rule produces. */
const IRREGULAR: Record<string, string> = {
  alumnus: 'alumni',
  calf: 'calves',
  child: 'children',
  criterion: 'criteria',
  datum: 'data',
  die: 'dice',
  echo: 'echoes',
  elf: 'elves',
  embargo: 'embargoes',
  foot: 'feet',
  goose: 'geese',
  half: 'halves',
  hero: 'heroes',
  knife: 'knives',
  leaf: 'leaves',
  life: 'lives',
  loaf: 'loaves',
  man: 'men',
  matrix: 'matrices',
  medium: 'media',
  mouse: 'mice',
  ox: 'oxen',
  person: 'people',
  phenomenon: 'phenomena',
  potato: 'potatoes',
  scarf: 'scarves',
  self: 'selves',
  shelf: 'shelves',
  thief: 'thieves',
  tomato: 'tomatoes',
  tooth: 'teeth',
  vertex: 'vertices',
  torpedo: 'torpedoes',
  veto: 'vetoes',
  wife: 'wives',
  wolf: 'wolves',
  woman: 'women',
};

/** Words ending in `ch` said as a k, which take a plain `s`. */
const HARD_CH = new Set(['epoch', 'loch', 'matriarch', 'monarch', 'oligarch', 'patriarch', 'stomach', 'tech']);

/**
 * The plural of one lower-case English word: uncountables and irregulars (`person` → `people`,
 * `leaf` → `leaves`, `hero` → `heroes`), then the rules for `-y`, `-is`, `-s`, `-x`, `-z`, `-ch`
 * and `-sh`. A compound's last part is matched too (`salesperson` → `salespeople`).
 * Anything else gets an `s`. `--plural` covers a word these get wrong.
 */
export function pluralize(word: string): string {
  if (UNCOUNTABLE.has(word)) return word;
  if (IRREGULAR[word]) return IRREGULAR[word];
  for (const [singular, plural] of Object.entries(IRREGULAR)) {
    // Only nouns long enough not to be a coincidence: salesperson, bookshelf, but not human (man) or eco (echo)
    if (singular.length >= 4 && word.endsWith(singular)) return word.slice(0, -singular.length) + plural;
  }
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(?:sis|xis)$/.test(word)) return `${word.slice(0, -2)}es`;
  if (/(?:qu|[^aeiou])[aeiou]z$/.test(word)) return `${word}zes`;
  if (/ch$/.test(word) && HARD_CH.has(word)) return `${word}s`;
  if (/(?:s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  return `${word}s`;
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
const pascalOf = (ws: string[]) => ws.map(cap).join('');
const camelOf = (ws: string[]) => ws[0] + ws.slice(1).map(cap).join('');

function checked(input: string, what = 'name'): string[] {
  if (!NAME.test(input)) {
    throw new ValidationError(`Invalid ${what} "${input}": use letters, digits and dashes, starting with a letter`, [
      { path: [what], message: `Invalid ${what}` },
    ]);
  }
  return words(input);
}

export interface NamesOptions {
  /** The plural, when the rules get it wrong: `cactus` with `cacti`. Any casing. */
  plural?: string;
}

export function names(input: string, options: NamesOptions = {}): Names {
  const parts = checked(input);
  const plural = options.plural ? checked(options.plural, 'plural') : [...parts.slice(0, -1), pluralize(parts[parts.length - 1])];
  return {
    kebab: parts.join('-'),
    pascal: pascalOf(parts),
    camel: camelOf(parts),
    pluralKebab: plural.join('-'),
    pluralPascal: pascalOf(plural),
    pluralCamel: camelOf(plural),
    pluralSnake: plural.join('_'),
  };
}

/** Event names: lowercase, dot-separated, two parts or more (`billing.invoice.paid`). Matches `mariachi validate`. */
export const EVENT_NAME = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;

export interface EventNames {
  /** `billing.invoice.paid` */
  event: string;
  /** `billing-invoice-paid` (file names) */
  kebab: string;
  /** `billingInvoicePaid` (the definition) */
  camel: string;
  /** `BillingInvoicePaid` (the payload type) */
  pascal: string;
}

export function eventNames(input: string): EventNames {
  if (!EVENT_NAME.test(input)) {
    throw new ValidationError(
      `Invalid event name "${input}": use lowercase words joined by dots, domain first, like billing.invoice.paid`,
      [{ path: ['event'], message: 'Invalid event name' }],
    );
  }
  const parts = input.split(/[.-]/);
  return { event: input, kebab: parts.join('-'), camel: camelOf(parts), pascal: pascalOf(parts) };
}
