# Volt

Category: bold and fast. Loud, quick and sure of itself: black and white with one electric green,
black pill buttons with grey pill secondaries, white 20px cards on a light grey screen, big
headlines in a tight grotesk at regular weight, amounts in bold, and line icons with a heavy
stroke. In dark mode the screen goes pure black and the action turns green. For payment, wallet
and money apps that should feel fast and confident.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the nine page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `volt` preset of `@mariachi/design` (`data-theme="volt"`,
`themes/volt.css`).

## Principles

- **Loud colour, used once.** The electric green (`--m-color-brand-default`) is the brand: the
  money keypad, the recommended plan, the wordmark, progress, rings, chart bars and counts.
  Everything else is black, white and grey. Never tint a whole screen grey-green or use a second
  bright colour beside it.
- **Black means do it.** Inside the app the action is a black pill with white text. Secondary
  actions are grey pills. In dark mode the action becomes the green pill with black text.
- **Big and plain.** Headlines are large, regular weight (400) and set tight (−3%). Amounts are
  bold (700) and just as tight. Labels and titles are medium (500). Nothing is decorated: no
  gradients, no borders on cards, no shadows on the page.
- **Cards on grey.** The screen is a light grey (`#f0f0f0`); content sits on white cards with 20px
  corners. Rows inside a card are separated by hairlines. In dark mode the screen is black and the
  cards a near-black grey.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Brand green (keypad, picked plan, bars, rings, counts) | `#00e013` with black text | the same |
| Screen (canvas) | light grey `#f0f0f0` | black `#000000` |
| Cards (surface, raised) | white `#ffffff` | `#1a1a1a`, raised `#262626` |
| Grey panels inside cards (sunken) | `#f0f0f0` | `#232323` |
| Grey pill (secondary buttons, the chosen segment) | `#e8e8e8`, hover `#dedede` | `#333333`, hover `#3d3d3d` |
| Text: default, muted, subtle | `#000000`, `#5c5c5c`, `#6b6b6b` | `#ffffff`, `#b3b3b3`, `#999999` |
| Hairlines | `#e5e5e5` | `#333333` |
| Control borders | `#808080` | `#7a7a7a` |
| Action (primary buttons, checks, switches) | black `#000000`, hover `#262626` | green `#00e013`, hover `#00ca11`, with black text |
| Links and the focus ring | green `#0b7300` (links), `#128a00` (focus) | green `#00e013` |
| Money in, success | green text `#00711f`; the brand green as a fill | `#00e013` |
| Errors and destructive | red `#d50511` | text `#ff8a8f`, fill `#e5141f` |
| Warning | yellow `#ffcc00` fill, `#7a5200` text | `#ffd84d` text |
| Information | blue `#0a5cb8` text, `#0a6fd6` fill | `#7cb8ff` text |

- **Radius.** 8px for small chips and the help centre's row cards, 12px for inputs, selects and choice tiles, 16px for notices and
  menus, 20px for cards, toasts and the table, 28px for dialogs and 32px for the big marketing
  tiles. Buttons, chips, badges, nav items and segments are pills; icon tiles and avatars are
  circles.
- **Shadow.** None on the page: cards are white on grey with no border and no shadow. The only
  shadows on a page are the public help centre's bar and footer (`0 2px 4px` at 6%). Floating things (menus,
  dialogs, a toast) take a soft, wide lift. In dark mode, a 1px light ring instead.
- **Motion.** 200, 300 and 450 ms on a quick-out curve (`cubic-bezier(0, 0.45, 0.25, 1)`). Things
  slide and fade; nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px between pills in a group;
  - 12px between an icon and its text; rows are about 70px tall (12px above and below a title and
    a line of help) with a 40px circle; the help centre's one-line rows are 57px;
  - 16px between cards;
  - 20px card padding, 32px for a large card;
  - 32–64px between page sections.
