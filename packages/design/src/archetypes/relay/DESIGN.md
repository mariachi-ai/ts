# Relay

Category: marketplace and commerce. Bold and appetising: dense near-black type on white, one
signature red for the action and the cart, pill buttons, a grey-filled search pill, outlined filter
chips, image-led store cards with rating, time and fee, underline tabs with an ink bar, and a black
stepper that tracks an order over a map. For delivery and ordering apps with a lot to browse.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `relay` preset of `@mariachi/design` (`data-theme="relay"`,
`themes/relay.css`).

## Principles

- **One red, used sparingly.** The red (`#eb1700`) is for the one action on a view, the cart, the
  current nav row, promo tags and brand bands. Everything else is ink on white with grey fills.
  Never two red buttons side by side.
- **The food sells it.** Store and dish cards lead with a picture. In this library pictures are
  drawn in tokens (a tinted table, a plate, a dish), never photos. Words under the picture are
  short: a bold name, then one grey line of facts.
- **Dense and bold.** Text is near-black (`#191919`), headings are bold with slightly tight
  tracking, and lists pack a lot in: rating, distance, minutes and fee on one 14px line.
- **Everything you tap is round.** Buttons, chips, the search field, the cart and the segmented
  Delivery / Pickup switch are pills; icon buttons are circles. Cards and panels are 16px-rounded
  rectangles.
- **Progress is ink.** Live orders show a black stepper (placed, made, on the way, at your door)
  over a token-drawn map with black round pins.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff` | `#121212`; surfaces `#1a1a1a`, raised `#262626` |
| Tiles and quiet panels | `#f7f7f7` | `#202020` |
| The grey fill: search, secondary pills, segmented tracks | `#f1f1f1`, hover `#e7e7e7`, pressed `#d9d9d9` | `#2b2b2b`, `#363636`, `#424242` |
| Text: default, muted, subtle | `#191919`, `#606060`, `#767676` | `#f7f7f7`, `#bdbdbd`, `#a3a3a3` |
| Hairlines | `#e7e7e7`; fainter `#f1f1f1` | `#333333`; `#262626` |
| Action (accent) | red `#eb1700`, hover `#d91400`, pressed `#b71000`, white text | the same red |
| Destructive (danger solid) | deeper red `#b71000` | the same |
| Red text and tints | `#c62218` on `#fff2f1` | `#ff7a66` on `#3a1410` |
| Brand bands and panels | red `#eb1700`; warm panel `#fff7f5` | red; `#2a1512` |
| Success, warning, danger, info text | `#1f7f37`, `#875400`, `#c62218`, `#1d4ed8` | `#7fd49a`, `#f2c55c`, `#ff8a78`, `#9db8ff` |

- **Radius.**
  - Pills (9999px) for buttons, chips, the search field, segmented switches and the cart.
  - 16px for cards, panels, banners and dialogs; 12px for menus, alerts and drawn pictures in
    banners.
  - 8px for fields, food pictures in cards, tooltips and snackbars; 4px for tags and checkboxes.
- **Shadow.** Almost none on the page: cards have a hairline and a barely-there stack. Round buttons
  floating on a picture get `0 1px 4px` at 20%; menus and the cart drawer `0 4px 16px` at 15%.
- **Motion.** 150, 200 and 300ms on `cubic-bezier(0.4, 0, 0.2, 1)`; entrances on
  `cubic-bezier(0.2, 0, 0, 1)`.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px between chips and between pills in a row;
  - 16px between cards in a grid and inside rows;
  - 24px inside cards; 40px between feed sections.
