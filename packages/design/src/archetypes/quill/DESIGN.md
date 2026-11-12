# Quill

Category: calm and minimal. Calm and bookish: ink-grey words on white paper, a graphite sidebar of
tags that stays dark even in light mode, one signature red for actions, links, pins and list
bullets, grey tag capsules, and round quiet chrome that keeps out of the way of writing. Dark mode is
a near-black graphite with a calm blue. For notes, journals and writing apps.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `quill` preset of `@mariachi/design` (`data-theme="quill"`,
`themes/quill.css`).

## Principles

- **The words come first.** The page is white paper with ink-grey text (`#444444`, never black).
  Chrome is pale, round and grey, and recedes; nothing competes with what someone wrote.
- **One red, used sparingly.** The red marks the one action, links, the pin, list bullets and the
  edge of the selected note. Everything else is ink, grey and white.
- **Graphite holds the structure.** The tag sidebar is graphite in both modes, with light text and a
  soft grey block for the current row. It frames the paper without shouting.
- **Bold, friendly headings.** Headings are bold in a round geometric face; body text is regular
  and roomy (16px at 1.6 in the editor).
- **Quiet separation.** Notes in the list are split by hairlines; the selected one sits on a pale
  fill instead. No boxes around lists, no heavy borders.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Paper: canvas, surface | white `#ffffff` | graphite `#1e1e20` |
| Raised (menus) | `#ffffff` | `#2d2d31` |
| The quiet fill: selected note, table header, feature panels | `#f3f5f7` | `#2d2d31` |
| Sidebar | graphite `#2e3136`, text `#d1d1d1`, current row `#474747` | `#2a2a2c`, text `#c8c8cb`, current row `#3e3e42` |
| Text: default, muted, subtle | `#444444`, `#6f6f6f`, `#767676` | `#dddddd`, `#b0b0b2`, `#949495` |
| Hairlines; tag capsules | `#e4e5e6` | `#333336`; capsules `#3e3e42` |
| Control rings (to-do box, inputs) | `#888888` | `#6e6e72` |
| Accent (actions, focus) | red `#cf474a`; links `#c44346` | blue `#286ab3`; links `#43a3e9` |
| Brand (logo square, plan badge) | red `#cf474a` | the same red |
| Callout bars | warning `#ef8930`, danger `#cf474a`, info `#456aa3`, success `#2a865b` | the same, lifted for dark |

- **Radius.** 4px for marks and badges with corners, 8px for buttons, inputs and the selected note,
  6px for callouts and tables, 10–12px for menus and sheets, 16px for panels, 40px (2.5rem) for
  the big pricing card. Tag capsules, chrome buttons and segmented controls are pills.
- **Shadow.** Almost none in the app: the round chrome has a hairline ring and a breath of drop.
  Menus and sheets take a hairline edge and a long soft drop. The public site lifts its feature card
  on `0 13px 34px` at 12%.
- **Motion.** 120, 200 and 320 ms with a gentle ease; nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 4–8px between a note's title, its lines and its date;
  - 12–16px inside a note row and between fields;
  - 24px between blocks in the editor;
  - 48–64px between sections on the public site.
- **Layout.**
  - Three columns in the app: a 180px sidebar, a 280px note list with a hairline edge, and the
    editor, whose text runs to about 38rem (608px).
  - The public site is a centred 960px column with a 64px header.
  - Forms in a 30rem column, settings in a 40rem window.
- **Density.** 1 by default. For dense lists, set `--m-density: 0.875`; controls and padding shrink
  together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Gantari for everything: regular 400 for text, 600 for note titles and labels, 700
  for headings and big numbers. Load the variable font (`@fontsource-variable/gantari`). It stands
  in for the reference's own custom sans: geometric, a large x-height, a single-storey g and a
  straight-tailed y.
- **Mono.** Roboto Mono (`@fontsource-variable/roboto-mono`) for code blocks and inline code, at
  14px.
