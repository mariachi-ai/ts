# Terracotta

Category: warm and friendly, and marketplace. Warm and image-forward: near-black ink on white, one
coral-to-magenta action colour, large rounded photo cards with no frame, a pill search bar with a
coral search disc, panels lifted on a soft shadow, hairline sections and underlined text links. For
marketplaces and booking apps where places, people and photos come first.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds nine page shapes as HTML using only the library's classes: the seven every
  language has, then `reading` (a help article) and `sign-in`;
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
- **Two families, one look.** The app (browse, a place, trips, account, host tools, flows) and the
  public pages (marketing, reading, sign-in) share ink, white, photos and hairlines; they differ in
  the header, the primary action, the title sizes and the third weight. See
  [The two families](#the-two-families).

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff`; footer and quiet bands `#f7f7f7` | `#111111`; cards `#191919`; raised `#222222` |
| Text: default, muted, subtle | `#222222`, `#6c6c6c`, `#717171` | `#f7f7f7`, `#a6a6a6`, `#8c8c8c` |
| Hairlines | `#dddddd`; the lighter divider `#ebebeb` | `#2c2c2c`; `#222222` |
| Control borders | `#8c8c8c`, ink on hover | `#6c6c6c`, light on hover |
| Action (coral-magenta) | `#e31c5f`, hover `#d70466`, pressed `#bd1e59`; the gradient runs `#e31c5f` → `#d70466` | `#da1249`, hover `#e31c5f` |
| Brand coral | `#ff385c` (brand mark, search disc, saved hearts; on a public page's map, the viewer's own place) | the same |
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
  - **Page widths**, with gutters of `clamp(1.5rem, 5vw, 5rem)` (24px on a phone):
    - 70rem (1120px) for a place page, a reading page and the account: `m-container` as it comes
      (`observed`: the source's place pages are 1120px wide at 1440);
    - 90rem for browse grids and results (`--m-layout-container-max-lg: 90rem`);
    - 35rem for set-up flows and 30rem for the sign-in sheet;
    - marketing sections to about 76rem, their text centred in narrower blocks.
  - **The footer runs wider than the page.** Its band crosses the window and its columns run to
    90rem on every page, so on a 70rem page they reach past the content's edges (`observed`: on the
    source's place and help pages the footer's columns start 48px from the window's edge while the
    content starts at 153px and 188px).
  - Settings sit beside a 20rem account column.
  - Photo grids are auto-fit at about 15rem a column, gap 24px across and 40px down.
  - Results sit beside a map that takes about two fifths of the width.
- **Density.** 1 by default. For host tools with long tables, set `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Figtree for everything, a friendly geometric grotesque with a double-storey a and a
  straight-tailed y; load `@fontsource-variable/figtree`. IBM Plex Mono for codes and references,
  small.
- **Weights, by role.**
  - 400: body, values, the grey lines.
  - 500: titles (page 32px, listing 26px, card titles), labels, buttons and links; section headings
    on public reading pages.
  - 600: section and small headings in the app, every price and total (cards included), the word
    mark, the sign-in title and the booking panel's uppercase captions.
  - 700: display on public pages only, the marketing titles and the full-page error word. Never on an
    app page.
- **Three per page.** App pages use 400, 500 and 600. Marketing pages use 400, 500 and 700: their
  sub-headings are 28/700 or 18/500, never 600. Reading and sign-in pages use 400, 500 and 600.
  - `observed`: three weights in the first window of every studied source screen; the marketing
    windows show 400, 500 and 700; the help articles 400 and 500 with the mark; the sign-in title is
    26/600.
  - The source draws the booking captions at 700, where its place page has no 600. The language
    sets them at 600 so a place page keeps three weights (`inferred`; see
    [questions.md](./questions.md)).
- **Colour of text.** Running sentences (descriptions, the line under a title, an empty state's
  sentence) are ink. Grey is for the short secondary lines under a card title, hints, captions and
  values in a settings row.
- **Sizes:**
  - body 16px, line height 1.375 (22px); long reading 1.5;
  - secondary lines and table text 14px; captions and badges 12px;
  - card titles 15–16px at 500;
  - section headings 22px, tracked −2%: at 600 in the app, at 500 on reading pages; page titles 32px
    at 500; listing titles 26px at 500;
  - the review score 72px on a phone to 100px wide, at 500, tracked −2%, line height 1 (`observed`);
  - marketing display 60px at 700, tracked −3%, line height 64px; 40px on a phone for the first
    title and 32px for the others (`observed`); the full-page error word up to 8rem at 700.
- **Case.** Sentence case everywhere. Uppercase only for the tiny field captions inside a booking
  panel ("ARRIVE", 10px, 600, tracked 4%).
- **Figures.** Prices are whole where they can be (`$184 night`, `$920 total`), at 600 wherever they
  appear (a card, the panel, a total), and the total is underlined. A struck-through price sits before
  a reduced one, at 400 in grey. `inferred`: the source's card prices were not measured (its search
  page never settles), so one price weight everywhere is the language's choice.

## Icons

- Lucide, outlined, **2px stroke**: 16px in buttons, chips and inline; 22–24px in lists of
  amenities and the account column (at 1.5px); 32px in choice tiles; 40px in empty states.
- **Icons are ink.** That covers every outline icon: amenities, rating categories, an empty
  state's icon, a tip's icon, ticks in a list of features, map controls and the place pin.
- **The only coloured icons:** the saved heart (filled brand coral), the white glyph on the coral
  search disc, and status icons inside an alert, a toast or a field error, which take their tone.
- `observed`: on the source every outline icon (amenities, review categories, the host invitation's
  three tiles) is ink; its coloured icons are drawn illustrations, which the language does not carry.
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
  centred, and on the right an ink text link ("Host a place") and a round grey menu button. Its own
  hairline is the only line under it: the page's first section never draws a second one. In host
  tools the centre holds ink text links, the current one with a pale pill.
  - **On a phone** (`observed`): browse pages show only the search, one full-width pill; a place
    page has no header, just round white back, send and save buttons over its photo; a reading page
    keeps the mark, the section's name and a search icon; a marketing page keeps the mark.
  - **In a recipe** (no media queries) the guest header is laid out as flow, so it responds by
    itself: `display: flow-root` on the `m-navbar`, the mark floated to the start, the actions
    floated to the end, and the search in its own box with `min-inline-size: 20rem`. While there is
    room the search sits centred between them; on a phone it drops under them as one full-width row.
    Keep the end to one short text link and one round button so the first row fits 390px. Host tools
    put their links in `m-navbar-nav`, which scrolls sideways instead of wrapping.
  - The source's phone web adds a bottom tab bar (explore, saved, sign in). Recipes don't draw it: no
    library component appears only on phones. A product with its own CSS may add it below 744px,
    with the current item in ink (the source paints it coral; the language keeps current items ink).
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
    15–16/500 with the rating on the right, two grey lines, and the underlined price at 600. No frame.
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
- **Links.** Two kinds (`observed`):
  - **In or under text** (inline links, Read more, a list of related articles, an error
    page's next steps): ink, underlined, 500.
  - **Lists of places to go** (footer columns, nearby places, breadcrumbs): plain ink at 400 with no
    underline; the underline appears on hover in a product (the source's footer links underline on
    hover; its nearby-places grid never does). Recipes have no hover rules, so they draw them plain.
- **Map.** A picture layer with 20px corners at the column's full width, zoom buttons in a white
  rounded stack on the right.
  - Results: white price pills on the `sm` shadow, the chosen one ink.
  - One place: a 48px ink disc with a white `house` glyph and a short point below, on the `sm`
    shadow (`observed` on the source's place pages).
  - Brand coral marks a place only on a public page's map, for the viewer's own place (`observed` on
    the host invitation).
- **Footer.** A `#f7f7f7` band across the window, its content to 90rem.
  - Three link columns: a 14/500 ink heading, then 14/400 ink links about 36px apart.
  - Under a light `#ebebeb` hairline, the legal row: "© 2026 Name · Privacy · Terms" at 14px on the
    left; the language (with `globe`) and the currency at 14/500 on the right.
  - On a place page the band opens with a breadcrumb of where the place is and a grid of nearby
    places (name 14/500 ink, a grey 14px line, no underline), at the page's width.
  - On a phone the columns stack (`m-grid`, about 15rem a column).
  - `observed` on the source's place, help, browse and host pages.
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

## The two families

Every page belongs to one of two families. Decide which before building; the rest of this file
applies to both unless it says otherwise.

- **The app:** browse and results, a place page, trips and saved places, the account, checkout, and
  the host tools (today, calendar, listings, fees) with the set-up flow. Recipes: `dashboard`,
  `list-detail`, `onboarding`, `settings`, `empty-state`, `pricing`, and the in-page half of
  `errors`.
- **Public pages:** marketing (the invitation to host, a page explaining protection or gift
  vouchers), reading (help articles and guides), sign-in, and the full-page errors. Recipes:
  `reading`, `sign-in`, and the full-page half of `errors`. There is no marketing recipe; its shape
  is below.

| | App | Public |
| --- | --- | --- |
| Header | Guests: the coral mark, the pill search, "Host a place" and the menu. Host tools: the mark, ink text links, the menu and an avatar. Flows: the mark and outline pills only | Marketing: the mark alone and one gradient pill ("Share your place") on the right. Reading: an ink mark with the section's name, a single-field pill search, a globe and the menu. Sign-in: the guest header |
| Primary action | The gradient for a guest's commitment (book, confirm and pay), full width in the lifted panel. Host tools and the set-up flow use the **ink** action | The gradient, once a page: in the header (marketing), in a hairline panel (reading), in the sheet (sign-in). Every other action is an ink pill or an underlined link |
| Its shape | A pill in the booking panel; 12px corners elsewhere | A pill in a header; 12px in the sign-in sheet; 8px in a reading panel |
| Sidebar | Only the account column in settings | None |
| Titles | Page 32/500, listing 26/500, sections 22/600 | Marketing 60px/700 tracked −3%, sections the same size, centred. Reading 32/500 with sections at 22/500. Sign-in 26/600, centred |
| Weights | 400, 500, 600 | Marketing 400, 500, 700. Reading and sign-in 400, 500, 600 |
| Footer | The full footer under guest pages (browse, a place, trips). None in host tools, flows or the account (`inferred`: those pages are behind a login and were not seen) | The full footer under every public page |
| On a phone | One row for the mark and the menu, the search full width under it. A place page opens on one photo; the booking action pins to a bottom bar | Marketing: the mark alone at the top, the gradient action in a pinned bottom bar. Reading: the panel's action moves above the article, full width. Sign-in: the sheet becomes the page |

- `observed`: the headers, the gradient placements, the ink secondary pills, the title sizes and
  weights, the footers and the phone behaviour, on the source's place, help, host-invitation and
  sign-in pages. `inferred`: host tools use ink because the published screenshots of them do (they
  are behind a login; [questions.md](./questions.md), question 2).
- **What stays the same:** ink on white, coral only for commitment and the mark, frameless photos
  with 20px corners, hairlines between sections, underlined ink for quiet actions, Figtree.

## Page shapes (recipes)

- **Dashboard** (the host's day, app).
  - "Good morning, Ines" at 32px, a pill switch, then a sideways row of reservation panels.
  - Reservation cards float on the `md` shadow with no edge; earnings (this year's coral line over
    last year's dotted plum) and the to-dos sit in hairline outline panels beside a sunken tip with an
    ink icon; then the listings as photo cards.
- **List and detail** (app).
  - The compact search pill in the header, one row of rounded filter chips that scrolls sideways, a
    grid of photo cards and a map (a picture layer) with white price pins laid over it (the chosen
    one ink).
  - The listing, set off by a full-width divider, in a 70rem column: the title with underlined Send
    and Save, then the five-photo mosaic with 12px outer corners.
  - Then two columns. The main one holds the summary, the host row, the description, **the
    bedrooms** (a photo card per room, 12px corners, the room at 16/500 and its beds in grey 14px)
    and the amenities with 24px icons. Beside it, the booking panel with the gradient pill and the
    underlined price lines. The panel's wrapper takes `align-self: stretch`, so it is as tall as the
    main column and the panel inside can stick.
  - Then, at the full column width, each opened by a hairline:
    - **Reviews:** the score huge and centred (72–100px at 500), a 22px line and a grey sentence,
      a small underlined grey link; the categories in a row split by short vertical hairlines (12px
      label and score, a 24px ink icon); reviews in two columns (a 48px avatar, the name at 500 with
      a grey line, small ink stars with the date, three lines of ink text, an underlined Read more);
      a grey-fill `See all 126 reviews`.
    - **Location:** the place at 16/500, the map at the column's width with 20px corners and the
      ink place pin, a sentence about the area and an underlined link.
    - **Before you book:** a grid of three or four (a 24px ink icon, a 14/500 title, a grey 14px
      line, an underlined Read more).
  - The footer opens with where the place is and nearby places.
  - **On a phone:** the mosaic becomes one photo. The recipe does it without a media query: the
    mosaic is a wrapping flex row of a fixed height (`clamp(16rem, 30vw, 25rem)`) with `overflow:
    hidden`, so the 2 × 2 block wraps to a second row and is cut off. The panel drops under the
    main column.
- **Onboarding** (app). A bare header with outline pill buttons, a 32px question, choice tiles that
  take a 2px ink edge, then a segmented progress bar at the foot with an underlined Back and an ink
  Next.
- **Settings** (app). "Account" and the icon list on the left; label-and-value rows split by
  hairlines with underlined Edit, Add or Update; one row opened as a small form with an ink Save;
  notification switches; closing the account last.
- **Empty state** (app). The page title, then a hairline-bounded block: an ink outline icon, a 22px
  heading, one sentence and an ink-outlined action, beside a placeholder photo.
- **Pricing** (app: a host tool, reached from Listings). The title and an ink sentence beside a
  leading photo, then three choice cards with large figures and ink ticks, a pill switch for the
  period, a breakdown panel with the **ink** action, and questions in an accordion.
- **Errors.** The field, form, toast and busy action (app), then the full-page codes (public: the
  word at 700, the rest at 400 and 500).
- **Reading** (public: a help article).
  - The reading header; a 12px breadcrumb; an eyebrow (14/500 grey), the 32/500 title, a lead
    picture with 12px corners.
  - The article in a 40rem column at 16px with a 1.5 line height: 22/500 section headings, lists,
    underlined ink links, and related guides as underlined links with a 14px line under each.
  - Beside it, a hairline panel (12px corners) with one sentence and the page's one gradient action
    (8px corners, full width). In the recipe the panel comes first and the two sit in an `m-split`
    with `flex-direction: row-reverse`, so the panel is on the right when wide and above the article
    on a phone, as on the source.
  - The footer.
- **Sign-in** (public).
  - The guest header over a wall of pictures quietened by a white veil.
  - A centred white sheet, 30rem wide, 32px corners, on the overlay shadow: the coral mark (40px),
    the 26/600 title, one field, the full-width gradient Continue (12px corners), an "or" rule in
    light hairlines, then two outlined 60px buttons with 12px corners and 24px ink icons for other
    ways in.
  - The footer under it. On a phone the sheet takes the width.
- **Marketing** (public, no recipe). Built from the classes above:
  - **Header:** the mark alone on the left and one gradient pill ("Share your place") on the right; no
    hairline until the page scrolls. On a phone the pill moves to a bottom bar (white at half
    opacity, a light top hairline) and the header keeps the mark.
  - **Hero:** two columns. The left holds the title (60px/700, tracked −3%, line height 64px,
    centred), one line with an underlined figure, a grey 14px line with an underlined link, and one
    input. The right holds a picture in a floating box (16px corners, the `md` shadow). There is no
    lifted panel: the header's pill is the commit.
  - **Sections:** each opens with a centred 60px/700 title over two lines with 120px or more of
    space above it; most have no hairline.
  - **How it works:** a row of three centred columns, each an 88px `#f7f7f7` tile with 16px corners
    holding a 40px ink outline icon, a 28/700 title and a grey 18px sentence (line height 28px). On a
    phone each becomes a row: a 64px tile on the left, a 20/700 title and a grey 16px sentence.
  - **People:** floating cards (`#f7f7f7`, 30px corners, a faint shadow), a round photo, the name at
    26/700, a grey line and two figures split by a hairline in a white inner pill; one ink pill action
    under the row ("Find a host near you").
  - **A picture with text:** a photo with 16px corners beside a 28/700 title, a grey 18px sentence
    and an underlined link.
  - **Questions:** a full-width `#f7f7f7` band with a centred 60px title and a row of question cards.
  - **Testimonials:** none on the studied marketing pages. When a page needs them, use the review
    shape from the place page (avatar, name, grey line, stars and date, three lines of ink text),
    not quote cards (`inferred`).
  - `observed` on the source's host invitation, wide and phone.

### Signature moves

1. **The photo leads.** Most first windows open on a picture: a photo card grid, a mosaic, a photo
   beside the title. On the source's studied screens 69% of first windows have media, and on a place
   page it covers about 40% of the window (`observed`, fingerprint). Photo cards have no frame.
2. **One gradient action per view.** The coral-to-magenta pill or bar. In the app it is full width
   in the lifted panel, with the figure it commits to above it; on public pages it is the header's
   pill (marketing), the action in a hairline panel (reading) or the sign-in sheet's Continue.
   Everything else is a grey fill, an ink pill or outline, or an underlined ink word. Host tools use
   ink instead (`observed`, see [patterns/commit-to-the-main-action.md](./patterns/commit-to-the-main-action.md)).
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
  quiet actions (one thing), a large question (a flow), a breadcrumb and title (reading) or a
  display title beside a picture (marketing). There is no page-level intro band in the app.
- **Reading order:** picture, title, the facts in one grey line, then sections down one column; the
  action panel sits to the right on wide screens and is sticky.
- **How much one screen does:** one job and one commit action. A second job is a link to its own
  page, not a tab or a second panel.
- **When narrow:** the right panel drops under the content; grids go to one column of full-width
  photo cards; chips and category tabs scroll sideways in one row; the search becomes one rounded
  field under the mark's row.
- **On a phone, a place page** (`observed`): one full-width photo with a "1 / 32" count, the title
  centred under it, and the booking action pinned to a bottom bar (white, a light top hairline, the
  price line on the left and the gradient pill). The bar is for phones only: from 744px up the panel
  is sticky in its column, and once the panel's column ends, a sticky bar of links to the sections
  (photos, amenities, reviews, location) with the price and a smaller gradient pill replaces the header. There
  is never a bar pinned to the bottom of a wide screen.
  - Recipes can't show a bar only on phones, so they don't pin one: the panel drops under the main
    column. A product with its own CSS adds the bottom bar below 744px and hides the panel there.
- **Too much content:** more sections down the page, each opened by a hairline, with `See all …` as a
  grey-fill button that opens a dialog. Long lists page with round page numbers.
- **No content:** the page title stays and the empty block takes the list's place (see
  [patterns/say-nothing-is-here.md](./patterns/say-nothing-is-here.md)).
- **Three weights, five or six sizes:** an app page uses 400, 500 and 600, a marketing page 400, 500
  and 700, and every page five or six text sizes (`observed`: three weights on every studied source
  screen with the consent banner removed). See [Type](#type).

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
| Use one icon set, outlined at 2px, in ink | Mix filled and outlined icons, or paint an outline icon coral |
| Keep each page to three weights: 600 in the app, 700 only for public display | Bold an app heading at 700, or mix 600 and 700 on one page |
| Pin the booking action to a bottom bar on phones only | Pin a bar to the bottom of a wide screen |
| Leave footer and nearby-place links plain, underlined on hover | Underline every link in a footer column, or colour it |
