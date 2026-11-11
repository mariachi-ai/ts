# Cirrus

Category: calm fintech. Bright and friendly: deep navy ink on a cool off-white canvas, white panels
with 20px corners and a hairline, one clear blue, soft tinted category pills in small capitals with
an emoji, and figures whose currency sign is small and raised. Dark mode is a near-black navy with
the same blue. For personal money apps where people check budgets, review spending and watch their
net worth.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `cirrus` preset of `@mariachi/design` (`data-theme="cirrus"`,
`themes/cirrus.css`).

## Principles

- **Friendly, not loud.** Navy ink instead of black, a soft off-white page, rounded white panels.
  Weight does the emphasis (450 body, 550 titles and figures); nothing is heavy except marketing
  headlines.
- **One blue for doing things.** The blue fills the primary button, marks the current nav row and
  the highlighted menu row, and links. Status colour (green, amber, red) is for money and budgets.
- **Money at a glance.** Figures use tabular numbers with the currency sign small and raised:
  `$1,486`. Money in is green. A budget's bar is green while it's on track, amber near the limit
  and red when over.
- **Categories you can see.** Every category is a tinted capital pill led by an emoji. Colour and
  emoji repeat everywhere the category appears: lists, details, budgets.
- **Quiet structure.** Panels sit on the canvas with a hairline and a breath of shadow. Lists are
  grouped by day under muted date lines, not ruled into grids.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas | cool off-white `#f9fafb` | near-black navy `#00060f` |
| Panels, sidebar, header | white `#ffffff` | `#010e21`; menus and dialogs `#041022` |
| Quiet fills (hover rows, tracks) | `#f5f6f6` | `#020c1b` |
| Text: default, muted, subtle | navy `#143352`, `#5a7086`, `#62758d` | `#dee4ed`, `#5c7eab`, `#657c9b` |
| Hairlines | `#e6e6e7` (ink at 10%); lighter `#f3f3f3` | `#112542` (blue at 16%); `#0d1f3a` |
| Control borders | `#7f8ba4` | `#316193` |
| Blue: fill, hover, pressed | `#3e72db`, `#3764bf`, `#325aab` | `#1772e9`, `#1564cb`, `#145ab6` |
| Blue: tint, text | `#e6f1ff`, `#056dc7` | `#162d4c`, `#6aa7f8` |
| Current nav row | pale blue `#f0f5fe`, blue text | solid soft blue `#5089d7`, navy-black text |
| Green: bars and flags, text | `#00cc4b`, `#017c30` | `#0ac24e`, `#19b24d` |
| Amber: bars, text | `#ff9900`, `#a75a07` | `#f2960d`, `#ffaa52` |
| Red: fill, text | `#e51300`, `#d61301` | `#f54c3d`, `#eb5749` |
| Tooltips and chart flags | navy `#143352`, white text | `#dee4ed`, navy text |

- **Radius.** 8px for buttons, inputs, selects and nav rows; 12px for menus, toasts, callouts and
  icon tiles; 20px for panels and dialogs; 24px for marketing question cards. Pills (category
  pills, segmented controls, chips, marketing buttons) are fully round.
- **Shadow.** Barely there. Buttons: `0 1px 4px` at 2% plus a tight inner edge. Panels:
  `0 2px 6px` at 2%, so the hairline does the work. Menus, toasts and the floating action bar:
  `0 4px 16px` at 10%. In dark mode the shadows are navy-black.
- **Motion.** 150, 200 and 300 ms; `cubic-bezier(0.4, 0, 0.2, 1)` for state changes and
  `cubic-bezier(0.25, 1, 0.5, 1)` for things that arrive. No bounce.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px inside a control group;
  - 12px between rows in a panel;
  - 24px between panels and inside them;
  - 32px around the page content.
- **Layout.**
  - A 256px white sidebar with a hairline edge, beside a 56px white header bar.
  - Content on the off-white canvas, 32px from the edges, in a two-column grid of panels 24px apart.
  - Lists with a detail: the list fills, the detail is a 22rem white panel on the right.
  - Forms and onboarding in one centred white card about 36rem wide.
- **Density.** 1 by default. For dense data screens set `--m-density: 0.875`; controls and padding
  shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Figtree (variable) for everything: a friendly geometric grotesque with a double-storey
  a. Weights are in-between steps: 450 for body, 550 for titles, figures and buttons, 620 for small
  capital pills and marketing headlines. Load the variable font (`@fontsource-variable/figtree`) so
  450, 550 and 620 render as set.
