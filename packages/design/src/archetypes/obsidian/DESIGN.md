# Obsidian

Category: dark and sharp. Dark-first and exact: near-black panels a step apart, one muted indigo for
the primary action, a small dense type scale, thin hairlines instead of boxes, 36px rows with status
and priority glyphs, and a command menu for everything. A light theme with the same structure. For
product and engineering tools where people live in lists all day and drive by keyboard.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds nine page shapes as HTML using only the library's classes: six in the app,
  two public (`pricing`, `reading`) and `sign-in`;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `obsidian` preset of `@mariachi/design` (`data-theme="obsidian"`,
`themes/obsidian.css`). **Dark is the default look:** set `data-mode="dark"` on the root unless the
person has chosen light. Without it the theme follows the system setting.

## Principles

- **Dark first, in steps.** Surfaces are near-black and differ by one small step of grey: the frame
  and sidebar `#08090a`, the main panel `#0f1011`, cards `#141516`, menus and dialogs `#1c1d1f`.
  Depth comes from those steps and a hairline, almost never from shadow.
- **One indigo, used sparingly.** `#5e6ad2` fills the primary button, checked controls, the focus
  ring and the "done" glyph. Everything else is grey text on grey.
- **Small and dense.** UI text is 13px at weight 510; meta text is 12px; reading text is 15px. Rows
  are 36px and buttons 28px. Nothing is large except a page title.
- **Keyboard first.** Every action has a key and is in the command menu (`⌘K`). Menus, tooltips and
  buttons show their shortcut in a small grey key.
- **Glyphs carry state.** A row says its state with a status circle and a priority bar glyph, then
  label pills with coloured dots; colour is never the only signal.

## Two families: the app and the public pages

