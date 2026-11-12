# Margin

Category: editorial and warm-neutral. Reading first: quiet slate-ink chrome in a clean sans on
white, a pale grey rail, documents in hairline lists, a calm serif for the page itself, yellow
highlights with a deeper underline (lavender when they carry a note), small uppercase labels, soft
grey pill buttons, one restrained blue, and a keyboard hint beside almost every action. Dark mode is
a deep blue-slate. For reading, annotation and research tools where the text is the point.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `margin` preset of `@mariachi/design` (`data-theme="margin"`,
`themes/margin.css`).

## Principles

- **The page is the product.** Documents are set in a serif at 20px with a 1.6 line height and a
  612px measure. Everything around them is small, grey and sans, and gets out of the way.
- **Highlighting is the one bright colour.** A highlight is a pale yellow wash with a 2px deeper
  yellow underline; one with a note turns lavender. Nothing else in the interface is yellow.
- **Quiet chrome, one blue.** Buttons are soft grey pills; the one action that matters is the solid
  blue pill. Links and the focus ring are blue. Tabs are underlined in ink, not blue.
- **Keyboard first.** Every list and reading action has a key, and the interface says so: small grey
  key chips in menus, tooltips, list footers and empty states.
- **Hairlines, not boxes.** Lists, settings and panels are separated by 1px lines. Cards exist only
  for documents.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Panes (list, reader, menus) | white `#ffffff` | `#151c23`; menus and raised `#28313b` |
| The rail and quiet panels | `#f8f9fa` | `#10161d` (darker than the panes) |
| Text: default, muted, subtle | `#28313b`, `#616c77`, `#6a747f` | `#e0e3e6`, `#959faa`, `#8f99a3` |
| Hairlines | `#e0e3e6`; lighter `#f0f1f2` | `#28313b`; `#1f272f` |
| Control borders | `#838c96` | `#959faa` |
| Accent (one blue) | `#2b73e3`, white text; links `#216ad6` | `#76b2ed`, black text |
| Highlight | wash `#fff3b0`, underline `#ffcc00` | wash `#38381e`, underline `#d0b007` |
| Highlight with a note | wash `#cdcdfe`, underline `#8059e4` | wash `#4e358e`, underline `#957de8` |
| Assistant and backlinks (info) | indigo `#693fc6` | `#aca0e6` |
| Soft grey fills: buttons, tags, hover | `#f2f3f3` (slate at 6%), hover `#ececed` | `#222a30`, hover `#272e36` |

- **Radius.** 4px for tags, keys, menu rows and thumbnails; 6px for nav rows, toasts and notices;
  8px for inputs, document cards and menus; 12px for dialogs. Every button is a pill.
- **Shadow.** Four elevations, each a faint 1px ring (slate at 5%) plus soft drops: `sm` for small
  lifts, `md` for cards that float, `lg` for menus and popovers, `overlay` for dialogs. Cards at rest
  have no shadow, only a hairline.
- **Motion.** 150, 200 and 300 ms, ease-in-out; panels slide in 200ms. Nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 4–8px inside a control group and between icon buttons;
  - 12px between a thumbnail and its text, and inside list rows;
  - 16px of row padding, and between fields;
  - 24–40px between sections of a page.
- **Layout.**
  - A 240px rail on the left with a hairline edge.
  - The document list is 22–26rem wide; the reader takes the rest, with its text column at most
    612px (`--m-prose-max-width`) and centred.
  - A right panel (notes, details) of 17–25rem beside the reader.
  - Pane headers are 65px tall with a hairline under them.
  - Other pages use the container: 64rem, 40.5rem for reading-width pages, 30rem for forms.
- **Density.** 1 by default. For dense lists, set `--m-density: 0.875` on the page.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.**
  - **Inter** (variable) for the whole interface, at 400 for text and 500 for labels, tabs and
    buttons; 600 for document titles in lists and section heads.
  - **Source Serif 4** (variable) for reading: document text, page and document titles, quotes and
    highlights shown elsewhere. Headings use it at 600, tracked −1.5%.
  - **Roboto Mono** for code and codes, small.
- **The reading pane.** Put `.m-prose` on the document and set
  `font-family: var(--m-font-family-serif)` on it: 20px text, 1.6 line height, 20px between
  paragraphs, links in a deep navy (`#0d1e8e`; dark `#aec8f1`) underlined at half strength,
  quotes in italic with a 2px blue rule, inline code in a dark red on a faint grey chip.
