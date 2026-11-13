# Terracotta

Category: warm and friendly, and marketplace. Warm and image-forward: near-black ink on white, one
coral-to-magenta action colour, large rounded photo cards with no frame, a pill search bar with a
coral search disc, panels lifted on a soft shadow, hairline sections and underlined text links. For
marketplaces and booking apps where places, people and photos come first.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `terracotta` preset of `@mariachi/design` (`data-theme="terracotta"`,
`themes/terracotta.css`).

## Principles

- **The photo is the hero.** Cards are a photo with text under it: no frame, no shadow, 20px
  corners, a heart in the corner and at most one white pill badge on the photo. Without real photos,
  use the token-built placeholders the recipes use, never stock art.
- **Ink, white and one warm colour.** Text is `#222222` on white, secondary text is grey. Coral is
  for the moment of commitment (book, search, the brand mark), not for decoration, links or
  selection.
- **Selection is ink.** Chosen tiles, checked boxes, switches, the current tab and focus rings are
  ink. The coral never means "selected".
- **Soft lift, quiet lines.** Only the panel that holds the commit action has both a hairline and
  a soft shadow. Floating cards and the search pill lift on a shadow alone; information panels are a
  hairline alone. Page sections are separated by hairlines and generous space, not boxes.
- **Friendly words, exact numbers.** Sentence case, warm and short; prices are whole and clear, with
  the total underlined.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff`; footer and quiet bands `#f7f7f7` | `#111111`; cards `#191919`; raised `#222222` |
| Text: default, muted, subtle | `#222222`, `#6c6c6c`, `#717171` | `#f7f7f7`, `#a6a6a6`, `#8c8c8c` |
| Hairlines | `#dddddd`; the lighter divider `#ebebeb` | `#2c2c2c`; `#222222` |
| Control borders | `#8c8c8c`, ink on hover | `#6c6c6c`, light on hover |
| Action (coral-magenta) | `#e31c5f`, hover `#d70466`, pressed `#bd1e59`; the gradient runs `#e31c5f` → `#d70466` | `#da1249`, hover `#e31c5f` |
| Brand coral | `#ff385c` (brand mark, search disc, map pins, saved hearts) | the same |
| Links and accent text | ink `#222222`, underlined; the coral tint `#fff5f6` behind it | `#f7f7f7`; tint `#361a21` |
| Neutral fill: secondary buttons, icon buttons | `#f2f2f2`, hover `#ebebeb` | `#2c2c2c`, hover `#3f3f3f` |
| Errors | burnt red `#c13515` on `#fff5f3` | `#e74d2e` on `#241513` |
| Success | `#038026` on `#e6f6e9` | `#12a139` on `#112716` |

- **Radius.** 8px for inputs, menus items, small buttons and image badges' cousins; 12px for buttons,
  panels, menus and the photo mosaic; 20px for photo cards; 32px for full sheets (dialogs); pills for
  the search bar, chips, badges, toggles and the booking action.
- **Shadow.** Four steps, all neutral black:
  - `sm` (chips, photo badges): a 2% ring and `0 2px 4px` at 16%;
  - `md` (the search bar, floating cards): a 2% ring and `0 8px 24px` at 10%; the ring is their
    edge, so they draw no border;
  - `lg` (the booking panel, menus): `0 6px 16px` at 12%;
  - `overlay` (dialogs, toasts): `0 8px 28px` at 28%.
  Dark mode draws them deeper with a faint light ring.
- **Motion.** 200, 300 and 450 ms on `cubic-bezier(0.2, 0, 0, 1)`; entrances use
  `cubic-bezier(0.1, 0.9, 0.2, 1)`. Shadows grow on hover over 200ms; buttons shrink to 96% when
  pressed.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px inside a control group;
  - 16px between fields;
  - 24px between cards and inside panels;
  - 40px between rows of photo cards;
  - 48px between page sections, each opened by a hairline.
