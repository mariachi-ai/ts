# Tally

Category: calm and minimal. Crisp and neutral: near-black text on white panels set into a light grey frame, a
two-tier sidebar (a 64px icon rail and a pale area panel) with a blue current item, a black primary that gains a
soft grey halo on hover, 8px controls, 12px cards and rows, 14px text, and colour kept for charts and status.
For link, analytics and developer tools that should feel quick to scan.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the nine page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `tally` preset of `@mariachi/design` (`data-theme="tally"`, `themes/tally.css`).

## Principles

- **Neutral first, colour for meaning.** Everything is the neutral grey ramp: `#171717` text, `#737373`
  secondary text, `#e5e5e5` hairlines, `#f5f5f5` panels. Colour appears only in charts, status, tags and the one
  blue "you are here" in the sidebar. The primary action is black, not a hue.
- **Framed, not floating.** The app is one white panel with 12px corners set 8px into a light grey frame; inside
  it, cards and rows are drawn with a 1px hairline and no shadow. A shadow appears only on hover (a faint
  2px drop), on menus and on dialogs.
- **Small type, three weights.** 14px running text at 400; 500 for labels, menu items and figures; 600 for
  titles and a row's main line. Only key hints go lighter (300). Titles stay small: 18px for a page, 16px for a card.
- **Everything keyboard-near.** The main actions show their key: "Create link `C`", menu items end in a key
  hint, a dialog's submit shows the enter key.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| The frame around the app | `#e5e5e5` (the hairline grey) | `#404040` |
| The content panel and cards | white `#ffffff` | `#000000`, cards `#0a0a0a` |
| The sidebar's area panel, quiet fills | `#f5f5f5` | `#171717` |
| Footers of cards, side panels in dialogs | `#fafafa` | `#171717` |
| Text: default, muted, subtle | `#171717`, `#525252`, `#737373` | `#fafafa`, `#d4d4d4`, `#a3a3a3` |
| Hairlines | `#e5e5e5`; lighter `#f5f5f5` | `#404040`; `#262626` |
| The primary | black `#000000`, hover `#171717` with a 4px `#e5e5e5` halo | white, hover `#e5e5e5` with a `#404040` halo |
| The current sidebar item | blue text `#1d4ed8` on `#e8effa` | `#93c5fd` on `#172554` |
| Checked and on | the switch and progress in blue `#2563eb`; checkboxes and radios in ink `#171717` | `#3b82f6`; `#fafafa` |
| Status text on its tint | green `#15803d`, amber `#854d0e`, red `#b91c1c`, blue `#1d4ed8` | pale tones on deep tints |

- **Radius.** 6px for fields, chips, tags, menu items and the clicks chip; 8px for buttons, selects, menus,
  alerts and sidebar items; 12px for cards, rows, tables, the app panel, the area panel and tooltips; 16px for
  dialogs and the empty state's tile. Badges are pills.
