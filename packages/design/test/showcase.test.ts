import { describe, expect, it } from 'vitest';
import { archetypes } from '../src/archetypes';
import { buildFingerprint } from '../src/fingerprint';
import type { MeasuredScreen } from '../src/fingerprint';
import {
  arrangementOf,
  arrangements,
  arrangementsFrom,
  drawnKinds,
  drawShowcase,
  exampleContent,
  isDrawn,
  showcaseKinds,
  showcasePatterns,
} from '../src/showcase';

const screen = (id: string, measures: MeasuredScreen['result']['measures']): MeasuredScreen => ({
  id,
  kinds: ['list'],
  width: 'wide',
  result: { specVersion: 1, width: 1440, measures },
});
const lib = (
  name: string,
  sep: Record<string, number>,
  heading: number,
  row: number,
  at: Record<string, number>,
  role = 'none',
) =>
  buildFingerprint(
    name,
    [1, 2, 3].map((i) =>
      screen(`${name}${i}`, {
        'structure.separation': sep,
        'type.headingRatio': heading,
        'density.rowHeight': row,
        'space.contentWidth': 0.6,
        'emphasis.primaryAt': at,
        'media.role': role,
      }),
    ),
    { mode: 'language', measuredAt: '' },
  );

describe('arrangements', () => {
  const fps = [
    lib('ruled', { border: 0.1, divider: 0.5, space: 0.4 }, 1.4, 28, { 'top-right': 3 }),
    lib('raised', { shadow: 0.5, space: 0.5 }, 2.2, 44, { 'bottom-centre': 2 }, 'leads'),
    lib('tinted', { tint: 0.6, space: 0.4 }, 3.4, 60, { inRow: 2 }, 'thumb'),
  ];
  const arr = arrangementsFrom(fps);

  it('picks the separation a language uses most above the others, not the one everyone uses', () => {
    expect(arr.ruled.separation).toBe('divider');
    expect(arr.raised.separation).toBe('shadow');
    expect(arr.tinted.separation).toBe('tint');
  });
  it('cuts the scales into thirds of the languages, with a display title above a ratio of 3', () => {
    expect([arr.ruled.title, arr.raised.title, arr.tinted.title]).toEqual(['quiet', 'medium', 'display']);
    expect([arr.ruled.density, arr.raised.density, arr.tinted.density]).toEqual(['dense', 'regular', 'airy']);
  });
  it('places the main action where its pages put it, and the picture by its role', () => {
    expect([arr.ruled.primary, arr.raised.primary, arr.tinted.primary]).toEqual(['header', 'footer', 'inline']);
    expect([arr.ruled.media, arr.raised.media, arr.tinted.media]).toEqual(['thumb', 'leads', 'thumb']);
  });
  it('has a generated arrangement for every language', () => {
    for (const a of archetypes) expect(arrangements[a.id], a.id).toBeDefined();
  });
});

describe('drawing', () => {
  it('draws every drawn kind in every language, with the library classes and tokens only', () => {
    for (const a of archetypes) {
      for (const kind of drawnKinds) {
        const html = drawShowcase(kind, a);
        expect(html).toContain('m-');
        // No raw colours outside the neutral artwork (a data: URI)
        expect(html.replace(/data:image\/svg\+xml;utf8,[^"]*/g, '')).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(/i);
      }
    }
  });
  it('draws the same content as different structure in languages that arrange differently', () => {
    const differing = archetypes.filter(
      (a) => JSON.stringify(arrangementOf(a)) !== JSON.stringify(arrangementOf(archetypes[0])),
    );
    expect(differing.length).toBeGreaterThan(0);
    const strip = (s: string) => s.replace(/data-theme="[^"]*"/g, '');
    expect(strip(drawShowcase('card', archetypes[0]))).not.toBe(strip(drawShowcase('card', differing[0])));
  });
  it("escapes the person's content", () => {
    const html = drawShowcase('card', archetypes[0], { ...exampleContent.card, title: '<script>x</script>' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
  it('says which kinds have a template, and refuses the rest', () => {
    expect(isDrawn('player')).toBe(true);
    expect(isDrawn('map')).toBe(false);
    expect(showcaseKinds).toContain('dashboard_tile');
    expect(() => drawShowcase('map' as never, archetypes[0])).toThrow(/No showcase template/);
  });
  it('gives each language its named patterns, with aliases', () => {
    const p = showcasePatterns(archetypes[0]);
    expect(p.map((x) => x.name)).toEqual([...drawnKinds]);
    expect(p.find((x) => x.name === 'card')?.aliases).toContain('job card');
  });
});