- **Sizes:**
  - interface text 14px with a 20px line;
  - secondary text, tags, meta rows and table headers 12px; tiny labels 11px;
  - section heads 16px at 600 in the sans;
  - page titles 28.8px in the serif; document titles 36px; marketing headings 52px, tracked −2%.
- **Case.** Sentence case everywhere, except the small section labels and list view tabs
  ("HIGHLIGHTS", "ALL · ASSIGNED"), which are 11–12px uppercase, weight 500, tracked 6%.
- **Meta rows.** Source, author and length on one line, separated by a middle dot, with a 12px type
  icon first: (type icon) `longform.example · 22 min`.

## Icons

- Lucide, outlined, **1.5px stroke**: 16px in the rail, buttons and toolbars; 12–14px inside meta
  rows and chips; 18px beside section heads; 40px for empty readers and full-page errors. Icons are
  grey (`fg-muted`) beside dark labels, never coloured except status icons and the highlight tools.
- Toolbar actions are icon-only ghost pills with a tooltip naming the action and its key.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `arrow-up` (in a round button), refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Charts are rare and quiet:** reading time as plain bars in the hairline grey, with today or the
  best day in the blue-to-violet progress gradient; no gridlines; 11px day labels under the bars.
- **Progress** of a document is a 2–3px line: the blue running into violet
  (`linear-gradient(108deg, var(--m-color-accent-default), var(--m-color-info-solid))`) over the
  hairline grey. In lists, that line is the row's own bottom rule.
- **More series** step through blue, violet, teal, orange, green and purple.
- Tooltips use the tooltip treatment.

## States (every control)

- **Hover.** Soft fills deepen one step: a grey pill goes from `#f2f3f3` to `#ececed`, a rail row
  takes `#f0f1f2`, the blue pill goes to `#1a59c8`, a card's hairline darkens to `#c1c7ce` and a
  soft shadow appears. List rows show their quick actions (a grouped row of icon buttons) on hover.
- **Focus.** A 2px blue ring flush with the control (`--m-color-border-focus`), keyboard only. In a
  list, the focused row also takes a 3px blue bar on its left edge and the grey rail tint.
- **Pressed.** One step deeper than hover. Nothing moves.
- **Disabled.** Half opacity; the label goes to the disabled grey.
- **Error.**
  - The control's border turns red.
  - The message replaces the help text under the field, in red 12px, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a small spinner.
  - Lists show skeleton rows (a grey square and two grey lines) and documents show grey text lines;
    never a spinner over a whole pane.
- **Selected and current.**
  - The current rail row has a grey fill (`#eaecee`) and weight 500.
  - The current tab has ink text and a 2px ink underline.
  - Checked controls are blue.
- **Unread.** A 6px blue dot at the top left of the thumbnail.

## Components

All 36 of the library's components, as Margin draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- panes side by side in a flex row (the rail, the list, the reader), stacking on a phone;
- `m-container` for single pages: 64rem, 40.5rem for reading-width pages, 30rem for forms;
- `m-split`, a 240px side column beside the main one;
- `m-grid` for document cards, with 13rem columns and 16px gaps;
- `m-stack` and `m-cluster` for everything inside.

**Actions and forms**
- **Button.** Always a pill, weight 500, 32px tall by default and 28px (`sm`) in toolbars.
  - **Primary:** the solid blue with white text (black in dark mode), one per view.
  - **Secondary** (the default): the soft grey fill, ink text, no border.
  - **Ghost:** no fill until hover; toolbar icons and quiet text actions.
  - **Danger:** a pale red tint with red text, for Delete. It isn't a solid red.
  - **Icon-only:** a round ghost pill with an `aria-label` and a tooltip with its key.
  - **Marketing:** on public pages the main call to action is an ink pill (`bg.inverse`) at 44px.
- **Input, textarea.** 32px, 8px radius, white, a grey control border that darkens on hover, the
  blue border and ring on focus. Search fields can sit on the soft grey fill with no border.
- **Select.** The same box as an input, with a small chevron, about 10rem wide in settings rows.
- **Field.** The label above (14px, 500), the control, then help or the error (12px). Fields stack
  16px apart.
- **Checkbox, radio.** 16px, a 4px radius on the checkbox, blue when checked.
- **Switch.** A small 34×20 toggle: blue when on, grey when off, white knob. It saves at once.

