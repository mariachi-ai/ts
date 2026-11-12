# Carbon

Category: dark and sharp. Fast and exact: a near-black window in fine grey steps, white text, a
red-orange brand that glows behind things but never marks an action, a light-grey primary button,
40px list rows that light up in white at 10% as you arrow through them, and an outlined key cap
beside every action. For keyboard-driven tools: command palettes, launchers, developer utilities,
automation and assistants. Dark first; light mode mirrors it in pale greys.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `carbon` preset of `@mariachi/design` (`data-theme="carbon"`,
`themes/carbon.css`).

## Principles

- **The keyboard is the interface.** Every screen has one search field at the top, a list you move
  through with the arrow keys, and a footer bar that says what Enter does and that ⌘K opens the
  rest. Every action in a menu shows its key caps. Mouse targets exist, but nothing depends on
  hover.
- **Grey does the structure, white does the reading.** The window, panels and menus are near-black
  greys a step apart (`#111214`, `#18191a`, `#1b1c1e`); the current row is white at 10%. Text is
  white, and white at 60% for everything secondary.
- **Colour means something.** The red-orange brand is for glow, marks and links. Status colours
  (red, yellow, green, blue) appear as small tags and icon tiles, never as large fills.
- **Dense and calm.** 14px text, 40px rows, 11px section labels, 8px buttons. No uppercase, no heavy
  borders, no drop shadows on dark surfaces except for floating windows.

## Foundations

| What | Dark | Light |
| --- | --- | --- |
| Window, panels, menus | `#111214`, `#18191a`, `#1b1c1e` | `#f7f7f8`, `#ffffff`, `#ffffff` |
| Quiet fill: hover rows, tracks, wells | `#222325` (white at 7%) | `#ececed` |
| Selected row, current nav, segments | `#2a2b2d` (white at 10%) | `#e9e9ea` |
| Text: default, muted, subtle | `#ffffff`, `#9c9c9d`, `#8a8b8d` | `#111214`, `#5e6366`, `#6a6b6c` |
| Hairlines: edges, dividers | `#2f3031`, `#242728` | `#e6e6e6`, `#efeff0` |
| Primary button | `#e6e6e6` with `#2f3031` text | `#2f3031` with white text |
| Brand (glow, marks, links) | `#ff6363`; links `#ff6363` | `#ff6363`; links `#c81e28` |
| Status | red `#ff6363`, yellow `#ffc533`, green `#59d499`, blue `#56c2ff` | deeper steps of the same |

- **Radius.** 6px for tags and menu rows, 8px for buttons and inputs, 10px for list rows, 12px for
  windows, panels, menus and dialogs. Segmented controls and the billing switch are pills.
- **Shadow.** Dark surfaces lift by colour plus a 1px top highlight (`inset 0 1px 0` white at 5%),
  not by a drop. Floating windows, menus and dialogs take the window shadow: a 0.5px black ring and
  three long, dark drops. In light mode, soft grey drops.
- **Glow.** Marketing pages and the palette's backdrop carry a soft radial glow of the brand at
  low strength from the top; the pricing hero adds blurred diagonal brand stripes. Never behind
  text that has to be read at length.
- **Motion.** 150, 200 and 300 ms with `ease`; menus fade and drop 4px. Nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 4–8px inside a row or between key caps;
  - 8px around list rows inside the window, 12px in panel rows;
  - 16px between cards in the app;
  - 32px of padding inside marketing cards, 40–48px between sections.
- **Layout.**
  - The palette window is about 750px (`50rem`) wide, centred, with a 56px search bar, a list, and
    a 40px footer bar.
  - A list with detail splits about 22rem / the rest, with a hairline between.
  - Settings use a 13rem sidebar beside a 46rem column of grouped panels.
  - Marketing pages use the 1204px (`75.25rem`) container with a floating, bordered 58px header.