- **Layout.**
  - A white header 80px tall, the search bar centred in it.
  - Content to 70rem (1120px) on detail pages, up to 90rem on search grids, with gutters of
    `clamp(1.5rem, 5vw, 5rem)`.
  - Set-up flows in a 35rem column; settings beside a 20rem account column.
  - Photo grids are auto-fit at about 15rem a column, gap 24px across and 40px down.
  - Results sit beside a map that takes about two fifths of the width.
- **Density.** 1 by default. For host tools with long tables, set `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Figtree for everything, a friendly geometric grotesque with a double-storey a and a
  straight-tailed y; load `@fontsource-variable/figtree`. IBM Plex Mono for codes and references,
  small.
- **Weights.** 400 for body; 500 for labels, card titles, buttons and large page titles; 600 for
  section and small headings, prices and the word mark; 700 only for display and the full-page error
  word. A screen uses three weights: 400, 500 and 600.
- **Colour of text.** Running sentences (descriptions, the line under a title, an empty state's
  sentence) are ink. Grey is for the short secondary lines under a card title, hints, captions and
  values in a settings row.
- **Sizes:**
  - body 16px, line height 1.375 (22px); long reading 1.5;
  - secondary lines and table text 14px; captions and badges 12px;
  - card titles 15–16px at 500;
  - section headings 22px at 600, tracked −2%; page titles 32px at 500; listing titles 26px at 500;
  - display 48px and up at 700, tracked −2% to −4%, tight leading.
- **Case.** Sentence case everywhere. Uppercase only for the tiny field captions inside a booking
  panel ("ARRIVE", 10px, 700, tracked 4%).
- **Figures.** Prices are whole where they can be (`$184 night`, `$920 total`); the total is
  underlined. A struck-through price sits before a reduced one.

## Icons

- Lucide, outlined, **2px stroke**: 16px in buttons, chips and inline; 22–24px in lists of
  amenities and the account column (at 1.5px); 32px in choice tiles; 40px in empty states.
- Icons are ink, never coral, except the saved heart (filled brand coral) and status icons.
- The rating star is filled ink and small (12px) before the score.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search` (white on the coral disc), filter `sliders-horizontal`;
  - more `ellipsis`, close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `arrow-up` (in a round button), refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** a 2.5px brand-coral line with round joins, no fill, a single hairline baseline, and
  month labels in muted 12px; the selected month is a solid ink pill.
- **A comparison** (this year and last) adds a dotted plum line under the coral one.
- **More series** step through coral, plum, ink, blue, green, orange and violet.
- Tooltips use the tooltip treatment; legends are small dots before the label with the figure on
  the right.

## States (every control)

- **Hover.** Grey fills deepen one step (`#f2f2f2` → `#ebebeb`); text buttons, rows and menu items
  take `#f7f7f7`; the coral action moves to its magenta end; control borders turn ink; clickable
  panels deepen their shadow.
- **Focus.** A 2px ink ring 2px outside the control (`--m-color-border-focus`), on keyboard focus
  only. Never remove it, and never make it coral.
- **Pressed.** One step darker, and the button shrinks to 96%.
- **Disabled.** Half opacity; grey fills stay grey. Say why nearby if it isn't obvious.
- **Error.**
  - The control's border turns burnt red.
  - The message replaces the help text, 12px, in burnt red, with a 14px `circle-alert` before it,
    and says how to fix it.
- **Loading.**
  - A button keeps its size and says what it's doing ("Confirming"); `aria-busy="true"` swaps the
    label for a small spinner and blocks clicks.
  - Grids show skeleton photos (20px corners) and two text bars, never a spinner over the page.
- **Selected and current.** A 2px ink edge on a pale fill (choice tiles, fee cards); a 2px ink bar
  under the current tab; the current nav item on the grey fill; checked controls ink.

## Components

All 36 of the library's components, as Terracotta draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 70rem for detail pages (set 90rem for search grids), 50rem
  and 35rem for narrower work;
- `m-split`, a 20rem account column beside the main one;
- `m-grid`, for photo cards: about 15rem columns, 24px across and 40px down;
- `m-stack` and `m-cluster`, for everything inside.

Sections are about 48px apart, each opened by a hairline.

