# Bazaar

Category: marketplace and commerce. Warm and crafted: warm ink on white and a faint warm canvas, a
light serif for display headings and big figures beside a plain sans, an orange brand mark, black
pill buttons that swell a little on hover, 2px outlined secondaries, 12px cards on hairlines, and
listing cards with a photo on top, black stars and green sale prices. For marketplaces and shops
selling handmade, vintage and one-of-a-kind goods, with a quieter seller admin.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `bazaar` preset of `@mariachi/design` (`data-theme="bazaar"`,
`themes/bazaar.css`).

## Principles

- **The goods are the colour.** Photos carry the page. The interface around them is ink, white,
  warm grey and cream, so a shelf of listings never fights its frame.
- **Ink for actions, orange for the brand.** Every primary action is a solid ink pill. The orange is
  the brand's own colour: the wordmark, the search button, brand panels. It never fills a button or
  marks a link.
- **A serif voice, a plain hand.** Display headings, greetings and big figures are a light serif.
  Everything you read to get something done (labels, prices, tables, buttons) is the sans, and bold
  where it must be found.
- **Friendly, never shouty.** Badges are small grey or cream pills at normal weight. Urgency
  ("Only 3 left") is a short brick line, not a banner. Sales are green.
- **Two rooms.** The buyer side is white, wide and photo-led. The seller side is quieter: a white side
  column, a warm canvas and white cards on hairlines.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas | warm off-white `#f9f8f4` (the seller pages); buyer pages sit on white surfaces | `#1b1a18` |
| Surfaces | white `#ffffff`; raised white; sunken `#f5f4f0` | `#242320`, raised `#2d2c29`, sunken `#151413` |
| Text: default, muted, subtle | ink `#222222`, `#595959`, `#6a6a6a` | `#f2f0eb`, `#c4c1ba`, `#a6a39c` |
| Hairlines | the ink at 15% `#dedede`; grey `#eaeaea` | `#3d3b37`, `#2f2e2b` |
| Control borders | `#8c8c8c` (the ink at about 50%) | `#8a877f` |
| Accent (actions, links) | ink `#222222` with white text; links ink and underlined | white with ink text |
| Brand | orange `#f1641e` with ink text; cream `#fdebd2` for brand panels | the same orange; cream `#3b2e1c` |
| Selected rows | orange tint `#f8ebe6` | `#3a2a22` |
| Grey fill (chips, hover, current nav) | `#eeeeee` (the ink at 7.5%), hover `#dedede` | `#2d2c29`, `#3a3935` |
| Sale and success | green `#007634` on `#e4f1e6`; solid `#258635` | `#8fd19e` |
| Brick (errors, low stock) | `#a61a2e` on `#fddcd8` | `#fd9184` |
| Beeswax (notices, "active" pills) | `#8a5500` on cream; solid yellow `#fdd95c` with ink | `#fdd95c` |
| Denim (info, toasts) | `#2f466c` on `#d7e6f5`; solid `#4d6bc6` | `#b8cdf0` |

- **Radius.** 6px for inputs, selects, checkboxes, alerts, toasts and tooltips; 12px for cards,
  menus and photos; 18px for big panels; 24px for dialogs. Every button, chip, badge, count and
  page number is a pill.
- **Borders.** Hairlines are 1px at 15% ink. Secondary buttons, the switch and the search field use
  a 2px ink line; so does the chosen plan or option.
- **Shadow.** Rest is flat. Shadow 01 (`0 4px 20px` at 15% ink) lifts hovered buttons and cards and
  carries menus; shadow 02 (`0 6px 36px` at 32.5%) carries dialogs. Selects sit on a faint
  `0 1px 6px`; inputs have a soft inner shadow.
- **Motion.** 150, 200 and 300 ms, easing out. A hovered button swells 1.5% wide and 3.5% tall on a
  springy curve (`cubic-bezier(0.345, 0.115, 0.135, 1.42)`); pressing it settles it back.
- **Spacing.** A **6px unit**: 6, 12, 18, 24, 30, 36, 48, 60, 72px. The usual gaps are:
  - 6px between an icon and its label, and inside small clusters;
  - 12px between chips and buttons in a row, and between a label and its control row;
  - 18px between fields, between cards, and as table cell height padding;
  - 24px card padding; 36–48px between page sections.
