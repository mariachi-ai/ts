# Zephyr

Category: bold and fast. High contrast and quick: pure black screens with cool charcoal cards (white
with cool greys in light), a neon lime for gains, brand panels and the primary pill, an orange-red
for losses, loud solid pills, thin live line charts, solid price chips with black figures, and
hairline rows. Dark is its home. For trading, investing and money apps that should feel alive.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `zephyr` preset of `@mariachi/design` (`data-theme="zephyr"`,
`themes/zephyr.css`). Design dark first (`data-mode="dark"`); light is the same system on white.

## Principles

- **Black, then one loud colour.** The screen is pure black and cards are charcoal. Colour means
  something: lime (green on white) is a gain or the action that matters, orange-red is a loss or an
  error. Never use either for decoration.
- **The number is the hero.** Balances and prices are large, regular weight and tabular, never bold.
  The chart under them is one thin line in the day's tone, with nothing else drawn.
- **Fast to act.** Actions are big solid pills you can't miss: the accent for the one that matters,
  the solid ink pill (white on black, black on white) for the rest, an outline for chips.
- **Flat and ruled.** No shadows in dark. Rows are split by hairlines; cards are charcoal blocks with
  no border.

## Foundations

| What | Dark | Light |
| --- | --- | --- |
| Canvas | black `#000000` | white `#ffffff` |
| Cards, raised, wells | `#1e2225`, `#282b30`, `#16181b` | white with a `#e3e9ed` hairline; wells `#f5f8fa` |
| Text: default, muted, subtle | `#ffffff`, `#9ba3a9`, `#8a9196` | `#000000`, `#6a7278`, `#6f777d` |
| Hairlines | `#333438`; lighter `#26292d` | `#e3e9ed`; lighter `#f5f8fa` |
| Accent (primary pill, checked, links) | lime `#ccff00` with black text | green `#00a004` with black text; links `#007a03` |
| Brand (panels, the plan card, the band) | lime `#ccff00`, ink text `#110e08` | the same |
| Gain | lime `#ccff00` | green `#00c805`, text `#007a03` |
| Loss and error | orange-red `#ff5000` | `#ff5000`, text `#b33800` |
| Solid pill (secondary) | white with black text | black with white text |
| Focus | blue `#007ff5` | the same |

- **Radius.** 4px for inputs, selects, chips, badges and alerts; 8px for menus and toasts; cards 12px
  in dark (the app) and 4px in light (the web panel); 20px for marketing plan cards; 24px for
  dialogs. Every button is a pill.
- **Shadow.** None in dark: cards are flat charcoal. In light, panels take a hairline and a soft
  double shadow, `0 -12px 24px` at 2% above and `0 12px 24px` at 6% below.