- **Layout.**
  - App pages: a white 64px header, a 15rem side nav, then the feed in a column up to 76.5rem.
  - The store page: the menu in the main column with the cart drawer (about 22rem) beside it.
  - Forms in a 30rem column; settings in 48rem.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.85` on the page; controls and
  padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Figtree (variable) for everything, standing in for the reference's proprietary
  geometric grotesque. Load `@fontsource-variable/figtree`.
- **Weights.** 400 for body and meta lines, 500 for nav links, 700 for headings, names, buttons,
  tabs and tags. Bold carries the hierarchy; size changes are small.
- **Sizes:**
  - body 16px with a 24px line; meta lines 14px; tags, hints and captions 12px;
  - store and dish names 16px bold; card titles 20px bold; section headings 24px bold;
  - page titles 32px bold; marketing headings 40px bold, tracked −2%.
- **Mono.** DM Mono, only for order codes and receipts.
- **Case.** Sentence case everywhere. No uppercase labels.
- **Figures.** Prices in tabular figures. A store's facts read "4.7 ★ (1,800+) · 0.6 mi · 18 min",
  the fee on its own line under it.

## Icons

- Lucide, outlined, at a **2px stroke**: 16px beside text, 20px in controls and nav rows, 28px in
  category tiles, 40–48px in empty states. Icons take the text colour; red only on the current nav
  row and the empty-state tint.
- Category tiles are 64px grey circles holding a glyph, with the label under them.
- Map pins are black circles with a white glyph on a short stem; the courier is a red dot.
- The rating star is filled, in the text colour.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `arrow-right` (in round grey buttons), expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send-horizontal`, refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** the red as a 2px line or as bars with rounded tops; gridlines `#e7e7e7`; axis
  labels muted 12px.
- **More series** step through red, ink, teal, navy, gold and green.
- Totals and the highlighted point in ink and bold; tooltips use the tooltip treatment.

## States (every control)

- **Hover.** Fills deepen one step: the grey fill goes from `#f1f1f1` to `#e7e7e7`; red to
  `#d91400`; ghost buttons and rows take a pale fill. Cards gain the 16px soft shadow. Nothing
  moves.
- **Focus.** A 2px red ring 2px outside the control (`--m-color-border-focus`), on keyboard focus
  only. Never remove it.
- **Pressed.** One step darker again (`#d9d9d9`, `#b71000`).
- **Disabled.** Half opacity; the cursor shows not-allowed.
- **Error.**
  - The field's edge turns red (`#c62218`).
  - The message replaces the hint under the field in red 12px and says how to fix it.
- **Loading.**
  - A button keeps its size and shows a spinner in place of its label.
  - Lists show grey skeleton blocks in the shape of the cards (`#f1f1f1`, shimmering to `#f7f7f7`).
- **Selected and current.**
  - A chosen filter chip fills ink with white text.
  - The current tab is ink over a 2px ink bar; the current nav row is red text on a red tint.
  - The chosen option row or plan gets a 2px ink edge; the current segment is a white pill.

## Components

All 36 of the library's components, as Relay draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 76.5rem, or 48rem for settings and 30rem for forms;
- `m-split`, the 15rem side nav beside the feed;
- `m-grid`, for store cards (14rem columns) and dish rows (21rem columns), 16px gaps;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** Pills with 16px bold labels. 40px by default, 32px (`sm`) for chips and inline
  actions, 48px (`lg`) for checkout and plan buttons.
  - **Primary:** red with white text. One per view: Checkout, Continue, Place order, the cart.
  - **Secondary** (the default): the grey fill with ink text and no border ("View order", "Edit").
  - **Ghost:** text only, a pale fill on hover; for "See all", "Skip for now".
  - **Danger:** a deeper red (`#b71000`), only to confirm something destructive, so it never reads
    as the main action.
  - **Chip:** a `sm` button on white with a hairline edge; ink with white text when chosen.
  - **Icon-only:** a circle, grey (section arrows, quantity) or white with the small shadow when it
    floats on a picture (add, save, share). Always with an `aria-label`.
- **Input, textarea.** 40px, 8px corners, the grey fill, a mid-grey edge that turns ink while
  typing. The search field is a pill with the icon inside at the start.
- **Select.** The same box as an input, with a chevron.
- **Field.** The label above in 14px bold, the control, then the hint in 12px grey, replaced by the
  error in red.
- **Checkbox, radio.** 18px and 20px with a 2px grey edge; ink with a white mark when checked. For
  choices that matter (drop-off, plans) use edged rows: the chosen one gets a 2px ink edge.