- **Layout.**
  - Seller pages: a 280px white side column with a hairline edge, content on the warm canvas with a
    `clamp(1rem, 3vw, 2.25rem)` gutter.
  - Buyer pages: a white header (wordmark, a long pill search, icon actions) over a department row
    with a hairline, then content to 75rem.
  - Forms in a 48rem column; settings to about 52rem.
  - Listing grids: columns of at least 11rem with 18px gaps.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.85` on the page; controls and
  padding shrink together. Controls are 48px at 1, small ones 36px.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.**
  - **Inter** for all text: 400 for body, 600 for table headers and admin titles, 700 for labels,
    buttons, prices and card titles.
  - **Newsreader** (the serif) at **300** for display headings, greetings, dialog titles and big
    figures, with a touch of tracking (0.015em). Never bold.
  - **IBM Plex Mono** only for codes and order numbers.
- **Sizes** (the reference's own scale):
  - captions, hints and small print 13px;
  - body, labels and buttons 16px, 1.5 line height (1.75 for long reading);
  - section and card titles 18px bold;
  - admin page titles 24px semibold sans;
  - serif headings 24, 32, 44 and 52px, with tight leading (1.125).
- **Case.** Sentence case everywhere. Uppercase only for small side-column group labels and urgency
  lines ("ONLY 3 LEFT"), tracked 8%.
- **Figures.** Tabular figures for prices in tables. Prices are bold sans; a sale price is green with
  the old price struck through in muted 13px and the saving in brackets: **$41.60** ~~$52.00~~
  (20% off). Stat figures are the light serif at 32–44px.
- **Terms.** A figure's label that has an explanation gets a dotted underline ("Shop visits",
  "On hold").

## Icons

- Lucide, outlined, **1.75px stroke**: 20px in the side column and header, 18px in buttons and beside
  text, 16px in small chips, 28–48px in photo placeholders and empty states. The reference's own
  glyphs are solid-looking; the heavier stroke keeps that weight.
- Stars are **filled** ink, 13–15px, right after the rating number; a rating count follows in
  muted brackets.
- The heart for favourites sits in a round white chip with a soft shadow at the top right of a photo.
- Arrows lead links ("All orders →", "Popular in lighting →"); chevrons expand.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal, in a round icon button), close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** a 2px dark line with a dot on every point, over four faint horizontal gridlines;
  date labels underneath in muted 13px; a legend dot and name at the bottom right. In the recipes
  the line takes `--m-color-success-fg`; the chart palette's first colour, spruce `#3f6252`, is the
  reference's own.
- **Change** sits beside the figure: an arrow and the percentage, green up or brick down, with a
  dotted underline that opens the comparison.
- **More series** step through spruce, orange-dark, denim, lavender, beeswax and turquoise.
- Tooltips use the tooltip treatment (ink chip).

## States (every control)

- **Hover.**
  - Buttons swell slightly (1.5% wide, 3.5% tall) and lift on shadow 01; their colour doesn't change.
  - Ghost buttons, chips and side-column rows fill with the 7.5% grey; menu rows with `#eaeaea`.
  - Inputs and selects darken their border to the muted grey; cards lift on shadow 01.
- **Focus.** A 2px ring in the 50% grey, 2px outside the control (the reference draws a white gap
  and a grey halo). Inputs and selects also turn their border ink. Never remove it.