- **Borders.** 1px everywhere, in `#e5e5e5`. Fields, checkboxes and the switch's off track take the control
  grey `#8c8c8c` (darker than the source's, for the 3:1 floor; see the notes).
- **Shadow.** None at rest. A card or row on hover: `0 2px 4px` blue-grey at 5%. The floating selection bar
  and menus: `0 5px 8px` at 11%. Dialogs: a long two-layer drop. Toasts: `0 4px 12px` at 10%.
- **Spacing.** A 4px unit. The usual gaps:
  - 8px between buttons in a toolbar, 2px between sidebar items;
  - 12px between link rows, 16px between the toolbar and the list;
  - 20px between cards and sections of a page (24px inside a card);
  - 32px between sidebar groups.
- **Layout.**
  - The frame: a 64px icon rail, a 232px area panel (`#f5f5f5`, 12px corners, 8px from every edge), then the
    white content panel, 8px from the top, right and bottom.
  - A 64px page header across the panel with a hairline under it.
  - Content to 80rem (1280px) with a 24px gutter; page body starts 20px under the header.
  - Forms and settings fields to 28rem (448px), in full-width cards.
  - Public pages: one 64rem column drawn between two hairlines on white; the help centre is a left nav beside a
    42rem article.
- **Density.** 1 by default; `--m-density: 0.875` for data-heavy screens.

Use tokens, never colour literals: `var(--m-color-fg-subtle)`, `var(--m-space-5)`. The exact scales are in the
reference at the end.

## Type

- **Families.** Inter for everything in the app (the source runs on the system UI face; Inter is its own default
  family and the open stand-in). A geometric grotesque at 500, tracked −0.02em, for public headlines and
  the wordmark (Figtree stands in). Geist Mono for IDs, keys and code.
- **Weights: three in the app.**
  - **400** for running text, buttons, nav items, inputs and descriptions.
  - **500** for field labels, menu items, figures, empty-state lines and dialog section titles.
  - **600** for page and card titles, the sidebar's area title, and a link row's short link.
  - Public display headlines use the display face at 500; the wordmark is the display face at 600.
- **Sizes:**
  - 14px is the app: rows, buttons, menus, labels, tables, the sidebar (line height 20px);
  - 12px for badges, keys, axis labels, usage figures and counts;
  - 16px for card titles and the empty state's line;
  - 18px for page titles (semibold, 28px line) and the area panel's title;
  - 30px at 500 for the analytics figures;
  - public: 48px display headlines, 36px article titles, 24px prices and section titles, a 16–18px lede.
- **Case.** Sentence case everywhere. Uppercase only for the tiny unit label over a breakdown ("CLICKS"),
  tracked 4%.
- **Figures.** `font-variant-numeric: tabular-nums` in tables, chips and charts. Large counts abbreviate
  ("12.9K clicks"); money shows its cents ("$38,214.50").

## Icons

- Lucide, outlined, **1.5px stroke at 16px** in buttons, rows, menus and the sidebar; 20px in the icon rail;
  12px inside chips and the destination arrow; 24px in empty and error tiles.
- Every sidebar item, toolbar button and menu item carries an icon before its label. Icons are the text's
  colour; the current sidebar item's icon turns blue with its label.
- A link row's destination starts with a turn-down-right arrow; its clicks start with a pointer-click icon.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis-vertical` (vertical, in a square button), close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **The main chart** sits under a row of stat tabs in one bordered card: a 2px line in the series colour over
  a fade of the same colour (18% to 0%), dashed `#e5e5e5` gridlines, 12px muted axis labels, the last date in
  ink.
- **Series colours** by event: clicks blue `#3b82f6`, sign-ups violet `#7c3aed`, sales teal `#2dd4bf`; then
  orange and green. Each stat tab shows its colour as an 8px square with 2px corners.
- **Breakdowns** are bar lists, not charts: each 36px row has a bar behind its label in a pale tint of one hue
  per card (the series colour at about 16%), the count right-aligned in muted text.
- Tooltips use the tooltip treatment: a white card with 12px corners.

## States

- **Hover.** Fills step up one grey: a secondary button `#ffffff` → `#fafafa`, a ghost or sidebar item to
  black at 5%, a menu item to `#f5f5f5`, a row or card to `#fafafa` with the faint drop. The primary darkens
  to `#171717` and grows a 4px `#e5e5e5` halo. Nothing moves.
- **Focus.** A 2px ring in `#737373` outside the control, on keyboard focus only; a field's border darkens to
  `#525252`. Never remove it.
- **Pressed.** One grey darker than hover.
- **Disabled.** The control turns `#f5f5f5` with a `#e5e5e5` border and grey text; the cursor shows it can't be
  used. A disabled action that needs a reason gets a tooltip.
- **Error.**
  - The field's border turns red and a filled red alert icon sits at its right end.
  - The message sits under the field in red 14px and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a small spinner.
  - Lists show placeholder rows: a 32px grey circle and grey bars in `#e5e5e5`, pulsing.
- **Selected and current.** The sidebar's current item: blue text at 500 on a pale blue fill. A tab: ink text
  with a 2px ink bar under it. A segment: a white segment with a hairline inside a white track.

## Components

The library's components, as Tally draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 80rem, or 28rem for a form;
- `m-split`, the 304px two-tier sidebar beside the panel;
- `m-grid`, for cards: 20px gaps, 26rem columns for breakdown cards;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 20px apart; a page's body starts 20px under its header.

**Actions and forms**
- **Button.** 40px tall, 8px corners, 12px across, a 1px border, 14px at 400, a 16px icon with an 8px gap.
  32px (`sm`) in card footers, dialogs and row actions.
  - **Primary:** black with white text; on hover `#171717` and a 4px `#e5e5e5` halo. Often ends in a key hint
    (`C`, enter).
  - **Secondary** (the default): white, a `#e5e5e5` border, ink text; `#fafafa` on hover. Toolbars are rows of
    these ("Filter ▾", "Display ▾").
  - **Ghost:** no border, grey text; black at 5% on hover. Icon buttons in rows and headers.
  - **Danger:** solid red, only to confirm a deletion; a pale red halo on hover.
  - **Icon-only:** a square of the same height with an `aria-label`.
- **Input, textarea.** 38px, 6px corners, white, a grey border that darkens on focus, 14px text, grey
  placeholder. A fixed prefix ("app.hopline.io/") joins the field on its left on a `#f5f5f5` fill.
- **Select.** 40px, 8px corners, an open 1.5px chevron. A domain select joins a key input to make a short link.
- **Field.** The label above at 14px/500 in `#404040`, often with a 14px help icon; the control 8px below; the
  hint or error under it. No required marks: optional fields say so in their help.
- **Checkbox, radio.** 16px; ink when checked, with a white mark.
- **Switch.** 32 × 16, blue when on, grey when off, a white knob. It acts at once.

**Navigation**
- **Sidebar.** Two tiers on the grey frame.
  - The **rail** (64px): the wordmark at the top, the workspace's round mark, then one 44px square per product
    area with a 20px icon; the current one is white. Help and the account sit at the bottom.
  - The **area panel** (232px, `#f5f5f5`, 12px corners): the area's title at 18px/600 (with a 24px back
    square in settings), then groups 32px apart under 14px grey labels. Items are 32px tall, 8px corners,
    14px with a 16px icon, 2px apart; hover black at 5%; the current one blue text at 500 on a pale blue fill.
    Counts are small rounded blue tags. Usage meters sit at the bottom. The rail and panel are the window's
    height and stay put while the page scrolls, so the usage block is always in view (`observed`: the source's
    main nav pins the sidebar to the viewport and scrolls the content panel).
