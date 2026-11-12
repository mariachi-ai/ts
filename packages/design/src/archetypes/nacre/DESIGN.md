# Nacre

Category: playful. Colourful, soft and friendly: the whole window takes a colour you choose (a
periwinkle by default), a borderless sidebar sits on it, and the page is a white panel with soft
corners inset from that frame. The current row is a white tile with a faint glow, groups are tinted
in their own colours, actions are a vivid blue with 10px corners, and headings are heavy and tightly
tracked. For workspaces, libraries and creative tools that should feel cheerful and calm to live in.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `nacre` preset of `@mariachi/design` (`data-theme="nacre"`,
`themes/nacre.css`).

## Principles

- **The frame is the colour.** The canvas (`--m-color-bg-canvas`) is the space's colour and holds
  the sidebar and the gaps around the page. The page itself is white. Don't paint the page; tint the
  frame.
- **Soft, never sharp.** Every surface is rounded: 8px inputs, 10px buttons and rows, 12px groups,
  cards and the command bar, 16–20px windows and dialogs. Edges are halos and half-pixel rings, not
  borders.
- **Colour sorts things.** Groups, boards and tags carry one of five tints (violet, tangerine, cyan,
  mint, coral) with matching text. Colour tells things apart; it never decorates for its own sake.
- **Cheerful type, calm interface.** Headings are heavy and tight (700, −0.04em); the interface is
  plain Inter at 13–14px. Tracked mono capitals label dates, steps and sections.
- **One blue action.** The vivid blue fills the one primary button and the highlighted command-bar
  row. Everything else is a white tile or a quiet ghost.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Frame (canvas: sidebar and gaps) | periwinkle `#d9dcfa` | indigo-black `#1b1938` |
| Page panel, cards, inputs | white `#ffffff` | `#202024` |
| Command bar, menus, dialogs | white `#ffffff` | `#2a2a30` |
| Wells (settings groups, code) | `#f3f3f5` | `#18181c` |
| Text: default, muted, subtle | `#1a1a1a`, `#525252`, `#5c5d84` | `#f2f2f5`, `#b5b5c0`, `#9a9ab0` |
| Hairlines | `#e6e6ea`; lighter `#efeff2` | `#36364a`; `#2a2a33` |
| Accent (actions, focus, links) | blue `#3139fb`; pressed `#2702c2` | `#4f56fb`; text `#9ea3ff` |
| Brand (bands, footers) | deep indigo `#2702c2` with cream `#fffcec` | the same |
| Group tints | violet `#e6e5fe`, tangerine `#fdf0dc`, cyan `#dcf4fc`, mint `#ddf7ee`, coral `#fde8ea` | dark tints of each |

- **Radius.**
  - 6px for small parts (`--m-radius-sm`), 8px for inputs and menu rows (`md`), 10px for buttons,
    sidebar rows, tiles and the page panel (`control`), 12px for groups, cards, alerts, toasts and
    the command bar (`container`).
  - 16px for dialogs and plan cards, 20px for the onboarding card. Badges, tooltips and switches are
    pills.
- **Shadow.**
  - `sm`: a half-pixel ring and a 1px drop (buttons, tiles).
  - `md`: a 2px halo (the page panel, cards).
  - `lg`: the current row's glow, a wide faint blur (`0 0.4px 19.3px` at 12%).
  - `overlay`: the window's long drop (`0 20px 50px` at 27%), for the command bar, dialogs and toasts.
- **Motion.** 150, 250 and 400 ms. Standard easing `cubic-bezier(0.2, 0, 0, 1)`; entrances use a
  springy `cubic-bezier(0.34, 1.4, 0.64, 1)` that overshoots a touch. Pressed buttons scale to 98%.
- **Spacing.** A 4px unit. The usual gaps are:
  - 2px between sidebar rows and 6px between shortcut tiles;
  - 8px between the frame and the page panel, and between side-by-side panes;
  - 12px between cards in a grid;
  - 20px card padding; 32–40px between page sections.
