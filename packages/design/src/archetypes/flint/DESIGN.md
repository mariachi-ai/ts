# Flint

Category: dark and sharp. Dark-first and compact: neutral near-black panels a step apart, text as one
light grey at set strengths, 7% hairlines, a 12–13px type scale, small radii, an inverted primary
button, green and red diff counts, quiet tool-call rows and a composer that names its model. The light
theme is a warm off-white public site with pill buttons and one orange brand colour. For developer
and AI-agent tools where people read code, steer agents and review changes all day.

The reference is a desktop code editor, so this language translates it to the web as a
dashboard-style app in its spirit: a side panel beside the work, an agent thread with its composer,
task and file lists, diffs, and settings as grouped boxes. It is not an editor.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `flint` preset of `@mariachi/design` (`data-theme="flint"`,
`themes/flint.css`). **Dark is the default look:** set `data-mode="dark"` on the root unless the
person has chosen light. Without it the theme follows the system setting. Light is meant for public
pages (pricing, docs, sign-up); the app works in it too.

## Principles

- **Dark first, in neutral steps.** No blue or warm cast in dark: the side panel `#141414`, the work
  area `#181818`, boxes `#1e1e1e`, menus `#232323`. Depth is a step of grey and a hairline, never a
  coloured surface.
- **One grey, several strengths.** Text is `#e4e4e4`; secondary text is the same grey dimmed
  (`#939393`); hairlines are it at about 7%. Colour is kept for meaning: green added, red removed,
  amber in progress, blue links.
- **The action is inverted.** The primary button is light grey on dark (`#e4e4e4` with near-black
  text) and near-black on light. There is no brand-coloured button.
- **Compact.** UI text is 13px, meta 12px, tags 11px; buttons 28px, rows 28px. Titles stay at
  regular weight, never bold.
- **Small radii.** 4px tags and keys, 6px buttons and inputs, 8px boxes, 10px dialogs, 12px the
  composer and settings groups. Pills only for chips and on public pages.
- **Keys everywhere.** Actions show their shortcut as quiet text or a faint key (`⌘N`, `⌘K`, `esc`).

## Foundations

| What | Dark (default) | Light |
| --- | --- | --- |
| Side panel, frame (sunken) | `#141414` | `#f0efea` |
| Work area (canvas) | `#181818` | `#f7f7f4` |
| Boxes, cards (surface) | `#1e1e1e` | `#f2f1ed` |
| Menus, dialogs, toasts (raised) | `#232323` | `#fcfcfa` |
| Text: default, muted, subtle | `#e4e4e4`, `#939393`, `#8a8a8a` | `#26251e`, `#64635d`, `#6b6a65` |
| Hairlines: default, muted | `#272727`, `#212121` | `#e2e2df`, `#ecebe8` |
| Control edges (strong) | `#6b6b6b` | `#8b8a85` |
| Primary action (accent) | `#e4e4e4` on `#141414` text | `#26251e` with `#f7f7f4` text |
| Links | `#81a1c1` | `#b23a00` |
| Brand (marks, highlights only) | `#f54e00` | `#f54e00` |
| Diff and status | green `#3fa266`, red `#e34671`, amber `#d2943e`, blue `#81a1c1` | green `#1f8a65`, red `#cf2d56`, amber `#c08532`, blue `#3c7cab` |

- **Radius.** 4px tags, keys and plan boxes on the public site; 6px buttons, inputs, menu rows and
  side-panel rows; 8px boxes, menus and toasts; 10px dialogs; 12px the composer and settings groups.
  Pills for mode chips, suggestion chips and every button on public pages.
- **Borders.** 1px. Boxes and panels have a hairline; the side panel has one on its right edge.
- **Shadow.** None on boxes. Menus and toasts take `0 8px 30px` at 35% in dark; dialogs and windows
  take the long drop (`0 22px 70px 4px` at 30%). Light uses `0 28px 70px` at 14% plus a 10% ring.
- **Motion.** 140ms for hover and press, 200ms for opening, 250ms for larger moves, on an ease-out
  curve; panels slide with a soft spring (`cubic-bezier(0.25, 1, 0.5, 1)`). Nothing bounces.
- **Spacing.** A 4px unit. Usual gaps:
  - 4–8px inside rows and between chips;
  - 12px inside boxes and between thread steps;
  - 16px panel padding;
  - 32px between settings groups.