- **Navbar** (public pages). White: the wordmark at the left, 14px links with 12px chevrons on menus, the
  current one on a `#f5f5f5` fill with 8px corners, then "Log in" (secondary) and "Sign up" (primary) at the
  right, both 32px with 8px corners.
- **Page header** (in the app). 64px with a hairline under it: the 18px semibold title at the left (with a
  folder switcher where there is one), the page's own buttons at the right.
- **Tabs.**
  - **Underline:** 14px grey labels, the current one in ink over a 2px ink bar. Inside cards, the header holds
    them.
  - **Stat tabs:** a row of tall tabs in a bordered card, each a colour square, a label and a 30px figure; the
    current one has the 2px ink bar along its bottom edge.
  - **Pill** (segmented): a white track with a hairline and 12px corners; the selected segment `#fafafa` with a
    hairline, 8px corners.
- **Breadcrumb.** Grey parents, a 16px chevron between, the current page in ink at 600. Dialog headers use it
  ("Links › orbt.co/spring-menu").
- **Pagination.** "Viewing 1–7 of 248 links" at the left in 14px, Previous and Next as small secondary
  buttons at the right.

**Data and content**
- **Row.** The link row is the signature: a 12px hairline card, 16px across and 10px down, rows 12px apart.
  - A 32px round favicon ring, then the short link at 14px/600 with a copy button and its tags;
  - under it, in grey: a turn arrow, the destination, the creator's 16px avatar and the date;
  - at the right: the clicks chip (6px corners, a hairline, `#fafafa`, a pointer icon, "4,812 clicks") and a
    vertical-dots menu button.
  - On hover the fill goes `#fafafa` and the faint drop appears.
- **Table.** Members, events and customers: a 12px hairline frame, white header at 14px/500 in ink, rows 40px
  with hairlines between, `#fafafa` on hover.