- **Sizes:**
  - editor text 16px at 1.6; note list lines 15px at 1.4; sidebar 15px;
  - note titles in the list 16px at 600; dates 11px;
  - the note's title (H1) 30px bold; H2 22px bold; H3 18px bold;
  - the public site: 51px (`4xl`) and 42px (`3xl`) bold titles at 1.1, 16px body at 1.7.
- **Case.** Sentence case everywhere. Capitals only in a plan badge ("PLUS").
- **Figures.** Tabular figures for statistics and prices; prices are large and regular, with the
  period ("/month") small and muted.

## Icons

- Lucide, outlined, **1.75px stroke**: 16px in the sidebar and lists, 17px in the round chrome,
  12px inside tag capsules and beside dates, 40–56px at 1–1.25px for empty and error pages. Never
  filled.
- Icons are grey (`--m-color-fg-muted`) in chrome, light in the sidebar, and red only for the pin.
  Callout icons take the callout's colour.
- **The same icon for the same action, every time:**
  - add `square-pen` (a new note), edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis-vertical` (in a round button), close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- The language has little use for charts; when one is needed, keep it quiet.
- **One series:** a 2px line in the red, no area fill, light hairline gridlines, labels in subtle
  11px.
- **More series** step through red, slate blue, pine, plum, amber, sky and orange.
- Tooltips use the graphite tooltip.

## States (every control)

- **Hover.** Fills deepen one step: secondary chrome `#f7f7f7` to `#efeff0`, ghost buttons take the
  quiet fill, sidebar rows take `#3a3d42`. The primary red goes from `#cf474a` to `#bd4144`. Nothing
  lifts or moves.
- **Focus.** A 2px ring in the accent (red, blue in dark), 2px outside the control, on keyboard
  focus only. Never remove it.
- **Pressed.** One step darker than hover.
- **Disabled.** Half opacity; the cursor stays default. Say nearby why something is unavailable.
- **Error.**
  - The control's ring turns red.
  - The message replaces the hint under the field, in red 13px, and says how to fix it.
- **Loading.**
  - A button keeps its width and its label ("Exporting"); `aria-busy="true"` swaps the label for a
    small spinner.
  - A locked or loading note shows grey word blocks (skeletons) in place of its lines.
- **Selected and current.**
  - The selected note sits on the quiet fill with a 3px red leading edge and 8px corners.
  - The current sidebar row is a soft grey block with white text.
  - A segmented control shows a white pill on a pale track; checked controls are red.

## Components

All 36 of the library's components, as Quill draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split` twice for the app: the 180px sidebar beside a second split of the 280px note list and
  the editor (`--m-layout-split-side: 17.5rem` on the inner one);
- `m-container`, the site's 60rem column, or 40rem for settings and 30rem for forms;
- `m-grid`, for panels and statistics: 24px gaps;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 8px corners, regular weight with slight tracking, 36px by default, 44px (`lg`) on the
  public site.
  - **Primary:** solid red, white text. One per view: Continue, New note, Start the free trial.
  - **Secondary:** the pale chrome fill `#f7f7f7` with a hairline. In the app, chrome buttons are
    round (`border-radius: var(--m-radius-full)`), icon-only, with the `sm` shadow and a grey icon.
  - **Ghost:** text only, for quiet actions (Back, Skip setup, Cancel) and the format bar.
  - **Danger:** solid red, only to confirm something destructive.
- **Input, textarea.** White, 8.8px corners, a grey `#888888` ring that darkens on hover and turns
  red on focus. Search fields are pills.
- **Select.** The same box as an input, with a small chevron.
- **Field.** The label above in 13px medium, the control, then the hint or the error below. On a
  desktop settings pane, labels sit to the left, right-aligned.
- **Checkbox, radio.** The to-do box: 18px, 5px corners, a 1.5px grey ring; red with a white tick
  when checked. A done to-do turns its text muted.
