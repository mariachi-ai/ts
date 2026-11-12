# Meridian

Category: dark and sharp. Stark and exact: black and white on one ten-step grey scale, dark mode as
a first-class twin of light, hairline rings instead of fills, 6px corners, dense 14px lists with
10px status dots, monospace for hashes, endpoints and logs, and a restrained blue kept for focus and
links. For developer platforms and admin tools that should feel quiet, technical and fast.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `meridian` preset of `@mariachi/design` (`data-theme="meridian"`,
`themes/meridian.css`).

## Principles

- **Monochrome first.** The interface is greys from one scale. The primary action is the darkest grey
  in light mode and the lightest in dark: there is no brand colour on buttons.
- **Colour means state.** Green, amber, red and blue appear only to say something: a run is ready,
  building, failed, or a link can be followed. Status is a 10px dot beside the state's name, never
  colour alone.
- **Rings, not boxes.** Every surface is the page colour with a 1px hairline. Depth comes from the
  ring; shadows are faint in light and invisible in dark.
- **Dense and exact.** 14px text, 36px controls and rows, tabular figures. Anything a machine made (an
  id, a hash, a URL, a cron line, a log) is set in mono.
- **Both modes are the product.** Every value has a light and a dark twin taken from the same scale
  step. Design and check both.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Content, cards, menus (background-100) | `#ffffff` | `#0a0a0a` |
| Sidebar, wells, card footers (background-200) | `#fafafa` | `#000000` |
| Text: default, muted, subtle | `#171717`, `#4d4d4d`, `#737373` | `#ededed`, `#a1a1a1`, `#8f8f8f` |
| Hairlines | `#ebebeb`; quieter `#f2f2f2` | `#2e2e2e`; `#1f1f1f` |
| Control borders (3:1) | `#8f8f8f` | `#878787` |
| Primary action | `#171717`, white text; hover `#383838` | `#ededed`, `#0a0a0a` text; hover `#cccccc` |
| Grey steps: hover, selected | `#f2f2f2`, `#ebebeb` | `#1a1a1a`, `#1f1f1f` |
| Links and focus | links `#0068d6`; focus ring `#0072f5` | links `#52a8ff`; focus ring `#0072f5` |
| Status dots | ready `#50e3c2`, building `#f5a623`, error `#da2f35`, queued `#8f8f8f` | the same; queued `#878787` |

- **Radius.** 4px for keys and small parts, 6px for buttons, inputs, menu rows and notes, 8px for
  cards and tables, 12px for menus, toasts and dialogs. Badges and marketing calls to action are
  pills; nothing else is.
- **Shadow.** Surfaces are separated by a 1px ring. Cards add `0 1px 2px` at 4% in light. Menus and
  toasts add a three-layer drop at 2–6%; dialogs a long `0 32px 72px -12px` drop. In dark the ring
  does all the work.
- **Motion.** 150ms `cubic-bezier(0.4, 0, 0.2, 1)` for hover and press; 200ms for popovers and 300ms
  for overlays, which scale in from 0.96 with a slight overshoot
  (`cubic-bezier(0.175, 0.885, 0.32, 1.1)`).
- **Spacing.** A 4px unit:
  - 8px inside a control group;
  - 12–16px between fields and list items;
  - 24px card padding and grid gaps;
  - 32–48px between page sections.
- **Layout.**
  - A 256px sidebar on background-200 with a hairline edge; the content on background-100.
  - A 56px breadcrumb bar over the content, with a hairline under it.
  - Pages to 1200px with a 24px margin; settings to 64rem; forms 30rem.
  - Grids gap 24px (16px between job cards).
- **Density.** 1 by default. For log and table screens, set `--m-density: 0.875` on the page: 32px
  controls and tighter rows.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Geist for everything and Geist Mono for machine text, both open (SIL OFL), from
  `@fontsource-variable/geist` and `@fontsource-variable/geist-mono` (or the `geist` package).
- **Sizes:**
  - body and controls 14px with a 20px line;
  - secondary text, labels and log lines 13px;
  - badges and captions 12px;
  - card and section titles 16px at 600; setting titles 20px at 600;
  - page titles 32px at 600, tracked −0.04em;
  - marketing headings and prices 56–64px at 500, tracked −0.06em, line height 1.
- **Weights.** 400 for text, 500 for buttons, tabs that matter and table headers, 600 for headings.
  Never 700 in the product.
- **Tracking.** Headings track in: −0.02em at 14–20px, −0.04em at 24–32px, −0.06em above that. Body
  text is never tracked.