- **Layout.**
  - A 244px sidebar (15.25rem) on the frame, with no edge.
  - The page panel fills the rest, 8px in from the window on every side, with a 10px radius.
  - Content to 72rem, settings and forms to 46rem, single-column forms to 30rem; gutter
    `clamp(1rem, 4vw, 2.5rem)`.
  - Two panes side by side for a list and its detail; the focused pane has a 2px blue outline.
- **Density.** 1 by default. Set `--m-density: 0.85` for dense data screens.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.**
  - Inter (variable) for the interface and body text, at 400, with 500 for current rows and folder
    names and 600 for buttons and card titles.
  - Plus Jakarta Sans for headings and big figures, at 700 with −0.04em tracking and a 1.05 line
    height.
  - Space Mono at 700, uppercase, tracked 6%, for small labels: dates, step counts, plan names,
    section captions.
- **Sizes:**
  - interface text 14px (sidebar rows, buttons, table cells), secondary text 13px, labels 12px;
  - body copy 16px with a 1.5 line height;
  - card titles 16px semibold;
  - page titles 28–36px heavy; marketing headlines 46px heavy.
- **Case.** Sentence case everywhere, except the mono labels.
- **Figures.** Tabular figures in tables and stats.

## Icons

- Lucide, outlined, **1.75px stroke**, at 16px in rows, buttons and inputs; 14px in dense
  controls; 20px in the settings tab bar; 26–28px in empty states and preview tiles.
- Icons sit in the text colour, or in a group's text colour inside its tint. Status icons take their
  tone.
- Sites and items are shown by **favicon tiles**: a 16px square with 3px corners in a solid group
  colour and a white letter. Never logos.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up`, refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Bars with 4px corners and 2px gaps between stacked parts; the current period at full strength,
  past ones at 85%. A single hairline baseline, no gridlines; dates under it in subtle 12px.
- Series step through blue, tangerine, cyan, violet, mint and coral (the group colours).
- Legends are small dots before 13px muted labels, above the chart on the right.
- Tooltips use the popover treatment.

## States (every control)

- **Hover.** Rows, ghost buttons and tiles take a translucent black wash (5–6%; white 7% in dark).
  White buttons go a shade greyer; the primary blue darkens one step. Cards deepen their halo to the
  glow.
- **Focus.** A 2px blue ring 2px outside the control (`--m-color-border-focus`), on keyboard focus
  only. Never remove it.
- **Pressed.** One step darker, and buttons shrink to 98%.
- **Current.** The sidebar row turns into a white tile with the glow (`--m-shadow-lg`) and weight
  500; segmented controls show a white segment on a grey track; settings tabs show a grey tile with
  the icon and label in blue.
- **Disabled.** Half opacity; say why nearby.
- **Error.**
  - The control's border turns coral-red.
  - The message replaces the help text under the field, in red 13px, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` shows a small spinner.
  - Lists and cards show skeleton blocks in a translucent grey; no full-page spinners.

## Components

All 36 of the library's components, as Nacre draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, for the frame: the 244px sidebar beside the page panel, 8px apart, on the canvas;
- `m-container`, the content column inside the panel: 72rem, 46rem for settings, 30rem for forms;
- `m-grid`, for cards: 12px gaps, 15rem columns;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 10px corners, weight 600, 36px by default, 32px (`sm`) in bars and rows, 44px (`lg`)
  for the main call to action.
  - **Primary:** solid blue, white text, one per view.
  - **Secondary:** a white tile with a half-pixel ring and a 1px drop (`--m-shadow-sm`).
  - **Ghost:** no fill; a translucent wash on hover. Icon buttons in bars are ghost.
  - **Danger:** solid red, only to confirm something destructive.
  - On a blue band, the action is white with indigo text.
- **Input, textarea.** 36px, 8px corners, white, a control-strength indigo-grey border that turns
  blue on focus. The search field in the sidebar is borderless on the wash with a `⌘K` keycap.
- **Select.** The same box as an input, with a chevron.
- **Field.** The label above (13px, 500), the control, then help or error text in 13px.
- **Checkbox, radio.** 16px; the checkbox has 4px corners; blue when checked.
- **Switch.** A small 36×22 pill, blue when on, a white knob. It takes effect at once.