Every screen belongs to one of two families, and most of what a builder has to guess follows from
which one. Decide first. Entries are `observed` (the source's public pages, measured) unless marked.

- **The app** is everything behind sign-in: lists, item views, dashboards, settings, onboarding,
  dialogs, errors. Recipes: `dashboard`, `list-detail`, `onboarding`, `settings`, `empty-state`,
  `errors`.
- **The public pages** are the site (home, features, pricing, the writing index and its posts, the
  changelog, customer stories) and the docs. Recipes: `pricing` (site), `reading` (docs).
- **Sign-in sits between them.** It follows the app: the person's light or dark theme, the frame
  colour, indigo for the one primary, no navbar and no footer. It takes the public pill shape.
  Recipe: `sign-in`.

| | App | Site (marketing, writing, changelog) | Docs | Sign-in |
| --- | --- | --- | --- | --- |
| Page colour | Frame `sunken`; the work in one inset `canvas` panel | `sunken` everywhere (`#08090a`), no panel | `sunken` everywhere, no panel | `sunken` |
| Theme | The person's (dark by default) | Dark | Dark, with a round theme button | The person's |
| Header | None above; a 44px bar inside the panel | 72px navbar (64px on a phone) | 64px bar with a hairline under it | None: the 48px mark above the title |
| Sidebar | 232px on the frame colour, no edge line | None | 280px on the page colour, a hairline on its right | None |
| Main action | Solid indigo 6px rectangle, 28px | Inverted pill (light on dark): 32px in the navbar, 40px on the page; others translucent grey pills | The inverted 32px pill in the bar | Solid indigo 44px pill, full column width; the rest grey pills |
| Titles | 24px/590 page titles; 17px dialogs; 32px only on onboarding | 48px/510 index and page titles; post titles 48px/590, centred; item titles in lists 20px/510 | 32px/590 article title; h2 24px/590; h3 20px/590 | 17px/510 |
| Body text | 13px/510 UI, 12px meta, 15px reading | 15px excerpts and leads; 17px post and changelog bodies; 13px meta | 15px in the secondary grey | 13px |
| Rows | 36px list rows, 28px sidebar rows, 32px menu rows | 56px archive rows split by a hairline on top | 32px sidebar rows; 28px contents rows | 44px pills, 16px apart |
| Width | Lists full-bleed in the panel; settings 40rem | 80rem of content (1280px), centred | 40rem article column, contents 13rem to its right | 18rem column |
| Breadcrumb | "›" | "/" (above post titles) | "/" | None |
| Footer | None | The site footer (below) | None: the sidebar's bottom block lists the other sections | None |
| Phone | The sidebar stacks above the panel | Navbar: mark, Log in, main action, menu button | The sidebar goes behind the menu button; contents hidden | The same 18rem column |

Never mix them: no inset panel, grey group bars, status glyphs or indigo buttons on a public page; no
navbar, pills or 48px titles in the app.

### Public lists (the writing index, changelog, careers)

- **No group bars.** Grey group bars, 36px rows and status glyphs are the app's. The writing index
  groups posts by kind under 48px/510 section titles (newest kind first), each a grid of three posts
  with a vertical hairline between the columns and no card.
- **Above the posts:** the 48px/510 page title, then the kinds as 15px text links (the current one in
  default text, the rest muted) and a pill search field on the right.
- **A post:** an image with 6px corners at 16:9, the title 20px/510 tracked −1.2%, an excerpt in 15px
  muted (two or three lines, at most 31rem), then a meta line in 13px muted: "Author · Nov 10".
  The source draws meta in its faintest grey, which fails 4.5:1; the language uses muted.
- **Older posts** drop to an archive: 56px rows with a hairline on top, the title at 13px/510 on the
  left (14px in the source, off its own scale), the author and date muted on the right.
- **Phone:** one column; the kind links scroll sideways under the title.

### Reading pages (docs articles, posts, changelog entries)

- **Docs article:** the 32px/590 title tracked −2.2%, a one-line lead in 15px, a figure, then
  `m-prose`: 15px reading text at a 1.6 line height in the secondary grey (`#d0d6e0` dark, `#3c4149`
  light), h2 24px/590 and h3 20px/590 with 48px above them (56px in the source), bold and links in
  default text, links underlined. Inline code is mono on a grey step with a hairline; keys are `m-kbd`.
- **Posts and changelog entries:** a 13px muted "/" breadcrumb (posts) or the date (changelog) above
  the title (posts 48px/590 centred; changelog entries 32px/590), then 17px reading text in a 39rem
  column. Author and date in 15px muted. No reading time anywhere; docs show no date at all.
- **Figures** fill the column: 12px corners in the docs, 8px in posts and the changelog; no border,
  shadow or frame around them. Docs figures have no caption; a post's caption is 12px muted under
  it. With no images to hand (kits, recipes), a figure is a placeholder: the surface colour, the
  same corners, 16:10, a 24px `image` icon centred in subtle grey, and an `aria-label` saying what the
  screenshot shows. `inferred` (the placeholder)
- **Callouts** are the neutral alert at the reading size with a bold lead-in. The docs have no
  coloured note boxes.
- **Contents** sit to the right of the article: no heading, a 13px muted list with 28px rows, the
  current entry in default text with a 2px bar over a 2px hairline track, sub-sections indented 12px.
  Docs articles only, and only when the window is wide (gone at 1024px).
- **The end of a docs article** is "Related articles", not previous and next: a 13px muted label and
  up to three hairline cards (transparent, 8px corners, 16px padding) with a 16px muted icon, a
  15px/510 title and the section in 13px muted.

### The site footer

- On the page colour with a hairline on top, inside the 80rem column, 48px of padding (56px in the
  source).
- The product mark alone in the first column, then five groups: a 13px/510 heading in default text
  over 13px muted links about 28px apart. Social links are words, not icons.
- A bottom row of legal links in 13px muted, 64px below the groups. No copyright line, newsletter
  form, language picker or badges.
- Phone: two groups to a row; the source moves the legal links into a sixth group.
- Only site pages have it: not the app, not the docs, not sign-in.

### The navbar on a phone

- 64px: the mark and name on the left; Log in (ghost), the main action (inverted pill) and a square
  menu button with a two-line icon on the right. The links move into the menu, a full-screen sheet on
  the page colour. Links never scroll sideways in the bar. `observed` (writing index and docs at
  390px)
- The recipes use no media queries, so at 390px their navbar links fall back to the library's
  sideways scroll. In a page built from the kit, switch to the menu button under 40rem.

### Sign-in

- An 18rem column centred on the frame colour, a little above the middle, in the person's theme.
- The product mark at 48px (monochrome), then a 17px/510 title ("Sign in to …").
- **44px pills**, full column width, 16px apart. The first method is the one primary, solid indigo;
  the rest are secondary grey pills. Text only, 13px/510: no provider logos or brand colours on
  third-party buttons.
- One footnote in 13px muted with default-text links, not underlined: create an account, learn more
  (on sign-up, the terms).
- No navbar, footer, illustration or side panel.
- **The email step** isn't public: one 44px email field with 8px corners (the public form's corner)
  and its label above, then a 44px indigo pill to continue. `inferred`; see `questions.md`.
