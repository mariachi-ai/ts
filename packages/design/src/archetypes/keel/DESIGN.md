# Keel

Category: marketplace and commerce. A commerce back office: a near-black frame holds the navigation,
and the work sits on a white page with rounded corners set into it. Type is 13px ink, actions are
pills (the main one ink, slightly raised by an inner glow and a soft drop; the rest flat grey),
containers are 20px cards on a hairline ring shadow, and lists are dense index tables with view
tabs, bulk actions and small bright status badges. For tools where people run a shop every day:
orders, stock, suppliers, customers and money.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `keel` preset of `@mariachi/design` (`data-theme="keel"`, `themes/keel.css`).

## Principles

- **The frame is quiet, the page does the work.** Navigation lives in a near-black frame; the page is
  white. Nothing in the frame competes with the page: grey text, one lit pill for where you are.
- **One ink action per view.** The primary is the only filled ink pill. Everything else is a flat
  grey pill, a white pill on the toolbar ring (page-header actions), or a ghost.
- **Dense, but friendly.** 13px text, 28px buttons, 6px table cells, yet rounded everywhere: pills for
  actions, 10px fields, 20px containers. Fewer boxes: group with space and hairlines first, and use
  a container only for a real unit (a table, a list of items, a payment summary).
- **Status is a badge, not a colour on text.** Each state of an order-like thing is a small badge
  with a pip that shows progress: a hollow ring for not started, a half for under way, a dot for
  done.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Page and containers | white `#ffffff`; quiet panels and table headers `#f7f7f7` | page `#0a0a0a`, containers `#1a1a1a`, raised `#262626` |
| Frame (navigation) | `#0a0a0a` | `#0a0a0a` |
| Text: default, muted, subtle | `#101010`, `#4a4a4a`, `#606060` | `#eeeeee`, `#aaaaaa`, `#8c8c8c` |
| Hairlines | `#dddddd` around things; `#f2f2f2` between rows | `#2f2f2f`; `#262626` |
| Control border | `#8c8c8c` | `#6b6b6b` |
| Primary action | ink `#101010`, white text | white `#fcfcfc`, ink text |
| Grey pill (secondary) | `#ebebeb`, hover `#dddddd`, pressed `#d0d0d0` | `#2f2f2f`, `#373737`, `#414141` |
| Links | blue `#1650d0` | `#c5d0ff` |
| Focus | `#5083f0` | `#97adff` |
| Brand (marketing only) | leaf green `#95bf47` | the same |

- **Status colours** come in pairs: a pale tint for banners and a stronger fill for badges.
  - **Yellow (warning):** banner `#fff5c5`; badge `#ffe45c` with `#574100` text.
  - **Green (success):** banner `#e8fcd9`; badge `#b3f782` with `#214b03`.
  - **Cyan (info):** banner `#d2f6fe`; badge `#8ce1f8` with `#01596f`.
  - **Red (danger):** banner and badge `#ffe7e6` with `#7e100c`; the danger pill is `#d82019`.
  - **Neutral badge:** `#ebebeb` with `#4a4a4a`.
- **Radius.** 6px for badges and tags, 10px for fields and nav items, 12px for the page sheet,
  banners, popovers and code, 20px for containers and dialogs. Every button is a pill.
- **Shadow.**
  - **Containers:** a 2px ring at 24% black, then three very faint long drops. No drawn border.
  - **Page-header buttons and toolbars:** a 1px ring at 7% with long faint drops.
  - **Popovers:** four short stacked drops and a 1px ring; **dialogs** the same, longer.
  - **The ink pill:** a soft four-step drop, an ink rim and a white inner glow, so it looks lit and
    slightly raised. It presses in on click. The grey pill has no shadow at rest and presses in too.
  - In dark mode, rings are white at 9–18% instead.
- **Motion.** 100, 200 and 300 ms; `cubic-bezier(0.25, 0.1, 0.25, 1)` for most things,
  `cubic-bezier(0.2, 0.8, 0, 1)` for things that appear.
