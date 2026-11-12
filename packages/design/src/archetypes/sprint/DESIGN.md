# Sprint

Category: bold and fast. Athletic and stark: near-black on white with only greys between, huge
condensed uppercase display type over full-bleed media, black pill actions, workout cards on a soft
lift, progress shown as big condensed numerals and streak rows, and one signature orange kept for
brand moments. For training, fitness and sport apps that should feel bold, fast and stripped back.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `sprint` preset of `@mariachi/design` (`data-theme="sprint"`,
`themes/sprint.css`).

## Principles

- **Black, white, and nothing in between but grey.** Text and actions are near-black `#111111` on
  white (white on `#1f1f21` in dark). Greys carry everything secondary. Colour appears only for
  status and for the signature orange.
- **The headline is the hero.** Big moments get condensed extra-bold capitals, set tight, over
  full-bleed media: "OWN THE FIRST MILE". Everything else is plain medium text at sensible sizes.
- **Minimal chrome.** No borders on cards, no rules under the bar, no fills on navigation. Space,
  type weight and the soft lift do the separating.
- **One action, one black pill.** The primary action is a solid black pill (white on dark media);
  the alternative is an outline pill. Never two black pills side by side.
- **Progress is a number.** Totals, streaks and bests are condensed numerals at display size, centred,
  with a small grey label under them.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff` | `#1f1f21`; raised (menus, dialogs, toasts) `#28282a` |
| The grey band: search, alerts, image wells | `#f5f5f5` | black `#111111` |
| Text: default, muted | `#111111`, `#707072` | `#ffffff`, `#9e9ea0` |
| Hairlines | `#e5e5e5`; lighter `#f5f5f5` | `#39393b`; `#28282a` |
| Control rings (inputs, outline pills) | `#707072` | `#9e9ea0` |
| Action (primary pill, checked, progress) | black `#111111`, hover grey `#707072` | white, hover `#cacacb` |
| Brand (bands, unread dot, flags) | orange `#ff5000`, with black text | the same |
| Focus | blue `#1151ff`, a 2px ring hugging the control | `#1190ff` |
| Success, danger, warning, info text | `#007d48`, `#d30005`, `#99470a`, `#1151ff` | `#1eaa52`, `#ff4e4a`, `#feea55`, `#1190ff` |

- **Radius.** Pills for every button, chip, tag, search field and switch. 8px for inputs, cards,
  menus and tooltips. 24px for alerts, toasts, dialogs and large choice rows. Image wells and media
  are square-cornered, except a media panel inside the content column (8px).
- **Shadow.** One soft lift: `0 4px 8px` at 6% plus a `0 0 24px 4px` haze at 3% of `#111111`. Cards,
  menus, toasts and tooltips use it; dialogs use none (the scrim does the work). In dark mode the
  same lift is stronger (18% and 9%) and raised surfaces step up to `#28282a`.
- **Motion.** 150, 250 and 400 ms. Functional moves use `cubic-bezier(0.4, 0, 0.2, 1)`; expressive
  ones (sheets, the switch knob) `cubic-bezier(0.6, 0, 0.1, 1)`.
- **Spacing.** A 4px unit with the reference's steps: 4, 8, 12, 24, 36 and 60px. The usual gaps are:
  - 4px between a button's icon and label;
  - 12px between controls in a row;
  - 16px between cards in a grid;
  - 24px inside cards and between a section's title and its content;
  - 48px between page sections, 64px before the footer.
