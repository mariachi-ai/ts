# Linen

Category: calm and minimal. Calm and tidy: a pale blue-grey sidebar of lists beside a white page,
bold list titles, small rounded checkboxes with the project in grey underneath, blue section headings
over a hairline, outlined tag pills, one soft blue for actions and a pink-red only for what's due.
Dark mode is a soft charcoal, never black. For task, planning and note tools that should stay out of
the way.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `linen` preset of `@mariachi/design` (`data-theme="linen"`,
`themes/linen.css`).

## Principles

- **Quiet chrome, loud content.** The page is white and nearly empty: no frames, no fills, no
  shadows except where something floats. The list title and the to-dos are the only things that
  carry weight.
- **One blue, one pink-red.** The soft blue fills the one action that matters and colours section
  headings and links. The pink-red marks only what's due or overdue. Everything else is ink and
  grey. The brand pink (`color.brand.default`) appears only on the public site, on its one
  sign-up button.
- **Colour lives in small glyphs.** Each list has its own coloured glyph (a yellow star, a blue
  tray, a pink calendar); the rest of the interface stays grey.
- **Generous space.** Rows are short, but the page around them is wide and calm: a narrow centred
  column, 48–64px of air above the title, sections well apart.
- **Gentle motion.** Short, with a light spring when something opens; nothing bounces twice.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Page and cards | white `#ffffff` | charcoal `#242529`, cards `#26272b`, menus `#2e2f33` |
| Sidebar | pale blue-grey `#eff4f8`; the current list `#d5dce5` | `#1d1e22`; current `#3a3b3f` |
| Quiet panels (the day's calendar, code) | `#f5f7f9` | `#2e2f33` |
| Text: default, muted, subtle | `#1f2125`, `#6c6f74`, `#727579` | `#f4f4f6`, `#b4b5b7`, `#9a9b9f` |
| Hairlines | `#e6e8eb`; lighter `#f0f1f3` | `#38393d`; `#2f3034` |
| Checkbox and field edges | `#8e9196` | `#7a7b80` |
| Action blue | `#2f6fdf`; headings and links `#0062c1` | `#2f6fd6`; text `#6aaeff` |
| Due and overdue | pink-red `#c9134a` text, `#d81b52` solid | `#ff7a96`, `#c62c55` |
| Highlighted row | pale blue `#bad1fb` | deep blue `#274174` |
| Brand pink (the public site's trial button) | `#dd225c`, tint `#fde8ee` | `#dd225c`, tint `#3a2129` |

- **Radius.** 4px for checkboxes and date chips, 6px for buttons, fields and list rows, 10px for
  cards and the calendar box, 12px for menus and sheets. Tags and filter pills are fully round.
- **Shadow.** Almost none. A push button has a half-pixel edge. An open to-do lifts on a soft
  two-step shadow; menus and sheets add a long faint drop. In dark mode, a faint light ring instead.
- **Motion.** 150, 250 and 400 ms. `cubic-bezier(0.25, 0.1, 0.25, 1)` for hover and fades;
  `cubic-bezier(0.32, 1.24, 0.56, 1)`, a light spring, for things that open (a to-do into a card, a
  menu, a sheet).
- **Spacing.** A 4px unit. The usual gaps are:
  - 4px between to-do rows (they're two lines: the title and the project);
  - 8px inside a group of controls;
  - 32px between the title, the calendar box and each section;
  - 48–64px above the list title.
- **Layout.**
  - A 224px sidebar of lists, no border, on its own pale tint.
  - The page is a centred column up to 40rem (640px), with a gutter of `clamp(1.25rem, 5vw, 4rem)`.
  - A quiet toolbar of icon buttons sits along the bottom of the page, over a light hairline.
  - Forms and sheets are 28rem wide.
- **Density.** 1 by default. For long lists, set `--m-density: 0.85` on the page; controls and
  padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-text)`, `var(--m-space-4)`. The exact
scales are in the reference at the end.

## Type

- **Families.** Geist (variable) for everything, standing in for the system grotesque the reference
  uses. Geist Mono for code and addresses.
- **Sizes:**
  - to-do titles and body text 15px, line height 1.2 in rows and 1.4 in text;
  - the project under a to-do, tags' neighbours and secondary text 13px;
  - tags and counts 11px;
  - list titles 26px **bold**, tracked −1.5%, with the list's glyph before them;
  - section headings 15px semibold, in blue for headings inside a project and in ink for a day's
    sections ("Evening");
  - marketing headings 36px bold.
- **Weights.** 400 for text, 500 for buttons and tabs, 600 for headings and areas in the sidebar,
  700 for list titles.
- **Case.** Sentence case everywhere. No capitals for labels.
- **Times and dates** use tabular figures: `8:15 AM`, `Mar 12`.

## Icons

- Lucide, outlined, **1.5px stroke**: 16px in the sidebar and beside text, 18px in the bottom
  toolbar, 26px beside a list title, 56–72px for empty lists and full-page errors.
- **List glyphs are coloured** and softly filled (the outline with a 16% fill in its own colour; the
  star solid): the tray in blue, the star in yellow, the calendar in pink-red, the layers in green,
  the archive box in amber, the finished list in deep green. Areas are a grey box; projects are a
  grey progress circle whose wedge fills as to-dos are done.
- Small grey marks after a to-do's title show it has notes (`file`) or a checklist (`list-checks`).
- A deadline is a solid pink-red `flag` with the word ("today", "2 days left").
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `sliders-horizontal`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal, in blue beside a heading), close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send and move `arrow-right`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar-days`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- The product has no charts; progress is a small pie beside a project. When an app needs charts,
  keep them small and flat: no gridlines, labels in muted 13px, rounded bar ends.
- **Series** step through the calendar's blue and green, then the list glyphs' pink-red, teal and
  yellow.
- Tooltips use the tooltip treatment (the slate flag).

## States (every control)

- **Hover.** Ghost buttons and sidebar rows take a faint grey fill (`#eff1f4`, sidebar `#e4eaf0`);
  the primary blue deepens one step. Nothing lifts.
- **Focus.** A 2px blue ring outside the control, on keyboard focus only. Never remove it.
- **Pressed.** One step darker than hover; the push button loses its shadow.
- **Disabled.** Half opacity; the cursor stays default.
- **Selected and current.** The current list is a soft grey row with a 6px radius. A highlighted
  to-do or menu row is the pale selection blue (deep blue in dark). The chosen tag filter is a grey
  pill. Checked boxes fill with the blue and a white tick.
- **Done.** A finished to-do's box fills blue and its title turns muted; it stays in place until
  the list is cleared, then moves to the finished list.
- **Error.**
  - The field's border turns pink-red.
  - The message replaces the help text under the field, in pink-red 13px, and says how to fix it.
- **Loading.**
  - A button keeps its width and label; `aria-busy="true"` swaps the label for a small spinner.
  - Lists show grey skeleton rows at title and project widths, never a spinner over the page.

## Components

All 36 of the library's components, as Linen draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, a 224px sidebar of lists beside the page, with no gap and no border between;
- `m-container`, the page column: 40rem for lists, 48rem for wide pages, 28rem for forms and sheets;
- `m-grid`, for cards: 20px gaps;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 32px apart; a list title has 48–64px above it.

**Actions and forms**
- **Button.** A push button: 6px radius, weight 500, 28px (`sm`) in toolbars and rows, 32px by
  default.
  - **Primary:** the soft blue, white text, one per view ("Continue", "Turn on").
  - **Secondary** (the default): white with a half-pixel edge and a breath of shadow.
  - **Ghost:** no fill until hover; the bottom toolbar, "New list", "Back".
  - **Danger:** solid pink-red, only to confirm deleting something.
  - **Icon-only:** a ghost square with an `aria-label`, in the muted grey.
- **Input, textarea.** 32px, 6px radius, white, an edge that meets 3:1 and darkens on hover. Focus
  is the blue ring. Quick-find style search fields can sit on the quiet grey panel instead.
- **Select.** The same box as an input with a small chevron; in settings it sits right of a
  right-aligned label.
- **Field.** The label above in 13px regular ink, the control, then the help text or the error
  below. In settings windows the label sits to the left, right-aligned, ending in a colon.
- **Checkbox, radio.** Small: a 15px box with a 4px radius and a grey edge; it fills blue with a
  white tick when done. Radios are the same size, round. Checklist items inside a to-do use a blue
  ring.
- **Switch.** A small 36px switch: blue when on, grey when off, a white knob. It acts at once.

**Navigation**
- **Sidebar.** 224px on the pale blue-grey, no border.
  - Groups of lists separated by space, not lines: the capture list; the day lists; the finished
    list; then each area (bold, with a grey box) followed by its projects (progress circles).
  - Rows are 15px ink with a 16px coloured glyph; the current one is a soft grey row with a 6px
    radius.
  - Counts sit right-aligned in grey; an overdue count is a small solid pink-red pill before it.
  - A footer with "+ New list" and the settings icon, over a hairline.
- **Navbar** (public pages). On the page colour with a hairline underneath; the brand in bold ink,
  links in muted grey at 15px semibold, the current one in ink.
- **Tabs.**
  - **Pill** (tag filters): plain muted words in a row; the chosen one is a grey pill.
  - **Underline:** a 2px blue line under the current tab, in ink; rarely used.
  - Settings windows use icon tabs: a 22px icon over its label, the current one in blue on a white
    tile.
- **Breadcrumb.** Muted links with "›" between and the current page in semibold ink. In the app, the
  list title is the only heading; prefer a back link.
- **Pagination.** Round ghost buttons, the current page a grey pill with white text. Lists prefer
  "Show 12 more" as a muted text button.

**Data and content**
- **Table.** Lists, not grids: no frame, no header fill, 13px muted headers in sentence case and
  hairline rows that highlight in the quiet grey on hover. Prefer to-do rows over tables.
- **Card.** The open to-do: white, 10px radius, no border, the soft two-step shadow, 20px padding.
  The title row keeps its checkbox; notes, checklist and tags sit indented under the title. The
  grey `sunken` card (18px radius on the public site) is for side-by-side choices like prices.
- **Badge.** Tags are small round outlined pills: 11px grey text on white with a grey edge. Tone
  badges are soft tints without an edge (a green "Kiln"). Date chips are the solid variant: a grey
  4px-radius chip ("Mar 12"). Counts that need attention are solid pink-red.
- **Avatar.** Round, on the pale blue tint, with initials in blue. Rare: shared lists only.
- **Divider.** A hairline. Headings inside a project carry their own hairline underneath.
- **Accordion.** Questions as bold rows over hairlines, a chevron on the right, no boxes.
- **Code, kbd.** Notes' code is Geist Mono 13px on the quiet grey panel, no border. Keys are small
  white caps with a hairline and a half-pixel shadow.
- **Prose.** Notes: 15px with a 1.5 line height, up to 64 characters, links in blue.
- **Progress.** A thin 4px bar: the blue on a pale grey track (in dark, the lighter heading blue).
  In lists, prefer the progress circle beside the project's name.
- **Meter.** The same bar; it turns pink-red past the "high" mark.
- **Usage.** A label and amount over the thin bar, the amount in tabular figures.

**Feedback and overlays**
- **Alert.** A note in the quiet grey panel style: a tinted background in the tone's pale colour,
  8px radius, no border and no stripe; a 16px icon, a semibold title and one line. A danger alert
  sits above the form and says what didn't change.
- **Toast.** Small and white on the menu shadow, 10px radius: an icon, a semibold title, one line
  and one action ("Retry", "Undo"). Bottom centre, over the toolbar.
- **Dialog.** A sheet: white, 12px radius, the window shadow over a light grey scrim, 28rem for a
  confirm. The title is 17px bold. Buttons on the right: Cancel as secondary, the action in blue.
- **Popover and menu.**
  - Menus and quick find: white, 12px radius, 6px inner padding, the menu shadow. Rows are 30px,
    15px text, 6px radius, and highlight in the pale selection blue.
  - Pickers (when, tags, move) are dark in both modes: put `data-theme="linen" data-mode="dark"` on
    the popover. The chosen row is solid blue with white text.
- **Tooltip.** The slate flag (`#252d38`) with white 13px text and a 6px radius, after 500ms.
- **Spinner.** A thin 2px ring in the blue; inside buttons and small areas only.
- **Skeleton.** Pale grey rows at the to-do's title and project widths, with a slow soft shimmer
  that stops under reduced motion.

**AI and chat**
- **Chat.**
  - The assistant's messages are plain text on the page, with no bubble.
  - The person's own messages sit on the quiet grey panel with a 12px radius, right-aligned.
  - Times are muted 11px.
- **Composer.** A white box, 10px radius, the card shadow and an edge that meets 3:1, turning blue
  while typing. Send is a blue icon button with `arrow-right`.
- **Thinking.** A muted line ("Thinking…") with a soft pulse. **Tool call:** a hairline row, 8px
  radius, with a 16px icon, the tool's name and a status tint.
- **Citation.** A small grey round chip with a number; the source in a menu-style popover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns pink-red and the message replaces the help text. Check on blur and
  on submit, never while someone is typing.
- **In a form or sheet:** a danger alert above the fields says what didn't happen and that nothing
  changed ("Sync isn't on yet … Your lists on this device are unchanged."). Focus moves to it.
- **Somewhere else** (sync, an import): a toast with an icon, what happened, that changes are kept,
  and one action ("Retry").
- **A whole page:** centred in the page column.
  - A 56px outline icon in a faint grey, "Error 404" in muted 13px, a 20px bold title, one sentence
    and one or two buttons.
  - **404:** the list isn't here, with a way back to the day list.
  - **500:** "Something went wrong on our side" and "Nothing in your lists was changed", with Try
    again.
  - **403:** the list is private, with a way to ask for it.
- **Words.** Say what happened, whether anything changed, and what to do. Calm, no blame, no
  exclamation marks.

## Page shapes (recipes)

- **Dashboard** (a day list).
  - The sidebar of lists; the title "Focus" at 26px bold with a yellow star.
  - The day's calendar in a grey box: an all-day line with a thin blue bar, then times in blue and
    green with the event in muted grey.
  - To-dos with the project beneath; a deadline flag on the right; an "Evening" section with a moon
    over a hairline. The toolbar along the bottom.
- **List and detail** (a project).
  - The project's progress circle and title, its notes, and tag filters as pills.
  - Blue headings over hairlines with a blue `•••`, to-dos under each, tags and date chips inline.
  - One to-do opened in place as a card: notes, a checklist with blue rings, a tag, and its
    actions; the dark date picker beside it.
- **Onboarding.** One sheet in the middle of the page: a soft glyph, a bold 26px question, choices
  as quiet rows (the chosen one on the grey panel), one field, Back as a ghost and Continue in blue,
  then a small progress bar.
- **Settings.** A settings window: icon tabs over right-aligned labels with menus, a hairline, then
  checkboxes in the control column. A sync pane with a large soft glyph and a switch on the left,
  the account and plain buttons on the right, and a blue help link.
- **Empty state.** The list's title, then its glyph large and faint in the middle, one sentence and
  a quiet "New to-do".
- **Pricing.** The public site: a plain header, a bold line, one grey 18px-radius card per device
  with an outline device icon, a one-time price and a dark store button, the free trial in the
  brand pink above it, then questions.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Short, plain and kind, in sentence case: "New list", "Show 12 more", "Nothing to sort."
- Dates short ("Mar 12"), times with AM and PM, relative where it helps ("today", "2 days left").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep the page white and the chrome quiet | Frame lists in cards, or fill headers |
| Make list titles bold, with their coloured glyph | Use capitals or coloured text for titles |
| Put the project's name in grey under each to-do | Add columns of metadata to rows |
| Use blue for headings inside projects and for the one action | Use blue for decoration or many buttons |
| Keep pink-red for due and overdue | Use pink-red for emphasis or decoration |
| Use small rounded checkboxes that fill blue | Large, square or circular checkboxes |
| Give tags outlined round pills | Solid coloured tags everywhere |
| Use a soft charcoal in dark mode | Pure black backgrounds |
