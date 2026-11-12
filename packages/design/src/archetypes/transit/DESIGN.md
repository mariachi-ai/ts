# Transit

Category: marketplace and commerce. Stark and direct: black on white, big bold geometric headings,
8px controls on a pale grey fill, black 48px actions, a 4px black bar under the current tab, ride
and delivery options as tappable rows, and a map beside the booking panel. For on-demand and booking
apps where people pick a place, compare options and go.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `transit` preset of `@mariachi/design` (`data-theme="transit"`,
`themes/transit.css`).

## Principles

- **Black and white do the work.** Text, the primary action, checks, the current tab and the route
  are black (white in dark mode). Grey fills mark what you can touch. Colour is for status only, plus
  one blue for focus, progress and brand panels.
- **Big, bold, short.** Headings are bold and large (28, 36 and 52px) with slightly tight tracking.
  Labels are medium weight, body is regular. Say it in as few words as possible.
- **Made for a thumb.** Controls are 48px by default, rows are generous, and the chosen option gets a
  2px black edge rather than a colour.
- **The map leads.** Booking screens put a bordered panel beside a large map. The map is always a
  placeholder drawn in tokens (grey ground, white streets, the route in ink), never real map tiles.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff` | true black `#000000`; surfaces `#161616`, raised `#292929` |
| The grey fill: fields, chips, secondary buttons, tiles | `#f3f3f3` | `#292929` |
| Text: default, muted, subtle | `#000000`, `#4b4b4b`, `#5e5e5e` | `#ffffff`, `#c4c4c4`, `#ababab` |
| Hairlines | `#e2e2e2`; fainter `#eeeeee` | `#383838`; `#292929` |
| Action (accent) | black `#000000`, hover `#282828`, pressed `#4b4b4b` | white `#ffffff` with black text |
| Focus and progress | blue `#276ef1` | `#5e8bdb` |
| Brand panels | blue `#276ef1` on `#eff4fe` | the same blue on `#182946` |
| Success, warning, danger, info text | `#166c3b`, `#845201`, `#bb032a`, `#175bcc` | `#8fc19c`, `#d7ac57`, `#ea9b98`, `#93b4ee` |

- **Radius.** 8px for buttons, fields, menus and tooltips; 12px for panels, cards, banners and
  snackbars; 16px for dialogs; 4px for badges and checkboxes. Chips, avatars and header links are
  pills.
- **Shadow.** Mostly none: panels have a 2px pale-grey edge instead. Menus and popovers use
  `0 4px 16px` at 16% black; snackbars and dialogs a long `0 16px 48px` at 22%.
- **Motion.** 150, 200 and 400ms. Colour changes are quick and linear-feeling; things enter with a
  strong decelerate (`cubic-bezier(0.22, 1, 0.36, 1)`).
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px between fields in a group and chips in a row;
  - 12–16px inside panels and rows;
  - 16px between tiles in a grid;
  - 48–64px between page sections on marketing pages.
- **Layout.**
  - App pages: a white header with tabs, then a 20.5rem booking panel beside the map.
  - Account pages: a 15rem side list with a hairline edge.
  - Content to 72rem wide; forms in a 30rem column; settings in 48rem.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.85` on the page; controls and
  padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Figtree (variable) for everything, standing in for the reference's proprietary
  geometric grotesque. Load `@fontsource-variable/figtree`.
- **Weights.** 400 for body, 500 for labels, buttons, tabs and table headers, 700 for headings and
  display. Nothing in between.
- **Sizes:**
  - body 16px with a 24px line; secondary text 14px; captions and hints 12px;
  - card and dialog titles 20px bold; page titles 28 or 36px bold;
  - marketing headings 36px and 52px bold with a 1.23 line height and −1% tracking.
- **Mono.** IBM Plex Mono for codes and the occasional figure in a receipt.
- **Case.** Sentence case everywhere, including buttons and tabs. No uppercase labels.
- **Figures.** Prices in medium weight with tabular figures, right-aligned in rows. A discounted
  price shows the old one struck through in muted 14px underneath.

## Icons

- Lucide, outlined, at a **2px stroke**: 20px beside labels and in rows, 24px in icon tiles, 40–48px
  in empty states and suggestion tiles. Icons are black (or the current text colour), never coloured
  except status.
- Trip ends are not icons: pickup is a black dot in a ring, drop-off a black square with a white
  centre, joined by a line in timelines.
- Vehicles, places and services sit in a square 8px-radius tile on the grey fill (round for people
  and places in lists). No photos or illustrations.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up` (in a round black button), refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** a 2px black line (white in dark), or black bars with 2px gaps. Gridlines are
  hairlines in `#eeeeee`; axis labels muted 12px.
- **More series** step through black, blue, green, orange, purple and teal.
- Highlight one point with the blue and a black tooltip-style tag, like an ETA tag on the map.
- Tooltips use the tooltip treatment.

## States (every control)

