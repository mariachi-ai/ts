# Marigold

Category: warm and friendly (also playful). Bright and encouraging: white screens with soft grey 2px
outlines, a bright green for the one action and for progress, a sky blue for links and whatever is
selected, rounded heavy type, uppercase button labels, and chunky buttons that stand on a darker lip
and press down when tapped. For learning, habit and practice apps that should feel like
encouragement, not homework.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the nine page shapes as HTML using only the library's classes (the seven app and
  marketing shapes, then `reading` and `sign-in`);
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `marigold` preset of `@mariachi/design` (`data-theme="marigold"`,
`themes/marigold.css`).

## Principles

- **Everything is chunky and touchable.** Buttons are 50px tall: a 46px face standing on a 4px darker
  lip (the `md` button height token is the face). They lighten on hover and press down 4px (the lip
  goes, the button moves) when tapped. Corners are round: 16px on buttons, cards and dialogs, 12px
  on inputs and nav items.
- **Outlines, not shadows.** Cards, rows, inputs and the side column are drawn with 2px grey lines
  (`#e5e5e5`). The only depth is a solid lip under a shape; nothing floats on a blurred shadow.
- **Green means go, blue means chosen.** The bright green is the one action on a screen and the
  learner's progress. Sky blue is for links, the current nav item, picked answers and switches.
  The warning tone (yellow fills, amber text and icons) and red are for small coloured moments in the
  app: stats, icons, celebrations. Public pages use green and sky only.
- **The bright green is a fill, never text.** `#58cc02` on white is 2.1:1. Words set in green
  (public headlines, the wordmark set as text) use the text green, `--m-color-success-fg`
  (`#3b7700`, 5.5:1). Only a product's own logo image keeps its own colours.
- **Heavy, friendly type, two weights.** One rounded sans everywhere, at two weights only: 800 for
  headings, labels, figures and the lowercase public headlines, 500 for everything else. Buttons,
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
| Brand green: fills only (the primary, banners, the landing footer); never text | `#58cc02` with dark ink `#131f24` | `#93d333` |
| Text green: green words (display headlines, the wordmark), "right" | `#3b7700` (`--m-color-success-fg`, 5.5:1) | `#93d333` |
| Primary button | `#58cc02`, hover `#61e002`, label `#131f24` | `#93d333` |
| Semantic accent (rings, ticks) | the lip green `#58a700` | `#93d333` |
| Links, selection, focus | text `#0070a0`; tint `#ddf4ff` with a `#84d8ff` outline; focus `#1590cc` | `#49c0f8` on `#1a3546` |
| Correct / wrong | pale green `#d7ffb8` with `#3b7700`; pale red `#ffdfe0` with `#c21f1f` | `#1f3a1a` with `#93d333`; `#3a1f22` with `#ff7878` |
| Warm moments (app only) | the warning tone: yellow fill `#ffc800`, amber text and icons `#8c5a11` | `#ffc800` |

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
  - 32–48px between sections of an app screen;
  - 96px between the sections of a public page (64px on phones; see Page shapes, Public pages).
- **Layout.**
  - App: a 256px side column with a 2px line on its edge; a learning column about 38rem wide,
    centred, with a 23rem right column of stats and cards beside it; on phones the right column
    drops below.
  - Forms, single questions and reading (prose) share one 42rem column; sign-in and recovery use
    24rem.
  - Public pages: a 66rem page width for the top bar, every section and the footer.
- **Density.** 1 by default; 0.85 for dense admin screens (`--m-density: 0.85`). Don't go denser:
  the chunkiness is the point.

Use tokens, never colour literals: `var(--m-color-brand-default)`, `var(--m-space-4)`. The exact
scales are in the reference at the end.

## Type

- **Family.** Nunito (variable, `@fontsource-variable/nunito`) for everything: body at 500; labels,
  headings and marketing headlines at 800. **Two weights a screen, never three:** the source's screens
  measure one or two weights on every screen (51 of 51), so the preset maps medium to 500 and
  semibold to 800. DM Mono for codes, small.
- **The scale:** 13, 15, 17, 24, 32, 48, 62px.
  - **15px** (`sm`): buttons, tabs, nav items and section labels (800, uppercase, tracked 5%), and
    hints, captions, meta lines and small print (500). Small print is never smaller than 15px.
  - **17px** (`md`): body, with a 1.45 line height (1.6 in prose); field labels at 800.
  - **24px** (`xl`): card titles, dialog titles, prose section headings, the public wordmark.
  - **32px** (`2xl`): page titles; the reading-page headline; every display headline on phones.
  - **48px** (`3xl`): section headlines on landing pages, wide and narrow.
  - **62px** (`4xl`): the one biggest headline of a landing or pricing page, wide and narrow.
  - **13px** (`xs`): badges, pill counts, sidebar section headings and chart axes only.
