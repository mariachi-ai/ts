# Folio

Category: editorial and warm-neutral. A document-first workspace: warm near-black ink on a white
page, a warm off-white sidebar, warm-grey hairlines, controls that stay hidden until you hover, pale
tinted callouts and tag pills, database tables and boards, and one blue button for the action that
matters. For docs, wikis, notes and team workspaces where the page is the product.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `folio` preset of `@mariachi/design` (`data-theme="folio"`,
`themes/folio.css`).

## Principles

- **The page is the product.** Content sits in a white column about 708px wide with wide gutters.
  Chrome is minimal: a bare top bar, a quiet sidebar, no boxes around the page.
- **Quiet until touched.** Most controls are text or icons in grey that gain a soft grey fill only on
  hover. Outlines are hairlines. Only the one primary action is filled, in blue.
- **Warm, not cold.** Every grey leans brown: ink `#2c2c2b`, greys `#5f5e59` and `#73726e`,
  hairlines `#e6e5e3`, the sidebar `#f9f8f7`. Never a blue-grey.
- **Colour is for meaning and tags.** Pale tints mark callouts, tags and status; the text on them is
  a deeper step of the same hue, or the ink.
- **Personality comes from content.** Pages carry an emoji (or an icon) and a title; people carry
  their initials. The interface itself stays plain.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Page and surfaces | white `#ffffff`; menus white | `#191919`; cards `#202020`; menus `#252525` |
| Sidebar and quiet panels | warm off-white `#f9f8f7` | `#202020` |
| Text: default, muted, subtle | `#2c2c2b`, `#5f5e59`, `#73726e` | `#f0efed`, `#ada9a3`, `#8e8b86` |
| Hairlines | `#e6e5e3`; lighter `#f0efed` | `#383836`; `#2c2c2b` |
| Control borders | `#8e8b86` | `#7d7a75` |
| Hover fill (buttons, rows, menu items) | `#f3f3f3` (the ink at 6%) | `#2c2c2c` |
| Accent (the one primary button) | blue `#0077d4`, hover `#006bc7`, pressed `#105fad`; focus `#2383e2` | the same |
| Tints: green, yellow, red, blue | `#edf3ec`, `#fbf3db`, `#fdebec`, `#e7f3f8` | `#222b26`, `#392e1e`, `#362422`, `#1d282e` |
| Brand panels | ink `#191919` marks; beige `#fbf8f3` panels | `#f0efed`; `#25201d` |

- **Radius.** 4px for tags, rows and small parts; 6px for buttons, inputs and sidebar items; 10px
  for cards, callouts, board columns and menus; 12px for dialogs. Status pills are round.
- **Shadow.** A warm 1px ring (the ink-brown at 7%) plus a faint drop: board cards
  `0 4px 12px` at 3%. Menus and dialogs add a longer drop (`0 14px 28px -6px` at 10%). In dark mode
  the ring is a solid `#383836`.
- **Motion.** 100, 200 and 300ms with `ease`. Hover fills appear at once; menus fade in. Nothing
  bounces or lifts.
- **Spacing.** A 4px unit. The usual gaps are:
  - 2–4px between sidebar items and between blocks of text;
  - 8px inside a control group and around menu items;
  - 12–16px inside cards and callouts;
  - 32–48px between page sections; 96px of space above a page title.
