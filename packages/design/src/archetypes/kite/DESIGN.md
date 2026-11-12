# Kite

Category: playful (also dark and sharp). Dark-first and nimble: near-black panels a step apart,
filled controls with no borders, a compact 12px UI type, 30px rows and inputs with 8px corners, one
bright blue for what is selected or about to go live, and public pages that shout in huge, tight
display type on black. A light theme with the same structure. For creative tools, site builders
and anything with a canvas, a properties panel and a launch page.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `kite` preset of `@mariachi/design` (`data-theme="kite"`,
`themes/kite.css`). **Dark is the default look:** set `data-mode="dark"` on the root unless the
person has chosen light. Without it the theme follows the system setting.

## Principles

- **Dark first, in small steps.** The public site is pure black (`#000000`, the sunken colour); the
  app's panels are `#111111`; cards, inputs on cards and the agent-style message boxes are one step
  up at `#1f1f1f`; menus, inputs and segmented tracks `#242424`; a hovered menu row `#333333`. The
  canvas well between panels is `#171717`. Depth comes from these steps, not from lines or shadow.
- **One bright blue.** The signature blue `#0099ff` (the brand token) marks what is selected: the
  focus ring, the current breakpoint, sliders, the progress fill and chart lines. The publish
  action and checked controls are a step darker (`#0077d4`) so white text and marks read.
- **Small and filled.** UI text is 12px; counts and chips 10–11px; tables 13px. Controls are 30px
  filled boxes with 8px corners. Rows are 30px. (The reference's inputs have no border at all; here
  they keep a thin grey control line, because the contrast floor needs one.)
- **Panels of properties.** Settings and details are rows: a light-grey 12px label on the left, the
  control on the right (number inputs with a grey unit inside, a −/+ stepper, a segmented control,
  a swatch with its hex code). Sections have a bold 12px title and a "+" or "−" on the right.
- **Loud public pages.** Marketing pages are black with display type at 44–54px, line height 1–1.1,
  tracked −4%; white or translucent 34px buttons; a blue glow or gradient drawn from tokens.

## Foundations

| What | Dark (default) | Light |
| --- | --- | --- |
| Public page (sunken) | `#000000` | `#fafafa` |
| Panels (canvas) | `#111111` | `#ffffff` |
| Cards (surface) | `#1f1f1f` | `#f5f5f5` |
| Menus, inputs, tracks (raised) | `#242424` | `#ffffff`; inputs `#f3f3f3` |
| Canvas well (card `sunken`) | `#171717` | `#f3f3f3` |
| Dialogs | `#171717` | `#ffffff` |
| Text: default, muted, subtle | `#ffffff`, `#999999`, `#888888` | `#000000`, `#666666`, `#6e6e6e` |
| Property labels | `#cccccc` | `#333333` |
| Hairlines: default, muted | `#2a2a2a`, `#1f1f1f` | `#ebebeb`, `#f3f3f3` |
| Control borders (strong) | `#6b6b6b` | `#8a8a8a` |
| Signature blue (brand) | `#0099ff`; tint `#0f1f29` | `#0099ff`; tint `#e5f5ff` |
| Action blue (accent) | `#0077d4`; links `#0099ff` | `#0077d4`; links `#006bbd` |
| Status | green `#00bb88`, amber `#ffaa00`, red `#ff5566` | text a step darker; the same solids |

- **Radius.** 4–5px for keys, chips and swatches; 6px for a segmented thumb; 8px for buttons,
  inputs, menu rows and panel rows; 10px for callouts and breakpoint labels; 12px for menus and
  toasts; 15px for cards; 16px for the public site's plan grid; 18px for dialogs and the floating
  toolbar.
- **Borders.** Almost none inside the app: panels are split by a `#1f1f1f` hairline and cards have
  no line. Inputs and selects keep a thin control line in the strong grey (`#707070` dark,
  `#8a8a8a` light) that turns blue on focus. The public site draws 1px lines in white at 10%.
- **Shadow.** None on cards. Menus and dialogs take a soft drop; the publish button has a faint
  blue glow (`0 1px 2px` and `0 2px 4px` of the blue at 15–20%).
- **Motion.** 150ms for hover, 300ms for opening, 500ms for big moves. The standard curve is a
  gentle ease-in-out (`cubic-bezier(0.44, 0, 0.56, 1)`); entrances use a small spring-like
  overshoot. Buttons press to 97%.
