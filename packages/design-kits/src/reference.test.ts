import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { run } from './cli';
import { DesignKitsError } from './errors';
import { fixtureStore, tmp } from './fixture';
import { ANSWER_MAX_CHARS, designDocEntry, designReference, type ReferenceSource, referenceList, themeTokens } from './reference';

const DESIGN_MD = `# Linen

## Foundations

Calm and warm.

## Components

**Layout.** Pages use the layout primitives:
- \`m-container\`, the content column;
- \`m-split\`, the sidebar beside the content.

**Actions and forms**
- **Button.** A rectangle with 6px corners.
  - **Primary:** the ink colour.
  - **Ghost:** text only.
- **Input, textarea.** 36px, a hairline border.

**Data and content**
- **Badges.** A pill, 24px high.
- **Card.** A hairline ring, 8px corners.

## Page shapes

Not components.
`;

const TOKENS = `:where([data-theme="linen"]) {
  --m-color-accent-default: #123456;
  --m-button-radius: 6px;
  --m-button-font-weight: 500;
}
@media (prefers-color-scheme: dark) { :where([data-theme="linen"]) { --m-button-radius: 6px; } }
`;

function source(over: Partial<{ css: Record<string, string> }> = {}): ReferenceSource {
  const css: Record<string, string> = over.css ?? { button: '.m-button { border-radius: var(--m-button-radius); }\n' };
  return {
    components: () => [
      { name: 'button', title: 'Button', description: 'An action', useWhen: 'an action on the page', anatomy: { '.m-button': 'the button', '.m-button--primary': 'the main action' }, a11y: ['Use a real <button>.'], examples: [{ name: 'Primary', html: '<button class="m-button m-button--primary">Save</button>' }] },
      { name: 'input', title: 'Input', description: 'A text field', useWhen: 'typing a value' },
      { name: 'card', title: 'Card', description: 'A surface for one thing', useWhen: 'grouping one item' },
      { name: 'badge', title: 'Badge', description: 'A short label', useWhen: 'a status or count' },
      { name: 'table', title: 'Table', description: 'Rows of data', useWhen: 'comparing rows' },
    ],
    languages: () => [{ id: 'linen', label: 'Linen', for: 'calm tools', recipes: [{ name: 'settings', title: 'Settings', html: '<main>\n<form>\n<button class="m-button m-button--primary">Save changes</button>\n</form>\n</main>' }] }],
    hasKit: (id) => id === 'linen' || id === 'minimal',
    kitFile: (id, file) => (id === 'linen' && file === 'DESIGN.md' ? DESIGN_MD : file === 'tokens.css' ? TOKENS.replace(/linen/g, id) : null),
    componentCss: (name) => css[name] ?? null,
    componentCssPath: (name) => `/kits/reference/components/${name}.css`,
    patterns: (language) => (language === 'linen' ? [{ name: 'player', aliases: ['audio player', 'media player'], intent: 'A track playing, with its controls.', html: '<div class="m-card">\n<button class="m-button">Play</button>\n</div>' }] : []),
  };
}

