# @mariachi/design

## 0.1.0

### Minor Changes

- 92577a6: Add `@mariachi/design` (alpha): framework-agnostic tokens and CSS for any web app.
  - One token contract (semantic and component tiers) and six presets: minimal, brutalist, editorial,
    soft, enterprise, terminal. Switch with `data-theme`; `data-mode` is `auto`, `light` or `dark`.
  - 36 components as plain HTML + CSS (`m-` classes, data attributes, ARIA state), including AI patterns:
    chat, thinking, tool calls, citations, composer and usage meters.
  - Override at any granularity: one token, one component, one area, a replaced component
    (`replace` in `mariachi.design.ts`), or a whole preset (`extendTheme`). `buildDesign` emits only the
    tokens you changed.
  - Every preset passes WCAG contrast pairs in both modes; `checkTheme` runs them on your overrides.
  - DTCG token export, a Tailwind v4 theme mapping, and an optional behaviours script.

  `@mariachi/core` gains a dependency-free `@mariachi/core/errors` subpath (the error classes only), for
  browser-safe packages.

### Patch Changes

- 46233a3: The `enterprise` and `terminal` presets list `"Liberation Mono"` before the generic `monospace`, as the base stack does. On Linux without their named fonts, the generic family resolved to whatever fontconfig ranked first (often a CJK font), and Chromium could switch fonts mid-page.
- Updated dependencies [92577a6]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [662ccc5]
  - @mariachi/core@0.1.0