- **Mono.** Geist Mono at 13px for ids (`r_c94d2e0`), commits (`7a1e94c`), endpoints, cron lines,
  keys, request ids and every log line. Times in logs are mono with milliseconds.
- **Case.** Sentence case for headings and buttons. Uppercase only for log levels and error names
  (`NOT_FOUND`) in mono.

## Icons

- Lucide, outlined, **1.5px stroke**, 16px everywhere: navigation, buttons, inputs, lists. 14px
  inline in small text; 20px in an empty state's tile; 40px (at 1.25px) for full-page errors. Icons
  take the text colour; only status icons are coloured.
- Every sidebar item carries a 16px icon before the label. Buttons put an icon before the label only
  when it helps scanning (Rerun, Trigger run); the chevron of a menu button goes after.
- More is a horizontal ellipsis in a ghost icon button. External links end in a small
  `external-link`.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis`, close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `arrow-up`, refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** a 1.5px line or bars in blue (`#0072f5`; `#52a8ff` in dark) on background-100, with
  hairline gridlines at the major ticks only and mono 12px axis labels in the muted grey.
- **More series** step through blue, purple, pink, amber, teal and green (the scales' 700 steps in
  light, 900 steps in dark).
- **Usage** is a 16px ring gauge in blue beside the label, or the usage bar. Tooltips use the menu
  treatment.

## States (every control)

- **Hover.** The primary lightens (`#171717` → `#383838`; dark `#ededed` → `#cccccc`). Secondary and
  ghost buttons, rows and nav items take the grey hover step (`#f2f2f2` / `#1a1a1a`). Input borders
  darken. Nothing lifts or moves.
- **Focus.** A 2px blue ring (`#0072f5`) 2px outside the control, on keyboard focus only. Inputs also
  darken their border. Never remove it.
- **Pressed.** One more step in the same direction as hover. Nothing scales.
- **Disabled.** Half opacity on buttons; inputs take the grey-100 fill. Explain nearby why an action
  is disabled (a settings Save stays disabled until something changes).
- **Error.**
  - The control's border turns red.
  - A red 13px line with a 14px `circle-alert` replaces the help text and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a spinner.
  - Lists and cards show skeleton bars in grey-200 with 5px corners; never a spinner over the page.
  - A running job is an amber dot, not a spinner.
- **Selected and current.** The grey selected step (`#ebebeb` / `#1f1f1f`) with 6px corners for nav
  items and pill tabs; a 2px grey-1000 bar under the current underline tab; checked controls in the
  primary grey, switches in blue.

## Components

All 36 of the library's components, as Meridian draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 1200px, or 64rem for settings and 30rem for forms;
- `m-split`, the 256px sidebar beside the content, and inside pages a side column (a settings list,
  a usage column) beside the main one;
- `m-grid`, for cards: 24px gaps (16px for job cards), 17–18rem columns;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** A rectangle with 6px corners, weight 500 at 14px: 32px (`sm`) in bars, cards and
  footers, 36px by default, 40px (`lg`) for the one action at the end of a flow.
  - **Primary:** grey-1000 with background-100 text (black in light, white in dark). One per view.
  - **Secondary** (the default): background-100 with a hairline ring, default text.
  - **Ghost:** text only; a grey step on hover. For toolbars, nav and "more".
  - **Danger:** solid red (`#da2f35`) with white text, only to confirm a destructive action.
  - **Icon-only:** square, 16px icon, with an `aria-label`. A round one only for the notification
    bell.
  - Marketing calls to action are pills; product buttons never are.
- **Input, textarea.** 36px, 6px corners, background-100, 14px text, 12px padding. The border is the
  3:1 control grey and darkens on hover; focus adds the blue ring. Search inputs carry a 16px icon on
  the left and a key (`/`, `⌘K`) on the right. Machine values (keys, cron lines, paths) are mono.
- **Select.** The same box as an input, with a small chevron. Filters above a list sit in one row
  with a date button and a search.
- **Field.** The label above in 13px muted grey, the control, then the help text or the error in
  13px. Fields stack 20px apart; short pairs (runtime, region) sit side by side.
- **Checkbox, radio.** 16px; the checkbox has 4px corners. Checked is grey-1000 with a
  background-100 mark. Labels are 14px.
- **Switch.** A blue (`#0072f5`) track when on, the control grey when off, a white knob; 40×24, or
  28×14 small. It takes effect at once; say so in the card footer.