- **Hover.** Fills deepen one step: the grey fill goes from `#f3f3f3` to `#dddddd`; black goes to
  `#282828`; ghost buttons and rows take the grey fill. Nothing lifts or moves.
- **Focus.** A 2px blue ring 2px outside the control (`--m-color-border-focus`), on keyboard focus
  only. It's the one place blue appears on a control. Never remove it.
- **Pressed.** One step darker again (`#c6c6c6`, `#4b4b4b`).
- **Disabled.** Half opacity on the grey fill; the cursor shows not-allowed.
- **Error.**
  - The field's edge turns red (`#de1135`).
  - The message replaces the hint under the field in red 12px and says how to fix it.
- **Loading.**
  - A button keeps its size and shows a small blue spinner in place of its label.
  - Lists and panels show grey skeleton blocks (`#e8e8e8`) with a soft shimmer.
- **Selected and current.** A 2px black edge on a chosen option row or card; a black chip with white
  text; a 4px black bar under the current tab and beside the current nav row; a white segment with
  a 2px black edge in a segmented control.

## Components

All 36 of the library's components, as Transit draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 72rem, or 48rem for settings and 30rem for forms;
- `m-split`, a 20.5rem booking panel beside the map, or a 15rem account list beside the page;
- `m-grid`, for tiles and plans: 16–24px gaps, 18rem columns;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 8px corners, weight 500, 16px label. 48px by default, 36px (`sm`) for chips and bars,
  56px (`lg`) for marketing calls to action.
  - **Primary:** black with white text (white with black text in dark). One per view, often full
    width at the bottom of a panel ("Book Standard").
  - **Secondary** (the default): the grey fill, black text, no border.
  - **Ghost:** text only, the grey fill on hover; for "Get help", "Back".
  - **Danger:** solid red, only to confirm something destructive.
  - **Chip:** a `sm` button made a pill; black when chosen.
  - **Icon-only:** a square or round button with an `aria-label`.
- **Input, textarea.** 48px, 8px corners, the grey fill, a 1px mid-grey edge that turns black while
  typing. Trip fields carry a dot or square marker inside, at the start.
- **Select.** The same box as an input, with a chevron.
- **Field.** The label above at 14px medium, the control, then the hint in 12px grey, replaced by the
  error in red.
- **Checkbox, radio.** 17px with a 2px grey edge; black with a white mark when checked. For choices
  that matter, use whole option rows instead: the chosen row gets a 2px black edge.
- **Switch.** 52 × 32, a mid-grey track with a white thumb when off; black with a white thumb when on.
  It acts at once.

**Navigation**
- **Sidebar.** 15rem, white with a hairline edge. Rows are 16px with a 20px icon and 12px padding;
  the current row has a pale grey fill, medium weight and a 4px black bar on its leading edge.
  Counts are small black pills.
- **Navbar** (public pages). A 64px black bar: the brand in medium weight at 28px, links as 36px
  white-text pills that fill dark grey on hover, and a white "Join" pill at the right.
- **App header.** White, the brand, then underline tabs with icons, and a 4px pale-grey baseline
  across the whole header. Account actions sit right as ghost pills and an avatar.
- **Tabs.**
  - **Underline:** 14px medium labels in grey; the current one in black with a 4px black bar on a
    4px pale-grey baseline.
  - **Pill** (the segmented control): a grey track with 12px corners and 4px padding; the current
    segment is white with a 2px black edge and 8px corners.
- **Breadcrumb.** 16px, muted links, "›" between, the current page in black medium. In apps, prefer
  a back arrow.
- **Pagination.** 36px squares with 8px corners; the current page solid black. In lists, prefer
  "Show more" as a secondary button.

**Data and content**
- **Table.** No outer frame. Headers are 16px medium in black on white, cells 14px with 16px padding,
  rows separated by `#e2e2e2` rules and tinted on hover. Prices right-aligned.
- **Card.** White, 12px corners, a 2px pale-grey edge, no shadow, 16px padding; titles 20px bold.
  The chosen card's edge turns black. **Sunken** tiles (the grey fill, no edge) are for suggestions
  and marketing, each with a white "Details" pill.
- **Badge.** 4px corners, 14px medium, a tint with matching text and no border: blue "Fastest", green
  "Low emission", red "Cancelled". Solid black for emphasis ("Most picked").
- **Avatar.** Round, black with white initials (light grey with black in dark). 32px in bars, 40px
  in rows, 56–80px in profiles.
- **Divider.** A faint `#eeeeee` rule; heavier `#e2e2e2` rules separate rows in lists and receipts.
- **Accordion.** Rows on a faint rule, 16px medium questions, 14px answers in black, no box.
- **Code, kbd.** IBM Plex Mono on the grey fill with 4px (inline) or 8px (block) corners, no border.
- **Prose.** 16px with a 24px line, at most about 68 characters a line; links black and underlined.
- **Progress.** A 4px bar in blue on a `#e8e8e8` track, barely rounded (2px).
- **Meter.** The same bar; green when fine, amber close to the limit, red past it.
- **Usage.** A label and amount over the 4px bar, the amount in tabular figures.