- **Layout.**
  - A 240px side panel on the sunken colour, then the work area. Every panel starts with a 40px
    title bar (breadcrumb on the left, quiet icon buttons on the right).
  - The agent view splits into the thread (composer at the bottom) and a file or diff pane.
  - Tables sit inside a hairline box with 8px corners.
  - Settings read in a 42rem column; public pages in a 72–84rem one.
- **Density.** 1 by default, already compact. For dense tables set `--m-density: 0.875`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-3)`. The exact
scales are in the reference at the end.

## Type

- **Families.** Inter (variable) for the UI: it stands in for the system face the reference draws
  its app in. Geist for display titles on public pages and page titles (`@fontsource-variable/geist`),
  standing in for the reference site's own grotesque. Load `@fontsource-variable/inter`.
- **Mono.** JetBrains Mono (`@fontsource-variable/jetbrains-mono`) for code, diffs, branch names,
  commands and error codes.
- **Sizes:**
  - 11px for tags and key hints;
  - 12px for meta: ages, counts, group labels, table headers, breadcrumbs, tabs;
  - 13px for UI and reading in the app: side panel, rows, buttons, menus, thread text;
  - 14px for public-page body text;
  - 18px for figures in a totals box;
  - 22px for page titles and plan names, regular weight, tracked −1.5%;
  - 36px and 52px display titles on public pages, regular weight, tracked −2%, line height 1.2.
- **Weight.** 400 almost everywhere; 500 for card titles and a few labels. Never bold a title.
- **Case.** Sentence case, including group labels. No uppercase labels.
- **Figures.** Tabular figures for counts, diffs, times and prices.

## Icons

- Lucide, outlined, **1.25px stroke**: thin, as the reference's own line icons. 16px in the side
  panel and beside text, 14px in buttons and rows, 32–40px in empty states and error pages.
- Icons are grey (the text colour or muted); colour only in status dots and diff counts.
- **State marks** in task rows: a ring of short strokes (working), a 6px blue dot (unread), a 6px grey
  dot (idle), a circled check (finished).
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `arrow-down-to-line`, upload `arrow-up-from-line`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up` (in a round button), refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Bars** are narrow with 2px corners. Two series stack green under amber (the agent's share and
  the rest), as the reference's split session bars. Plain hairline gridlines, 12px muted labels, a
  legend of 6px dots above the chart on the right.
- **Split bars** in tables: a 4px pill, amber then green, on the grey track.
- **More series** step through green, amber, blue, rose, violet and cyan.
- Figures sit in a totals box split by hairlines: a 12px muted label over an 18px figure.

## States (every control)

- **Hover.** One grey step: rows and ghost buttons go to `#1f1f1f`–`#222222` in dark (`#e9e8e3` in
  light); secondary buttons from `#232323` to `#2a2a2a`; the primary dims a step (`#d4d4d4`).
- **Focus.** A 2px ring 1px outside the control: the link blue `#81a1c1` in dark, the site's orange
  (`#d84500`) in light. Keyboard focus only; never remove it.
- **Pressed.** One step past hover.
- **Selected and current.** A grey step (`#2a2a2a` in dark) with 6px corners, the text unchanged.
- **Disabled.** Half opacity. Say why nearby.
- **Error.**
  - The control's edge turns red.
  - The message replaces the hint under the field, in red 12px, and says how to fix it.
- **Loading.**
  - A button keeps its label; `aria-busy="true"` shows a small grey spinner.
  - A working task shows the stroke ring; a running tool call shows "Running" and its time.
  - Lists show skeleton rows at row height; never a spinner over a whole page.

## Components

All 36 of the library's components, as Flint draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, the 240px side panel beside the work area (no gap);
- `m-container`, 72rem for overviews, 42rem for settings and documents, 28rem for forms;
- `m-grid`, for boxes and plans: 12px gaps, 14rem columns;
- `m-stack` and `m-cluster`, for everything inside: 12px and 8px by default.

**Actions and forms**
- **Button.** A 6px rectangle, 13px at regular weight, 28px by default (24px `sm`, 36px `lg`).
  - **Primary:** inverted (light grey on dark, near-black on light), one per view.
  - **Secondary** (the default): a grey step with a hairline.
  - **Ghost:** text only, for bar actions and Cancel.
  - **Danger:** solid red with near-black text in dark, white in light; only to confirm.
  - **Icon-only:** a 24px ghost square with an `aria-label`.
  - Chips under the composer and every button on public pages are full pills.