- **Mono.** JetBrains Mono (`@fontsource-variable/jetbrains-mono`), only for receipt-like labels
  on marketing pages ("SAVE 25%") and codes. Never for amounts.
- **Sizes:**
  - body and list rows 15px with a 1.5 line height; nav rows 16px;
  - secondary text 13px; column labels 12px capitals; category pills 11px capitals;
  - panel and header titles 16px at 550;
  - big figures 28px at 550; section titles 20px;
  - marketing headings 36px and 48px at 620, tracked −1%.
- **Case.** Sentence case everywhere, except category pills, table column labels and marketing
  receipt labels, which are capitals tracked 4–5%.
- **Figures.** `font-variant-numeric: tabular-nums`, with the currency sign at about 62% size and
  raised: `$62,415`. Money in is green; money out is navy without a minus sign in lists.

## Icons

- Lucide, outlined, **1.75 stroke** on the 24px grid (about 1.2px at 16px): 18px in the sidebar,
  16px in buttons and inputs, 14px beside small text, 24–28px in icon tiles. Grey by default; the
  current nav row's icon turns blue with its text.
- Icons in empty states and errors sit in a 56px tile with a 12px radius: pale blue for empty states,
  the quiet fill for errors.
- Up and down are a diagonal arrow (↗, ↘) inside a tinted pill beside the figure, never colour
  alone.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `chevron-right` (as in "See all ›"), expand `chevron-down`;
  - download `arrow-down-to-line`, upload `arrow-up-from-line`, copy `copy`, external
    `arrow-up-right`;
  - send `arrow-up` (in a round blue button), refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Budget pace:** a 2.5px line that warms from red (overspent early) through amber to green (on
  track), over a dashed grey line for the planned pace; a small green flag with the figure
  ("$212 below pace") and a white dot with a green ring at today.
- **Balances and net worth:** one 2.5px green line over a soft green fade (18% to 0%); range pills
  underneath (1W 1M 3M YTD 1Y ALL), the current one on the quiet fill.
- **Cash flow:** rounded bars, green for in and red for out, with a faint dotted zero line.
- **Budgets:** thin 6px bars, green, amber past 85% and red past 100%, on a pale track.
- **More series** step through blue, green, amber, red, purple, teal and pink.
- No gridlines except a dotted zero line; axis labels muted 13px.

## States (every control)

- **Hover.** Quiet fills: secondary and ghost buttons take `#f5f6f6`, rows and nav items the same.
  The primary darkens one step. Nothing moves.
- **Focus.** A 2px blue ring 2px outside the control, on keyboard focus only. Never remove it.
- **Pressed.** One step darker than hover, and the button's small shadow goes away.
- **Disabled.** Half opacity; the cursor stays default. Say why nearby when it isn't obvious.
- **Error.** The control's border turns red, and the message replaces the help text below it in red
  13px at 550, saying how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a small spinner.
  - Panels show pale skeleton bars at text and figure sizes. Never a spinner over the whole page.
- **Selected.** Selected rows take the pale blue tint with a 2px blue edge on the left; a floating
  action bar appears at the bottom of the list. Checked controls are blue.

## Components

All 36 of the library's components, as Cirrus draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: up to 76rem, 48rem for settings, 28rem for narrow forms;
- `m-split`, the 256px sidebar beside the main column (and the settings list beside its panels);
- `m-grid`, for panels: 24px gaps, 24rem columns;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 8px radius, weight 550, 32px (`sm`) in headers, panels and bars, 36px by default,
  44px (`lg`) for the main action of a card or form, where the radius grows to 12px.
  - **Primary:** solid blue, white text, one per view.
  - **Secondary** (the default): white with a hairline and the small shadow; navy text.
  - **Ghost:** text only, for header icons and quiet actions ("More filters").
  - **Danger:** solid red, only to confirm something destructive.
  - **Icon-only:** a square 32px button with an `aria-label`; secondary in panels, ghost in bars.
  - On marketing pages buttons are full pills, 44px.
- **Input, textarea.** 36px, 8px radius, white, a control-strength border that darkens on hover and
  turns blue on focus. Search fields in the header are 32px with a hairline border.