- **Switch.** 52 × 32, a mid-grey track when off, red when on, with a white thumb. It acts at once.

**Navigation**
- **Sidebar.** 15rem on the canvas with no edge. Rows are 16px with a 20px icon and 8px corners;
  the current row is red bold text on a red tint. Group headings 14px bold in ink. Counts are small
  red pills.
- **Navbar** (public pages). White, 64px, a hairline under it; the mark, links in 16px medium that
  fill grey as pills when hovered or current, and a red "Sign up" pill at the right.
- **App header.** White with a hairline: menu, the mark, the Delivery / Pickup segmented pill, the
  address as a ghost button, the search pill filling the middle, then alerts, account and the red
  cart pill with its count.
- **Tabs.**
  - **Underline:** 16px bold labels in grey on a hairline; the current one ink over a 2px ink bar.
    The store page's menu nav is this, sticky under the header, with a list button first.
  - **Pill** (the segmented control): a grey pill track with 3px padding; the current segment is a
    white pill with a small shadow.
- **Breadcrumb.** 14px, "/" between, the current page in medium. In apps, prefer a back arrow.
- **Pagination.** 40px circles; the current page solid red. In feeds, prefer "See all" and arrows.

**Data and content**
- **Table.** No outer frame. Headers are 12px bold in grey, cells 14px with 12px by 16px padding,
  rows on hairlines and tinted on hover. Prices right-aligned.
- **Card.** White, 16px corners, a hairline edge and the faint stack; 24px padding; titles 20px
  bold. Store cards are borderless: a 16:9 picture with 8px corners, then the name and meta lines.
  **Sunken** panels (`#f7f7f7`, no edge) hold promos and category tiles.
- **Badge** (the tag). 4px corners, 12px bold, a tint with matching text and no border: red "20%
  off select dishes", green "Vegan", grey for neutral facts.
- **Avatar.** Round, the grey fill with ink initials in bold. 32px in bars, 40px in rows, 64px in
  profiles.
- **Divider.** A `#e7e7e7` hairline; settings rows and cart lines are separated by it.
- **Accordion.** FAQ rows on hairlines inside a 16px-rounded hairline card, 16px bold questions,
  muted answers, a pale fill on hover.
- **Code, kbd.** DM Mono on the pale fill with 4px (inline) or 8px (block) corners, no border.
- **Prose.** 16px with a 24px line; links in red text.
- **Progress.** A 4px ink bar on a `#e7e7e7` track, fully rounded: the order stepper's track.
- **Meter.** The same bar; green when fine, amber close to the limit, red past it.
- **Usage.** A label and amount over the 4px bar, the amount in tabular figures.

**Feedback and overlays**
- **Alert** (the banner). The tone's tint, ink text, a 20px status icon, 12px corners, 16px padding,
  no border or stripe; the title bold.
- **Toast** (the snackbar). Near-black `#191919` (`#333333` in dark), white 14px text, 8px corners,
  up to 24rem. One line, one white pill action ("Show similar", "Undo").
- **Dialog.** White, 16px corners, over a 50% black scrim. A 24px bold title, actions as pills with
  the red one last (full width on phones).
- **Popover and menu.** White, 12px corners, the soft shadow, 8px padding; rows 40px with 8px
  corners and a pale fill on hover; a destructive row in red.
- **Tooltip.** Near-black with white 12px bold text, 8px corners.
- **Spinner.** A 3px red arc on a pale grey ring.
- **Skeleton.** `#f1f1f1` blocks with 4px corners (12px for cards), shimmering to `#f7f7f7`.

**AI and chat**
- **Chat.** Like messaging the courier: your messages in red bubbles with white text, the other
  side on the grey fill, 16px corners, timestamps muted 12px.
- **Composer.** A white field with 24px corners and the soft shadow, like the floating search on
  the home screen; send is a round red button with `send-horizontal`.
