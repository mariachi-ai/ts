# Obsidian

Category: dark and sharp. Dark-first and exact: near-black panels a step apart, one muted indigo for
the primary action, a small dense type scale, thin hairlines instead of boxes, 36px rows with status
and priority glyphs, and a command menu for everything. A light theme with the same structure. For
product and engineering tools where people live in lists all day and drive by keyboard.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
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
| Accent (indigo) | `#5e6ad2`; links `#828fff`; tint `#18182f` | `#5e6ad2`; links `#5059c4`; tint `#f1f1ff` |
| Status hues | green `#27a644`, yellow `#f0bf00`, red `#eb5757`, blue `#4ea7fc` | the same solids; text a step darker |

- **Radius.** 4px for keys and small squares, 6px for buttons, inputs and menu rows, 8px for cards,
  panels, menus and sidebar rows, 12px for dialogs and the command menu. Label pills and the public
  site's buttons are full pills.
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
  - Settings and documents read in a 40rem column.
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
  - 15px for reading: descriptions, comments, documents;
  - 17px for marketing lead text and dialog titles;
  - 24px for page and issue titles at 590, tracked −1.2%;
  - 32px and 48px display titles on public pages, tracked −2.2%, line height 1.1.
- **Case.** Sentence case everywhere, including section headings. No uppercase labels.
- **Figures.** Tabular figures for counts, dates and percentages.

## Icons

- Lucide, outlined, **1.5px stroke**, 16px in the sidebar and beside text, 14px in buttons, 32–48px
  in empty states and error pages. Icons are grey (the text colour); only status glyphs are
  coloured.
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
- `m-container`, 64rem for overviews, 40rem for settings and documents, 30rem for forms;
- `m-grid`, for cards: 16px gaps, 14rem columns;
- `m-stack` and `m-cluster`, for everything inside: 12px and 8px by default.

**Actions and forms**
- **Button.** A 6px rounded rectangle, 13px at 510, 28px by default (24px `sm`, 32px `lg`).
  - **Primary:** solid indigo, white text, one per view.
  - **Secondary** (the default): a grey step with a hairline, default text.
  - **Ghost:** text only, for quiet actions in bars (Filter, Back, Skip).
  - **Danger:** solid red, only to confirm something destructive.
  - **Icon-only:** a 24–28px square ghost with an `aria-label`.
  - On public pages buttons are 40px pills: the main one inverted (light on dark), the rest a
    translucent grey.
- **Input, textarea.** 32px, 6px radius, the surface colour, a control border that brightens on
  hover; focus turns it indigo. Placeholders in subtle grey.
- **Select.** The same box as an input with a small chevron; in settings rows it's `sm` and sized to
  its content.
- **Field.** The label above in 13px at 510, the control, then the hint or the error in 12–13px.
  Fields stack 16px apart.
- **Checkbox, radio.** 14px, 4px radius on the checkbox, indigo when checked.
- **Switch.** A small 30×18 track, grey when off, indigo when on, a white knob. It applies at once.

**Navigation**
- **Sidebar.** 232px on the frame colour, no edge line (the panel's hairline separates them).
  - Top: the workspace switcher as a ghost button, then search and a "new" icon button.
  - Rows are 28px, 13px at 510 in the secondary text colour, a 16px icon, 8px radius; the current
    one is a grey step in the default text colour.
  - Group headings are 12px at 510 in muted grey, sentence case, and collapse.
  - Counts are muted numbers on the right, no pill.
- **Navbar** (public pages). 72px, the page colour at 80% with a 20px blur and a hairline below;
  13px muted links that turn white on hover; "Log in" as a ghost and the main action as an
  inverted pill.
- **Tabs.**
  - **View chips** (the pill variant): separate 28px chips, no track; the current one on a grey
    step with a hairline ring.
  - **Underline:** a 1px line in the default text colour, for content tabs.
- **Breadcrumb.** 13px muted parts with "›" between, the current part in default text at 510. Used
  in the panel's header bar.
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
- **Prose.** 15px with a 1.6 line height, at most 39rem, links in the brighter indigo without an
  underline.
- **Progress.** A 4px bar: indigo on a grey step. Projects show it small beside a percentage.
- **Meter.** The same bar; it turns yellow, then red, past its marks.
- **Usage.** A 13px label and amount over a 4px bar, with a 12px footer line.

**Feedback and overlays**
- **Alert.** A callout: the surface colour, a hairline, 8px radius. A 16px status icon in the hue;
  the title at 510 and the body in the hue's text colour, 13px. A danger alert sits above the form
  it's about and says what was not done.
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

- **Dashboard.** The panel's header bar with a range of view chips; a row of plain figures; a card
  with a stacked bar chart beside a sprint card (usage meter and status counts); then a
  full-bleed projects list with health, progress, lead and target.
- **List and detail.** Header bar and a Filter/Display bar; issues under grey status group bars in
  36px rows; the selected row marked with an indigo edge and open in a side panel with the title at
  24px, a muted description, property rows, activity and a comment composer.
- **Onboarding.** One centred step on the panel colour: a step count and thin progress bar, a 32px
  display heading, one muted line, then the thing being taught (the command menu), a wide primary
  Continue and a ghost Back.
- **Settings.** A settings sidebar (back link, plain group headings) beside a 40rem column: the
  page title at 24px, then sections of hairline panels with label-and-help on the left and the
  control (select, switch, chips, keys) on the right.
- **Empty state.** Centred in the panel: a 48px thin icon, a 15px heading at 510, one or two muted
  lines, the primary action with its key and a secondary.
- **Pricing.** The public site: a blurred bar, a faint indigo glow behind a 48px title, plan
  columns split by hairlines (name 24px, price 17px, a billing line between hairlines, ticked
  features, a 40px pill at the bottom, inverted on the one to pick), a comparison list and
  questions.
- **Errors.** The field, dialog, toast and full-page errors above, as one page.

## Words

- Short, plain, sentence case: "New issue", "Change status…", "Start a sprint".
- Commands start with a verb and end with "…" when they open a picker.
- Dates short ("Nov 14"), relative when recent ("2h ago").

## Do and don't

| Do | Don't |
| --- | --- |
| Separate surfaces by one grey step and a hairline | Use drop shadows to lift cards in dark mode |
| Keep UI text at 13px and 510 | Set lists and buttons at 16px, or bold everything |
| Use indigo for the one primary action and checked state | Colour icons, headings or backgrounds indigo for decoration |
| Show state with a status glyph and priority bars | Rely on colour alone, or use big coloured badges for status |
| Give every action a key and put it in the command menu | Hide actions in menus with no shortcut |
| Run lists full-bleed under grey group bars | Box lists in cards or zebra-stripe them |
| Keep dark the default and light a faithful twin | Design light first and invert it |
