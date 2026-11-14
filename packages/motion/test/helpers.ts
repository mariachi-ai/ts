import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(__dirname, '..');
export const motionCss = fs.readFileSync(path.join(root, 'src/css/motion.css'), 'utf8');

/** A colour literal: hex, a colour function, or a named colour (currentcolor and transparent are fine). */
export const COLOUR_LITERAL =
  /#[0-9a-f]{3,8}\b(?![-\w])|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|(?<![-\w])(?:white|black|red|green|blue|gray|grey|orange|yellow|purple|pink|silver)(?![-\w])/i;

export interface Rule {
  selectors: string[];
  declarations: string;
  /** Enclosing at-rule preludes, outermost first ("@layer mariachi.motion", "@media (…)"). */
  context: string[];
}

/** Splits on commas that aren't inside parentheses. */
export function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** A small CSS walker: every style rule with its own declarations (nested blocks removed) and its at-rule context. */
export function rules(css: string, context: string[] = []): Rule[] {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out: Rule[] = [];
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf('{', i);
    const semi = src.indexOf(';', i);
    if (open === -1) break;
    if (semi !== -1 && semi < open) {
      i = semi + 1;
      continue;
    }
    const prelude = src.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++;
      if (src[j] === '}') depth--;
      j++;
    }
    const inner = src.slice(open + 1, j - 1);
    if (prelude.startsWith('@starting-style') && !inner.includes('{')) {
      // Nested in a rule: the starting style's own declarations
      out.push({ selectors: [prelude], declarations: inner, context });
    } else if (prelude.startsWith('@')) {
      if (!prelude.startsWith('@keyframes')) out.push(...rules(inner, [...context, prelude]));
    } else {
      // Declarations are what's left at depth 0; nested blocks (@starting-style) are walked as their own context
      let own = '';
      let d = 0;
      let start = 0;
      for (let k = 0; k < inner.length; k++) {
        if (inner[k] === '{') {
          if (d === 0) {
            const lastSemi = inner.lastIndexOf(';', k);
            own += inner.slice(start, lastSemi + 1);
            start = lastSemi + 1;
          }
          d++;
        } else if (inner[k] === '}') {
          d--;
          if (d === 0) {
            const nested = inner.slice(start, k + 1);
            out.push(...rules(nested, [...context, `nested in ${prelude}`]));
            start = k + 1;
          }
        }
      }
      own += inner.slice(start);
      out.push({ selectors: splitTop(prelude), declarations: own, context });
    }
    i = j;
  }
  return out;
}

/** The body of a @keyframes rule, whitespace-normalised. */
export function keyframes(css: string, name: string): string | undefined {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const at = src.indexOf(`@keyframes ${name} {`);
  if (at === -1) return undefined;
  let depth = 0;
  let j = src.indexOf('{', at);
  const start = j;
  do {
    if (src[j] === '{') depth++;
    if (src[j] === '}') depth--;
    j++;
  } while (depth > 0);
  return src.slice(start, j).replace(/\s+/g, ' ').trim();
}

/** Checks tags open and close in order (void HTML elements and self-closing tags allowed). */
export function wellFormed(markup: string): string | true {
  const stack: string[] = [];
  const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
  for (const m of markup.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    const [, close, tag, , self] = m;
    if (self || VOID.has(tag)) continue;
    if (close) {
      const top = stack.pop();
      if (top !== tag) return `</${tag}> closes <${top}>`;
    } else stack.push(tag);
  }
  return stack.length ? `unclosed <${stack.join('>, <')}>` : true;
}
