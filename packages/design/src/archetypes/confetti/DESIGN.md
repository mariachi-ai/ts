# Confetti

Category: playful and quirky. A cheerful analytics workbench: warm yellow-grey canvases, white
panels with hairline borders, near-black text, an orange-red accent that turns brand yellow in dark
mode, and chunky buttons that stand on a darker bottom ledge and sink when pressed. Dense 14px UI,
6px corners, bold uppercase table headers. For data-heavy product and developer tools with a sense of
humour.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `confetti` preset of `@mariachi/design` (`data-theme="confetti"`,
`themes/confetti.css`).

## Principles

- **Buttons you want to press.** Every primary and secondary button stands on a 3px ledge a shade
  darker than its face. Hover lifts it a pixel; pressing sinks it and the ledge disappears. Flat
  buttons exist too, but only for quiet actions in bars and rows.
- **Warm, not white.** The page is a warm yellow-grey; panels on it are white with a hairline. The
  navigation column is a step warmer still. Nothing is cool grey in light mode.
- **Dense and exact.** 14px text, 37px controls, 40px table rows, small 11–12px meta. Data screens
  fit a lot without feeling cramped because the hairlines do the separating.
- **A wink, in the right places.** The app is a serious tool with cheeky words. The public pages
  (pricing, sign-up) are where the quirk shows: a desktop with labelled icons, a taskbar, and pages
  that open as windows.
- **Orange by day, yellow by night.** The accent (links, the current tab, checked controls, focus) is
  an orange-red in light mode and the brand yellow in dark mode. The primary button is the amber
  between them.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas (the scene) | warm grey `#f3f4f0` | `#131316` |
| Panels, cards, menus | white `#ffffff` | `#232429` |
| Toolbars and quiet fills (sunken) | `#eff0ea` | `#18181b` |
| Navigation column | `#e5e7df` | `#131316` |
| Text: default, muted, subtle | `#111111`, `#404040`, `#666666` | `#e6e6e6`, `#a6a6a6`, `#999999` |
| Hairlines | `#dbded4`; lighter `#e5e7df` | `#2f3037`; `#26272c` |
| Control borders | `#86887a` | `#74778a` |
| Accent (links, current tab, checks, focus) | orange-red `#f54e00`; text `#c03c00` | yellow `#f8be2a`; text `#f1a82c` |
| Primary button | amber `#eb9d2a`, border `#b17816`, dark text | yellow `#f8be2a`, border `#b17816` |
| Brand panels and highlights | amber `#eb9d2a`; pale `#fdf3e4` | `#f8be2a`; `#3a3224` |
| Success, warning, danger, info | green `#388600`, amber `#f7a501`, orange-red `#db3707`, blue `#1d4aff` | the same solids; lighter text |

- **Radius.** 4px for checkboxes, keys and small parts; 6px for buttons, inputs, panels, tags,
  banners and dialogs; 10px for menus and popovers. Pills only for progress bars.
- **Ledge.** Buttons: a solid frame 3px below the face in the variant's own colour (amber under the
  primary, warm grey under secondary, a translucent orange-red under danger); tertiary is flat.
  Menus, popovers and lifted cards: a solid `0 3px 0` ledge in a warm grey (`#dadbd2`; `#35373e` in
  dark). Dialogs add a short dark drop under the bottom edge. Nothing else has a shadow.
- **Motion.** 100ms for switches and checks, 200ms for buttons, menus and dialogs, `ease`. Buttons
  lift 1px on hover and sink 1px when pressed.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px inside a control group and between ledge buttons;
  - 12–16px inside panels and between panels on a board;
  - 24px between settings sections;
  - 16px around the scene.