- **Required fields carry no marker.** The public contact form has three required fields and marks
  none; the preset sets the field's marker to nothing. Say "Optional" in the hint of a field that is.
  `observed` (public form), `inferred` (app)

## Foundations

| What | Dark (default) | Light |
| --- | --- | --- |
| Frame and sidebar (sunken) | `#08090a` | `#f4f4f5` |
| Main panel (canvas) | `#0f1011` | `#fcfcfc` |
| Cards, inputs (surface) | `#141516` | `#ffffff` |
| Menus, dialogs, toasts (raised) | `#1c1d1f` | `#ffffff` |
| Text: default, muted, subtle | `#f7f8f8`, `#8a8f98`, `#858992` | `#282a30`, `#6f6e77`, `#737179` |
| Secondary text (sidebar, labels) | `#d0d6e0` | `#3c4149` |
| Hairlines: default, muted | `#23252a`, `#1b1c1e` | `#e9e8ea`, `#f0f0f1` |
| Control borders (strong) | `#62666d` | `#86848d` |
| Accent (indigo) | `#5e6ad2`; accent text `#828fff` (code keywords); tint `#18182f` | `#5e6ad2`; accent text `#5059c4`; tint `#f1f1ff` |
| Status hues | green `#27a644`, yellow `#f0bf00`, red `#eb5757`, blue `#4ea7fc` | the same solids; text a step darker |

- **Text on the sunken colour** (the sidebar, every public page, sign-in) is default, secondary or
  muted, never subtle: subtle is 4.4:1 on `#f4f4f5` in light. Muted passes there (4.6:1) and on
  `#08090a` (6.1:1). The source draws public meta and footnotes in a fainter grey that fails 4.5:1;
  the language uses muted.
- **Radius.** 4px for keys and small squares, 6px for buttons, inputs and menu rows, 8px for cards,
  panels, menus, sidebar rows and public form inputs, 12px for dialogs, the command menu and docs
  figures. Label pills, the public site's buttons and the sign-in buttons are full pills.
- **Borders.** 1px everywhere. Panels and cards have a hairline; rows are split by the lighter one.
- **Shadow.** Almost none in dark: menus and dialogs take a long soft drop (`0 4px 24px` at 20%,
  `0 7px 32px` at 35%). Light mode uses four faint steps, from a 1px contact shadow to a 24px drop.
- **Motion.** Fast and plain: 100ms for hover, 160ms for opening, 250ms for larger moves, with an
  ease-out curve. Buttons press in to 97%. Nothing bounces.
- **Spacing.** A 4px unit. Usual gaps:
  - 4–8px inside a control group and between view chips;
  - 12px inside rows and cards;
  - 16–24px panel padding;
  - 40px between settings sections.
- **Layout.**
  - The frame is the sunken colour. A 232px sidebar sits on it, and the content is **one inset panel**
    with an 8px margin, a hairline and 8px corners.
  - The panel starts with a 44px header bar (location, view chips, quiet icon buttons), often a
    second bar (Filter on the left, Display on the right), then full-bleed content.
  - Lists run edge to edge; detail opens in a side panel with a hairline on its left.
  - Settings and docs articles read in a 40rem column.
  - Public pages have no frame or panel: everything sits on the page colour (see Two families).
