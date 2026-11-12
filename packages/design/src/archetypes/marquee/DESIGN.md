# Marquee

Category: content-first and immersive. Dark first: a near-black canvas under a black top bar, one
signature red for the brand and the main action, a big rounded billboard with the title, a synopsis,
a white Play pill and a grey More info pill, then rows of rounded stills and posters that run off the
edge of the screen, a card that grows into its preview under the pointer, outlined rating boxes, red
"new" and ranked tags and thin red progress bars. The account and help pages are plain and light. For
video, film and streaming apps where people browse big artwork and press play.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `marquee` preset of `@mariachi/design` (`data-theme="marquee"`,
`themes/marquee.css`). Dark mode is the real one for browsing and watching; set `data-mode="dark"` on
the root unless the person chose light. Light mode is the reference's own account and help pages.

## Principles

- **The artwork is the colour.** The chrome is black and near-black; stills and posters bring the
  colour. Nothing in the interface competes with them.
- **One red.** The red is the brand mark, the main action, "new" and ranked tags and the progress
  bar. It is never decoration, and never more than one red button in a view.
- **Big hero, then rows.** A page opens on one big rounded billboard; everything after it is a row of
  cards with a bold title, running off the right edge with a grey arrow to page on.
- **White means play.** Play (and Resume) is always the white pill with a filled triangle; More info
  is the grey pill beside it. Card actions are round outlined buttons.
- **Quiet facts.** Meta lines are short and dotted (Thriller • 2026 • 6 episodes), the score is green
  and bold, the rating is an outlined box, and everything secondary is white at 70%.

## Foundations

| What | Dark (the reference) | Light (the account and help pages) |
| --- | --- | --- |
| Canvas | `#141414` | `#fafafa` |
| Surface: info panels, tiles, fields | `#232323` (white at 10% on the canvas) | white `#ffffff` |
| Raised: the title modal, the preview card, menus | `#181818` | white, with a shadow |
| Sunken: the top bar, the profile picker | black `#000000` | `#f5f5f1` |
| Text: default, muted, subtle | `#ffffff`, `#b9b9b9` (white 70%), `#8c8c8c` (white 50%) | `#221f1f`, `#6d6d6e`, `#707070` |
| Rules; field edges | `#404040`; `#808080` | `#e5e5e5`; `#808080` |
| Red (brand and action) | `#e50914`, hover `#c11119`, pressed `#99161d`, white text | the same |
| Grey pill | `#525252` (hover `#3a3a3a`) | `#e5e5e5` |
| Score green, error, warning, info | `#46d369` / `#2bb871`; `#eb3942`; `#d89d31`; `#0071eb` | `#0b7a43`; `#c11119`; `#8a5a00`; `#0058b8` |

- **Radius.**
  - Every button is a pill.
  - 12px for stills and posters; 16px for info panels and dialogs; 20px for the billboard.
  - 8px for the account page's cards; 4px for fields, selects, menus, tooltips, tags and profile
    squares; 3px for rating boxes.
  - Profiles are rounded squares, never circles.
- **Shadow.** None at rest on dark. The preview card and dialogs cast a black glow
  (`0 3px 10px` at 75%); on light, the help centre's `0 3px 10px` at 12.5%.
- **Motion.** 200ms for arrows and hovers, 250ms for buttons, 400ms for a card growing into its
  preview, all on `cubic-bezier(0.32, 0.94, 0.6, 1)`.
- **Spacing.** A 4px unit:
  - 8px between cards in a row;
  - 12px between a row's title and its cards; 40px between rows;
  - 16px inside the preview card, 24px inside panels and account cards.
- **Layout.**
  - Browsing runs edge to edge with 4% gutters (up to 60px) under a 68px top bar.
  - The billboard fills most of the first screen (about 26–40rem tall) with its text in the lower
    left, at most 38rem wide.
  - Rows show 4–6 cards and cut the last one at the edge; stills are 16:9, posters 2:3.
  - Account pages: a 15rem nav beside a 46rem column; forms 28rem.
- **Density.** Balanced; for long lists set `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-brand-default)`, `var(--m-space-4)`. Text on
artwork uses `var(--m-color-accent-fg)` so it stays white in both modes. The exact scales are in the
reference at the end.

## Type