- **Motion.** 150, 200 and 300 ms, easing out. The chart's last point carries a dot; nothing
  bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 12px between cards and in rows (the reference's gutter);
  - 16–20px inside cards and panels;
  - 32px between page sections, 48px between the main column and the panel.
- **Layout.**
  - A 64px top bar: the mark and name, a search field on the well colour, ink links.
  - A main column beside a 330px panel on its right (positions and lists, or the order ticket).
  - Content to about 76rem (1216px); forms in a 28rem (448px) column; settings rows to 44rem.
  - On a phone the panel drops below the main column.
- **Density.** 1 by default. For a dense trading screen, set `--m-density: 0.85` on the page.
- **Mode.** Dark is the default. A trading app may follow the market: light while the market is
  open, dark after hours; or follow the system.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The brand lime
is `var(--m-color-brand-default)` with `var(--m-color-brand-fg)` text. The exact scales are in the
reference at the end.

## Type

- **Families.** Albert Sans for everything in the product, at 400 for text and 500 for headings;
  600 and 700 for labels and emphasis. Newsreader, a sharp text serif, for marketing headlines only
  (`--m-font-family-serif`). Roboto Mono for order IDs and codes.
- **Sizes:**
  - body 15px with a 1.53 line height; secondary text, labels and table headers 13px;
  - row values 15px; panel titles 18px bold;
  - section titles 24px at 500;
  - balances, prices and page titles 32px at **400**, tight leading;
  - error and onboarding titles 32–44px regular; marketing serif headlines 44px.
- **Tracking.** Slightly tight everywhere (−0.007em text, −0.01em headings). Timeframe labels are
  uppercase 13px bold, tracked 0.15em.
- **Figures.** Always `font-variant-numeric: tabular-nums`. A change reads mark, amount, percentage,
  period: "▲ $1,204.18 (1.45%) Today", with the period in ink.

## Icons

- Lucide, outlined, **1.75px stroke**: 16px beside text, 18px in icon buttons and the top bar, 22px
  for back and close in a flow, 30px in an empty state's ring. Never coloured, except the accent on
  the mark and a verified check.
- Up and down are small filled triangles in the tone, before the amount; never colour alone.
- Filter is three sliders in a round outline button; add is a plus in a circle.
- **The same icon for the same action, every time:**
  - add `circle-plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis`, close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** a 2px line in the day's tone (`--m-color-success-solid` up,
  `--m-color-danger-solid` down), over a dotted baseline at the open in the subtle grey. No fill, no
  gridlines, no axes; a dot on the last point. Under it, the timeframe chips.
- **Sparklines** in rows are the same line at 1.5px, 80 × 28.
- **Candles** (dense tools) are lime and orange-red bodies on the well colour.
- **More series** step through gain, loss, violet, blue, gold and grey.
- The crosshair's readout replaces the balance above the chart while scrubbing.

## States (every control)

- **Hover.** Pills deepen one step (lime `#ccff00` to `#b8e600`; white to `#e6e6e6`); outline pills and
  rows take the card or well fill; links turn to the accent. No lift, no shadow.
- **Focus.** A 2px blue ring (`#007ff5`, `--m-color-border-focus`) outside the control, on keyboard
  focus only. Inputs also take a blue border. Never remove it.
- **Pressed.** One step darker than hover. Nothing moves.
- **Disabled.** Half opacity. Say nearby why an order can't be placed.
- **Error.**
  - The control's border turns orange-red.
  - The message replaces the help text under the field, in orange-red 13px, with the fix and the
    limit in figures.
- **Loading.**
  - A pill keeps its width; `aria-busy="true"` swaps the label for a small spinner in the accent.
  - Prices and rows show charcoal skeleton bars at text height; never a spinner over the page.
- **Selected and current.** The current timeframe is a solid accent chip with black text; the current
  tab has a 2px ink line; the current nav link and side item are in the accent text.

## Components

All 36 of the library's components, as Zephyr draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: about 76rem, or 42rem for settings and 28rem for forms;
- `m-split`, the main column beside the 330px panel (put the panel first with `order: 2`);
- `m-grid`, for cards and key figures: 12px gaps;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 32px apart.

**Actions and forms**
- **Button.** Always a pill, 600, 15px; 44px by default, 36px (`sm`) in bars, 48px (`lg`) at the end of a
  flow.
  - **Primary:** solid accent (lime in dark, green in light) with black text. One per view: Review
    order, Continue.
  - **Secondary:** the solid ink pill, white in dark and black in light. The everyday action (Trade,
    Open an account).
  - **Ghost:** an outline pill with a hairline, for chips, filters and quiet actions. Drop the border
    for a plain text action (Cancel).
  - **Danger:** solid orange-red with black text, only to confirm something destructive.
  - **Icon-only:** a round outline button with an `aria-label`.
  - On the brand lime, the secondary pill turns ink with lime text.
- **Input, textarea.** 36px, 4px radius, 13px text, 12px inset, a grey control border; focus is a
  blue border and ring. Figures right-aligned and tabular. Flows use the 48px `lg` size. The search
  field sits on the well colour with no visible border.
