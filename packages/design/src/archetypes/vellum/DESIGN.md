# Vellum

Category: calm and minimal. A quiet, native-feeling journal: white pages and grey grouped panels, ink
text, a bright sky blue as the signature with one colour for each journal, pill actions, a timeline
of entries with the weekday and a big day numeral in a left column, and entry text in a warm
humanist face at an easy reading width. Light, and a true black dark mode. For journals, diaries and
personal record-keeping.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `vellum` preset of `@mariachi/design` (`data-theme="vellum"`,
`themes/vellum.css`).

The language comes from a native desktop and phone app. On the web it keeps the native rhythm:
panes rather than pages, grouped panels rather than boxed forms, large bold titles, and controls
that look like the platform's own.

## Principles

- **The writing is the page.** Entries sit on white at a reading width of about 40rem, in the entry
  face (Lato) a size larger than the interface. Chrome is thin, grey and quiet around them.
- **Time is the structure.** Lists of entries are a timeline: a bold month heading, then rows with
  the weekday in small capitals over a big day numeral, the title, two lines of text and a meta line.
  The calendar is a first-class view, not an extra.
- **Colour belongs to journals.** The sky blue (`--m-color-brand-default`) is the default journal's
  colour and the brand; each other journal has its own. Colour marks which journal something is in:
  a small square swatch, a band behind a journal's title, the open row, a written day in the
  calendar. Actions use the deeper blue.
- **Native, not webby.** Grey grouped panels with 20px corners, inset hairlines between rows, pill
  buttons, round icon buttons, a platform switch. No drop shadows on content; shadows only on things
  that float.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas | white `#ffffff` | true black `#000000` |
| Grouped panels, grey pills, month bands (sunken) | `#f2f2f7` | `#1c1c1e` |
| Raised (menus, sheets) | `#ffffff` | `#2c2c2e` |
| Journal column (sidebar) | cool grey `#e2e7ea`; current row `#cbcfd2` | `#1c1c1e`; current `#3a3a3c` |
| Text: titles, muted, subtle | `#22282b`, `#535a5f`, `#62676a` | `#ffffff`, `#98989f`, `#8e8e93` |
| Entry text (prose) | ink `#333b40` | `#ebebf0` |
| Hairlines | `#e6e6ec`; lighter `#f2f2f7`; date tiles `#e6e6ec` | `#38383a`; `#2c2c2e` |
| Control borders (3:1) | system grey `#8e8e93` | `#8e8e93` |
| Brand (sky blue) | `#44c0ff` with ink text `#22282b`; tint `#e3f5ff` | the same; tint `#0d2a3a` |
| Actions (accent) | deep blue `#1e75ae` with white; text `#1b6ca1` | `#1e75ae`; text `#44c0ff` |
| Control blue (switch, checkbox, progress, focus) | `#248bd9` | `#248bd9`; focus `#44c0ff` |
| Status | green `#1f8238`, amber `#ff9500` (ink text), red `#d70015` | `#30d158`, `#ff9f0a`, `#ff453a` |

- **Journal colours.** Sky (the brand), deep blue (the accent), green (success), amber (warning),
  red (danger) and charcoal (`fg.default`) are the tokens recipes use for journals; the chart palette
  adds lilac and teal.
- **Radius.**
  - 3px on journal swatches, 4px on photos and small parts, 8px on date tiles, nav rows and inputs'
    inner parts, 10px on inputs, selects and menus;
  - 14px on dialogs, alerts, toasts and tables; 20px on grouped panels and plan cards; 28px on the
    top of a sheet over a colour band;
  - every button and segmented control is a pill.
- **Shadow.** None on content. Menus and sheets: a half-pixel edge and a deep soft drop
  (`0 10px 30px` at 18%). Floating marketing screens: `0 4px 40px` at 15%.
- **Motion.** 150, 250 and 400 ms, easing `cubic-bezier(0.25, 0.1, 0.25, 1)`; sheets use a gentle
  spring-like `cubic-bezier(0.2, 0.9, 0.3, 1)`. Nothing bounces.