- **Families.** Instrument Sans for everything (`@fontsource-variable/instrument-sans`): 400 for text,
  500 for labels, buttons and meta, 700 for titles. Geist Mono (`@fontsource-variable/geist-mono`)
  only for codes.
- **Sizes:**
  - body 16px; synopses 18px; secondary lines and small buttons 14px; fine print 12px;
  - kickers ("Limited series", "Step 2 of 3") 13px bold capitals tracked 0.16em in the muted grey;
  - row titles 24px bold; section and page titles 32px bold;
  - billboard and error titles 56px bold (`clamp(2.25rem, 5vw, 3.5rem)`), line height 1.05.
- **Case.** Sentence case for text and buttons; title case only for titles of films and series.
- **Figures.** Durations and counts in tabular figures: `1h 48m`, `S1 E4 · 31m left`.

## Icons

- Lucide, outlined at **2px** to match the reference's bold rounded glyphs: 20px in the top bar,
  buttons and rows; 22px in the account nav and on the billboard pills; 40–48px in empty and error
  states. Play is filled.
- Icons are the text colour; in round card buttons they sit inside a 2px grey ring.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis`, close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `arrow-down-to-line`, upload `arrow-up-from-line`, copy `copy`, external `external-link`;
  - send `send`, refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-x`.
- Saved for later is `plus` that turns to `check`; rate is `thumbs-up`; more about a title is
  `chevron-down` in a round button.

## Charts

- Few charts in a streaming app (viewing time, ratings). The red takes the first series.
- **More series** step through red, blue, green, amber and violet; light mode uses the darker steps
  given in the archetype.
- Thin bars with square ends, no gridlines, 12px muted labels. Tooltips use the tooltip treatment.

## States (every control)

- **Hover.**
  - The red darkens to `#c11119`; the white pill dims to white at 70%; the grey pill darkens.
  - A card grows into its preview on the raised grey with a black glow, showing its round buttons,
    score, rating and moods.
  - Top bar links dim to the muted grey on hover; round buttons keep their ring.
- **Focus.** A 2px ring in the text colour (white on dark), 2px out, on keyboard focus only.
- **Pressed.** The red goes to `#99161d`; the white pill to white at 70%.
- **Disabled.** 40% opacity.
- **Error.** The field's border turns red (`#eb3942`); under it a red 13px line with a `circle-x`
  says how to fix it.
- **Loading.**
  - Rows show grey blocks in the cards' shapes (16:9 or 2:3, 12px corners) with a slow shimmer.
  - A button keeps its width; `aria-busy="true"` swaps its label for the red spinner.
- **Selected and current.** The current top bar link is white and bold; the current account nav
  item is bold; a chosen profile or picture gets a 3px white ring; the chosen plan a ring and a tick;
  the playing episode row the surface grey.

## Components

All 36 of the library's components, as Marquee draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-stack` for the page (40px between rows) and `m-cluster` with `flex-wrap: nowrap` and
  `overflow: hidden` for a row of cards;
- `m-split` for the account nav (15rem) beside its column;
- `m-container` for account and plan pages (46–72rem) and forms (`data-size="sm"`, 28rem);
- `m-grid` for "more like this" (14rem columns) and plan cards (15rem).

**Actions and forms**
- **Button.** Always a pill, medium weight, no shadow, no growth. 32px (`sm`, 14px label), 40px
  (`md`, 16px), 48px (`lg`, 18px label via `--m-button-font-size: var(--m-font-size-lg)`).
  - **Primary:** the red with white text: Join, Continue, Next, Save.
  - **Play:** the white pill with a filled triangle, the primary variant with
    `--m-button-primary-bg: var(--m-color-bg-inverse)` and `--m-button-primary-fg:
    var(--m-color-fg-inverse)`; on light pages it is the near-black pill.
  - **Secondary** (the default): the grey pill: More info, Cancel.
  - **Ghost:** text only, for the top bar's icons.
  - **Danger:** the red, only to confirm something destructive; on the account page "Close this
    account" is a wide grey button with red text.
  - **Round:** icon-only on the raised grey with a 2px grey ring (save, rate, more about it).
- **Input, textarea.** 48px, 4px corners, a dark fill (`#161616`), a 1px `#808080` border that turns
  white on focus, 16px text and 16px in. The placeholder is the muted grey.