- **Card.** White, a 1px `#e5e5e5` border, 12px corners, no shadow, 24px padding. A settings card ends in a
  `#fafafa` footer strip with a hint at the left and its own button at the right.
- **Badge.** A pill, 12px at 500, a hairline in its tone over a pale tint: neutral grey, green, amber, red,
  blue, or solid black ("Most popular").
- **Chip.** Tags and filters: 6px corners, 14px, a hairline over white, a 12px tag icon; tinted per tag colour
  where a tag has one.
- **Icon tile.** The empty state's 64px square with 16px corners, a hairline over `#fafafa`, a 24px ink icon.
- **Amount.** Plain tabular figures; money keeps its cents at full size ("$38,214.50"), no raised cents.
- **Drop zone.** A dashed hairline box with 12px corners on `#fafafa`, an upload icon and one line.
- **Avatar.** Round; initials on `#e5e5e5` with a hairline. 16px in rows, 24–32px elsewhere. A workspace's
  mark is a black disc with its initial.
- **Divider.** A 1px `#e5e5e5` hairline.
- **Accordion.** Hairline-separated questions at 14px/500 with a chevron; no fills.
- **Code, kbd.** Geist Mono; code blocks on `#f5f5f5` with 8px corners. Keys are 12px light (300) in a 4px
  rounded `#f5f5f5` box with a hairline.
- **Prose.** 16px with a 1.6 line height on public pages, links underlined in ink.
- **Progress.** A 12px rounded bar: blue on `#e5e5e5`.
- **Meter.** The same bar; red past the high mark.
- **Usage.** A label and "18.4K of 50K" in 12px over a progress bar, at the foot of the area panel.

**Feedback and overlays**
- **Alert.** 8px corners, a hairline in the tone over its pale tint, a 16px icon, the title at 500.
- **Toast.** Bottom centre, white, a `#ededed` hairline, 8px corners, the soft `0 4px 12px` drop, 356px wide:
  a status icon, the line at 500, one line of detail, one action.
- **Dialog.** White, 16px corners, a hairline and the long drop over a pale blurred scrim
  (`#f5f5f5` at 50%).
  - A confirm is 28rem; the link editor is 64rem with a 2 : 1 split (fields left, a `#fafafa` preview panel
    right).
  - The header has the breadcrumb title, "Save as draft" and a close button; the footer is `#fafafa` with
    feature buttons at the left and the primary with the enter key at the right.
  - On a phone it becomes a bottom sheet with a grab bar.
- **Popover and menu.** White, 8px corners, a hairline and the menu drop, 8px inside. Items 36px, 14px/500,
  16px icon, a key hint at the end; `#f5f5f5` on hover; a separator between groups; Delete last, in red.
- **Tooltip.** A white card with 12px corners and a hairline, 14px grey text, 16px across. Never a dark chip.
- **Spinner.** A small segmented ring in the text colour, inside buttons only.
- **Skeleton.** `#e5e5e5` bars and circles at text sizes, pulsing; whole placeholder rows in the list's shape.

**AI and chat**
- **Chat.** Messages on white; the person's own on `#f5f5f5` with 12px corners, right-aligned; 12px grey times.
- **Composer.** A white box with 12px corners and the control border; send is the black primary as an icon
  button.
- **Thinking.** A grey line with a soft pulse. **Tool call:** a hairline row with a 16px icon, the tool name and
  a status badge.
- **Citation.** A small grey pill with a number; the source in a white popover.
- **Usage**, as above.
- **Row, chip, icon tile, amount and drop zone** (`m-row`, `m-chip`, `m-tile`, `m-amount`, `m-dropzone`): drawn
  as above; the link row, tags, the empty-state tile, plain figures and the logo upload.

## Error handling

- **In a field:** the border turns red, a red alert icon sits at the right end, and the message replaces the
  help under the field. Validate on blur and on submit.
- **In a page:** a danger alert above the form, saying what's wrong and that nothing else changed.
- **Somewhere else:** a toast at the bottom centre with what happened and one action ("Retry").
- **A whole page:** the app frame stays; the state sits centred in the panel: the 64px tile with a 24px icon,
  a 16px line at 500, one grey sentence, one button, and a small "Error 404" note.
  - **404:** "Link not found" with Go to links.
  - **500:** "Something went wrong" and "Nothing was changed", with Try again.
  - **403:** "You don't have access" with Request access.
