# Refrain

Category: content-first and immersive. Artwork first: square tiles on soft layered shadows, bold
large titles, black pills (white in dark) beside round grey buttons, a pale sidebar library with
blue glyphs, hairline track lists, grouped inset settings and a floating glass player with the
transport, the track and a lyrics view. Light and a true dark. For music, audio and media libraries
where the content leads and the player is always within reach.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `refrain` preset of `@mariachi/design` (`data-theme="refrain"`, `themes/refrain.css`).

## Principles

- **The artwork is the page.** Square art leads every screen: shelves of tiles, a big cover on a
  record, round portraits for people. Chrome stays white (or `#1f1f1f`) and grey so the art carries
  the colour. Without real art, use token gradients and shapes; never stock images.
- **Monochrome actions, blue meaning.** The one main action is a black pill (white in dark). Links,
  glyphs, selection, ticks and switches are system blue. Nothing else is coloured except status.
- **The signature colour is a brand, not a button.** The pink-red is for the mark, live badges and
  art washes. Never use it for an action, a link or selected state.
- **Bold, large titles.** Page titles are 34px bold, record titles 26px bold, shelf titles 17px bold
  with a chevron. Everything else is 13px regular.
- **Quiet structure.** Lists are split by hairlines, settings sit in grouped grey boxes, and the
  player and toolbars float on glass rather than sitting in bars.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Page | white `#ffffff` | `#1f1f1f` |
| Sidebar | `#fafafb` with a faint edge | `#232324` |
| Grouped boxes (settings, plans) | `#f5f5f7` | `#262628` |
| Menus, dialogs, the player | `#ffffff` on the overlay shadow | `#2c2c2e` |
| Text: default, muted, subtle | `#1f1f1f`, `#707070`, `#6e6e73` | `#ededed`, `#a1a1a6`, `#939398` |
| Hairlines | `#d9d9d9`; lighter `#e8e8e8` | `#383838`; `#2c2c2c` |
| Main pill | black `#000000`, white text | white `#ffffff`, black text |
| Round grey button | `#efeff0` | `#2b2b2d` |
| Accent (links, glyphs, ticks, switches) | `#0070f5`; link text `#0068da` | `#0a72e6`; link text `#409cff` |
| Brand (mark, live badges, art) | pink-red `#e0193a` | `#e0193a` |
| Selected sidebar row | `#e7e7e8` | `#2f2f30` |
| Destructive | `#d70015` | text `#ff6961`, fill `#d70015` |

- **Radius.** 5px for badges, small art and menu rows; 7px for artwork in shelves; 8px for sidebar
  rows and fields; 10px for big art, tiles, grouped boxes and menus; 18px for dialogs and plan
  cards. Buttons, search fields and the player are capsules; buttons with only an icon are round.
- **Shadow.**
  - Shelf art: five soft layers (`0 1px 1px` to `0 14px 14px`, 1–3% black).
  - Big art: `0 10px 20px` at 10% (30% in dark).
  - Glass (player, toolbars, search): `0 10px 40px` at 10% (20% in dark) with a half-pixel edge.
  - Menus and dialogs: an inner light stroke, a half-pixel edge and `0 8px 40px` at 25%.
- **Motion.** 100ms ease-in feedback, 200ms fills, 400ms panels; `cubic-bezier(0.215, 0.61, 0.355,
  1)` for things that move in. Nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 4px between sidebar rows;
  - 8–12px between a control and its neighbour;
  - 20px between artwork in a shelf;
  - 32px between shelves.
- **Layout.**
  - A 260px sidebar library on the left.
  - Content runs edge to edge with a `clamp(16px, 3vw, 40px)` gutter, up to 1400px.
  - Settings run in a 720px column, forms in 480px.
  - Shelves are rows of 144–204px tiles cut at the right edge; song shelves are 256px columns.
  - The player floats centred at the bottom, at most 704px wide.
- **Units.** Sizes are in px: the body is 13px and the library sets rem from the themed root.
- **Density.** 1 by default. For dense library views, set `--m-density: 0.85` on the page; controls
  and padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-text)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Inter (variable, with optical sizes) for everything, at 400 for text, 600 for labels
  and emphasis and 700 for titles. Load `@fontsource-variable/inter`.