- **Select.** The same box with a chevron; the season select on the title modal is bold.
- **Field.** A 14px medium label above, 13px muted descriptions and messages 6px below; the error
  line has a `circle-x`.
- **Checkbox, radio.** 18px, a 1px grey edge (2px corners on the checkbox); checked fills with the
  text colour and the tick or dot takes the canvas colour.
- **Switch.** 44 × 24, red when on, grey `#808080` when off, a white knob. It takes effect at once.

**Navigation**
- **Navbar** (the top bar). Black, 68px, the mark and name on the left, then 14px links in `#e5e5e5`
  that dim on hover; the current one white and bold (set `font-weight` with `aria-current`). On the
  right: search, the bell with a small red count, and the profile square with a caret. Light pages
  use a white bar with a hairline.
- **Sidebar** (the account nav). No fill: a "Back to …" link with `arrow-left`, then 16px links with a
  22px outline icon; the current one bold, with no background. Counts are small red pills.
- **Tabs.**
  - **Underline:** 16px medium labels in the muted grey; the current one white over a 3px red bar.
  - **Pill:** the TV nav: the current item in a grey pill.
- **Breadcrumb.** Muted links with "›"; the current page white. Rare: the app prefers "Back to …".
- **Pagination.** Rows page with the grey side arrow and short dashes at the row's top right (the
  current dash white). For long lists, round items with the current one white.

**Data and content**
- **Card.**
  - **Stills and posters** are bare artwork with 12px corners: a 16:9 still with the title at its
    foot and, when started, a 3px red bar along its bottom edge; a 2:3 poster with the title under it.
    Tags sit on the art: the red rank tag hanging from the top right, a red "new" tag on the foot.
  - **The preview card** (a card under the pointer): the raised grey, 12px corners, the black glow; the
    still on top, then the white round Play, round save and rate buttons and a round "more" on the
    right; the green score, the rating box, the length and an HD box; moods dotted.
  - **Info panels** (`m-card`): the surface grey with a faint edge, 16px corners, 24px in, bold 18px
    titles.
  - **Account cards:** white, 8px corners (`--m-card-radius: var(--m-radius-md)`), a hairline edge
    and rows with chevrons; the plan card has a 6px gradient bar along its top.
- **Table** (help and plan comparisons). A grey header row in regular 16px, hairlines on every cell
  and around the table, 16px cells.
- **Badge.** The rating and quality boxes: an outlined box with 3px corners, 12px medium text in the
  text colour; HD and AD smaller (16px tall, 10px text). Solid accent badges are the red "new" tags.
- **Avatar.** A rounded square (4px), 32px in the top bar, 40px in rows, 64px in headers; profile
  pictures are a gradient with a glyph, initials on the blue otherwise.
- **Divider.** A 1px `#404040` rule (`#e5e5e5` on light) between episodes and account rows.
- **Accordion** (questions). Separate grey bars 8px apart, square corners, 24px in, 18px regular
  questions with the library's chevron on the right (the reference draws a plus that turns into a
  cross); on light, white bars with a hairline.
- **Code, kbd.** Geist Mono on the surface grey with 4px corners; keys the same with a hairline.
- **Prose.** 16px with 1.5 line height, at most 42rem, links in the text colour and underlined.
- **Progress.** The "still watching" bar: red, 3–4px, square-ended, along the foot of the art.
- **Meter.** The same bar, amber then red as it fills.
- **Usage.** A label and amount over the same thin bar.

**Feedback and overlays**
- **Alert** (the banner). The tone's tint, 4px corners, 12 × 16px in, a 20px icon, a bold title
  that says what didn't happen ("Your email hasn’t changed").
- **Toast** (the snackbar). Dark grey `#333333` with white 16px text (near-black on light), 4px
  corners, centred at the bottom, one line where it can.
- **Dialog** (the title modal). `#181818`, 16px corners, a 70% black scrim, the black glow. The still
  runs edge to edge at the top with the title, the Play pill and round buttons on it and a round
  close button in the corner; 24 × 48px in below, a bold 24px title for smaller dialogs.
- **Popover and menu** (the profile menu). Near-black with a `#3a3a3a` edge, 4px corners, 36px rows
  of 14px text, the white-10% tint on hover.
- **Tooltip.** Light grey `#e6e6e6` with dark bold 16px text on dark (near-black with white text on
  light), 4px corners, a small shadow.