**Navigation**
- **Sidebar.** 256px on background-200 with a hairline edge.
  - Top: the workspace switcher (a 24px tile, the name, a plan badge, an up-down chevron), then a
    search box with `⌘K`.
  - Items are 36px rows of 14px muted text with a 16px icon; the current one is default text on the
    grey selected step with 6px corners. Counts sit right in the subtle grey.
  - Account items (Members, Billing, Settings) sit at the bottom behind a hairline.
- **Navbar** (public pages). 64px, background-200 at 80% with a blur, a hairline under it. 14px muted
  links that take a grey pill on hover; on the right, secondary small buttons and one primary.
- **Top bar** (in the app). 56px with a hairline under it: a breadcrumb of the workspace and the page
  (with `/` between) on the left; a status link with a dot, the notification bell and the avatar on
  the right.
- **Tabs.**
  - **Underline:** 14px, 24px apart, muted, with the current one in default text over a 2px grey-1000
    bar on a hairline. For a page's sections.
  - **Pill** (secondary tabs and view switches): 32px chips with 6px corners, the current one on the
    grey selected step; a view switch wraps them in a hairline frame with 3px inside.
- **Breadcrumb.** 14px muted links with a hairline-grey `/` between and the current page in default
  text at 500.
- **Pagination.** Prefer a full-width secondary "Load more" under a list. When pages are needed:
  32px squares with 6px corners, the current one framed by a hairline.

**Data and content**
- **Table.**
  - In a hairline frame with 8px corners on background-100.
  - The header row on background-200, 14px muted at 500, sentence case.
  - Rows 14px, split by hairlines, background-200 on hover (grey-100 in dark), the selected one on
    the grey hover step.
  - Two-line cells: the main value, then 13px muted detail (trigger, duration, commit message).
  - Ids and commits in mono; times right-aligned; a ghost "more" at the end of each row.
- **Card.** Background-100, a hairline ring, 8px corners, 24px padding, a faint drop in light. Titles
  16px at 600. A clickable card's ring darkens on hover. Settings cards end in a background-200
  footer with a hairline above, holding a note on the left and the action on the right.
- **Badge.** A pill, 24px high, 12px at 500:
  - neutral grey-200 ("3 of 5", repository names);
  - tones on their 200 tint with 900 text: blue "Latest", red "Failed", green "Healthy", amber
    "Degraded";
  - solid grey for a count that must stand out.
- **Avatar.** Round, grey-200 with 12px initials at 500; 24px in rows, 32px in bars, 40px on cards. A
  workspace is a 24px tile with 6px corners. Stacks overlap by 10px with a background ring.
- **Divider.** A 1px hairline. Lists and detail sections are split by hairlines, never by gaps alone.
- **Accordion.** Hairline-separated rows, the summary 16px at 500 with a chevron on the right; no
  fills, no frame.
- **Code, kbd.** Inline code is mono 13px on grey-100 with a hairline and 6px corners. Blocks are on
  background-200 with a hairline frame. Keys use the sans face at 12px on background-100 with a
  hairline ring and 4px corners.
- **Prose.** 16px with a 24px line, at most 42rem wide; headings 32, 24 and 20px at 600; links blue
  without underline.
- **Progress.** A 10px bar (4px small) with 6px corners: grey-1000 on grey-200.
- **Meter.** The same bar; green-dot, amber-dot or red as it passes its marks.
- **Usage.** A label and amount over an 8px bar in blue, amber past the warning mark and red over the
  limit; on dashboards, a row with a 16px ring gauge instead.

**Feedback and overlays**
- **Alert** (a note). A hairline box with 6px corners, 8px by 12px padding, a 16px icon and 14px
  text. Tones take the 200 tint, a 400 border and 900 text. A danger note above a form says what was
  not done ("Nothing was saved").
- **Toast.** Bottom right, 420px, background-100 with a ring instead of a border, 12px corners and the
  menu shadow. A 14px title at 500, one line of detail and one secondary action. No coloured stripe.
- **Dialog.** 540px, 12px corners, a ring and the long modal drop over a backdrop of grey-100 (light)
  or black (dark) at 80%. A 24px title at 600 and the body on background-100; the actions sit in a
  background-200 footer with a hairline above: Cancel (secondary) on the left, the action on the
  right.
- **Popover and menu.** Background-100, 12px corners, a ring, 6px inside, 36px rows with 6px corners
  that take the grey hover step. A 16px icon at the row's end when it helps; a destructive item in red
  at the bottom behind a hairline.