- **Layout.**
  - A 60px top bar: the wordmark left, links centred, a grey search pill and icon buttons right.
  - A grey promo strip under the bar, 12px medium text with an underlined link.
  - Full-bleed media sections run edge to edge; the content inside them, and everything else, sits
    in a column up to 90rem (1440px) with gutters of `clamp(1.5rem, 4vw, 3rem)`.
  - List pages put a 192px filter column (12rem) beside the content, 48px apart.
  - Forms in a 30rem (480px) column; settings in 48rem.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.85` on the page; controls and
  padding shrink together.

Use tokens, never colour literals: `var(--m-color-fg-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

**Dark media.** A full-bleed photo section sets `data-theme="sprint" data-mode="dark"` on itself, so it
stays dark in both modes and its pills turn white. Stand in for the photo with a gradient from
`--m-color-bg-raised` to `--m-color-bg-sunken`, never a picture you don't own.

## Type

- **Families.**
  - **Inter** for all text at 400 and 500, standing in for the reference's proprietary neo-grotesque
    text and display faces. Headings are Inter 500 tracked −1%.
  - **Barlow Condensed** at 800 for the display capitals and big numerals, standing in for the
    reference's proprietary condensed extra-bold geometric face. Always uppercase, line height 0.95,
    no tracking. Load `@fontsource/barlow-condensed` (800) and `@fontsource-variable/inter`.
- **Mono.** Roboto Mono, only for codes and IDs.
- **Sizes:**
  - body 16px with a 1.5 line height (1.75 for long reading);
  - secondary text and meta lines 14px, labels and tags 12px;
  - card and section titles 20–24px medium; page titles 24px medium;
  - display capitals 48px in panels, 76px for heroes and up to 95px on wide screens.
- **Weights.** 400 and 500 for text. Nothing in between, nothing heavier, except the display face.
- **Case.** Sentence case for UI text, Title Case for workout names ("Kettlebell Ladder With Ines").
  Capitals only in the display face and for small empty-state headings ("NOTHING SAVED YET").
- **Figures.** Tabular figures for durations, counts and prices.

## Icons

- Lucide, outlined, **1.5px stroke**, 24px in the bar and as icon buttons, 20px beside text and in
  meta rows, 16px inside chips, 48px for empty and error states. Always the text colour; never
  coloured except a status icon on its disc.
- Workout facts are a column of icon rows: a timer for duration and level, a figure for the focus,
  a dumbbell for equipment, a screen for the format, a note for the music.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis`, close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `send`, refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** solid black bars (white in dark) with square tops and 4px gaps, no gridlines, the
  days or weeks underneath in 12px grey. Today's bar in the brand orange.
- **More series** step through black, orange, blue, green, purple and grey.
- **Totals** go above the chart as condensed numerals, never inside it. Tooltips use the white
  tooltip panel.

## States (every control)

- **Hover.** A black pill turns grey `#707072`; an outline pill fills with the grey band; a ghost
  button fills `#e5e5e5`; a link or nav item turns grey. Inputs darken their ring to black. Nothing
  lifts or moves.
- **Focus.** A 2px blue ring (`--m-color-border-focus`) hugging the control, on keyboard focus only.
  It's the only blue in the interface; never remove it.
- **Pressed.** One step darker than hover (`#4b4b4d` for the black pill).
- **Disabled.** Half opacity and a not-allowed cursor. Keep a disabled action visible and say why
  nearby.
- **Error.**
  - The control's ring turns red `#d30005`.
  - The message replaces the help text under the field, in red 12px, and says how to fix it.
- **Loading.**
  - A button keeps its width and its label; `aria-busy="true"` swaps the label for a spinner.
  - Lists and cards show grey-band skeletons in the shape of the image well and two text lines.
- **Selected and current.** Black text over a 2px black underline (tabs, the current bar link);
  black text with no fill in the side column; a black pill for a chosen filter chip; a black ring
  for a chosen choice row.

## Components

All 36 of the library's components, as Sprint draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: up to 90rem, 48rem for settings and 30rem for forms;
- `m-split`, the 192px filter or settings column beside the main one, 48px apart;
- `m-grid`, for cards: 16px gaps, 15rem columns for workout cards and 18rem for plans;
- `m-stack` and `m-cluster`, for everything inside.

Full-bleed media sections sit outside the container. Sections are 48px apart.

**Actions and forms**
- **Button.** Always a pill, 16px medium, with a 1.5px ring. 36px (`sm`) for chips and bars, 48px
  by default, 60px (`lg`) for the one action at the end of a flow.
  - **Primary:** solid black, white text; on dark media it's white with black text.
  - **Secondary** (the default): an outline pill, a grey `#707072` ring and black text.
  - **Ghost:** text only, for "Hide filters", "Sort by" and icon buttons in the bar.
  - **Danger:** solid red, only to confirm something destructive.
  - **Icon-only:** a round pill with an `aria-label`; 24px icon.
- **Input, textarea.** 56px tall, 8px corners, a 1px grey ring that turns black on hover and focus.
  16px text, 12px side padding. The label sits above in 14px grey.
- **Select.** The same 56px box with a 20px chevron.
- **Field.** The label above (14px grey), the control, then help or the error in 12px. Required
  fields end the label with an asterisk ("Crew name*"). Fields stack 16px apart; pair short ones.
- **Checkbox, radio.** 20px with a 1.5px grey ring. A checked box fills black with a white tick; a
  checked radio fills black with a dot in the page colour.
- **Switch.** 42 × 24px pill: grey when off, **green** `#007d48` when on, with a white knob. It
  takes effect at once.

**Navigation**
- **Navbar.** 60px, white, no rule. The wordmark in condensed capitals at the left; links centred,
  16px medium black, turning grey on hover; the current one with a 2px black underline. At the
  right, a grey pill search field (24px icon, "Search"), icon buttons and the avatar. An unread
  count is an 8px orange dot on the bell.
- **Sidebar.** Used as the filter or settings column, not a dashboard rail: no fill, no border, 16px
  items in grey with the current one in black medium. Filter groups below are accordion rows with
  checkboxes.
- **Tabs.**
  - **Underline:** grey 16px medium labels; the current one black over a 2px black bar, on a full
    hairline.
  - **Pill** (the segmented control): a white tray on the lift with 8px corners; the current segment
    on a 12% black shade.
- **Breadcrumb.** 14px, grey links with "/" between, the current page in black medium.
- **Pagination.** 36px round ghost buttons; the current page is a black disc with white text.
  Prefer "Load more" in long lists.

**Data and content**
- **Card.** White, 8px corners, the soft lift, no border, 24px padding. Titles 20px medium; the
  description 16px grey. Workout cards are different: no card at all, just a square-cornered 4:3
  image well, then the title (16px medium), the meta line (14px grey: "Intermediate · Strength ·
  Dumbbells") and the minutes, with a bookmark icon button at the right.
- **Table.** Rarely needed; when it is: no frame, no header fill, 14px medium grey headers, 16px
  rows with hairlines and the grey band on hover.
- **Badge.** A pill, 24px tall, 12px medium: neutral on a 12% black shade; solid black for a flag
  ("Most picked"); status tags in the tone's text colour on the grey band.
- **Avatar.** Round, on the grey band with black initials. 24px in rows, 32px in the bar, 48px on
  a profile.
- **Divider.** A `#e5e5e5` hairline.
- **Accordion.** No frame: hairline under each row, 20px medium questions, 24px row padding, a 24px
  chevron on the right that turns. Used for FAQs and for filter groups.
- **Code, kbd.** Roboto Mono on the grey band with 8px (blocks) or 4px (inline and keys) corners.
- **Prose.** 16px with a 1.75 line height, at most about 68 characters a line; links black and
  underlined.
- **Progress.** A 4px pill bar: black on the hairline grey (white on dark media). Plans show it with
  "7 of 12 workouts" under it.
- **Meter.** The same bar; it turns red past the "high" mark.
- **Usage.** A label and amount over a 4px meter bar, with the amount in tabular figures.

**Feedback and overlays**
- **Alert.**
  - The grey band, 24px corners, 20px padding, no border or stripe.
  - A 36px status disc (red, green, yellow or blue) with the icon in white (black on yellow); the
    title 16px medium and the body 14px, both black.
  - A form alert says what wasn't done ("Your crew wasn't created").
- **Toast.**
  - Bottom right, 324px wide, white on the soft lift, 24px corners, 20px padding.
  - The title 16px medium, one line of detail, and at most one action pill.
  - Success toasts close themselves after 4s; error toasts stay until dismissed.
- **Dialog.**
  - White, 24px corners, 48px padding, no shadow, over a 36% black scrim; 360px for a confirm.
  - The title 24px medium; actions on the right with the black pill last.
- **Popover and menu.** White, 8px corners, the soft lift, 6px inset. Rows are 36px with 8px
  corners and highlight on a 12% black shade; hairlines between groups; a destructive row in red.
- **Tooltip.** A small white panel on the lift (not a dark chip), 14px black text, 8px corners, 16px
  by 20px padding, no arrow.
- **Spinner.** A black ring on the hairline grey. Inside buttons and small areas only.
- **Skeleton.** Grey-band blocks shaped like the image well and the text lines, square-cornered,
  with a slow shimmer that stops under reduced motion.

**AI and chat**
- **Chat.**
  - The assistant writes on the page with no bubble; its avatar is a black disc.
  - The person's own messages sit in a grey-band bubble with 24px corners, right-aligned.
  - Timestamps are 12px grey.
- **Composer.** The search pill grown up: white, 24px corners, a grey control ring that turns black
  while typing. Send is a round black pill with the `send` icon.
- **Thinking.** A grey line ("Thinking…") with a soft pulse. **Tool call:** a hairline row with a 20px
  icon, the tool name and a status tag.
- **Citation.** A small pill on the 12% shade with a number; it turns black on hover, and the source
  opens in the white popover.
- **Usage**, as above.

## Error handling

- **In a field:** the ring turns red and the message replaces the help text. Validate on blur and on
  submit, never while someone is still typing.
- **In a form:** an alert above the form on the grey band, with the red disc, saying how many things
  need fixing and what wasn't done. Focus moves to it; each field shows its own message.
- **Somewhere else:** a toast with what happened and one action ("Workout didn't download · Retry
  now").
- **A whole page:** centred, under the normal bar.
  - A 48px outline icon in grey, the code in small mono, a 24px medium title, one sentence, then a
    black pill and an outline pill. A 404 may add a row of workout cards below, to get going again.
  - **404:** "We can't find that page", with Go to Today.
  - **500:** "Something went wrong on our end" and "nothing was changed", with Try again and Get help.
  - **403:** "This plan belongs to another crew", with Request an invite.
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks. Save the energy for the display headlines.

## Page shapes (recipes)

- **Dashboard (Today).**
  - A full-bleed dark hero: a medium kicker, condensed capitals ("OWN THE FIRST MILE"), one line,
    a white pill and an outline pill.
  - The week as a streak row of discs (black with a tick when done, ringed for today) beside three
    condensed numerals.
  - Workout cards in a grid under underline tabs; a dark plan panel with a progress bar; focus tiles
    as dark media with condensed labels.
- **List and detail (Library).**
  - The title with its count, "Hide filters" and "Sort by" as ghost buttons.
  - The filter column: a switch, the disciplines with the current one in black, checkbox groups as
    accordion rows. Active filters as black chips above the results.
  - Thumbnail rows (image well, title, two grey meta lines, minutes, bookmark). The chosen workout
    opens as a dark panel: back, share and save at the top, the title, then icon meta rows, the
    blurb and a full-width white Start pill with a round watch button.
- **Onboarding.** A split screen: dark media with the condensed promise, and one question per step
  in a 30rem column with a thin progress bar, large rounded choice rows and a full-width black pill.
- **Settings.** A plain settings column beside hairline rows: the label in medium, the value in grey,
  a chevron or a green switch at the end. Delete account comes last, with the danger pill.
- **Empty state.** Full-bleed dark media with condensed capitals and an outline pill when a whole
  area is empty; in-page, a 48px outline icon, a small uppercase heading, one sentence and a black
  pill.
- **Pricing.** A signature-orange band with black condensed capitals, a segmented monthly or yearly
  switch, three cards on the lift with condensed prices and full-width pills (black on the
  recommended one), then FAQ rows.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Short, direct and active: "Start workout", "Find a workout", "Keep your streak on track".
- Headlines can shout (condensed capitals, a verb up front); body copy never does.
- Durations as "24 min" in lists and "24 minutes" in details; levels as Beginner, Intermediate,
  Advanced.

## Do and don't

| Do | Don't |
| --- | --- |
| Keep to black, white and grey; save colour for status and the brand orange | Tint surfaces, or use the orange for actions or links |
| Use condensed capitals for heroes, panels and big numerals | Set body text, labels or buttons in the display face |
| Make every button a pill; one black pill per view | Square buttons, or two black pills side by side |
| Run media full-bleed and keep it dark in both modes | Put photos you don't own in the product; use the gradient placeholder |
| Separate with space, weight and the soft lift | Draw card borders, rules under the bar or filled nav items |
| Show progress as condensed numerals and streak discs | Bury totals in small text or inside charts |
| Use the same 1.5px outline icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