- **Spacing.** A 4px unit:
  - 4px between a button's icon and label;
  - 8px between buttons, 12–16px inside a container;
  - 16px between containers; 20–24px between page sections.
- **Layout.**
  - A 224px frame on the left; the page sheet is inset 8px from the frame's edges with 12px
    corners.
  - Inside the sheet: a title bar (back button, breadcrumb, actions) and then the content column, up
    to 62rem; settings and forms 45rem; onboarding 32rem.
  - Detail pages put a 17rem side column on the right.
- **Density.** 1 by default; 0.9 for the densest tables.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Inter (variable, `@fontsource-variable/inter`) for everything, with the stylistic
  features `'calt', 'ss03', 'cv09', 'cv02', 'cv03', 'cv04'` on (set `font-feature-settings` on the app
  root): open digits and a flat-topped 3 and 4, as the reference sets them.
- **Weights.** 400 for text, 500 for headings, labels and buttons, 600 for strong figures and IDs.
  Nothing heavier.
- **Sizes:**
  - body and table text 13px with a 20px line;
  - buttons, badges, table headers and small print 12px;
  - section titles 15px at 500;
  - page titles 22px at 500, detail titles 26px, display headings 29px, all tracked −2%.
- **Mono.** Roboto Mono for codes, small; the reference uses the system mono.
- **Figures.** Tabular figures in tables and metrics; amounts right-aligned.

## Icons

- Lucide, outlined, **2.25 stroke**, which draws 1.5px lines at 16px like the reference's own 16px
  glyphs. 16px in navigation and beside text, 14px in buttons, 12px beside small figures, 20px in
  empty and error states.
- Navigation icons are subtle grey; the current item's icon turns white with its label.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `chevron-left` (in a round white button), forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Series colours,** in order: sky `#1eaeed`, violet `#7853eb`, cobalt `#436dea`, magenta
  `#d453b1`, teal `#25b6b6`, lime `#99b608`, tangerine `#eb872c`.
- **Over time:** a 2px line over a pale fill, with the comparison period dashed in a lighter
  colour. Faint horizontal gridlines, dates underneath in 12px muted.
- **Metric names** carry a dotted underline: hover explains how the number is counted.
- **Changes** sit beside the figure: a small diagonal arrow and the percentage, green when it's good
  news and red when it isn't.
- **Sparklines** in the metrics strip are runs of small rounded bars, the latest ones darker.

## States (every control)

- **Hover.** Fills deepen one step: the grey pill `#ebebeb` → `#dddddd`, rows and menu items take
  `#f7f7f7` or `#f2f2f2`, frame items a faint white. The ink pill keeps its colour.
- **Focus.** A 2px blue ring (`#5083f0`) 1px outside the control, on keyboard focus only. Never
  remove it.
- **Pressed.** Pills press in: an inner shadow from the top and one step darker. Nothing moves.
- **Disabled.** Half opacity; the cursor shows it can't be used. Say why nearby.
- **Error.**
  - The field's border turns red and its fill goes pale pink.
  - The message sits under it, led by the alert icon, in dark red 13px.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a small spinner.
  - Lists and cards show grey skeleton blocks, never a spinner over the page.
- **Selected and current.** Selected table rows take the grey; the current frame item is a lit pill
  with a hairline ring; checked boxes and switches are ink.

## Components

All 36 of the library's components, as Keel draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split` for the frame beside the page sheet, and again for a detail page's right column;
- `m-container`, the content column (62rem, 45rem for settings, 32rem for onboarding);
- `m-grid` for cards, 16px gaps;
- `m-stack` and `m-cluster` for everything inside.

**Actions and forms**
- **Button.** Always a pill, 12px at 500, 28px tall (24px small, 36px large).
  - **Primary:** the ink pill with its inner glow, one per view.
  - **Secondary** (the default): the flat grey pill. In page headers and toolbars use the white pill
    on the toolbar ring instead (Export, More actions).
  - **Ghost:** text only, grey on hover (Back, Skip, Import).
  - **Danger:** the red pill with the same glow, only to confirm something destructive.
  - **Icon-only:** round; give it an `aria-label`.
