# Marigold

Category: warm and friendly (also playful). Bright and encouraging: white screens with soft grey 2px
outlines, a bright green for the one action and for progress, a sky blue for links and whatever is
selected, rounded heavy type, uppercase button labels, and chunky buttons that stand on a darker lip
and press down when tapped. For learning, habit and practice apps that should feel like
encouragement, not homework.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `marigold` preset of `@mariachi/design` (`data-theme="marigold"`,
`themes/marigold.css`).

## Principles

- **Everything is chunky and touchable.** Buttons are 50px tall with a 4px darker lip at the bottom;
  they lighten on hover and press down (the lip goes, the button moves) when tapped. Corners are
  round: 16px on buttons, cards and dialogs, 12px on inputs and nav items.
- **Outlines, not shadows.** Cards, rows, inputs and the side column are drawn with 2px grey lines
  (`#e5e5e5`). The only depth is a solid lip under a shape; nothing floats on a blurred shadow.
- **Green means go, blue means chosen.** The bright green is the one action on a screen and the
  learner's progress. Sky blue is for links, the current nav item, picked answers and switches.
  Red, orange, yellow and violet are for small coloured moments: stats, icons, celebrations.
- **Heavy, friendly type, two weights.** One rounded sans everywhere, at two weights only: 800 for
  headings, labels, figures and big lowercase marketing headlines, 500 for everything else. Buttons,
  tabs, nav items and section labels are uppercase with a little tracking.
- **Encourage, never scold.** Copy cheers people on and says what to do next; mistakes get a plain
  correction, not a warning.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and cards | white `#ffffff` | `#131f24` |
| The pale well: inputs, quiet panels, hover | `#f7f7f7` | `#202f36` |
| Text: default, muted, subtle | `#4b4b4b`, `#666666`, `#707070` | `#f1f7fb`, `#dce6ec`, `#8197a0` |
| Lines (2px): cards, rows, outlines, button rings | `#e5e5e5` | `#37464f` |
| Control borders (inputs, checkboxes) | `#8f8f8f` | `#677b84` |
| Brand green: banners, the wordmark, highlights | `#58cc02` with dark ink `#131f24` | `#93d333` |
| Primary button | `#58cc02`, hover `#61e002`, label `#131f24` | `#93d333` |
| Semantic accent (rings, ticks) | the lip green `#58a700` | `#93d333` |
| Links, selection, focus | text `#0070a0`; tint `#ddf4ff` with a `#84d8ff` outline; focus `#1590cc` | `#49c0f8` on `#1a3546` |
| Correct / wrong | pale green `#d7ffb8` with `#3b7700`; pale red `#ffdfe0` with `#c21f1f` | `#1f3a1a` with `#93d333`; `#3a1f22` with `#ff7878` |
| Warm moments | orange `#ff9600`, yellow `#ffc800` (text `#8c5a11`), violet `#ce82ff` | the same |

- **Radius.** 8px for badges, checkboxes and kbd; 12px for inputs, selects, nav items, menu items and
  segments; 16px for buttons, cards, alerts, toasts, dialogs and accordions. Lesson buttons and
  avatars are round.
- **Borders.** Every line is 2px, including table rows and dividers.
- **The lip.** A solid band below each button in its own darker step: 4px under the green and red
  (`#58a700`, `#ea2b2b`), 2px of grey under the white button; ghost buttons have none. Pressed, the
  lip goes and the button moves down 4px. Tooltips and overlays take a solid `0 2px 0` or `0 4px 0`
  lip in the line grey. **Tiles and choice cards that stand on a lip draw it as a thicker bottom
  border** (`border-block-end-width: var(--m-border-width-thick)`, so 2px sides and a 4px bottom), as
  the source draws its tiles; the green unit banner does the same in the lip green
  (`--m-color-accent-default`).
- **Motion.** 100ms for hover and press, 200ms for opening, 400ms for large moves; plain `ease`,
  with a small overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for celebrations.