- **Layout.**
  - A 240px sidebar on `#f9f8f7`, with a 1px `#f0efed` edge.
  - A bare 44px top bar: the breadcrumb on the left; "Edited …", Share and icon buttons on the
    right.
  - The page column is 708px (`44.25rem`) between 96px gutters (`clamp(1rem, 6vw, 6rem)`); full
    width pages, boards and tables go to about 75rem.
  - Forms and sign-in screens are a 360px column (`22.5rem`), centred.
  - Database rows open in a side peek: a 28rem panel at the right with a hairline and a soft shadow.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.875` on the page.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Inter (variable) for everything, the closest open face to the reference's system
  sans. Weights 400 for text, 500 for UI labels and sidebar items, 600 for headings, 700 for page
  titles. Load `@fontsource-variable/inter`.
- **Serif and mono page styles.** A page can switch its font to a serif or a mono, as in the
  reference's page options. The serif is Source Serif 4 (`@fontsource-variable/source-serif-4`,
  token `font.family.serif`); the mono is IBM Plex Mono (`@fontsource/ibm-plex-mono`), also used for
  code. Use them for whole pages, never mixed into the UI.
- **Sizes:**
  - page text 16px with a 1.5 line height; "small text" pages 14px;
  - UI text (buttons, sidebar, menus, tables) 14px;
  - labels, property names, captions and tags 12px;
  - headings: 30px (H1), 24px (H2), 20px (H3), all 600;
  - page titles 40px at 700, tight leading; marketing headings 64px at 700 with tracking about
    −3.5%.
- **Case.** Sentence case everywhere. No uppercase labels.
- **Figures.** Tabular figures in number columns, right-aligned.

## Icons

- Lucide, outlined, **1.5px stroke**: 16px in buttons, menus and tables; 18–20px in the sidebar and
  beside database titles; 24–32px for empty and error states. Grey (`fg.muted` or `fg.subtle`), never
  coloured except status icons.
- Pages and databases are named by an **emoji** before the title (in the sidebar, the breadcrumb and
  as the 72px page icon). Use system emoji as text, never images.
- Each database property has an icon before its name: text `text`, status `loader`, person `users`,
  select `circle-chevron-down`, number `hash`, date `calendar`, multi-select `list`.
- Toggles use a small solid triangle that turns down when open, not a chevron.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal, in a square ghost button), close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up` (in a round button), refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Chart views sit on the page with no frame: a title row (an 18px icon and a 16px semibold name)
  over a hairline, then the chart.
- **Bars** have 3px rounded tops and stack blue then green. **Lines** are 2px, smooth enough, with no
  fill. Gridlines are faint hairlines (`#f0efed`); axis labels are 11–12px subtle grey.
- **Series** step through blue `#2783de`, green `#46a171`, pink `#db6999`, orange `#d5803b`,
  purple `#b577d6`, yellow `#d8a32f`, teal `#37a4b4`, with grey for everything else.
- A small legend of dots under the chart; tooltips use the ink tooltip.

## States (every control)

- **Hover.** A soft warm-grey fill appears (`#f3f3f3`; `#eeedeb` on the sidebar). Hidden row
  controls (drag handle, "+", "⋯") appear on hover. The primary blue darkens one step. No lift, no
  shadow change.
- **Focus.** A 2px blue ring (`#2383e2`) just outside the control, on keyboard focus only. Inputs show
  the same blue as their border while typing.
- **Pressed.** A deeper grey fill (`#dfdfde`), or the blue two steps darker.
- **Disabled.** Half opacity, no hover fill. Explain nearby why something is unavailable.
- **Error.**
  - The input's border turns red (`#cd3c3a`).
  - The message replaces the hint under the field, in red 12px, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` shows a small grey spinner in place of the label.
  - Pages and tables show warm-grey skeleton lines at text size, never a full-page spinner.
- **Selected and current.** A soft grey fill and 500 weight in ink (sidebar, view tabs). Selected
  table rows take a pale blue tint. Checked boxes and switches are blue.

## Components

All 36 of the library's components, as Folio draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the page column: 44.25rem (`data-size="md"`), or about 75rem for full-width
  databases; 22.5rem (`sm`) for sign-in and set-up;
- `m-split`, the 240px sidebar beside the page, with no gap between them;
- `m-grid`, for chart views and template tiles: 16px gaps, wider for charts;
- `m-stack` and `m-cluster`, for everything inside.

Blocks of text are 2–4px apart; sections 32–48px.

**Actions and forms**
- **Button.** 32px, 6px corners, 14px at 500.
  - **Primary:** solid blue, white text, one per view ("New", "Continue", "Share" in a dialog).
  - **Secondary** (the default): transparent with a hairline `#e6e5e3` border; grey fill on hover.
  - **Ghost:** grey text only, a grey fill on hover. Most toolbar and row actions are ghosts.
  - **Danger:** solid red, only to confirm deleting. A quieter "Leave"/"Delete" can be an outline
    button with red text.
  - **Split:** "New" with a chevron segment for templates, divided by a darker blue line.
  - **Icon-only:** a 28px square ghost with an `aria-label`.
- **Input, textarea.** 32px (40px on sign-in), 6px corners, a near-white fill and a grey border;
  the border turns blue while focused. Placeholder in subtle grey. Inside pages, editing happens in
  place with no box at all.
- **Select.** The same box with a small chevron. In settings rows it drops the box: grey text with a
  chevron, filled on hover.
- **Field.** A 12px grey label above, the control, then a 12px hint. Fields stack 16px apart.
- **Checkbox, radio.** 16px; the to-do box is square with 3px corners and a 1.5px grey edge, blue with
  a white tick when done (and the text beside it greys and strikes through).
