# Basalt

Category: calm fintech. Flat and exact: near-black ink on white and warm off-white, square panels
drawn with a warm hairline, one electric lime button per view, lime pills for counts, and green for
anything confirmed. Pills appear only for counts, avatars and toolbar controls. For finance
operations tools where people clear queues of cards, bills and expenses quickly.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `basalt` preset of `@mariachi/design` (`data-theme="basalt"`,
`themes/basalt.css`).

## Principles

- **Square and drawn, not floated.** Buttons, inputs, panels, tables and dialogs have square corners
  and a 1px warm hairline. Nothing rests on a shadow; only menus, toasts and dialogs lift.
- **One lime button.** The electric lime fills the single next action on a screen ("Issue card",
  "Export all", "Continue"). Everything else is ink, warm grey and white. Pale lime marks counts
  that want attention.
- **Green means done or allowed.** Checked boxes, switches that are on, progress and "Approve" are
  green. Warnings are ochre, problems are orange-red, suggestions are denim blue.
- **Big titles, quiet text.** Page titles are large and tightly tracked under a muted eyebrow; body
  text is regular weight and small. Weight never carries hierarchy; size and colour do.
- **Queues first.** Lists are dense two-line tables with a status tag and one outlined action per
  row, under underline tabs that show how many are in each state.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | dashboards on warm off-white `#fcfbfa`; lists, forms and panels white `#ffffff` | `#121110`, panels `#1a1919`, raised `#232221` |
| Sidebar, search field, quiet fills | `#f4f2f0` | `#1e1d1c` |
| Text: default, muted, subtle | `#1a1919`, `#6e6a68`, `#75716e` | `#f4f2f0`, `#b9b4b1`, `#a39d99` |
| Hairlines | panels and buttons `#d2cecb`; dividers and the sidebar edge `#e9e5e2` | `#3a3735`; `#2b2927` |
| Control borders | `#8f8985` (inputs, switch track) | `#7a7470` |
| Primary action | lime `#e4f222` with ink text; hover `#d3e01f` | the same |
| Counts | pale lime `#f5ff78` | `#3a3d10` |
| Highlights, AI-filled fields, accent notices | the palest lime `#feffe1` | `#2c2e10` |
| Accent (focus, tab line, spinner, links) | ink `#1a1919` | `#f4f2f0` |
| Done, allowed | text `#26763b` on `#e4f2e7`; border and fills `#24863e`; checked controls `#01a741` | `#7fd49a` on `#15301e` |
| Warning | ochre `#876634` on `#f7f5e6`; border `#af7a2b` | `#e3c27a` on `#2e2814` |
| Problem | orange-red `#b74018` on `#f7e5d9`; border and fills `#cf491e` | `#f29a78` on `#3a1d12` |
| Suggestion, info | denim `#425e93` on `#f2f5f9`; border `#5683d2` | `#a9c0ec` on `#1a2335` |
| Avatars | dusty pink `#deb1b9` with ink initials | the same |

- **Radius.** 0 for buttons, inputs, selects, panels, tables, dialogs, menus and tooltips. 4px for
  status tags, nav items, key caps and the search field; 8px for the open nav group and marketing
  tier panels; full pills for counts, avatars, switches and toolbar controls (search, icon buttons,
  filter chips, "Options").
- **Borders.** 1px everywhere. Panels and secondary buttons use `#d2cecb`; dividers `#e9e5e2`.
  Notices and toasts take a 1px border in their tone. The featured pricing tier gets a 3px lime
  border.
- **Shadow.** None on panels and buttons. Menus and toasts: `1px 4px 8px` at 15% and `2px 12px 24px`
  at 10%, plus a 1px warm ring. Dialogs fall long and to the lower right (`10px 16px 40px`, then
  `40px 60px 72px`, then `84px 124px 90px`). Tooltips sit on a hairline ring and a 1px drop.
- **Motion.** 150, 200 and 250 ms, `ease-in-out`. Colour changes are quick; the switch knob slides
  in 250ms; link arrows nudge 0.25em on hover. Nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px inside a control group and between toolbar controls;
  - 12–16px between fields and stacked task rows;
  - 20px inside panels and rows;
  - 32–40px between page sections.
