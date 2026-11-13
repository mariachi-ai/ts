# Design-language playbook

The one template for making a design library: a new design language, a re-run of an existing one, or a library measured from a URL, an existing product or a project. Follow it in order. When a step changes, change it here, not in one language.

A design library is everything a builder needs to make a new screen that looks as if the product's own team made it:

- **Tokens:** the stated values.
- **A fingerprint:** the habits, measured on rendered screens.
- **Composition:** which patterns the product reaches for, by job, and what it refuses to do.
- **Preferences:** what people show they want as they work.

The measures are defined in [design-fingerprint.md](./design-fingerprint.md); the language format is in [design.md](./design.md).

## Rules for every entry

- **Say how you know.** Every entry is `observed` (measured or seen; cite the screens), `inferred` (your explanation of what you observed), or `told` (a person said it; cite who and when). Never present an inference as a fact.
- **Count.** "12px on 41 of 46 cards; the 5 others are 8px, all inside tables" beats "cards have a 12px radius". Say where the exceptions are.
- **Don't tidy.** Record inconsistencies. Never average two habits into a third that exists nowhere. Say which is more common and which is newer, and ask.
- **Don't import outside conventions,** and don't judge ("clean", "modern"). Describe what's there.
- **Numbers come from the probe,** never from looking at a screenshot.
- **When you can't tell why, ask.** Put it in `questions.md`.
- **Faithful, not interpreted.** A language is one real product's visual system under an abstract name. Copy the system, never the screen: invent all content. Never copy logos, images, icons, illustrations, text or font files; map each font to the closest open font.
- **A refusal means stop.** If a page, a tool or a permission check refuses, stop and say so. Never find another way to the same result.

## The modes

The steps are the same; what's studied and who answers questions differ.

| Mode | Studied | "The team" who answers | Where the library lives |
| --- | --- | --- | --- |
| `language` | The source product's public pages and public screenshots of it, then the language's own recipes | The person commissioning it | `packages/design/src/archetypes/<id>/` (public, abstract), plus private source notes outside Mariachi |
| `existing` | A product's code and its running preview (signed in with test accounts, preview data only) | The project's members | The project's `docs/design/` |
| `url` | Public pages of a site someone likes; no code, no logins | The person who gave the link | The project's `docs/design/`, as a base language plus changes |
| `project` | A new project: seeded from its chosen language, then grown from its own screens | The project's members | The project's `docs/design/` |

## The files

For a language they sit in `archetypes/<id>/`. For a project they sit in `docs/design/`, and the project's copied kit holds `tokens.css` and `base.css`.

| File | Holds | Made by |
| --- | --- | --- |
| `brief.md` | One page: the signature moves, the refusals and the five habits that matter most. Written last | Agent |
| `DESIGN.md` | The language in full words: principles, foundations, every component's states, page shapes, do and don't, plus the generated reference | Agent, then the build |
| `tokens.json` | Layer 1, with how often each token is used across the precedents; declared-but-unused and used-but-undeclared values flagged | Build (probe) |
| `fingerprint.json` | Layer 2: each measure's typical value, range, and values by kind of screen and width | Build (probe) |
| `checks.json` | The fingerprint as advice ("This screen uses five text sizes. Your screens use two or three.") | Build |
| `patterns/<job>.md` | Layer 3: one file per job, with what it does not do and why | Agent |
| `never.md` | The refusals, each with its evidence | Agent |
| `precedents/index.md` | The screen inventory: each screen's id, purpose, kind and the patterns it uses, with screenshots by path | Agent and build |
| `preferences.md` | Layer 4, newest first | Agent, as people react |
| `questions.md` | At most ten questions whose answers would change the most | Agent |

## Steps

Each step lists its inputs, its outputs, its tool and its check. **Script** means a fixed program; **agent** means a model following this playbook.

### 1. Choose (language mode)

- **In:** the category list and the commissioner's list of reference products.
- **Out:** a category, one source product, and an abstract id (one word that is not a product, a design system or a standard). The private notes file names the source; Mariachi never does.
- **Tool:** agent, with a web search for the name.
- **Check:** the id doesn't clash with a known design system, product or standard (for example, `aria` was renamed because of WAI-ARIA).

### 2. Study the source

- **In:** for `language` and `url`, the public pages and public screenshots of the logged-in product found on the web (for reference only, never shipped). For `existing`, the code and the running preview.
- **Out:**
  - **A screen inventory of 15–30 screens**, at least two of each kind the product has, each with its address, its purpose in one line, its kind (see the kinds in design-fingerprint.md) and screenshots at the three widths.
  - **A source fingerprint**, from the probe.
  - In `language` mode, both stay in the private notes.
- **Tool:** the probe (script) over the inventory; the agent picks the screens.
- **Check:**
  - every kind the product has appears at least twice;
  - nothing behind a login, a paywall or a bot check was used;
  - three screens are set aside, unseen, for the rebuild test.

### 3. Tokens and the theme

- **In:** the source fingerprint and the source's computed styles.
- **Out:** `presets/<id>.ts` (`extendTheme`) with colours in light and dark, type, space, radius, shadows and motion; the closest open font for each family. Any deviation made to meet contrast is recorded in the notes.
- **Tool:** agent.
- **Check:** `checkTheme` passes every contrast pair in both modes.

### 4. The language's metadata