- **Spacing.** A 4px unit with generous gaps:
  - 8–12px inside a control group;
  - 16px between fields and between stacked buttons;
  - 24px card padding and between cards;
  - 32–48px between page sections.
- **Layout.**
  - A 256px side column with a 2px line on its edge.
  - A learning column about 38rem wide, centred, with a 23rem right column of stats and cards
    beside it; on phones the right column drops below.
  - Forms and single questions in a 42rem column; sign-in in 24rem.
- **Density.** 1 by default; 0.85 for dense admin screens (`--m-density: 0.85`). Don't go denser:
  the chunkiness is the point.

Use tokens, never colour literals: `var(--m-color-brand-default)`, `var(--m-space-4)`. The exact
scales are in the reference at the end.

## Type

- **Family.** Nunito (variable, `@fontsource-variable/nunito`) for everything: body at 500; labels,
  headings and marketing headlines at 800. **Two weights a screen, never three:** the source's screens
  measure one or two weights on every screen (51 of 51), so the preset maps medium to 500 and
  semibold to 800. DM Mono for codes, small.
- **Sizes:**
  - body 17px with a 1.45 line height;
  - buttons, tabs, nav items and section labels 15px, 800, uppercase, tracked 5%;
  - small print and badges 13px;
  - card titles and dialog titles 24px at 800;
  - page titles 32px at 800;
  - marketing headlines 48px and 62px at 800, **lowercase**, tracked −2%, in the brand green
    ("grow further with plus").
- **Case.** Sentence case for headings and body. Uppercase only for buttons, tabs, nav items, badges
  and grey section labels ("FRIENDS", "STATS").
- **Figures.** Heavy, with an icon in its colour before them: a flame and `23`, a gem and `1,140`.

## Icons

- Lucide, outlined, **2.5px stroke** with round ends: 20px in buttons and text, 22–24px in stats and
  the side column, 28–30px on choice cards and lesson buttons, 48–56px in a pale circle for empty
  states and error pages.
- Icons are often coloured: a stat's icon takes its tone (flame orange, gem blue, heart red); nav
  icons stay in the label's colour.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Bars and rings, chunky.** Thick rounded bars (radius full) on the line-grey track, the value in
  heavy type at the end. Weekly activity is a row of rounded columns, today's in green and the rest
  in the line grey.
- **Series** step through green, sky, orange, violet, red and yellow.
- No gridlines; axis labels in muted 13px uppercase. Tooltips use the white outlined bubble.

## States (every control)

- **Hover.** Fills lighten one step (the primary `#58cc02` to `#61e002`; white to the pale well);
  rows and nav items take the pale well. Nothing moves.
- **Focus.** A 2px blue ring (`--m-color-border-focus`) outside the control, on keyboard focus only.
- **Pressed.** The lip disappears and the button moves down 2px, as if pushed in.
- **Disabled.** Half opacity, no lip movement; say nearby why it's unavailable. A lesson that isn't
  open yet is a grey round button with a lock, not a disabled one.
- **Selected.** The sky tint with a light-blue 2px outline and blue text: picked answers, the
  current nav item, the current page. Switches and ticks are blue when on.
- **Error.** The control's border turns red, and the message (13–15px, 800, red) replaces the hint
  under it.
- **Loading.** A button keeps its size and shows a spinner (`aria-busy="true"`). Lists show skeleton
  blocks in the line grey with the pale-well shimmer.

## Components

All 36 of the library's components, as Marigold draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 66rem, 42rem for forms and single questions, 24rem for sign-in;
- `m-split`, the 256px side column beside the main area;
- `m-grid`, for cards and stat tiles, 24px gaps;
- `m-stack` and `m-cluster`, for everything inside (the learning column and right column are a
  wrapping cluster, so the right column drops below on phones).