- **Select.** The same box as an input with a chevron; in the order ticket it is 9rem wide, right of
  its label.
- **Field.** The label above in 13px ink, the control, then help or the error in 13px. Fields stack
  20px apart; short pairs (city, ZIP) may share a row.
- **Checkbox, radio.** 18px; the checkbox has 4px corners; the accent when checked.
- **Switch.** The phone switch, 51 × 31: the accent track when on, the control grey when off, a white
  knob (black on the lime). It applies at once.

**Navigation**
- **Navbar.** 64px, the canvas colour, no rule under it and no shadow. The mark and name on the left (the mark in the
  accent), a search field, then bold 14px ink links that turn to the accent on hover and when current, and
  round icon buttons. Marketing pages put an accent outline "Sign in" and an accent pill on the right.
- **Sidebar.** Used for settings lists and the positions panel: no fill, bold 15px group titles, 15px
  rows that take the well fill on hover; the current item in the accent text, bold.
- **Tabs.**
  - **Underline:** bold 13px, muted, the current one in ink over a 2px ink line on a hairline; for
    timeframes, uppercase and tracked.
  - **Pill** (the timeframe chips): no track, 4px chips; the labels in the accent text, the current
    chip a solid accent with black text (set `--m-tabs-active-fg` and `--m-tabs-pill-active-bg` as
    the recipes do).
- **Breadcrumb.** Muted links with "›", the current page bold. Inside the app prefer a back chevron.
- **Pagination.** Round 600 numbers; the current one the solid ink pill. Long lists prefer "Show
  more" in the accent text.

**Data and content**
- **Table.** No frame and no header fill. Headers bold 13px ink; rows 15px, 12px padding, split by
  hairlines, the well fill on hover. A row leads with the symbol (600) over the name (13px muted);
  figures right-aligned and tabular; the price and the day's change in the tone, the change with its
  triangle.
- **Card.** Charcoal (`#1e2225`) on black with no border and no shadow, 12px radius, 20px padding;
  in light, the web panel: white, 4px radius, a hairline and the soft panel shadow. The brand card is lime with ink text.
  Plan cards on marketing pages are 20px radius with a hairline outline.
- **Badge.** 4px corners, 13px 600, no border. The price chip is the solid badge in `success` or
  `danger`: lime or orange-red with black figures, at least 84px wide in a list. Neutral badges are
  grey.
- **Avatar.** Round initials on the raised grey; list icons sit in 8px rounded squares, one on the
  brand lime.
- **Divider.** A hairline, `#333438` on black.
- **Accordion.** Hairline rows, the question at 21px regular, the chevron at the right, no fills,
  muted answers.
- **Code, kbd.** Roboto Mono on the well colour, 8px blocks and 4px inline; keys with 4px corners.
- **Prose.** 15px with a 1.53 line height, to 42rem; links in the accent text, underlined.
- **Progress.** A 2–4px rounded line: the accent on the well colour. Onboarding draws it across the
  top of the screen.
- **Meter.** The same line; orange-red past the high mark.
- **Usage.** A label and figure over a 4px line in the accent, amber when close, orange-red over.

**Feedback and overlays**
- **Alert.** A tinted panel in the tone's wash with 4px corners, no border and no stripe: an 18px
  icon, a bold 13px title, one line of body. A danger alert says what didn't happen ("No money has
  moved").
- **Toast** (the snackbar). The solid ink pill colour (white in dark, black in light), 8px corners,
  bold title, one line of detail and one accent pill action. Bottom centre on a phone, bottom right
  on desktop. Errors stay until dismissed.
- **Dialog.** The raised charcoal, 24px corners, 32px padding, a 24px title; actions full width and
  stacked on a phone (accent pill on top, a plain text Cancel under it), right-aligned on desktop.
- **Popover and menu.** Raised charcoal, 8px corners, 8px inset; 40px rows with 4px corners that
  lighten on hover; hairlines between groups; a destructive item in orange-red at the end.