- **Four sizes a screen, at most** (`observed`: source 2 to 5, typically 3). A screen is what's
  visible at once; a long public page keeps to four in any window. Every screen has 15 and 17; it
  picks at most two heading steps:
  - app screens: 32 (the page title, and the side column's wordmark) and 24 (card titles);
  - flows and sign-in: 32 only;
  - reading pages: 32 (the headline) and 24 (section headings, the wordmark);
  - landing and pricing: in any one window, one big step (the 62 or 48 display headline, or the
    hero's 32px promise; 32 on phones) and 24 (the wordmark, feature-tile headings).
  A screen that shows badges or counts at 13px has used its fourth size on them: set the badges at
  15px instead (as `pricing` does) or drop a heading step. Avatar initials follow the avatar's size
  and are the one exception (`list-detail` measures five because of them).
- **Display headlines** (public pages only): the display face at 800, tracked −2%, line height 1.1,
  **lowercase**, in the **text green** (`--m-color-success-fg`), never the bright brand green
  ("grow further with plus"). Under 40rem every display headline steps down to 32px:
  `font-size: clamp(var(--m-font-size-2xl), (100vw - 40rem) * 99, var(--m-font-size-3xl))` (a step,
  not a ramp; `4xl` for the biggest).
- **Case follows the face** (`observed` in the computed styles of the source's front page and a blog
  post: all 8 lowercase headlines are the display face, 7 of them green, at 37–64px; the hero's
  promise is the text face in ink, sentence case, as on 4 of the 7 studied marketing screens). So:
  green display headlines are lowercase; a headline in ink is sentence case (the landing hero's
  promise, page titles, card titles). Help and legal titles are sentence case too, although the source sets them in
  title case (questions.md, 5). Uppercase only for buttons, tabs, nav items, badges, breadcrumbs,
  meta lines and grey section labels ("FRIENDS", "STATS").
- **Figures.** Heavy, with an icon in its colour before them: a flame and `23`, a gem and `1,140`.

## Icons

- Lucide, outlined, **2.5px stroke** with round ends, at these sizes only:
  - 20px in buttons and inline with text (18px in small buttons);
  - 22px beside stats and goals; 24px in the side column and the close button;
  - 30px on lesson buttons; 32px in a tinted tile (choice tiles, feature tiles);
  - 40px in a card or a picture link with no circle; 48px over a list's title and in error circles;
    56px in the 7rem pale circle (empty states, picture stand-ins, confirmations).
- Icons are often coloured: a stat's icon takes its tone (flame amber, gem blue, heart red); nav
  icons stay in the label's colour. On public pages icons are green or sky only.
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
- **Series** step through green, sky, orange, red and yellow (the chart colours in the language's
  metadata; there's no violet). Orange `#ff9600` exists only as a chart colour; in the UI the warm
  tone is the warning tone.
- No gridlines; axis labels in muted 13px uppercase. Tooltips use the white outlined bubble.

## States (every control)

- **Hover.** Fills lighten one step (the primary `#58cc02` to `#61e002`; white to the pale well);
  rows and nav items take the pale well. Nothing moves.
- **Focus.** A 2px blue ring (`--m-color-border-focus`) outside the control, on keyboard focus only.
- **Pressed.** The lip disappears and the button moves down 4px, as if pushed in.
- **Disabled.** Half opacity, no lip movement; say nearby why it's unavailable. A lesson that isn't
  open yet is a grey round button with a lock, not a disabled one.
- **Selected.** The sky tint with a light-blue 2px outline and blue text: picked answers, the
  current nav item, the current page. Switches and ticks are blue when on.
- **Error.** The control's border turns red, and the message (15px, 800, red) replaces the hint
  under it. Red appears on a form only here: there's no red required marker.
- **Loading.** A button keeps its size and shows a spinner (`aria-busy="true"`). Lists show skeleton
  blocks in the line grey with the pale-well shimmer.

## Components

All 36 of the library's components, as Marigold draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 66rem (public pages), `data-size="md"` 42rem for forms, single
  questions and reading, `data-size="sm"` 24rem for sign-in and recovery;
- `m-split`, the 256px side column beside the main area;
- `m-grid`, for cards and stat tiles, 24px gaps;
- `m-stack` and `m-cluster`, for everything inside (the learning column and right column are a
  wrapping cluster, so the right column drops below on phones).

**Actions and forms**
- **Button.** 50px in all: a 46px face (the `md` height token) on a 4px darker lip; 16px corners,
  15px uppercase at 800, a 2px ring drawn inside the shape. Small is a 36px face, large 52px.
  - **Primary:** bright green with dark ink; one in any window ("Continue", "Start", "Save
    changes"), on every family, sign-in included (see The two families).
  - **Secondary** (the default): white with a grey ring and lip and a blue label ("Skip", "Follow").
  - **Ghost:** a blue uppercase label with no fill, for quiet links in bars; on hover it takes the
    pale well and the ring and lip, becoming a white button.
  - **Danger:** red with dark ink, only to confirm something destructive.
  - **Icon-only:** square; lesson buttons on the path are round, 72 × 64px.
  - Stacked full-width buttons are common on narrow screens and in empty states.
- **Input, textarea.** 48px, 12px corners, the pale well, a 2px grey control border that darkens on
  hover and turns blue on focus, 17px text. A placeholder only shows a format ("6:00 pm"), never
  the field's name.
- **Select.** The same well and border with a chevron.
- **Field.** The label above in 17px at 800, then the control, then the hint (15px, muted) or the
  error (15px, red, 800). Fields stack 16px apart. Every field has a visible label, sign-in included.
  **No required marker:** the preset sets the field's `requiredMarker` to nothing, because red is for
  errors only. Fields are required unless the label ends in "(optional)" at 500, muted.
- **Checkbox, radio.** 24px with a 2px border; blue when on (a white tick or dot). On choice cards,
  the whole card is the target and turns blue.
- **Switch.** 52 × 32px, a grey track and a blue one when on, a white knob with a small lip. It
  applies at once.

**Navigation**
- **Sidebar.** 256px, white, a 2px line on its edge.
  - The wordmark at the top in 800, lowercase, in the text green.
  - Items are 15px uppercase at 800 in grey, each with a 24px icon, 12px corners.
  - The current item has the sky tint, a light-blue 2px outline and blue text.
  - Counts are red pills with dark ink. Section headings are 13px uppercase grey.
- **Navbar** (public pages). White, 70px, the wordmark on the left at 24px in the text green, at most
  a few uppercase grey links, and one white button on the right ("Log in", "Start learning"). Its
  content keeps to the 66rem page width
  (`--m-navbar-padding-x: max(var(--m-layout-container-padding), (100% - var(--m-layout-container-max-lg)) / 2)`).
  A 2px line under it on help, legal and pricing pages; **no line** on landing pages and the blog
  (`--m-navbar-border-width: 0`; `observed`: the help header has one, the front page and the blog
  post don't).
- **Tabs.**
  - **Underline:** 15px uppercase at 800 in grey; the current tab is blue over a 2px blue line, on a
    2px grey line.
  - **Pill** (the segmented control): a pale well with 4px padding; the selected segment is white
    with a grey ring and lip.
- **Breadcrumb.** 15px blue links at 800 with `›` between, **always uppercase** and tracked (set
  `text-transform: uppercase` on the nav; `observed` on the help pages). Blog posts have no
  breadcrumb: their uppercase meta line (date · author) does the job (`observed`). App screens don't
  use breadcrumbs (`inferred`: the side column says where you are).
- **Pagination.** 12px-cornered squares with a 2px grey outline; the current page in the sky tint
  with a blue outline and blue text.

**Data and content**
- **Table.** Inside a 16px-cornered 2px outline; headers 15px uppercase grey at 800; rows separated
  by 2px lines, hovering in the pale well. A highlighted column (a chosen plan) takes the sky tint.
- **Card.** White, 2px grey outline, 16px corners, 24px padding, no shadow; a clickable card gains a
  4px grey lip on hover. Titles 24px at 800 (the `xl` step, which counts toward a screen's four
  sizes) with a blue uppercase "View all" link at the right.
- **Badge.** 8px corners, 13px uppercase at 800, tracked: tinted by tone, or solid with dark ink
  ("Most picked").
- **Avatar.** Round, initials at 800 on a pale tint (sky by default; vary by tone in lists), with a
  2px line ring.
- **Divider.** A 2px grey line; with a label ("OR"), the label is uppercase grey 15px, tracked (the
  preset sets the divider's label size to `sm`).
- **Accordion.** One 2px outlined card with 16px corners and rows split by 2px lines, 22px tall
  padding, the question at 500 and a chevron on the right; the answer in muted text.
- **Code, kbd.** DM Mono in the pale well with 12px corners (8px inline). Keys are 8px-cornered
  boxes with a 2px grey outline and a lip.
- **Prose.** 17px, 1.6 line height, **42rem** wide (the same column as forms; the source's post
  column measures 680px). Section headings (`h2`) 24px, smaller headings 17px, all at 800. Links are
  blue at 800 with **no underline at rest** (`observed`: the source's post links are bold blue, no
  underline); set the weight on each link. The shared prose style underlines a link on hover, and
  Marigold keeps that (`inferred`: a cue beyond colour and weight). Pictures and figures: see
  Pictures under Page shapes.
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
- **Dialog.** White, 16px corners and a 2px grey outline, over a 50% black scrim; a 24px heavy title
  and stacked or side-by-side buttons, primary last.
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

## The two families

Every screen belongs to one of two families. Decide which before anything else.

- **The app** (signed in): `dashboard`, `list-detail`, `settings`, `empty-state`, the in-app
  `errors`, and the flows inside it (`onboarding`, a lesson).
- **Public pages** (signed out, found from outside): landing pages, `pricing`, `reading` (blog posts,
  help articles, legal pages), and the account screens (`sign-in`, recovery, the sign-up form).

| | App | Flows (inside the app) | Public: landing, pricing, reading | Public: account screens |
| --- | --- | --- | --- | --- |
| Header | none; the 256px side column with the wordmark | a close button and the thick progress bar | the 70px white top bar: wordmark, few uppercase links, one white button | a close button left, one white button right ("Join" / "Log in") |
| Width | 38rem learning column + 23rem right column | 46rem question column | 66rem page; 42rem reading column inside it | 24rem column |
| Titles | 32px page title, 24px card titles, sentence case, ink | 32px question, centred, ink | display headlines, lowercase, text green: 62/48 on landing and pricing, 32 on reading; 24px section headings | 32px, centred, sentence case, ink |
| The green action | content-width (full width when stacked), one in any window | in the footer bar, right | about 20rem wide, centred or under the promise; may repeat once at the page's close | full width of the column |
| Hues | green, sky, plus the stats' amber and red | green, sky, plus tile tints | green and sky only | green and sky only |
| Footer | none | a bar under a 2px line with Skip and the action | landing: a brand-green band; reading: white under a 2px line | none; the small print, centred |
| Phones | the right column drops below; the side column stacks on top (questions.md, 9) | tiles two across; the footer bar stays | one centred column, 16px gutters; display headlines 32px; buttons full width and stacked | unchanged: the column is already narrow |

What doesn't change between them: the button (the same 3D green primary and white secondary), 2px
lines, two weights, the 4px lip, the icon set, and "never a third weight or a blurred shadow". The
account screens' action is green too: the source's log-in form uses its sky blue, but Marigold keeps
one primary, and blue means chosen (`inferred`; questions.md, 2).

The evidence: `observed` for the public header, widths, title faces, the green footer band and the
blog footer (the source's front page, a blog post and the help pages, measured 2026-11-13); the app
side is `inferred` from public screenshots of the source's app (see the private notes).

## Page shapes (recipes)

- **Dashboard.**
  - The side column; the green unit banner (section label, unit name, a white "Guide" button) on a
    lip.
  - The path: round lesson buttons zigzagging down, done ones green with a tick, the current one with
    a "Start" bubble, later ones grey with a lock.
  - The right column: stats (flame, gem, heart) and outlined cards with goals on thick bars.
- **List and detail.** A big trophy icon and heavy title, a segmented control, then the ranking:
  open rows with tinted initials, the top three's places in amber, the learner's own row in the pale
  grey well, and a "Promotion zone" divider. A person's card with Follow and stat tiles on the right.
- **Onboarding.** A close button and a thick progress bar on top, one heavy question centred over a
  grid of choice tiles (four across on wide screens; a coloured icon in a tinted tile, a name, a
  muted count; outlined, on a 4px lip), the picked tile in the sky tint with a blue outline, and a
  footer bar under a 2px line with Skip and Continue. Nothing else is asked on the screen.
- **Settings.** A heavy title with Save, grey uppercase group labels, toggles in rows on 2px lines,
  inputs in the well, and the settings menu as outlined cards on the right.
- **Empty state.** A big icon in a pale circle, a heavy heading, one sentence, stacked buttons.
- **Pricing.** A heavy lowercase headline in the text green (62px, 32 on phones), a yearly switch,
  three plan columns side by side (a header band in the well with the name and price, then ticks and
  crosses), the paid one raised, outlined in blue with a sky-tint header and a "Most picked" badge;
  one large green action, and questions in an outlined accordion.
- **Errors.** The field, form, answer, toast and full-page errors above, as one page.
- **Reading** (a blog post or help article). The public top bar with no line. A centred head: the
  headline in the display face, lowercase, text green, 32px at every width; one muted line; an
  uppercase grey meta line (date · author, 15px at 800). Then the lead picture (3:2, the column's
  width, 32px corners). Then the post in the 42rem column: paragraphs, 24px section headings,
  numbered steps, screenshots in a grey frame with a caption. Then "More guides" (an uppercase grey
  label over three picture links: a 3:2 picture with 16px corners, an uppercase label, a 17px title
  at 800) under a 2px line, and the white footer. No breadcrumb on a blog post; a help article puts
  an uppercase breadcrumb above the headline instead of the meta line (`observed`: the blog post and
  the help pages).
- **Sign-in.** A close button top left, a white "Join" top right; a 24rem centred column: the
  32px title centred, labelled fields in the well (the reset link sits inside the password field at
  its right end, uppercase grey 15px at 800), one full-width green action, an "or" divider, one
  full-width white button with an icon per other way in, and the small print centred at 15px with its
  links at 800. See [ask-for-details](./patterns/ask-for-details.md) for recovery and the "link sent"
  state.
- **Landing** (no recipe yet; build it from these rules, `observed` on the source's front page unless
  marked). In order:
  1. **The top bar** with no line.
  2. **The hero:** the promise in ink, sentence case, 32px at 800 (the text face, not the display
     face), with two stacked buttons about 20rem wide under it: the green action ("Start learning") and
     a white one ("Log in"). The picture slot beside it at wide widths, above it on
     phones.
  3. **Optionally a strip of choices** (subjects, courses) under a 2px line: uppercase grey 15px
     labels, each after a 32px icon in a tinted tile.
  4. **How it works: three or four feature rows.** Each row is two columns at wide and narrow widths,
     the text (a 48px display headline, lowercase, text green, then one muted 17px paragraph of two to
     four lines, at most 30rem) beside the picture slot (up to 30rem, 1:1). Rows alternate sides, 64px
     apart (`inferred`; the source's rows are 530px tall with their pictures, back to back). No
     numbered steps, no icon grids, no card outlines around rows. On phones each row stacks centred:
     headline (32px), paragraph, then picture.
     - **Feature tiles** (a compact alternative, `inferred`: for a short page or a section inside
       one): a grid of three (two on narrow, one on phones), each a 4rem tinted tile with 12px
       corners holding a 32px icon in green or sky, a 24px heading at 800 in ink, sentence case, and
       one muted sentence; left-aligned, no outline.
  5. **The closing call:** a centred 62px display headline (32 on phones) and **the same green
     action again**, with the same words, about 20rem wide. This is the one repeat the page allows.
  6. **The footer:** a brand-green band with the link columns in the dark ink (`--m-color-brand-fg`,
     8:1), headings at 800 and links at 500. The source sets white text on its green footer (2.1:1);
     Marigold uses the dark ink (`inferred`, for contrast).
- **Public pages, every one:**
  - **Width:** 66rem for the top bar, sections and footer; text inside a section at most 30rem
    (landing) or 42rem (reading) (`observed`: the source's sections measure 988–1077px, its post
    column 680px).
  - **Rhythm:** sections 96px apart at wide and narrow widths
    (`calc(var(--m-space-12) * 2)`), 64px (`--m-space-16`) on phones, separated by space, not lines;
    a 2px line only before "more" lists and the reading footer (`observed`: 96px section padding on
    the front page).
  - **Phones:** one column, 16px gutters (`m-container`'s padding), everything centred except prose;
    display headlines 32px; button pairs stack at full width, green first; the top bar keeps the
    wordmark and its one button, and its links give way (the navbar's link row shrinks to nothing).
    `observed` on the source's front page and blog post at 390px, except that the blog post also
    moves its lead picture above the headline and sets the headline in ink at sentence case;
    Marigold keeps one order and one headline style (questions.md, 5).
- **Pictures.** Marigold ships no pictures of its own (`told`: the design-language playbook's rule,
  never copy images or illustrations), but the source's reading and landing pages are built around
  them (`observed`). A product's **own** pictures (its screenshots, its illustrations, a
  person's own photo) go in four slots only, and nowhere else:
  - the **reading lead picture:** 3:2, the column's full width, 32px corners
    (`calc(var(--m-radius-lg) * 2)`; source 30px), no outline, no caption;
  - **screenshots in a post:** the product's screen at its own ratio, in a 2px grey frame with 16px
    corners on the pale well, at most 12rem wide, two side by side, with an optional caption under
    them: 15px, muted, centred, one sentence (the source shows no captions; `inferred`);
  - **picture links** ("More guides"): 3:2, 16px corners, no outline (source 24px);
  - **a landing feature row's picture:** 1:1, no corners or frame needed, up to 30rem.
  When there's no picture, the slot keeps its ratio and corners and draws the **stand-in:** the
  green or sky pale tint with one icon centred in its tone (56px in a lead picture, 40px in a picture
  link), as the `reading` recipe does. App screens never lead with a picture; they use an icon in a
  pale circle.

### Signature moves

Each is `observed` (measured by the probe, or read from the source's computed styles), `inferred`, or
`told`. Numbers are from the fingerprint (source: 17 public screens at three widths; Marigold: the
nine recipes at three widths).

1. **Everything pressable stands on a lip.** A darker 4px band under buttons, tiles and banners that
   disappears when pressed. Tiles draw it as a thicker bottom border (2px sides, 4px bottom, 16px
   corners): `observed` on every tile in the first window of the source's two public tile grids (28
   of 28).
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
6. **Big, heavy, lowercase headlines on public pages,** in the display face and the text green;
   a headline in ink is sentence case. `observed`: lowercase on 3 of the 7 studied marketing
   screens' first windows and on all 8 display headlines of the front page and a blog post; the
   colour is the language's contrast fix (the source uses its bright green, 2.1:1)
7. **Few sizes, one big jump.** At most four text sizes a screen (source 2 to 5, typically 3;
   Marigold 3 to 4, 5 only where avatars show initials), and the largest is about twice the body on
   app and reading screens (source 1.0 to 2.9, typically 1.9; Marigold 1.9 to 2.1, 3.65 on the wide
   pricing page, 1.9 on phones). `observed`

### How a screen is assembled

- **What it opens with.** App screens: the side column, then a heavy title (or the green unit banner)
  at the top of a centred column about 38rem wide, with a right column of outlined cards beside it.
  Flows: a close button and the progress bar, nothing else. Public pages: a 70px white header with
  the wordmark and one white button. Account screens: a close button and one white button. (See The
  two families.)
- **Reading order.** The title, then the one thing the screen is for, then its action. The right
  column (stats, goals, a person's card) is read second and is never needed to finish the job.
- **How much one screen does.** One job and **one green action in any window**: never two green
  buttons visible together, and never two different green actions on one page. A long public page
  may repeat its one action, same words and destination, at its close, a window or more below the
  first (`observed`: the source's front page shows its green action in the hero and again under the
  closing headline, 5,900px apart). The path's done steps and progress bars are green but aren't
  actions. Secondary actions are white buttons or blue uppercase links.
- **When narrow.** The right column drops below the main column; button groups stack at full width,
  primary first (or last in a footer); grids of tiles go from four across to two (the source's
  tile grids measure 4 columns wide and 2 on phones).
- **Too much content.** Lists and rankings scroll in place; there's no pagination in the app. Long
  prose sits in the 42rem column (the source's text pages measure 340 to 830px of text width,
  typically 630px; its blog column 680px).
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
| Use green for the one action and for progress | Two green buttons in one window, or two different green actions on a page |
| Use the sky tint and blue outline for what's selected | Show selection with colour alone or a tick alone |
| Set buttons, tabs and labels uppercase at 800 | Uppercase headings or body text |
| Set public display headlines lowercase at 800 in the text green | The bright brand green as text, Title Case headlines, or display type in grey |
| Use the product's own pictures in the four picture slots, or the tinted stand-in | Stock photos, drawn characters, or a picture leading an app screen |
| Label every field above it; mark the optional ones | Placeholders as labels, or a red asterisk |
| Use rounded heavy icons, coloured for stats | Thin-stroke icons, or mixed icon sets |
| Cheer people on in the copy | Blame, codes, or exclamation marks on errors |