**Actions and forms**
- **Button.** 50px, 16px corners, 15px uppercase at 800, a 4px darker lip and a 2px ring drawn
  inside the shape.
  - **Primary:** bright green with dark ink; one per screen ("Continue", "Start", "Save changes").
  - **Secondary** (the default): white with a grey ring and lip and a blue label ("Skip", "Follow").
  - **Ghost:** a blue uppercase label with no fill, for quiet links in bars; on hover it takes the
    pale well and the ring and lip, becoming a white button.
  - **Danger:** red with dark ink, only to confirm something destructive.
  - **Icon-only:** square; lesson buttons on the path are round, 72 × 64px.
  - Stacked full-width buttons are common on narrow screens and in empty states.
- **Input, textarea.** 48px, 12px corners, the pale well, a 2px grey control border that darkens on
  hover and turns blue on focus, 17px text.
- **Select.** The same well and border with a chevron.
- **Field.** The label above in 17px at 800, then the control, then the hint (15px, muted) or the
  error (red, 800). Fields stack 16px apart.
- **Checkbox, radio.** 24px with a 2px border; blue when on (a white tick or dot). On choice cards,
  the whole card is the target and turns blue.
- **Switch.** 52 × 32px, a grey track and a blue one when on, a white knob with a small lip. It
  applies at once.

**Navigation**
- **Sidebar.** 256px, white, a 2px line on its edge.
  - The wordmark at the top in 800, lowercase, in the brand green.
  - Items are 15px uppercase at 800 in grey, each with a 24px icon, 12px corners.
  - The current item has the sky tint, a light-blue 2px outline and blue text.
  - Counts are red pills with dark ink. Section headings are 13px uppercase grey.
- **Navbar** (public pages). White, 70px, a 2px line under it, the green wordmark on the left and a
  white "Log in" button on the right.
- **Tabs.**
  - **Underline:** 15px uppercase at 800 in grey; the current tab is blue over a 2px blue line, on a
    2px grey line.
  - **Pill** (the segmented control): a pale well with 4px padding; the selected segment is white
    with a grey ring and lip.
- **Breadcrumb.** 15px blue links with `›` between; the current page in blue at 800. On help pages
  the crumbs are set uppercase.
- **Pagination.** 12px-cornered squares with a 2px grey outline; the current page in the sky tint
  with a blue outline and blue text.

**Data and content**
- **Table.** Inside a 16px-cornered 2px outline; headers 15px uppercase grey at 800; rows separated
  by 2px lines, hovering in the pale well. A highlighted column (a chosen plan) takes the sky tint.
- **Card.** White, 2px grey outline, 16px corners, 24px padding, no shadow; a clickable card gains a
  4px grey lip on hover. Titles 24px at 800 with a blue uppercase "View all" link at the right.
- **Badge.** 8px corners, 13px uppercase at 800, tracked: tinted by tone, or solid with dark ink
  ("Most picked").
- **Avatar.** Round, initials at 800 on a pale tint (sky by default; vary by tone in lists), with a
  2px line ring.
- **Divider.** A 2px grey line; with a label, the label is uppercase grey 15px.
- **Accordion.** One 2px outlined card with 16px corners and rows split by 2px lines, 22px tall
  padding, the question at 500 and a chevron on the right; the answer in muted text.
- **Code, kbd.** DM Mono in the pale well with 12px corners (8px inline). Keys are 8px-cornered
  boxes with a 2px grey outline and a lip.
- **Prose.** 17px, 1.6 line height, about 40rem wide, links blue without underline, headings 800.
- **Progress.** A thick 16px rounded bar (10px small, 20px large) on the line-grey track, in green.
  On quest cards the count sits at the end of the bar.
- **Meter.** The same bar; past the high mark it turns red.
- **Usage.** A label and figure over a 16px rounded meter, green while fine.

**Feedback and overlays**
- **Alert.** A pale tint in the tone with a 2px outline in the tone, 16px corners, a 22–28px icon,
  and a heavy title in the tone's text colour. The answer banner under an exercise is its own
  pattern: the pale green or red tint with 16px corners, a 36px icon in a white circle, a 24px heavy
  title ("Spot on!", "The answer:"), one line, and the button on the right.
- **Toast.** White, 2px grey outline, 16px corners, a solid lip and a faint drop; title at 800, one
  line of detail, one button ("Retry", "Undo").