- **In:** steps 2 and 3.
- **Out:** `archetypes/<id>/index.ts`:
  - the category and tags (feel, density, mode, suits, style);
  - `for` and `pitch`;
  - the swatches;
  - the type families;
  - the icon set, its stroke, and an icon for each common action;
  - the chart colours and the density.
- **Tool:** agent.
- **Check:** the schema test in `packages/design`.

### 5. Precedents: the recipes

- **In:** the inventory and the theme.
- **Out:** `archetypes/<id>/recipes.ts`.
  - **The seven required page shapes:** `dashboard`, `list-detail`, `onboarding`, `settings`, `empty-state`, `pricing`, `errors`.
  - **More kinds where the source has them:** detail, form, dialog, loading.
  - **Built from:** the library's classes and tokens only, following the source's real screen patterns, with all content invented.
- **Tool:** agent.
- **Check:**
  - side-by-sides (reference left, recipe right) in the private notes;
  - a reviewer agrees each pair reads as the same family.

### 6. Measure the language

- **In:** the built recipes.
- **Out:** `fingerprint.json` and `tokens.json`, by the probe over every recipe at the three widths.
- **Tool:** script.
- **Check: faithfulness, in numbers.**
  - Every measure that has a check falls inside the source fingerprint's range (step 2). Where one doesn't, the recipe is fixed, or the reason is written in the notes.
  - Words are excluded, because recipe content is invented.

### 7. Composition

- **In:** the inventory, the source notes and the recipes.
- **Out:**
  - **`patterns/<job>.md`, one per recurring job.** Each has:
    - the job in a sentence;
    - what the product does, with its parts in order;
    - where it appears;
    - its variations and their triggers;
    - **what it does not do**;
    - why, marked `inferred` or `told`.
  - **How a screen is assembled:** what it opens with, the reading order, how much one screen does, what changes when narrow, and what happens with too much content or none. This goes in `DESIGN.md` under Page shapes.
  - **Signature moves (3–7)** and **`never.md`**, with evidence.
- **Tool:** agent.
- **Check:** every pattern cites at least one precedent, and every never cites the screens that show it.

### 8. `DESIGN.md` and `brief.md`

- **In:** steps 3–7.
- **Out:**
  - **`DESIGN.md`** (principles, foundations, type, icons, charts, every control's states, all components, errors, page shapes, words, do and don't). The build appends the generated reference.
  - **`brief.md`** (one page), written last.
- **Tool:** agent.
- **Check:** `brief.md` fits on one page and cites nothing that isn't in the library.

### 9. Checks, the gallery and the kit

- **In:** the fingerprint and the theme.
- **Out:**
  - **`checks.json`.** Only measures with a clear range get a check (see design-fingerprint.md).
  - **The gallery:** all components in every state, light and dark.
  - **The kit** (`dist/kits/<id>/`), with its header.
- **Tool:** the build (`pnpm --filter @mariachi/design build`).
- **Check:**
  - the build's own checks pass;
  - the kit is under 400 KB;
  - the gallery renders in light and dark.

### 10. The gates

All four must pass before the library is done.

| Gate | How | Passes when |
| --- | --- | --- |
| **Rebuild** | A builder that hasn't seen the three held-out screens (step 2) makes each from the library and a one-line description. The probe measures both | Each rebuilt screen raises at most two check messages against the library, and a reviewer judges it the same family. Every miss adds the missing rule to the library |
| **Stranger** | Run this library's checks over the other languages' recipes | Their median distance is at least 1.5 × this language's own (held-out) distance |
| **Distinctiveness** | The matrix: every language's checks against every language's recipes | This language's own screens are nearest to it, and its nearest other language is at least 1.25 × further away. A pair that's too close is flagged with the measures that would separate them |
| **Recognition** | Show `brief.md`, with no name, to the commissioner (or, in `url` mode, the person who gave the link) | They recognise the source, and say what's wrong or missing. Their answers become `told` entries |

### 11. Questions and preferences

- **Out:**
  - **`questions.md`:** at most ten, about reasons and conflicts.
  - **`preferences.md`:** empty to start. Whenever a person corrects a screen, picks between versions, or accepts something a check flagged, record what changed, who, when, which screen, and how far it reaches (this screen, this kind, everywhere). If unsure, use the narrowest and ask.
- **Tool:** agent.
- **Check:** each preference carries its reach. A preference that conflicts with the library keeps both entries, marked, and the newer one from the person closest to the design wins until someone settles it.

### 12. Publish

- **Mariachi PR (public):** the theme, the language's files and its recipes. Check that no source names appear: grep for the source's name and its product names.
- **Private notes PR:** the source, the inventory, the source fingerprint and the side-by-sides.

## Done means

- [ ] The id is clash-checked; the private notes name the source; Mariachi doesn't.
- [ ] `index.ts`, the preset, `recipes.ts`, `DESIGN.md`, `brief.md`, `tokens.json`, `fingerprint.json`, `checks.json`, `patterns/`, `never.md`, `precedents/index.md`, `preferences.md` and `questions.md` are all present.
- [ ] Contrast passes in light and dark; the gallery renders in both.
- [ ] Faithfulness: the language's fingerprint is within the source's ranges, or the reason is written down.
- [ ] Rebuild, stranger, distinctiveness and recognition all pass.
- [ ] The kit builds, is under 400 KB, and carries its header.

## Keeping a library current

- **After each piece of work** (in a project, each Change), re-measure only the screens it touched.
- **Record preferences as people react.** Never rewrite the whole library.
- **When the playbook changes,** update this file first, then re-run the changed step across the libraries that need it.