- **Thinking.** A muted line ("Finding a courier…") with a soft pulse.
- **Tool call.** A hairline-edged row with 12px corners, a 20px icon, the name and a 4px status tag.
- **Citation.** A small grey pill with a number; the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns red and the message replaces the hint. Check on blur and on submit,
  never while someone is still typing.
- **In a form:** a red-tinted banner above the form that counts the problems and says what didn't
  happen ("Check the 2 details below. Nothing has been charged."). Each field shows its own message.
- **Somewhere else:** a near-black snackbar with what happened and one white pill action ("Sunday
  Bagel Co. just closed · Show similar").
- **A whole page:** centred in a hairline card.
  - An 80px grey circle with the icon, "Error 404" in small bold grey, a 24px bold title, one
    sentence and one or two pills (red first).
  - **404:** the page has gone, with Back to home.
  - **500:** "Your cart is safe and nothing was charged", with Try again.
  - **403:** the receipt belongs to another account, with Switch account.
- **Words.** Say what happened, whether anything was charged or lost, and what to do next. Short,
  plain, no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard** (the home feed).
  - The app header and the side nav, grouped by time of day, markets and your own things.
  - A live order card: arrival window in 24px bold, the black stepper, one line about the courier,
    and a drawn map beside it.
  - A strip of round category tiles, a row of outlined filter chips, then a red promo band beside
    two grey promo panels with drawn pictures.
  - Sections with a 24px bold heading, "See all" and round grey arrows, over a grid of store cards.
- **List and detail** (the store page).
  - A drawn banner with round white buttons floating on it; the store name in 32px bold over the
    rating line; Delivery / Pickup and "Order together" at the right.
  - An outlined strip with the fee, the delivery time and the hours.
  - The sticky menu nav (underline tabs), then dish rows: name, two muted lines, price and a tag,
    with the picture on the right and a round white add button on it.
  - The cart drawer beside: lines with a quantity pill, the totals with a bold total, and a full
    width red checkout.
- **Onboarding.** A plain header, one 30rem column, the stepper as progress, a 32px bold question,
  edged choice rows, a grey note field, toggle chips and a full-width red Continue with Back.
- **Settings.** The account side nav, a large avatar and name, rows with a medium title over a grey
  value and a chevron, switches for alerts, radios for appearance, and closing the account last.
- **Empty state.** A 96px heart on the red tint, a 24px bold heading, one sentence, a red and a grey
  pill, then store cards to start from.
- **Pricing.**
  - The white public header with a red "Sign up" pill.
  - A centred head: the membership name in a red-outlined pill tag, a 40px heading, one sentence
    and a Monthly / Yearly segmented pill.
  - Three plan cards, each led by a tinted panel that steps up: grey, pink, then the brand red with
    white text for the one to pick (with a white tag). Red ticks, the price over a hairline, and a
    pill: grey for the first two, red for the picked one.
  - Then how it pays for itself, in three tinted icon columns, and an FAQ.
- **Errors.** The field, form, snackbar and full-page errors above, as one page.

## Words

- Sentence case, short and warm: "Go to checkout", "Order together", "See all", "Arriving 7:42 –
  7:52 pm".
- Money with the symbol and cents ("$15.50"); fees spelled out ("$0.99 delivery fee", "$0 delivery
  fee over $15"); distances in miles ("0.6 mi"); times in minutes ("18 min") and as "7:42 pm".

## Do and don't

| Do | Don't |
| --- | --- |
| Step plan panels up from grey to pink to the brand red | Give every plan the same red head |
| Keep the red for the one action, the cart and the current row | Colour secondary buttons, icons or headings red |
| Make buttons, chips and search pills | Use square-cornered buttons or outlined primary buttons |
| Lead store and dish cards with a picture, then bold name and one grey line of facts | Stack long descriptions or several bold lines under a card |
| Mark the current tab with an ink bar and chosen chips in ink | Show selection with a red fill on chips or tabs |
| Draw pictures and maps with tokens | Ship food photos, map tiles, logos or illustrations |
| Pack facts on one line with middle dots | Spread a store's rating, time and fee over separate labels |
