# Doodle

Category: playful and quirky. A multiplayer canvas tool: crisp white chrome with compact 11–13px
type, filled grey inputs, 5px corners and a bright blue selection, wrapped around a dotted board of
bright sticky notes, colourful cursors with name tags, stamps and a chunky floating toolbar. Menus
and tooltips are near-black; the whiteboard side has a violet brand. For creative and collaborative
tools: canvases, whiteboards, workshops, design reviews and the file browsers around them.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `doodle` preset of `@mariachi/design` (`data-theme="doodle"`,
`themes/doodle.css`).

## Principles

- **The chrome steps back; the board plays.** Panels, sidebars and menus are plain: white, hairlines,
  small type, grey icons. All the colour lives on the board: stickies, stamps, cursors, sections.
- **Small and exact.** 11px in panels and controls, 13px in lists and body text, 24px controls in
  panels and 32px in the file browser. Spacing comes in 4px steps; section padding is 16px.
- **Blue means selected.** The bright blue marks what is selected or focused: the outline round a
  chosen card, a checked box, the focus ring, the current row's pale blue wash. The main action
  button is the same blue, a shade deeper.
- **Everyone has a colour.** Each person is one of five colours (violet, blue, green, red, yellow),
  used for their cursor, name tag, avatar and stamps, everywhere.
- **Things float.** On a board, panels and the toolbar float above the canvas with 13px corners and a
  soft shadow. In the file browser, nothing floats: panels sit side by side with hairlines.