- **Spinner.** A red ring, for buttons and small areas only.
- **Skeleton.** Grey blocks in the art's shapes with a slow shimmer.

**AI and chat**
- **Chat.** The other side's words sit on the canvas with no bubble; the person's own on the
  surface grey with 16px corners, on the right. Times are 12px muted.
- **Composer.** The surface grey with 24px corners and a grey edge that turns white while typing;
  Send is the red round button.
- **Thinking.** A muted line ("Finding something tense and short…") with a slow pulse. **Tool call:**
  a grey box with 12px corners, the tool name and a round status tag.
- **Citation.** A small grey tag with a number; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and a red 13px line with a `circle-x` appears under it. Check
  on blur and on submit, never while someone types.
- **In a form:** a red-tinted banner above the form saying what wasn't done and how many fields need
  another look. Focus moves to it.
- **Somewhere else:** the grey snackbar, one line ("Couldn’t save Blue Hour for later. Check your
  connection and try again.").
- **A whole page:** a dimmed still filling the page.
  - A big bold title, one line, a white pill, and the error code beside a short red rule.
  - **404:** says the page moved or never existed, with a pill back to browsing.
  - **500:** says nothing in the account changed, with Try again.
  - **403:** says why this profile can't open it and who can change that.
- **Words.** Say what happened, whether anything changed and what to do. No blame, no exclamation
  marks; a light touch of the cinema is fine in titles.

## Page shapes (recipes)

- **Dashboard** (browse).
  - The black top bar with our own sections, search, the bell and the profile square.
  - The billboard: a kicker, the 56px title, a dotted meta line, an 18px synopsis, the white Play and
    grey More info pills; an award chip in the corner.
  - Rows: "still watching" stills with red bars and what's left; ranked stills with red rank tags and
    "new" tags; a poster row with one card grown into its preview.
- **List and detail** (the title modal).
  - Over the dimmed page: the still with the title, Resume, round save and rate buttons, mute.
  - Two columns: score, year, episode count, HD and AD boxes, the rating with its reasons, the ranked
    line, the synopsis; on the right "With:", "Genres:" and "Mood:" in muted labels.
  - Episodes with a season select: number, 16:9 still with the watched bar, bold title and length,
    a three-line description; the current one on the surface grey. Then "More like this" cards.
- **Onboarding** (profiles). On black: the step kicker, a big title, rounded-square profiles with
  names (the current one ringed), an add tile and an outlined "Edit profiles" pill; below, the new
  profile form on the raised grey with picture choices, a field error, a language select, a switch
  and the red Continue pill.
- **Settings** (the account page, light first). "Back to …", the icon nav, a 32px title with one
  muted line, grey section labels and white 8px cards of switch and chevron rows; the plan card with
  its gradient bar; "Close this account" as a wide grey button with red text.
- **Empty state.** A glyph in an outlined circle, a 24px title, one line, the red and grey pills; a
  search with no matches and its three suggestions; a row of posters to start from.
- **Pricing** (the plan step). A step kicker and 32px title; plan cards with a gradient header
  holding the name and picture quality, the chosen one ringed with a tick; grey labels over bold
  values; fine print; a wide red Next pill; questions as grey bars.
- **Errors.** The field, form, snackbar and full-page errors above, as one page.

## Words

- Short and plain, sentence case: "More info", "Still watching for Ines", "S1 E4 · 31m left".
- Scores as "92% for you"; ranks as "No. 3"; lengths as `1h 48m` and `52m`.

## Do and don't

| Do | Don't |
| --- | --- |
| Keep the chrome black and let the artwork bring the colour | Tint panels or colour icons for decoration |
| Use the red for the brand, the one main action, tags and progress | Put two red buttons in a view, or use red for links |
| Make Play the white pill with a filled triangle | Make Play red, or outline it |
| Open on one big billboard, then rows that run off the edge | Grids of equal tiles from the top of the page |
| Round every still and poster (12px) and every button (pill) | Square artwork or square buttons on browse pages |
| Draw ratings as outlined boxes and scores as green text | Coloured pills for ratings |
| Keep account and help pages plain, white and light | Bring the billboard or red fills into settings |
| Use the same icon for the same action | Mix icon sets, or outline the play triangle |
