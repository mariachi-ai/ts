/**
 * From fingerprints to arrangements. Each measure is read relative to all the languages measured together: a
 * language's separation is the one it uses most above the others' average, and the scales are cut into thirds of
 * the languages, so every arrangement says what sets a language apart.
 */
import { type Fingerprint, quantile } from '../fingerprint/fingerprint';
import type { Arrangement } from './types';

const SEPARATIONS = ['border', 'shadow', 'tint', 'divider', 'space'] as const;

const num = (fp: Fingerprint, id: string): number | undefined => {
  const m = fp.measures[id];
  return m?.unit === 'number' && typeof m.typical === 'number' ? m.typical : undefined;
};
const shares = (fp: Fingerprint, id: string): Record<string, number> => {
  const m = fp.measures[id];
  return m && typeof m.typical === 'object' ? (m.typical as Record<string, number>) : {};
};

/** Which third of the languages a value falls in: 0, 1 or 2. */
function third(value: number | undefined, all: number[]): 0 | 1 | 2 {
  if (value === undefined || !all.length) return 1;
  if (value <= quantile(all, 1 / 3)) return 0;
  if (value >= quantile(all, 2 / 3)) return 2;
  return 1;
}

/** The arrangement of every language measured, keyed by library id. */
export function arrangementsFrom(fps: Fingerprint[]): Record<string, Arrangement> {
  const values = (id: string) => fps.map((f) => num(f, id)).filter((v): v is number => v !== undefined);
  const heading = values('type.headingRatio');
  const rows = values('density.rowHeight');
  const width = values('space.contentWidth');
  const mean = Object.fromEntries(
    SEPARATIONS.map((k) => [k, fps.reduce((s, f) => s + (shares(f, 'structure.separation')[k] ?? 0), 0) / fps.length]),
  );
  const out: Record<string, Arrangement> = {};
  for (const fp of fps) {
    const sep = shares(fp, 'structure.separation');
    // The one it uses most above the average share (a plain difference: a rare habit with a small share doesn't win)
    const separation = [...SEPARATIONS].sort((a, b) => (sep[b] ?? 0) - mean[b] - ((sep[a] ?? 0) - mean[a]))[0];

    const role = shares(fp, 'media.role');
    const leads = (role.leads ?? 0) + (role.fullBleed ?? 0);
    const beside = role.inset ?? 0;
    const thumb = role.thumb ?? 0;
    const media: Arrangement['media'] =
      leads > 0 && leads >= beside && leads >= thumb ? 'leads' : beside > 0 && beside >= thumb ? 'beside' : 'thumb';

    const hr = num(fp, 'type.headingRatio');
    const title: Arrangement['title'] =
      hr !== undefined && hr >= 3 ? 'display' : (['quiet', 'medium', 'loud'] as const)[third(hr, heading)];

    const density = (['dense', 'regular', 'airy'] as const)[third(num(fp, 'density.rowHeight'), rows)];

    const at = shares(fp, 'emphasis.primaryAt');
    const place: Record<Arrangement['primary'], number> = { header: 0, footer: 0, centre: 0, inline: 0 };
    for (const [k, v] of Object.entries(at)) {
      if (k.startsWith('top-')) place.header += v;
      else if (k.startsWith('bottom-')) place.footer += v;
      else if (k === 'middle-centre') place.centre += v;
      else place.inline += v;
    }
    const primary = (Object.entries(place).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'footer') as Arrangement['primary'];

    const w = (['narrow', 'regular', 'wide'] as const)[third(num(fp, 'space.contentWidth'), width)];
    out[fp.library] = { separation, media, title, density, primary, width: w };
  }
  return out;
}
