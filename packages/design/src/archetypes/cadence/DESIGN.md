# Cadence

Category: content-first and immersive. Dark first: near-black panels with 8px corners sitting in a
black frame, one bright green for play and for "on", white pills for the main call, huge bold titles
over a wash of colour, cover art on every row and card, dense track lists with no rules between rows,
and buttons that grow a little under the pointer. For music, audio and media apps where people browse
for hours and the content is the hero.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `cadence` preset of `@mariachi/design` (`data-theme="cadence"`,
`themes/cadence.css`). Dark mode is the real one; set `data-mode="dark"` on the root unless the person
chose light. Light mode is built from the same system's published light palette.

## Principles

- **The content is the colour.** The chrome is black and near-black greys; colour comes from cover
  art and from the wash of colour behind a page's header. Keep the interface out of the way.
- **Green means play, and on.** The green fills the round play button, the primary pill, checked
  boxes, switches that are on, and the title of whatever is playing. Use it for nothing decorative.
- **Bold and big, then quiet.** Page titles are huge (up to 96px) and heavy (800). Section titles are
  bold. Everything secondary is 14px in the subdued grey. There is little in between.
- **Dense lists, no rules.** Rows are 56–64px with art on the left, two lines of text, and no lines
  between them; a row lights up on hover instead.
- **Panels, not pages.** The app is a black frame holding rounded panels 8px apart: the collection
  on the left, the main view, an optional detail panel on the right, and the now-playing bar below.

## Foundations

| What | Dark (the reference) | Light |
| --- | --- | --- |
| Frame (sunken) | black `#000000` | `#e6e6e6` |
| Panels (canvas) | `#121212` | white `#ffffff` |
| Highlight (surface): boxes, the search field, hovered cards | `#1f1f1f` | `#f5f5f5` |
| Elevated (raised): menus, tooltips, dialogs | `#282828` | white, with a shadow |
| Hover tint: rows, chips | white at 10% (`#2a2a2a`) | black at 8% (`#ebebeb`) |
| Text: default, subdued, faint | `#ffffff`, `#b3b3b3`, `#939393` | `#000000`, `#656565`, `#6a6a6a` |
| Rules | `#292929`; control edges `#7c7c7c` | `#dedede`; `#818181` |
| Green | `#1ed760` (hover `#3be477`, pressed `#1abc54`), black text on it | buttons keep `#1ed760`; checks, rings and green text use `#159542` and `#107434` |
| Negative, warning, announcement | `#f3727f` text, `#e91429` fill; `#ffa42b`; `#539df5` text, `#0d72ea` fill | `#c91123`, `#e91429`; `#955500`, `#ffa42b`; `#0b62c8`, `#0d72ea` |

- **Radius.** 4px for inputs, rows, menus, tooltips, tags and small art; 6px for cards and cover
  art; 8px for panels, boxes and dialogs; 16px for wide banners. Every button and chip is a pill.
  People and performers are circles.
- **Shadow.** Almost none on the dark frame. Big cover art and hovered play buttons cast
  `0 8px 24px` and `0 8px 8px` black shadows; menus and tooltips `0 16px 24px` at 30% plus
  `0 6px 8px` at 20%.
- **Motion.** 150ms for hover and press with `cubic-bezier(0.3, 0, 0, 1)`, 250–300ms for things that
  open. Buttons grow to 104% on hover and snap back to 100% when pressed.
- **Spacing.** A 4px unit with the published steps 2, 4, 6, 8, 12, 16, 20, 24, 32, 48, 64:
  - 8px between panels and between chips;
  - 12px inside cards and rows;
  - 16–24px inside panels;
  - 32–48px between sections.
- **Layout.**
  - A black frame with a 64px top bar and a 72px now-playing bar.
  - The collection panel about 21rem wide on the left; the main panel fills the rest; a detail
    panel of 20–26rem may open on the right.
  - Content in the main panel runs edge to edge with 24px gutters; settings run in a 52rem column,
    sign-up forms in 28rem.
  - Shelves are grids of cards with no gap: the card's own 12px padding spaces them.
