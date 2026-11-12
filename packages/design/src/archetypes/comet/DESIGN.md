# Comet

Category: dark and sharp. Fast and focused: warm greys from paper white to charcoal, one muted
purple for the primary action and the current row, a light-weight grotesque, large split tabs with
small grey counts, generous one-line rows, a command menu with a key on every row, and a one-line
confirmation with Undo. A calm, high-contrast dark theme and a light theme with the same structure.
For inboxes, queues and triage tools where people clear a list fast and drive by keyboard.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `comet` preset of `@mariachi/design` (`data-theme="comet"`,
`themes/comet.css`). **Light and dark are equals:** follow the person's choice (`data-mode="light"`
or `"dark"` on the root); without it the theme follows the system setting. Design every screen in
both.

## Principles

- **Speed is the feature.** Every action has a single key, every key is shown where the action is
  (menus, tooltips, the command menu, empty states), and the command menu (`⌘K`) finds everything.
  Nothing waits on a spinner when it can happen at once and offer Undo instead.
- **One line per item.** A list row says who, what and when on one line: the sender, label chips,
  the subject in ink and the first words of the message in grey, the date at the far right. Rows
  are roomy (44px) so the eye can scan them.
- **Warm, quiet greys.** Neutrals are warm, from paper `#fcfaf7` through `#f2f0eb` and `#dedbd5` to
  charcoal `#292827` and `#141413`. There are no cold blue-greys.
- **One purple, sparingly.** `#714cb6` (lilac `#d4c7ff` in dark) fills the one primary button, the
  current row's edge and checked controls. Blue is only the unread dot and info. The deep mulberry
  `#421d24` is the brand mark, never an action.
- **Light type, big where it counts.** Text is set at a light 360 weight; the split tabs are large
  (22px) so the current list is obvious, while meta text is small (12px) and grey.
- **Confirm, then let them take it back.** Destructive or bulk actions happen at once and show a
  one-line inverted toast with Undo and its key, rather than asking first.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| List pane, page (canvas) | `#ffffff` | `#292827` |
| Inputs, cards (surface) | `#ffffff` | `#2e2d2b` |
| Menus, dialogs (raised) | `#ffffff` | `#383634` |
| Rail well, side panels (sunken) | `#f7f5f2` | `#141413` |
| Text: default, muted, subtle | `#292827`, `#666563`, `#6c6a66` | `#fcfaf7`, `#bfbcb6`, `#a3a09b` |
| Hairlines: default, muted | `#e3e2df`, `#f2f0eb` | `#474543`, `#353331` |
| Control borders (strong) | `#8d8a86` | `#8d8a86` |
| Accent (purple) | `#714cb6`; hover `#533192`; current row `#f7f5ff` | `#d4c7ff` with dark text; hover `#bea1f5`; current row `#474543` |
| Focus ring | blue `#005fcc` | pale blue `#daedfb` |
| Brand mark | mulberry `#421d24` | pink `#f6aadd` |
| Status | green `#148072`, orange `#f18333`, red `#cd0037`, blue `#1173a8` | green `#26a28b`, orange `#f18333`, red `#f72a42`, blue `#4198d2` |

- **Radius.** 4px for keys and checkboxes, 6px for label chips, 8px for buttons, inputs, menu rows,
  toasts and plan columns, 12px for cards, menus, dialogs and the 48px buttons on public pages. The
  rail well, its current item and avatars are round.
- **Borders.** 1px hairlines between panes (the rail, the side panel) and under section titles.
  List rows have no lines between them; space separates them.
- **Shadow.** A published set of soft stacked drops in warm grey with a 1px ring: small for raised
  rail items, medium for the reply composer, large for menus, the largest for dialogs and the
  command menu. In dark, menus and dialogs also take a hairline.
