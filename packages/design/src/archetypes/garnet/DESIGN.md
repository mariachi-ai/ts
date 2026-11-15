# Garnet

Category: editorial and warm-neutral (also bold and fast). Warm and confident: near-black maroon ink on a
warm grey ground, the page set as a rounded sheet inside a white rim, a white header plate, heavy geometric
display headlines tracked in tight, maroon pill buttons, mono step numbers, and the product itself drawn as
crisp neutral white panels: a record table on a hairline grid, five-step signal bars, an evidence timeline
and an assistant beside the data. Dark mode is the deep maroon of its footer. For sales, CRM and revenue
tools that should feel crafted and sure of themselves.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light and dark;
- **`recipes/`** holds the nine page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `garnet` preset of `@mariachi/design` (`data-theme="garnet"`, `themes/garnet.css`).
The values are measured from the source's public pages; where a value was changed to meet contrast, the
change is named below.

## Principles

- **Heavy words, quiet surfaces.** The one loud thing on a page is its headline: the display face at 800,
  tracked in to −0.03em, at about 2–4× the body (less on a phone). Everything else is 13–16px Geist on
  warm grey and white.
- **The ink is the accent.** There is no brand blue. Actions are maroon (`#2e0000`) pills with white text;
  secondary actions are outline pills drawn in the ink at 20%. On dark, the pill turns cream with maroon text.
- **Sheets and rims.** A page is a warm grey sheet with 40px corners inside a white 8px rim; a featured card
  is a white card inside a near-white 8px lip. Depth comes from these frames and a soft spread shadow, never
  from heavy borders. On public pages and the doors the warm grey is the page's own ground and the rim is a
  frame fixed to the window, drawn over the page as it scrolls: it is never a box around the content, so
  nothing on a public page sits more than three frames deep. In the app the near-white sheet is a panel
  beside the nav on the rim.
- **The product is neutral and exact.** Inside the app, data sits on white panels with hairlines drawn as
  inset rings, 13px text, quiet sentence-case headers and small colour only where it means something: the
  green and amber fit bars, the blue of anything an agent filled in.
- **Numbers as labels.** Steps, stages and sections are numbered in mono: "01 Workspace".

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Ground (public sheet) | warm grey `#ece9ea` | `#1c0202` |
| Product well (app sheet) | `#f8f8f8` | `#160101` |
| Panels, rim, header plate | white `#ffffff` | maroon `#2e0404`, raised `#3a0b09` |
| Text: default, muted, subtle | ink `#2e0000`; the ink at 68% `#724e4e`; at 62% `#7c5c5c` | cream `#f2efe8`, `#b7a8a4`, `#a1918e` |
| Hairlines | `#e5e5e5` rows; `#f0f0f0` the product grid | the cream at 8% `#3e1716` |
| Control edges | the ink at 50% `#8d7575` | `#907a76` |
| Accent (actions, focus) | maroon `#2e0000`, white text | cream `#f2efe8`, maroon text |
| Highlight (small marks only) | electric yellow `#f6ff00` with ink | `#ffff48` |
| Signal | green `#05d052` (bars), text green `#127040` on `#d8f3e3`; amber bar `#fed047` | the same bars |
| Agent-filled | blue `#0d74ce`, text `#0b65b4` on `#e6f4fe` | `#0090ff`, `#7cc4ff` |
| Danger | `#b4162b` on `#fde8ea`, solid `#c8202f` | `#ff9aa5`, solid `#d42a37` |

- **Radius.** 6px for the product's small chips and buttons; 8px for inputs and selects; 12px for product
  panels, menus, toasts, alerts and table frames; 24px for site cards and dialogs; 40px for the page sheet.
  Every button and pill is fully round.
- **Shadow.** Three, all faint and warm-tinted:
  - **sm**, chips and lifted segments: `0 1px 2px` and `0 2px 8px` of the ink at 6%;
  - **md**, site cards on the ground: `0 2px 6px` at 3% and a long `0 12px 36px` at 5%;
  - **lg**, a product window: `0 2px 6px` at 3% and `0 28px 60px −30px` at 30%, pulled in under the frame.
  - In the app a panel's edge is an inset 1px ring in `#f0f0f0`, not a border.
