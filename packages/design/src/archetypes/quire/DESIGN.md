# Quire

Category: editorial. A calm, native-feeling document editor: near-black ink on white pages that
float on a pale grey window, a quiet grey sidebar where the current row is a white tile, capsule
buttons and round icon buttons, tinted block decorations, toggle blocks as grey wells, page blocks
shown as rounded cards with soft colour covers, and one clear blue. Dark mode is true black with
graphite panels. For documents, notes, wikis and writing tools.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `quire` preset of `@mariachi/design` (`data-theme="quire"`,
`themes/quire.css`).

## Principles

- **The page is the product.** Writing sits on a white page with 16px corners and a soft shadow,
  over a pale grey window. Chrome stays grey, small and out of the way.
- **Native, not webby.** Buttons are capsules; icon buttons are circles; menus highlight the row in
  the accent like a desktop menu; switches look like the system's.
- **Colour is content.** Colour comes from the writer: tinted blocks (green, orange, red, blue),
  soft cover gradients on page cards, coloured folder icons. The interface itself is ink, grey and
  one blue.
- **Generous and calm.** 16px body text with a 24px line, wide margins, few lines. Hairlines are
  faint; shadows are soft and long.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Window (canvas) | pale grey `#f8f8f8` | true black `#000000` |
| Pages, capsules, cards | white `#ffffff` | `#1d1d1d`; the page and menus `#222222` |
| Sidebar and wells | `#f2f2f2` | `#181818` |
| Text: default, muted, subtle | `#1f2225`, `#5f6368`, `#6b6e72` | `#f4f4f4`, `#b2b4b6`, `#8c8e90` |
| Hairlines | `#e6e6e7`; lighter `#f1f1f2` | `#2f2f2f`; `#262626` |
| Accent | blue `#006fd6`; links `#0060c0`; tint `#e5eefd` | `#006fd6`; links `#4aa8ff`; tint `#18222c` |
| Block decorations | green `#e6faf3`/`#107655`, orange `#fff4e6`/`#8f5a13`, red `#fde6ea`/`#871428` | `#1f3831`/`#7afad7`, `#382d1f`/`#fac37a`, `#3a1f24`/`#ff9aa8` |
| Brand (public pages) | ink `#030302` on warm paper `#fcf9f7` | inverted |

- **Radius.** 6px for blocks, chips, toggles and code; 10px for sidebar rows, fields and menu rows
  (8px); 12–14px for cards, tiles and settings groups; 16px for the page; 20px for dialogs; 24px
  for the public pages' panels. Buttons, segmented controls and search are capsules.
- **Shadow.** Capsules and the current sidebar row: a 5% ring and a 3px drop. The page: a 3% ring,
  then `0 8px 20px` at 8%. A page card: `0 0 1px` at 20% and `0 10px 20px` at 8%. Menus: a five-step
  fall. In dark mode the rings are white at 4–8% and the drops are deep black.
- **Motion.** 150, 250 and 400 ms, `cubic-bezier(0.25, 0.1, 0.25, 1)`; entrances may overshoot very
  slightly.
- **Spacing.** A 4px unit:
  - 2px between sidebar rows, 8px inside a control group;
  - 12–16px between blocks and cards;
  - 24px page gutters and card padding;
  - 48px either side of the text on a page (60px at full width).
- **Layout.**
  - A 280px sidebar on the window grey, no drawn edge.
  - A toolbar row: a round add button, the view's title at 19px, capsule groups and round buttons at
    the right.
  - Documents on a 776px page (48.5rem) with a 664px text column; boards and lists use the full width.
- **Density.** 1 by default; set `--m-density: 0.85` for dense lists.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Inter (variable) for the interface and the default page style. Newsreader for the
  optional serif page style and the public pages' headlines. Roboto Mono for code and the optional
  mono page style.
- **Interface sizes.** 13px for the sidebar, buttons, fields, chips, tables and menus (weight 500 for
  rows and buttons, 600 for group names); 12px for small labels and dates.
- **Document sizes** (the page styles):
  - title 24px bold, tracking −1.2%;
  - subtitle 19px semibold;
  - heading 17px semibold;
  - body 16px on a 24px line;
  - caption 14px.
- **Public pages.** Newsreader at 54px for headlines and prices, 36px for section headings, never bold;
  tiny capital kickers at 14px, weight 800, tracked 10%.
- **Case.** Sentence case everywhere; capitals only for the public pages' kickers.

## Icons

- Lucide, outlined, **1.5px stroke**: 16px in the sidebar, toolbar and buttons; 12–14px inside chips
  and small buttons; 40–44px for empty states and full-page errors.
- Sidebar icons are muted grey; folder icons take a tint colour (red, green, blue, amber), which is
  the only place icons are coloured apart from status.
- The round "more" button uses `circle-ellipsis`; the add button is a round `plus`.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `circle-ellipsis`, close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `arrow-up`, refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Charts are rare: they live inside documents as blocks. Use flat bars and 2px lines with rounded
  ends, no gridlines, axis labels in muted 12px.
- **Series** step through blue, green, amber, rose, violet and graphite.
- Tooltips use the popover treatment.

