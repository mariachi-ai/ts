# Tinker

Category: playful and quirky. Engineered and playful: a light grotesque set in lowercase on white and
off-white, square black actions, black hairline rules between numbered rows, tiny technical
all-caps captions, black device screens with dot-matrix readouts, knobs and meters drawn from token
shapes, and one signal orange beside knob blue, yellow, green and red. For hardware, audio and maker
tools that should feel exact, industrial and a little funny.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `tinker` preset of `@mariachi/design` (`data-theme="tinker"`,
`themes/tinker.css`).

## Principles

- **Light type, lowercase voice.** Body text is weight 300 and large titles are 200, all in a light
  grotesque. Words are written in lowercase ("add to cart" style), even buttons and titles; only
  codes, model numbers and the technical captions are capitals.
- **Black acts, orange signals.** The one action on a view is a square black block. The signal orange
  is never a button: it marks the one lit thing (the record key, the current item, a live notice).
  The primaries (blue, yellow, green, red) are knob colours for data and status.
- **Spec sheets, not boxes.** Lists are full-bleed rows split by black hairlines. Details are
  label-and-value rows. Cards are flat off-white tiles with no border or shadow.
- **Instrument details.** Numbers get tiny technical caps ("01 · current run"). Live values sit on
  black device screens in a dot-matrix readout. Levels are knobs and LED meters drawn from token
  shapes. Overlays stand on a hard, unblurred offset shadow.
- **Big whitespace.** Wide product-page layouts with a 66px gutter at 1440px, 40px between sections.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Page | white `#ffffff` | near-black `#0f0e12` |
| Tiles and panels (surface) | off-white `#f5f5f5` | `#1a191e` |
| Menus and dialogs (raised) | white | `#272727` |
| Tags, wells, secondary buttons (sunken) | grey `#e5e5e5` | black |
| Text: default, muted, subtle | `#0f0e12`, `#4d4d4d`, `#6b6b6b` | `#f5f5f5`, `#b2b2b2`, `#a1a7af` |
| Rules | list rows `#0f0e12`; dividers `#c7c7c7`; quiet `#e5e5e5` | `#4d4d4d`; `#272727` |
| Control borders | `#7f7f7f`, black on focus | `#7f7f7f`, off-white on focus |
| Action (accent) | black `#0f0e12`, off-white text; hover `#575659` | off-white, black text |
| Signal (brand) | orange `#f05a24` with black text | the same |
| Knob colours | blue `#0071bb`, yellow `#fab413`, green `#006837`, red `#b81d13` | the same, lifted text tints |
| Error | `#c0262c` solid, `#b81d13` text | `#c0262c`, `#f08a8d` |

- **Radius.** Square: 0 on buttons, inputs, selects, tiles, tables, dialogs, menus and toasts. 2px on
  tags, keys and citations; 10px on notices (alerts); 15px for a large tool panel when you need one.
  Round only where the object is round: avatars, knobs, the tooltip pill, circled numbers.
- **Shadow.** None on anything that sits on the page. Menus and popovers stand on a hard `3px 3px 0`
  black shadow; dialogs and toasts on `4px 4px 0`. No blur, ever.
- **Motion.** 100, 150 and 400 ms. Hover is immediate; panels ease in and out. Nothing bounces.
- **Spacing.** A 5px unit (5, 10, 15, 20, 25, 30, 40, 50, 60, 80px). The usual gaps:
  - 10px inside a control group and between a label and its field;
  - 15px between tiles in a grid;
  - 20–25px inside a tile, and between fields;
  - 40–60px between page sections.
- **Layout.**
  - A tall header (about 100px) of line-drawn groups, no rule under it.
  - Content to 82rem (1312px) inside a gutter of `clamp(1rem, 4.6vw, 4.125rem)`.
  - Forms in a 45rem (720px) centred column; settings beside a 17rem index.
  - Grids gap 15px; product tiles at 17–22rem.
  - Tables run the full width of their column, no frame.