- **Density.** 1 by default; this language is already compact. For data-heavy screens set
  `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Inter (variable) for everything: the marketing site's own face, and the closest open
  match to the app's system font. Geist Mono for prices on marketing pages, aliases, IDs and code.
- **Sizes:**
  - body and list rows 14px, with +0.2px tracking (`0.014em`);
  - secondary text, accessories, footer bar and form labels 13px;
  - section labels 11px at 500, in white at 60%, sentence case;
  - the search field 18px;
  - page and detail titles 20px at 600; card titles 14px at 500;
  - marketing prices 64px at 600 beside a 13px mono unit; marketing headings 32px at 600.
- **Weights.** 400 body, 500 for titles in rows, buttons and labels, 600 for headings. No light
  weights.
- **Case.** Sentence case everywhere, including section labels. Footer actions are title case, as the
  product writes them ("Run Workflow", "Open Incident").
- **Figures.** Tabular figures for counts, durations and prices.

## Icons

- Lucide, outlined, **1.5px stroke**, 16px in rows, menus and buttons, 14px in small buttons, 32px
  for empty and error states.
- **Icon tiles.** Each list row starts with a 20px rounded square: a status or brand colour with the
  icon in its on-colour, or the neutral fill with a white icon for built-in items. Settings nav items
  use the same tiles.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left` (in a small ghost button at the start of the search bar), forward
    `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `send`, refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-x`.

## Charts

- Few and small: counts in cards, a bar strip for a week. Bars in the brand colour, the highlighted
  one solid and the rest at 45%; no gridlines; labels in muted 13px.
- **More series** step through the product's standard colours: red, blue, green, yellow, purple,
  orange, magenta.
- Tooltips use the menu treatment.

## States (every control)

- **Hover.** Rows and ghost buttons take the quiet fill (white at 7%). The primary button goes from
  `#e6e6e6` to white; the secondary from `#1f2022` to `#2a2b2d`. Nothing moves.
- **Selected.** The current row, nav item, menu item and segment take white at 10% with their own
  radius (10px rows, 8px nav, 6px menu items, pill segments). Selection follows the arrow keys, not
  the pointer.
- **Focus.** A 2px light outline (`#cdcece` dark, `#6a6b6c` light) outside the control, on keyboard
  focus only. A focused grid item gets the same outline.
- **Pressed.** One step darker than hover (`#cdcece` for the primary).
- **Disabled.** Half opacity; keep it visible and say why nearby.
- **Error.** The field's border turns red, and the message sits to the right of the field (below it
  when narrow) with a `triangle-alert` icon, in red 13px.
- **Loading.** A 2px progress line runs along the bottom edge of the search bar; a button keeps its
  label with `aria-busy="true"`; lists show skeleton rows. The footer bar's left side shows what's
  running ("Syncing…").

## Components

All 36 of the library's components, as Carbon draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`: 50rem for the palette, 46rem for settings and forms, 75.25rem for marketing;
- `m-split`: a list beside its detail, a 13rem settings sidebar, 9rem right-aligned form labels;
- `m-grid`: 16px gaps for cards in the app, no gap for joined pricing columns;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 8px radius, 14px at 500, 36px by default and 28px (`sm`) in bars and footers.
  - **Primary:** light grey (`#e6e6e6`) with dark text in dark mode; dark grey with white text in
    light mode. One per view.
  - **Secondary** (the default): a dark fill with a white ring at about 22%.
  - **Ghost:** text only, for back buttons and quiet actions.
  - **Danger:** red text on a red tint, never a solid red slab.
  - **Icon-only:** square, ghost, with an `aria-label`.
- **Input, textarea.** 36px, 8px radius, the menu grey, a control-strength border that lightens on
  hover and takes the light focus outline. The search field in a window has no box at all: 18px
  text straight on the bar.
- **Select.** The same box as an input, with a small chevron. In bars and settings rows it loses the
  box: text and a chevron only (a transparent border and fill), as a filter at the right end of the
  search bar or as the value of a setting.
- **Field.** In forms, the label sits to the left, right-aligned, muted 13px; the control to the
  right; the error to the right of the control. Stacked labels are fine at phone width.
- **Checkbox, radio.** 16px, 4px radius; light grey when checked, with a dark mark.
- **Switch.** 36×20px, blue (`#2f8ce6`) when on with a white knob, grey when off. Takes effect at
  once.