- **Words.** Say what happened and what to do. No codes in sentences, no blame, no exclamation marks.

## Page shapes (recipes)

### The three families

| | The app | Doors (onboarding, sign-in) | Public pages (pricing, reading) |
| --- | --- | --- | --- |
| Frame | The grey frame, the 64px rail and the 232px area panel (pinned to the window's height), then the white panel with 12px corners and a 64px header on a hairline. Empty and error states keep it | Sign-in: a split page, the form open on white over a faint 64px square grid, the wordmark centred above it, a `#fafafa` panel at the right with one card. Onboarding: one centred step on white, the wordmark at the top over a 60px grid that fades out by 320px, who is signed in at the bottom left | A white site bar; a 64rem column between two hairlines (pricing) or a left nav beside the article (help); a footer of link columns |
| Column | 80rem with a 24px gutter; settings fields 28rem | One column, no card: 23.5rem to sign in, 430px for an onboarding step | Pricing left-aligned in the 64rem column; an article 42rem |
| Titles | 18px/600 page titles; 16px card titles | 20px/600, centred; onboarding adds a 16px muted line under it | 48px display at 500, tracked in, left-aligned; 36px/600 for an article; 24px section titles |
| Running text | 14px at 400; 12px meta (usage, keys, counts); tags and pagination stay 14px | 14px labels at 500; 12px field hints and the note at the foot | 14px on pricing, 16px prose in articles, a 16–18px muted lede |
| Primary | Black, 40px, 8px corners, with its key ("Create link `C`") | Black, full width | Black, 8px corners: "Sign up" in the site bar and the recommended plan; the others white secondaries |
| Footer | None | A 12px terms line | The site footer |
| On a phone | The panel comes first and the sidebar drops below; toolbars wrap; rows keep their chip | The form fills the window; the panel follows it | The site bar keeps the wordmark and its two buttons; plans stack |

### Signature moves

1. **The framed panel:** a light grey frame, a 64px icon rail, a pale area panel with 12px corners, and one white
   content panel with 12px corners, 8px from the edges.
2. **The blue "you are here":** the only blue in the chrome is the current sidebar item (blue text on a pale
   blue fill) and its counts.
3. **Black primary, grey halo:** the main action is black at 40px with 8px corners, gains a 4px light grey ring
   on hover, and shows its keyboard key.
4. **Rows as hairline cards:** each link is its own 12px bordered card with a favicon ring, a semibold short
   link, a grey destination line and a clicks chip.
5. **Stat tabs over the chart:** big 30px figures as tabs, an ink bar under the current one, and a single
   fading area line below.
6. **White overlays:** menus, tooltips and toasts are white with hairlines; menu items carry key hints.
7. **Cards with a grey footer:** every settings card closes on a `#fafafa` strip with a hint and its own save.

### How a screen is assembled

- **It opens with** the frame, then the 64px header: the title left, the page's own buttons right. Public pages
  open with the site bar and a left-aligned display headline; doors with the wordmark over an open form.
- **Reading order:** the title, then the toolbar (filter, display or date, search, the black primary), then the
  figures (stat tabs) or the list, then breakdowns.
- **How much one screen does:** one area. Lists show 10–25 rows with pagination; analytics shows one chart and
  four breakdowns.
- **When narrow:** the sidebar drops below the panel; the toolbar wraps, the primary staying last; stat tabs
  stay three across, their figures dropping to 20px and their padding to 12px by 16px; breakdown cards to one column; dialogs become bottom sheets.
- **Too much content:** pagination under the list ("Viewing 1–7 of 248"); breakdowns cut off with "View all".
- **None:** the header and toolbar stay; faded placeholder rows, a 16px line, one sentence, the primary and a
  secondary.

### The recipes

- **Dashboard.** Analytics: "Analytics" alone in the header (no primary, no Share: the source shows Share only
  when the view is narrowed to one link or folder); Filter and "Last 30 days" at the left, View events and a
  more button at the right; the stat-tab card (Clicks, Sign-ups, Sales) over the area chart; four breakdown
  cards (Top links, Locations, Devices, Referrers) of tinted bar rows with "View all".
- **List and detail.** Links: the title with a folder switcher; Filter, Display, search, "Create link `C`"; seven
  link rows as hairline cards, the first one open; "Viewing 1–7 of 248 links" with Previous and Next; then the
  row's menu (Edit `E` … Delete `X`) and the edit dialog (fields left, QR and preview right, feature buttons and
  "Save changes ↵" in the footer).