- **Select.** The same box as an input with a small chevron.
- **Field.** The label above in muted 15px at body weight, then the control, then the hint or the
  error in 13px.
- **Checkbox, radio.** 16px; the checkbox has a 4px radius and a grey border at rest, blue with a
  white tick when checked.
- **Switch.** 36 × 22px, blue when on, grey when off, a white knob. It takes effect at once.

**Navigation**
- **Sidebar.** 256px, white, a hairline edge.
  - Top: a square collapse button and a sync button.
  - Nav rows are 16px with an 18px grey icon; the current row is pale blue with blue text (in dark,
    a solid soft blue with navy-black text). Counts are plain muted numbers at the right.
  - Then account groups under a small triangle and a muted heading ("Cards"), each account with a
    coloured dot, its name and a muted balance.
  - At the bottom, separated by a hairline: help, settings and an amber "Finish setup" row.
- **Navbar** (public pages). Transparent over the page, 72px, the brand at the left, muted 16px
  links at 550, a white pill ("Sign in") and a blue pill ("Try it free") at the right.
- **Top bar** (in the app). White, 56px, a hairline below: the page title at 16px on the left, icon
  buttons and a search field on the right.
- **Tabs.**
  - **Pill** (the segmented control): a pale track, fully round, the selected segment white with
    the small shadow. Range pickers drop the track and put the quiet fill behind the current pill.
  - **Underline:** a 2px blue line under the current tab, in navy.
- **Breadcrumb.** Muted links separated by "›", the current page in navy at 550. In the app, prefer
  a back arrow.
- **Pagination.** "1 – 3 of 3" in muted text beside ghost chevron buttons. Numbered pages are 8px
  squares with the current one pale blue.

**Data and content**
- **Table.**
  - No frame and no header fill: column labels are 12px muted capitals.
  - Rows are 15px with faint separators and the quiet fill on hover; numbers right-aligned.
  - Groups open with a coloured triangle and a count chip; children are indented with their emoji.
  - Lists of activity are not tables: rows grouped under muted date lines ("Yesterday"), each with
    a checkbox, the payee and its account in subtle text, a category pill, the amount and a blue
    dot when it still needs a look.
- **Card.** White, 20px radius, a hairline, 24px padding, the faint shadow. The title is 16px at
  550 with a muted "See all ›" link at the right; the main figure is 28px. A footer row of actions
  is separated by a full-width hairline.
- **Badge.** The category pill: fully round, 22px, 11px capitals at 620, a soft tint of its colour
  with darker text, no border, usually led by an emoji. Tones: green, amber, red, blue, the accent
  and a neutral grey. Change chips ("↗ 4.2%") use the same pill in sentence case. Tag-count chips
  are white with a hairline and a coloured dot.
- **Avatar.** Round, pale blue with blue initials at 550; 24, 32 and 44px.
- **Divider.** A hairline. Inside panels, settings rows are separated by hairlines.
- **Accordion.** Separated white cards with 24px corners, 20px questions at 550, 24px padding and a
  chevron at the right; the open one lifts with the soft shadow.
- **Code, kbd.** JetBrains Mono at 13px on the quiet fill with a 12px radius (6px inline). Keys are
  white with a hairline and the small shadow, 6px radius.
- **Prose.** 15px with a 1.6 line height, at most 68 characters a line, links in blue.
- **Progress.** A 6px round bar, blue on a pale track; budget bars take green, amber or red.
- **Meter.** The same bar: green, amber past "high", red past the maximum.
- **Usage.** A label and amount over a 6px bar.

**Feedback and overlays**
- **Alert.** The callout: a pale tint of its tone, 12px radius, no border, a 16px icon and the title
  at 550 in the tone's colour. Danger alerts sit above the form they're about and say nothing was
  saved. Connection problems are amber with a "Reconnect" button.