- **Spacing.** A 4px unit with the editor's 5 and 10px half-steps. Usual gaps:
  - 2px inside a segmented control; 5–8px between toolbar buttons;
  - 10px panel padding and row inset; 15–20px inside cards and dialogs;
  - 24px between sections on a page; 64px+ between sections on public pages.
- **Layout.**
  - A 50px toolbar across the top on the panel colour: a filled menu button on the left, the site
    name centred, people, preview and the blue Publish on the right.
  - A 260px panel on the left (pages, collections, sections), the work in the middle, and a
    280–360px properties panel on the right when something is selected.
  - Public pages: a 1200px column, a 64px bar, headlines left-aligned with the action on the right.
- **Density.** 1 by default, already compact. For very long lists set `--m-density: 0.9`.

Use tokens, never colour literals: `var(--m-color-brand-default)`, `var(--m-space-3)`. Gradients
are drawn from tokens too: `linear-gradient(135deg, var(--m-color-brand-default),
var(--m-color-info-solid) 40%, var(--m-color-danger-fg))`. The exact scales are in the reference at
the end.

## Type

- **Families.**
  - **Inter** (variable) for the whole app and for body text on public pages: 400 for text, 500 for
    labels and tabs, 600 for buttons, panel titles and section titles.
  - **DM Sans** (`@fontsource-variable/dm-sans`) for display headlines at weight 500, tracked −4%,
    line height 1–1.1. It stands in for the reference's licensed geometric grotesque.
  - **JetBrains Mono** (`@fontsource-variable/jetbrains-mono`) for hex codes, URLs and code.
- **Sizes:**
  - 10–11px for counts, chips, units and breakpoint widths;
  - 12px for the app: rows, buttons, inputs, menus, labels (the control size);
  - 13px for tables and agent text;
  - 15px for panel and dialog titles at 600;
  - 14–18px on public pages for body, plan names and questions, tracked slightly tight;
  - 44px and 54px display on public pages.
- **Case.** Sentence case in the app; title-like short labels are fine on public pages. Never
  uppercase, except tiny status chips.
- **Figures.** Tabular figures for property values, prices and counts.

## Icons

- Lucide, outlined, **1.5px stroke**, 16px in toolbars and beside text, 14px in panels and
  buttons, 12px in chips; 24–28px in empty states and error pages, inside a rounded tile.