- **Mono.** Roboto Mono, small, for codes and file paths only.
- **Sizes** (the published text styles):
  - 11px semibold capitals for eyebrows ("SESSION OF THE WEEK");
  - 12px for lockup titles, metadata and footnotes;
  - 13px for body text, rows and controls;
  - 15px for main pills and lead text;
  - 17px bold for shelf titles; 22px bold for section heads;
  - 26px bold for record titles (the performer beneath at 26px regular, in blue);
  - 34px bold for page titles. Public pages go to 56–70px semibold, tight.
- **Case.** Title case for names of works; sentence case everywhere else. Capitals only for eyebrows.
- **Figures.** Tabular figures for durations and counts.

## Icons

- Lucide, outlined at **1.75px**: 16px in rows, buttons and the player; 18px in the sidebar; 48–56px
  for empty and error pages. Play, pause, previous and next are filled.
- Sidebar glyphs are blue (the link blue); everything else is ink. A toggled glyph in the player
  (shuffle, lyrics) is blue on a pale blue disc.
- **The same icon for the same action, every time:**
  - add `plus`, edit `square-pen`, delete `trash`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal, always), close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `circle-arrow-down`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up`, refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Few charts; when needed, the system colours in order: blue, pink, orange, green, purple, teal.
- Lines are 2px; bars have 4px rounded tops. Gridlines are hairlines; labels are 12px grey.
- Tooltips use the menu treatment.

## States (every control)

- **Hover.** Fills deepen one step: the round grey button from `#efeff0` to `#e5e5e6`, the black
  pill to `#262626` (in dark, white to `#e6e6e6`). Track rows take a grey wash (`#f0f0f0`). Nothing
  lifts, grows or casts a new shadow.
- **Focus.** A 3px system blue ring, 1px outside the control, on keyboard focus only. Never remove
  it.
- **Pressed.** One more step darker. Nothing moves.
- **Disabled.** 40% opacity. Never hide a disabled action someone needs to know exists; say why
  nearby.
- **Error.**
  - The field's edge turns red.
  - The message replaces the help text below it, in red 12px, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` shows a small grey spinner and blocks clicks.
  - Art shows a grey placeholder square (`#ebebeb`) in its own shape; lists show grey bars. Never a
    spinner over a whole page.
- **Selected and current.**
  - Sidebar rows: the selection grey, semibold.
  - The segmented control: a white segment (grey in dark) on a soft shadow.
  - Chosen chips: the black pill. Ticks and switches: blue.
  - The playing track: its number becomes sound bars and the title goes semibold.

## Components

All 36 of the library's components, as Refrain draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, the 260px sidebar library beside the content;
- `m-container`, up to 1400px, or 720px for settings and 480px for forms;
- `m-grid`, for shelves: 20px gaps, 144–204px tiles, 128–168px round portraits, 256px song
  columns, 352px editorial lockups;
- `m-stack` and `m-cluster`, for everything inside.

Shelves are 32px apart.

**Actions and forms**
- **Button.** Always a capsule, 15px semibold, 36px by default and 28px (`sm`, 13px) in rows.
  - **Primary:** black with white text (white with black in dark), one per view: Play, Continue.
  - **Secondary** (the default): the round grey fill, no border. Icon-only, it's the round button
    beside Play (shuffle, add).
  - **Ghost:** ink glyphs and text with a faint grey disc on hover: toolbars and the player.
  - **Danger:** solid red, only to confirm a deletion. In lists, a destructive row is red text
    instead.
  - Blue text links ("Not now", "How downloads work") stand in for tertiary buttons.
- **Input, textarea.** 36px, white, a mid-grey edge, 8px corners, 13px text, the blue ring on focus
  and a grey placeholder. Search is the glass capsule instead: white, a half-pixel edge, the glass
  shadow, a 14px glyph and grey placeholder.
- **Select.** The same box with a small chevron. In settings it sits on the right of its row, `sm`.
- **Field.** The label above (13px semibold), the control, then a grey 12px footnote or the red
  error. Fields stack 16px apart.
- **Checkbox, radio.** 14px, 4px corners on the checkbox, blue with a white tick when on, a mid-grey
  edge at rest.
- **Switch.** A 40 by 24px capsule: blue when on, mid grey when off, a white knob with a soft drop. It
  takes effect at once.