**Actions and forms**
- **Button.** 48px tall, 12px corners, 16px at 500.
  - **Primary:** the coral-magenta fill with white text. The booking action is a full-width pill
    painted with the gradient (`--m-button-primary-bg: linear-gradient(to right,
    var(--m-color-accent-default), var(--m-color-accent-hover))` and `--m-button-radius:
    var(--m-radius-full)`). One per view.
  - **Ink primary** for host tools, set-up flows and saves: `--m-button-primary-bg:
    var(--m-color-bg-inverse)` with white text.
  - **Secondary** (the default): the grey fill, ink text, no border ("See all 41 things").
  - **Outline:** white with a 1px ink border, for the one action in an empty state.
  - **Ghost:** ink text, underlined, for "Read more", "Back", "Send", "Save".
  - **Danger:** solid burnt red, only to confirm something destructive.
  - **Icon-only:** a round 40px grey disc in the header; a round coral disc for search.
- **Input, textarea.** 56px, 8px corners, white, a grey border that turns ink on hover and takes the
  ink focus ring. The value is ink at 16px; placeholders grey.
- **Select.** The same box as an input, with a chevron on the right.
- **Field.** The label above in ink at 14/500, the control, then help in grey 12px or the error in
  burnt red with its icon. Optional fields say "(optional)" in grey; nothing is marked with an
  asterisk.
- **Checkbox, radio.** 24px. The checkbox has 4px corners and fills ink with a white tick; the radio
  becomes an ink disc with a white centre.
- **Switch.** 48 × 32, a grey track that turns ink when on, a white knob with a soft shadow. It
  takes effect at once.

**Navigation**
- **Sidebar.** The account column: a 32px "Account" title, then items at 16px with a 22px outline
  icon, 12px corners, the current one on the grey fill. No group headings unless there are more
  than eight items.
- **Navbar.** White, 80px, the coral brand mark on the left (a word mark at 600), the search bar
  centred, and on the right an ink text link ("Host a place") and round grey icon buttons. Its own
  hairline is the only line under it: the page's first section never draws a second one. In host tools the centre holds ink text links, the current one with a pale pill.
- **Tabs.**
  - **Underline:** 14/500 grey labels, the current one ink with a 2px ink bar; category strips put a
    24px icon above each label.
  - **Pill** (the segmented control): a grey pill track with a white knob on a soft shadow.
- **Breadcrumb.** Ink links at 14px with "›" between, the current page grey.
- **Pagination.** Round 32px buttons, ink numbers, the current page an ink disc with white text, and
  chevrons for previous and next.

**Data and content**
- **Table.** No frame and no header fill: grey 14/500 headers, hairline rows, 16px cell padding,
  rows highlight in `#f7f7f7`. A listing column starts with a 48px rounded photo.
- **Card.**
  - **Photo card** (the default for anything browsable): a photo with 20px corners, the title at
    15–16/500 with the rating on the right, two grey lines, and the underlined price. No frame.
  - **Panel** (`m-card`): white, 12px corners, a hairline and the `lg` shadow, 24px padding. Only
    for a panel that holds the commit action: the booking panel, a price breakdown.
  - **Outline** (`data-variant="outline"`): a hairline and no shadow, for information panels
    (earnings, to-dos, a help panel).
  - **Floating** (`--m-card-border: transparent; --m-card-shadow: var(--m-shadow-md)`): no edge, the
    `md` shadow, for a row of cards that sit over the page (reservations, facts on a landing page).
  - **Sunken** (`data-variant="sunken"`): `#f7f7f7`, no border, for tips and promotions.
  - **Choice card:** a 1px hairline edge that becomes a 2px ink edge when chosen.
- **Badge.** A pill, 12px at 600. On photos: white with a soft shadow ("Top rated"). Elsewhere a pale
  tone ("Arrives tomorrow", "Most chosen"), or solid ink for a selected chip.
- **Avatar.** Round, on the coral tint with deep-rose initials; 32px in rows, 48px for a host, 64px on
  a profile.