- **Switch.** Small (30 × 18px), warm grey off, blue on, white knob. It takes effect at once.

**Navigation**
- **Sidebar.** 240px on `#f9f8f7`, 8px padding.
  - Top: the workspace switcher (a dark 20px initial tile, the name, a chevron) and a new-page icon.
  - Then Search, Home, Inbox (with a count) and Ask, each with an 18px icon.
  - Sections ("Favorites", "Teamspaces", "Private") have 12px grey labels at 500, no capitals.
  - Pages: an emoji and the name at 14px/500 in `#5f5e59`; the current page is ink on a grey fill
    (`#efeeec`), 6px corners. Hover reveals "⋯" and "+" at the end of a row.
  - Settings and Trash sit at the bottom.
- **Navbar** (public pages). White, no rule. 16px ink links that fill grey on hover, "Sign in" as a
  ghost and the primary blue button at the right.
- **Top bar** (in the app). No fill, 44px. A breadcrumb of emoji and page names with "/" between;
  "Edited 2h ago" in grey, a Share ghost button and icon buttons for comments, updates, favourite and
  more.
- **Tabs.**
  - **View tabs** (the `pill` variant): grey labels with an icon, the current one in ink on a round
    grey pill; a hairline under the row, with the view's tools at the right.
  - **Underline:** a 2px ink line, used rarely (settings sub-pages).
- **Breadcrumb.** Ink, 14px, "/" in subtle grey; emoji before each page name.
- **Pagination.** Rare: tables load more ("Load 50 more"). When needed, ghost 28px squares, the
  current one on the grey fill.

**Data and content**
- **Table.** The database table.
  - No outer frame and no header fill; a hairline above the header and under every row.
  - Headers are 14px subtle grey with a property icon, in sentence case.
  - Cells are 14px, 8px padding, 34px rows. The title column is 500 with the page's emoji.
  - Tags and status are pills; people are a 20px initial and a name.
  - A "+ New page" row in grey closes the table; a calculation row (Count, Sum) can follow.
  - The selected row is pale blue.
- **Card.** The board card: white, 10px corners, a warm ring with a faint drop, 12px padding. Title
  14px at 600 with an emoji, then properties in 12px. Board columns are `#f9f8f7` with 10px corners,
  headed by a status pill and a count; "+ New" in grey at the bottom.
- **Badge.** The tag pill: 20px, 4px corners, 12px regular, no border, on a pale tint with deeper
  text (grey `#e6e5e3`, green, yellow, red, blue). **Status pills** are round with a 7px dot.
- **Avatar.** Round, 20px in rows, 28px in bars, 40px in headers; grey with initials. A workspace is a
  dark square tile with one letter.
- **Divider.** A hairline `#e6e5e3`, full width of the page column.
- **Accordion.** The toggle: no box; a small triangle and the text; the content indents under it.
  Separated toggles in FAQs have a hairline under each.
- **Code, kbd.** Code blocks on `#f7f6f3` with 10px corners and 24px padding, IBM Plex Mono at 85%.
  Inline code is red-brown (`#b8433f`) on a grey tint with 4px corners. Keys are grey text in a
  hairline box.
- **Prose.** 16px at 1.5 in a 708px column; blocks 2–8px apart; headings at 600 with space above;
  links are ink, underlined in grey; quotes have a 3px ink bar; bullets in ink.
- **Progress.** A 4px bar, green on a warm-grey track, beside the percentage in 12px.
- **Meter.** The same bar; amber past "high", red past the limit.
- **Usage.** A label and figure over a 4px blue bar.

**Feedback and overlays**
- **Alert.** The callout.
  - A pale tint (grey `#f9f8f7` by default, or green, yellow, red, blue), 10px corners, no border,
    16px padding.
  - An emoji or a 16px icon on the left; the text in ink at 16px.
  - A form error is a red callout above the form: "2 answers need fixing. Nothing was sent."
- **Toast.**
  - Bottom centre, white, 10px corners, the menu shadow.
  - One line of what happened, one of detail, and one action ("Undo", "Ask for access").
- **Dialog.**
  - White, 12px corners, the menu shadow over a 60% near-black scrim.
  - The title is 18px at 600; actions on the right, the primary last, Cancel as an outline.
  - Settings open as a large dialog: a grouped nav on `#f9f8f7` at the left, sections at the right.