- **Motion.** Fast: 100ms for hover and press, 200ms for opening, 300ms for larger moves, all on an
  expo ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`). Nothing bounces; nothing scales on press.
- **Spacing.** A 4px unit. Usual gaps:
  - 8–12px inside a row and between chips;
  - 16–24px pane padding;
  - 24px between split tabs;
  - 40px between settings sections.
- **Layout.**
  - A 56px **icon rail** on the left: the app's sections as icons in one rounded well (the current
    one a raised circle), help, settings and the avatar at the bottom, a hairline on its right.
  - The **list pane** fills the rest: a menu button, the split tabs and quiet icon actions (new,
    search) across the top, then the rows edge to edge.
  - An optional **side panel** (about 19rem, the sunken colour, a hairline on its left) shows the
    person or the figures for what's selected.
  - An open item replaces the list in the same pane; reading text sits in a 40rem column.
  - Settings put a section list beside a 44rem column.
- **Density.** 1 by default (44px rows). For very long lists set `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-3)`. The exact
scales are in the reference at the end.

## Type

- **Families.** Geist (variable) for everything, Geist Mono for codes and addresses in errors.
  Load `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`; the light 360 and 440
  weights need the variable files.
- **Weights.** 360 for text and titles, 440 for labels and buttons, 500 for plan names and unread
  senders, 600 rarely.
- **Sizes:**
  - 12px for meta: dates, counts, hints, group labels;
  - 13px for menus, buttons and help text;
  - 14px for list rows and UI text;
  - 16px for reading: messages, descriptions;
  - 22px for split tabs and dialog titles;
  - 28px for page titles, 39px and 49px for public-page headings, all at 360 and tracked −2.75%.
- **Case.** Sentence case everywhere. Dates and times are short ("9:41 AM", "Tue", "Nov 12").
- **Figures.** Tabular figures for counts, dates and amounts.

## Icons

- Lucide, outlined, **1.5px stroke**: 18px in the rail and the list header, 16px beside text and
  in menus, 14px in small buttons and chips, 32–48px at 1px in empty states and error pages. Icons
  are grey (subtle or muted text); the current rail icon is in ink.
- **The unread mark** is an 8px blue dot before the sender; read rows keep the space.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil` (also "new conversation"), delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis`, close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `send`, refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Bars** are rounded (3px), in purple; the bar that matters is full strength and the rest at 45%.
  Axis labels are 12px subtle text below; no gridlines in small charts.
- **More series** step through purple, blue, green, orange, mulberry and yellow (the published
  hues, a step lighter in dark).
- Plain figures sit above charts: 28px at 360 with a 12px subtle label, no card around them.
- Tooltips use the tooltip treatment: a charcoal label.

## States (every control)

- **Hover.** A warm grey wash: rows go to `#f7f5f2` (`#2f2e2c` in dark), quiet buttons and menu rows
  to `#f2f0eb` (`#474543` in dark). The purple button deepens to `#533192` (lilac lightens to
  `#bea1f5` in dark). Grey text turns to ink.
- **Focus.** A 2px blue ring, 2px outside the control (`#005fcc`, pale blue in dark). Keyboard focus
  only; never remove it.
- **Pressed.** One step past hover; no scaling.
- **Disabled.** Half opacity, default cursor. Say why nearby.
- **Current.** The current row has a pale purple tint (a grey step in dark) and a 3px purple edge on
  its left. The current split tab is in ink; the others are grey. The current rail item is a raised
  circle.
- **Unread.** A blue dot and a heavier sender (500) and subject (440).
- **Error.**
  - The control's border turns red.
  - The message replaces the hint under the field, in red, and says how to fix it.
- **Loading.**
  - A button keeps its width and label; `aria-busy="true"` shows a small spinner.
  - Lists show skeleton rows at row height in warm grey; never a spinner over the whole page.

## Components

All 36 of the library's components, as Comet draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, a section list or side panel beside content (the rail is a fixed 56px column before
  it);
- `m-container`, 72rem for public pages, 44rem for settings and reading, 30rem for forms;
- `m-grid`, for cards and figures: 16px gaps, 15rem columns;
- `m-stack` and `m-cluster`, for everything inside: 12px and 8px by default.

**Actions and forms**
- **Button.** An 8px rounded rectangle, 13px at 440, 32px by default (28px `sm`, 40px `lg`).
  - **Primary:** solid purple, white text (lilac with dark text in dark), one per view: Send,
    Continue.
  - **Secondary** (the default): a warm grey wash, no border.
  - **Ghost:** text or icon only, for the quiet actions in bars.
  - **Danger:** solid red, only to confirm something that can't be undone.
  - **Icon-only:** a 28px ghost square with an `aria-label` and its key in the tooltip.
  - On public pages the main buttons are 48px with 12px corners: solid purple, or a purple outline.
