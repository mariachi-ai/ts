# Summit

Category: bold and fast. Sporty and loud: warm near-black text on a cool off-white, white cards with
4px corners and a long faint shadow, one signature orange for the brand, routes, achievements and the
current item, a burnt orange for every action, bold compact type, and stats rows of big figures with
small units. The dark mode is a warm near-black. For fitness, training and sports apps that should
feel fast, competitive and social.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `summit` preset of `@mariachi/design` (`data-theme="summit"`,
`themes/summit.css`).

## Principles

- **Numbers first.** A session is its stats: distance, pace, time, elevation. Show them as a row of
  big figures with the unit small beside them and a small grey label above or below, split by
  hairline rules. Everything else is supporting text.
- **Two oranges, two jobs.** The signature orange (`color.brand.default`, `#fc5200`) is for the brand
  and for things that are drawn: route lines, the bar beside the current item, the line under the
  current link, achievement tiles, chart series one. The burnt orange (`color.accent.default`,
  `#c94100`) is for things you press and read: buttons, links, counts. White text never sits on the
  signature orange.
- **Warm greys, quiet chrome.** Text and chrome are warm near-black and grey (`#21211f`, `#43423f`,
  `#64635e`). Cards are plain white with 4px corners; the page is a cool off-white. Nothing is
  decorated; energy comes from the orange, the figures and bold headings.
- **Competitive and social.** Every session can earn achievements (a medal for a personal record, a
  crown for the top of a board) and gather props and comments. Boards are tables with the rank, the
  athlete and the time, the current athlete's row tinted.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Screen (canvas) | cool off-white `#f7f7fa` | warm near-black `#141413` |
| Cards (surface) | white `#ffffff`, raised `#ffffff` | `#21211f`, raised `#2e2e2b` |
| Quiet fill (table headers, social buttons, wells) | `#f2f2f0` | `#2e2e2b` |
| Slab (sticky bars, tooltips, toasts) | `#21211f` | `#f2f2f0` |
| Text: default, muted, subtle | `#21211f`, `#43423f`, `#64635e` | `#fafafa`, `#c2c1bb`, `#a8a6a0` |
| Hairlines | `#e0e0de`, quieter `#f2f2f0` | `#43423f`, `#2e2e2b` |
| Control borders | `#918e89` | `#918e89` |
| Signature orange (brand: routes, bars, achievements) | `#fc5200`, pale `#fedccc` | the same, pale `#321000` |
| Action orange (buttons, links) | `#c94100`, hover `#a63600`, pressed `#973100`; text `#c94100` | the same fill; text `#fc7433` |
| Focus | blue `#0060d0` | `#669fe2` |
| Success | green `#437c16` fill, `#2f6e2f` text on `#e9f5e9` | `#8cd850` text |
| Warning | yellow `#ffc700` fill (dark text), `#8a5409` text on `#fdf5e9` | `#ffd233` text |
| Danger | red `#df2626` fill, `#b52b27` text on `#fae8e8` | `#ef7575` text |
| Info | teal `#0d6e72` fill, `#175d72` text on `#d4ecf3` | `#73d4d8` text |

- **Radius.** 2px for tags inside tables and checkboxes, 4px for buttons, inputs, cards, menus,
  tables and tooltips, 8px for dialogs and the segmented control. Marketing plan cards and their
  buttons use 16px. Avatars are round; crew avatars are 4px squares.
- **Shadow.** Cards take a long, faint shadow (`0 8px 24px` at 4%) and a warm `#f2f2f0` hairline. The
  top bar has a 1px drop. Menus lift with a short two-layer shadow; dialogs with a long navy-tinted
  one. Dark mode uses 1px light rings instead.
- **Motion.** 150 ms with plain `ease` for hovers, menus and dialogs (dialogs scale up from 90%).
  Giving props plays a 660 ms pop. Nothing else moves.