- **Density.** 1 by default. For dense lists, set `--m-density: 0.8` on the page.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.**
  - Inter Tight for everything you read: body at 300, emphasis at 400, large titles at 200.
    Load it as a variable font (`@fontsource-variable/inter-tight`) so 200 and 300 render as set.
  - Jura (`--m-font-family-display`) for the technical layer: tiny caps captions, numbered labels,
    part and model codes, keys and screen readouts, at 500–600.
  - Sometype Mono for code, serials and file names.
- **Sizes:**
  - body 16px with a 1.5 line height;
  - lists, descriptions and tile names 19px;
  - secondary text 13px; captions 11px caps tracked 6%;
  - section titles 26px at 200; page titles 53px at 200; big figures 34–40px at 200.
- **Case.** Lowercase sentences without a capital at the start. Capitals only in the technical caps
  and in codes ("ENC-24", "R-0412").
- **Figures.** Tabular figures in tables and readouts; prices as "0.84 € / pc", thin and large.

## Icons

- Lucide, outlined, **1px stroke**: 16px in buttons and beside text, 20px for icon buttons, 40px for
  the header's group drawings. Never filled. The current header group's drawing turns orange.
- A plus at the right of a tile adds it; an arrow ("→") leads on; "←" goes back.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis`, close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `arrow-down-to-line`, upload `arrow-up-from-line`, copy `copy`, external
    `arrow-up-right`;
  - send `send-horizontal`, refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Series** step through the knob colours: signal orange, blue, yellow, green, red, then grey.
- **Lines** are 1px in black (or the series colour), on a faint dotted grid, with 11px technical caps
  for the axes. Bars are square-ended.
- **Levels** are LED meters (stacked 4px segments with 2px gaps) or knobs, never gauges with
  gradients.
- **Live values** go on a black device screen as a dot-matrix readout in orange or off-white.
- Tooltips use the navy pill.

## States (every control)

- **Hover.** The black block lightens to `#575659` (the reference's 70% opacity); grey blocks lighten
  one step; ghost buttons and rows take the off-white. Links underline. Nothing lifts.
- **Focus.** A 2px black ring 2px outside the control (off-white in dark); a field's own border turns
  black too. Never remove it.
- **Pressed.** Back to near-black `#272727` for the black block; grey blocks darken to `#cccccc`.
- **Disabled.** 40% opacity, default cursor. Say why nearby.
- **Error.** The border turns red and the message replaces the hint in red 13px, with a 14px
  `circle-alert`.
- **Loading.** A button keeps its width and label behind `aria-busy="true"`; lists show grey
  skeleton bars, square. The spinner is a thin turning arc with no track.
- **Selected and current.** Category words turn from grey to black over a 1px rule; a chosen table
  row inverts to black; the current index row turns orange; a chosen segment is white on the grey
  well.

## Components

All 36 of the library's components, as Tinker draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 82rem, 60rem for settings, 45rem for forms;
- `m-split`, a 15–17rem side column (an index or filters) beside the main one;
- `m-grid`, for tiles: 15px gaps, 17rem columns for product tiles and 22–26rem for halves;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 40–60px apart.

**Actions and forms**
- **Button.** Square blocks with a light lowercase label (weight 300), 40px by default, 35px small,
  50px large. A form's final action is full width and large.
  - **Primary:** black, off-white text ("continue", "reorder 500 pcs"). One per view.
  - **Secondary** (the default): the grey `#e5e5e5` block with `#4d4d4d` text.
  - **Ghost:** text only; the off-white on hover. Icon-only buttons are ghosts with an `aria-label`.
  - **Danger:** the red block, only to confirm something destructive.
- **Input, textarea.** White, square, a 1px grey border (`#7f7f7f`) that darkens on hover and turns
  black on focus; 10px padding, 16px light text, grey placeholder.