- **Input, textarea.** 36px, 8px radius, white (one step up in dark), a grey control border that
  darkens on hover; focus turns it purple with the blue ring. In the composer, inputs are
  borderless.
- **Select.** The same box with a small chevron; `sm` and sized to its content in settings rows.
- **Field.** The label above in 13px at 440, the control, then the hint or the error in 12–13px.
  Fields stack 16px apart.
- **Checkbox, radio.** 16px, 4px radius on the checkbox, filled purple with a white tick when
  checked.
- **Switch.** 32×18, grey when off, purple when on, a white knob (charcoal on lilac in dark). It
  applies at once; there is no Save.

**Navigation**
- **Sidebar.** Used for folder and settings lists, 15rem on the sunken colour.
  - Rows are 32px, 14px at 360 in muted text, a 16px icon, 8px radius; the current one is a warm
    grey wash in ink at 440.
  - Group headings are 12px subtle text in sentence case.
  - Counts are subtle numbers on the right, no pill.
  - The app's main sections live in the 56px icon rail instead (see Layout).
- **Navbar** (public pages). 66px, white, a hairline below; 16px links at 360 in ink; "Log in" as a
  ghost and the main action as a small purple button.
- **Tabs.**
  - **Split tabs** (the default variant, enlarged): 22px labels at 360 with a 14px subtle count, 24px
    apart, no underline; the current one in ink, the others subtle.
  - **Segmented switch** (the pill variant): a white track with a hairline and 10px corners; the
    choice is a grey step, or charcoal for a billing switch on public pages.
- **Breadcrumb.** 13px muted parts with "/" between, the current part in ink at 440. Rare: the back
  button with the split's name and count does this job in the app.
- **Pagination.** Lists scroll, and the open item shows "1 of 9". When pages are needed: 28px ghost
  squares, the current one charcoal.

**Data and content**
- **Table.** The mail list is a list, not a table: no header, no frame, no lines between rows,
  44px rows, a warm wash on hover. Real tables (plan comparisons, reports) keep the same 14px text
  with hairlines between rows and a plain subtle header.
- **Card.** White with a hairline and 12px corners, no shadow; a hovered card takes the small
  shadow. Titles are 16px at 440.
- **Badge.** Label chips: 22px, 6px corners, a pale tint of the hue with dark text in the hue
  (pink for urgent, peach for returns, mint for resolved, lavender, sky). Neutral chips are warm
  grey.
- **Avatar.** Round, 24px in lists, 32px beside a message, 48px in the side panel; initials in deep
  purple on lavender.
- **Divider.** A 1px warm hairline, only between panes and under section titles.
- **Accordion.** Questions at 16px and 360 between hairlines, no fill, a chevron on the right.
- **Code, kbd.** Code in Geist Mono on the sunken colour. Keys are small warm-grey squares in the
  UI face at 12px and 440, 4px radius, no border: `⌘` `K`. Keys appear beside every command.
- **Prose.** 16px with a 1.5 line height, at most 40rem, links underlined in purple.
- **Progress.** A 4px bar, purple on warm grey.
- **Meter.** The same bar; it turns orange, then red, past its marks.
- **Usage.** A 13px label and amount over a 4px bar, with a 12px footer line.

**Feedback and overlays**
- **Alert.** A tinted panel with 8px corners and no stripe: a 16px icon in the hue, the title at
  440 and the body in the hue's text colour. A danger alert sits above the form it's about and says
  what was not done.
- **Toast.** Inverted (charcoal in light, paper in dark), bottom left, 8px corners, one line:
  what happened, then "Undo" underlined with its key. Errors say what was kept and offer Retry; they
  stay until dismissed.
- **Dialog.** White (raised grey with a hairline in dark), 12px radius, the largest shadow over a
  60% charcoal scrim; a 22px light title, actions on the right of the footer with the primary last
  and its key on the left.
- **Popover and menu.** White (raised grey with a hairline in dark), 12px radius, the large shadow,
  4px padding; 36px rows at 14px with a 16px icon and 8px radius; the key on the right; subtle
  group labels; hairline separators.
- **Command menu.** A dialog of its own near the top of the screen: a search icon and a borderless
  16px input, then commands as menu rows with their keys. The highlighted row is a warm grey step.
  Opens with `⌘K` everywhere.
- **Tooltip.** A charcoal label (`#474543`) with paper text at 13px, 8px radius, the action's key
  beside it. Appears after 300ms.