## States (every control)

- **Hover.** White capsules go to `#f5f5f5`; ghost buttons and sidebar rows take a grey wash
  (`#ececec`, `#e9e9e9`); the primary goes one step deeper (`#0063c0`). Cards deepen their shadow.
  Nothing moves.
- **Focus.** A 2px blue ring outside the control, on keyboard focus only. Never remove it.
- **Pressed.** One more grey step (`#e3e3e3`); the primary `#0058ab`; capsules lose their drop.
- **Disabled.** Half opacity. Keep it visible, and say why nearby.
- **Error.** The field's border turns red and its message replaces the help text in red 13px.
- **Loading.** A button keeps its label and width; `aria-busy="true"` shows a small spinner. Lists
  and pages show grey skeleton blocks with 6px corners (14px for card-sized blocks).
- **Selected and current.** The current sidebar row is a white tile with the capsule ring; a
  segmented control's chosen segment is a grey wash inside its white capsule; a chosen day or task
  row is a pale blue tint with blue text; today is a dark square with white text.

## Components

All 36 of the library's components, as Quire draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, a 280px sidebar beside the main column, with no gap and no drawn edge;
- `m-container`, the content column: 72rem for boards, 48.5rem for a page, 30rem for forms;
- `m-grid`, for page cards and tiles: 13rem minimum columns, 16px gaps;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** Every button is a capsule at 13px, weight 500, 32px tall (28px `sm`, 40px `lg`).
  - **Primary:** the blue, white text, one per view ("Continue", "Connect").
  - **Secondary** (the default): white with the faint ring and drop, ink text.
  - **Ghost:** no fill; a grey wash on hover. For quiet actions and toolbar icons.
  - **Danger:** solid red, only to confirm something destructive.
  - **Icon-only:** a circle with an `aria-label` (add, more, sort, close, back).
- **Input, textarea.** 32px, 10px corners, white, a grey border at the 3:1 floor that darkens on hover
  and turns blue on focus. The sidebar's search field is the `sm` size on the grey.
- **Select.** The same box with a small chevron; in settings rows it is `sm` and sized to its text.
- **Field.** The label above in 13px semibold, then the control, then the help in muted 13px or the
  error in red. One column.
- **Checkbox, radio.** 16px; the checkbox is a rounded square (4px), blue when checked. In task
  lists a flagged, overdue task's box is outlined in red.
- **Switch.** The system switch: 38 by 22px, blue when on, grey when off, a white knob with a soft
  shadow. It applies at once.

**Navigation**
- **Sidebar.** 280px on `#f2f2f2`, 12px padding.
  - Top: the space (a small tile and its name with a chevron), then a search field.
  - Rows are 13px with a 16px muted icon, 10px corners and 2px apart; the current row is a white
    tile with the capsule ring (`box-shadow: var(--m-shadow-sm)`).
  - Group names ("Issues", "Desks") are ink 13px semibold, not capitals.
  - Counts sit at the right in subtle grey, with no pill.
  - A hairline above the last group.
- **Navbar** (public pages). A floating white capsule with the ring, 52px tall: a wordmark, ink links
  at 16px, "Sign in" as a link and an ink capsule at the right.
- **Top bar** (in the app). No bar: a row on the window with a round add button, the view title at
  19px semibold, then a segmented capsule, round buttons and a search capsule at the right.
- **Tabs.**
  - **Segmented** (`pill`, the usual): a white capsule on the ring; the chosen segment is a grey wash;
    icons or short words.
  - **Underline:** ink text with a 2px ink line, for inspector panels.
- **Breadcrumb.** 12px muted links with "›" between, above a page's title.
- **Pagination.** Round ghost buttons; the current page a grey wash. Prefer endless lists.

**Data and content**
- **Table.** A collection table: a hairline grid inside a 6px frame on white; column names in muted
  12px weight 500, sentence case, no fill; a row number in subtle grey; rows tint `#f5f6f7` on hover.
  Tags are chips; people are a small avatar and a name.
- **Card.** White, 14px corners, no border, the page shadow; 16–24px padding. A page card has a soft
  colour cover band (a gradient of two tints, never an image), the title at 17px semibold, two lines
  of the opening in muted 13px, then chips. Page blocks inside a document are 7px cards with the
  card shadow and the title on the cover. Tiles (folders) use the `sunken` variant.
- **Badge.** The chip: 20px tall, 6px corners, 12px weight 500, no border. Neutral grey for weekdays
  and plain tags; blue for dates ("Nov 14."); red with a flag for overdue; green, orange and red
  tints for desk tags and status. The solid ink badge for "Most chosen".
- **Avatar.** Round, on the blue tint with blue initials; 20px in rows, 28px in bars, 40px in headers.
  A space is a rounded square.
- **Divider.** A faint hairline (`#f1f1f2`). Between sections of a document, a 2px dotted rule.
- **Accordion.** The toggle block: separate grey wells (`#f5f6f7`) with 6px corners, 10px by 14px
  padding, the question in 16px semibold.
- **Code, kbd.** Code blocks are grey wells with 6px corners in Roboto Mono; inline code is mono
  with a hairline box and 4px corners. Keys are small white keycaps with a hairline and a 1px base.