- **Dialog.** White, 16px corners and a 2px grey outline, over a 50% black scrim; a 24px heavy title and stacked
  or side-by-side buttons, primary last.
- **Popover and menu.** White, 2px grey outline, 16px corners and a lip; items 15px at 500 with a 12px
  hover in the pale well; uppercase grey group labels; a destructive item in red.
- **Tooltip.** A white bubble with a grey 2px ring and lip, 12px corners, 15px at 800 ("Start" above
  the current lesson).
- **Spinner.** A blue ring on the line-grey track.
- **Skeleton.** Line-grey blocks with an 8px radius and a pale-well shimmer, stopping under reduced
  motion.

**AI and chat**
- **Chat.** Speech bubbles with 16px corners and 2px outlines: the other side white with a grey
  outline, the person's own in the sky tint with a light-blue outline. Avatars in the pale green.
- **Composer.** The pale well with a 2px border and 16px corners; it turns blue while typing. Send
  is a green icon button with a lip.
- **Thinking.** A muted line with a soft pulse, 12px corners. **Tool call:** a 2px outlined row with
  16px corners, an icon, the tool name and an 8px-cornered status badge.
- **Citation.** A small sky-tint chip with a number, 8px corners; the source in an outlined popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and a red message at 800 replaces the hint. Check on blur and
  on submit, never mid-typing.
- **In a form:** a danger alert above the form saying how many things to fix and that nothing was
  saved yet ("2 things to fix. Your profile wasn't saved yet."). Focus moves to it.
- **An answer:** the green or red banner across the bottom of the exercise, with the right answer and
  one button.
- **Somewhere else:** a white toast with what happened and one action ("Lesson didn't sync · Retry").
- **A whole page:** centred. A 48px icon in a 96px pale circle in a tone, a small uppercase code, a
  32px heavy title, one sentence and stacked full-width buttons.
  - **404:** "We can't find that page" with Back to my path.
  - **500:** "Something broke on our end", "Your progress is safe", with Try again.
  - **403:** "This grove is private" with Ask to join.
- **Words.** Warm and plain: what happened, that their progress is safe, what to do next. No codes in
  sentences, no blame.

## Page shapes (recipes)

- **Dashboard.**
  - The side column; the green unit banner (section label, unit name, a white "Guide" button) on a
    lip.
  - The path: round lesson buttons zigzagging down, done ones green with a tick, the current one with
    a "Start" bubble, later ones grey with a lock.
  - The right column: stats (flame, gem, heart) and outlined cards with goals on thick bars.
- **List and detail.** A big trophy icon and heavy title, a segmented control, then the ranking:
  open rows with tinted initials, the top three's places in orange, the learner's own row in the pale grey
  well, and a "Promotion zone" divider. A person's card with Follow and stat tiles on the right.
- **Onboarding.** A close button and a thick progress bar on top, one heavy question centred over a
  grid of choice tiles (four across on wide screens; a coloured icon in a tinted tile, a name, a
  muted count; outlined, on a 4px lip), the picked tile in the sky tint with a blue outline, and a
  footer bar under a 2px line with Skip and Continue. Nothing else is asked on the screen.
- **Settings.** A heavy title with Save, grey uppercase group labels, toggles in rows on 2px lines,
  inputs in the well, and the settings menu as outlined cards on the right.
- **Empty state.** A big icon in a pale circle, a heavy heading, one sentence, stacked buttons.
- **Pricing.** A heavy lowercase green headline, a yearly switch, three plan columns side by side
  (a header band in the well with the name and price, then ticks and crosses), the paid one raised,
  outlined in blue with a sky-tint header and a "Most picked" badge; one large green action, and
  questions in an outlined accordion.
- **Errors.** The field, form, answer, toast and full-page errors above, as one page.

### Signature moves