- **Density.** 1 by default, already dense. For very long lists set `--m-density: 0.875`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-3)`. The exact
scales are in the reference at the end.

## Type

- **Families.** Inter (variable) for everything, at 400 for reading text and 510 for UI labels,
  590 for titles. Headings take Inter's display optical size: load `@fontsource-variable/inter`
  with its `opsz.css` so large sizes switch to the display cut by themselves.
- **Mono.** Geist Mono (`@fontsource-variable/geist-mono`) for IDs in code, branch names and
  error codes; issue IDs in lists stay in Inter at 12px.
- **Sizes:**
  - 12px for meta: IDs, dates, counts, section headings, hints;
  - 13px for UI: sidebar, rows, buttons, menus, labels;
  - 15px for reading: descriptions, comments, docs, excerpts;
  - 17px for post and changelog bodies, dialog titles and the sign-in title;
  - 20px for item titles in public lists (510) and docs h3 (590);
  - 24px for page and issue titles and docs h2, at 590, tracked −1.2%;
  - 32px for docs and changelog titles and the onboarding step, at 590, tracked −2.2%;
  - 48px for public index and page titles at 510, and post titles at 590, tracked −2.2%, line
    height 1.1.
- **Case.** Sentence case everywhere, including section headings. No uppercase labels.
- **Figures.** Tabular figures for counts, dates and percentages.

## Icons

- Lucide, outlined, **1.5px stroke**, 16px in the sidebar and beside text, 14px in buttons, 32–48px
  in empty states and error pages. Icons are grey (the text colour); only status glyphs are
  coloured.
- **Marks.** The product's own mark is monochrome in the default text colour everywhere: the navbar,
  the footer, the docs bar, the workspace switcher and sign-in (48px). `observed` (every public page
  and both sign-in themes). Squad and workspace marks are lettered squares in an identity hue
  (yellow, blue, green, red), never indigo, so a mark is never mistaken for an action. `inferred`
- **Status glyphs** (drawn in the language's style, 14px): backlog a dashed circle, todo an empty
  circle, in progress a circle half filled in yellow, in review three-quarters in green, done a
  filled indigo circle with a check, canceled a filled grey circle with a cross.
- **Priority glyphs:** three rising bars with one, two or three lit (low, medium, high), a filled
  red rounded square with "!" for urgent, and three dashes for none.
- **The same icon for the same action, every time:**
  - add `plus`, edit `square-pen`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up`, refresh `rotate-cw`;
  - user `circle-user`, notifications `inbox` (notifications live in an inbox), calendar
    `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Bars** are narrow with 2px corners, stacked by kind: indigo, then blue, then grey for "other".
  Dashed muted gridlines; 12px muted axis labels; a legend of 8px dots above the chart, right.
- **Lines** are 1.5px in indigo over a faint vertical fade of the same hue.
- **More series** step through indigo, blue, teal, green, yellow and orange.
- Plain figures sit above charts: 24px semibold with a 12px muted label, no card around them.
- Tooltips use the popover treatment.

## States (every control)

- **Hover.** One grey step lighter in dark (darker in light): rows go from `#0f1011` to `#141516`,
  secondary buttons from `#1f2125` to `#2a2c33`, menu rows to `#2a2c31`. Text goes from muted to
  default. The indigo button darkens a step.
- **Focus.** A 2px ring, 2px outside the control: indigo in light, the brighter `#7170ff` in dark.
  Keyboard focus only; never remove it.
- **Pressed.** One step past hover, and buttons scale to 97%.
- **Disabled.** Half opacity, default cursor. Say why nearby.
- **Error.**
  - The control's border turns red.
  - The message replaces the hint under the field, in red 13px, and says how to fix it.
- **Loading.**
  - A button keeps its width and label; `aria-busy="true"` shows a small grey spinner.
  - Lists show skeleton rows at row height in the raised grey; never a spinner over the whole page.
- **Selected and current.** A grey step with medium-weight text (sidebar rows, view chips). A
  selected list row also gets a 2px indigo bar on its left edge.

## Components

