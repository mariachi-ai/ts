# Reel

Category: content-first and immersive. A cool slate dark where the posters carry the colour: every
grey leans blue, posters sit in tight grids with a faint inner frame, green marks the main action and
"done", orange marks what people love and blue marks collections and the top tier. Star ratings,
serif titles and serif reading text beside a neutral grotesque, small tracked capitals over a
hairline for every section, and dense, quiet metadata. For diaries, catalogues and social apps about
things people watch, read or collect.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `reel` preset of `@mariachi/design` (`data-theme="reel"`, `themes/reel.css`).
It is dark-first: design in dark, then check light.

## Principles

- **The content is the colour.** The chrome is slate and grey-blue; posters, backdrops and avatars
  bring every warm or bright hue. Never tint panels to decorate.
- **Three signal colours, each with one job.** Green is the main action and "done" (attended,
  rated, saved). Orange is love and upgrades. Blue is collections, the top tier and focus. Don't
  swap them.
- **Ratings are stars.** Half-star steps, bright green when earned, the hairline slate when empty.
  A heart beside them means loved.
- **Editorial, then dense.** Titles and reading text are serif; everything around them is a small,
  quiet sans: 12–13px metadata, counts with tiny glyphs, tracked capitals for section labels.
- **Tight, not airy.** Posters sit 5–10px apart, sections 30px apart, the page in one 950px column.

## Foundations

| What | Dark | Light (ours, from the same ramp) |
| --- | --- | --- |
| Page | `#14181c`, with a faint top-lit fade from the surface step under the header | white, fading from `#eef2f6` |
| Surface (chips, wells) | `#202830` | `#eef2f6` |
| Raised (panels, plan columns, fields) | `#2c3440` | white |
| Sunken (poster well, table header) | `#12161a` | `#e2e8ee` |
| Action-panel slate (dialogs, menus, the action panel, month tiles) | `#445566` | `#ccd5de` |
| Text: default, body, metadata | `#d8e0e8`, `#99aabb`, `#8899aa` | `#14181c`, `#445566`, `#556677` |
| Hairlines | `#445566` under headings and tabs; `#2c3440` between rows | `#ccd5de`; `#e2e8ee` |
| Control edge | `#778899` | `#778899` |
| Links | `#ddeeff` (ice) | `#0b6aa3` |
| Action green (fills) | `#008a17` with white text | the same |
| Star and "done" green | `#00e054` | `#006e12` |
| Love and upgrade orange | `#ff9933` text, `#ee7000` fills | `#a34f00`, `#ee7000` |
| Collections and top-tier blue | `#40bcf4` text, `#209ce4` fills; focus `#209ce4` | `#0b6aa3`, `#209ce4` |
| Destructive | `#c40f00` fills, `#ff7a6b` text | `#c40f00` |

- **Radius.** 2px for tags and checkboxes, 3px for buttons, fields, menus and dialogs, 4px for
  posters and panels. Avatars are round. Nothing is a pill.
- **Shadow.** Almost none. Posters carry an inset 1px frame instead; overlays get a soft black drop
  (`0 10px 30px` at 55% in dark).