- **Spinner.** A 2px purple ring. Inside buttons and small areas only.
- **Skeleton.** Warm grey bars at text height and row height, a slow shimmer that stops under
  reduced motion.

**AI and chat**
- **Chat.**
  - The assistant's turns are plain text on the pane; no bubble.
  - The person's own messages sit in a warm grey box with 12px corners.
  - Meta lines (who, when) are 12px subtle.
- **Composer.** White on a medium shadow with 12px corners; a borderless input at 14–16px;
  controls bottom left, the purple Send bottom right with its key.
- **Thinking.** A subtle 13px line that expands, with a 1px rule.
- **Tool call.** A sunken row with 8px corners: a 14px icon, the tool name, a status chip, and the
  result in 13px below.
- **Citation.** A small warm-grey key-like chip with a number; the source in a raised popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the hint. Validate on blur and on
  send, not while someone is typing.
- **In a form or dialog:** a danger alert at the top saying how many things need fixing and what
  happened to the work ("Nothing was sent. Your text is kept as a draft."). Focus moves to it; each
  field shows its own message.
- **Somewhere else:** an inverted toast that says what failed and what was kept ("You're offline.
  The reply is in Drafts and sends when you reconnect.") with Retry.
- **A whole page:** centred in the pane.
  - A 32px thin icon in subtle grey, the code in small mono, a 22px light title, one sentence, one
    or two small buttons.
  - **404:** "This conversation isn't here", with a way back to the list.
  - **500:** "Something broke on our side" and "Nothing you wrote was lost", with Try again.
  - **403:** "Only the wholesale team can open this" with Ask for access.
- **Words.** Say what happened, what was kept, and what to do. No codes in sentences, no blame, no
  exclamation marks.

## Page shapes (recipes)

- **Dashboard.** The list home: the icon rail; the split tabs with counts and the new and search
  actions; one-line rows (the current one tinted with a purple edge), a "Earlier this week" group
  label; a sunken side panel with this week's figures, a small purple bar chart and the keys for the
  list; an Undo toast bottom left.
- **List and detail.** The open item in the same pane: a back button with the split's name and
  count, "1 of 9", quiet icon actions; the subject at 22px with chips; earlier messages folded to
  one line; the latest in full at 16px with attachments as chips; the reply composer on a medium
  shadow with Send and `⌘↵`; the person's side panel (avatar, address, local time, orders, earlier
  conversations).
- **Onboarding.** One centred step on the warm page: a wordmark and "Step 2 of 4", a light 39px
  heading, one muted line, then the thing being taught (the command menu, already filtered), a wide
  primary Continue and a ghost Back.
- **Settings.** The rail, a section list (grouped "You" and the workspace), and a 44rem column: a
  28px light title, then sections of hairline rows with the label and help on the left and a
  switch, select or key on the right, and a radio group.
- **Empty state.** The split tabs stay; the pane holds a thin 48px icon, a light 28px heading, one
  muted line, where to go next (with its count) and the keys for it, over a faint wash of the brand
  tint.
- **Pricing.** The public site: a white bar with a wordmark, a light 39px title, a Monthly/Yearly
  switch with a saving chip, three joined plan columns (the middle one tinted and outlined in
  purple under a charcoal cap, 48px buttons), a comparison table and questions.
- **Errors.** The field, dialog, toast and full-page errors above, as one page.

## Words

- Short, plain, sentence case: "New conversation", "Close and go to next", "Snooze until tomorrow".
- Commands start with a verb; each shows its key.
- Confirmations say what happened in the past tense ("Closed 2 conversations") and offer Undo.

## Do and don't

| Do | Don't |
| --- | --- |
| Keep each list item to one line: sender, chips, subject, grey snippet, date | Stack two or three lines per row in a list, or box rows in cards |
| Show the key beside every action, in menus, tooltips and empty states | Hide actions behind menus with no shortcut |
| Use the purple for the one primary action and the current row's edge | Colour headings, icons or panels purple for decoration |
| Act at once and offer Undo in an inverted toast | Ask "Are you sure?" for things that can be undone |
| Keep greys warm and text light (360) | Use cold blue-greys, or bold everything |
| Make the split tabs large and the counts small and grey | Put counts in coloured pills or badges |
| Design light and dark as equals | Treat dark as an inverted afterthought |
