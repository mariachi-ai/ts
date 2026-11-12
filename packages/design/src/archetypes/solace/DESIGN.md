# Solace

Category: warm and friendly. Warm and soothing: warm charcoal text on white, a warm off-white for
grouped areas, a sunny orange as the brand, one bright blue for the next step, bold rounded type,
pill buttons with a small press-shadow, big rounded cards with soft 2px borders, and a midnight-blue
dark mode made for bedtime. For wellbeing, sleep and habit apps that should feel kind and
encouraging.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `solace` preset of `@mariachi/design` (`data-theme="solace"`,
`themes/solace.css`).

## Principles

- **Warm, never clinical.** Text is a warm charcoal (`#2d2c2b`), not black; greys lean brown; the
  quiet surface is a warm off-white (`#f9f4f2`), not a cool grey.
- **One blue step.** The bright blue fills the one pill that moves someone forward ("Continue",
  "Begin", "Start my free trial"). Everything else is charcoal, warm off-white and white.
- **Orange is the brand, not the button.** The orange marks the brand, highlights one word in a big
  heading, fills tiles, the play button, the streak dots and the current step on a timeline.
- **Bold and round.** Headings and labels are bold and tracked in by 3%; body text is regular and
  roomy. Corners are generous: pills for actions, 12px for inputs and panels, 16px for cards, 24px
  for big brand panels.
- **Shapes, not pictures.** Where the reference uses illustrated characters, use flat token shapes:
  a disc rising over a hill, a circle, a rounded bar, in the brand colours. Never draw faces.
- **Night mode is a place.** Dark mode is midnight blue (`#050726`), with cool grey text, for
  sleep and evening use. It is a full mode, not an inverted afterthought.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and cards | white `#ffffff` | midnight `#050726`; cards `#101340`; raised `#161946` |
| Grouped areas, player, quiet pills | warm off-white `#f9f4f2` | `#0b0d33`; pills `#2a2d55` |
| Text: default, muted, subtle | `#2d2c2b`, `#44423f`, `#63605d` | `#e5e7ec`, `#9da5b8`, `#7580a3` |
| Borders | soft warm `#e2ded9` (2px on cards); controls `#63605d` | `#2a2d55`; controls `#7580a3` |
| Action blue | `#0061ef`, hover `#0040ea`, pressed `#0000db`; links in the blue | the same blue; links white |
| Brand orange | `#ff7300`, charcoal text on it | the same |
| Sun yellow | `#ffb700` (tiles, the chosen plan, warning fills) | the same |
| Success, danger | green `#02873e`; red `#e01919`, red text `#bf0000` | `#31cc66`; `#ff5a5a` |

- **Radius.** 4px for small labels; 8px for tiles and thumbnails; 12px for inputs, the player,
  plan options, alerts and menus; 16px for cards and dialogs; 24px for big brand panels. Every button
  is a pill.
- **Borders.** 2px. Cards and tiles take the soft warm border; controls take the stronger one so
  they read.
- **Shadow.** Pills have a 2px hard press-shadow (`0 2px 0` at 20%) that goes when pressed. Raised
  cards take `0 2px 4px`; menus an even `0 0 12px` glow; dialogs `0 1px 8px`. In dark mode, shadows
  turn into a 1px midnight ring.
- **Motion.** 120ms `ease` for hover and press, 200ms for opening, 400ms for large movements.
  Nothing bounces.
- **Spacing.** A 4px unit, used in the published steps 4, 8, 12, 16, 24, 32, 40, 48, 64. The usual
  gaps are:
  - 8px inside a control group and between icon and label;
  - 12–16px between fields and between rows of choices;
  - 24px between cards and inside them;
  - 40–64px between page sections.
- **Layout.**
  - An 80px white header with 48px gutters and no rule underneath.
  - Content to 72.5rem (1160px); settings in 60rem; forms and step-by-step flows in a 30rem phone-width
    column, centred.
  - Grids gap 24px. The day's plan is a timeline on the left with the streak, the player and tiles in
    a side column.
- **Density.** 1 by default; controls are tall (48px buttons, 56px inputs). For dense screens set
  `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-color-brand-default)`,
`var(--m-space-4)`. The exact scales are in the reference at the end.

## Type