- **Motion.** Colour changes in 140ms `ease`; small transforms in 200ms; reveals in 700ms
  `cubic-bezier(0.22, 1, 0.36, 1)`. Nothing bounces in the product.
- **Spacing.** A 4px unit. Inside the product: 8px between chips, 12px between panels, 16–20px panel padding.
  On public pages: 20–24px between a headline and its lead, 48–64px between sections.
- **Layout.**
  - The rim: 8px of white around a sheet with 40px corners, from a phone up; on a phone the sheet runs to
    the edges with square corners. On public pages and the doors it is fixed to the window (an empty ring
    over the page, `position: fixed`, `pointer-events: none`) and the warm grey is the body's own ground; the
    header plate sticks to the top of it.
  - Public text to 61.25rem (980px), pictures and product frames to 75rem (1200px), prose to 40rem.
  - The gutter is `clamp(1.25rem, 4vw, 2.5rem)`.
  - The app: a 240px nav on the white rim, then the near-white sheet with 24px corners and 20–32px padding.
- **Density.** 1 by default; 0.85 for dense tables. Product rows are about 37px at 1.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`.

## Type

- **Families.**
  - **Geist** (variable) for everything you read: 400 body, 500 labels and nav, 600 buttons and section titles.
  - **Figtree at 800** for display headlines only, tracked to −0.03em with a 1.05 line height. It stands in for
    the source's heavy geometric display face.
  - **Geist Mono** 500 for step numbers and small capital labels, tracked +0.08em.
- **Four weights:** 400, 500, 600 and the display 800. Never a fifth.
- **Sizes:**
  - product text 13px; table headers 13px in the subtle colour, regular weight;
  - controls and nav 14px; reading body 16px with a 1.7 line height (27px);
  - leads 18–20px in the muted colour;
  - section titles 24px Geist 600 at −0.025em; 32px Geist 500 at −0.045em for a public section;
  - page titles in the app 32px display; public headlines 48–54px display (`--m-font-size-4xl`), the doors'
    too;
  - a reading page's title steps down with the window: about 50px wide, 40px at 1024, 30px on a phone
    (`clamp(1.875rem, 3.9vw, 3.1rem)`).
- **Case.** Sentence case everywhere. Capitals only in mono labels ("02 YOUR DATA") and the tracked eyebrow over
  a page rail ("ON THIS PAGE", 12/600, +0.12em).
- **Figures.** Tabular in tables and prices. A price is 42px Geist 600 tracked −0.055em with the old price
  struck through beside it in the subtle colour.

## Icons

- Lucide, outlined, **1.5px stroke**: 12px inside chips, 14px in buttons, nav and rows, 16px beside larger
  text, 18px in an empty-state tile. Icons take the text colour; only status icons and the agent mark
  (sparkles, in blue) are coloured.
- Nav items and most buttons carry an icon before the label; mono labels never do.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `arrow-right` (the arrow at the end of a list row), expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up` (in a round maroon button), refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** a 1.75px line in signal green over faint `#f0f0f0` gridlines, no fill. Axis labels 12px subtle.
- **More series** step through signal green, blue, amber, rose, violet and the ink; a legend is a row of
  white hairline chips, each with a 6px dot.
- **Fit** is never a chart: it is the five-step signal bar (5px segments with 9px ends, 2px apart) and the
  score beside it. Five green from 90, four green from 80, three amber below.

## States

- **Hover.** Outline and ghost pills fill with the ink at 5%; the maroon pill lightens to `#4a1212`; product
  rows take the well colour `#f8f8f8`. No lift on buttons.
- **Focus.** A 2px ring in the ink (cream on dark), 2px outside the control, on keyboard focus only.
- **Pressed.** The ink at 9% under outline pills; the maroon pill darkens to `#1f0000`. Nothing moves.
- **Disabled.** Half opacity; say why nearby.
- **Error.** The control's edge turns `#b4162b`; the message replaces the hint in 13px at 500.
- **Loading.** A button keeps its label and width with a small spinner (`aria-busy="true"`); tables show
  skeleton rows in `#f0f0f0` at row height; an agent shows a muted "Thinking…" line.
