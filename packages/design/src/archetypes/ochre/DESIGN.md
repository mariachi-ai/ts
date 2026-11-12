# Ochre

Category: editorial. Warm and literate: ink on an ivory page, a ramp of warm greys, serif headings
and reading text over a clean sans interface, ink buttons with 8px corners, hairlines instead of
boxes, and a clay brand colour kept for the send button and a few brand moments. Dark mode is a warm
near-black, not a blue-grey. For assistants, writing, reading and knowledge tools that should feel
calm and human.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `ochre` preset of `@mariachi/design` (`data-theme="ochre"`,
`themes/ochre.css`).

## Principles

- **Paper, not glass.** The page is ivory (`#faf9f5`), cards and the composer are white, and the
  sidebar is one warm step darker. No gradients, no blur, almost no shadow.
- **Two voices.** The serif is for what people read: page titles, greetings, documents and the
  assistant's answers. The sans is for what people operate: navigation, labels, buttons, tables of
  settings. Never set interface labels in the serif.
- **Ink acts, clay signs.** Actions are ink (ivory in dark mode). The clay is the brand: the send
  button, the brand tile, a brand panel. It is never a link colour or a second button colour.
- **Quiet structure.** Hairlines in warm grey separate rows and sections; settings are rows, not
  boxes. Space does the rest: generous margins, a narrow reading column.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Page, cards, menus | ivory `#faf9f5`; white `#ffffff` | `#1f1e1d`; `#262624`; menus `#30302e` |
| Sidebar and wells | `#f5f4ed` | sidebar `#262624`, wells `#1a1918` |
| Text: default, muted, subtle | `#141413`, `#5e5d59`, `#73726c` | `#faf9f5`, `#c2c0b6`, `#9c9a92` |
| Hairlines | `#dedcd1`; pale `#f0eee6` (card edges) | `#3d3d3a`; `#30302e` |
| Control borders | `#87867f` | `#75746e` |
| Action (accent) | ink `#141413`, ivory text | ivory `#faf9f5`, ink text |
| Current row, neutral fill | `#f0eee6`; sidebar current `#e8e6dc` | `#3d3d3a` |
| Brand (clay) | `#b95839`, white text; panel `#ebc9b7` | `#b45a3e`; panel `#3d2a22` |
| Focus ring | clay `#c46849` | `#d97757` |
| Switch on, progress | blue `#2c84db` / `#2a79d7` | `#2c84db` |
| Error | `#bf4d43` (solid), `#a8433a` (text) | `#bb4b40`, `#ec9a91` |

- **Radius.** 4px for badges and inline code, 8px for buttons, inputs and rows, 12px for segments,
  menus, toasts and notices, 16px for cards and dialogs, 20px for the composer, 24px for pricing and
  sign-in cards.
- **Shadow.** Barely any: `0 2px 8px` and `0 4px 20px` at 4% black for the composer and floating
  cards; `0 4px 16px` at 10% for menus and toasts. Cards sit on a pale hairline instead.
- **Motion.** 150, 250 and 400 ms, easing out (`cubic-bezier(0.165, 0.84, 0.44, 1)`). Nothing
  bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px inside a control group and between a nav row's icon and label;
  - 12–16px between fields and between stat cards;
  - 24–32px card padding;
  - 48–64px between page sections on public pages.
- **Layout.**
  - A 288px sidebar, one step warmer than the page, with a hairline edge; it collapses.
  - A reading column of 42rem (672px) for documents and conversations; settings content to 48rem.
  - Forms in a 30rem (480px) column; public pages to 72rem.
- **Density.** 1 by default. For dense screens set `--m-density: 0.85`; controls shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-color-brand-default)`,
`var(--m-space-4)`. The exact scales are in the reference at the end.

## Type

- **Families.**
  - Instrument Sans (variable) for the interface, at 400, with 500 for buttons and labels and 600
    for small section headings.
  - Source Serif 4 (variable) for titles, greetings, documents and answers, at 400–500 with
    `-0.01em` tracking.
  - JetBrains Mono for code and addresses.
- **Sizes:**
  - interface text 16px (sidebar rows and controls 14px);
  - reading text (documents, answers) 17px serif with a 1.6 line height;
  - secondary text 14px, captions and notes 12px;
  - page titles 28px serif at 500; greetings 36px serif at 400;
  - public headings 52px serif at 500, tight leading.
- **Case.** Sentence case everywhere. No uppercase labels; small headings are 12px muted sans.
- **Figures.** Tabular figures in stat cards and tables. Prices are sans at 24px, 600.

## Icons

- Lucide, outlined, **1.5px stroke**: 16px in navigation, buttons and inputs; 14px inside small
  buttons; 18px in lists; 40px at 1.25px in empty states, error pages and pricing cards. Never
  filled, never coloured except status icons.
- Every main sidebar row carries an icon; settings rows and the settings list don't.
- Send is an up arrow in a small clay square. More is a horizontal ellipsis.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `funnel`;
  - more `ellipsis`, close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `arrow-down-to-line`, upload `arrow-up-from-line`, copy `copy`, external `external-link`;
  - send `arrow-up`, refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Series take the illustration palette in order: clay, sky, olive, plum, fig, mineral.
- Thin lines (1.5px) or flat bars with 4px tops; no gridlines, labels in muted 12px sans.
- Single figures go in stat cards rather than charts: a 14px label over a 20px figure and a small
  delta in green, or muted when it's neutral.
- Tooltips use the popover treatment.

## States (every control)

- **Hover.** Rows and ghost and outlined buttons take the neutral fill (`#f0eee6`; dark
  `#30302e`). The ink button lightens a step (`#30302e`). Nothing lifts or moves.