- **Divider.** A `#dddddd` hairline, full width of the column, opening each section.
- **Accordion.** Hairline rows with no fill, the question at 16/500, the answer in grey, and a chevron
  on the right.
- **Code, kbd.** IBM Plex Mono at 14px on the grey fill, 6px corners inline and 12px for blocks.
  Keys are small hairline boxes.
- **Prose.** 16px with a 1.5 line height, about 40rem wide; links ink and underlined.
- **Progress.** An ink bar on a light grey track with round ends; set-up flows split it into one
  segment a step, square ended, along the foot of the page.
- **Meter.** The same bar; it turns burnt red past the "high" mark.
- **Usage.** A label and amount over the bar, the amount in tabular figures.

**Feedback and overlays**
- **Alert.**
  - The tone's pale wash with no border and 12px corners; a 20px icon on the left; the title at 600.
  - A danger alert says what didn't happen ("Your card wasn't charged").
- **Toast.**
  - An ink chip with white text, 12px corners, bottom left, on the overlay shadow.
  - One line, an optional detail in light grey, one action.
- **Dialog.**
  - A white sheet with 32px corners on a 40% black scrim, the overlay shadow.
  - A close `x` at the top left, the title centred at 16/600 for full sheets or 22px for a confirm.
  - Actions in a footer above a hairline: an underlined ghost on the left, the ink or coral action on
    the right.
- **Popover and menu.**
  - White, 12px corners, the `lg` shadow, 8px inner padding.
  - Items are 14px rows 44px tall with 8px corners, `#f7f7f7` on hover; hairlines between groups;
    the first group in 500.
- **Tooltip.** Near-black `#111111` with white 12/500 text and 8px corners.
- **Spinner.** An ink ring; inside the coral action it is white. Never over a whole page.
- **Skeleton.** `#ebebeb` blocks at photo and text sizes with a slow sweep.

**AI and chat**
- **Chat.**
  - The other side on white with a hairline and 20px corners; the person's own on the grey fill.
  - A round avatar on the coral tint; timestamps grey 12px.
- **Composer.** A pill with a hairline, the `md` shadow and the ink focus edge; send is a round ink
  button with `arrow-up`.
- **Thinking.** A grey line ("Finding places…") with a soft pulse. **Tool call:** a hairline row with
  12px corners, a 16px icon, the tool name and a pill status badge.
- **Citation.** A grey pill with a number, the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns burnt red and the message replaces the help text, with the
  `circle-alert` icon. Validate on blur and on submit.
- **In a form:** a danger alert above the form that counts the problems and says what didn't happen
  ("Two things need a look. Your card wasn't charged and the dates are still free."). Focus moves to
  it; each field shows its own message.