- **Tooltip.** The inverse colour (white in dark), 4px corners, 13px, no arrow.
- **Spinner.** A thin ring in the accent, 0.8s; inside pills and small areas only.
- **Skeleton.** Charcoal bars with 4px corners at text and figure sizes, a slow 1.2s shimmer that
  stops under reduced motion.

**AI and chat**
- **Chat** (support). The person's messages on the brand lime with ink text, right-aligned; the
  agent's on charcoal, left, with a round avatar. 12px corners. Times and "reviewing your case" lines
  muted and centred.
- **Composer.** A charcoal pill-ended box (24px corners) with a blue focus border; send is a round
  accent button with the `send` icon.
- **Thinking.** A muted line ("Checking your order…") with a soft pulse.
- **Tool call.** A hairline row with 8px corners, the tool name and a 4px status badge.
- **Citation.** A small grey chip with 4px corners and a number; the source on hover in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns orange-red and the message replaces the help text: what's wrong,
  the limit, and the fix ("Instant deposits are limited to $1,000 a day. Enter $1,000.00 or less.").
  Validate on blur and on submit.
- **In a form:** a danger alert above the fields saying what did not happen ("Transfer not started.
  No money has moved."). Focus moves to it.
- **Somewhere else:** a snackbar with what happened and one action ("Your limit order didn't fill ·
  Edit order").
- **A whole page:** set left in the content column, not centred.
  - The code as a 32px figure, a 44px regular title, one sentence in ink, one accent pill and maybe
    an outline one.
  - **404:** "Page not found" with Go to Home.
  - **500:** "Something broke on our end", saying nothing in the account changed, with Try again.
  - **403:** what isn't turned on yet and how to get it, with the action to apply.
- **Words.** Plain and direct: what happened, whether money moved, what to do. No codes in sentences,
  no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - The account name and the balance in 32px regular, the day's change, the line chart and the
    timeframe chips over a hairline.
  - A hairline row for cash available, then the allocation card, three mover cards with chips, and a
    brand-lime upsell panel.
  - On the right, the positions panel: symbol and shares, a sparkline and a price chip per row; then
    lists.
- **List and detail.**
  - A curated list: a 32px title, a verified line, a description, the count with a round filter
    button, then a hairline table.
  - A company page: name and price large, the change and the overnight change, the chart, underline
    timeframe tabs, "About" and key figures in a four-column grid; the order ticket on the right with
    an accent "Review order".
- **Onboarding.** A thin accent progress line across the top, back and close icons, one question as a
  32px regular heading, large fields, and a full-width accent pill with a lock line under it.
- **Settings.** A settings list beside grouped rows of a bold title, one line of help and a switch or
  a value with a chevron. Close account comes last as an orange-red pill.
- **Empty state.** A 30px outlined icon in a 72px hairline ring, a 24px heading, one sentence, the
  accent pill and an outline pill.
- **Pricing.**
  - A serif headline on black, two plan cards: the free one outlined, the paid one on the brand lime
    with an ink pill.
  - A hairline comparison table, a hairline FAQ, and a lime band at the end.
- **Errors.** The field, form, snackbar and whole-page errors above, as one page.

## Words

- Short, direct, sentence case: "Review order", "Move money", "Cash available to trade".
- Figures exact and tabular; changes with a sign mark and the period ("Today", "Overnight").

## Do and don't

| Do | Don't |
| --- | --- |
| Put the number first, large and regular weight | Bold balances or prices |
| Draw one thin line in the day's tone | Fill the area, add gridlines, or use more than one colour for one series |
| Use lime (green on white) for gains and the one action | Use lime for decoration, or red-pink for losses |
| Make every button a solid or outline pill | Square buttons or low-contrast grey buttons |
| Keep dark cards flat charcoal | Add borders or drop shadows to cards on black |
| Put black figures on lime and orange-red chips | Put white text on lime or orange |
| Split rows with hairlines | Zebra stripes or boxed rows |