- **Selected and current.** A white segment with the sm shadow on a grey track (period switch, settings nav,
  steps); a nav row on `#f1eeef`; checked boxes filled with the ink.

## Components

The library's components, as Garnet draws them; the five newest, at the end of this section, are not drawn for Garnet yet. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives: `m-container` (61.25rem text, 75rem frames, 40rem prose),
`m-split` (the 240px nav beside the sheet; a 20–22rem panel beside a table), `m-grid` (12px gaps between
product panels), `m-stack` and `m-cluster` inside. A public section is 48–64px from the next.

**Actions and forms**
- **Button.** Always a pill at 600. 28px in product bars (`sm`), 34px by default, 44px on public pages (`lg`).
  - **Primary:** solid maroon, white text; one per view. On dark, cream with maroon text.
  - **Secondary** (the default): transparent with an ink hairline at 20%.
  - **Ghost:** muted text only, for "Back", "Cancel", "Do this later".
  - **Danger:** solid red, only to confirm something that can't be undone.
  - **Icon-only:** a round pill with an `aria-label`; send is a round maroon pill with `arrow-up`.
  - **Product chips** ("Filter 2", "30 days ⌄") are 28px buttons with 6px corners, white, a hairline edge, 12px.
- **Input, textarea.** 34px, 8px corners, white, a control edge in the ink at 50%; focus ring in the ink. A search
  box in a product bar is a 28px chip with a 12px search icon.
- **Select.** The input's box with a small chevron.
- **Field.** The label above in 13px at 500, the control, then the hint or the error in 13px.
- **Checkbox, radio.** 16px, 4px corners on the checkbox, filled with the ink when checked.
- **Switch.** A maroon track when on, the control-edge colour when off, a white knob. It takes effect at once.

**Navigation**
- **Navbar** (public). The header plate: white, 58px, at most 69rem wide, centred and joined to the top of the
  white rim, with 24px corners at the bottom; it stays there as the page scrolls (`data-sticky`). The wordmark left, 14/500 muted links, then an outline pill
  ("Log in") and the maroon pill. On a phone only the wordmark, the maroon pill and a nine-dot menu stay.
- **Sidebar** (the app). On the white rim, no border: the workspace mark and name, then 14px rows with 14px
  icons in the muted colour, counts right-aligned in subtle text, a tracked capital group heading
  ("RECORDS"), Settings at the bottom. The current row is a pill on `#f1eeef` in ink at 500.
- **Tabs.**
  - **Pill** (the default for switching): a grey `#e2dfe0` track, 3px inside, the chosen segment white with
    the sm shadow; 14/500, muted when not chosen. The period switch carries its saving as a yellow badge.
  - **Underline:** a 2px ink line under the current tab, for record views (Overview, Activity, Notes).
- **Breadcrumb.** Muted links separated by "/", the current page in ink at 400; the date sits at the far right
  of the same row on a reading page.
- **Pagination.** Round ghost pills with the current page in maroon. Lists prefer one long card of rows.

**Data and content**
- **Table.** The record table: a white frame with 12px corners, a muted hairline grid between rows and
  between columns, headers 13px subtle at 400 in sentence case on white, 13px cells, rows about 37px. A
  checkbox column first; company names at 500 after a 16px initial mark; muted secondary columns; an
  agent-filled column marked with a small blue sparkles icon in its header; fit as the signal bar. The
  open row takes the well colour.
- **Card.** On public pages: white, 24px corners, no border, the md shadow, 24–32px padding, a featured one
  inside a near-white 8px lip. In the app: the product panel, 12px corners with an inset hairline ring.
  Card titles are 14px at 500 in the app, 20px at 500–600 on the site.
- **Badge.** A white pill with a hairline edge, 12px at 500 ("Ines", "Owner"). Tones are tinted pills; a count
  in a chip is a small blue pill ("3"); the only yellow is a saving or a "new" mark.
- **Avatar.** Round, initials on the warm grey, 20px in rows, 28px in bars; the workspace mark is a 6px-cornered
  square in maroon.
