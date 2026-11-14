import path from 'node:path';
import type { AddKitResult, KitChanges } from './add';
import type { KitSummary } from './store';

const rel = (cwd: string, file: string) => (path.relative(cwd, file) || '.').split(path.sep).join('/');

/** The lines `design add` prints for a result. Paths are shown from `cwd`. */
export function formatAddResult(result: AddKitResult, cwd: string = process.cwd()): string[] {
  const { kit } = result;
  const dir = `${rel(cwd, result.dir)}/`;
  const would = result.dryRun ? 'would be ' : '';
  const from = `@mariachi/design ${kit.version}, commit ${kit.commit}`;
  const name = `${kit.label} (${kit.id})`;
  const lines: string[] = [];
  if (result.status === 'unchanged') lines.push(`unchanged ${dir} is ${name} exactly as packed (${from})`);
  else if (result.status === 'switched') lines.push(`${would}switched ${dir} from ${result.previous?.id} to ${name}: ${result.files.length} files (${from})`);
  else if (result.status === 'updated') {
    const was = result.previous && result.previous.version !== kit.version ? ` from ${result.previous.version}` : '';
    lines.push(`${would}updated ${dir} ${name}${was}: ${result.files.length} files (${from})`);
  } else lines.push(`${would}added ${dir} ${name}: ${result.files.length} files (${from})`);
  for (const [what, files] of [['edited', result.discarded.edited], ['missing', result.discarded.missing], ["the project's own file, written over", result.discarded.extra]] as const) {
    for (const file of files) lines.push(`${would}discarded ${dir}${file} (${what})`);
  }
  for (const file of result.left) lines.push(`left ${dir}${file} (the project's own file; a kit's folder is for the kit)`);
  const css = rel(cwd, result.designCss.path);
  lines.push(result.designCss.created ? `${would}created ${css} (the project's own changes; never written again)` : `kept ${css} (the project's own; not touched)`);
  if (result.status !== 'unchanged') {
    lines.push('', 'Next:');
    lines.push(`  1. Import, in this order: ${result.next.imports.map((f) => rel(cwd, f)).join(', ')}`);
    lines.push(`  2. Set data-theme="${result.next.dataTheme}" on <html>. The mode follows the system; data-mode="light" or "dark" pins it.`);
    if (result.next.enhance) lines.push(`  3. Call enhance() from ${rel(cwd, result.next.enhance)} once at start (loading, motion and charts).`);
    lines.push(`  ${result.next.enhance ? 4 : 3}. Components aren't copied: make each one when the app needs it, as ${rel(cwd, result.next.reference)} describes, on --m-* tokens.`);
  }
  return lines;
}

/** The lines for a refusal (`design-kits/edited`): the files the project changed. */
export function formatChanges(changes: KitChanges, dir = ''): string[] {
  const at = dir ? `${dir.replace(/\/$/, '')}/` : '';
  return [
    ...changes.edited.map((file) => `  edited   ${at}${file}`),
    ...changes.missing.map((file) => `  missing  ${at}${file}`),
    ...changes.extra.map((file) => `  in the way  ${at}${file} (the project's own file, where the new kit has one)`),
  ];
}

/** The lines `design list` prints for the kits: languages by category, then the plain presets. */
export function formatKitList(kits: KitSummary[]): string[] {
  const width = Math.max(...kits.map((k) => k.id.length), 4) + 2;
  const row = (k: KitSummary) =>
    `  ${k.id.padEnd(width)}${[k.label, k.mode === 'both' ? null : k.mode, k.fonts.length ? k.fonts.join(' + ') : 'system fonts', `${Math.round(k.bytes / 1024)} KB`].filter(Boolean).join(' · ')}`;
  const lines: string[] = [];
  const languages = kits.filter((k) => k.kind === 'language');
  for (const category of [...new Set(languages.map((k) => k.category ?? 'other'))].sort()) {
    lines.push(`Languages: ${category}`);
    for (const k of languages.filter((l) => (l.category ?? 'other') === category)) lines.push(row(k));
  }
  const presets = kits.filter((k) => k.kind === 'preset');
  if (presets.length) {
    lines.push('Plain presets');
    for (const k of presets) lines.push(row(k));
  }
  return lines;
}