- **Focus.** A 2px clay ring (`#c46849`) outside the control with a 2px gap, on keyboard focus
  only. Never remove it.
- **Pressed.** One more step of fill (`#e8e6dc`). Nothing moves.
- **Disabled.** Half opacity; the send square turns pale clay. Say why nearby.
- **Error.**
  - The control's border turns the error red.
  - The message replaces the help text under the field, 14px, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` hides the label behind a small clay spinner.
  - Lists show warm skeleton rows; an answer that's being written shows a muted "thinking" line,
    then streams in.
- **Selected and current.** The neutral fill and an 8px radius (nav rows, menu rows); a white
  segment on a warm track; checked boxes and radios in ink; switches in blue.

## Components

All 36 of the library's components, as Ochre draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 42rem for reading, 48rem for settings and lists, 30rem for
  forms, 72rem for public pages;
- `m-split`, the 288px sidebar beside the page (and a list beside a document);
- `m-grid`, for cards: 16px gaps in the app, 24px on public pages;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 8px corners, 14px text at 500, 36px by default and 28px (`sm`) in bars.
  - **Primary:** ink with ivory text (ivory with ink in dark mode), one per view.
  - **Secondary** (the default): transparent with a warm hairline border, ink text; it fills on
    hover. A filled variant on the neutral fill is fine for a quiet "Manage".
  - **Ghost:** text only, for actions in bars and message actions.
  - **Danger:** solid error red, only to confirm something destructive.
  - **Icon-only:** square, with an `aria-label`.
  - **Send:** an icon-only `sm` button on the brand colour.
- **Input, textarea.** White on the ivory page, 8px corners, a control border that darkens on
  hover, the clay focus ring. Placeholder in the subtle grey.
- **Select.** The same box as an input. In bars, `sm`.
- **Field.** Label above (14px, 500), the control, then help or error below in 14px. Fields stack
  16–24px apart.
- **Checkbox, radio.** 16px, 4px corners on the checkbox, ink when checked. Choice cards are
  bordered 12px tiles; the chosen one takes an ink border.
- **Switch.** Small (36 by 20px), blue when on, a grey track when off, a white knob. It applies at
  once.

**Navigation**
- **Sidebar.** 288px on `#f5f4ed` with a hairline edge.
  - Top: the brand tile and name, then search and collapse icon buttons, then a two-way segment.
  - Rows are 14px ink with a 16px icon; the current row has the warm fill and an 8px radius. Counts
    are right-aligned and muted; a "New" tag is a badge.
  - A group heading in 12px muted sans with a small add button; the person's row is pinned to the
    bottom above a hairline.
- **Navbar** (public pages). On the page colour with a pale hairline under it; quiet 15px links;
  "Sign in" as a link, an outlined small button and an ink button at the right. A thin sub-bar
  under it names the section.
- **Tabs.**
  - **Pill** (the segment): a warm track (`#f0eee6`) with 16px corners and 4px padding; the
    selected segment is white with 12px corners and no shadow.
  - **Underline:** a 2px ink line under the current tab.
- **Breadcrumb.** Muted links with a separator between and the current page in ink, in the
  document bar.
- **Pagination.** Ghost 8px buttons; the current page on the neutral fill. Lists prefer "Show
  more".

**Data and content**
- **Table.**
  - No frame and no header fill; headers are 14px muted sans in sentence case.
  - Rows on hairlines, highlighted with the sidebar tint on hover.
  - Status as small 4px badges. In answers (prose), tables take the serif and bold headers.
- **Card.** White, 16px corners, a pale hairline (`#f0eee6`), no shadow, 24px padding. Stat cards
  are `sm`. Pricing and sign-in cards take 24px corners and 32px padding.
- **Badge.** 4px corners, 12px at 500:
  - neutral: ivory with a hairline ("New", "Drafting");
  - solid: the warm fill ("Beta");
  - tones: tinted ("In review", "Ready").
- **Avatar.** Round, dark warm grey with ivory initials; 24px in the sidebar, 32px in bars.
- **Divider.** A warm hairline with generous space around it.
- **Accordion.** Questions on hairlines with no box and no fill, 17px, a chevron at the right; the
  answer in muted text. On public pages drop the side borders (`border-inline: 0`).
- **Code, kbd.** Code blocks on the warm well with 12px corners; inline code on the neutral fill
  with 4px corners. Keys are small fills with 4px corners, no bevel.