**Feedback and overlays**
- **Alert** (the banner). The tone's tint, black text, a 20px status icon, 12px corners, 16px
  padding, no border or stripe. The title in medium weight, the body regular. Brand promos use the
  pale blue tint.
- **Toast** (the snackbar). Dark grey `#282828` in both modes, white text, 12px corners, the long
  soft shadow, up to 25rem. One line, one pill action ("Update card", "Undo").
- **Dialog.** White, 16px corners, over a 50% black scrim. A 20px bold title, 14–16px body, actions
  stacked full width on narrow screens or right-aligned with the primary last.
- **Popover and menu.** White, 8px corners, the 16px soft shadow, 8px vertical padding. Rows are
  square, full width, 14px, and fill grey on hover; a destructive row in red.
- **Tooltip.** Dark grey `#282828` with white 12px medium text, 8px corners, 8px by 12px padding.
- **Spinner.** A 3px blue arc on a grey ring.
- **Skeleton.** `#e8e8e8` blocks with 4px corners (8px for panels), shimmering to `#f3f3f3`.

**AI and chat**
- **Chat.** Like messaging a driver: your own messages in black bubbles with white text, the other
  side on the grey fill, 12px corners, timestamps muted 12px.
- **Composer.** The grey fill with 12px corners and a mid-grey edge that turns black while typing;
  send is a round black button with `arrow-up`.
- **Thinking.** A muted line ("Finding drivers…") with a soft pulse.
- **Tool call.** A hairline-edged row with 8px corners, a 20px icon, the name and a 4px-radius status
  badge.
- **Citation.** A small grey pill with a number; the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns red and the message replaces the hint. Check on blur and on submit,
  never while someone is still typing.
- **In a form:** a red-tinted banner above the form that counts the problems and says what didn't
  happen ("Check 2 details. Nothing has been booked yet."). Each field shows its own message.
- **Somewhere else:** a dark snackbar with what happened and one pill action ("Payment didn't go
  through · Update card").
- **A whole page:** left-aligned in the content column, like a marketing section.
  - A 64px grey circle with the icon, "Error 404" in small mono, a 36px bold title, one sentence and
    one or two buttons (black first).
  - **404:** the page can't be found, with Go home.
  - **500:** "Your trip and payment are unchanged", with Try again.
  - **403:** the item belongs to another account, with Switch account.
- **Words.** Say what happened, whether anything changed, and what to do next. Short, plain, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard** (the booking home).
  - The app header with service tabs.
  - A bordered booking panel: a bold title, the two trip-end fields, "Leave now", rider chips.
  - "Choose a ride": option rows with an icon tile, name and seats, timing, a tag and the price;
    the chosen row has a 2px black edge. The payment row and a full-width black Book button last.
  - The map placeholder fills the rest; grey suggestion tiles follow below.
- **List and detail.**
  - The account side list, a 36px title and pill filters.
  - Trip rows with icon tiles; the open one edged in black.
  - The detail as a card: map, driver row with rating, the dot-and-square timeline, and the fare
    with a ruled total.
- **Onboarding.** A black header, one 30rem column, a blue progress bar, a bold question, choices as
  edged rows, grey fields, and a full-width black Continue with Back below.
- **Settings.** The account side list, a big title and avatar, label-and-value rows with a chevron,
  switches that act at once, and deletion last with a danger button.
- **Empty state.** A 96px grey circle with the icon, a bold 28px heading, one sentence, and a black
  and a grey button stacked.
- **Pricing.**
  - The black public header.
  - A 52px heading beside a segmented Monthly/Yearly switch.
  - Three edged plan cards: the picked one in black with a solid badge and the black button.
  - A full-bleed black block with a white action, then an FAQ.
- **Errors.** The field, form, snackbar and full-page errors above, as one page.

## Words

- Sentence case, short and direct: "Book a ride", "Choose a ride", "Leave now", "Get help".
- Money with the symbol and numerals ("$18.40"); ranges with an en dash ("$9 – $12"); times as
  "6:42 pm"; dates short ("Oct 28").

## Do and don't

| Do | Don't |
| --- | --- |
| Use black for the one action and white text on it | Colour the primary button, or use blue for links |
| Fill fields and secondary buttons with the grey | Draw heavy outlines around every field |
| Mark the chosen row or card with a 2px black edge | Show selection with a coloured background |
| Set headings bold and big, tracked slightly tight | Use light or thin weights for headings |
| Keep 8px corners on controls, 12px on panels | Round buttons into pills (pills are for chips) |
| Draw the map as a token placeholder | Embed real map tiles, photos or illustrations |
| Keep the blue for focus, progress and brand panels | Spread blue across buttons, icons and text |