- **Toast.** White, a hairline (its left edge in the tone's colour), 12px radius, the soft lift; the
  title at 550, one line of detail and one action ("Retry now"). Success toasts close themselves.
- **Dialog.** White, 20px radius, a hairline, the overlay shadow over a 30% black scrim, 32px
  padding, the title at 28px. Actions on the right, primary last.
- **Popover and menu.** White, 12px radius, a hairline, the soft lift, 8px padding. Items are 40px
  rows at 15px with a grey icon or an emoji; the highlighted row is pale blue with blue text.
  Hairlines between groups; creating and excluding actions come last.
- **Tooltip.** A navy flag with white 13px text at 550, 6px radius, no arrow, after 300ms. In dark,
  pale with navy text.
- **Spinner.** A thin 2px blue ring, inside buttons and small areas only.
- **Skeleton.** Pale rounded bars at text and figure sizes, with a slow shimmer that stops under
  reduced motion.

**AI and chat**
- **Chat.**
  - The person's messages are blue bubbles with white text, 20px radius, right-aligned.
  - The assistant answers in white bubbles with a hairline; its avatar is a pale blue circle.
- **Composer.** A white box with a 20px radius, a control-strength border that turns blue while
  typing, and the soft lift. Send is a round blue button with `arrow-up`.
- **Thinking.** A muted line ("Thinking…") with a soft pulse. **Tool call:** a hairline-bordered
  row with a 12px radius, a 16px icon, the tool's name and a status pill.
- **Citation.** A round pale-blue chip with a number; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the hint below it. Validate on blur
  and on submit, never while someone is still typing.
- **In a form:** a red callout above the form with how many things need fixing and what wasn't done
  ("2 things to fix. Nothing was saved yet."). Focus moves to it; each field shows its own message.
- **A connection that needs attention:** an amber callout naming the institution, how long since it
  last synced, what is paused, and a "Reconnect" button.
- **Somewhere else:** a toast with what happened and one action ("Couldn't sync Travel Rewards ·
  Retry now").
- **A whole page:** a white panel in the content column.
  - A 56px icon tile on the quiet fill, "Error 404" in small mono capitals, a 28px title, one
    sentence and one or two buttons.
  - **404:** "We can't find that page" with Back to overview.
  - **500:** "Something went wrong on our end" and "nothing was changed", with Try again and Contact
    support.
  - **403:** "This belongs to someone else" with Ask for access.
- **Words.** Say what happened, whether anything changed, and what to do next. Warm and plain; no
  codes in sentences, no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - The shell: white sidebar, white header with "Overview" and icon buttons, the off-white canvas.
  - Two columns of panels: spending against the planned pace and net worth with range pills; then
    the transactions that need a look, top categories with budget bars, and what's coming up.
- **List and detail.**
  - Filter chips and the totals strip in white bands under the header.
  - The month's heading and total, then rows grouped by day; selected rows in pale blue with a
    floating action bar ("3 selected · Review · Category · Tag").
  - The detail in a white panel on the right: date and status, payee and amount large, the account,
    then label-and-value rows for category, repeats and labels, and a note.
- **Onboarding.** One white card centred on the canvas: an icon tile, a thin progress bar, a 28px
  heading, one question at a time (choices as bordered cards, the chosen one pale blue), a full-width
  44px blue button and Back as a ghost.
- **Settings.** A plain list of sections beside white panels: the month as a ring of category
  colours, budgets as a table with coloured bars, and switches in hairline rows.
- **Empty state.** Inside a panel: a pale-blue icon tile, a 20px heading, one sentence, a blue
  button and a secondary one.
- **Pricing.**
  - A soft blue wash over the canvas, a 48px headline, a large Yearly/Monthly segmented control.
  - One square, receipt-like card: mono capital labels, a big price with the small raised sign,
    dotted leader rows, and a full-width pill button.
  - Separated question cards below.
- **Errors.** The field, form, connection, toast and whole-page errors above, as one page.

## Words

- Short, warm and plain, sentence case: "Needs a look", "See all", "Finish setup", "Review all 3".
- Dates are friendly ("Today", "Yesterday", "Tuesday, April 14"); amounts are exact.

## Do and don't

| Do | Don't |
| --- | --- |
| Use navy ink on an off-white page | Pure black text, or a grey page with grey panels |
| Give panels 20px corners, a hairline and almost no shadow | Heavy shadows, or borderless floating cards |
| Lead every category with its emoji and tint | Plain text categories, or outlined pills |
| Set the currency sign small and raised | Show amounts with a full-size sign |
| Colour budgets green, amber and red by how close they are | Use red for every expense |
| Group activity by day under muted date lines | Rule activity into a dense grid |
| Keep one blue button per view | Several solid buttons side by side |
| Use the same icon for the same action | Mix icon sets, or fill icons |