**Navigation**
- **Sidebar.** The settings sidebar: 13rem, a step lighter than the content, the profile (avatar,
  name, "Profile") at the top, items as 20px icon tiles with white 14px labels, the current one in
  white at 10% with an 8px radius. Integration groups under a muted 11px heading.
- **Navbar** (marketing). A floating bar inside the container: 58px, a fine edge, 12px radius,
  muted 14px links at 500, a ghost "Sign in" and the primary button on the right.
- **Top bar** (in the app). There isn't one: the search bar is the top of every window.
- **Tabs.**
  - **Pill** (the segmented control, the default here): a dark track with a fine edge, the current
    segment in white at 10% with a top highlight. Billing periods, text sizes, window sizes, tiers.
  - **Underline:** a 2px light-grey line under the current tab, for in-page sections only.
- **Breadcrumb.** Muted, with "›" between. In windows, prefer the back key at the start of the search
  bar.
- **Pagination.** Rarely: lists scroll and filter instead. When needed, 6px items with the current
  one on the selected fill.

**Data and content**
- **Table.** Read as a list: no frame, no header fill, 11px muted headers in sentence case,
  hairline rows that take the quiet fill on hover. Accessories (dates, avatars, tags) sit at the
  right.
- **Card.** Panels: the surface grey, a fine edge, a 1px top highlight, 12px radius, 20px padding.
  Card titles are 14px at 500, the main figure 24px at 600.
- **Badge.** Tags: 20px tall, 6px radius, 11px at 500, coloured text on a 15% tint of the same
  colour, with a faint edge of that hue. Neutral tags on the quiet fill. "New" is an outlined blue tag.
- **Avatar.** Round photos in the product; here round initials on the selected fill, 20px in rows,
  28px in bars, 40px in the settings profile.
- **Divider.** A hairline (`#242728`). Inside the window: under the search bar and above the footer.
- **Accordion.** One panel with hairlines between rows, 12px radius, a chevron on the right.
- **Code, kbd.**
  - Code: Geist Mono 13px on the quiet fill, 8px radius; inline code with a 4px radius and no
    border. Keywords red, functions blue, strings green, constants yellow.
  - Kbd: outlined key caps in the text font, 20px tall, 5px radius, one cap per key
    (`⌘` `K`), never "Cmd+K" text.
- **Prose.** 14px with a 1.6 line height; links red with no underline; markdown in detail panes.
- **Progress.** A 2–4px line in light grey on the quiet track; at the bottom edge of the search bar
  while loading.
- **Meter.** The same line; it turns yellow, then red past its marks.
- **Usage.** Credits: a label and amount over the meter bar, with the amount in tabular figures.

**Feedback and overlays**
- **Alert.** Inline callouts are rare: the tone's tint, no border, no side stripe, a 16px icon.
  Danger alerts above a form say what wasn't done ("The workflow wasn't saved").
- **Toast.** In the window, the toast is the footer bar's left side: a tone icon and one line
  ("Couldn't save the workflow"). Floating, it's a small raised bar with a fine edge, 10px radius,
  the window shadow and one action.
- **Dialog.** The confirm window: compact (20rem), centred, an icon tile on top, a 14px semibold
  title, one sentence, then Cancel and the action side by side as full-width small buttons; the
  destructive one in danger style.
- **Popover and menu.** The action panel: the menu grey, a fine edge, 12px radius, the window shadow,
  6px padding. A muted 11px title (the item it acts on), 32px rows with a 16px icon, key caps on the
  right, hairlines between groups, and a "Search for actions…" field at the bottom. The first row is
  selected.
- **Tooltip.** A small `#2f3031` box with white 13px text, 6px radius.
- **Spinner.** A thin ring in light grey, in the footer bar or inside buttons only.
- **Skeleton.** Row-shaped blocks on the quiet fill, a slow shimmer that stops under reduced motion.

**AI and chat**
- **Chat.** The assistant's answers as plain text on the window, no bubble; the person's messages
  right-aligned in a grey bubble with a 12px radius. The assistant's avatar is a brand tile.