All 36 of the library's components, as Obsidian draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, the 232px sidebar beside the inset panel (no gap: the panel has its own margin);
- `m-container`, three widths and no others:
  - `lg` 80rem, the public site: index pages, pricing, the navbar's alignment, the footer
    (`observed`: 1280px of content on the writing index, pricing and footer at 1440 and 1920px);
  - `md` 40rem, settings and docs articles (the source's docs column is 650px);
  - `sm` 18rem, the sign-in column (288px, `observed`);
  - posts and changelog bodies read at the prose width, 39rem; the onboarding step is 35rem, the
    `md` dialog width; a long public form (contact) takes the right half of the 80rem column;
- `m-grid`, for cards: 16px gaps, 14rem columns;
- `m-stack` and `m-cluster`, for everything inside: 12px and 8px by default.

**Actions and forms**
- **Button.** A 6px rounded rectangle, 13px at 510, 28px by default (24px `sm`, 32px `lg`).
  - **Primary:** solid indigo, white text, one per view.
  - **Secondary** (the default): a grey step with a hairline, default text.
  - **Ghost:** text only, for quiet actions in bars (Filter, Back, Skip).
  - **Danger:** solid red, only to confirm something destructive.
  - **Icon-only:** a 24–28px square ghost with an `aria-label`.
  - On the site, buttons are pills: 32px in the navbar, 40px on the page; the main one inverted
    (light on dark), the rest a translucent grey. Never indigo on the site.
  - On sign-in, 44px pills: the first method solid indigo, the rest secondary grey.
- **Input, textarea.** 32px, 6px radius, the surface colour, a control border that brightens on
  hover; focus turns it indigo. Placeholders in subtle grey. On public forms inputs are 40px with
  8px corners on a translucent grey (the contact form); on sign-in, 44px with 8px corners
  (`inferred`). Input heights never match the 28px buttons in the app: they are a step taller.
- **Select.** The same box as an input with a small chevron; in settings rows it's `sm` and sized to
  its content.
- **Field.** The label above in 13px at 510, the control, then the hint or the error in 12–13px.
  Fields stack 16px apart. **No required marker** (the preset turns the library's red asterisk off);
  an optional field says "Optional" in its hint.
- **Checkbox, radio.** 14px, 4px radius on the checkbox, indigo when checked.
- **Switch.** A small 30×18 track, grey when off, indigo when on, a white knob. It applies at once.

**Navigation**
- **Sidebar.** 232px on the frame colour, no edge line (the panel's hairline separates them).
  - Top: the workspace switcher as a ghost button, then search and a "new" icon button.
  - Rows are 28px, 13px at 510 in the secondary text colour, a 16px icon, 8px radius; the current
    one is a grey step in the default text colour.
  - Group headings are 12px at 510 in muted grey, sentence case, and collapse.
  - Counts are muted numbers on the right, no pill.
- **Docs sidebar** (public). 280px on the page colour with a hairline on its right; its top is part
  of the 64px bar (the mark, a hairline, "Docs" at 17px/510, a round search button). Group headings
  12px at 510 muted; 32px rows, 13px at 510 in muted grey with a 16px icon; the current row in
  default text with no fill; a page's sub-pages indented under a thin guide line; the other
  sections (API, guides, support) at the bottom over a hairline.
- **Navbar** (the site). 72px, the page colour at 80% with a 20px blur and a hairline below, its
  content aligned to the 80rem column; the mark and name on the left; 13px muted links on the right
  that turn white on hover; "Log in" as a ghost and the main action as an inverted 32px pill. On a
  phone, 64px with a menu button (see Two families).
- **Tabs.**
  - **View chips** (the pill variant): separate 28px chips, no track; the current one on a grey
    step with a hairline ring.
  - **Underline:** a 1px line in the default text colour, for content tabs.
- **Breadcrumb.** 13px muted parts with "›" between, the current part in default text at 510. Used
  in the panel's header bar. On public pages (docs, posts) the separator is "/".
- **Pagination.** Rare: lists scroll. When needed, 24px ghost squares with the current one on a
  grey step with a hairline.

**Data and content**
- **Table.** Lists, not grids:
  - full-bleed, no outer frame;
  - grouped under grey group bars (status glyph, name, count, a "+" on the right) instead of a
    header row; a plain header row, when used, is 12px muted at 510 on that grey;
  - 36px rows split by the muted hairline; hover is one grey step;
  - IDs 12px muted, titles 13px at 510, label pills and the date on the right, the assignee last.
- **Card.** The surface colour, a hairline, 8px radius, no shadow in dark. Titles are 15px at 510,
  not headings. A hovered card's hairline brightens.
- **Badge.** Labels are pills: 22px, a hairline, 12px at 510 in secondary text, a coloured 8px dot
  first. Tone badges (success, warning, danger) take a faint tint of the hue. Solid grey for
  context chips.
- **Avatar.** Round, 20px in rows, 24px in bars, 32px in headers; initials in white on indigo.
- **Divider.** A 1px hairline; in panels rows are split by hairlines rather than gaps.
- **Accordion.** Hairline-separated questions at 15px and 510, no fill, a chevron on the right.
- **Code, kbd.** Code in Geist Mono on the sunken colour with a hairline and 6px radius. Keys are
  small grey squares in the UI face at 510, 4px radius, no border: `⌘` `K`.
- **Prose.** 15px with a 1.6 line height in the secondary grey, at most 39rem; headings in default
  text (32, 24, 20px); links in default text, underlined; images with 8px corners (12px in docs).
- **Progress.** A 4px bar: indigo on a grey step. Projects show it small beside a percentage.
- **Meter.** The same bar; it turns yellow, then red, past its marks.
- **Usage.** A 13px label and amount over a 4px bar, with a 12px footer line.

**Feedback and overlays**
- **Alert.** Two kinds, and nothing blue.
  - **The neutral callout** (no `data-tone`): the raised grey with a hairline, 8px radius, 12px by
    16px padding, a 16px icon and the text in default text; 13px in the app, 15px in reading text,
    with a bold lead-in. For notes, tips and information: never `data-tone="info"` or `accent`.
    `observed` (docs callouts: a raised grey, a faint hairline, 8px)
  - **Toned alerts** (`success`, `warning`, `danger`): the hue's faint tint, a tinted hairline, the
    icon, the title at 510 and the body in the hue's text colour, 13px. A danger alert sits above the
    form it's about and says what was not done. `inferred` (no toned alert is public)
- **Toast.** Bottom right, raised, a hairline, 8px radius, the overlay shadow. A 13px title at 510,
  one line of detail, one action ("Retry", "View", "Undo"). Errors stay until dismissed.
- **Dialog.** Raised, a hairline, 12px radius, over a 50% black scrim. Context chips in the header
  ("PLT › New issue"), the title 17px at 590, actions on the right of the footer with the primary
  last. A "Create more" switch sits on the left of the footer when it applies.
- **Popover and menu.** Raised, a hairline, 8px radius, 4px padding; 32px rows at 13px with a 16px
  icon and 6px radius; the shortcut keys on the right; grey group labels; hairline separators; a
  destructive item in red at the bottom.
- **Command menu.** A dialog of its own, 12px radius, near the top of the screen: a context chip
  for what it acts on, a borderless 17px input, then grouped commands as menu rows with their keys.
  The highlighted row is a grey step. Opens with `⌘K` everywhere.
- **Tooltip.** Raised grey with a hairline, 12px text at 510, 6px radius, and the shortcut key
  beside the label. Appears after 500ms.
- **Spinner.** A thin 1.5px grey ring. Inside buttons and small areas only.
- **Skeleton.** Grey bars at text height and full row height, a slow soft shimmer that stops under
  reduced motion.

**AI and chat**
- **Chat.**
  - The assistant's turns are plain text on the panel; no bubble.
  - The person's own messages sit in a raised grey box with a hairline and 8px radius.
  - Meta lines (who, when) are 12px muted.
- **Composer.** A box one step off the panel with a dark 1px ring and 8px radius; the input at
  13px; attach and model controls bottom left; send is a small indigo square with `arrow-up`.
- **Thinking.** A muted 13px line ("Worked for 10 sec") that expands, with a 1px rule.
- **Tool call.** A hairline row with 6px radius: a 14px icon, the tool name, a status pill, and the
  result (files, branch) in 12px below.
- **Citation.** A small grey key-like chip with a number; the source in a raised popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the hint. Validate on blur and on
  submit, not while someone is typing.
- **In a form or dialog:** a danger callout at the top saying how many fields need fixing and that
  nothing was created ("The issue wasn't created."). Focus moves to it; each field shows its own
  message.
- **Somewhere else:** a toast that says what failed and what happened to the change ("You're
  offline. The change is kept and will sync when you reconnect.") with one action.
- **A whole page:** centred in the panel.
  - A 32px outline icon in subtle grey, the code in small mono, a 17px semibold title, one
    sentence, one or two small buttons.
  - **404:** "Nothing at this address", with a way back to the list.
  - **500:** "Something broke on our side" and "Nothing you changed was lost", with Try again.
  - **403:** "This squad is private" with Request access.
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.** The panel's header bar with a range of view chips; a row of plain figures and,
  under them, a stacked bar chart, both straight on the panel (no cards); a sprint side pane split
  off by a hairline on its left (usage meter and status counts); then a full-bleed projects list
  under a grey bar, with health, progress, lead and target.
- **List and detail.** Header bar and a Filter/Display bar; issues under grey status group bars in
  36px rows; the selected row marked with an indigo edge and open in a side panel with the title at
  24px, a muted description, property rows, activity and a comment composer.
- **Onboarding.** One centred step on the panel colour: a step count and thin progress bar, a 32px
  display heading, one muted line, then the thing being taught (the command menu), a 20rem indigo
  Continue in the app's 6px shape (see `questions.md`, 1) and a ghost Back, in a 35rem column.
- **Settings.** A settings sidebar (back link, plain group headings) beside a 40rem column: the
  page title at 24px, then sections of hairline panels with label-and-help on the left and the
  control (select, switch, chips, keys) on the right.
- **Empty state.** Centred in the panel: a 48px thin icon, a 15px heading at 510, one or two muted
  lines, the primary action with its key and a secondary.
- **Pricing.** The public site on the page colour: a blurred bar, a 48px/510 title alone (no glow,
  no lead line), plan columns split by hairlines in the 80rem column (name 24px, price 17px, a
  billing line between hairlines, ticked features, a 40px pill at the bottom, inverted on the one to
  pick), a comparison list, questions and the site footer.
- **Errors.** The field, dialog, toast and full-page errors above, as one page.
- **Reading.** A docs article: the docs sidebar and the 64px bar, a 32px title, a lead, a figure
  placeholder, 15px prose with a neutral callout, contents on the right and related articles at the
  end. On a phone the article comes first and the docs sidebar after it (the recipe's stand-in for the
  menu button).
- **Sign-in.** The mark, a 17px title, four 44px pills in an 18rem column (the first indigo), one
  muted footnote.

### Signature moves

1. **One inset panel on a darker frame.** The sidebar sits on the sunken colour; all work happens in
   one panel with an 8px margin, a hairline and 8px corners. Depth is one step of grey, never a
   shadow.
2. **Rows, not boxes.** Lists, settings and plans separate by hairlines and grey group bars; boxes are
   kept for comments, settings sections and overlays.
3. **A glyph for every state.** Status circles and priority bars at 14px lead each row; colour is the
   second signal, never the first.
4. **Indigo once per view.** One primary button, checked controls, focus and "done"; everything else
   is grey on grey.
5. **The key is always shown.** Menus, tooltips, empty states and the command menu print the
   shortcut beside the action.
6. **13px at 510.** Every piece of UI text is one size and one weight; meta is 12px; only titles
   grow.

### How a screen is assembled

These are the app's; public pages are assembled as Two families describes.

- **It opens with** the panel's 44px header bar: where you are (breadcrumb), the views of this place
  (chips), quiet icon actions on the right. A list adds the Filter / Display bar under it.
- **Reading order:** header bar → the content edge to edge (groups and rows, or figures then chart)
  → a side pane on the right for the selected thing or its summary. Settings and documents read
  down one 40rem column instead.
- **How much one screen does:** one place, one list or one item, one primary action. Creating
  happens in a dialog or the command menu, not on a new page.
- **When narrow:** side panes wrap under the content; row titles truncate while glyphs, pills and
  the avatar stay; on a phone the sidebar stacks above the panel.
- **Too much content:** the list scrolls inside the panel (no pagination); groups collapse; the
  Display menu hides properties.
- **No content:** the header bar stays and the empty state centres in the panel (see
  `patterns/empty.md`); empty groups are hidden.

The jobs these shapes are built from are in `patterns/`, the refusals in `never.md`, and the
recipes as precedents in `precedents/index.md`.

## Words

- Short, plain, sentence case: "New issue", "Change status…", "Start a sprint".
- Commands start with a verb and end with "…" when they open a picker.
- Dates short ("Nov 14"), relative when recent ("2h ago").

## Do and don't

| Do | Don't |
| --- | --- |
| Separate surfaces by one grey step and a hairline | Use drop shadows to lift cards in dark mode |
| Keep UI text at 13px and 510 | Set lists and buttons at 16px, or bold everything |
| Use indigo for the one primary action and checked state | Colour icons, headings, backgrounds or marks indigo |
| Decide the family first: app screens in the inset panel with indigo rectangles; site pages on the page colour with inverted pills | Put the inset panel, group bars or indigo buttons on a public page, or pills and 48px titles in the app |
| Keep the product mark monochrome | Fill the product mark or a squad mark with indigo |
| Use the neutral callout for notes and information | Use a blue info box |
| Show state with a status glyph and priority bars | Rely on colour alone, or use big coloured badges for status |
| Give every action a key and put it in the command menu | Hide actions in menus with no shortcut |
| Run lists full-bleed under grey group bars | Box lists in cards or zebra-stripe them |
| Keep dark the default and light a faithful twin | Design light first and invert it |