- **Tooltip.** Inverted: `#0a0a0a` with light text in light mode, white with dark text in dark. 13px,
  8px corners, a small stem, no shadow.
- **Spinner.** A 2px muted ring; inside buttons and small areas only.
- **Skeleton.** Grey-200 bars with 5px corners and a soft shimmer that stops under reduced motion.

**AI and chat**
- **Chat.**
  - The assistant's messages on the page with no bubble; the person's on grey-100 with 12px corners,
    right-aligned.
  - Avatars 24px, round; metadata 12px muted.
- **Composer.** Background-100 with 12px corners, a 3:1 border that darkens on focus with the blue
  ring, a faint drop. Send is a square primary icon button with `arrow-up`.
- **Thinking.** A 14px muted line with a soft pulse.
- **Tool call.** A hairline row with 6px corners: a 16px icon, the tool's name in mono, its status as
  a pill badge.
- **Citation.** A small grey pill with a number; the source opens in a menu-style popover.
- **Usage**, as above.

## Error handling

- **In a field:** the control's border turns red and a red 13px line with a `circle-alert` icon
  replaces the help text. Validate on blur and on submit, not while typing.
- **In a form:** a danger note at the top of the card: how many things need fixing and what wasn't
  done ("2 fields need fixing. Nothing was saved."). Focus moves to it; each field shows its own
  message.
- **Somewhere else:** a toast with what happened and one action ("invoice-sync failed twice in a row
  · View run").
- **A whole page:** a centred card.
  - A 40px outline icon in the subtle grey, the code and its name in 13px mono (`404 · NOT_FOUND`), a
    24px title, one sentence, one or two buttons, and the request id in mono with a copy button.
  - **404:** "This page can't be found" with a way back to the main page.
  - **500:** "Something went wrong on our side" and "Nothing was changed", with Try again and a
    status link.
  - **403:** "You don't have access to this job" with Request access.
- **Words.** Say what happened, whether anything changed, and what to do. Codes go in mono, never in
  the sentence. No blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - The app shell: sidebar, breadcrumb bar.
  - One toolbar row: a search with `/`, a filter icon button, a grid/list view switch and the primary
    "New job" with a chevron.
  - A 22rem column with a Usage card (ring gauges on alternating background-200 rows) and recent runs
    with dots; beside it, job cards: avatar, name, endpoint in mono, a repository badge, the last
    change and "when on branch".
- **List and detail.**
  - A 32px title with its sentence, secondary and primary actions on the right.
  - Filters in one row (date button, search with `/`, a select, a status button with a count), then
    the runs in a hairline frame and a full-width Load more.
  - A run opens to a back link, its id in mono with a status badge, a details card (label over value
    in a grid, a background-200 footer with the endpoint) and a monospace log with warn and error
    lines on their tints.
- **Onboarding.** On background-200: a 48px heading, the source and steps in a side column, and one
  configuration card with fields, collapsible sections and a full-width large primary button in its
  footer.
- **Settings.** A list of sections beside stacked cards. Each card has a 20px title, a sentence and
  its control, with a note and the Save in a background-200 footer. Deleting the workspace is last,
  in a red-bordered card with a red footer.
- **Empty state.** Under the page's tabs, a dashed hairline frame: a 48px bordered icon tile, a 16px
  title, one sentence, a secondary action and a "Read the guide" link.
- **Pricing.**
  - The public navbar; a 64px heading at 500 tracked −0.06em and a monthly/yearly pill switch.
  - One frame with 2px corners split into three columns by hairlines; the middle one on
    background-100 against background-200.
  - Plan name with a badge, a 56px price at 500, a sentence, a hairline, an icon feature list, and
    pill actions (primary in the middle).
  - A comparison table and questions below.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Short, plain and technical; sentence case everywhere: "Trigger run", "Load more", "Add webhook".
- Name things by their real names (ids, branches, regions), in mono. Times relative in lists ("22m
  ago"), absolute in details ("Nov 11, 14:02").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep the UI in greys; make the primary grey-1000 | Put a brand colour on buttons or headers |
| Separate surfaces with a 1px hairline ring | Use heavy shadows, or fills to separate areas |
| Show state as a dot beside its name | Colour whole rows, or use colour without a word |
| Set ids, hashes, URLs and logs in mono | Set prose or labels in mono |
| Keep blue for focus and links | Use blue for primary buttons or decoration |
| Keep product buttons rectangular with 6px corners | Pill buttons in the app (pills are for badges and marketing) |
| Design light and dark together from the same scale step | Invert colours by hand, or check only one mode |
| Use the same icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
