/**
 * Small edits to TypeScript source a generator adds to, rather than writes. They work on the text,
 * so they expect the formatting generated files have.
 */

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * `source` importing `names` from `from`: added to its import of that module when it has one
 * (`import type` for `type: true`), else as a new import after the last one.
 */
export function addImport(source: string, names: string[], from: string, options: { type?: boolean } = {}): string {
  const existing = new RegExp(`import\\s+${options.type ? 'type\\s+' : ''}\\{([^}]*)\\}\\s*from\\s*['"]${escapeRegExp(from)}['"];?`);
  const match = existing.exec(source);
  if (match) {
    const have = match[1].split(',').map((n) => n.trim()).filter(Boolean);
    const missing = names.filter((n) => !have.includes(n) && !have.includes(`type ${n}`));
    if (missing.length === 0) return source;
    const multiline = match[1].includes('\n');
    const list = multiline
      ? `{${match[1].replace(/\s*$/, '')}${match[1].trimEnd().endsWith(',') ? '' : ','}\n${missing.map((n) => `  ${n},`).join('\n')}\n}`
      : `{ ${[...have, ...missing].join(', ')} }`;
    return source.slice(0, match.index) + match[0].replace(/\{[^}]*\}/, list) + source.slice(match.index + match[0].length);
  }
  const statement = `import ${options.type ? 'type ' : ''}{ ${names.join(', ')} } from '${from}';`;
  const lines = source.split('\n');
  let last = -1;
  lines.forEach((line, i) => {
    if (/^import\s.*['"];?\s*$/.test(line) || /^\}\s*from\s*['"][^'"]+['"];?\s*$/.test(line)) last = i;
  });
  lines.splice(last + 1, 0, statement);
  return lines.join('\n');
}

/** Whether `source` imports `name` (as a value or a type) from anywhere. */
export function imports(source: string, name: string): boolean {
  return new RegExp(`import\\s+(?:type\\s+)?\\{[^}]*\\b${escapeRegExp(name)}\\b[^}]*\\}\\s*from`).test(source);
}