- **Select.** The same square box with a thin chevron. Options in lowercase.
- **Field.** A small grey lowercase label (13px) above the control, then the hint or the error. Fields
  stack 20px apart; short pairs sit side by side.
- **Checkbox, radio.** 20px, square checkbox with a 2px grey border; black when checked with an
  off-white tick. Radios are round with the same border.
- **Switch.** Square: a 40 × 20 grey track with a white square knob, lit signal orange when on, like
  a key's LED. It takes effect at once.

**Navigation**
- **Sidebar.** A plain column on the page, no fill and no rule: grey lowercase links, the current one
  black; group headings in 11px technical caps; counts plain and grey.
- **Navbar.** The tall header: the mark, then groups, each a 40px line drawing beside a 26px thin word
  with two or three 13px sub-links under it. The current group's drawing is orange. Search,
  notifications, settings and the avatar at the right.
- **Tabs.**
  - **Underline:** the category row. Grey 19px lowercase words 20px apart, the current one black over a
    1px black rule; the item count sits at the far right.
  - **Pill** (segmented): an off-white well, square segments, the chosen one white.
- **Breadcrumb.** 13px grey links with "/" between and the current page in black. Prefer a "← back to
  parts" link in deep pages.
- **Pagination.** Square 35px cells, the current one black. Lists prefer "show all".

**Data and content**
- **Table.**
  - Full-bleed rows, no frame and no header fill, split by 1px black hairlines.
  - Headers in 11px technical caps, grey.
  - Numbers first: a "no." column in technical caps, codes in the display face.
  - Rows take the off-white on hover; the chosen row inverts to black.
  - Status as tags on the right.
- **Card.** The product tile: off-white, square, no border, no shadow, 25px padding. Put the name and
  figure under the tile with a plus at the right, not inside it. An outlined card has a 1px dark rule.
- **Badge.** 20px tags with 2px corners in 11px caps tracked 6%: grey by default, tinted for status,
  black for solid ("live").
- **Avatar.** Round like a knob cap: lowercase initials on the grey.
- **Divider.** A 1px rule: black between list rows, `#c7c7c7` elsewhere. Labels in technical caps.
- **Accordion.** Rows split by black hairlines, the question at 19px light, a thin chevron at the
  right. No fill.
- **Code, kbd.** Code on the off-white, square, in Sometype Mono. Keys are small black keycaps with
  off-white technical caps and 2px corners, like a device's buttons.
- **Prose.** 16px light text at 1.5, at most 40rem wide; links black and underlined; quotes behind a 1px
  black rule.
- **Progress.** A 4px square bar: black on the grey track.
- **Meter.** The same bar; amber past "low", red past "high". For levels on a page, draw an LED meter.
- **Usage.** A label and amount over a square 4px bar.

**Feedback and overlays**
- **Alert.**
  - The tools' notice: a flat tint with 10px corners, no border and no stripe.
  - A 18px outline icon, the title at 400 and the body at 300.
  - Neutral notices are grey; danger alerts sit above the form and say what wasn't done.
- **Toast.**
  - Bottom right, a white square block with a 1px black rule, standing on the 4px hard shadow.
  - One line of title and one of detail; one action ("retry", "undo").
  - Success toasts close after 5s; errors stay.
- **Dialog.**
  - White, square, 1px black rule, the 4px hard shadow, over a 40% black scrim.
  - The title is 26px at 200.
  - Actions on the right: the black block last, "cancel" as ghost.
- **Popover and menu.**
  - White, square, 1px black rule, the 3px hard shadow, no inner padding.
  - Items are 16px light rows that take the off-white on hover, with black hairlines between groups.
- **Tooltip.** A navy pill (`#192a3c`) with off-white 13px text, after 150ms.
- **Spinner.** A thin black arc turning once a second, no track.
- **Skeleton.** Square grey bars at text and figure sizes, shimmering to the off-white.