**Navigation**
- **Sidebar.** The 240px rail on `#f8f9fa` with a hairline edge.
  - Top: the app's name and its icon buttons (hide the rail, add).
  - Items are 14px dark text with a 16px grey icon, 6px radius; the current one has the grey fill.
  - A group nests its children one step in; counts sit right-aligned and muted.
  - A plain 12px heading ("Shelves") starts a collapsible group.
  - Find (with its key), Settings and the person sit at the bottom under a hairline.
  - In settings, the same list on white without icons, under plain headings; there the current
    item is blue text with no fill.
- **Navbar** (public pages). No fill and no rule, 76px tall, the mark and name on the left, plain
  16px links, and a grey pill ("Sign in") on the right.
- **Tabs.**
  - **Underline:** 14px, weight 500, grey; the current one in ink with a 2px ink line. The right
    panel's tabs carry counts in a grey chip.
  - **View tabs** above a list are the same tabs set uppercase at 12px, tracked.
  - **Pill** (segmented): a grey track, the current segment white with a soft shadow.
- **Breadcrumb.** Muted links with "›" between, the current page in ink at 500. Inside the app,
  prefer the back arrow in the reader's toolbar.
- **Pagination.** Lists scroll and load more; when pages are needed, round ghost pills with the
  current one on the grey fill.

**Data and content**
- **Table.**
  - No frame and no header fill; headers are 12px uppercase, 500, tracked, in the muted grey.
  - 14px rows separated by hairlines, with the rail tint on hover.
  - Counts and dates right-aligned and muted.
- **Card.** Only for documents: white, a hairline, 8px radius, no shadow at rest.
  - A tall token-shape thumbnail on the grey canvas, then the title (14px, 600), the author and the
    time left (12px, muted), and the progress line at the bottom edge.
  - On hover the hairline darkens and a soft shadow appears; it doesn't move.
- **Badge.** Tags are 4px grey chips with 12px muted text and no border. Tone badges are soft tints
  ("Due Mon" in orange). "Best value" on the public page is an orange outline pill.
- **Avatar.** Round, initials in grey on a light grey disc; 24px in the rail, 32px in lists, 40px
  for people in the side panel.
- **Divider.** A hairline. Settings rows, list rows and panel sections are divided by hairlines,
  not gaps.
- **Accordion.** Hairline-separated questions at 16px, a chevron on the right, no fills.
- **Code, kbd.** Code blocks on the pale rail grey with a hairline and a 6px radius, in Roboto Mono.
  Keys (`m-kbd`) are small grey chips in the sans at weight 500 with a 4px radius and no border.
- **Prose.** The reading pane, as described under Type: serif, 20px, 1.6, 612px wide.
- **Progress.** A 3px line on the hairline grey; documents use the blue-to-violet gradient.
- **Meter.** The same 3px line; the library's meter colours for its ranges.
- **Usage.** A label and amount over a 4px line.
- **Document thumbnails** are content, so they are token shapes, never images: a book is a tinted
  square with a serif initial, an essay or paper a pale page with ruled grey lines.

**Feedback and overlays**
- **Alert.**
  - A soft tint in the tone's pale colour, no border, a 6px radius, 8px by 12px padding.
  - A 16px status icon on the left; the title at 600 and the body in the tone's text colour.
  - Danger alerts sit above the form and say what wasn't done ("Nothing was added").
- **Toast.**
  - Bottom right, near-black slate (white in dark mode), 6px radius, a soft shadow, at most 400px.
  - One line of title, one of detail, and one action ("Undo", "Retry").
- **Dialog.** White, 12px radius, the overlay shadow over a light slate scrim, a 16px sans title at
  600, actions on the right with Cancel as ghost.
- **Popover and menu.**
  - White, 8px radius, the `lg` lift, 4px inner padding.
  - Rows are 32px, 14px text, a 4px radius, with the shortcut right-aligned in grey ("Shift T").
  - Hairlines between groups; Delete last, in red.
- **Tooltip.** A dark grey chip (`#3e4046`; white in dark mode), 12px text, 4px radius, no arrow,
  with the key in a smaller chip. It appears after 300ms.
- **Spinner.** A thin 2px ring in the blue, inside buttons and small areas only.
- **Skeleton.** Grey blocks (`#ededed`) at text and thumbnail sizes with a soft shimmer that stops
  under reduced motion.