**Navigation**
- **Sidebar.** 260px on `#fafafb` with a faint edge.
  - The wordmark at the top, then groups. The first group has no heading; the rest have plain grey
    11px semibold headings ("Crate").
  - Rows are 14px with an 18px blue glyph, 8px corners; the current row is the selection grey and
    semibold. Mixes show 20px art instead of a glyph.
  - Counts are plain grey figures at the right, no pill.
  - The person's avatar and name sit at the bottom.
- **Navbar** (public pages). A white strip (near-black in dark) under a hairline: the name at 21px
  semibold, 12px grey links, and a small black pill at the right.
- **Top bar** (in the app). No bar: a round glass back button on the left, a glass capsule with share
  and more, and the search capsule on the right.
- **Tabs.**
  - **Pill** (the segmented control): a grey capsule track with the chosen segment white on a soft
    shadow (`#636366` in dark).
  - **Underline:** ink text over a 2px ink line, for rare in-page switches.
- **Breadcrumb.** Blue links with "›" between, the current page in ink. In the app, prefer the round
  back button.
- **Pagination.** Round ghost buttons with the current one black. Lists prefer endless scroll.

**Data and content**
- **Table** (the track list).
  - No frame and no header fill; headers are 12px semibold grey, often hidden.
  - Rows are 13px, separated by hairlines that start at the title (the number column has none).
  - Numbers and durations are grey with tabular figures; "more" is a horizontal ellipsis at the end.
  - A hovered row washes grey and its number becomes a play glyph; the playing row shows sound bars.
  - Long song lists may use a faint alternate row (`data-striped`).
- **Card.** The grouped box: `#f5f5f7`, 10px corners, no border, no shadow. Settings rows sit inside
  it with inset hairlines. Plan cards use 18px corners and generous padding. Artwork is not a card:
  it's a bare tile with a 12px title and a grey line under it.
- **Badge.** 18px tall, 4px corners, 11px semibold:
  - neutral grey (the explicit "E" at a smaller size, labels);
  - solid grey ("Single");
  - the brand pink-red, in capitals ("LIVE") on art only;
  - status tints for "Downloaded", "Waiting", "Failed".
- **Avatar.** Round monograms in the system grey (`#e5e5ea`, dark `#3a3a3c`); 24px in the sidebar,
  32px in rows, 44px in headers. People in shelves are round art, not avatars.
- **Divider.** A hairline. Plan cards use an ink rule under the price.
- **Accordion.** Hairline rows with 17px semibold questions and a chevron on the right; no fills.
- **Code, kbd.** Roboto Mono 12px on the grouped grey with 5px corners. Keys are small boxes with a
  hairline edge.
- **Prose.** 13px with a 1.38 line height in the app, 17px with 1.47 on public pages; links in blue,
  no underline.
- **Progress.** A 4px capsule: blue on a light grey track. The player's scrubber is a 2px grey line.
- **Meter.** The same bar; red past the high mark.
- **Usage.** A label and amount over the meter bar, tabular figures.

**Feedback and overlays**
- **Alert.** A tinted panel in the tone's pale colour, 10px corners, no border, a 16px status glyph,
  a semibold title and one line. Danger alerts sit above the form and say what didn't happen.
- **Toast** (the notification banner).
  - White glass (`#2c2c2e` in dark), 16px corners, the overlay shadow, top right.
  - The app's mark on the left, a semibold title, one line of detail.
  - Success banners close themselves after 5s; errors stay until dismissed.
- **Dialog** (the sheet).
  - White, 18px corners, the overlay shadow over a 45% black scrim, 480px for most.
  - A 17px bold title; grouped boxes inside for lists of settings.
  - Actions on the right: the default one last and filled; Cancel as the round grey pill.
- **Popover and menu.**
  - White, 10px corners, 5px inside, the overlay shadow.
  - 28px rows at 13px with 5px corners; the hovered row fills blue with white text, as native menus
    do. Glyphs sit at the right end of the row.
  - Hairlines between groups; a destructive item in red last.
- **Tooltip.** A small white box with a half-pixel edge, 12px ink text, 5px corners. It appears after
  a pause.