- **Motion.** 150ms for dropdowns and hovers, 330ms in, 500ms out, on an ease-out-expo curve
  (`cubic-bezier(0.19, 1, 0.22, 1)`); pop-ins may overshoot slightly
  (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`).
- **Spacing.** A **5px** unit (the reference's rhythm): `--m-space-1` is 5px, `-2` 10px, `-3` 15px,
  `-4` 20px. The usual gaps are:
  - 5–10px between posters and between chips;
  - 10–15px inside panels and between rows;
  - 20px between fields and inside panels;
  - 30px between page sections.
- **Layout.**
  - One content column **950px** wide (`m-container`), centred, with 20px side padding.
  - Side columns are 230px: the poster column on a detail page, the action panel, the sidebar.
  - A content page is a main column (about two thirds) beside a 230px side column of small
    sections.
  - Forms and steps sit in a 760px column.
- **Density.** 1 by default; the reference is already dense. For catalogues, set
  `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Hanken Grotesk (variable) for every piece of interface: navigation, labels,
  buttons, metadata, page titles. Newsreader (variable, with optical sizes) for titles of works
  (film pages, list rows, note headings) and for reading text (synopses, notes, reviews). JetBrains
  Mono for codes only. Headings default to the serif; set section labels and interface headings in
  the sans.
- **Sizes:**
  - body text 13px with a 1.5 line height; metadata 12px; section capitals 11px;
  - reading text in the serif at 15px over 25px (synopses on a detail page at 18px);
  - work titles in the serif at 700: 36px on a detail page, 24px in note rows, 18px in tables;
  - page titles in the sans at **300**: 28px ("Account settings"), 24px for section titles;
  - big figures in the serif at 700 (24px), or the sans at 300 for averages.
- **Case.** Uppercase, tracked 0.075em, for the header links, buttons, tabs, table headers, tags and
  section labels. Everything else is sentence case.
- **Figures.** Tabular figures in tables and counts; large numbers shortened (`4.1K`, `1.2K`).

## Icons

- Lucide, outlined, **2px stroke**: 14px beside text and in rows, 16px in controls, 30px in the
  action panel. Stars and hearts are filled.
- Colour carries meaning only: green ticket-check for attended, blue people for clubs or lists,
  orange heart for loved, green star for ratings. Other icons take the text colour.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis`, close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **The ratings histogram** is the signature chart: ten thin bars (half a star to five) in the
  action-panel slate, 1px apart, no axes, a small green star at the left and five at the right, the
  average beside it in the sans at 300.
- **More series** step through green, orange, blue, ice and slate.
- No gridlines; labels in 11px tracked capitals. Tooltips use the tooltip treatment.

## States (every control)

- **Hover.** Fills step one slate lighter (secondary `#556677` → `#667788`); the action green steps
  darker. Rows take a faint lift (`#1a2026`). No movement, no shadow change.
- **Focus.** A 2px blue outline (`#209ce4`), 1px off the control, on keyboard focus only. Never
  remove it.
- **Pressed.** One more step darker. Nothing moves.
- **Disabled.** 40% opacity. Say why nearby if someone needs it.
- **Error.** The field's edge turns red; the message sits under the field in red 12px with a small
  alert icon, saying how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a small spinner.
  - Lists and grids show skeleton posters and lines in the surface slate, never a spinner over the
    page.
- **Selected and current.** Tabs: the current one in the text colour over a 1px line, the others
  green. Profile tabs: the current one in the text colour over a 2px green line. Navigation rows:
  the raised slate.

## Components

All 36 of the library's components, as Reel draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the 950px column (or `md`, 760px, for forms and steps);
- `m-split`, a 230px side column beside the main one;
- `m-grid`, for posters: 10–15px gaps, about 10rem columns for large posters and 6rem for strips;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 30px apart, each opened by a section heading: 11px tracked capitals in body ink over a
1px `#445566` hairline, with an optional capital link ("See all") at the right.

**Actions and forms**
- **Button.** 3px corners, bold 12px tracked capitals, 30px tall (26px `sm`, 42px `lg` for the one
  big call on a public page).
  - **Primary:** the action green with white text. One per view.
  - **Secondary** (the default): the mid slate `#556677` with white text ("Back", "Redeem").
  - **Ghost:** body-ink text, for quiet actions and filters.
  - **Danger:** the destructive red, only to confirm.
  - **Icon-only:** square, with an `aria-label`.
- **Input, textarea.** Filled `#2c3440` boxes, 3px corners, a soft inset shade and a `#778899` edge;
  the focus edge is blue. Long text (bios, notes) is set in the serif at 15px.
- **Select.** The same box with a chevron. Filters above a list are capital ghost buttons with a
  chevron instead ("Venue ⌄", "Year ⌄").
- **Field.** The label above in the text colour at 13px, help below in body ink at 12px, the error
  in red. A required field is marked with a small green dot.
- **Checkbox, radio.** 16px slate boxes, 2px corners on the checkbox, green when checked.
- **Switch.** 44 × 24, a slate track, green when on, a white knob. It takes effect at once.

**Navigation**
- **Navbar.** The page colour, 72px, the content column's width. The name at the left; at the right
  the person's avatar and name with a chevron, then 13px bold tracked capital links (the current one
  in the text colour, the rest in body ink), a search icon and one green button.
- **Sidebar.** Rarely used; when it is, 230px, rows in body ink at 13px, the current one on the
  raised slate with 3px corners, headings in 11px tracked capitals, counts on the action-panel
  slate.