- **Spacing.** A 4px unit:
  - 12px vertical padding in rows, 16px horizontal;
  - 8–12px between pills;
  - 24–32px between sections;
  - grids gap 16px.
- **Layout.**
  - On a wide screen, three panes: the 240px journal column, a 24rem timeline, then the entry.
  - Single pages sit in a 64rem container; settings and entries in 42rem; forms in 30rem.
  - At phone width the panes stack, the journal column first.
- **Density.** 1 by default; `--m-density: 0.85` for dense lists.

Use tokens, never colour literals: `var(--m-color-brand-default)`, `var(--m-space-4)`. The exact
scales are in the reference at the end.

## Type

- **Families.**
  - **Inter** (`@fontsource-variable/inter`) for the interface: lists, buttons, titles and labels.
    It stands in for the platform's system face.
  - **Lato** (`@fontsource/lato`) for entry text and entry titles: set `font-family:
    var(--m-font-family-display)` on the entry body and its title.
  - **JetBrains Mono** (`@fontsource-variable/jetbrains-mono`) for code in entries.
- **Sizes:**
  - interface body 15px at a 1.45 line height; entry text 17px at 1.65;
  - meta lines 11–13px; the weekday in a date tile 11px small capitals, tracked 4%;
  - the day numeral 24px, regular, tabular;
  - month headings and section titles 20px bold; entry titles 24px bold in the entry face;
  - large page titles 34px bold, tracked −1.5%; marketing headings 48px bold.
- **Weights.** 400 for text, 500 for tabs and quiet emphasis, 600 for entry titles in lists and
  buttons, 700 for headings.
- **Case.** Sentence case. Capitals only for the weekday in date tiles and tiny stat labels
  ("ENTRIES").

## Icons

- Lucide, outlined, **1.5px stroke**: 18px in toolbars and grouped rows, 15–16px in the journal
  column and buttons, 40px for empty states and full-page errors. Grey (`fg.subtle`) in toolbars;
  ink when current.
- Journals have no icon: a square colour swatch stands for them.
- **The same icon for the same action, every time:**
  - add `plus`, edit `square-pen`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Journals are the series: sky, deep blue, green, amber, red, lilac, teal, charcoal, in that order.
- The calendar is the main chart: written days filled in the journal's colour with 8px corners,
  today ringed in the accent.
- Counts and streaks are big bold numerals in grey tiles, not charts. Bars, when needed, are
  rounded, in the journal colour, without gridlines.

## States (every control)

- **Hover.** Grey pills deepen one step (`#f2f2f7` to `#e5e5ea`); rows and nav items take a grey
  fill; the primary pill goes from `#1e75ae` to `#1a6699`. No lift, no shadow change.
- **Focus.** A 2px ring in the control blue outside the control, on keyboard focus only.
- **Pressed.** One step darker than hover.
- **Disabled.** Half opacity; say why nearby if it matters.
- **Error.** The control border turns red and the message replaces the help text below it, in red
  13px.
- **Loading.**
  - A button keeps its width and label with `aria-busy="true"`, showing a thin spinner in the
    control blue.
  - Lists show grey skeleton rows shaped like entries: a tile, two lines and a square.
- **Selected and current.**
  - The open entry row fills with its journal's colour, with ink text.
  - The current journal is a darker grey row; in a settings list the current section fills with the
    action blue and white text.
  - Checked controls are in the control blue; a segmented control shows a white pill on the grey
    track.

## Components

All 36 of the library's components, as Vellum draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, for panes: the 15rem journal column, then a 24rem timeline beside the entry;
- `m-container`, the content column: 64rem, 42rem for settings and entries, 30rem for forms;
- `m-grid`, for grouped panels and plan cards, 16px apart;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** Always a pill, weight 600; 40px by default, 48px (`lg`) for the one big action on a
  page, 32px (`sm`) in toolbars and rows.
  - **Primary:** the deep blue with white text, one per view.
  - **Secondary** (the default): the grey fill with ink text, no border.
  - **Ghost:** blue text, no fill ("Another question", "Back").
  - **Danger:** solid red, only to confirm.
  - **Icon-only:** a round grey pill, or a plain grey glyph in a toolbar.