**AI and chat**
- **Chat.** The assistant answers about the open document in the right panel.
  - Your questions sit in a grey box (`#f0f1f2`) with a 6px radius; answers are plain text with no
    bubble.
  - Copy and save actions are small grey icons under each answer.
- **Composer.** A white box with an 8px radius and the control border, which turns blue while you
  type. The model picker is a small grey pill; send is a round `arrow-up` button.
- **Thinking.** A muted line with a soft pulse. **Tool call:** a hairline row with a 14px icon, the
  tool name and its status badge, 6px radius.
- **Citation.** A small grey chip with a number; the cited passage opens as a yellow highlight in
  the document.
- **Usage**, as above.

## Error handling

- **In a field:** the control's border turns red and the message replaces the help text. Validate on
  blur and on submit, never while someone is typing.
- **In a form:** a red tint above the form, with the count and what wasn't done ("2 things need
  fixing. Nothing was added to the unit yet."). Each field shows its own message.
- **Somewhere else:** a dark toast with what happened and one action ("Couldn’t save your note ·
  Retry"). Say if the work was kept.
- **A whole page:** centred in the pane.
  - A 40px outline icon in the subtle grey, the code in small mono, a serif title at 28.8px, one
    sentence and one or two pills.
  - **404:** "This reading isn’t here" with a way back.
  - **500:** "Something went wrong on our side" and that notes are safe, with Try again.
  - **403:** "This seminar is private" with Ask to join.
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard (the desk).**
  - A small uppercase date in the pane header and the find button with its key.
  - A serif greeting at 28.8px and one muted sentence.
  - Sections headed by an icon, a 16px label and a chevron: document cards to pick up again, then
    what's due as hairline rows with small thumbnails and tone badges, beside a week of reading as
    bars and recent highlights in the serif.
- **List and detail.**
  - Three panes: the rail; the list with its name, a sort button and uppercase view tabs; rows with a
    62px token thumbnail, a 600 title, the meta row, two lines of summary and the progress hairline;
    the focused row on the rail tint with a blue bar; key hints at the foot.
  - The reader: a toolbar of icon-only ghost pills, the source in small capitals, a 36px serif title,
    a byline over a hairline, then the serif text with highlights.
  - A notes panel beside it: ink-underlined tabs with counts, a note field, highlights quoted in the
    serif with a coloured rule, and label-and-value details.
- **Onboarding.** One white card with the `md` shadow on the grey canvas: a step label with a
  segmented bar, a serif question, page tiles drawn in the serif ("Aa"), typeface rows, and
  Continue as the blue pill with its key beside it.
- **Settings.** A plain grouped list on white (the current item in blue text) beside hairline rows:
  a 14px title at 500 and a 14px grey line on the left; the control on the right (three 32px theme
  tiles drawn light, dark and split, a select, a switch, a blue "Customize" link). Delete account
  comes last under its own label, as the red tint.
- **Empty state.** In the list pane: a small stack of page shapes (one line highlighted), a serif
  heading, one sentence, a blue pill and a grey one, and the keys that do the same. The empty
  reader shows a 40px icon and how to open something.
- **Pricing.**
  - The public navbar, a 52px serif title and a pill toggle with a one-line saving below.
  - One featured plan: a 24px-radius panel with a warm hairline and a cream-to-white wash, the plan
    name at 22px, the price at 40px, an ink pill, and a list with orange checks and bold leads.
  - Single plans as hairline rows with a tile, the price per month and an outlined ink pill.
  - Questions as an accordion under a serif heading.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Short and plain, sentence case: "Pick up where you left off", "Move on when I finish".
- Times as time left ("14 min left"), dates short ("Oct 30").
- Name the key next to the action: "Press A to add from a link".

## Do and don't

| Do | Don't |
| --- | --- |
| Set documents, titles and quotes in the serif | Set long reading text in the sans, or interface labels in the serif |
| Keep yellow for highlights only | Use yellow for buttons, badges or warnings |
| Make the one main action the blue pill, the rest grey pills | Outline buttons inside the app, or several blue buttons in a view |
| Underline the current tab in ink | Blue tab underlines or filled tabs |
| Separate rows, settings and panels with hairlines | Boxes and shadows around lists |
| Draw document thumbnails as token shapes | Use photos, covers or favicons |
| Show the key for an action beside it | Hide shortcuts, or invent different keys for the same action |
| Use the same icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
