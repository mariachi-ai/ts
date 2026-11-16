# Never

What Tally refuses to do. Each refusal carries how it is known: `observed` cites the source's repo files read as data or its public screenshots (paths and ids in the private notes), `inferred` is a reading of what was seen. The recipes follow every one.

1. **Never a coloured primary.** The main action is black (white in dark); blue and red buttons exist only for success and danger. `observed`: the button component's primary variant is a black fill and border, inverted text; every public screenshot of the app shows black primaries ("Create link", "Create workspace").
2. **Never a resting shadow on cards or rows.** Cards and rows are a 1px `#e5e5e5` hairline; a faint drop appears only on hover. `observed`: the card-list and form components draw borders only; the hover drop is `0 2px 4px` at 5%.
3. **Never a dark tooltip or a dark toast.** Tooltips are white cards with 12px corners and a hairline; toasts are white. `observed`: the tooltip component and the toaster's default theme.
4. **Never more than one blue thing in the chrome.** Blue marks the current sidebar item and its counts; switches, progress and the clicks series are the other blues. `observed`: the sidebar's active state; `inferred` as a rule.
5. **Never a big title in the app.** Page titles are 18px/600, card titles 16px/600; display type only on public pages. `observed`: the page header and form components; the display family appears only in marketing-style placeholders.
6. **Never the app edge to edge.** The content panel sits 8px inside a light grey frame with 12px corners. `observed`: the app shell file and both sidebar screenshots.
7. **Never a top bar over the app.** Navigation is the rail and the area panel; each page's header is inside the panel. `observed`.
8. **Never a pie chart.** Breakdowns are tinted bar rows; the main chart is a single fading area line. `observed`: the analytics files and screenshots.
9. **Never a full-page form for a link.** Creating and editing a link is a dialog over the list. `observed`: the link-builder modal.
10. **Never more than three weights in the app.** 400, 500, 600, plus the light 300 of key hints. `observed` across the repo's app files; the display face appears only on public pages and in the wordmark.