- **Prose.** The document: 16px on 24px, a 664px column, headings 24/19/17px, links in blue,
  quotes as a 3px grey focus bar with muted text, tables with `#e3e3e3` cells and a faint blue
  header column.
- **Progress.** A 6px rounded bar in blue on a grey track.
- **Meter.** The same bar; it turns amber, then red, past its marks.
- **Usage.** A label and amount over the meter bar.

**Feedback and overlays**
- **Alert.** A block decoration: a tinted block with 6px corners, no border and no stripe, 10px by
  14px padding, the title in semibold and the body in the tone's text colour. Use green for checked,
  orange for open questions, red for errors, blue for information.
- **Toast.** White, 14px corners, the menu shadow, a status icon, a semibold title, one line, and one
  capsule action ("Retry now").
- **Dialog.** White, 20px corners, 24px padding, the title at 17px semibold, capsule actions at the
  right with the primary last.
- **Popover and menu.** White, 14px corners, 6px padding, the five-step shadow. Rows are 28px, 13px,
  8px corners; the highlighted row fills with the blue and its text turns white, like a desktop menu.
  Group labels in muted 12px; a hairline between groups; destructive rows in red.
- **Tooltip.** An ink capsule-ish label (6px corners), 12px white text, after 500ms.
- **Spinner.** A thin blue ring, for buttons and small areas only.
- **Skeleton.** Grey blocks at text and card sizes with a slow shimmer that stops under reduced motion.

**AI and chat**
- **Chat.** The assistant answers on the page with no bubble; your messages sit in a grey bubble
  (`#f0f0f0`) with 16px corners, right-aligned. Times in muted 12px.
- **Composer.** A white box with 20px corners, a control-strength border (the 3:1 floor) and the
  capsule shadow; send is a round blue button with `arrow-up`.
- **Thinking.** A muted line with a soft pulse. **Tool call:** a 10px-corner row with a 14px icon,
  the tool's name and a status chip.
- **Citation.** A small grey chip (6px corners) with a number; the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the help text. Check on blur and on
  submit, not while someone types.
- **In a form:** a red block decoration above the form, saying how many things to fix and that
  nothing changed ("2 things to fix. Nothing was changed."). Each field shows its own message.
- **Somewhere else:** a toast with what happened, what happens next, and one action ("Retry now").
- **A whole page:** a white page centred on the window, a 40px outline icon in subtle grey, the code
  in small mono, a 19px semibold title, one sentence and one or two capsules.
  - **404:** "This page isn't here", with a way back.
  - **500:** "Something went wrong on our side", saying the writing is safe, with Try again.
  - **403:** "This page is private", with Ask for access.
- **Words.** Plain and kind: what happened, whether anything was lost, what to do. No codes in
  sentences, no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.** The app shell; the toolbar (round add, title, segmented view switch, round sort and
  more, a search capsule); a grid of page cards with soft covers and chips; a section of recently
  edited pages; at the right a mini month (today dark, the chosen day blue, dots under dated days)
  and a task list with date and flag chips.
- **List and detail.** A collection table of pages under review; a row opens as a white page with a
  breadcrumb, a 24px title over a faint rule, a toggle block, body text with a focus-bar heading,
  green and orange block decorations, a dotted rule, page blocks as cards and a page link.
- **Onboarding.** One white page over a soft colour cover: progress dots, a serif heading, a name
  field, a page-style picker (sans, serif, mono) and accent swatches; Back as ghost, Continue as a
  large capsule.
- **Settings.** A settings column with the space's tile on top and grouped rows; round close and back
  buttons beside the title; sections with a semibold title and a muted line over grey grouped rows
  (12px corners, hairlines between): theme tiles, swatches, switches, a select and blue text actions.
- **Empty state.** In the shell: a 44px thin icon, a 19px semibold heading, one sentence, a blue
  capsule and a white one.
- **Pricing.** The public pages: warm paper, a floating capsule navbar, a serif headline, a segmented
  Yearly/Monthly capsule, plan panels with 24px corners (one on the blue tint), capital kickers,
  serif prices, an ink capsule for the chosen plan and square-check lists; a comparison panel with
  dashed rows and grey section bands; questions as toggle blocks.
- **Errors.** The field, form, toast and whole-page errors above, on one page.

## Words

- Short, warm and plain, in sentence case: "Make it feel like yours", "Due this week", "Ask for
  access".
- Dates short with a full stop, as chips: "Nov 14.", "Friday".

## Do and don't

| Do | Don't |
| --- | --- |
| Put writing on a white page over the grey window | Fill the window with white, or box every section |
| Make buttons capsules and icon buttons circles | Square buttons, or outlined primaries |
| Use tinted blocks and soft cover gradients for colour | Colour the chrome, or use photos as covers in the system |
| Mark the current row as a white tile on the grey | Use a coloured bar or a blue fill for the current row |
| Keep the interface at 13px and the page at 16/24 | Shrink document text to interface size |
| Highlight menu rows in the blue, with white text | Use a grey hover in menus |
| Use one blue for actions, links and the chosen day | Add a second accent colour to the interface |