- **Pressed.** The button settles back to its size and drops the shadow; ghost fills deepen to 15%.
- **Disabled.** Half opacity, `not-allowed` cursor.
- **Error.** The control's border turns brick; the message sits under the field in brick at body size,
  starting with the alert icon, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` hides the label behind a spinner.
  - Lists and photos show skeleton blocks that sweep slowly from 7.5% to 15% grey (2s).
  - A ring spinner in ink, 4px thick, over a 15% track, for small areas only.
- **Selected and current.**
  - Checked controls are solid ink with a white mark; the switch fills with ink.
  - The current side-column row is bold on the grey pill; the current tab is ink with a 2px ink
    line; the current page number is a solid ink circle.
  - Chosen options and plans get a 2px ink ring; selected table rows the orange tint.

## Components

All 36 of the library's components, as Bazaar draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 75rem, or 48rem for forms and settings, 30rem for narrow ones;
- `m-split`, a 280px side column beside the main one (seller pages);
- `m-grid`, for cards and listings: 18px gaps, 11rem columns for listing cards, 15rem for stat cards,
  24rem for larger cards;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 36–48px apart.

**Actions and forms**
- **Button.** Always a pill, 16px bold, 48px by default and 36px (`sm`) in chips and table rows.
  - **Primary:** solid ink, white text. One or two per view ("Add to basket", "Save and continue").
  - **Secondary:** transparent with a 2px ink outline ("Buy it now", "Edit", "Save this search").
  - **Ghost:** transparent, filling grey on hover, for icon buttons and quiet actions. With the grey
    at rest (`--m-button-ghost-bg: var(--m-button-ghost-hover-bg)`) it is the reference's tertiary
    pill: filter chips, "Pay out now", "Last 14 days ▾".
  - **Danger:** solid brick, only to confirm closing or deleting.
  - **Icon-only:** a round pill with an `aria-label`; over photos, a white chip with a soft shadow.
- **Input, textarea.** 48px, 6px radius, white, a 1px grey border, a soft inner shadow. Hover darkens
  the border, focus turns it ink and adds the ring. Search fields are pills; the main search has a
  2px ink border and ends in a round orange button.
- **Select.** The input's box on a faint drop shadow, with a chevron.
- **Field.** The label above in 16px bold, the control, then a 13px grey hint or the brick error.
  Required fields get a brick asterisk. Fields stack 18px apart; short pairs (city, ZIP) sit side by
  side.
- **Checkbox, radio.** 24px, a 2px grey border; the checkbox has 6px corners. Checked is solid ink
  with a white tick or dot.
- **Switch.** 48 × 28px (40 × 24 small) with a 2px ink outline and an ink knob; on, it fills with ink
  and the knob turns white. Off, the track is the control grey. It takes effect at once.

**Navigation**
- **Sidebar** (seller pages). White, 280px, a hairline on the right.
  - Top: the shop's round mark, its name at 18px semibold and a chevron.
  - Groups of 16px rows about 38px tall, each with a 20px icon; a chevron at the right of rows that
    open a group; a solid denim "New" badge for something new.
  - Counts are orange-dark circles with white numbers (a grey circle for a quiet count).
  - The current row is bold on the grey pill.
  - Group labels are 13px semibold uppercase, tracked, in muted grey; channel rows have a small
    square tile with an initial and a second line in muted 13px.
- **Navbar** (buyer pages). White, 72px, the serif wordmark in brand orange, the long pill search,
  "Sign in" as a text link and round ghost icon buttons (favourites, gifts, basket). Under it, a row
  of department links with a hairline below.
- **Tabs.**
  - **Underline:** 16px grey labels with 12px side padding over a grey rule; the current one ink with
    a 2px ink line under the label. Counts sit after the label in muted grey.
  - **In-page menu** (settings): plain rows on a hairline at the left; the current row bold with a 2px
    brand-orange bar (a `m-sidebar` with its indicator set to the brand colour).
  - **Pill** (segmented): a grey pill track with the chosen segment white on a soft shadow.
- **Breadcrumb.** 13px ink links, underlined, with "›" between; the current page in muted grey.
- **Pagination.** 48px circles: arrows and numbers in ink, the current page a solid ink circle.

**Data and content**
- **Table.**
  - No frame and no header fill. Headers are 16px semibold ink, in sentence case.
  - Rows sit on 15% hairlines with 16px vertical padding; hover tints them warm grey.
  - Product rows lead with a 56px rounded photo and an underlined title.
  - Numbers right-aligned; low stock in brick.
  - A checkbox column on the left when rows can be selected; selected rows take the orange tint.
- **Card.** White, 12px radius, a 15% hairline, no resting shadow, 24px padding; hover lifts it on
  shadow 01. Card titles are 18px bold sans. Stat cards put a dotted-underlined label over a light
  serif figure.
- **Listing card** (built from the stack, not a component). A photo first (6px corners, a heart
  chip, sometimes a white "Best loved" badge), then a one-line 13px title, the rating with a filled
  star and a muted count, the price in bold (green if on sale, old price struck), a muted line such
  as "Free delivery" or a green "Sale ends in 2 days", and a small outlined "+ Add to basket" pill.
- **Badge.** A 25px pill, 13px at normal weight:
  - grey (`#eaeaea`) for neutral states ("Personalised");
  - green tint ("Paid"), cream ("Gift wrapped"), brick tint, denim tint;
  - solid yellow with ink ("Most shops"), white over photos.
- **Avatar.** Round; initials on the grey, bold. The shop's own mark sits on the cream.
- **Divider.** A 15% hairline.
- **Accordion.** Open rows on hairlines with no side borders: 18px semibold summaries with a chevron,
  the content in body text.
- **Code, kbd.** IBM Plex Mono on the grey, 6px radius.
- **Prose.** 16px with a 1.75 line height, about 42rem wide, ink links underlined; headings in the
  serif.
- **Progress.** An 8px pill: ink on the grey track. **Meter** is the same bar in green, beeswax or
  brick by level.
- **Usage.** A label and amount over the meter bar.

**Feedback and overlays**
- **Alert.** A flat block in the tone's pale colour with a faint border of the tone, 6px corners,
  18px padding, a 20px icon, a bold title, and at most one secondary action on the right.
- **Toast.** A floating denim notice (`#2f466c`) with white text and pale-denim detail, 6px corners,
  shadow 01, up to about 38rem wide, bottom centre.