- **Layout.**
  - A 215px navigation column on the left, then a strip of open tabs, then the scene with a 16px
    margin. Scenes run full width.
  - Each scene starts with a title row: the tool's coloured icon, a bold 20px title, and ledge
    buttons on the right. A line of muted description may follow.
  - Boards are rows of panels 16px apart; a side panel is 18–22rem.
  - Settings use a 14rem nav beside a column of at most 46rem.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.875`; controls and padding
  shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Inter for everything (`@fontsource/inter`), at 400 for body, 500 for buttons and
  labels, 600 for emphasis and 700 for headings. The reference's own face is a proprietary grotesque
  with softly rounded ends; Inter is the open face closest to it (and the one in its own fallback
  stack).
- **Mono.** Source Code Pro (`@fontsource/source-code-pro`) for keys, IDs, property names and code,
  at 13px.
- **Sizes:**
  - body and controls 14px with a 1.57 line height;
  - secondary text 13px;
  - tags and chart meta 11px; table headers 12px;
  - scene titles 20px bold; section titles 16px bold; dialog titles 18px bold;
  - marketing headings 24px, 36px and 48px bold with −2.5% tracking.
- **Case.** Sentence case everywhere, except table headers and the tiny meta line over a chart title
  ("LINE · LAST 30 DAYS"): uppercase, bold, tracked 4%.
- **Figures.** Use `font-variant-numeric: tabular-nums` in tables and big numbers. Big numbers are
  36px bold with the change beside them in green or red with an arrow.

## Icons

- Lucide, outlined, **1.5px stroke**, 16px in navigation, buttons, inputs and rows; 20px in scene
  titles; 24–32px on tool tiles and in empty states and desktop icons.
- **Colour.** Each tool in the navigation has its own icon colour (blue, amber, green, orange-red),
  used beside its name everywhere: in the nav, in its tab and in its scene title. Other icons are in
  the text colour.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal, as a flat icon button), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-right`, refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Line and area.** 2px lines, no dots, over dashed hairline gridlines (`4 4`) with 11px muted axis
  labels. Areas stack with the line on top.
- **Steps (funnels).** Solid blue bars for people who made it; the drop-off is the same column
  hatched in the pale blue. Each step has a small numbered tag, its name in bold and the count.
- **Numbers.** 36px bold, then the change in green or red with a trend arrow.
- **Return grids.** Cells tinted in the blue at the share that came back, white text on the dark
  cells, 4px corners.
- **Series** step through blue `#1d4aff`, purple `#621da6`, teal `#42827e`, magenta `#ce0e74`, coral
  `#f14f58`, brown `#7c440e`, green and amber. Legends are 10px squares with 2px corners.
- Tooltips use the popover treatment.

## States (every control)

- **Hover.**
  - Ledge buttons lift 1px and keep their face colour.
  - Flat buttons, menu items and nav items take a 7.5% black fill.
  - Inputs darken their border.
  - Table rows take a faint warm fill.
- **Focus.** A 2px accent outline (orange-red; yellow in dark), 1px off the control, on keyboard
  focus only. Never remove it.
- **Pressed.** The button sinks 1px and its ledge shrinks to a line. A segmented control's chosen
  segment is framed in dark amber with an amber ledge.
- **Disabled.** 65% opacity, `not-allowed` cursor. Never hide a disabled action that someone needs to
  know exists; say why in a tooltip.
- **Error.**
  - The control's border turns orange-red.
  - The message replaces the help text under the field, in 13px medium, and says how to fix it.
- **Loading.**
  - A button keeps its width and label ("Saving"); `aria-busy="true"` hides the label behind a small
    spinner.
  - Panels show skeleton blocks with a slow 2s shimmer; charts keep their last results with a
    "Computed 4 minutes ago · Refresh" line.
- **Selected and current.** The nav item gets a 5% black fill and medium weight; the tab turns accent
  with a 2px bar; checked controls fill with the accent; a selected row gets the pale accent wash;
  a chosen tile is framed in amber with an amber ledge.

## Components

All 36 of the library's components, as Confetti draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, the 215px navigation column beside the scene, and side panels of 18–22rem beside the
  main panel;
- `m-container`, up to 90rem for public pages; app scenes run full width with a 16px margin;
- `m-grid`, for tiles: 16px gaps, 15–18rem columns;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 37px by default (33px `sm`, 49px `lg`), 6px corners, 14px medium, 12px side padding,
  an icon before the label.
  - **Primary:** a white face (yellow in dark), a dark-amber border, dark text, on an amber ledge. One
    per view, usually top right ("Add a chart", "New poll").
  - **Secondary:** white with a light grey border, on its grey ledge. The default for everything
    else in toolbars and filters ("Last 30 days", "Share", "Export").
  - **Ghost** (tertiary): flat, no border, a 7.5% fill on hover. For icon buttons (more, close, star)
    and quiet actions ("Skip for now").
  - **Danger:** white with an orange-red border and text, on its ledge; a pale wash on hover.
  - **Icon-only:** square, with an `aria-label`.
- **Input, textarea.** 37px, white, 6px corners, a 1px control border that darkens on hover and
  focus, 8px side padding. The search input carries its icon inside.