- Icons are grey (`#999999`) at rest and white when hovered or current. Only a selected
  breakpoint label and folder glyphs in the styles list take the blue.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis`, close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up` (the composer's send), refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Lines** are 2px in the signature blue over a faint fade of it; a comparison period is a dotted
  grey line. Hairline gridlines in the muted border colour, 11px grey axis labels.
- **Tooltips** are the menu treatment: raised grey, 12px corners, a date then one row per series
  with a ringed dot and a tabular figure.
- **More series** step through blue, violet, pink, green, orange and cyan.
- Figures sit in grey cards: a 12px muted label, the number at 18px, and a coloured change line.

## States (every control)

- **Hover.** One grey step: ghost buttons and rows gain `#1f1f1f`, secondary buttons go from
  `#242424` to `#2e2e2e`, menu rows to `#333333`. Grey text and icons turn white.
- **Focus.** A 2px ring in the signature blue, 1px outside (`#0088ee` in light); inputs turn their
  control line blue. Keyboard focus only; never remove it.
- **Pressed.** One step past hover, and buttons scale to 97%.
- **Selected and current.** A grey step with white text (panel rows, segmented thumbs); a
  selected thing on the canvas or a chosen card gets a 1px blue outline and a faint blue halo.
- **Disabled.** Half opacity, default cursor; say why nearby.
- **Error.** The control's border turns red; the message replaces the hint in red 11–12px.
- **Loading.** A button keeps its width; `aria-busy="true"` shows a small spinner. Lists and
  cards show grey skeleton blocks at their own size.

## Components

All 36 of the library's components, as Kite draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, the 260px panel beside the work (no gap; a hairline between);
- `m-container`, 75rem for public pages, 42rem for settings, 30rem for forms;
- `m-grid`, for figure cards and template tiles: 12px gaps, 15rem columns;
- `m-stack` and `m-cluster`, for everything inside: 12px and 8px by default.

**Actions and forms**
- **Button.** An 8px rounded rectangle, 12px at 600, 30px by default (24px `sm`, 34px `lg`).
  - **Primary:** solid blue, white text, a faint blue glow. One per view: Publish, Save.
  - **Secondary** (the default): a filled grey step, no border.
  - **Ghost:** text or an icon only, grey until hovered; toolbar tools are ghost icon buttons.
  - **Danger:** solid red, only to confirm something destructive.
  - **Icon-only:** a 30px square ghost with an `aria-label`.
  - On public pages buttons are 34px with 14px regular text: the main one white with black text,
    the rest white at 10%.
- **Input, textarea.** 30px, 8px corners, filled `#242424` (`#f3f3f3` in light) with a thin grey
  control line that lightens on hover and turns blue on focus. Number inputs show their unit (PX, %, W, H) in 10px grey on
  the right inside the box.
- **Select.** The same filled box with a small chevron on the right.
- **Field.** Two layouts: a property row (the 12px light-grey label on the left in a 72px column,
  the control on the right) for panels and settings, or stacked (label, control, hint) in forms.
- **Checkbox, radio.** 14px, filled grey with the control line; checked is the action blue with a
  white mark or dot.
- **Switch.** A small 28×16 track, grey when off, the action blue when on, a white knob.

**Navigation**
- **Sidebar.** The 260px panel on the panel colour with a hairline on its right.
  - 30px rows, 12px grey labels with a 14px icon, 8px corners; the current one is white on
    `#1f1f1f`. Hover only brightens the text.
  - Section titles are 12px white at 500 with a "+" on the right, split from the rows above by a
    hairline. Nested rows indent 20px; folders have a chevron.
  - Counts are 10px grey numbers on the right, no pill.
- **Navbar** (public pages). 64px on black, 14px links in white at 80% that turn white on hover;
  a muted "Log in" and a white "Sign up" button. Translucent with a blur when it sticks.
- **Tabs.**
  - **Segmented** (the pill variant, used everywhere in the app): a `#242424` track with 2px
    padding and 8px corners; the current option a lighter `#484848` thumb with 6px corners and
    white text; the rest grey. Icons can replace text.
  - **Underline:** a 1px white line, rare; for long content only.
- **Breadcrumb.** 12px grey parts split by "/", the current one white.
- **Pagination.** Rare: lists scroll. 30px ghost squares, the current one on a grey step.

**Data and content**
- **Table.** Collections: full-bleed rows, 13px, split by the muted hairline, no outer frame.
  - The header is 13px grey at 500 on no fill; a grip and a checkbox lead each row.
  - Thumbnails are small rounded tiles; categories are round grey chips; status a tinted chip.
  - Hover is a faint step; the selected row the card grey.
- **Card.** The card grey with 15px corners, no line, no shadow. Titles 12–13px at 600. The
  `sunken` variant is the `#171717` canvas well, for previews and empty states; `outline` is the
  public site's 10% white line.
- **Badge.** Chips: 18px, 5px corners, 11px at 500 on a tint of the hue with no ring (blue for info
  and "unpublished", green for live, grey for drafts). The `outline` variant is the hue's text on no
  fill with a ring of the same colour (the public site's "Good" score chip). Category chips take
  full rounding.
- **Avatar.** Round, 20px, with a 2px ring in the panel colour; overlap in groups.
- **Divider.** A 1px hairline in the default border colour.
- **Accordion.** The public site's questions: 18px regular in white over a 16px grey answer, no
  lines and no fill, a chevron on the right.
- **Code, kbd.** Code in JetBrains Mono on the canvas-well grey with 10px corners. Keys are small
  grey squares in Inter at 500 with no border: `⌘` `P`.
- **Prose.** 18px on public pages with a 1.6 line height, 42rem wide, underlined links.
- **Progress.** A 4px bar: the signature blue on a grey step (the action blue in light).
- **Meter.** The same bar; amber, then red, past its marks.
- **Usage.** A 12px label and amount over a 4px blue bar; amber and red text colours past its marks.

**Feedback and overlays**
- **Alert.** A callout on the card grey with 10px corners and no line or stripe: a 16px icon in
  the hue, a 12px title at 600 and the body in the hue's text colour.
- **Toast.** Bottom right, raised grey, 12px corners, the overlay shadow; a 12px title at 600, one
  line, one small action.
- **Dialog.** `#171717` with 18px corners over a 60% black scrim; a title bar (15px at 600, a
  close icon) split by a hairline; the body below; actions bottom right with the primary last.
- **Popover and menu.** Raised `#242424`, 12px corners, 5px padding; 30px rows at 12px with 8px
  corners and a `#333333` hover; a chevron for submenus; hairline separators.
- **Tooltip.** A small `#333333` box with white 12px text and 8px corners; after 400ms.
- **Spinner.** A thin 1.5px white ring on a grey track.
- **Skeleton.** Grey blocks at the card grey with 5px and 15px corners, a soft shimmer.

**AI and chat**
- **Chat.** The agent panel: the person's message in a card-grey box with 15px corners; the
  agent's turns as plain 12–13px text; steps as grey meta lines ("Edited 4 layers 9s").
- **Composer.** A card-grey box with a hairline and 15px corners, the input at 12px, a model picker
  bottom left and small icon buttons bottom right, ending in a send arrow.
- **Thinking.** A grey 12px line ("Thought for 6s") that expands, with a 1px rule.
- **Tool call.** A card-grey row with 10px corners: an icon, the step name, the time on the right
  in grey.
- **Citation.** A small grey key-like chip with a number; the source in a raised popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the hint. Validate on blur and on
  submit, not while someone is typing.
- **In a form or before publishing:** a danger callout at the top saying what stopped and that the
  live site wasn't changed ("Publish stopped: 2 pages need a fix"), with a button to jump to the
  first problem.
- **Somewhere else:** a toast that says what failed and what happened to the work ("You're offline.
  Your edits are kept on this device and will sync when you reconnect.") with one action.
- **A whole page:** centred in a canvas well.
  - A 24px outline icon in a rounded grey tile, the code in small mono, a 15px title at 600, one
    sentence, one small button.
  - **404:** a page that has moved, with a way back to the list.
  - **500:** "Something broke on our side. Your work is saved." with Try again.
  - **403:** "This site is private" with Request access.
- **Words.** Say what happened, whether anything changed, and what to do. A light, playful title
  is welcome on a full-page error; the sentence under it stays plain.

## Page shapes (recipes)

The reference is a canvas editor, so its screens are translated into app pages in its spirit: the
dashboard is the site's overview, list and detail is a collection with a properties panel, and
settings is the site settings window.

- **Dashboard.** The toolbar and the site panel; a title with the site address and a segmented
  range; the home page at three widths in a canvas well, each frame under its label (the current
  one blue); four figure cards; a visits line with a tooltip beside the unpublished changes and a
  bandwidth meter.
- **List and detail.** A collections tree; the entries as hairline rows with a grip, checkbox,
  cover tile, category and status chips; the selected entry open in a properties panel on the right
  (segmented Entry/Activity, then sections of property rows: inputs, a slug with a "/" prefix, a
  segmented status, number inputs with units, a stepper, a swatch with its hex code, a slider).
- **Onboarding.** One step on black under a soft gradient glow: step count and thin progress, a
  44px display heading, three starting-point cards (the chosen one outlined in blue), a brief in a
  card, and a large blue Continue.
- **Settings.** A settings window with 18px corners: a title bar with a settings search and a close
  button, a left list of sections, then sections of label-and-hint rows with the control on the
  right, split by hairlines, and a save bar.
- **Empty state.** A dotted canvas well holding a tile outlined in blue, a 15px title, one or two
  grey lines, the blue action, a secondary and a key hint.
- **Pricing.** The public site on black: the bar, a 54px tight headline with a phrase in a
  token gradient, a billing switch, four plan columns in one 16px-cornered grid split by hairlines
  (name and line in 18px, price between hairlines, ticked features, a 34px button, blue on the one
  to pick), a comparison table and questions.
- **Errors.** The publish callout, field errors, a warning, toasts and the three full-page errors
  above, as one page.

## Words

- Short, plain, sentence case: "Publish", "New page", "Add a form to a page".
- A little play is welcome in titles of empty and error pages; never in buttons or errors' advice.
- Units sit inside number inputs (PX, %, W, H), not in labels.

## Do and don't

| Do | Don't |
| --- | --- |
| Separate panels, cards and menus by one grey step | Draw borders around cards and inputs in the app |
| Keep app text at 12px, with 600 for buttons and titles | Set panels at 14–16px or use display type inside the app |
| Use the signature blue for what is selected and the one publish action | Colour headings, icons or backgrounds blue for decoration |
| Lay out details as label-and-control property rows | Stack long forms of full-width fields in panels |
| Fill controls and show the unit inside number inputs | Use empty outlined inputs or put units in labels |
| Make public pages loud: black, 44–54px tight display, a token gradient | Bring the public site's big type into the app |
| Keep dark the default and light a faithful twin | Design light first and invert it |