- **Prose.** The serif at 17px with a 1.6 line height, to 42rem; links in ink, underlined; quotes
  with a hairline rule and muted text.
- **Progress.** An 8px rounded bar, blue on a warm track; indeterminate slides.
- **Usage.** A label and amount over the same bar; amber and red past the limits.

**Feedback and overlays**
- **Alert.** A pale tint in the tone with a hairline in the tone, 12px corners, no side stripe; a
  16px status icon and the title at 500.
- **Toast.** White, a warm hairline, 12px corners and the menu shadow; one line of detail and one
  action.
- **Dialog.** On the page colour (not white), 16px corners, a 20px sans title at 600, actions at
  the right: Cancel outlined, the primary in ink. The scrim is 40% ink.
- **Popover and menu.** White, 12px corners, a hairline and the menu shadow; 32px rows with 8px
  corners and the neutral fill on hover; a destructive item in red at the bottom.
- **Tooltip.** Ink with ivory 12px text, 8px corners, no arrow, after 300ms.
- **Spinner.** A thin clay ring, inside buttons and small areas only.
- **Skeleton.** Warm fill blocks with a soft shimmer that stops under reduced motion.

**AI and chat**
- **Chat.**
  - The person's turns are on the warm fill (`#f0eee6`; dark `#141413`) with 16px corners,
    right-aligned and as wide as their words.
  - The assistant's answers sit straight on the page, no bubble and no avatar, in the 17px serif.
  - Message actions (copy, retry, one text action) are small ghost buttons under the answer.
- **Composer.**
  - White (dark `#30302e`), 20px corners, a soft lift, the input on top and a row of actions
    under it: an add button, a sources button, then the voice or model picker in muted text and the
    clay send square at the end.
  - A one-line note under it in 12px muted text when answers need checking.
- **Thinking.** A muted 14px line with a chevron ("Reading the draft for pacing · 6s") that opens
  to the reasoning on a thin rule.
- **Tool call.** A hairline row with 12px corners, the tool's name in the sans, and its status
  badge.
- **Citation.** A small numbered chip on the warm fill with 4px corners; the source in a 12px-corner
  card on hover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the help text. Validate on blur and
  on submit.
- **In a form:** a danger notice above the form that says how many things need fixing and that
  nothing happened ("Nothing was scheduled"). Focus moves to it.
- **Somewhere else:** a toast with what happened, who it affected and one action ("Review").
- **A whole page:** centred, calm, never red.
  - A 40px outline icon in the subtle grey, the code in small mono, a 28px serif title, one or two
    sentences, an ink button and an outlined or ghost one.
  - **404:** "We can't find that page". **500:** "Something went wrong on our side", saying the
    work is saved and nothing was sent. **403:** says who can open it and how to ask.
- **Words.** Say what happened, whether anything changed, and what to do next. No codes in
  sentences, no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - The sidebar, then a centred column: a 36px serif greeting, the composer, and a row of outlined
    suggestion buttons with icons.
  - Under it, small sans headings over stat cards, a hairline table and a "picked up recently"
    list of icon, title and time.
- **List and detail.**
  - The list: a serif title with an ink "New" button, a search box with a filter button, a segment,
    then rows on faint hairlines with the current one on the fill.
  - The detail: a document bar (breadcrumb, Share, more), the document in the serif reading column,
    then the conversation about it and the composer.
- **Onboarding.** The brand tile, a serif heading and a one-line serif subtitle over one white card
  with 24px corners: a thin progress bar, fields, choice tiles and a full-width ink button, with a
  ghost Back under it.
- **Settings.** A serif "Settings" title, a plain list of sections (no icons) with the current one
  on the fill, and rows of label and help on the left with the control on the right, on hairlines.
  A section header carries a small icon tile. Blue switches; the destructive action last.
- **Empty state.** Inside the app: a 40px thin outline icon, a 20px serif heading, one sentence,
  an ink button and an outlined one.
- **Pricing.** The public navbar, a 52px serif title, a segment, white cards with 24px corners
  (a 40px outline icon, the plan in a 36px serif, a muted tagline, the price, a full-width ink
  button, a hairline, then a check list), and a hairline FAQ.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Plain, warm and short; sentence case everywhere: "New draft", "Check a quote", "Ask for access".
- Name what will happen and what was kept ("Your draft is saved").

## Do and don't

| Do | Don't |
| --- | --- |
| Put titles, documents and answers in the serif | Set buttons, labels or nav in the serif |
| Make the one main action ink | Make buttons clay, or use clay for links |
| Keep the clay for the send button and brand moments | Spread the clay across badges, charts and icons |
| Use ivory for the page and white for cards and the composer | Use a cold grey or pure white page |
| Separate rows and sections with warm hairlines | Box every setting, or stripe tables |
| Let the assistant's answers sit on the page | Put the assistant in bubbles or behind an avatar |
| Use the warm near-black in dark mode | Use blue-black or pure black backgrounds |