- **Input, textarea.** 30px, 10px corners, white, a grey control border with a faint drop under it,
  13px text. Focus turns the ring blue.
- **Select.** The same box with a small chevron.
- **Field.** The label above in 13px at 500, the control, then help text in 13px muted, or the error.
  No asterisks: mark optional fields "(optional)" instead.
- **Checkbox, radio.** 16px; the checkbox has 4px corners. Ink when checked, with a white tick or
  dot.
- **Switch.** Small (32 × 18), ink when on. It takes effect at once: no Save.

**Navigation**
- **Sidebar** (the frame). 224px, `#0a0a0a`, with no edge.
  - Top: the mark and a collapse button, then a search field with `⌘K`.
  - Items are 13px rows, 28px tall, with a 16px icon. The current one is a lit pill (white at 11%)
    with a hairline ring; counts are small translucent pills on the right.
  - Group headings are plain 12px grey ("Pinned"). Settings and the shop, with a bell, sit at the
    foot.
- **Navbar** (public pages). The marketing site is dark: the mark, plain links in white, "Sign in"
  and the white pill.
- **Title bar** (in the app). Inside the page sheet: a round white back button, the section's icon
  and a breadcrumb, then the page's actions at the right (white pills, then the ink one).
- **Tabs.**
  - **Index views:** small ghost pills, the current one grey with a chevron for its options, and a
    `+` to add a view.
  - **Underline:** a 2px ink line under the current tab on a `#f2f2f2` rule, for detail pages.
  - **Segmented:** a grey track with a white segment on the ring shadow.
- **Breadcrumb.** 13px muted links with "/" between and the current page in ink; led by the
  section's icon.
- **Pagination.** Two round icon buttons (previous, next) and a count ("1–6 of 214"), centred
  under the table.

**Data and content**
- **Table** (the index table).
  - Inside a 20px container on the ring shadow, edge to edge.
  - A row of view tabs and the search, filter and sort buttons above it.
  - A grey (`#f7f7f7`) header row in 12px muted at 500, sentence case.
  - Rows 13px, `#f2f2f2` hairlines, grey on hover; selected rows stay grey.
  - A checkbox column on the left. When rows are selected, the header shows "2 selected" and the
    bulk actions as white pills.
  - IDs in 600, dates and counts muted, amounts right-aligned, statuses as badges.