- **Divider.** A hairline. In pricing cards a dashed hairline separates the price, the allowance and the list.
- **Accordion.** Questions as hairline rows with no box, 15px at 500, a thin chevron at the right; the answer
  in muted text.
- **Code, kbd.** Geist Mono at 13px on the well with 12px corners (6px inline). Keys are 6px-cornered with a
  hairline.
- **Prose.** 16px with a 1.7 line height, at most 40rem, in the ink at 76% (`#633c3c`); h2 at 24px Geist 600,
  links in ink, underlined.
- **Progress.** A 6px rounded bar: the ink on a `#ebebeb` track.
- **Meter.** The same bar; past the high mark it turns amber, then red.
- **Usage.** A label and figure over a 6px bar in the text green; amber near the limit, red over.

**Feedback and overlays**
- **Alert.** A tint of its tone with no border and no side stripe, 12px corners, a 16px icon, the title at 600.
  Say what was not done ("The deal wasn't saved").
- **Toast.** White, 12px corners, a muted hairline and the overlay shadow; a title at 600, one line, one
  outline pill ("Try again").
- **Dialog.** White, 24px corners, no border, 32px padding, a 20px title at 600; outline Cancel then the maroon
  pill on the right; a destructive confirm uses the danger pill.
- **Popover and menu.** White, 12px corners, a muted hairline and the overlay shadow, 4px inside; 13px rows
  32px tall with 8px corners that take the well colour on hover.
- **Tooltip.** Ink background with cream 12px text at 500, 8px corners, no arrow.
- **Spinner.** A 2px ring in the ink, inside buttons and small areas only.
- **Skeleton.** `#f0f0f0` bars at text and row sizes with a slow shimmer to `#f8f8f8`.

**AI and chat**
- **Chat.** The assistant answers in plain text with no bubble; your message sits in a `#f4f4f4` box with a
  hairline and 16px corners. A "Thought for 4s ⌄" line in subtle text sits between them.