- **Density.** Dense by default; for data-heavy screens set `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Figtree for everything (`@fontsource-variable/figtree`): 400 for text, 700 for titles,
  labels and buttons, 800 for page titles. DM Mono (`@fontsource/dm-mono`) only for paths and codes.
- **Sizes** (the published desktop scale):
  - body 16px; secondary lines, labels, small buttons and table text 14px; fine print 12px;
  - shelf and panel titles 24px bold; page titles 32px bold; error titles 48px bold;
  - the page title of a mix, performer or record 96px at 800 with tracking −0.04em, shrinking to fit
    (`clamp(2.5rem, 5.5vw, 6rem)`).
- **Line height.** Tight: 1.375 for text, 1.15 for titles.
- **Case.** Sentence case everywhere, never uppercase.
- **Figures.** Durations and counts in tabular figures: `3:54`, `412,806 listeners each month`.

## Icons

- Lucide, outlined at **2px** to match the reference's bold glyphs: 16px in rows, buttons and the
  now-playing bar; 24px in the top bar (32px for the big page actions); 48–56px in empty and error
  states. Play and pause are filled.
- Icons are subdued grey and brighten to white on hover; an icon that is "on" (shuffle, repeat,
  saved) turns green.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `circle-arrow-down`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.
- Saved to the collection is a green `circle-check`; not yet saved is a grey `circle-plus`.

## Charts

- Few charts in a listening app; when there are, bars and lines take the green first.
- **More series** step through green, blue, pink, orange and violet (the genre-tile hues). In light
  mode use the darker steps given in the archetype.
- No gridlines; labels 12px subdued. Tooltips use the tooltip treatment.

## States (every control)

- **Hover.**
  - Buttons grow to 104%; the green brightens to `#3be477`. Outlined and ghost buttons grow too and
    keep their colours (the reference also turns an outlined ring and ghost text white; the library
    has no hover colour for those, so the growth carries it).
  - Rows and cards take the hover tint or the highlight grey behind them; a card's green play
    button rises onto its art.
  - Links and subdued text in rows turn white. No shadows change.
- **Focus.** A 2px ring in the text colour (white on dark), on keyboard focus only. Never remove it.
- **Pressed.** Buttons return to 100% and darken (`#1abc54`).
- **Disabled.** 30% opacity, no hover growth.
- **Error.** The control's ring turns red; the message below it is red 14px text with a
  `circle-alert` icon, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps its label for a spinner.
  - Lists and shelves show grey skeleton blocks in the art's shape (squares, circles), never a
    spinner over the page.
- **Selected and current.** A filter chip turns white with black text; a collection row takes the
  hover tint; what is playing turns green, with sound bars in place of its number.

## Components

All 36 of the library's components, as Cadence draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split` for the collection panel (21rem) beside the main view, 8px apart on the black frame;
- `m-container` inside a panel: full width with 24px gutters, 52rem for settings, 28rem for forms;
- `m-grid` for shelves (10.5rem columns, no gap) and shortcut tiles (12rem, 8px gap);
- `m-stack` and `m-cluster` for everything inside.

**Actions and forms**
- **Button.** Always a pill, bold, growing to 104% on hover. 32px (`sm`, 14px label) in rows and
  panels; 48px (`md`) for the main call of a page, with its label at 16px
  (`--m-button-font-size: var(--m-font-size-md)`); 56px (`lg`).
  - **Primary:** the green with black text, one per view.
  - **White pill:** the call on a dark page (sign in, empty states, errors): the primary variant with
    `--m-button-primary-bg: var(--m-color-bg-inverse)` and `--m-button-primary-fg:
    var(--m-color-fg-inverse)`.
  - **Secondary** (the default): outlined, a 1px grey ring and white text on no fill.
  - **Ghost:** subdued text only, for quiet actions ("Latest added", "Cancel").
  - **Danger:** solid red with white text, only to confirm something destructive.
  - **Icon-only:** a circle; the round grey one (on `bg.surface`) in the top bar.
  - **Play:** a 56px green circle with a filled black triangle (48px on a card).
- **Input, textarea.** 48px, 4px corners, the panel colour, a 1px grey ring that turns white on
  hover and focus. The placeholder is subdued. The top bar's search is different: a 48px fully round
  field on the highlight grey with a 24px search icon.
- **Select.** The same box with a small chevron; 32px (`sm`) in settings rows.
- **Field.** A bold 14px label 8px above the control, subdued 14px help below; the error sits under
  the control with its icon. The required mark is red.