- **Select.** The same box as an input, with a small chevron. In toolbars, prefer a secondary button
  with a chevron ("Last 30 days ⌄") that opens a menu.
- **Field.** The label above in 14px semibold, then the control, then 13px help text or the error.
  Fields stack 16px apart.
- **Checkbox, radio.** 16px, a 1.5px border, 4px corners on the checkbox. Checked fills with the
  accent and a white tick (a charcoal tick on yellow in dark).
- **Switch.** Tiny: 28 × 15 with a 13px white knob; grey when off, the accent when on. It takes
  effect at once: no Save.

**Navigation**
- **Sidebar.** 215px on the warm navigation colour with a hairline edge.
  - Top: the workspace switcher (a lettermark, the name, a chevron).
  - Items are 14px with a coloured 16px tool icon, 31px tall, 6px corners; the current one has a
    5% black fill. Counts sit on the right in a small white tag.
  - Groups have plain 13px semibold headings in grey ("Understand", "Ship"), and hairlines between
    the top items, the tools and the footer.
  - In settings: a plain list with no fill, beside the content.
- **Navbar** (public pages). The taskbar: a warm strip, the logo mark, 13px medium links in 28px
  rounded boxes, icon buttons, and a small amber "Start free" on the right.
- **Open tabs** (in the app). Above the scene: each open page is a tab with its tool icon; the current
  one is the canvas colour with a hairline frame and no bottom edge, joining the scene.
- **Tabs.**
  - **Underline:** grey 14px labels 32px apart over a hairline; the current one in the accent with a
    2px accent bar.
  - **Pill** (the segmented control): the segments sit on the sunken fill; the chosen one is white,
    framed in dark amber with an amber ledge.
- **Breadcrumb.** 13px subtle links with "/" between and the current page in semibold. Used above
  the scene title for nested pages.
- **Pagination.** "1–25 of 3,912 people" in muted text, then flat chevron buttons; numbered pages,
  when shown, are flat 33px squares with the current one framed like a secondary button.

**Data and content**
- **Table.** A white panel framed by a hairline with 6px corners.
  - Headers 12px bold uppercase, tracked, in the text colour, on white.
  - 40px rows with hairlines; a faint warm fill on hover; a selected row in the pale accent.
  - The first column holds a lettermark or tool icon and a bold name; numbers right-aligned in
    tabular figures; a flat "more" button at the end.
  - Pagination sits in the panel's footer, right-aligned.
- **Card** (panel). White, a hairline, 6px corners, no shadow, 12–16px padding. Chart panels start
  with the tiny uppercase meta line, then a 14px bold title and a flat "more" button. A clickable
  panel scales up 1% and rests on the ledge when hovered. Dashed borders mark an empty or optional
  area.
- **Badge** (tag). 11px medium, 20px tall, 4px side padding, 6px corners, a 1px border: neutral on
  white, or the tone's wash and border ("Beta", "Free", "Host").
- **Avatar** (lettermark). Initials in deep plum on lilac, round; 18px in dense rows, 24px in tables
  and bars, 40px in profiles. A workspace gets a 6px-cornered square.
- **Divider.** A hairline. Labelled dividers ("OR") are 12px uppercase and muted.
- **Accordion.** Bordered rows with 6px corners, the question 14px semibold, a chevron on the right.
- **Code, kbd.** Source Code Pro 13px on the sunken fill with 6px corners (4px inline). Keys are
  white keycaps with a control border and a 1px bottom edge.
- **Prose.** 14px with a 1.7 line height for long text, at most 44rem, links in accent text with an
  underline, headings bold with a hairline under H2.
- **Progress.** A 6px pill: the accent on the sunken fill.
- **Meter.** The same bar; amber past "high", orange-red past "optimum".
- **Usage.** A label and an amount over a 6px accent bar, with a muted footer.

**Feedback and overlays**
- **Alert** (banner). The tone's wash with a 1px border in the tone, 6px corners, 8–12px padding,
  14px medium text, an 18px icon. Info banners are white with a hairline.
- **Toast.** White, a hairline, 6px corners and the dialog's drop; a tone icon, a semibold title, a
  line of detail and one small ledge button ("Try again"). Bottom right, 26rem wide.
- **Dialog.** White, a darker 1px border, 6px corners, the short dark drop, over a 20% black scrim.
  The title is 18px bold over a hairline; actions on the right, primary last, Cancel as secondary.