- **Composer.** At the bottom of the window: a 12px-radius box with a control border, the model as
  a small select, Send as a key cap hint (`↵`) rather than a big button.
- **Thinking.** A muted line ("Thinking…") with a soft pulse, collapsible.
- **Tool call.** A hairline row, 8px radius, the tool's name in mono and a status tag.
- **Citation.** Small numbered chips on the selected fill; the source in a menu on hover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message appears to the right of the field with a
  warning icon. Validate on submit and on blur, never while typing.
- **In a form:** a danger callout at the top with the count and what wasn't done ("2 fields need a
  fix. The workflow wasn't saved."); the footer bar's left side shows the failure with a red
  `circle-x`.
- **Somewhere else:** a toast with what happened, that nothing changed, and Retry.
- **Destructive confirm:** the compact confirm window, saying what goes with it ("Its 146 runs of
  history go with it").
- **A whole page:** inside the window or a panel, centred:
  - a 32px muted icon, the code in small mono, a 16px semibold title, one sentence, one small
    button;
  - **404:** "Nothing here" with Open the palette;
  - **500:** "Something broke on our side" and "Nothing was changed", with Try again;
  - **403:** "This one is private" with Ask for access.
- **Words.** What happened, whether anything changed, what to do. No codes in sentences, no blame,
  no exclamation marks.

## Page shapes (recipes)

The reference is a desktop launcher with no web app, so these translate its windows to web pages.

- **Dashboard.** The command palette is the home screen: the workspace line and the hotkey on top,
  then the window: the 18px search field with a type filter, sections ("Pinned", "Recent") of 40px
  rows with icon tiles, subtitles and accessories (tags, counts, key caps, a type word), the first
  row selected, the action panel open over the footer bar. Below, the week in three small cards.
- **List and detail.** The window with a back key and a filter, the list on the left with counted
  sections, the detail on the right: a 20px title, markdown, then "Information" as label-and-value
  rows with tags and an avatar. "Open Incident ↵" in the footer.
- **Onboarding.** One step in a 40rem window: a thin progress line under the bar, a 24px heading, a
  hotkey recorder with large key caps, label-left fields (a select, a segmented control, a
  checkbox), and Skip `esc` and the primary Continue in the footer.
- **Settings.** The preferences window as a page: the 13rem sidebar of icon tiles with the profile on
  top, then grouped panels of rows (title and help on the left; a switch, select, segmented control
  or key caps on the right), section headings at 14px between panels, Sign out as a danger button
  last.
- **Empty state.** The window with nothing to list: a 32px muted icon, a 14px title, one line that
  names the key, a primary and a secondary small button, the action again in the footer.
- **Pricing.** The marketing page: the floating header, a blurred red glow, a 32px heading, the pill
  billing switch with a mono discount tag, then three plans joined in a row with the middle one raised
  on a gradient, its own tier switch, a seal, 64px prices with mono units, full-width buttons and
  check-circle feature lists with muted detail. "Compare every feature ↓", then the questions.
- **Errors.** The form, toast, confirm and page errors above, as one page.

## Words

- Short and plain. Commands are verb-first and title case in the footer ("Run Workflow"), sentence
  case elsewhere ("Search incidents…").
- Placeholders end with an ellipsis and say what's searched ("Search workflows, links and
  snippets…").
- Name keys with symbols: ⌘ ⌥ ⌃ ⇧ ↵ ⌫ esc.

## Do and don't

| Do | Don't |
| --- | --- |
| Put one search field at the top of every window | Add a separate top bar with a search button |
| Show key caps beside every action, one cap per key | Write shortcuts as "Cmd+K" text |
| Mark the current row with white at 10% and a 10px radius | Use a coloured or bordered selection |
| Use the light-grey button for the one primary action | Make primary buttons red or brand-coloured |
| Keep the brand red for glow, marks and links | Fill large areas or buttons with the brand |
| Lift dark surfaces with a lighter grey and a top highlight | Put drop shadows on cards in dark mode |
| Use small coloured tags on a 15% tint | Use solid coloured badges for status |
| Write sentence-case 11px section labels | Uppercase or letter-space labels |