- **Dialog.** White, 24px corners, 30px padding, shadow 02 over a 65% ink scrim. The title is the light
  serif at 24px. Actions sit at the bottom right: the primary pill last, Cancel as a secondary or ghost.
  420px for a confirm, 580px by default, 740px large.
- **Popover and menu.** White, 12px corners, a hairline and shadow 01, no inner padding. Rows are
  48px, 16px text, 18px side padding, full-bleed, grey on hover; the selected row carries a tick on
  the right.
- **Tooltip.** An ink chip with white 13px text, 6px corners, 12px padding.
- **Spinner.** An ink ring, 4px, over a 15% track.
- **Skeleton.** Grey blocks (12px corners for photo blocks, 6px for text lines) with a slow sweep.

**AI and chat**
- **Chat.** Conversations with a shop: your own messages on deep denim with white text, theirs on
  white with a hairline, 18px corners; round avatars; timestamps muted 13px.
- **Composer.** A white box with 24px corners, a control-grey border that turns ink while typing; Send
  is a round ink pill.
- **Thinking.** A muted line with a soft pulse. **Tool call:** a hairline row with 12px corners, the
  tool's name and a pill status badge.
- **Citation.** A grey pill with a number; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns brick and the message appears under it, with the alert icon, in
  brick at body size: what's wrong and how to fix it ("A ZIP code has 5 digits."). Validate on blur
  and on submit.
- **In a form:** a brick alert above the form saying what wasn't done and that nothing was lost
  ("We couldn't save your listing. Your words are safe."), with one retry button.
- **Somewhere else:** a denim toast with what happened and one action.
- **A whole page:** centred, on white, with the buyer header.
  - A small tracked label with the code ("ERROR 404"), a 52px light serif line, one sentence and two
    pills (primary home, secondary search).
  - **404:** "This page has wandered off".
  - **500:** "Something went wrong on our side", saying nothing was charged, with Try again.
  - **403:** "This shop is private", with Sign in or Ask the owner.
- **Words.** Plain and warm: say what happened, whether anything changed, and what to do. No codes in
  sentences, no blame.

## Page shapes (recipes)

- **Dashboard** (seller overview). The side column; a serif greeting with a grey chip for the period
  and the primary "Add a listing"; four stat cards (dotted label, serif figure, green or brick change,
  a dotted line); then "Ready to send" in a hairline table beside a payout card and a short list of
  things worth a look.
- **List and detail.** Underlined tabs with counts, grey chip filters and a pill search over the
  inventory table (photos, underlined titles, switches, brick low stock) and round page numbers. Then
  one listing as buyers see it: breadcrumb, a photo strip, a brick urgency line, the sale price, the
  title, shop name and stars, two ticks, selects, "Buy it now" outlined over "Add to basket" in ink,
  and accordions.
- **Onboarding** (opening a shop). The buyer header, a dotted step line, a light serif question,
  photo cards to choose from (an ink ring when chosen), one field and a checkbox, Back and "Save and
  continue".
- **Settings.** A white page beside the side column: an in-page menu (the current row bold, with a 2px
  orange bar on its left), a light serif section heading and a grey line under it, then the label in
  bold over its value with an underlined Edit on the right, row by row on hairlines; switches with
  hints, checkboxes with Save and Cancel, and closing the shop last with the brick button.
- **Empty state.** A cream panel with a round white icon, a serif line, suggestion chips and an
  outlined "Save this search", then a row of listing cards.
- **Pricing.** A 52px serif heading, a segmented billing switch, three plan cards (the chosen one on a
  2px ink border with a yellow badge, serif price), a cream fee example, then a comparison table.
- **Errors.** The full-page 404, a form alert, and an address form with field errors, as one page.

## Words

- Short, warm and plain, sentence case: "Add to basket", "Save and continue", "Worth a look".
- Prices exact with the currency sign; dates short ("Nov 14"); counts as numbers.

## Do and don't

| Do | Don't |
| --- | --- |
| Make every primary action a solid ink pill | Fill buttons with the orange, or make links orange |
| Use the light serif for headings, greetings and big figures | Bold the serif, or use it for labels, prices or buttons |
| Let photos (or their placeholders) lead listing cards | Box listing cards in borders and shadows |
| Show sales in green with the old price struck | Show sale prices in red or orange |
| Keep badges small, grey or cream, at normal weight | Use loud, uppercase, coloured badges |
| Separate rows with hairlines, cards with 12px corners | Zebra stripes, filled table headers, square cards |
| Swell and lift buttons on hover | Change a button's colour on hover |
| Use the same icon for the same action, stars filled | Mix icon sets or colour icons for decoration |