- **Input, textarea.** 40px, 10px corners, white, the system grey border; the focus ring in the
  control blue.
- **Select.** The same box with a small chevron; in a settings row, about 11rem wide at the right.
- **Field.** The label above at 13px medium, then the control, then help or error text at 13px.
- **Checkbox, radio.** 18px; the checkbox a 5px-rounded square, both filling with the control blue
  when checked.
- **Switch.** The platform switch: 44 × 26px, a round white knob with a soft shadow, grey when off and
  the control blue when on. It takes effect at once.

**Navigation**
- **Sidebar** (the journal column). 240px on cool grey, with no edge line.
  - The wordmark at the top, with a round settings button at the right.
  - The app's views (Write, Photos, Places, Calendar, Starred) with 15px icons and right-aligned
    counts.
  - A hairline, then "Journals": one row per journal, each a square colour swatch, the name and a
    right-aligned count; the current one in a darker grey with 8px corners. "Start a journal" with a
    plus ends the group. There is no "all journals" row.
  - A hairline, then Tags and Archive.
- **Navbar** (public pages). White, a faint bottom hairline, a wordmark left, 17px ink links, and one
  outlined blue button at the right.
- **Toolbar** (in the app). No fill: grey 18px glyph buttons for the views (timeline, photos,
  calendar, places) with the current one on a grey pill, search at the right; above an entry, Close,
  the date in subtle text, then More and New.
- **Tabs.**
  - **Text tabs:** grey labels; the current one in ink with a short bar under it.
  - **Pill** (the segmented control): a grey track with the current segment a white pill.
- **Breadcrumb.** Muted links with "›" between and the current page in ink. In the app, a back
  chevron is preferred.
- **Pagination.** Round ghost buttons, the current one in the action blue. Timelines scroll instead.

**Data and content**
- **Timeline row** (built from the primitives).
  - A bordered date tile: the weekday in 11px capitals over a 24px numeral. Further entries on the
    same day leave the tile out.
  - The title in 15px semibold, two lines of text, then the meta line: a tiny journal swatch, the
    journal's name in accent text, the time, place and weather.
  - A square photo at the right, 72px, 4px corners. Rows are split by hairlines; months by a bold
    20px heading.
- **Table.** For plan comparisons and lists of records: an outlined panel with 14px corners, 13px
  capital column labels, hairline rows. Not for entries.
- **Card** (the grouped panel). The grey fill, 20px corners, no border and no shadow, 20px padding.
  Rows inside are split by inset hairlines. The `outline` variant is white with a hairline (plan
  cards, settings groups).
- **Badge.** A small pill, 11px semibold, on a tint, no border ("Most chosen", tags).
- **Avatar.** Round, initials on the brand tint; the app mark is an ink tile with 8px corners.
- **Divider.** A hairline; inset to line up with text inside grouped panels.
- **Accordion.** Hairline rows with the question at 17px semibold and a chevron; no fills.
- **Code, kbd.** JetBrains Mono on the grey fill with 10px corners; keys are small rounded boxes
  with a hairline.
- **Prose** (the entry). The entry face at 17px with a 1.65 line height, at most 40rem wide, ink
  `#333b40`, photos full width with 6px corners, quotes in muted text with a hairline at the left.
- **Progress.** A 6px rounded bar in the control blue on the grey track.
- **Meter.** The same bar; amber and red past the marks.
- **Usage.** A label and amount over a meter bar, the amount in tabular figures.

**Feedback and overlays**
- **Alert.** A pale tint, 14px corners, no border and no stripe; an 18px status icon, a semibold
  title and the body in the tone's text colour.
- **Toast.** A floating white banner (raised in dark) with 14px corners on the overlay shadow, a
  status icon, a semibold title, one line of detail and one action.