- **Light first.** Dark mode swaps to the charcoal panels (`#2c2c2c`) with the same structure.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Page and panels (canvas, surface) | white `#ffffff` | `#2c2c2c` |
| Raised panels | white | `#383838` |
| Filled inputs, hover fills, the board (sunken) | `#f5f5f5` | `#383838` |
| Menus, tooltips, toasts | near-black `#1e1e1e` | `#1e1e1e` (tooltips white) |
| Text: default, muted, subtle | `#1a1a1a`, `#666666`, `#707070` | `#ffffff`, `#c0c0c0`, `#a1a1a1` |
| Hairlines | `#e6e6e6`; lighter `#f0f0f0` | `#444444`; `#383838` |
| Control borders | `#8a8a8a` | `#8c8c8c` |
| Selection (focus, checks, chosen outlines) | bright blue `#0090fa` | `#0c8ce9` |
| Action blue (primary button, links) | `#0079d2`; text `#006ece` | `#0a7acb`; text `#7cc4f8` |
| Current row and selected wash | pale blue `#e5f4ff` | `#394360` |
| Brand (the board's violet) | `#9747ff`; sticky violet `#d9b8ff` | `#8a38f5`; `#473956` |
| Success, warning, danger | green `#008043`, yellow `#ffcd29`, red `#d4310f` | `#008043`, `#f3c11b`, `#c4381c` |
| Sticky notes (the tone borders) | yellow `#ffd966`, green `#85e0a3`, red `#ffafa3`, blue `#80caff`, violet `#d9b8ff` | deep tones |
| Pale tints (banners, badges) | yellow `#fff1c2`, green `#cff7d3`, red `#ffe2e0`, blue `#e5f4ff` | deep tints |

- **Radius.** 2px for checkboxes, keys and name tags; 5px for buttons, inputs, tabs, cards, banners
  and rows; 13px for floating panels, the toolbar, menus, dialogs and toasts. Stickies are square.
  Avatars and stamps are round.
- **Elevation.** A half-pixel ring plus soft drops. Stickies and small things take `shadow.sm`;
  floating panels `shadow.md`; the toolbar and menus `shadow.lg`; dialogs `shadow.overlay`. File
  cards and panels in the browser have no shadow, only a hairline.
- **Motion.** 100ms for checks and switches, 150ms for menus and hover, 300ms for panels. Plain ease
  out; stamps and stickies may pop with a small overshoot (`motion.easing.emphasized`).
- **Spacing.** A 4px unit:
  - 4px inside toolbars and between icon buttons;
  - 8px between label and control;
  - 12–16px inside panels and between cards;
  - 32px page margin in the file browser.
- **Layout.**
  - The file browser: a 240px white sidebar with a hairline edge, then a 48px top bar with the
    page title and actions, then the content with a 32px margin. A detail panel sits on the right,
    about 17rem, like the properties panel.
  - A board: the dotted canvas fills the page; floating panels in the corners (board name top left;
    people, timer and Share top right; zoom and help bottom right) and the toolbar centred at the
    bottom.
  - Public pages: a 76px top bar, then a wide container (80rem).
- **Density.** 1 by default. For data screens set `--m-density: 0.875`.

Use tokens, never colour literals: `var(--m-color-border-focus)`, `var(--m-space-4)`. The exact
scales are in the reference at the end.

## Type

- **Family.** Inter (`@fontsource-variable/inter`, or `@fontsource/inter`) for everything in the app,
  at 450 for body and 550 for titles, labels and buttons. The variable font's in-between weights
  matter; with static Inter use 400 and 600.
- **Display.** Inter Tight (`@fontsource/inter-tight`) at 400 with −2% tracking for big public
  headlines (56px) and plan names (32px). Only on public pages and board titles.
- **Mono.** Roboto Mono (`@fontsource/roboto-mono`) for code, timers and IDs, 11px.
- **Sizes:**
  - panels, controls, menus, tooltips, tags and table headers 11px;
  - file lists, sidebars, body text and inputs on forms 13px;
  - panel titles 11px semibold; page titles 13px; dialog titles 13px semibold;
  - empty-state titles 15px; set-up questions 24px semibold;
  - sticky text 15px; public headlines 32px and 56px light.
- **Case.** Sentence case everywhere. No uppercase except tiny public-site labels ("CURRENCY").
- **Figures.** `font-variant-numeric: tabular-nums` in tables, counters and timers.

## Icons

- Lucide, outlined, **1.5px stroke at 16px**, which reads as the reference's 1px line. 16px in rows,
  buttons and inputs; 20px in the board toolbar; 12–14px inside small tiles and stamps (stroke 2).
- Icons are in the text colour. Colour appears only on tiles: a board's violet tile, a room's
  coloured square, a stamp's disc.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down` (small, 10–12px);
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up` (in a round blue button, for comments and chat), refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Votes and counts.** Horizontal 8px pill bars on the sunken fill, each in a person or category
  colour, with the label left and the count right in 11px. This is the board's own chart.
- **Lines and bars.** 2px lines without dots, bars with 2px top corners, 11px subtle axis labels,
  hairline gridlines. Keep charts inside a floating panel or a card.
- **Series** step through the multiplayer colours: blue `#0d99ff`, violet `#9747ff`, green
  `#14ae5c`, orange `#ffa629`, red `#f24822`, pink `#ff24bd`, yellow `#ffcd29`. Legends are 8px
  round dots.
- Chart tooltips use the near-black tooltip.

## States (every control)

- **Hover.**
  - Ghost buttons, rows, menu triggers and nav rows take the `#f5f5f5` fill.
  - Secondary buttons take the fill too. Cards darken their hairline.
  - Filled inputs darken their outline.
  - Menu rows turn blue with white text.
- **Focus.** A 2px bright-blue outline on keyboard focus only; inputs turn their outline blue. Never
  remove it.
- **Pressed.** Fills step one grey darker (`#e6e6e6`). A pressed toolbar tool stays violet.
- **Disabled.** 40% opacity, `not-allowed` cursor. Say why in a tooltip.
- **Error.**
  - The control's outline turns red.
  - The message replaces the help text under it, 11px, saying how to fix it.
- **Loading.**
  - A button keeps its width and label ("Creating") with a small blue spinner.
  - Lists show grey skeleton cards; boards show their dots first, then the stickies.
- **Selected and current.**
  - The current nav row and the selected list row get the pale blue wash, full width, text unchanged.
  - A selected card or tile gets a 2px bright-blue outline; a chosen tile adds the pale blue fill.
  - The current pill tab gets the grey fill.
  - The current board tool is a violet square with a white icon.

## Components

All 36 of the library's components, as Doodle draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, the 240px sidebar beside the content, and the detail panel (17rem) beside a list;
- `m-container`, up to 80rem for public pages;
- `m-grid`, for thumbnail cards: 16px gaps, 13–14rem columns;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 32px by default (24px `sm` in panels and top bars, 40px `lg` on public pages), 5px
  corners, 11px semibold, 12px side padding, a 16px icon before the label.
  - **Primary:** the action blue with white text. One per view ("New board", "Open board").
  - **Secondary:** white with a hairline and ink text ("Copy link", "Start from a stencil").
  - **Ghost:** flat; the grey fill on hover. For icon buttons, sort menus and toolbars.
  - **Danger:** solid red with white text, for leaving and deleting.
  - **Icon-only:** square, with an `aria-label`.
  - On a board, Share is the violet; on public pages buttons are 8px-cornered ink or outlined.
- **Input, textarea.** Filled with `#f5f5f5`, 5px corners, a thin grey outline (see the notes on
  contrast) that turns blue on focus, 11px text in panels (24px tall) and 13px on forms.
- **Select.** The same filled box with a small chevron. In top bars prefer a ghost button with a
  chevron ("Last changed ⌄") that opens a menu.
- **Field.** An 11px semibold label above, the control, then 11px subtle help or the red error.
- **Checkbox, radio.** 14px, a 1px ink outline (2px corners on the checkbox); checked fills with the
  bright blue and a white tick or dot.
- **Switch.** Small: 24 × 14, grey when off, bright blue when on, white knob. It applies at once.

**Navigation**
- **Sidebar** (the file browser's). 240px, white, a hairline edge.
  - Top: the workspace switcher (avatar, name, chevron) and the bell; below it the filled search.
  - Rows are 13px with a 16px grey icon, about 30px tall, **full width with no corners**; the
    current one is the pale blue wash. Counts are small grey tags on the right.
  - Groups have a 13px semibold heading in ink and a hairline above. Rooms show a small coloured
    square with a `#`.
- **Navbar.** In the app, the 48px top bar: the page title in 13px, actions on the right, a hairline
  under it. On public pages, a 76px white bar with the mark, plain links, Log in, an outlined and an
  ink button.
- **Tabs.**
  - **Pill** (the default): 11–13px labels, 24–32px tall, 5px corners; the current one has the grey
    fill and ink text, the others subtle text. Used for views ("All boards", "Facilitating") and
    panel tabs ("Details", "Activity").
  - **Underline:** the same labels with a 2px ink bar, for long settings pages only.
- **Breadcrumb.** 11px subtle with "/" between and the current page in ink semibold.
- **Pagination.** 24px squares with 5px corners; the current one in the pale blue with blue text.
  Lists usually load more on scroll instead.

**Data and content**
- **Table** (the list view). No frame; 11px subtle headers in regular weight; 13px rows with
  hairlines; the grey fill on hover; the selected row in the pale blue. The first column holds the
  board's violet tile and its name.
- **Card** (the file card). White, a hairline, 5px corners, no shadow. A thumbnail on the dotted
  sunken ground on top, then a footer with the type tile, the name in 13px semibold and "Edited …" in
  subtle. Hover darkens the hairline; selected gets the blue outline.
- **Badge.** 16px tall, 11px medium, 5px corners, a soft fill and no border: grey neutral, or the
  tone's pale fill ("Voting open"). Solid badges are near-black with white text.
- **Avatar.** Round, a person's colour with a white initial, ringed in the panel colour; 16px in
  tight bars, 24px in rows, 32px in profiles. Groups overlap by 4px.
- **Divider.** A hairline. Panels are divided into sections by full-width hairlines.
- **Accordion.** The properties panel's collapsible sections: no frame, 16px padding, an 11px
  semibold title and a chevron, hairlines between.
- **Code, kbd.** Roboto Mono 11px on `#f5f5f5` with 5px corners (2px inline). Shortcut keys are grey
  11px keys with 2px corners; in menus shortcuts are plain grey text on the right.
- **Prose.** 13px with a 1.6 line height, at most 42rem, links in the action blue.
- **Progress.** A 6px pill: bright blue on the sunken fill.
- **Meter.** The same bar; yellow past "high", red past "optimum".
- **Usage.** A label and amount over the 6px blue bar, with a subtle footer.

**Feedback and overlays**
- **Alert** (banner). The tone's pale fill, no border, 5px corners, 8–12px padding, 11px ink text
  with an icon in the tone.
- **Toast** (the bell). Near-black with white 11px text and 13px corners, a semibold title, a line of
  grey detail and one small button. Bottom centre or bottom right, 22rem wide.
- **Dialog.** White, 13px corners, no border, the overlay shadow over a 30% black scrim. A 13px
  semibold title, 16px padding, actions on the right with the primary last.
- **Popover and menu.** Near-black in both themes, 13px corners, 8px inner padding; 24px rows of
  11px white text with 5px corners that turn blue under the pointer; group labels and shortcuts in
  grey; dark hairline separators. Inside a popover use its own text colour, not `.m-muted` (that is
  the page's grey and is too dim on the near-black).
- **Tooltip.** Near-black with white 11px text, 5px corners; white with ink text in dark mode. It
  waits half a second.
- **Spinner.** A thin bright-blue ring on a hairline track.
- **Skeleton.** Grey blocks with 5px corners and a soft shimmer.

**AI and chat**
- **Chat.** The assistant's replies sit on the panel; the person's messages are grey bubbles with
  13px corners. The assistant's avatar is a violet circle.
- **Composer.** A white box with 13px corners, a control-grey outline that turns blue while typing,
  a small shadow, and a round blue send button with `arrow-up`.
- **Thinking.** A subtle 11px line ("Sorting stickies…") with a soft pulse.
- **Tool call.** A row with 5px corners: the tool name, a status tag with 5px corners.
- **Citation.** A small grey tag with a number; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the outline turns red and the message replaces the help text. Validate on blur and
  on submit, never while someone types.
- **In a form:** a danger banner above it that says what needs fixing and what was not done ("Two
  things to fix before the board can be made. Nothing was created yet.").
- **Somewhere else:** the near-black toast with what happened and one small button ("Couldn't paste
  12 stickies" · Try again). Offline is a warning banner, and work is kept.
- **A whole page:** the dotted board with one sticky holding the code and a short note, a 15px
  semibold title, one sentence and one or two buttons; a cursor wanders nearby.
  - **404:** "This board isn't here" with a way back.
  - **500:** "Something went wrong on our side", "Nothing on the board was lost", and Try again.
  - **403:** "You can't open this board" with Ask to join.
- **Words.** Say what happened, whether anything was lost, and what to do. Light and friendly; no
  blame and no exclamation marks.

## Page shapes (recipes)

- **Dashboard** (a board). The dotted canvas; a floating panel top left with the menu and board name;
  top right the avatars, a mono timer on violet and a violet Share; a light 32px title with tags; three
  white sections labelled in a person's colour, filled with sticky notes that carry their author;
  stamps and cursors with name tags; a floating vote-count panel; the toolbar at the bottom with the
  current tool in violet and a grey round plus; zoom and help bottom right.
- **List and detail** (the file browser). The sidebar, a top bar with "New board", pill tabs with
  ghost sort buttons and a grid/list switch, thumbnail cards (the selected one outlined in blue), a
  list view below, and the detail panel: thumbnail, sections with 11px titles, label-and-value rows,
  people, link access, and Open board.
- **Onboarding.** A floating panel on the board with cursors and stickies around it: a step line and
  blue progress, a 24px question, sticky-tile choices with checkboxes (the picked ones pale blue and
  outlined), one field, Back and a large Continue.
- **Settings.** Pill tabs, a profile row, then groups with 11px semibold titles over label-and-control
  rows split by hairlines: filled inputs, a cursor-colour picker, switches, a select, checkboxes, and
  a red Leave button.
- **Empty state.** Pill tabs, then a dashed sticky outline and a yellow sticky with a plus and a
  cursor, a 15px title, one sentence, a blue primary and a white secondary, then stencils as cards.
- **Pricing.** The public site: a green "NEW" pill, a light 56px headline, a pill row of products and
  a currency box, four plans split by vertical hairlines with seat rows and prices, a pill
  Monthly/Yearly switch, ink buttons, green-tick reasons, and extras as 16px-cornered cards.
- **Errors.** The field, form, banner, toast and full-page errors above, in the file browser.

## Words

- Short, warm and plain: "No open retros", "Nothing on the board was lost".
- Sentence case for everything; times relative ("Edited 12 minutes ago").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep the chrome white and small; put colour on the board | Coloured panels, tinted sidebars or big type in the app |
| Use the bright blue only for selection and focus, and the action blue for the main button | Blue text for emphasis, or several primary buttons |
| Fill inputs grey with 5px corners | White boxed inputs inside panels |
| Give each person one colour for cursor, tag, avatar and stamps | Random colours per element |
| Make menus near-black with blue rows | White dropdown menus |
| Float panels only on a board, with 13px corners | Shadows on file cards or browser panels |
| Square stickies with a soft lift | Rounded or outlined stickies |
| Use the same icon for the same action | Mix icon sets or fill icons |