- **Tabs.**
  - **Underline:** tracked capitals, the others in green, the current one in the text colour over a
    1px line, on a hairline row.
  - **Pill** (the app's segmented control): a sunken track with the current segment on the
    action-panel slate.
  - **Profile bar:** a hairline-framed strip with sentence-case 15px tabs and a 2px green line under
    the current one (built from links in the recipes).
- **Breadcrumb.** Body-ink links separated by "›", the current page in the text colour. Prefer a
  back link.
- **Pagination.** Square 3px buttons in body ink, the current one on the raised slate; "Older" and
  "Newer" as capital ghost buttons.

**Data and content**
- **Table** (the diary).
  - No outer frame. Headers are 11px tracked capitals in metadata grey on the sunken well.
  - Rows are separated by `#2c3440` hairlines and lift faintly on hover.
  - The date is a slate month tile plus a large light day number; the work is a small poster plus
    its serif title; ratings are stars with a heart; the actions sit in a sunken end column.
- **Card.** The raised slate, 4px corners, no border and no shadow, 15 by 20px inside. Card titles
  are the serif at 18px bold. The outline card is a hairline box on the page (the free plan).
- **Badge.** Tiny bold capitals (10px) on 2px corners: the surface slate for neutral ("DCP"), solid
  orange for an upgrade tier, solid blue for the top tier. Plan tags on a pricing page are the same
  treatment at 18px.
- **Avatar.** Round, with a faint 1px ring; initials on the action-panel slate. 24px in rows, 40px
  in lists, 100px on a profile.
- **Divider.** A 1px hairline: `#445566` under headings, `#2c3440` between rows.
- **Accordion.** Hairline-separated rows, the question in the sans at 15px semibold, answers in body
  ink.
- **Code, kbd.** JetBrains Mono at 12–13px on the surface slate with 2–3px corners. Keys have a
  hairline edge.
- **Prose.** Notes and reviews in the serif at 15px over 25px in body ink, about 40rem wide; links
  and bold in the text colour.
- **Progress.** A thin square-ended bar: green on the raised slate.
- **Meter.** The same bar; orange, then red, past its marks.
- **Usage.** A capital label and a tabular amount over a meter bar.

**Feedback and overlays**
- **Alert.** A tinted box in the tone's dark tint, 3px corners, no stripe, a 16px icon, the title
  semibold. Danger alerts sit above the form and say what was not done.
- **Toast.** The flash message: the action-panel slate, white text, 3px corners, one action. Success
  messages close themselves; errors stay.
- **Dialog.** The action-panel slate `#445566`, 3px corners, a deep scrim, a capital eyebrow, a
  serif title at 24px, ice-blue text, the green action at the bottom right.
- **Popover and menu.** The action-panel slate with white 13px rows that deepen to the mid slate on
  hover, a green tick on the chosen one, capital group labels in ice.
- **Tooltip.** The action-panel slate, white 12px text, 3px corners.
- **Spinner.** A thin ring in the star green, inside buttons and small areas only.
- **Skeleton.** Poster-shaped and line-shaped blocks in the surface slate with a slow shimmer that
  stops under reduced motion.

**AI and chat**
- **Chat.** The other side's messages plain on the page in body ink; your own on the raised slate
  with 4px corners. Names in bold, timestamps in metadata grey.
- **Composer.** A surface-slate box, 4px corners, a `#778899` edge that turns blue while typing;
  send is a green square button.
- **Thinking.** A body-ink line with a soft pulse. **Tool call:** a hairline-edged row with a 14px
  icon, the tool's name and a capital status tag.
- **Citation.** A small surface-slate tag with a number; the source in a popover on hover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns red and the message sits under it with an alert icon. Validate on
  blur and on submit, never while someone is typing.
- **In a form:** a danger alert above the fields, counting what needs fixing and saying what was not
  done ("Two things need fixing. Nothing was shared."). Focus moves to it.
- **Somewhere else:** the flash message with what happened and one action ("Booking didn't go
  through · Pick seats").
- **A whole page:** a faded backdrop band, the code small in mono, a light 24px title, one
  sentence and one or two buttons.
  - **404:** the page isn't here, with a way back home.
  - **500:** something broke on our side and nothing was lost, with Try again.
  - **403:** it's for members, with Ask to join.
- **Words.** Say what happened, whether anything changed and what to do. No codes in sentences, no
  blame.

## Page shapes (recipes)

- **Dashboard.**
  - A centred welcome line in the sans at 300 with the person's name underlined.
  - A row of four large posters with counts under each (green attended, blue clubs, orange loved).
  - A strip of small posters with stars.
  - Serif-titled notes in the main column; a 230px side column of month figures, the ratings
    histogram and the next tickets with month tiles.
- **List and detail.**
  - The profile bar, capital sub-tabs and capital filters on one hairline, then the diary table.
  - A row opens its own page: a backdrop fading into the page, the poster in a 230px column with its
    counts, the serif title and year, a capital tagline, the serif synopsis, capital tabs with
    slate chips, and the action panel and ratings histogram on the right.
- **Onboarding.** A backdrop with a centred serif headline, then one raised step panel: a capital
  step label with thin progress bars, poster slots to fill, a search field, checkbox rows, Back in
  slate and Continue in green.
- **Settings.** A light 28px title with an upgrade tag at the right, green capital tabs on a
  hairline with "Close account" at the end, a light section title, fields on the left, poster slots
  and switch rows on the right, Save changes in green.
- **Empty state.** Inside the page's frame: a sunken panel with dashed poster outlines, a light
  title, one sentence, a green button and a slate one.
- **Pricing.** A serif headline; an outlined free box beside one raised panel split by a hairline into
  two plans, each with a coloured capital tag overlapping its top edge, centred lines, a mid-slate
  price band and a capital action band; questions below.
- **Errors.** The field, form, flash message and full-page errors above, as one page.

## Words

- Short and plain: sentence case for sentences and titles, capitals only through the tracked style.
- Counts short (`4.1K`), dates short ("Thu 13"), times in 24 hours.

## Do and don't

| Do | Don't |
| --- | --- |
| Keep every grey on the cool blue ramp | Use neutral greys, or tint panels warm |
| Let posters and backdrops bring the colour | Colour the chrome to decorate |
| Use green for the action and "done", orange for love, blue for collections | Swap the three, or add a fourth signal colour |
| Show ratings as green stars, with half stars | Use numbers alone, or yellow stars |
| Set titles and reading text in the serif | Set long reading text in the sans |
| Label sections with small tracked capitals over a hairline | Use big bold section headings |
| Keep posters tight: 5–10px gaps, 4px corners, an inner frame | Round posters heavily or float them on shadows |
| Use 3px corners on buttons and fields | Pill buttons |