- **Checkbox, radio.** 16px, a 1px grey edge (3px corners on the checkbox) that turns green on
  hover; green when checked, with a dark tick or dot.
- **Switch.** 42 × 24 with a 20px knob, green when on, grey when off. It takes effect at once.

**Navigation**
- **Sidebar** (the collection panel). On the panel colour with 8px corners.
  - A bold 16px heading with a grey "+ New" pill and an expand arrow.
  - A row of filter chips, then a search icon and a ghost sort control.
  - Rows of 48px art (circles for people) with a 16px title and a 14px subdued line; hover is the
    highlight grey, the open item the tint, the playing item's title green with a speaker icon.
  - Pinned items show a small green pin. Counts ("new") are blue pills.
- **Navbar** (public pages). Black (the frame grey in light), 64px, the mark and name on the left,
  bold 16px subdued links that turn white on hover, a ghost text action and a white pill on the right.
- **Top bar** (in the app). The mark, a round grey icon button, the round search field, then a white
  pill, ghost icon buttons and the avatar in a grey ring.
- **Tabs.**
  - **Underline:** bold 14px subdued labels; the current one white over a 2px green line, with no
    rule under the row.
  - **Pill** (filter chips): pills with regular 14px labels; the current one a step brighter. In
    pages, draw chips with the button tokens so the current chip is white with black text, as the
    recipes do.
- **Breadcrumb.** Subdued links separated by "•", the current page white. Rare: the app prefers a
  back chevron in a round button.
- **Pagination.** Round ghost buttons, the current page white with black text. Lists prefer "See
  everything" links and endless scroll.

**Data and content**
- **Table** (the track list).
  - No frame and no rules between rows; one rule under the header row.
  - Headers 14px subdued in sentence case; the length column is a clock icon.
  - 56px rows: the number, 40px art with the title (16px, white) and performer (14px, subdued),
    then record, date added and length in subdued 14px.
  - Hover lights the row with the tint and swaps the number for a play icon, showing the add and
    more buttons. The playing row is green with sound bars for its number.
  - Explicit content gets a tiny grey "E" tag before the performer.
- **Card.**
  - Shelf cards have no fill: square art with 6px corners (circles for people), a 16px title and two
    subdued lines; on hover the highlight grey appears behind and the green play button rises onto
    the art.
  - Boxes (prompts, plan cards, detail sections) are the highlight grey with 8px corners, 16 × 20px
    padding, bold 16px titles, no border and no shadow.
  - Shortcut tiles: a 64px square of art flush left, a bold 14px title, the highlight grey.
- **Badge.** 4px corners, 12px bold, on the tint; tones use their subdued set. The explicit tag is
  smaller: 16px tall, solid grey, a 9px letter.
- **Avatar.** A circle with initials on mid grey; 24px in rows, 32px in the top bar (inside an 8px
  grey ring), 48px in headers.
- **Divider.** A 1px `#292929` rule. Used sparingly: under table headers, between plan details.
- **Accordion** (help topics and questions). Rows with a grey hairline between, 24px in, bold 16px
  questions with a chevron on the right; no fill and, on pages, no outer frame.
- **Code, kbd.** DM Mono on the tint with 4px corners; keys the same, bold.
- **Prose.** 16px with 1.5 line height, at most about 42rem, links white and underlined.
- **Progress.** A 4px round bar: green on white-30% (`#4d4d4d`). The now-playing scrubber and the
  volume bar are white (`--m-progress-fill: var(--m-color-fg-default)`).
- **Meter.** The same bar; it turns orange and red as it fills.
- **Usage.** A label and amount over the same bar.