- **Switch.** 38 × 22, a grey track, red when on, a white knob with a small shadow.

**Navigation**
- **Sidebar.** The graphite tag sidebar: 180px, 8px padding, 15px rows 28px tall.
  - A filter icon at the top right, then the fixed places (All notes, Drafts, Tasks…), then
    "Tags" and the tag tree.
  - Each row has a 16px outline icon; parent tags have a small chevron in the left gutter, and
    child tags are indented with a `#` icon.
  - The current row is a soft grey block with 6px corners and white text. Counts and pins sit right,
    in light grey.
- **Navbar** (public site). White, 64px, the brand mark and a bold wordmark on the left, ink links
  at 16px that turn red on hover and when current.
- **Note list header** (in the app). The place's name in bold with a chevron, then round chrome
  buttons for New note and Search on the right.
- **Tabs.**
  - **Underline:** ink text, a 2px red line under the current tab.
  - **Pill** (the segmented control): a pale track with a white pill and a soft shadow; in the info
    panel the segments are icons.
- **Breadcrumb.** Tag paths read like breadcrumbs: muted segments with "/" between, the current one
  in ink.
- **Pagination.** Rare in notes; when used, muted numbers and the current one on the capsule grey.

**Data and content**
- **Table.** The editor's table: a hairline frame with 6px corners, a filled header row in 600,
  hairline column rules, rows 40px tall, alternate rows on the quiet fill when striped.
- **Card.** The public site's feature panel: the quiet fill, 16px corners, no border, no shadow.
  The outline variant is white with a hairline (theme cards, error pages). A clickable card lifts
  on hover.
- **Badge.** The tag capsule: 22px, pill, 13px regular, ink on `#e4e5e6`, with a small `#` icon.
  Tones tint it. A plan badge is a red square-cornered block in bold capitals.
- **Avatar.** Rare; round, ink initials on the capsule grey.
- **Divider.** A hairline `#e4e5e6`, inset to the text in note lists.
- **Accordion.** Folded headings: hairline rows, the question in 16px semibold, a chevron, no
  fill.
- **Code, kbd.** Code is Roboto Mono 14px on the quiet fill with 6px corners (4px inline). Keys are
  small grey blocks with a hairline and 5px corners, in the sans.
- **Prose.** The editor: 16px at 1.6, up to 38rem, bold headings, red links with no underline (a
  small pencil follows a link to another note), red bullets, italic muted quotes with a grey bar,
  images with 8px corners.
- **Progress.** A 4px rounded bar: red on the capsule grey (the brighter blue in dark).
- **Meter.** The same bar; it turns orange then red past its marks.
- **Usage.** A label and amount over the same 4px bar, in tabular figures.

**Feedback and overlays**
- **Alert** (the callout).
  - A faint wash in the tone, a hairline frame, 6px corners and a 3px bar on the leading edge.
  - In the recipes the bar and the icon take the tone's solid colour
    (`border-inline-start-color: var(--m-color-warning-solid)`), and the title and text stay ink,
    as the reference's callouts do.
  - Danger callouts sit above the form they're about and say what was not done.
- **Toast.** A graphite HUD: the sidebar's colour, light text, 10px corners, the overlay shadow, a
  tone-coloured icon on the left and one action. Success toasts close themselves; errors stay.
- **Dialog.** A sheet: white, 12px corners, the overlay shadow over a soft graphite scrim, a bold
  22px title, actions on the right with the primary last.
- **Popover and menu.** The desktop menu: 10px corners, 5px padding, 28px rows with 5px corners,
  muted section labels, a grey highlight, a check for the chosen item.
- **Tooltip.** Graphite with light 13px text, 6px corners, after 500ms.
- **Spinner.** A thin grey ring; inside buttons and small areas only.
- **Skeleton.** Grey word blocks with 3px corners, like a locked note's hidden lines.

**AI and chat**
- **Chat.**
  - The person's words sit on the quiet fill with 12px corners; the assistant answers plain on the
    paper, with no bubble.
  - Timestamps are subtle 11px.