- **Spinner.** The grey spokes, in buttons and small areas only.
- **Skeleton.** The artwork grey (`#ebebeb`, dark `#323232`) in the shape of what's loading: squares
  for art, circles for people, bars for text.

**AI and chat**
- **Chat.**
  - Your own messages in a blue bubble with white text, right-aligned; the other side in the grouped
    grey, left-aligned. 18px corners.
  - Timestamps are 11px grey, centred between groups.
- **Composer.** The search capsule grown tall: white, 19px corners, the glass shadow and a mid-grey
  edge that turns blue while typing. Send is a round black button with `arrow-up`.
- **Thinking.** A grey line ("Thinking…") with a soft pulse. **Tool call:** a hairline-edged row
  with 10px corners, a 16px glyph, the tool name and a status badge.
- **Citation.** A small grey capsule with a number; the source shows in a menu on hover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns red and the message replaces the footnote. Check on blur and on
  submit, never while someone is typing.
- **In a form:** a danger alert above it, saying how many things need fixing and that nothing
  changed ("2 things need fixing. Your email hasn’t changed yet."). Focus moves to it.
- **Somewhere else:** a notification banner with what happened and what to do ("Couldn’t download
  Salt and Static. Free up 420 MB and try again.").
- **A whole page:** centred in the content.
  - A 48px outline glyph in grey, the code in small mono, a 26px bold title, one sentence, the black
    pill and a blue link.
  - **404:** "This page can’t be found" with a way home and search.
  - **500:** "Sonder isn’t responding": say it's on our side and nothing changed, with Try again.
  - **403:** "This mix is private", with who can open it and how to ask.
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - The page title ("Pulse") at 34px bold, under a toolbar with the glass search capsule.
  - Two wide editorial lockups: an 11px eyebrow, a 17px headline and grey line, then a 16:8 tile
    with a caption over a dark scrim.
  - Shelves with a chevron title: square art, a song shelf in three hairline columns, round
    portraits. The floating player at the bottom.
- **List and detail.**
  - A record: big art on the radiosity shadow, the 26px bold title with the performer in blue under
    it, grey metadata, a grey paragraph with "MORE", then round shuffle, the black Play pill and a
    round add.
  - The hairline track list below. The detail is the lyrics pane on the right in the grouped grey:
    26px bold lines, the current one in ink, the rest faded.
- **Onboarding.** A centred sheet: the mark, step dots, a 34px bold question, a search capsule, round
  picks with a blue tick, genre capsules (chosen ones black), one field, the black Continue pill and
  a blue "Not now".
- **Settings.** The title, a segmented control, then grouped boxes: a semibold label above, rows
  split by inset hairlines with switches, selects and grey values with a chevron, grey footnotes
  below. Delete account comes last as red text in its own box.
- **Empty state.** The page title, then a 56px grey glyph, a 22px bold line, one sentence, the black
  pill and a blue link; a shelf of suggestions under a hairline.
- **Pricing.**
  - A white local bar with a small black pill; a centred hero with a 70px bold headline.
  - On the sidebar grey, a 56px semibold heading with a grey second line, then plan cards with 18px
    corners: the tier and its price at 28px semibold (price grey), an ink rule, ticked 17px lines and a pill.
  - Questions as hairline rows below.
- **Errors.** The field, form, notification and full-page errors above, as one page.

## Words

- Short and plain: "Play", "Continue", "Not now", "Search Sonder".
- Titles of works in title case; everything else in sentence case.
- Durations as `3:41`; dates short ("Nov 7, 2026"); counts as "7 songs, 27 minutes".

## Do and don't

| Do | Don't |
| --- | --- |
| Let the artwork carry the colour | Tint panels, cards or the sidebar |
| Make the one main action a black (white in dark) pill | Fill buttons with blue or the brand pink-red |
| Put round grey buttons beside the main pill | Outline secondary buttons |
| Use blue for links, glyphs, ticks and switches | Use blue for big fills or backgrounds |
| Keep the pink-red for the mark, live badges and art | Use the brand colour for actions or selection |
| Set titles bold and large (34, 26, 17) | Bold body text or use mid weights for titles |
| Split lists with hairlines; group settings in grey boxes | Zebra-stripe everything or box every row |
| Float the player and toolbars on glass | Pin a full-width bar across the bottom |