**Navigation**
- **Sidebar.** 244px on the frame colour, no edge, 8px padding. From the top:
  - the product name and ghost icon buttons (hide sidebar, back, forward);
  - the search field on the wash;
  - a grid of shortcut tiles (40px tall, 10px corners, on the wash, a favicon tile centred);
  - the space's name in 11.5px semibold blue;
  - 36px rows with 10px corners and a 16px icon; the current one a white tile with the glow;
  - a hairline, then tinted groups: a 12px-cornered block in the group's tint, its title in the
    group's text colour with an open folder and a chevron, its rows indented 25px in muted text;
  - closed groups are plain rows with a closed folder and a chevron right;
  - "New …" in subtle text with a plus; counts right-aligned in subtle text;
  - at the bottom: archive, the space dots (current dark, others faint), and a plus.
- **Navbar** (public pages). On the canvas or the brand band, no edge, 64px. The brand in the
  heavy display face, links at 14px semibold in 8px-cornered hit areas, the action at the right.
- **Tabs.**
  - **Underline:** a 2px blue line under the current tab.
  - **Pill** (segmented): a translucent grey track with 10px corners and 3px padding; the selected
    segment a white tile with the small shadow.
  - **Settings tab bar:** icon over label, the current one on a grey tile in blue.
- **Breadcrumb.** Muted links with "›" between, the current page in ink at 500. Shown at the top of
  the page panel.
- **Pagination.** 8px-cornered items, the current one solid blue.

**Data and content**
- **Table.** Inside a white panel with 12px corners and the halo, no outer border. Sentence-case
  13px headers in muted text, no header fill; rows split by faint hairlines, a translucent wash on
  hover; a selected row in the violet tint. Each item leads with a favicon tile, its title at 500
  and the domain in 13px muted below; board tags as tinted pills.
- **Card.** White, 12px corners, no border, the 2px halo, 20px padding. Titles 16px semibold in the
  body face. Stat cards lead with a 32px tinted icon tile. Board cards have a tinted 88px preview
  block with an icon. A clickable card's halo deepens to the glow.
- **Badge.** Pills, 12px semibold: tinted for tags and status, solid near-black for emphasis
  ("Most loved"). No borders.
- **Avatar.** Round, on the violet tint with blue initials; 24px in rows, 32px in bars, 44px in
  headers; groups overlap by 6px.
- **Divider.** A hairline. In the sidebar, one hairline between the pinned rows and the groups.
- **Accordion.** Hairline-separated rows with no fill and no outer frame: the question at 20px
  regular, a chevron at the right.
- **Code, kbd.** Code blocks on the well with 10px corners, no border. Keys are white caps with a
  hairline and a 2px grey base, in the body face.
- **Prose.** 16px with a 1.5 line height, at most 64 characters a line, links in blue.
- **Progress.** A 6px pill: blue on a translucent grey track.
- **Meter.** The same bar; it turns tangerine, then red, past its marks.
- **Usage.** A label and amount over a meter bar.

**Feedback and overlays**
- **Alert.** A tinted block with 12px corners, no border and no stripe; a 16px icon on the left;
  a semibold title and one line in the tone's text colour. A danger alert above a form says what
  didn't happen.
- **Toast.** White, 12px corners, the window shadow, no border; a status icon before the title,
  one line of detail and one action.
- **Dialog.** White, 16px corners, the window shadow over a translucent indigo scrim; a 20px heavy
  title; actions at the right, primary last.
- **Popover and menu**: the command bar. White, 12px corners, the window shadow, 6px padding.
  - A large borderless input at the top with a search icon and an `esc` keycap, then a hairline.
  - Rows are 44px with 8px corners and a 16px icon; the highlighted row **fills with the blue**
    and its text turns white; shortcuts and hints at the right.
- **Tooltip.** A near-black pill with white 13px text, no arrow, after 300ms.
- **Spinner.** A 2px ring in blue, inside buttons and small areas only.
- **Skeleton.** Translucent grey blocks with 6px corners (12px for cards), with a soft shimmer that
  stops under reduced motion.