- **Input, textarea.** 28px, 6px corners, a faint fill a step off the panel, a 3:1 edge that turns
  blue (dark) or orange (light) on focus. Placeholders in subtle grey.
- **Select.** The same box with a small chevron; in settings rows it's `sm` and sized to its value.
- **Field.** The label above at 13px regular, the control, then the hint or error at 12px.
- **Checkbox, radio.** 14px, 3px corners on the checkbox, inverted when checked.
- **Switch.** A small 32×18 track, grey when off, **green** when on, a white knob. Applies at once.

**Navigation**
- **Sidebar.** 240px on the sunken colour with a hairline on its right.
  - Top: the workspace as a ghost button with a small mark, then search and hide-panel icons.
  - Rows are 28px, 13px at regular weight, a 16px icon, 6px corners; the current one is a grey step.
  - Group labels are 12px muted, sentence case. Counts and key hints are muted text on the right.
  - The person's name and a settings icon sit at the bottom.
- **Navbar** (public pages). 52px on the page colour, no line; 14px links in the text colour; "Log
  in" as a ghost pill and the main action as an inverted pill.
- **Tabs.**
  - **Pill:** panel and file tabs: 12px muted text with a 14px icon; the current one on a grey chip
    with 6px corners. On public pages a pill track holds a raised pill (the billing toggle).
  - **Underline:** a 1px line in the text colour, for content tabs.
- **Breadcrumb.** 12px muted parts with "›" between, the current part in the text colour. Used in
  title bars and above a file.
- **Pagination.** "Prev", the page as "1 / 3", "Next": small bordered buttons, the current page
  muted text.

**Data and content**
- **Table.** Inside a hairline box with 8px corners:
  - 12px muted headers in sentence case, no fill;
  - 13px rows split by hairlines, about 36px tall; hover is one grey step;
  - names in the text colour, the rest muted; diff counts in green and red; status as a 6px dot and
    a word.
- **Card.** The surface colour, a hairline, 8px corners, no shadow. Titles 13px at 500. Totals boxes
  split their cells with hairlines.
- **Badge.** Small rectangles: 18px, 4px corners, 11px at 500, a tint of the tone ("Allowed",
  "Failing"). Mode chips in the composer are tinted pills (amber for a planning mode).
- **Avatar.** Round, 20px in rows, 24px in the side panel; muted initials on a grey step.
- **Divider.** A 1px hairline.
- **Accordion.** Hairline-separated questions at 14px regular, no fill, a chevron on the right.
- **Code, kbd.** Code in JetBrains Mono at 12px on the darkest step with a hairline and 6px corners,
  in the app's syntax hues (teal keywords, pink strings, peach functions in dark). Inline code on a
  grey step with 4px corners. Keys are faint grey squares at 11px in the UI face, muted text.
- **Prose.** 13px with a 1.55 line height, at most 40rem, links in the link colour without an
  underline.
- **Progress.** A 4px bar: green on a grey step.
- **Meter.** The same bar; amber, then red, past its marks.
- **Usage.** A 13px label and amount over a 4px green bar, with a 12px footer line.

**Feedback and overlays**
- **Alert.** A tinted box in the tone with a hairline in the tone, 8px corners, no side stripe; a
  16px icon, a 500 title and the body at 13px.
- **Toast.** Bottom right, raised, a hairline, 8px corners, the menu shadow. A 13px title, one line
  of detail, one action ("Retry now", "Undo"). Errors stay until dismissed.
- **Dialog.** Raised, a hairline, 10px corners, the long drop over a 50% black scrim. Title 14px at
  500; actions bottom right with their keys ("esc", "⌘↵"), the primary last.
- **Popover and menu.** Raised, a hairline, 8px corners, 4px padding; 26px rows at 13px with 4px
  corners; keys on the right in muted text; 12px muted group labels; hairline separators.
- **Tooltip.** Raised grey with a hairline, 12px text, 6px corners, the key beside the label. After
  400ms.
- **Spinner.** A thin 1.5px grey ring. Inside buttons and small areas only.
- **Skeleton.** Grey bars at text and row height, a slow soft shimmer that stops under reduced
  motion.