- **Somewhere else:** an ink toast with what happened and one action ("Couldn't save to Coast
  weekends · Try again"). Changed availability is a warning alert that offers what's still open.
- **A whole page:** a huge bold word at 8rem ("Hmm.", "Sorry.", "Not yet."), a 32px grey line, "Error
  code: 404" small, and a short list of underlined links, beside a placeholder image.
  - **404:** "We can't find the page you were after", with links home, to search and to help.
  - **500:** "Something went wrong on our side. Nothing was booked or charged", with Try again.
  - **403:** "You don't have access to this listing", with Request access.
- **Words.** Say what happened, whether money or dates changed, and what to do next. No blame, no
  codes in sentences, no exclamation marks.

## Page shapes (recipes)

- **Dashboard** (the host's day).
  - "Good morning, Ines" at 32px, a pill switch, then a sideways row of reservation panels.
  - Reservation cards float on the `md` shadow with no edge; earnings (this year's coral line over
    last year's dotted plum) and the to-dos sit in hairline outline panels beside a sunken tip; then
    the listings as photo cards.
- **List and detail.**
  - The compact search pill in the header, one row of rounded filter chips that scrolls sideways, a
    grid of photo cards and a map (a picture layer) with white price pins laid over it (the chosen
    one ink).
  - The listing, set off by a full-width divider: title with underlined Send and Save, a five-photo mosaic with 12px outer corners,
    hairline sections, amenities with 24px icons, and a sticky booking panel with the gradient pill
    and the underlined price lines.
- **Onboarding.** A bare header with outline pill buttons, a 32px question, choice tiles that take a
  2px ink edge, then a segmented progress bar at the foot with an underlined Back and an ink Next.
- **Settings.** "Account" and the icon list on the left; label-and-value rows split by hairlines with
  underlined Edit, Add or Update; one row opened as a small form with an ink Save; notification
  switches; closing the account last.
- **Empty state.** The page title, then a hairline-bounded block: an outline icon, a 22px heading,
  one sentence and an ink-outlined action, beside a placeholder photo.
- **Pricing.** The title and an ink sentence beside a leading photo, then three choice cards with
  large figures and ink ticks, a pill switch for the period, a breakdown panel with the gradient
  pill, and questions in an accordion.
- **Errors.** The field, form, toast and full-page errors above, as one page.

### Signature moves

1. **The photo leads.** Most first windows open on a picture: a photo card grid, a mosaic, a photo
   beside the title. On the source's studied screens 69% of first windows have media, and on a place
   page it covers about 40% of the window (`observed`, fingerprint). Photo cards have no frame.
2. **One gradient action per view.** The coral-to-magenta pill or bar, full width, inside a lifted
   panel, with the figure it commits to above it. Everything else is a grey fill, an ink outline or
   an underlined ink word (`observed`, see [patterns/commit-to-the-main-action.md](./patterns/commit-to-the-main-action.md)).
3. **The pill search with a coral disc.** Three questions in one shadowed pill; the disc is the only
   coral in the header (`observed`).
4. **Selection is ink.** A 2px ink edge, an ink bar, an ink disc; never coral (`observed`).
5. **Hairlines, not boxes.** Page sections open with a full-width hairline and 40–48px of space;
   on the source's studied screens 95% of collections are separated by space alone (`observed`,
   fingerprint).
6. **Underlined ink words for quiet actions:** Send, Save, Edit, Read more, the price lines
   (`observed`).

### How a screen is assembled

- **It opens with** the white header, then either the search (browse), the title line with its
  quiet actions (one thing), or a large question (a flow). There is no page-level intro band.
- **Reading order:** picture, title, the facts in one grey line, then sections down one column; the
  action panel sits to the right on wide screens and is sticky.
- **How much one screen does:** one job and one commit action. A second job is a link to its own
  page, not a tab or a second panel.
- **When narrow:** the right panel drops under the content; grids go to one column of full-width
  photo cards; chips and category tabs scroll sideways in one row; the search becomes one rounded
  field. On a phone a place page opens on one full-width photo (`observed`).
- **Too much content:** more sections down the page, each opened by a hairline, with `See all …` as a
  grey-fill button that opens a dialog. Long lists page with round page numbers.
- **No content:** the page title stays and the empty block takes the list's place (see
  [patterns/say-nothing-is-here.md](./patterns/say-nothing-is-here.md)).
- **Three weights, five or six sizes:** a screen uses 400, 500 and 600, and five or six text sizes
  (`observed`: three weights on every studied source screen with the consent banner removed).

The patterns, by job, are in [`patterns/`](./patterns/); the refusals in [never.md](./never.md); the
recipes as precedents in [precedents/index.md](./precedents/index.md).

## Words

- Warm, plain, sentence case: "Book these dates", "Save and leave", "Nothing planned yet".
- Dates short ("Mar 6 – 11"), prices whole, totals underlined, counts in brackets after a rating.

## Do and don't

| Do | Don't |
| --- | --- |
| Let photos (or their placeholders) lead every card | Frame photo cards or put shadows under them |
| Keep coral for book, search, the brand mark and saved hearts | Use coral for links, selection, focus or headings |
| Make selection and focus ink | Show selection in the brand colour |
| Underline links and the total price, in ink | Colour links blue or coral |
| Lift panels that hold an action on the soft shadow | Use heavy or coloured shadows |
| Separate page sections with hairlines and space | Box every section in a card |
| Use one icon set, outlined at 2px | Mix filled and outlined icons, or colour icons for decoration |