**AI and chat**
- **Chat.** The person's messages in solid blue bubbles with 16px corners and white text; the
  assistant's on the well, no border. Timestamps in subtle 12px.
- **Composer.** A white box with 12px corners, the glow and a control-strength border that turns
  blue on focus; send is a round blue icon button with `arrow-up` or `arrow-right`.
- **Thinking.** A muted line with a soft pulse.
- **Tool call.** A row on the well with 10px corners, no border: the tool name in mono and a
  tinted status pill.
- **Citation.** A small pill with a number on the violet tint, the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the help text, saying how to fix it
  ("That link is taken. Try autumn-fair-stand or add the year."). Validate on blur and on submit.
- **In a form:** a danger alert above the form: how many things need fixing and what didn't happen
  ("The board wasn't published. Nothing changed for the people on it."). Focus moves to it.
- **In the command bar:** no results is a centred subtle icon, one line in 500 and a muted hint of
  what Enter will do instead.
- **Somewhere else:** a toast with a status icon, what happened, and one action (Retry, Undo).
- **Offline:** a tangerine alert at the top of the page saying what is kept.
- **A whole page:** centred in the panel.
  - A 48px tinted icon tile, the code as a mono label, a 20–28px heavy title, one sentence, one or
    two buttons.
  - **404:** "Nothing lives here" with Go home.
  - **500:** "Something broke on our side" and "Nothing you made was lost", with Try again.
  - **403:** "This board is private", naming who to ask, with Ask for access.
- **Words.** Say what happened, whether anything changed, and what to do. Friendly, never cute; no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard (Home).** The frame with the sidebar. In the panel: a breadcrumb line, then a mono
  date label over a two-line heavy greeting, a white "Import" and a blue "New board" at the right;
  four stat cards with tinted icon tiles; stacked weekly bars beside an "Up next" list; board cards
  with tinted previews and a segmented filter.
- **List and detail.** Two panes side by side on the frame, each with its own small bar (back,
  forward, reload, the address, options, close); the focused pane is outlined in blue. The list: a
  mono count, a heavy title, a pill filter with a search and a sort, the rounded table, pagination.
  The detail: a back link, a large favicon tile and title, actions, a tinted preview, label-and-value
  rows, a tinted highlight and a note composer.
- **Onboarding.** One 20px-cornered card on a soft multicolour wash: a mono step label and a thin
  progress bar, a heavy heading, a name field, round colour swatches (the chosen one ringed and
  ticked) and Continue; on the right, a dotted edge and a live preview of the sidebar.
- **Settings.** The frame; an icon tab bar centred at the top of the panel; then a profile line and
  grouped rows in rounded wells: switches, small white buttons, a cyan-tinted invite button, a
  segmented theme control, a shortcut list with keycaps, and the destructive action last.
- **Empty state.** A tinted icon tile, a heavy heading, one sentence, a blue and a white button;
  the command bar with its first row filled blue; three numbered first steps as cards.
- **Pricing.** The blue band with cream type: navbar, a mono caption, a 46px heavy headline, a white
  segmented billing switch, white 16px plan cards (mono plan names, 46px heavy prices, full-width
  buttons, checked feature lists), a mono caption between wavy rules; then "Questions" as a hairline
  accordion on white, and a deep indigo footer with small semibold link columns.
- **Errors.** The cases above, on one page.

## Words

- Warm and plain, sentence case: "Search or jump to…", "New clip", "Pick the plan that fits".
- Short labels; times and dates short ("Yesterday", "Oct 14, 09:15").

## Do and don't

| Do | Don't |
| --- | --- |
| Tint the frame and keep the page white | Paint the page itself in the space colour |
| Show the current row as a white tile with the glow | Use a coloured bar or bold blue text for the current row |
| Give each group its own tint and matching text | Use a tint just to decorate |
| Round everything: 10px controls, 12px cards | Square corners or heavy borders |
| Fill the highlighted command-bar row with the blue | Highlight menu rows with a grey wash only |
| Keep headings heavy and tight, the interface plain | Use the display face for body text or buttons |
| Use favicon tiles with letters for sites | Use logos, photos or illustrations |