- **Spacing.** A 4px unit. The usual gaps are:
  - 4–8px inside a cluster of icon buttons;
  - 12px between feed cards;
  - 24px card padding (the feed entry's inset), 16px in narrow columns;
  - 24px between columns, 32–64px between page sections.
- **Layout.**
  - A 56px white top bar across the page, with content to 76–78rem (the reference's 1248px).
  - The dashboard is three columns: the athlete (about 16rem), the feed (twice that), challenges.
  - Activity and settings pages put a 11–14rem white column with a hairline frame at the left.
  - Forms sit in a 30rem column.
- **Density.** 1 by default. For dense tables, set `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-brand-default)`, `var(--m-space-4)`. The exact
scales are in the reference at the end.

## Type

- **Families.** Instrument Sans throughout: regular (400) for text, semibold (600) for names, labels
  and buttons, bold (700) for headings and plan prices, extra bold (800) for the wordmark and the
  404. Compact, never light.
- **Mono.** JetBrains Mono, only for codes and file names.
- **Sizes** (the reference's ramp):
  - UI text 14px with a 1.3 line height; labels and meta 12px; tiny capitals 11px;
  - body and table text 14–16px;
  - feed titles and card headings 20px at 700; page titles 24–32px at 700;
  - stats: 20–24px in feeds, 32px in an activity header, with the unit at 60% and regular weight;
  - marketing headlines 48–64px at 700 with a 1.1 line height.
- **Case.** Title-like sentence case for headings and buttons. Small grey capitals, tracked 4%, label
  table headers in marketing tables, section headings in side columns and steps ("STEP 2 OF 4"). Plan
  names are capitals tracked 8%.
- **Figures.** Use `font-variant-numeric: tabular-nums`. Times are `1:47:41` or `2h 41m`; paces are
  `4:52 /km`; units sit small after the figure (`64.8 km`), never in a separate column.

## Icons

- Lucide, outlined, **1.5px stroke**, rounded ends: 16px beside text and in meta lines, 18–20px in
  buttons and navigation, 28px in sport tiles. Never filled.
- Sport icons (footprints for a run, a bike for a ride, waves for a swim) prefix the date line of
  every session.
- Achievements: `medal` for a personal record and `crown` for first place in yellow (`warning.solid`),
  `trophy` in grey for other placings.
- The props button is `thumbs-up`, beside `message-circle` and `share-2`, each in a square button on
  the quiet fill.
- The top bar ends with `bell` (an orange count pill), the avatar with a chevron, and `circle-plus` in
  orange for upload and record.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis`, close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Maps** are the main chart. Draw a placeholder from tokens: the quiet fill for land, the success
  and info washes for parks and water, hairline roads, the route as a 3–4px signature-orange line
  with round joins, a green start dot. Never embed a real map image in a recipe.
- **Elevation** is a filled area in the hairline grey with small grey axis labels; the selected
  segment's slice is the pale orange with an orange top line.
- **The week** is seven small bars: days with a session in the signature orange, rest days as a 2px
  grey stub. No axis, single-letter day labels.
- **Categories** step through orange, teal, blue, violet, yellow and pink (the reference's extended
  palette).
- **Zones** (heart rate, power) are horizontal bars in one hue from pale to deep, with the label,
  range, time and percentage in table columns beside them.

## States (every control)

- **Hover.** Buttons step one shade: the action orange from `#c94100` to `#a63600`, white buttons to
  `#e6e6e6`, ghost buttons take an orange wash. Links and top-bar links turn orange. Table rows take
  `#fafafa`. Cards gain a hairline and a slightly deeper shadow; they don't move.
- **Focus.** A 2px blue ring (`#0060d0`) outside the control, on keyboard focus only. Inputs also
  darken their border. Never remove it.
- **Pressed.** One more step darker, with a short inset shadow.
- **Disabled.** 65% opacity, no hover, a not-allowed cursor.
- **Error.**
  - The control's border turns red.
  - The message sits under the field in red 14px and says how to fix it.
- **Loading.**
  - A button keeps its label and width; `aria-busy="true"` swaps in the small spinner.
  - Feeds show skeleton cards at feed-entry height; the spinner is a dark 2px ring, 1.2s a turn.
- **Selected and current.** The current top-bar link has a 2px signature-orange line at the bottom
  edge of the bar; the current side-column item is near-black and semibold with a 3px orange bar on
  its left; the current tab is near-black over a 2px orange line; a selected table row gets the
  quiet fill and the orange bar; the current athlete's board row is tinted pale orange.

## Components

All 36 of the library's components, as Summit draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 78rem, or 48rem for single-purpose pages and 30rem for forms;
- `m-split`, the 11–15rem side column beside the main one;
- `m-grid`, for columns and cards: 16–24px gaps;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 4px corners, 14px at 600, 40px by default, 32px small, 44px large.
  - **Primary:** the action orange with white text; one per view ("Save", "Start free trial").
  - **Secondary** (the default): white with a `#e0e0de` hairline and near-black text ("Join",
    "Compare efforts").
  - **Ghost:** orange text only, an orange wash on hover ("See every challenge").
  - **Danger:** solid red, only to confirm something destructive.
  - **Icon-only:** square, with an `aria-label`; social buttons sit on the quiet fill.
- **Input, textarea.** 44px, 4px corners, white, a `#918e89` border, 14px text, placeholders in
  `#64635e`. The border darkens on hover and focus; the blue ring shows on keyboard focus.
- **Select.** The same box with a chevron; small selects (32px) filter feeds and boards.
- **Field.** The label above in 14px semibold, 8px gap, the control, then a hint (14px grey) or the
  error (14px red) below. Units go in a select beside the number, not inside the label.
- **Checkbox, radio.** 18px with a `#918e89` border; the checkbox has 2px corners; both fill orange
  when checked.
- **Switch.** 44 × 26px: grey track, orange when on, a white knob. It applies at once.

**Navigation**
- **Navbar** (the top bar). White, 56px, a hairline and a 1px drop at the bottom.
  - The wordmark (heavy capitals in the signature orange) and a search icon at the left.
  - 14px near-black links; the current one has a 2px signature-orange line at the bottom edge of
    the bar (set `box-shadow: inset 0 -2px 0 var(--m-color-brand-default)` on it); some open menus
    and carry a small chevron.
  - At the right: a text link to the membership, the bell with an orange count pill, the avatar
    with a chevron, and the orange `circle-plus`.
- **Sidebar** (the activity page's and settings' left column). White with a hairline frame and 4px
  corners. Items are 14px grey with optional 16px icons, rows of about 40px; the current one is
  near-black, semibold, with a 3px signature-orange bar on its left. Section headings are 11px grey
  capitals. Counts are orange pills with white figures.
  - In settings and in board filter lists, the current item is instead filled with the action
    orange and white text: set `background: var(--m-color-accent-default)`,
    `color: var(--m-color-accent-fg)` and `box-shadow: none` on it.
- **Tabs.**
  - **Underline:** 14px at 600, grey; the current one near-black over a 2px orange line, on a 2px
    `#e0e0de` rule.
  - **Pill** (the segmented control): a warm grey track with 8px corners and a white knob, for
    choices like Yearly and Monthly, or map styles.
- **Breadcrumb.** Near-black links separated by `›`, the current page in grey. Used in help and
  settings pages; in the app prefer a back chevron.
- **Pagination.** Square 4px buttons with a hairline; the current one is the action orange with
  white figures. Feeds load more on scroll instead.

**Data and content**
- **Table.**
  - White in a 4px frame with no outer border.
  - The header row is the quiet fill with 12px semibold labels in sentence case; on marketing pages,
    tiny grey capitals on white instead.
  - Rows are 14px, split by warm hairlines, `#fafafa` on hover. Numbers are tabular and right-aligned
    with small units.
  - Boards: rank (a yellow crown for first), a small round avatar and the name, the time. The
    current athlete's row is pale orange and bold.
- **Card.** White, 4px corners, a `#f2f2f0` hairline and the long faint shadow, 24px padding. Titles
  are 20px bold. Feed entries are cards with an avatar header, a bold title, the stats row, a map
  inset by the card's padding, an achievements list, then the props row under a hairline.
- **Badge.** 4px corners, 12px semibold, sentence case: grey for tags ("Gravel"), orange solid for
  "New" and member tags, the tone washes for status.
- **Avatar.** Round, initials at 600 on the hairline grey: 32px small, 48px in feeds, 64px in headers
  (with a 2px orange ring on the athlete's own card). Crews and clubs use 4px squares. Face piles
  overlap by 8px with a white ring.
- **Divider.** A warm hairline (`#f2f2f0` inside cards, `#e0e0de` between sections). Stats rows use
  vertical hairlines between figures.
- **Accordion.** Questions in a white box with a hairline and 4px corners, rows split by hairlines,
  16px semibold, a chevron at the end, the answer in grey.
- **Code, kbd.** JetBrains Mono on the quiet fill, 2px corners inline, 4px for blocks and keys.
- **Prose.** 16px with a 1.5 line height for long text, at most 42rem wide, links in orange without
  an underline.
- **Progress.** A rounded bar on the hairline grey: orange (the action orange in light, the
  signature orange in dark). Challenges show one under the name with the figure below.
- **Meter.** The same bar: green with room, yellow near the limit, red over it.
- **Usage.** A label and amount over a meter bar, the amount in tabular figures.

**Feedback and overlays**
- **Alert.**
  - A pale wash of the tone, 4px corners, no border and no side stripe, 12px padding.
  - A 20px status icon, a semibold title and the body in 14px.
- **Toast.**
  - The near-black slab with 4px corners, a bold white title, light grey detail and one orange
    action. It reads the same whatever the tone; the words carry it.
  - The marketing pages' sticky bottom bar is the same slab, full width.
- **Dialog.**
  - White, 8px corners, the long shadow over a 70% black scrim, 24px padding.
  - The title is 24px bold; a square hairline close button sits top right.
  - Actions at the bottom: the primary orange, Cancel as a white button.
- **Popover and menu.**
  - White, 4px corners, a hairline border and the short shadow, 4px inner padding.
  - Items are 36px rows at 14px that highlight in `#e0e0de` with 4px corners; a destructive item is
    red.
- **Tooltip.** The near-black slab with 12px white text and 4px corners, no arrow.
- **Spinner.** A 2px dark ring with a faded track, 1.2s a turn.
- **Skeleton.** `#f2f2f0` blocks at feed-entry and row sizes, pulsing gently; still under reduced
  motion.

**AI and chat**
- **Chat** (coach messages and comments).
  - The coach's messages on the quiet fill with 8px corners.
  - The person's own messages in the action orange with white text, on the right.
  - Names semibold, times 12px grey.
- **Composer.** A white box with 4px corners and the control border that darkens while typing; send
  is a small orange button with the `send` icon.
- **Thinking.** A grey line ("Reading your last six weeks…") with a soft pulse.
- **Tool call.** A row in a 4px-cornered box with a 16px icon, the name and a small 4px status badge.
- **Citation.** A small 4px chip on the quiet fill with a number; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message sits under it: what's wrong and the fix, with
  an example ("Enter a distance above 0, for example 8.2"). Check on blur and on save, never while
  someone types.
- **In a form:** a red notice at the top: what needs fixing and what didn't happen ("Nothing is saved
  yet"). Focus moves to it.
- **Somewhere else:** a near-black banner that says what happened and what it means for the data
  ("Your watch file is safe on this device"), with one orange action ("Retry now").
- **A whole page:**
  - **Not found** is a white card split in two: a token-drawn dead-end route on the quiet fill, then
    a huge orange "404", a bold line with a wink ("Wrong turn. This trail doesn't go anywhere.") and
    a short list of ways out as orange links.
  - **Failure (500)** and **no access (403)** are white cards: a 28px icon in a 56px circle of the
    tone's wash, "ERROR 500" in tiny capitals, a 24px bold title, one or two sentences and one or two
    buttons.
- **Words.** Sporty but plain. Say whether the session or data is safe, say what to do next, and keep
  the wink to the title. No codes in sentences, no blame.

## Page shapes (recipes)

- **Dashboard.**
  - The white top bar with the orange line under the current link.
  - Three columns on the off-white screen: the athlete card (avatar with an orange ring, name,
    three counts, the latest session) and the week (a stats row, seven bars, the weekly goal); the
    feed (a small select to choose whose sessions, then feed entries with stats rows, maps,
    achievements and props); challenges with progress bars, a small board and crews to join.
- **List and detail.** The activity page.
  - The left column of sections with an orange bar on the current one and a count, then edit and
    more buttons.
  - A header card: a grey title bar ("Name – Ride" with counts), then the athlete, date, title and
    tags beside the big stats row and a second, smaller row.
  - The map and elevation profile, then the segments table with the open one marked by the orange
    bar and its detail below: this effort, actions, and the top-ten board.
- **Onboarding.** One white card at 30rem under a centred wordmark: a step label and bar, a bold
  question, sport tiles (round, filling pale orange with an orange ring when picked), one goal
  field with a unit select, a checkbox, a full-width orange button.
- **Settings.** The settings column (the current item filled orange), a profile card of rows with
  a small grey label over a semibold value and a pencil button, visibility radios and switches,
  deleting the account last, and a narrow side column with the account (plan and an orange Upgrade)
  and linked devices.
- **Empty state.** Underline tabs, then one card: a token-drawn dashed route, a bold title, one
  sentence and an orange and a white button.
- **Pricing.**
  - A dark band (`data-mode="dark"`) with an orange glow from the top left, a bold headline, and a
    segmented Yearly and Monthly switch.
  - Three plan cards with 16px corners: a small solid tag, the plan name in tracked capitals, a big
    price with a small period, the billing line and a full-width button. The picked plan is light
    (`data-mode="light"` inside the band) with the orange button.
  - A comparison card with tiny capital headers, an icon per feature, near-black ticks for free and
    orange ticks for members; questions in an accordion; the near-black bar with the trial button
    (sticky to the bottom of the window in a real page).
- **Errors.** The field, form, banner and full-page errors above, as one page.

## Words

- Sporty, short and direct, in the second person: "Give props", "Plan a route", "Compare efforts",
  "See the full board".
- Appreciation is **props** ("18 gave props"). Wins are concrete: "2 personal records", "Local
  leader on Kestrel Hill Climb".
- Dates are short ("Today at 6:42 AM", "Yesterday"); figures are exact with units.

## Do and don't

| Do | Don't |
| --- | --- |
| Lead with a stats row of big figures and small units | Bury the numbers in sentences |
| Use the signature orange for routes, bars, lines and wins | Put white text on the signature orange |
| Use the burnt action orange for buttons, links and counts | Use the signature orange for small text or button fills |
| Keep cards white with 4px corners on the off-white screen | Round cards into pills, or use heavy shadows |
| Mark the current item with an orange line or bar (an orange fill in settings and filters) | Mark it with a grey or tinted block |
| Make headings bold and compact | Use light or thin weights |
| Draw maps from tokens as placeholders | Embed real map tiles or photos in a recipe |
| Use the blue only for focus | Use blue for actions or links |