- **Layout.**
  - A 240px white side column, then the grey screen.
  - Content to 76rem (1216px), with a gutter of `clamp(1rem, 2.75vw, 2.5rem)`.
  - Forms in a 28rem (448px) column; settings and single-purpose pages in 46rem.
  - Cards gap 16px.
- **Density.** 1 by default. For dense screens, set `--m-density: 0.8`: 48px controls become 38px.

Use tokens, never colour literals: `var(--m-color-brand-default)`, `var(--m-space-4)`. The exact
scales are in the reference at the end.

## Type

- **Families.** Inter Tight throughout: a tight, neutral grotesk. Three weights only: regular
  (400) for text and for big headlines, medium (500) for titles, labels, buttons and badges, bold
  (700) for amounts, keypad digits and the words a help step tells you to press. Never 600. Never
  set a headline bold; never set an amount light.
- **Mono.** Geist Mono, only for references and codes.
- **Sizes:** page shapes keep to 12 / 14 / 16 / 24 / 32 / 40 / 56px (20px appears only in the empty
  state's sentence and in components, such as the accordion's default question), and one screen uses four to six of them
  (four on most):
  - body 16px with a 1.5 line height; help and secondary lines 14px; badges and chart labels 12px;
  - card titles 16px at 500; section titles 24px at 500;
  - page titles 40px at 400, tracked −3%, line height 1.05; the public help centre's titles 32px
    at 500;
  - marketing headlines 56px at 400;
  - amounts 24, 40 or 56px at 700, tracked −3%; the keypad's amount about 88px at 700, its digits
    24px at 700.
  - Avatar initials sit on the ramp: 12px small, 14px in rows, 24px large.
- **Case.** Sentence case everywhere. Only badges are capitals (12px, 500, tracked 4%).
- **Figures.** Use `font-variant-numeric: tabular-nums`. Amounts are written in full with the
  currency sign and cents at the same size: `$2,184.50`. Money in is green with a plus
  (`+$410.00`); money out is plain black with no minus.

## Icons

- Lucide, outlined, **2px stroke**, rounded ends: 20px beside text and in navigation, 18px inside
  buttons, 16px inside small buttons. Never filled.
- Row icons sit in a 40px circle: grey (`--m-color-bg-sunken`) for most rows, ink (black with a
  white icon) or the brand green for emphasis. People are round initials avatars in the same spot.
  Big moments (empty states, errors) use an 80–112px circle.
- Chevrons (`chevron-right`) end rows that open something; switches end rows that toggle.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (in a round grey button), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up` (in a round black button), refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Bars** in the brand green with 4px top corners; days with nothing are short grey stubs. The
  scale sits on the right in 12px muted figures, over faint hairline gridlines. A Week / Month /
  Quarter segmented control sits under the chart.
- **Lines** (prices, balances) are a single 2.5px green line with no fill, no axis and no dots.
- **Goals** are a ring: a 5px green arc on a grey track with an icon in the middle.
- **More series** step through green, ink, blue, purple, orange and grey.

## States (every control)

- **Hover.** Fills step one shade: black to `#262626`, the grey pill from `#e8e8e8` to `#dedede`.
  Input borders darken. Rows take the grey fill. Cards don't move.
- **Focus.** A 2px green ring outside the control, on keyboard focus only; inputs also draw a 2px
  black (white in dark) border, like a chosen tile. Never remove it.
- **Pressed.** One more step (`#3d3d3d`, `#d4d4d4`). Nothing moves.
- **Disabled.** Half opacity, no hover. Say why nearby when it matters.
- **Error.**
  - The control's border turns red.
  - The message replaces the help text under the field, in red 14px, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a small spinner and blocks
    clicks.
  - Lists and cards show grey skeleton blocks at row height, never a whole-page spinner.
- **Selected and current.** The current nav item and the chosen segment sit on the grey pill in
  medium black. A chosen tile takes a 2px black border. Checked controls and switches fill black
  (green in dark). A chosen filter chip is a black pill.