- **Layout.**
  - A 216px sidebar on `#f4f2f0` with an `#e9e5e2` edge.
  - A top bar with a wide search field, then content with 56px gutters
    (`clamp(1rem, 4vw, 3.5rem)`), up to 80rem; tables run the full width.
  - Full-page flows (create, set up) in a 768px (48rem) column under their own bar with a round
    close button; forms inside narrow to 30rem only when standalone.
  - The home page puts a 288px action column on the right.
- **Density.** 1 by default; rows are 64px with two lines. For dense data screens, set
  `--m-density: 0.85` on the page; controls and padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The lime is
`var(--m-button-primary-bg)`, the count lime `var(--m-sidebar-count-bg)` and the palest lime
`var(--m-color-accent-subtle)`. The exact scales are
in the reference at the end.

## Type

- **Family.** Geist (variable) for everything, Geist Mono for codes and key caps. It's a tight
  neo-grotesque with the same width and flat terminals as the reference face.
- **Weights.** Body at 400 (the reference's light cut reads as a regular); buttons, tabs and nav at
  480; headings at 460; 700 only for the title of a problem notice.
- **Sizes:**
  - body 16px with a 1.5 line height; table cells, nav, buttons and secondary text 14px;
  - labels, table headers, captions and counts 12px;
  - section titles 20px; the home greeting and figures 28px;
  - page titles 40px with a 48px line; full-page flow titles 56px at a line height of 1;
  - marketing headings 56px, regular weight, very tight.
- **Tracking.** −0.02em on everything 20px and up (−0.8px at 40px, −1.12px at 56px). Normal below.
- **Case.** Sentence case everywhere. No uppercase in the product.
- **Figures.** Tabular figures, at one size, with the currency code after: `$1,578.89 USD`. Summaries
  round to `$405K` and `$1.9M` with an arrow that links to the detail.

## Icons

- Lucide, outlined, drawn at **1.25px at 16px** (stroke-width 1.875 on Lucide's 24px grid): 16px in
  navigation, buttons, rows and toolbars; 12px inside tags and footers; 20px in round icon tiles for
  tasks, empty states and errors. Never filled.
- Every nav item has an icon; icon tiles are 40px circles on the warm fill.
- Status tags lead with a 12px icon (`triangle-alert` for review, `octagon-alert` for out of policy).
- **The same icon for the same action, every time:**
  - add `plus`, edit `square-pen`, delete `trash`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis-vertical` (in a round icon button), close `x` (in a round outlined button);
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `octagon-alert`.

## Charts

- **Small and inline.** Charts live inside balance panels, beside the figure, without axes or
  gridlines.
- **Spend** is a 1.5px denim line over a denim fade (35% to 0%). **Balances** are a filled area under
  a line (green, or sage under plum). **Composition** is a flat 6px bar split into square segments
  (denim settled, green pending, warm grey available).
- **More series** step through denim, green, plum, sage and ember.
- Change is a small arrow and a dotted-underlined percentage in denim, never colour alone.

## States (every control)

- **Hover.** Fills deepen one warm step: white goes to `#f4f2f0`, `#f4f2f0` goes to `#e9e5e2`, the
  lime to `#d3e01f`. Text links underline; arrow links nudge right. Rows take the off-white.
- **Focus.** A 2px ring in the ink colour, 2px outside the control, on keyboard focus only. Never
  remove it.
- **Pressed.** One more step: `#e9e5e2` on secondary buttons, `#c2ce1c` on the lime. Nothing moves.
- **Disabled.** Half opacity on the warm fill; the cursor shows not-allowed. Say why nearby.
- **Error.**
  - The control's border turns orange-red (`#cf491e`).
  - The message replaces the hint under the field, in orange-red 12px, and says how to fix it.
- **Loading.**
  - A button keeps its width and label; `aria-busy="true"` swaps the label for a small spinner.
  - Lists and panels show square skeleton blocks shimmering from `#f4f2f0` to `#fcfbfa`, never a
    spinner over the whole page.
- **Selected and current.** Nav: the `#e9e5e2` fill, 4px radius; inside an open group, the current
  item is the lighter `#f4f2f0`. Tabs: ink text over a 2px ink line. Checked controls: green.
- **AI-filled.** A value the product filled in sits on pale lime until someone changes it.

## Components

All 36 of the library's components, as Basalt draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 80rem with 56px gutters, 48rem for full-page flows and settings
  panels, 30rem for standalone forms;
- `m-split`, the 216px sidebar beside the page, or the home page's 288px action column;
- `m-grid`, for panels: balance panels share their borders (gap 0); tier panels gap 24px;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 32–40px apart.

**Actions and forms**
- **Button.** Square, 14px at weight 480, 40px by default, 32px (`sm`) in toolbars, 56px (`lg`) in
  full-page flows and the home action column.
  - **Primary:** solid lime, ink text, no border. One per view.
  - **Secondary** (the default): white, ink text, a 1px `#d2cecb` hairline.
  - **Ghost:** text only; "Cancel" is a ghost button with an underline.
  - **Danger:** solid orange-red with white text, only to confirm something destructive. A
    reversible decision ("Reject") is a secondary button with an orange-red border and text;
    "Approve" is the same in green.
  - **Icon-only:** square in rows ("Mark ready" as an outlined green check); a round pill in toolbars
    and bars ("More", "Close").
  - A count inside a button sits in an ink ring: "Export all (53)".
- **Input, textarea.** Square, white, a 1px control border, 40px, or 56px in forms. Focus turns the
  border ink and adds the ink ring. Search fields in toolbars are pills; the global search is a
  4px-rounded warm field with ⌘ K key caps.
- **Select.** The same box as an input, with a small chevron (or the up-down chevrons for pickers).
- **Field.** A 12px muted label, the control, then a 12px muted hint or the orange-red error. The
  required mark is an asterisk on the label. Fields stack 16px apart; short pairs sit side by side.
- **Checkbox, radio.** 16px, 2px radius, a muted-ink border at rest, solid green with a white mark
  when checked. Their hover fills a round warm halo.
- **Switch.** 36 × 20px, a warm-grey track off, green on, a white 16px knob with no shadow. It takes
  effect at once: no Save.

**Navigation**
- **Sidebar.** 216px on `#f4f2f0` with an `#e9e5e2` edge.
  - Top: the company mark and name, then a "Setup guide" callout with a thin green progress bar.
  - Items are 32px, 14px, muted, with a 16px icon; hover fills `#e9e5e2` at 4px radius.
  - The open group is a rounded (8px) `#e9e5e2` block: its title in ink, its items indented, the
    current one on the lighter `#f4f2f0`.
  - Counts are pale-lime pills, right-aligned. Groups are separated by full-width hairlines; the
    assistant sits alone at the bottom.
- **Navbar** (public pages). White, 62px, a hairline under it, ink links at 14px, and two square
  actions at the right: lime "See a demo" style and an ink "Get started".
- **Top bar** (in the app). A hairline under it; a wide warm search field with key caps, then round
  ghost icon buttons (notifications, create, help) and the pink avatar.
- **Tabs.**
  - **Underline:** 48px tall with 16px side padding (the line spans it), 8px apart; muted text, the current tab ink over a 2px
    ink line, on a hairline. Each tab can carry a count pill; the current tab's count is an ink ring.
  - **Pill** (segmented): a square warm track with a white square segment for the current option.
- **Breadcrumb.** In the app, a muted 16px eyebrow above the title ("Accounting") replaces
  breadcrumbs; full-page flows use "← Back". Elsewhere, muted links with "/" and the current page in
  ink.
- **Pagination.** "1–50 of 151 transactions" in a footer strip with the total and a next arrow;
  numbered pages, where needed, are square with the current one in ink.

**Data and content**
- **Table.**
  - White cells on a full-width table, no outer frame, no header fill.
  - Headers are 12px muted, regular, sentence case.
  - Rows are 64px with two lines: the name in 14px ink, the detail in 12px muted. Merchants get a
    round 32px tile.
  - Amounts right-aligned, tabular, with the currency code.
  - A status tag column, then one outlined action and a round "more" button.
  - A toolbar strip on the off-white above (pill search, date, a filter chip group, view toggles,
    "Options"), and a footer strip below with "Select" and the count and total.
  - A warning about one row spans the table on the problem tint, led by a corner arrow.
- **Card.** A panel: white, square, a 1px `#d2cecb` border, no shadow, 20px padding. Titles are 16px
  regular, not headings. Read-only values stack as a muted 12px label over a 16px value, rows divided
  by hairlines.
- **Badge.** 22px, 12px, regular, 4px radius, no border:
  - neutral `#e9e5e2` with ink ("Tracking");
  - green tint ("Mark ready", "Complete"), ochre tint ("Review category"), orange-red tint ("Out of
    policy"), each with a 12px icon;
  - counts as pills: pale lime when they want attention, warm grey otherwise.
- **Avatar.** Round, dusty pink with ink initials for people; 24px in rows, 32px in bars, 40px for
  tiles. Companies and merchants get a round warm tile with initials or a category icon.
- **Divider.** A full-width `#e9e5e2` hairline.
- **Accordion.** Separated square boxes 16px apart, each with a hairline border, 16px regular
  summary text and a chevron on the right. Policy sections in forms use the same boxes.
- **Code, kbd.** Geist Mono at 13px on `#f4f2f0`. Key caps are white with a `#d2cecb` hairline and a
  4px radius, at 0.8em, uppercase letters.
- **Prose.** Body 16px with a 1.6 line height, at most about 68 characters a line, links in ink with
  an underline.
- **Progress.** A 4px square bar: green on `#e9e5e2`. The setup guide and spend limits use it; spend
  limits draw it in denim.
- **Meter.** The same bar; it turns ochre, then orange-red, past its marks.
- **Usage.** A label and the amount left ("$995.39 left") over a 4px bar.

**Feedback and overlays**
- **Alert** (notice).
  - Square, 1px border in the tone, on the tone's tint (neutral: white with the `#d2cecb` hairline).
  - A 16px icon on the left; the title at 480 in the tone colour, the body in muted ink.
  - A problem notice above a form says what was not done ("Nothing was scheduled").
- **Toast.**
  - Bottom right, 400px, square, off-white with a `#75716e` hairline and the menu shadow.
  - A tone toast takes its tint and a 1px tone border; the title in the tone colour.
  - One action ("View", "Undo"). Success toasts close after 5s; problems stay until dismissed.
- **Dialog.**
  - White, square, no border, the long lower-right shadow over a 40% ink scrim, 32px padding.
  - The title is 20px; actions on the right: the lime primary last, Cancel as an underlined ghost.
  - A destructive confirm restates the effect in figures and uses the danger button.
- **Popover and menu.**
  - White, square, the menu shadow with its warm ring, 4px inner padding.
  - Items are 36px rows at 14px with a 16px icon, highlighting in `#f4f2f0`.
  - Hairlines between groups; a destructive item in orange-red at the bottom.
- **Tooltip.** White with a hairline ring, ink 12px text, square, 4px 8px padding, no arrow. It
  appears after 300ms. A tone tooltip takes a tone border and text.
- **Spinner.** A thin ink ring. Inside buttons and small areas only.
- **Skeleton.** Square warm blocks at text and figure sizes, shimmering softly; the shimmer stops
  under reduced motion.

**AI and chat**
- **Chat.**
  - The assistant's messages sit on white with no bubble; its avatar is a lime circle with the
    asterisk mark.
  - The person's own messages are on `#f4f2f0`, square, right-aligned.
  - Timestamps are muted 12px.
- **Composer.** A square white box with a control border that turns ink while typing; Send is a
  round lime icon button with the `send` icon; attachments are 4px warm tags.
- **Thinking.** A muted line ("Thinking…") with a soft pulse. **Tool call:** a square hairline row
  with a 16px icon, the tool name in mono and a 4px status tag.
- **Citation.** A small warm 4px chip with a number; the source opens in a popover.
- **Usage**, as above.
- Suggestions from the assistant are denim notices ("Approval recommended" is green text, "Review
  recommended" ochre, "Rejection recommended" an orange-red notice).

## Error handling

- **In a field:** the border turns orange-red and the message replaces the hint. Validate on blur and
  on submit, never while someone is still typing.
- **In a form:** a problem notice above the form says how many things need fixing and what was not
  done ("2 fields need fixing. Nothing was scheduled."). Focus moves to it; each field shows its own
  message.
- **In a list:** a full-width row on the problem tint under the row it's about, led by a corner
  arrow ("This bill may be a duplicate of INV 2041").
- **Somewhere else:** a toast with what happened and one action ("Payment to Harbor Freightways
  failed · View").
- **A whole page:** centred.
  - A 40px round warm tile with a 20px icon, "Error 404" in small mono, a 28px title, one sentence
    and one or two buttons (the lime one first).
  - **404:** "We can’t find that page" with Go home.
  - **500:** "Something went wrong on our side" and "Nothing was changed", with Try again and Contact
    support.
  - **403:** "You don’t have access to this" with Request access.
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - "Good morning, Maya" at 28px on the off-white canvas.
  - One hairline panel of balances that share their borders: card balance with a segment bar, cash
    with a filled area, 90-day spend with a denim area and a dotted percentage.
  - Underline tabs ("All", "My expenses 20"), then "Requires your approval" with stacked task rows:
    a round icon tile, a 16px title, a muted line with the recommendation in its tone, an arrow or
    a Review button.
  - On the right: a full-width lime "Issue card", a "New" menu button, and spend limits with thin
    bars.
- **List and detail.**
  - The eyebrow and a 40px title, with "more", Settings and the lime Export on the right.
  - Underline tabs with counts, the toolbar strip, the two-line table and the footer strip.
  - A row opens a statement page: "$1,048.25 USD at Skyline Air" at 40px, linked people, a
    recommendation notice, "Details" with icon-labelled rows, and Reject and Approve side by side.
- **Onboarding.** A full-page flow: the bar with the step and a round close button, a thin green
  progress line, "← Back", a 56px title, an info notice, square 56px fields, and Cancel, Save draft
  and a lime Continue along the bottom.
- **Settings.** The eyebrow, a 40px "Settings" and underline tabs; square panels of labelled values
  with Edit buttons (verified values show a lock instead); a panel of switches; closing the account
  last with the danger button.
- **Empty state.** The page keeps its title, tabs and lime action. A quiet off-white panel holds a
  round icon tile, a 20px heading, one sentence, the lime action and a secondary one.
- **Pricing.**
  - A centred 56px two-line heading and a 20px muted line.
  - Three 8px-rounded tier panels with a tag on the top edge (warm, lime, ink); the middle one ringed
    in 3px lime. The name and the price in muted at 28px, full-width buttons (warm, lime, ink), and
    grouped feature lists with 12px checks.
  - A comparison table with dotted-underlined features and green check circles, then questions in
    separated boxes.
- **Errors.** The field, form, list, toast and full-page errors above, as one page.

## Words

- Short and direct, sentence case: "Issue card", "Mark ready", "Export all", "Requires your
  approval".
- Recommendations say what to do: "Review recommended", "Approval recommended".
- Figures exact with the currency code; dates short ("Jun 5, 2026").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep buttons, inputs, panels and dialogs square | Round the corners of product controls |
| Use lime for one primary action per view | Use lime for text, borders around everything, or several buttons |
| Draw panels with a 1px warm hairline | Float cards on shadows |
| Show counts as pills: pale lime when they want attention | Use red dots or bold numbers for counts |
| Use green for done, ochre for review, orange-red for problems | Use pure red, or colour without an icon or words |
| Put the status in a 4px tinted tag with an icon | Outline tags, or use pills for statuses |
| Write titles large and tightly tracked, body regular | Bold headings or body text |
| Use the same icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