- **Popover and menu.** White, a hairline, 10px corners, standing on the 3px ledge; 4px inner
  padding; 33px flat rows with 6px corners that take the 7.5% fill on hover.
- **Tooltip.** Charcoal (`#232429`) with light 13px text, 6px corners; near-white with dark text in
  dark mode. It appears quickly (100ms).
- **Spinner.** A thin accent ring on a hairline track. Inside buttons and small areas only.
- **Skeleton.** Warm grey blocks with a 2s shimmer, 6px corners.

**AI and chat**
- **Chat.**
  - The assistant's replies sit straight on the panel; the person's own messages are white bubbles
    with a hairline and 6px corners.
  - The assistant's avatar is a 6px-cornered square in the accent.
- **Composer.** A white box with 6px corners and a control border that turns to the accent while
  typing; a small context tag row and an arrow button to send.
- **Thinking.** A muted line ("Thinking…") with a soft pulse.
- **Tool call.** A bordered row with 6px corners: the tool name in mono, a status tag with 4px corners.
- **Citation.** A small tag with a number; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the control's border turns orange-red and the message replaces the help text.
  Validate on blur and on submit, never while someone is typing.
- **In a form:** a danger banner above it that counts what needs fixing and says what was not done
  ("2 things need fixing before this poll can go live. Nothing was published.").
- **Somewhere else:** a toast with what happened and one ledge button ("Couldn't refresh 'Weekly
  pulse'" · Try again). Charts that fail keep their last good results.
- **A whole page:** a centred panel with a 28px icon on a sunken tile, the code in small mono, a
  20px bold title, one sentence and one or two ledge buttons.
  - **404:** "This page wandered off" with Back to overview.
  - **500:** "Something broke on our side" and "Nothing was changed", with Try again and the status
    page.
  - **403:** "You can't open this board" with Ask for access.
- **Words.** Say what happened, whether anything changed, and what to do. A little humour is fine;
  blame and exclamation marks are not.

## Page shapes (recipes)

- **Dashboard** (a board). The app shell, then the board's title row (star, Share, primary "Add a
  chart"), a toolbar of small secondary buttons (date range, filters, breakdown) with "Computed … ·
  Refresh" on the right, then rows of panels: a big number beside a two-series line chart, a small
  table beside a step chart, and a full-width return grid.
- **List and detail.** A title row with Export and a primary, underline tabs, a search row with the
  count and a filter select, a framed table with lettermarks and a selected row, pagination in the
  footer, and the selected person in a side panel: lettermark, tags, a segmented control and traits
  as mono keys with values.
- **Onboarding.** The public desktop: the taskbar, a column of labelled icons, and set-up opening as
  a window with a title bar. Inside: a step line and progress bar, a bold 36px question with a
  highlighted phrase, tool tiles to tick (the chosen ones framed in amber), an info banner, and Back,
  Skip and a large primary Continue.
- **Settings.** A plain settings nav beside sections divided by hairlines, each with a bold 16px
  title and a muted line: a rename row, switches that apply at once, radios and a select with help,
  a copyable key, and a danger zone panel with the danger button.
- **Empty state.** Underline tabs, then a dashed panel with a ledged icon tile in the brand's pale
  amber, a bold heading, one cheeky sentence, a primary and a secondary large button and a "How it
  works ↗" link; templates as tiles below.
- **Pricing.** The desktop and a window again: a 48px bold claim with a highlighted phrase and a
  primary button, a white free card (a numbered amber step) beside a dashed sunken metered
  card, a per-tool price table with a segmented tool switch and a usage meter, and an FAQ.
- **Errors.** The field, form, banner, toast and full-page errors above, as one scene.

## Words

- Plain, friendly and a little cheeky: "Nobody's been asked anything yet", "This page wandered off".
- Sentence case for everything; numbers exact; times relative ("4 minutes ago").

## Do and don't

| Do | Don't |
| --- | --- |
| Put primary and secondary buttons on their ledge | Flat filled buttons, pills, or drop shadows on buttons |
| Keep the page warm grey and panels white with hairlines | Cool greys in light mode, or shadowed cards |
| Colour each tool's icon, and nothing else decorative | Coloured text for emphasis, or gradients |
| Bold uppercase table headers and chart meta | Uppercase headings or buttons |
| Use orange for links and the current tab, amber for the main action | Orange body text, or more than one primary per view |
| Keep the quirk (desktop, windows) to public pages | Desktop windows inside the app |
| Use the same icon for the same action | Mix icon sets or fill icons |