## Components

The library's components, as Volt draws them; the five newest, at the end of this section, are not drawn for Volt yet. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 76rem, or 46rem for settings and 28rem for forms;
- `m-split`, the 240px side column beside the main one;
- `m-grid`, for cards: 16px gaps; 15rem columns for small cards, 21–22rem for main cards;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** Always a pill, 16px at 500, 48px by default, 36px (`sm`) inside cards and bars and
  56px (`lg`) for the one action on a form.
  - **Primary:** black with white text (green with black text in dark); one per view, or a pair of
    equal black pills side by side ("Add funds", "Cash out").
  - **Secondary** (the default): the grey pill with black text and no border.
  - **Ghost:** black text only; filter chips that aren't chosen take a 1px grey outline.
  - **Danger:** solid red, only to confirm something destructive. A destructive row in settings is
    red ghost text.
  - **Icon-only:** a round grey pill with an `aria-label` (scan, notifications, close, more).
  - On the green brand colour, the primary is black with green text and the secondary a black
    outline: set `--m-button-primary-bg: var(--m-color-brand-fg)` and
    `--m-button-primary-fg: var(--m-color-brand-default)`.
- **Input, textarea.** 48px, 12px corners, white, a grey control border that darkens on hover and
  turns into a 2px black line on focus, 16px text. Search fields are white pills
  (`--m-input-radius: 9999px`) with the search icon inside. Amount fields may use 24px bold text.
- **Select.** The same box with a chevron.
- **Field.** The label above in 14px medium black, 8px gap, the control, then the help text (14px
  muted) or the error (14px red) below.
- **Choice tiles.** For a short list of options, use 12px-cornered tiles in a grid with an icon
  and a medium label; the chosen one takes a 2px black border. Radios hide inside them.
- **Checkbox, radio.** 20px. The checkbox has 6px corners; both fill black (green in dark) when
  checked.
- **Switch.** 52 × 32px: grey when off, black when on (green in dark), a white knob with a soft
  shadow. It takes effect at once: no Save.

**Navigation**
- **Sidebar.** 240px, white, no edge line.
  - Top: the wordmark (a green rounded square with a black mark, then the name in medium), then a
    grey panel with the balance in bold.
  - Items are 16px with a 20px icon, black, as pills; the current one sits on the grey pill in
    medium. A second group (Settings, Support) sits apart. Counts are green pills with black
    figures.
- **Navbar** (public pages). Two kinds:
  - **Marketing:** no fill, 84px, the wordmark, 14px medium pill links, and two pill actions at
    the right: a green one ("Join →") and a black one ("Log in").
  - **Help centre:** white with the faint bar shadow, the wordmark, then at the right a black pill
    ("Join →") and a grey pill ("Log in"); no links.
- **Top bar** (in the app). A white pill search field at the left; round grey icon buttons and one
  black pill ("Send") at the right.
- **Tabs.**
  - **Underline:** 16px medium grey; the current one black with a 2px black line over a hairline.
  - **Pill** (the segmented control): no track; the chosen segment sits on the grey pill. Use it
    for periods (Week, Month, Quarter) and themes.
  - **Filter chips:** a row of small pills, the chosen one black, the rest outlined.
- **Breadcrumb.** Muted links separated by `›`, the current page in medium black. In the app,
  prefer a back arrow in a round grey button.
- **Pagination.** Round numbers; the current one a black circle with white figures. In lists,
  prefer a "See all" link and loading more on scroll.

**Data and content**
- **Table.**
  - In a white card with 20px corners and no outer border.
  - Headers 14px medium grey in sentence case, over a hairline.
  - Rows are separated by hairlines and take a light grey on hover. Long tables may add
    `data-striped`.
  - Figures right-aligned in tabular numbers. Plan comparisons use a black `check` for yes and a
    grey dash for no.