**AI and chat**
- **Chat.**
  - The assistant writes straight on the page, no bubble; its avatar is a small orange knob cap.
  - Your messages sit in a square grey block, right-aligned.
  - Times in 11px technical caps.
- **Composer.** A square white box with a 1px grey border that turns black on focus; send is a black
  square block with `send-horizontal`.
- **Thinking.** A grey "thinking" line behind a 1px rule, with a soft pulse.
- **Tool call.** A square row with a hairline border, the tool name in mono, the status as a 2px tag.
- **Citation.** A small grey numbered tag with 2px corners; the source in a popover on hover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the hint: red 13px with a 14px
  `circle-alert`, saying how to fix it ("enter at least 1 board."). Validate on blur and on submit.
- **In a form:** a danger alert above the form that counts what needs fixing and says what wasn't
  done ("2 things need fixing. the run wasn't started."). Focus moves to it.
- **Somewhere else:** a toast with what happened and one action ("station b stopped logging · retry").
- **A whole page:** centred in an off-white tile.
  - A small black device screen with "error 404" in yellow caps and the code as an orange dot-matrix
    readout, a 34px thin title, one sentence and one or two actions.
  - **404:** "we can't find that page." with a link back.
  - **500:** "something broke on our side." and "nothing was changed", with try again.
  - **403:** "this bench isn't yours." with ask for access.
- **Words.** Lowercase, plain, a little dry. Say what happened, whether anything changed, and what to
  do. No codes in sentences, no blame.

## Page shapes (recipes)

- **Dashboard.**
  - The tall header, then a 53px thin title with a caption at the right ("week 46 · 3 runs on the
    line").
  - The category row (today, this week, this month) with the date as the count.
  - Three tiles, each with a numbered caption: a device screen with the live readout, a knob station
    (a big orange knob and three small ones), and LED bin meters.
  - A numbered table of runs, then two smaller tiles.
- **List and detail.**
  - The category row with the count, then a parts table (codes in the display face, the chosen row in
    black) beside a product-page detail.
  - The detail: a tile with a drawn knob, the name and the price in thin 34px, the stock line, a
    full-width black "reorder", small grey actions, a paragraph, and a spec sheet of hairline rows.
- **Onboarding.** A slim header, circled step numbers, a 40px thin centred title over a 26px light
  subline, square fields in a 45rem column, one full-width black "continue" and a "← back" link.
- **Settings.** A printed-manual index at the left (black chapter rows with circled numbers, grey
  numbered sub-rows, the current one orange) beside numbered sections of hairline rows with orange
  switches, grey segmented controls and square selects. Closing the workshop comes last, in red.
- **Empty state.** A small blank device screen ("--:--"), a 40px thin "nothing on the line.", one
  black action and a link, then kits as tiles with the name, the figure and a plus under each.
- **Pricing.**
  - Plans as store tiles: a row of knobs shows how much you get; the name and price under the tile
    with a plus; bullet specs; full-width square buttons, the middle plan's black.
  - A yearly segmented control at the top right, a spec-sheet comparison and a hairline FAQ.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Lowercase, short and concrete: "reorder 500 pcs", "nothing on the line.", "start from a kit".
- Codes and models in capitals; units spaced ("0.84 € / pc", "340 °c", "28 mm").
- Dates short and lowercase ("thu 13 nov").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep type light: 300 body, 200 titles, lowercase | Bold headings, title case, or capitals for emphasis |
| Make the one action a square black block | Rounded or pill buttons, or orange buttons |
| Keep orange for the one lit thing | Use the orange for links, borders or decoration |
| Split lists with black hairlines, full bleed | Zebra stripes, filled headers, boxed tables |
| Put names and figures under flat tiles | Borders or soft shadows on tiles |
| Number things in tiny technical caps | Long uppercase sentences |
| Draw knobs, meters and screens from tokens | Images of devices, gradients or glossy gauges |
| Stand overlays on a hard offset shadow | Blurred drop shadows |