Each is `observed` (measured by the probe, or read from the source's computed styles), `inferred`, or
`told`. Numbers are from the fingerprint (source: 17 public screens at three widths; Marigold: the
seven recipes at three widths).

1. **Everything pressable stands on a lip.** A darker 4px band under buttons, tiles and banners that
   disappears when pressed. Tiles draw it as a thicker bottom border (2px sides, 4px bottom, 16px
   corners): `observed` on every tile in the first window of the source's two public tile grids (28 of 28).
2. **Two heavy weights.** 500 and 800, never a third: the source uses one or two weights on every
   screen (51 of 51); Marigold's recipes now measure 1 to 2. `observed`
3. **Outlines, never blurred shadows.** 2px grey lines around cards and rows; no soft shadow on any
   measured source screen (shadow share 0 of 51); where the probe saw a drawn edge it was a border
   only (11 of 11). `observed`
4. **Green means go, blue means chosen.** One bright green action; picked things take the sky tint, a
   light-blue outline and blue text together. One hue family per role: the source's screens show one
   saturated hue typically (0 to 2); Marigold's show two (2 to 3 on app screens, where stats bring
   their own colours). `observed`, the reason `inferred`
5. **One thing at a time.** Flows have a close button and a thick progress bar on top, one question,
   and the action in a footer bar; nothing else on the screen. `inferred` from public screenshots of
   the source's app
6. **Big, heavy, lowercase headlines on public pages,** in the brand green; sentence case
   everywhere else. `observed` on 3 of the 7 studied marketing screens; the others are sentence case
   (see questions.md)
7. **Few sizes, one big jump.** Two to five text sizes a screen (source 2 to 5, typically 3;
   Marigold 3 to 4), and the largest is about twice the body on app screens (source 1.0 to 2.9,
   typically 1.9; Marigold 1.9 to 2.1, 3.65 on pricing). `observed`

### How a screen is assembled

- **What it opens with.** App screens: the side column, then a heavy title (or the green unit banner)
  at the top of a centred column about 38rem wide, with a right column of outlined cards beside it.
  Flows: a close button and the progress bar, nothing else. Public pages: a 70px white header with
  the wordmark and one white button.
- **Reading order.** The title, then the one thing the screen is for, then its action. The right
  column (stats, goals, a person's card) is read second and is never needed to finish the job.
- **How much one screen does.** One job and one green action (the path is the exception: done steps
  are green too). Secondary actions are white buttons or blue uppercase links.
- **When narrow.** The right column drops below the main column; button groups stack at full width,
  primary first (or last in a footer); grids of tiles go from four across to two (the source's
  tile grids measure 4 columns wide and 2 on phones).
- **Too much content.** Lists and rankings scroll in place; there's no pagination in the app. Long
  prose sits in a column of about 40rem (the source's text pages measure 340 to 830px of text width,
  typically 630px).
- **No content.** The frame stays (title, tabs, right column); the main column gets the
  empty-state block (see patterns/nothing-here.md).
- **Composition files.** `patterns/` holds one file per recurring job, `never.md` the refusals,
  `precedents/index.md` the recipes as precedents, `brief.md` the one-page summary.

## Words

- Short, warm, sentence case: "Spot on!", "Find friends", "Try plus free for 14 days".
- Buttons are verbs, shown uppercase by the style, written in sentence case in the markup.
- Celebrate progress with numbers ("6th place", "26/40"), never shame a miss.

## Do and don't

| Do | Don't |
| --- | --- |
| Give every button its lip and let it press down | Flat buttons, or soft drop shadows |
| Draw cards and rows with 2px grey lines | Hairlines under 2px, or floating cards |
| Use green for the one action and for progress | Several green buttons competing on one screen |
| Use the sky tint and blue outline for what's selected | Show selection with colour alone or a tick alone |
| Set buttons, tabs and labels uppercase at 800 | Uppercase headings or body text |
| Set marketing headlines lowercase at 800 in green | Title Case headlines, or headline type in grey |
| Use rounded heavy icons, coloured for stats | Thin-stroke icons, or mixed icon sets |
| Cheer people on in the copy | Blame, codes, or exclamation marks on errors |