- **Card.** White, 20px corners, no border and no shadow on the grey screen, 20px padding. Titles
  are 16px at 500, not headings. The outlined variant (marketing pages, plans not picked) has a 1px
  grey line on white. The brand card is the green with black text.
- **Badge.** A pill, 12px capitals at 500: green wash for good news ("RECEIVED"), yellow for
  waiting ("REQUEST"), red for problems, grey for neutral. On green, a black badge with green text.
- **Avatar.** Round initials at 500: the brand green with black by default, ink (black with white)
  or blue with white for variety. 28px small, 40px in rows, 64px in headers; the initials at 12, 14
  and 24px.
- **Divider.** A hairline. In cards, rows are separated by hairlines that start after the icon.
- **Accordion.** The site's questions: a hairline between items, the question large (20px) and
  regular in grey, a small chevron at the end, no hover fill. On public pages, drop the outer edges
  (`border-width: 0`, so only the hairlines between questions remain) and set the questions at 32px
  (`--m-accordion-summary-size: var(--m-font-size-2xl)`).
- **Code, kbd.** Geist Mono on the grey fill, 6px corners inline, 12px for blocks.
- **Prose.** 16px with a 1.5 line height, at most 42rem wide, links in green and underlined. On
  the public help centre, text is muted and links are ink, medium and underlined.
- **Progress.** An 8px pill bar: green on the grey track (the deeper `#128a00` in light mode, for
  contrast).
- **Meter.** The same bar: green with room left, yellow when low, red when over.
- **Usage.** A label and amount over a meter bar, the amount in tabular figures.

**Feedback and overlays**
- **Alert** (a notice).
  - A flat wash of the tone, 16px corners, no border and no side stripe.
  - A 20px status icon, a medium title and the body in 16px.
  - Error notices sit above the form and say what didn't happen ("Nothing was sent").
- **Toast.**
  - The phone's notification card: white (raised grey in dark), 20px corners, a soft lift, a 40px
    round icon at the start, a medium title, muted detail and one small black pill.
  - It's white whatever the tone; the icon and the words carry the tone.
  - Only for news from somewhere else (money arrived while you were on another screen). A failure
    on the screen in front of you is a notice in the page, so no page shape floats a toast.
- **Dialog.**
  - The bottom sheet, centred on the desktop: white, 28px corners, a soft lift over a 40% black
    scrim, 24px padding.
  - The title is 24px at 500.
  - Actions are full-width pills at the bottom: the primary black, Cancel grey.
- **Popover and menu.**
  - White, 16px corners, a hairline edge and a soft lift, 8px inner padding.
  - Items are 44px rows at 16px with 10px corners, highlighting in light grey; a destructive item
    is red.
- **Tooltip.** A black chip with white 14px medium text and 8px corners, no arrow.
- **Spinner.** A black ring (white in dark) turning every 0.8s, inside buttons and small areas
  only.
- **Skeleton.** Grey `#e8e8e8` blocks at row and figure sizes, pulsing gently; still under reduced
  motion.

**AI and chat**
- **Chat** (the money assistant).
  - The person's messages in a grey bubble with 20px corners, on the right.
  - Replies as plain text on the page, with no bubble; figures inside them in bold, and charts or
    amounts set as on any other screen.
  - Times are 12px muted.
- **Composer.** A white pill box ("I want to…") with 28px corners and a grey control border that
  turns black while typing. Send is a round black button with the `arrow-up` icon.
- **Thinking.** A muted line ("Thinking…") with a soft pulse. **Tool call:** a row in a
  16px-cornered box with a 16px icon, the name, and a pill status badge.
- **Citation.** A small grey pill with a number, and the source in a popover.
- **Usage**, as above.
- **Row, chip, icon tile, amount and drop zone** (`m-row`, `m-chip`, `m-tile`, `m-amount`,
  `m-dropzone`): newer than this language and not drawn for it yet. Until they are, use them with
  Volt's tokens and the library defaults, and where a pattern above already describes rows,
  chips, tiles or money figures, follow the pattern.