- **Composer.** A white box with 16px corners and a control-strength edge (the library's 3:1 floor), 13px
  text; a plus to attach at the left and a round maroon send button with `arrow-up` at the right.
- **Thinking.** A muted line ("Thought for 4s") with a chevron that opens the steps.
- **Tool call.** An action card: white, 12px corners, a hairline, the step in 13px at 500, a subtle count
  line ("6 companies picked") and one pill to run it ("Find people").
- **Citation.** A small round chip with the source's initial; the source opens in a popover.
- **Usage**, as above: the team's credits as a bar with the figure in tabular numbers.
- **Row, chip, icon tile, amount and drop zone** (`m-row`, `m-chip`, `m-tile`, `m-amount`,
  `m-dropzone`): newer than this language and not drawn for it yet. Until they are, use them with
  Garnet's tokens and the library defaults, and where a pattern above already describes rows,
  chips, tiles or money figures, follow the pattern.

## Error handling

- **In a field:** the edge turns red and the message replaces the hint; validate on blur and on submit.
- **In a form:** a danger alert above the fields: how many need a look, and that nothing was saved.
- **Somewhere else:** a toast that says what didn't happen and whether anything changed, with one action.
- **A connection:** a warning alert with what is paused since when, and one outline pill ("Reconnect").
- **A whole page:** said in one line, centred: the code in 24px, a 1px vertical rule, one sentence at 14px;
  then one way out as a pill.
  - **404:** "This page doesn’t exist." with Back home.
  - **500:** "Something broke on our side. Nothing was changed." with Try again and the status page.
  - **403:** "This record belongs to another team." with Ask for access.
- **Words.** Plain, short, no blame, no exclamation marks.

## Page shapes (recipes)

### The two families

- **Public pages** (pricing, reading, a marketing page): the warm grey `#ece9ea` ground inside the white rim
  with 40px corners, the rim fixed to the window; the white header plate joined to the rim; heavy centred display headlines at 48–54px with a
  muted 18–20px lead; maroon and outline pills at 44px; site cards with 24px corners and the md shadow; the
  maroon footer, which is a dark "window": a framed table of link columns with its own title bar. Body 16px.
- **The app** (dashboard, list and detail, settings, empty state, errors): the nav on the white rim beside a
  near-white `#f8f8f8` sheet with 24px corners; a mono crumb and a 32px display title; white product panels
  with 12px corners and inset hairline rings; 13px text; pills at 28–34px; no footer.
- **The doors** (onboarding, sign-in): the public ground and fixed rim with no header links: the wordmark row
  (with "Do this later" or "Start a free trial" at the right), a centred 48–54px display headline and its
  muted lead, then one rimmed white card.

### How a screen is assembled

- **It opens with** a mono crumb and one display line (the app), or a centred headline and a lead (public).
  Actions sit right of the title: an outline pill, then the maroon one.
- **Reading order:** the title, the thing that needs you (tasks, a selection, the price), then the evidence.
- **How much one screen does:** one job. A table may have its record or the assistant beside it, never both.
- **When narrow:** the sheet comes first and the nav drops below it; side panels stack under the table; the
  header plate keeps the wordmark, the maroon pill and a nine-dot menu; the rim and its corners go away.
- **Too much:** tables scroll inside their frame; lists stay one card of rows. **None:** the table keeps its
  headers and says so in one line in its middle, with the assistant ready beside it.

### Signature moves

1. The page as a rounded warm sheet inside a white rim, with a white header plate joined to it.
2. Heavy display headlines tracked in, against small calm Geist everywhere else.
3. Maroon pills as the only accent; outline pills in the ink at 20% beside them.
4. Mono step numbers: "01 Workspace · 02 Your data".
5. The record table on a hairline grid with five-step signal bars.
6. The maroon footer drawn as a product window of link columns.

### The recipes

- **Dashboard.** "Good morning, Ines" over the day's tasks with checkboxes and owner chips, the quarter's
  pipeline by stage, an activity line in signal green with a chip legend, and new signals with fit bars.
- **List and detail.** Lead search: a product bar (search chip, Filter with its count, sort), the record
  table with three rows checked and one open, and the company beside it with its evidence timeline (green
  check circles, the source in subtle text, the reason in green) and two pills.
- **Onboarding.** The wordmark and "Do this later", the numbered pill track of steps, a centred display
  headline and lead, then the choices in a rimmed card with Back and Continue.
- **Settings.** A settings nav with tracked capital group headings and the current item as a white pill,
  beside one panel of hairline rows (label and hint left, control right), the members table and a separate
  danger row.
- **Empty state.** The table frame keeps its headers with "No sequences yet" and one line in its middle; the
  assistant beside it holds a ready-made request.
- **Pricing.** The centred headline and lead, the period switch with a yellow saving, a rimmed white plan
  card beside a plain one on a shared near-white lip, dashed separators and filled check circles; the
  comparison table in a white frame with 24px corners; questions as hairline rows; a closing headline with
  two pills; the maroon footer.
- **Errors.** Field and form errors, a connection warning, a toast, and the three one-line whole pages.
- **Reading.** A "Contents" rail with a dash on the current item, the breadcrumb with the date at the
  right, a display title that steps down on narrower windows, a muted lead, a rimmed product picture, prose,
  and the footer.
- **Sign-in.** The door shaped as onboarding is: the wordmark row with "Start a free trial", "Welcome back" as
  the centred display headline with its lead, then one rimmed white card with two outline pills, a divider,
  the email field and the maroon pill.

## Words

- Sentence case, short and direct: "Find people", "Do this later", "Try it free".
- Say what happened and what didn't ("The deal wasn't saved").
- Dates in full on public pages ("November 4, 2026"), short in the app ("Fri", "12 Nov").

## Do and don't

| Do | Don't |
| --- | --- |
| Make the headline the one heavy thing | Use the display face for labels, tables or buttons |
| Use maroon pills for actions | Add a second accent colour for buttons, or square buttons |
| Set pages as sheets in a white rim | Put a public page on flat white with a border round it |
| Draw product panels with inset hairline rings | Use heavy borders or dark shadows in the app |
| Show fit as the five-step signal bar | Show fit as a percentage pill or a colour alone |
| Keep the yellow for one small mark | Use the yellow for fills, text or buttons |
| Number steps in mono | Number steps with circles or icons |
| Keep four weights: 400, 500, 600 and the display 800 | Bold body text or add a 700 |