- **Onboarding.** One centred step, not the split door (`observed` in the source's onboarding layout and step
  page): the wordmark at the top over a fading grid; "Create your workspace" at 20px/600 over a 16px muted line
  with a dotted-underlined link; name, slug with its prefix, and a round 80px logo upload with a 12px "Upload
  image" button, each with a 12px hint; a full-width black button; at the bottom left who is signed in and a
  small secondary to switch account, a help button at the bottom right.
- **Settings.** The settings area panel with its back square; "General"; five cards (name, slug, logo, ID,
  delete), each with its grey footer and button; the last edged in red with the danger button.
- **Empty state.** Links with nothing yet: the toolbar stays; three faded placeholder rows; "No links yet", one
  sentence, "Create link `C`" and "Import links", a small link.
- **Pricing.** The site bar, a left-aligned 48px display headline, an 18px lede, a monthly/yearly segment; three
  plans side by side in one `#fafafa` box with 12px corners (name, a 24px price, one line, the button, features
  with 16px icons and dotted underlines; the recommended one with an info badge and the black button);
  questions; the footer.
- **Errors.** Domains: a danger alert, a card with a field error, a toast at the bottom centre, then 404, 500 and
  403 as tiled states.
- **Reading.** The help centre: a top bar (wordmark, a round search field, "Contact support", the black
  "Dashboard"), a tab row, the section nav with the blue current page, then the article: a blue section link,
  a 36px/600 title with "Copy page", a 16px lede, 16px prose with steps, a code block and an info alert.
- **Sign-in.** The split door: "Log in to your Hopline account" at 20px/600, work email and the black button, an "or" rule,
  Google and SSO as full-width secondaries, a 14px/500 line to sign up (the link at 600), the 12px terms line; at the right one customer
  story card and a row of customer names.

### Motion

- **Durations and easing**, from the source's own animation table:
  - hover fills and colours: 150ms (`--m-motion-duration-fast`), the standard ease;
  - dialogs: fade and scale from 95% in 200ms (`--m-motion-duration-normal`) on a long ease-out,
    `cubic-bezier(0.16, 1, 0.3, 1)` (`--m-motion-easing-emphasized`);
  - popovers, menus and tooltips: fade and slide 2px into place over 400ms (`--m-motion-duration-slow`) on the
    same ease-out;
  - sheets slide in from the side in 200ms; accordions open in 300ms.
- **What moves:** dialogs, popovers, menus, tooltips and toasts enter; the primary's halo and a row's hover drop
  fade in; the sidebar's chevrons turn. Rows and cards never lift or scale.
- **Loading:** skeletons pulse; spinners turn; nothing slides in on page load.
- Under reduced motion everything is instant.

## Words

- Short, plain, sentence case: "Create link", "View events", "Save changes", "No links yet".
- Counts abbreviated in chips ("12.9K clicks"), dates short ("Mar 3"), money with cents.

## Do and don't

| Do | Don't |
| --- | --- |
| Set the app in the grey frame with the white 12px panel | Run the app edge to edge on white, or float it on a shadow |
| Make the primary black, with the grey halo and its key | Colour the primary, or use more than one per toolbar |
| Draw cards and rows with a 1px hairline and no shadow | Add resting shadows, or thick or dark borders |
| Keep blue for the current sidebar item, switches, progress and the clicks series | Use blue for buttons or headings |
| Keep titles small: 18px pages, 16px cards | Use display type inside the app |
| Make menus, tooltips and toasts white with hairlines | Use dark tooltips or dark toasts |
| Use tinted bar rows for breakdowns | Draw pie charts or 3D charts |
| Use the same icon for the same action, 16px at 1.5px | Mix icon sets, fill icons, or colour them for decoration |