## Error handling

- **In a field:** the border turns red and the message replaces the help text: what's wrong and the
  fix, with an example ("No one has that handle. Did you mean @theowright?"). Check on blur and on
  submit, never while someone types.
- **In a form:** a red notice above the form: how many things to fix, and that nothing was sent.
  Focus moves to it.
- **Something that failed on this screen** (a payment that didn't go): a red notice in the page,
  under the form, that says what happened and where the money is ("The money is still in your
  balance"), with one small grey pill ("Retry").
- **A whole page:**
  - **Not found** sits centred on the screen with no card: a 32px title at 500, one muted line,
    and one black pill back. The public site's and the help centre's not-found pages are the same
    three parts.
  - **Failure (500)** and **no access (403)** are white cards side by side: a 32px icon in a 64px
    circle (ink or grey), the code in small mono, a 24px title at 500, one sentence and one grey
    pill.
- **Words.** Say whether money moved, say what to do next, and keep it short. A little attitude is
  fine ("This page took the money and ran"); blame, codes in sentences and exclamation marks are
  not.

## Page shapes (recipes)

### The two families

| | The app (dashboard, list and detail, settings, empty state, errors; onboarding and sign-in before it) | Public pages (pricing, reading) |
| --- | --- | --- |
| Ground | The light grey screen (`#f0f0f0`) with white cards; onboarding and sign-in are white | White; the help centre puts its related rows and contact cards on a grey band under the article |
| Header | A 240px white side column (wordmark, the balance in a grey panel, pill nav items) and a top bar: a white pill search at the left, round grey icon buttons and the black "Send" pill at the right. Onboarding and sign-in: the wordmark and one grey pill | Marketing: no fill, 84px, pill links, a green and a black pill. Help centre: white with the faint bar shadow, a black and a grey pill, no links |
| Column | 76rem; settings, empty state and errors 46rem; onboarding and sign-in 28rem | Marketing 76rem; the help centre 46rem |
| Titles | 40px at 400; section titles 24px at 500; amounts bold at 24, 40 or 56px; the keypad's 88px | Marketing 56px at 400; the help centre 32px at 500, for both "Support" and the article |
| Actions | Black pills (green in dark), grey pills for the rest; an equal pair of black pills for money in and out | Marketing: green and black pills; plan buttons 48px pills. Help centre: black and grey pills |
| Footer | None | Marketing: a black band with outlined 32px-cornered stat tiles. Help centre: white with the faint shadow, the wordmark and underlined medium links |
| On a phone | The side column stacks above; cards stack in reading order; full-width pills stay full width | Plan cards and contact cards stack; the bars keep their two pills |

### Signature moves

1. **Black pill, white card, grey screen.** Every app action is a pill; the one that matters is
   black (green in dark); cards are white 20px panels with no edge and no shadow on `#f0f0f0`.
2. **Big, tight, regular headlines and bold amounts.** Page titles 40px at 400 tracked −3%; money
   at 700 in tabular figures, the keypad's amount at 88px.
3. **One bright colour, the electric green:** the keypad, the picked plan, bars, rings, the
   wordmark, the progress bar, counts. Never body text, never every button.
4. **Round icons in rows.** A 40px grey circle (ink or green for emphasis) or round initials, a
   medium title over a 14px line, the amount or a chevron at the end, a hairline between rows.
5. **Three weights, few sizes:** 400, 500 and 700; four to six sizes a screen.
6. **Flat:** no shadow on app content; panels are set apart by white on grey.

### How a screen is assembled

- **It opens with** the side column and the top bar, then the page title at 40px (on a first run:
  the wordmark, the step and a 40px question on white).
- **Reading order:** the title, then the money (a balance, an amount, a receipt) with its pills,
  then rows grouped in white cards under 24px section titles, then smaller cards.
- **How much one screen does:** one job, with one black pill, or an equal pair for money in and
  out. The top bar's "Send" is always there.
- **When narrow:** the side column stacks above; two-column grids fold to one; pills that were full
  width stay full width.
- **Too much content:** rows group by day or topic under section titles, each group its own white
  card; "See all" instead of pages of results.
- **None:** the frame stays (column, bar, title); a white card holds a 112px green circle, a 32px
  regular title, one sentence, a black pill and a grey pill.

### The recipes

- **Dashboard.**
  - A big regular title.
  - The balance card (title, the amount at 40px bold, account details, two equal black pills, a
    row for deposits under a hairline) beside the green keypad (the 88px amount, bold 24px digits,
    a black outline pill and a black pill).
  - Recent activity in a white card with round avatars; spending bars with 12px labels and the
    period switch.
  - A "Growing" row of small cards: a goal with a ring, stocks with a sparkline, offers as round
    icons with their discount.
- **List and detail.**
  - The title and a row of filter chips.
  - Payments grouped under medium headings, each group a white card of rows; the open row takes the
    grey fill.
  - The receipt beside it: round close and more buttons, the person large, the amount at 56px
    (green if money in), a status badge, a black pill and a grey pill, "What happened" steps and
    "What you can do" rows.
- **Onboarding.** On white, in a 28rem column: the wordmark and a grey "Log in" pill on top, the
  step and a green progress bar, a 40px regular question, choice tiles, one field, a full-width
  large black pill and a ghost "Back". One question a step.
- **Settings.** The profile centred (big green avatar, name, handle, two grey pills), then titled
  groups of rows in white cards with grey round icons, a theme segmented control, and grey "Sign
  out" with red "Close account" at the end.
- **Empty state.** A white card: a 112px green circle with a black icon, a 32px regular title, one
  sentence, a black pill and a grey pill.
- **Pricing.**
  - The bare marketing bar with a green and a black pill.
  - A 56px regular headline beside a 16px intro.
  - Three plan cards: two outlined, the recommended one in the brand green with a black badge and a
    black pill; plan names 24px at 500, the price bold at 40px.
  - A side-by-side table on a grey panel, big grey questions split by hairlines, and a black footer
    band with outlined 32px-cornered stat tiles and a green "Join today" tile.
- **Errors** (in the app). A 40px title, a red notice above the form, the form's card with red
  field errors, a red notice in the page for a payment that failed (with a grey "Retry"), not found
  centred on the grey screen, and the 500 and 403 cards side by side.
- **Reading** (the public help centre). The help bar; "Support" at 32px and a grey pill search;
  the article title at 32px, muted 16px text, numbered steps in small grey circles with the words
  to press in bold, an underlined ink link; then on the grey band "Related" as 57px rows in a white
  8px-cornered card (a file icon, a medium title, a chevron) and two contact cards; the white
  footer.
- **Sign-in.** As onboarding: on white, a 40px regular "Welcome back", one line, one field, a
  full-width large black pill, then "Other ways in" as rows with grey round icons and chevrons.

## Words

- Short, direct and a little cheeky, in sentence case, in the second person: "Add funds", "Cash
  out", "Pay back", "See all", "Nothing saved up yet".
- Relative dates ("Today", "Monday", "Earlier in June"), money exact to the cent.

## Do and don't

| Do | Don't |
| --- | --- |
| Put white cards on the grey screen, with no border or shadow | Outline cards in the app, or float them on shadows |
| Keep the green for the brand moments: keypad, picked plan, bars, rings | Use the green for every button or as body text on white |
| Make the action a black pill (green in dark) | Use square buttons, or colour the action blue |
| Set headlines big, regular and tight; amounts bold | Set headlines bold, or amounts light |
| Use round icon tiles and round avatars | Square tiles or mixed shapes in one list |
| Show money in green with a plus; money out plain | Use red for money going out |
| Use the same icon for the same action | Mix icon sets, fill icons, or thin their stroke |