**AI and chat**
- **Chat.**
  - The person's message sits in a box a step up from the panel, a hairline, 8px corners.
  - The agent's turns are plain 13px text on the panel; no bubble and no avatar.
  - Under a turn: thumbs, copy and the age in 11px muted text.
- **Composer.** A box with 12px corners and a 3:1 edge: the input at 13px ("Send a follow-up"); a
  "+" for context, a tinted mode chip, the model name and speed in muted text with a chevron, a
  spacer, then a round inverted send button with `arrow-up`. Below it, the branch and where the
  task runs, in 12px muted text.
- **Thinking.** "Thought" in the text colour and the time in muted ("Thought 6s"), 13px, expands.
- **Tool call.** Most steps are one quiet line: a verb in the text colour and its object in muted
  ("Read delivery/retry.ts", "Searched policy.delay"). Commands get a box: a 14px icon, "Ran" and the
  command in mono, a status tag and the time, then the output in a code block.
- **Citation.** A small grey chip with a number; the source in a raised popover.
- **Files changed.** A box listing changed files with their icons and green/red counts, "Review" on
  the right of its header.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns red and the message replaces the hint. Validate on blur and on
  submit, not while someone is typing.
- **In a form or dialog:** a danger box at the top saying how many fields need fixing and that nothing
  was saved ("The schedule wasn't saved."). Each field shows its own message.
- **In a run:** the failed command's box turns red with its output, and the agent says in one line
  what failed, what it will do next, and that nothing was pushed.
- **Somewhere else:** a toast that says what failed and what happened to the work ("The task is
  queued and will start when the connection is back.") with one action.
- **A whole page:** centred in the panel.
  - A 32px thin icon in subtle grey, the code in small mono, a 14px medium title, one sentence, one
    or two small buttons.
  - **404:** "Nothing at this address", with a way to the inbox.
  - **500:** "Lathe hit an error" and "Your tasks are safe", with Try again.
  - **403:** "This repository is private" with Request access.
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.** The app frame: a 40px title bar with a range button and an inverted Refresh; a
  22px regular title and one muted line; a totals box split by hairlines; a two-tone bar chart in a
  box; a boxed table of open changes (diff counts, check dots, split review bars), then "Showing 1–6
  of 14" and Prev / Next.
- **List and detail.** The agent workspace: tasks grouped by repository in the side panel with state
  marks; the thread (the person's message in a box, "Thought 6s", quiet tool steps, a command box,
  a files-changed box, pill chips) with the composer at the bottom; beside it the changed file with
  tabs, a breadcrumb, Undo and an inverted Keep, and green and red diff lines.
- **Onboarding.** One narrow step: a three-segment step bar, a 22px title, one muted line, a boxed
  checklist of repositories, one wide inverted Continue with its key, a ghost Skip.
- **Settings.** A settings side panel with a back link and one group label; a 42rem column with a
  22px title, then muted group labels above 12px-cornered boxes of rows (title and muted line left;
  green switch, select, input or small button right).
- **Empty state.** Centred in the panel: a 40px thin icon, a 14px medium heading, one muted line,
  an inverted action and a secondary, and key hints below.
- **Pricing.** The public site in light: a 52px bar with pill actions, a 52px regular title, a pill
  billing toggle, four plan boxes (4px corners, 22px name, 36px price, full-width pills, the
  recommended one inverted with an orange-tinted tag), a note on taxes, a comparison table and
  questions.
- **Errors.** The field, dialog, run, toast and full-page errors above, as one page.

## Words

- Short and plain, sentence case: "New task", "Send a follow-up", "Open pull request".
- Agent steps start with a past-tense verb: "Read", "Searched", "Ran", "Thought".
- Times short and relative: "12m", "3h", "1d".

## Do and don't

| Do | Don't |
| --- | --- |
| Separate surfaces by one neutral grey step and a hairline | Tint dark surfaces blue or warm, or lift boxes with shadows |
| Keep UI text at 12–13px and titles at regular weight | Set rows at 16px or bold the titles |
| Invert the one primary action | Make buttons orange; the orange is for the mark and highlights |
| Show changes as green and red counts and diff lines | Show diffs or status by colour with no number or word |
| Keep agent steps as quiet one-line rows | Box every tool step or give the agent an avatar and bubble |
| Show the key beside an action | Hide actions without a shortcut |
| Keep dark the default and light for public pages | Design light first and invert it |