- **Family.** Figtree for everything, from the variable font (`@fontsource-variable/figtree`), at
  three weights only: 400 for body, 500 for small labels and meta, 700 for headings, labels and
  buttons. DM Mono (`@fontsource/dm-mono`) for codes and error numbers.
- **Sizes:**
  - body 16px with a 1.5 line height; large body 18px for intros;
  - meta and help 14px; labels on cards and badges 12px;
  - card titles 20px bold; section headings 24px; page titles 32px;
  - marketing headings 48px, tight leading (1.1), always bold.
- **Tracking.** Headings, labels and buttons are tracked in by 3% (`-0.03em`); body text is not.
- **Case.** Sentence case. Small capitals only for row actions in settings ("EDIT", "MANAGE"), in
  the link blue.
- **Highlight.** One word of a big heading may take the orange: "Rest easier, all year".

## Icons

- Lucide, outlined, **2px stroke**, round caps: 16px beside meta text, 20px in buttons and the header,
  40px+ only inside shapes. They are charcoal, or white on blue; status icons take their tone.
- Meta lines carry a small icon before the text (headphones for a guided session, a clock for its
  length, a video icon, a pencil for reflection).
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal), close `x`;
  - back `chevron-left` (in a white round button over pictures), forward `chevron-right`, expand
    `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Flat, friendly and few: bars with fully rounded ends, no gridlines, labels in 14px muted.
- **One series** is the orange; a target or a past period is the warm off-white.
- **More series** step through orange, blue, sun yellow, pink, purple and green.
- A score is shown as a big number in a coloured circle over a three-part bar (low, middle, high),
  with the current part filled.
- Tooltips use the coach-mark treatment: midnight with white text.

## States (every control)

- **Hover.** Fills deepen one step: the blue goes to `#0040ea`, a warm off-white pill to `#e2ded9`,
  a ghost button gains the warm fill. A clickable card gains the raised shadow. Nothing moves.
- **Focus.** A 3px blue ring, 2px outside the control, on keyboard focus only. Never remove it.
- **Pressed.** The pill loses its press-shadow and keeps the hover fill: it looks pushed in.
- **Disabled.** 40% opacity; the cursor stays default. Say why nearby when it matters.
- **Error.**
  - The control's 2px border turns red.
  - The message sits under the field, in red 12px, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a spinner (a 3px blue arc).
  - Lists and cards show warm off-white skeleton blocks with 8px and 16px corners.
- **Selected and current.**
  - A choice row stays on the warm off-white and shows a blue check on the right.
  - A segmented control raises the selected segment in white.
  - A chosen plan fills sun yellow.
  - The current step on a timeline is an orange dot, a finished one a green check.

## Components

All 36 of the library's components, as Solace draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 72.5rem, or 60rem for settings, 30rem for flows;
- `m-split`, a 14–17.5rem side column (settings sections) beside the main one;
- `m-grid`, for cards and tiles: 24px gaps;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 40–64px apart.

**Actions and forms**
- **Button.** Always a bold pill (700, tracked in) with the 2px press-shadow. 48px by default, 40px
  `sm`, 56px `lg` for the one big step at the bottom of a flow.
  - **Primary:** the blue with white text, one per view, often full width.
  - **Secondary** (the default): the warm off-white with charcoal text, no border.
  - **Ghost:** text only, warm fill on hover, for icon buttons in the header and "Skip for now".
  - **Danger:** solid red, only to confirm something destructive.
  - **Charcoal:** for a chosen option among pills (a guide, a plan period), set the secondary pill
    to `bg.inverse`.
  - **Icon-only:** a round pill; over a picture it is white.
- **Input, textarea.** 56px tall, 12px corners, white, a 2px border that darkens on hover and turns
  blue on focus. Placeholder in muted text. A search field has the search icon inside on the left.
- **Select.** The same box as an input, with a chevron; its menu is the popover (white, 12px, a soft
  glow, 48px rows).
- **Field.** The label above (14px bold), the control, then the help text (12px subtle) or the error.
  Fields stack 20px apart in one column.
- **Checkbox, radio.** 24px, a 6px-cornered box or a circle, with the action blue and a white mark
  when checked. In a choice list the box sits on the right of a warm off-white row.