- **Popover and menu.**
  - White, 10px corners, the long soft shadow, 4px inner padding, at least 224px wide.
  - Items are 28px rows at 14px with a 16px grey icon, 6px corners, grey on hover; a value or
    shortcut in grey at the right; a ✓ for the chosen one.
  - Hairlines between groups; small grey group labels; destructive items in red at the end.
- **Tooltip.** Ink (`#2c2c2b`) with near-white 12px text at 500, 6px corners, no arrow; a shortcut on
  a second line in grey. Appears after 500ms.
- **Spinner.** A thin grey ring. Use it inside buttons and small areas only.
- **Skeleton.** Warm-grey lines `#f0efed` at text height with a slow shimmer that stops under reduced
  motion.

**AI and chat**
- **Chat.**
  - The assistant writes straight onto the page: no bubble, no frame.
  - The person's own messages sit on the grey fill with 16px corners, right-aligned.
  - Names and times in 12px grey.
- **Composer.**
  - A white box with 12px corners, the card ring and a control-strength border, blue while
    focused.
  - A round dark "send" button with `arrow-up`; an "@" for mentions and small grey pills for context.
- **Thinking.** A grey line ("Thinking…") with a soft pulse. **Tool call:** a 10px-corner box with a
  hairline, the step's name, and a status pill.
- **Citation.** A small grey numbered pill; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the hint. Validate on blur and on
  submit, never while someone is typing.
- **In a form:** a red callout above the form, saying how many answers need fixing and that nothing
  was sent. Focus moves to it; each field shows its own message.
- **Somewhere else:** a toast saying what failed and what was not changed, with one action ("Couldn’t
  move this page · Ask for access").
- **A whole page:** centred in the page column.
  - A 24px grey outline icon, the code in small mono, a 17px semibold title, one 14px grey
    sentence, and two buttons: an outline "Go back" and the blue one.
  - **404:** "This page couldn’t be found" with Go to Home.
  - **500:** "Something went wrong" and "Your changes are saved", with Reload.
  - **403:** "You don’t have access to this page" with Request access.
- **Words.** Say what happened, whether anything changed, and what to do next. No codes in
  sentences, no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - The team home page: the sidebar, the top bar, a 72px emoji, a 40px bold title and property rows.
  - A tinted callout, two chart views side by side, then a board grouped by stage.
- **List and detail.**
  - A database page: a 30px bold title, view tabs, the toolbar and a split blue "New".
  - The table with property icons, status and tag pills, people, figures and a calculation row.
  - The selected row opens in a side peek at the right: its emoji, title, properties, comments and
    body.
- **Onboarding.** A 360px centred column: a dark mark, a two-tone heading (ink, then grey), a thin
  progress bar, small grey labels over 40px inputs, tiles for what it's for, and a full-width blue
  Continue with "Skip for now" under it.
- **Settings.** The settings dialog over a dimmed page: a grouped nav, then sections each with a
  hairline under the heading and rows of title, grey description and a control at the right
  (switch, borderless select or outline button). A "Leave workspace" outline in red comes last.
- **Empty state.** A new database with only its header row, a 32px grey icon, one line and one
  sentence, an outline and a blue button, then templates to start from.
- **Pricing.**
  - A 64px tight bold heading, a round monthly/yearly switch and a blue note.
  - Plans in two panels: one with a hairline, one in pale blue for the company plans. Plan names and
    prices bold at 20px, a soft blue button (or the solid blue for the main plan), ticked lists.
  - A plain comparison table and questions with a hairline under each.
- **Errors.** The field, form, callout, toast and whole-page errors above, on one page.

## Words

- Short, plain and friendly, in sentence case: "New page", "Add a comment…", "Edited just now".
- Name things by what people call them (pages, teamspaces, views), and dates in full in properties
  ("February 3, 2027"), short in lists.

## Do and don't

| Do | Don't |
| --- | --- |
| Keep the page white and the sidebar warm off-white | Use a blue-grey or a coloured canvas |
| Hide row and block controls until hover | Show every action button at rest |
| Use one blue button per view | Fill secondary actions, or use blue for links in text |
| Use pale tints for tags, callouts and status | Saturated fills or coloured borders on callouts |
| Put an emoji or icon before page names | Logos or images as page icons |
| Keep weights at 400–600 in the UI, 700 for titles | Uppercase labels or heavy UI text |
| Separate rows with warm hairlines | Zebra stripes, filled headers, boxed tables |
| Use the same icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