- **Composer.** A white box with 12px corners, the chrome shadow and a grey ring that turns red while
  typing. Send is a round red button.
- **Thinking.** A muted line ("Thinking…") with a soft pulse. **Tool call:** a hairline row with
  8px corners, a 16px icon, the name and a capsule for its status.
- **Citation.** A small capsule with a number, the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the ring turns red and the message replaces the hint. Validate on blur and on
  submit, never while someone is still typing.
- **In a form:** a danger callout above the form saying how many things need fixing and that
  nothing was done ("2 things need fixing. Nothing was exported."). Focus moves to it; each field
  shows its own message.
- **Somewhere else:** a graphite toast with what happened, whether anything was lost, and one
  action ("3 notes didn't sync · Retry now").
- **A whole page:** centred, in an outline card or the editor column.
  - A 44px thin outline icon in the subtle colour, the code in small mono, a 22px bold title, one
    sentence and one or two buttons.
  - **404:** "This note isn't here" with All notes.
  - **500:** "Something broke on our side" and "Nothing in your notes changed", with Try again.
  - **403:** "This note is private" with Ask for access.
- **Words.** Say what happened, whether anything changed, and what to do. Gentle, plain and short;
  no codes in sentences, no blame, no exclamation marks.

## Page shapes (recipes)

The reference is a desktop and phone app; these recipes translate its three desktop columns to the
web.

- **Home** (`dashboard`).
  - The graphite sidebar, the note list and the editor.
  - Notes are a bold title, two muted lines and a small date; the pinned one has a red pin; the
    selected one sits on the fill with a red edge. Attachments show as small file tiles.
  - The editor has round chrome at the top right (the text-style capsule, info, more), a 30px bold
    title, tag capsules in the text, a callout, to-dos, a framed table, red bullets, and the floating
    format bar at the foot.
- **List and detail.** A pill search field with a red ring at the top of the list, matches marked in
  the text, the open note, and its info panel: a segmented control of icons, statistics tiles on the
  fill, dates, and the notes that link here.
- **Onboarding.** A centred 40rem column, a thin progress bar, a 51px bold line, three look cards
  with live previews (the chosen one ringed in red), a quiet settings panel on the fill, Back as a
  ghost and Continue as the red primary.
- **Settings.** A desktop preferences window, the quiet fill on white paper: a toolbar of panes
  with 22px icons over their names, the current one on a grey block in red; right-aligned labels
  beside selects, checkboxes, radios and shortcuts; a tip callout; changes apply at once, so there
  is no Save, only a centred Restore editor defaults.
- **Empty state.** An empty tag: the list explains how notes arrive, with the tag capsule; the
  editor shows a 56px thin icon, a bold heading, one sentence with the shortcut, a red New note and
  a secondary Import notes.
- **Pricing.** The public site: the header, a centred 51px title, a plain Free column of square-mark
  checklists beside a white card with 40px corners and the soft lift, a red plan badge, light large
  prices with a green saving capsule, a red call to action, and the questions as an accordion.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Short, warm and plain, sentence case everywhere: "New note", "All notes", "Keep notes on all my
  devices".
- Dates are relative when recent ("Just now", "Yesterday"), then short ("Nov 9").

## Do and don't

| Do | Don't |
| --- | --- |
| Write in ink-grey `#444444` on white | Use pure black text or grey paper |
| Keep the sidebar graphite in both modes | Make the sidebar white or tinted with the accent |
| Use the red for the one action, links, pins and bullets | Paint headings, icons or large areas red |
| Show the selected note on the fill with a red edge | Box every note, or highlight it in solid red |
| Make chrome round, pale and grey | Square, dark or coloured toolbar buttons |
| Mark tags as grey capsules | Coloured or outlined tag chips |
| Separate notes with inset hairlines | Zebra lists, cards around every note, heavy dividers |
| Use the same icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