- **Dialog** (a sheet). White, 14px corners, the overlay shadow over a 30% black scrim, a 20px bold
  title, buttons at the right with the primary last.
- **Popover and menu.** White with 10px corners, the overlay shadow and 5px padding; 28px rows that
  fill with the action blue and turn white on hover, the platform's menu highlight.
- **Tooltip.** A small dark label with 6px corners, 13px text, after half a second.
- **Spinner.** A thin ring in the control blue, inside buttons and small areas only.
- **Skeleton.** Grey blocks in the shapes of what's loading, with a soft shimmer that stops under
  reduced motion.

**AI and chat**
- **Chat.** A conversation about the day: the person's messages on the grey fill with 20px corners
  at the right; the assistant's as plain text on white.
- **Composer.** A rounded box (22px corners) on a soft shadow; Send is a round primary pill; a
  microphone for dictation.
- **Thinking.** A muted line with a soft pulse. **Tool call:** a grey row with 14px corners, an
  icon, the tool's name and its status.
- **Citation.** A small grey pill with a number; the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the help text. Validate on blur and
  on submit.
- **In a form:** a red-tinted alert above it, counting what to fix and saying nothing was made yet
  ("Two things to fix. The journal wasn't made yet."). Each field shows its own message.
- **Somewhere else:** a floating banner ("3 entries haven't synced · Retry"), always saying the
  writing is safe. Undo for anything reversible.
- **A whole page:** centred. A 40px outline icon in the subtle colour, a small "Error 404" line, a
  20px bold title, one sentence and stacked pills.
  - **404:** "This entry isn't here", with Go to your journals.
  - **500:** "Something went wrong on our side" and "Nothing you wrote was lost", with Try again.
  - **403:** "This journal is locked", with Ask for access.
- **Words.** Reassure first: say whether anything written was lost. No codes in sentences, no blame,
  no exclamation marks.

## Page shapes (recipes)

- **Dashboard** (Write).
  - "Write" as a 34px bold title with the date in subtle text, and round grey previous and next
    buttons.
  - Two grey count pills, today's question with a full-width primary pill, and a grouped panel of
    moments (photos, places, voice memos) with counts and chevrons.
  - Beside it: the month calendar with written days in the brand colour, recently written entries,
    and streak and count tiles.
- **List and detail.** The journal column, the timeline (toolbar of view glyphs, bold month headings,
  date tiles, photos, the open row filled with the journal colour), and the open entry at a reading
  width with its meta footer.
- **Onboarding.** A journal-colour band with a large title, a white sheet with 28px top corners
  rising over it, a progress bar, one field, colour swatches, a grouped panel of switches and a
  full-width primary pill.
- **Settings.** Opened from the settings button by the wordmark: a grey section list whose current row fills with the action blue; a title bar with
  Close; grouped outlined panels of label-and-control rows; a red destructive row last.
- **Empty state.** A new journal's colour band and title, text tabs, then a 40px feather, a bold
  heading, one sentence and two stacked pills.
- **Pricing.** A white header, a grey band with a 48px bold heading, three white plan cards (the top
  plan ringed in amber), 48px prices "per year", tick lists, pill buttons, and a comparison table.
- **Errors.** The field, form, banner and full-page errors above, as one page.

## Words

- Warm and plain, in sentence case: "Write about it", "Start from a moment", "Start a journal".
- Dates written out ("Saturday, 28 September"); times in the person's own clock.

## Do and don't

| Do | Don't |
| --- | --- |
| Let the entry text lead, in the entry face at a reading width | Crowd entries with chrome, cards or borders |
| Put the weekday and a big day numeral in the left column | Hide dates in small grey meta text |
| Give each journal its own colour, shown as a swatch or band | Use colour for decoration or for status |
| Group settings and lists in grey panels with inset hairlines | Box every row, or use zebra stripes |
| Make every button a pill, the primary in the deep blue | Put white text on the sky blue |
| Keep dark mode true black with grey panels | Use a navy or brown dark theme |
| Draw photos as token shapes in mock-ups | Ship stock photos or the reference's art |