- **Card** (container). White, 20px corners, no border, the ring shadow, 16px padding. Titles are
  13px at 500. A summary can continue below a card on a grey band (a payment's method and balance).
- **Badge.** 20px tall, 6px corners, 12px at 500, no border.
  - **Neutral** grey ("Paid" with a dot pip).
  - **Yellow** for waiting ("Awaiting batch", "Deposit due").
  - **Cyan** for under way ("Baking").
  - **Green** for done ("Ready to collect").
  - **Pink** for stopped ("Refunded").
  - Use the solid variant for the yellow, cyan and green fills; neutral and danger use their tints.
- **Avatar.** A rounded square (30% corners), blue with white initials. 24px in rows, 32px in headers.
- **Divider.** A `#f2f2f2` hairline.
- **Accordion.** Hairline rows, 13px questions at 500, a chevron that turns.
- **Code, kbd.** Mono on the grey fill. Keys are small grey chips with 4px corners and no border.
- **Prose.** 13px text with a 20px line, links in blue, headings at 500.
- **Progress.** A 6px rounded bar: ink on grey. A risk meter uses green, yellow and red.
- **Meter.** The same bar, coloured by level.
- **Usage.** A label and amount over a 6px meter.

**Feedback and overlays**
- **Alert** (banner).
  - The tone's pale tint, 12px corners, the container ring, no border or side stripe.
  - A 16px icon, a 13px title at 600, then the body and one white-pill action.
  - A critical banner sits above the form and lists what to fix.
- **Toast.**
  - A dark (`#1b1b1b`) rounded box at the bottom centre, white 13px text, one action.
  - Errors stay until dismissed; confirmations go after 5s.
- **Dialog.** White, 20px corners, the dialog shadow over a 71% black scrim. The title is 15px at
  600; actions at the right, the ink pill last.
- **Popover and menu.**
  - White, 12px corners, the popover shadow, 6px inner padding.
  - Rows 28px with 8px corners, a 16px icon, grey on hover. A destructive item is red, last.
- **Tooltip.** A white card on the popover shadow with 12px text: not a dark chip.
- **Spinner.** A thin ink ring. Inside buttons and small areas only.
- **Skeleton.** Grey blocks at text and thumbnail sizes with a slow shimmer.

**AI and chat**
- **Chat.**
  - The assistant writes on the page with no bubble; the person's messages are grey, 16px corners.
  - The assistant's avatar is a violet rounded square.
- **Composer.** A white pill with a control border and the toolbar ring; send is the round ink
  button.
- **Thinking.** A muted line with a soft pulse. **Tool call:** a hairline box, 12px corners, the
  tool's name and a status badge.
- **Citation.** A small grey chip with a number; the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red, the fill pale pink, and an icon-led message replaces the
  help text. Validate when someone leaves the field and on save, not while they type.
- **In a form:** a critical banner above the form says how many things to fix and lists them. Each
  field shows its own message. Nothing is saved until they're fixed.
- **Somewhere else:** a dark toast says what happened and offers one action ("Couldn't print 3
  slips. The printer is offline. · Retry").
- **Warnings that don't block:** a yellow banner with what will happen and one action.
- **A whole page:** a container centred in the column:
  - a 20px icon on a grey tile, the code in small mono, a 15px heading, one sentence and one or two
    pills;
  - **404:** "There's nothing at this address" with Go to Overview;
  - **500:** "Something went wrong on our side" and "Nothing was saved or sent", with Try again;
  - **403:** "You don't have access to this" and who can add you, with Request access.
- **Words.** Say what happened, whether anything changed, and what to do next. No codes in sentences,
  no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - A greeting and one sentence about what needs doing.
  - Date and comparison as white pills, then a metrics strip: one container split by hairlines, each
    with a dotted name, the figure, the change and a sparkline.
  - Cards: sales over time against last period, batches closing soon with meters, a needs-attention
    list with badges, top sellers as bars.
- **List and detail.**
  - Title bar with Export, More actions and the ink "+ Pre-order".
  - The index table with views, bulk actions and badges; pages underneath.
  - A row opens its own page: the ID large with its badges, a highlighted note, line items, a payment
    summary with a grey footer, and the customer and timeline in the right column.
- **Onboarding.** No frame. A segmented step bar, a 29px question, choice tiles with checkboxes
  (chosen ones ringed in ink), two fields, then Back and Next.
- **Settings.** Grouped links on the left; cards of label-and-value rows with a pencil, selects in a
  grid, switches, and closing the workshop last with the red pill.
- **Empty state.** A two-line display heading (the section in ink, a line under it in grey), one
  sentence, the ink pill and a ghost Import, and a faint outline of what the list will look like.
- **Pricing.** The dark marketing site: a large light heading, a yearly switch in the leaf green,
  four plan cards with green taglines, outlined full-width pills and hairline feature rows, then
  questions.
- **Errors.** The field, form, banner, toast and whole-page errors above, as one page.

## Words

- Sentence case everywhere, short and plain: "Mark as packed", "Print slips", "Move to batch".
- Dates relative when recent ("Today at 9:42", "Yesterday at 18:03"), short otherwise ("Nov 10").
- Counts with their noun ("3 items", "46 of 52 filled").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep one ink pill per view | Fill several actions, or use colour for actions |
| Make every button a pill | Square buttons, or outlined primaries in the app |
| Put navigation in the dark frame and work on the white sheet | Grey page backgrounds behind every card |
| Use a container for a real unit, and space for the rest | Box every group of fields |
| Show state as a badge with a pip | Colour text to show state |
| Keep body text 13px and tables dense | Large body text, roomy table rows |
| Keep the leaf green for marketing | Use the green in the product |