describe('designReference', () => {
  it("answers a component in the kit's language: how it's drawn, its values, anatomy, an example, its CSS and where it appears", () => {
    const answer = designReference('button', 'linen', source());
    expect(answer.found).toBe('component');
    const md = answer.markdown;
    expect(md).toMatch(/^# Button, in Linen/);
    expect(md).toContain('## How this language draws it\n- **Button.** A rectangle with 6px corners.\n  - **Primary:** the ink colour.\n  - **Ghost:** text only.');
    expect(md).toContain('--m-button-radius: 6px;\n--m-button-font-weight: 500;');
    expect(md.match(/--m-button-radius:/g), "each token declared once, light and dark alike").toHaveLength(1);
    expect(md).toContain('- `.m-button--primary`: the main action');
    expect(md).toContain('Accessibility:\n- Use a real <button>.');
    expect(md).toContain('**Primary**\n```html\n<button class="m-button m-button--primary">Save</button>\n```');
    expect(md).toContain('```css\n.m-button { border-radius: var(--m-button-radius); }\n```');
    expect(md).toContain('## Where it appears: the Settings page');
  });

  it('finds a component by its title, in any case, with spaces or underscores', () => {
    for (const name of ['Button', ' BUTTON ', 'button']) expect(designReference(name, 'linen', source()).found).toBe('component');
  });

  it('answers a named pattern, by its name or an alias', () => {
    for (const name of ['player', 'Audio player', 'media_player']) {
      const answer = designReference(name, 'linen', source());
      expect(answer.found, name).toBe('pattern');
      expect(answer.markdown).toMatch(/^# player, in Linen \(a pattern\)\n\nA track playing, with its controls\./);
      expect(answer.markdown).toContain('<button class="m-button">Play</button>');
    }
  });

  it("says what isn't there, and the nearest components to compose it from", () => {
    const answer = designReference('data grid', 'linen', source());
    expect(answer.found).toBe('none');
    expect(answer.found === 'none' && answer.suggestions).toContain('table');
    expect(answer.markdown).toMatch(/"data grid" isn't a component or a named pattern in Linen/);
    expect(answer.markdown).toContain('mariachi design reference --list');
  });

  it('answers for a plain preset on the library defaults, with its tokens and no language notes', () => {
    const md = designReference('button', 'minimal', source()).markdown;
    expect(md).toMatch(/^# Button, in minimal/);
    expect(md).toContain('minimal is a plain preset, not a design language');
    expect(md).toContain('--m-button-radius: 6px;');
    expect(md).not.toContain('Where it appears');
  });

  it('names long CSS by its path instead of quoting it', () => {
    const md = designReference('button', 'linen', source({ css: { button: '.m-button { color: red; }\n'.repeat(400) } })).markdown;
    expect(md).toContain('copy it from `/kits/reference/components/button.css` as it is');
    expect(md).not.toContain('```css\n.m-button { color: red; }');
  });

  it('says so when a component has no CSS file', () => {
    expect(designReference('card', 'linen', source()).markdown).toContain('(No CSS file for it in this build.)');
  });

  it('refuses an unknown kit with a stable code', () => {
    expect(() => designReference('button', 'velvet', source())).toThrowError(DesignKitsError);
    try {
      designReference('button', 'velvet', source());
    } catch (err) {
      expect((err as DesignKitsError).code).toBe('design-kits/unknown-kit');
    }
  });

  it(`never answers more than ${ANSWER_MAX_CHARS} characters`, () => {
    const huge = source();
    const long = { ...huge, kitFile: (id: string, file: string) => (file === 'DESIGN.md' ? DESIGN_MD.replace('A rectangle with 6px corners.', 'x'.repeat(20_000)) : huge.kitFile(id, file)) };
    expect(designReference('button', 'linen', long).markdown.length).toBeLessThanOrEqual(ANSWER_MAX_CHARS);
  });
});

describe('referenceList', () => {
  it("names the components and, for a language, its patterns; with no kit, the languages", () => {
    const withKit = referenceList('linen', source());
    expect(withKit).toContain('# Design reference: Linen');
    expect(withKit).toContain('- `button`: An action');
    expect(withKit).toContain('## Patterns in this language\n- `player` (also audio player, media player): A track playing');
    expect(withKit).not.toContain('## Languages');
    const none = referenceList(null, source());
    expect(none).toContain('## Languages\n- `linen`: calm tools');
  });
});

describe('designDocEntry', () => {
  it('finds a bullet with its nested bullets, a plural, a name among several, and a bold paragraph with its list', () => {
    expect(designDocEntry(DESIGN_MD, 'Input', 'input')).toBe('- **Input, textarea.** 36px, a hairline border.');
    expect(designDocEntry(DESIGN_MD, 'Badge', 'badge')).toBe('- **Badges.** A pill, 24px high.');
    expect(designDocEntry(DESIGN_MD, 'Layout', 'layout')).toBe('**Layout.** Pages use the layout primitives:\n- `m-container`, the content column;\n- `m-split`, the sidebar beside the content.');
    expect(designDocEntry(DESIGN_MD, 'Tooltip', 'tooltip')).toBeNull();
    expect(designDocEntry('# No components section', 'Button')).toBeNull();
    expect(designDocEntry(null, 'Button')).toBeNull();
  });
});

describe('themeTokens', () => {
  it("lists a component's own tokens once each", () => {
    expect(themeTokens(TOKENS, 'button')).toEqual(['--m-button-radius: 6px;', '--m-button-font-weight: 500;']);
    expect(themeTokens(TOKENS, 'card')).toEqual([]);
    expect(themeTokens(null, 'button')).toEqual([]);
  });
});

describe('the command line: reference', () => {
  function cli() {
    const { store } = fixtureStore();
    // The fixture store packs kits only; give it the catalog and the reference beside them, as pack.mjs does
    fs.writeFileSync(path.join(store.root, 'catalog.json'), JSON.stringify({ components: [{ name: 'button', title: 'Button', description: 'An action', useWhen: 'an action' }], archetypes: [{ id: 'linen', label: 'Linen', for: 'calm tools' }] }));
    fs.mkdirSync(path.join(store.root, 'reference', 'components'), { recursive: true });
    fs.writeFileSync(path.join(store.root, 'reference', 'components', 'button.css'), '.m-button { border-radius: var(--m-button-radius); }\n');
    const cwd = tmp('project');
    const out: string[] = [];
    const err: string[] = [];
    return { cwd, out, err, run: (...argv: string[]) => run(argv, { cwd, store, out: (l) => out.push(l), err: (l) => err.push(l) }) };
  }

  it("answers for the project's own kit, the one in src/design", () => {
    const c = cli();
    expect(c.run('add', 'linen')).toBe(0);
    c.out.length = 0;
    expect(c.run('reference', 'button')).toBe(0);
    expect(c.out.join('\n')).toMatch(/^# Button, in Linen/);
    expect(c.out.join('\n')).toContain('.m-button { border-radius: var(--m-button-radius); }');
  });

  it('takes --kit, prints JSON with --json, and lists with --list', () => {
    const c = cli();
    expect(c.run('reference', 'button', '--kit', 'linen', '--json')).toBe(0);
    expect(JSON.parse(c.out.join('\n'))).toMatchObject({ found: 'component', kit: 'linen', name: 'button' });
    c.out.length = 0;
    expect(c.run('reference', '--list', '--kit', 'linen')).toBe(0);
    expect(c.out.join('\n')).toContain('- `button`: An action');
  });

  it('exits 1 with the nearest names for something it has no answer for', () => {
    const c = cli();
    expect(c.run('reference', 'carousel', '--kit', 'linen')).toBe(1);
    expect(c.out.join('\n')).toMatch(/"carousel" isn't a component or a named pattern in Linen/);
  });

  it('says how to name a kit when the project has none', () => {
    const c = cli();
    expect(c.run('reference', 'button')).toBe(1);
    expect(c.err.join('\n')).toMatch(/There's no kit in src\/design to answer for\. Name one with --kit <id>/);
  });

  it('wants a name, unless --list', () => {
    const c = cli();
    expect(c.run('reference', '--kit', 'linen')).toBe(2);
    expect(c.err[0]).toMatch(/reference takes the name of a component or pattern/);
  });
});