- **Switch.** The phone switch: 51 × 31, green when on, a white knob with a soft shadow. It takes
  effect at once.

**Navigation**
- **Navbar.** 80px, white, no rule. The brand mark (an orange disc and the name in bold lower case)
  on the left; 16px charcoal links; the current one on a warm off-white pill. On the right: ghost
  icon buttons (saved, history, notifications) and the avatar, or on public pages "Log in" and one
  blue pill.
- **Sidebar.** Used for settings sections and as the desktop stand-in for the phone's tab bar: white,
  bold 16px items with a 20px icon, the current one on the warm off-white pill, counts in an orange
  pill. Group headings 14px bold subtle.
- **Tabs.**
  - **Underline:** bold 18px, muted; the current tab in charcoal over a 2px charcoal line ("Recent ·
    Featured").
  - **Pill** (the segmented control): a warm off-white pill track with 4px padding, the selected
    segment raised in white. For a two-choice switch on a coloured panel ("Yearly · Monthly"), a
    solid charcoal segment is used in the reference; express it with the charcoal button.
- **Breadcrumb.** 14px charcoal links with "/" between, the current page subtle. Prefer a round back
  button in the app.
- **Pagination.** 32px round buttons on the warm off-white; the current page solid charcoal with
  white text; chevrons for previous and next.

**Data and content**
- **Card.** White, 16px corners, a 2px soft warm border, no resting shadow, 24px padding. Titles are
  20px bold. The featured card of the day is raised (`shadow.md`). The sunken card is the warm
  off-white panel without a border, for quotes, the player and "What you get".
- **Table.** Not a pattern the reference shows; when one is needed: inside a card frame (2px border,
  16px corners), a warm off-white header row in 14px bold charcoal, 16px cells, 2px row rules, the
  warm off-white on hover.
- **Badge.** 4px corners, 12px medium:
  - neutral on the warm off-white, or outlined with the soft border ("Course");
  - solid blue for an offer ("Save 55%", sitting on the edge of the card);
  - solid charcoal for "Up next"; green tint for "Done".
- **Avatar.** Round, initials in bold charcoal on the pale orange (`brand.subtle`). 32px in rows,
  40px beside choices, 64px in a header.
- **Divider.** A 2px soft warm rule. Settings rows and list rows are separated by it.
- **Accordion.** Separated warm off-white rows with 12px corners, the question 18px bold, a chevron
  on the right that turns.
- **Code, kbd.** DM Mono on the warm off-white; blocks with 12px corners, inline code with 4px. Keys
  are small 6px-cornered caps with the press-shadow.
- **Prose.** 16–18px with a 1.6 line height, at most 40rem wide, links in blue and underlined.
- **Progress.** A thin rounded scrubber: the played part in deep orange (`#f72900`) on the warm
  off-white.
- **Meter.** The same bar; it turns red past the "high" mark. A score uses three parts (low, middle,
  high).
- **Usage.** A label and amount over a blue bar on the soft warm track.

**Feedback and overlays**
- **Alert.**
  - A pale tint in the tone, no border, 12px corners, 16px padding.
  - A 20px status icon on the left; a bold title and one line in the tone's text colour.
  - Danger alerts sit above the form and say what didn't happen ("Your account hasn't been created
    yet").
- **Toast.**
  - Bottom centre on narrow screens, bottom right on wide ones: a charcoal bar (midnight-blue grey in
    dark), white bold title, a lighter line of detail, 12px corners.
  - A status icon on the left in its tone colour; one pill action ("Retry", "Undo").
- **Dialog.** The confirm sheet: white, 16px corners, 24px padding over a 60% charcoal scrim. A
  20px bold title, one sentence on what will happen, then full-width stacked pills: the action first
  (red when destructive), the way out second in the warm off-white.
- **Popover and menu.** White, 12px corners, an even 12px glow, no padding; 48px rows in 16px,
  the hover in the warm off-white; the selected item bold.
- **Tooltip.** The coach mark: midnight (`#050726`) with white 14px text, 8px corners, roomy padding,
  and a close button when it explains a new feature.
- **Spinner.** A 3px blue arc turning every 0.75s. Inside buttons and small areas only.
- **Skeleton.** Warm off-white blocks at text and picture sizes, with a slow white shimmer that stops
  under reduced motion.

**AI and chat**
- **Chat.**
  - The companion's messages on the warm off-white with 16px corners; the person's own on white
    cards with the soft 2px border.
  - A small label above each ("You", the companion's name) with a coloured dot; timestamps 12px
    muted.
- **Composer.** A white box, 16px corners, a 2px control border that turns blue while typing, and a
  round blue send pill.
- **Thinking.** A muted line ("Thinking…") with a soft pulse, on the warm off-white with 12px corners.
- **Tool call.** A 2px-bordered row with 12px corners, a 16px icon, the name and a 4px status label.
- **Citation.** A small warm off-white pill with a number; the source in a popover on hover.
- **Usage**, as above.

## Error handling

- **In a field:** the 2px border turns red and the message sits underneath. Validate on blur and on
  submit, never while someone is still typing.
- **In a form:** a danger alert above the form, saying how many things to fix and what didn't happen
  ("2 things to fix. Your account hasn't been created yet."). Focus moves to it.
- **Somewhere else:** a charcoal toast with what happened and one action ("Your reminder wasn't
  saved · Retry").
- **Before something can't be undone:** the confirm sheet, with the red pill first and a kind way
  out.
- **A whole page:** centred in a 30rem column.
  - Flat token shapes (circles, a rising disc, a padlock made of a block and an arc), the error number
    in small mono, a 24px bold title, one kind sentence and one or two pills.
  - **404:** "We can't find that page" with Back home.
  - **500:** "Something went wrong on our side" and "Your progress is saved", with Try again and Get
    help.
  - **403:** "This one is for members" with See plans.
- **Words.** Kind, plain and blameless. Say what happened, that nothing is lost when that's true, and
  what to do next. No codes in sentences, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - "Good evening, Priya" at 20px muted, then "Your evening" at 32px bold.
  - The day as a timeline: a soft vertical rule with a green check, an orange dot or an empty ring
    beside each big session card; the first card raised.
  - A side column with the streak (orange dots for the week, the count with a flame), the player and
    four flat colour tiles.
- **List and detail.**
  - Search with the icon inside, a segmented filter, and rows with a picture shape, a bold title, a
    meta line and a chevron, separated by 2px rules; round pagination.
  - The detail: a picture band with a round back button, a badge, a 32px title, the meta line, the
    guide choice as pills (the chosen one charcoal), a large blue pill, the player and the course's
    sessions.
- **Onboarding.** One 30rem column: back, a step count and close; a thin orange progress bar; a sun
  shape; a bold 32px question; warm off-white choice rows with checkboxes on the right; a
  full-width blue pill and "Skip for now".
- **Settings.** A side list of sections with icons, the current one on the warm pill; account rows
  with a bold label, the value in muted text and a small capital blue action; reminder switches; and
  deleting the account last with a red pill.
- **Empty state.** Flat shapes, a 24px bold heading, one kind sentence, a blue pill and a warm
  off-white one.
- **Pricing.**
  - A centred kicker and a 48px bold heading with one orange word.
  - Two plan options side by side: the chosen one filled sun yellow with a blue offer badge on its
    edge, the other white with a thin charcoal border; a small renewal line; one blue pill.
  - How the trial works as an orange-dot timeline, "What you get" in a warm off-white panel,
    questions in separated rows, and secondary pills for household and student pricing.
- **Errors.** The field, form, toast, confirm sheet and full-page errors above, as one page.

## Words

- Warm, plain and encouraging, in sentence case: "Your evening", "Breathe out the to-do list",
  "Skip for now".
- Lengths as ranges ("4–6 min"); dates short ("March 3").

## Do and don't

| Do | Don't |
| --- | --- |
| Make every button a bold pill with the press-shadow | Square buttons, outlined primaries, or light-weight labels |
| Keep the blue for the one step forward | Use the orange for buttons or links |
| Use the warm off-white for quiet areas and secondary pills | Cool greys, or tinted blue backgrounds |
| Give cards a soft 2px warm border and 16px corners | Hairline borders, sharp corners or heavy shadows |
| Use flat token shapes in the brand colours | Draw characters, faces or illustrations |
| Make dark mode midnight blue | Pure black or warm grey dark mode |
| Track headings in by 3% and keep them bold | Thin or light headings |