**Feedback and overlays**
- **Alert** (the banner). A tinted panel in the tone's subdued set (dark red, dark amber, dark blue,
  dark green), 4px corners, 12px in, a 16px icon, a bold title. It says what was not done ("Your
  email hasn't changed").
- **Toast** (the snackbar). The announcement blue with white 16px text, 8px corners, centred at the
  bottom, one line where it can; at most 24rem. It leaves after a few seconds.
- **Dialog.** The elevated grey `#282828`, 8px corners, 24px in, a 70% black scrim, a bold 24px
  title, actions on the right with the primary pill last and Cancel as a ghost.
- **Popover and menu** (the context menu). `#282828`, 4px corners, 4px in; 40px rows of 14px text
  with a 16px icon, `#3e3e3e` on hover, rules between groups.
- **Tooltip.** The same grey, white 14px text, 4px corners, 4 × 8px, no arrow.
- **Spinner.** A thin green ring, for buttons and small areas only.
- **Skeleton.** Grey blocks shaped like the art and the text lines, with a slow shimmer.

**AI and chat**
- **Chat.**
  - The assistant's words sit on the panel with no bubble.
  - The person's own messages are on the highlight grey with 16px corners, on the right.
  - Times are 12px subdued.
- **Composer.** Like the top bar's search: the highlight grey, 24px corners, a grey ring that turns
  white while typing, and Send as a green round button.
- **Thinking.** A subdued line ("Thinking…") with a slow pulse. **Tool call:** a grey box with 8px
  corners, a 16px icon, the tool name and a round status tag.
- **Citation.** A small pill on the tint with a number; the source shows in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the ring turns red and a red 14px line with a `circle-alert` icon appears under it.
  Check on blur and on submit, never while someone is typing.
- **In a form:** a negative banner above the form that says how many things need fixing and what was
  not done ("2 things need fixing. Your email hasn't changed."). Focus moves to it.
- **Somewhere else:** the blue snackbar, one line ("Couldn't add Paper Lanterns to Slow Coffee.
  Check your connection.").
- **A whole page:** centred on the panel.
  - The green mark (or a 56px subdued icon), a 48px bold title, one subdued line, a white pill and a
    bold text link under it.
  - **404:** "Page not found" with a pill back to the start and a link to help.
  - **500:** "Something went wrong" and that nothing changed, with Try again.
  - **403:** says who can open it and how to ask.
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard** (home).
  - Filter chips at the top over a soft wash of the brand colour.
  - A greeting in 32px bold, then a grid of shortcut tiles.
  - Shelves: a 24px bold title with "See everything" on the right, then a row of cards; one row of
    round performer cards.
  - Around it, the collection panel and the now-playing bar.
- **List and detail.**
  - A header washed in colour: big art with a shadow, the type ("Public mix"), the huge title, a
    subdued description and a meta line with the owner's avatar.
  - The action row: the 56px green play button, shuffle, add, more; a view switch on the right.
  - The track list, then the detail as the now-playing panel on the right: big art, title and
    performer with the saved tick, an "About the performer" box and credits.
- **Onboarding.** The mark centred, a thin green step bar, a back chevron beside "Step 2 of 3" and
  the step's name, a bold question, a white search field, round picks with a green tick, one field,
  and a full-width green pill.
- **Settings.** One column inside the frame: a 32px bold title with a search icon, bold 16px group
  titles, subdued 14px labels with switches, selects and outlined pills on the right. Closing the
  account comes last, with a danger pill.
- **Empty state.** A 48px glyph in an 88px grey disc, a 32px bold title, one line, a white pill and
  an outlined one; the grey prompt boxes with small white pills below.
- **Pricing.**
  - A black header, a huge bold title, a bold line with the offer, a green and an outlined pill and
    fine print.
  - Plan cards on the highlight grey: a coloured tag on the first, the mark and plan family, the tier
    name in its colour, the price in bold, a rule, plain bullets, a full-width pill in the tier's
    colour, and centred fine print.
  - Questions as hairline rows below.
- **Errors.** The field, form, snackbar and full-page errors above, as one page.

## Words

- Short, warm and plain, sentence case: "See everything", "Latest added", "Start 30 days free".
- Counts and lengths exact; dates relative when recent ("2 days ago"), then short ("Nov 3, 2026").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep the chrome black and grey and let the art bring colour | Tint panels, or colour icons for decoration |
| Use the green only for play, on and what's playing | Use the green for links, headings or decoration |
| Make every button a pill that grows a little on hover | Square buttons, or shadows on buttons |
| Set page titles huge and heavy, everything else small | Use mid-size, mid-weight headings everywhere |
| Separate rows with space and a hover tint | Draw rules between rows or zebra stripes |
| Put art on every row and card (circles for people) | Lists of bare text where a cover could go |
| Use the same icon for the same action | Mix icon sets, or outline play and pause |
