# Harbor

Category: social and messaging. A messenger on the desktop: near-black ink on white, warm off-white
panels, one fresh green for the action that matters, pill buttons and filter chips, round avatars,
and the conversation on a warm wallpaper with tailed bubbles (pale green for yours, white for theirs),
small timestamps and blue read ticks. Dark mode is a neutral near-black with a deep green bubble. For
messaging, chat, community and support apps that should feel familiar from the first minute.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `harbor` preset of `@mariachi/design` (`data-theme="harbor"`,
`themes/harbor.css`).

## Principles

- **Familiar first.** The window is a rail of icons, a list of conversations and the open
  conversation, side by side. People should know where everything is without being told.
- **Conversation is the content.** Messages sit in bubbles on a warm wallpaper; everything else is
  white, warm grey and ink, and steps back.
- **One green, used sparingly.** The green fills the primary pill, the selected chip's tint, unread
  counts and your own bubbles' pale tint. Everything else is ink and grey. Blue only means *read*.
- **Flat and round.** No borders around panels: white areas sit on the warm grey. Buttons, chips,
  search fields and unread counts are pills; avatars are circles; bubbles have 8px corners and a
  tail.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| List, header, menus | white `#ffffff` | `#161717`; menus and dialogs `#1d1f1f` |
| Rail, wallpaper, quiet panels | warm off-white `#f7f5f3` | `#1d1f1f` |
| Text: default, muted, subtle | `#0a0a0a`, `#666666` (ink at 60%), `#737576` | `#fafafa`, `#a2a3a3`, `#959393` |
| Dividers | `#e6e6e6` (ink at 10%); lighter `#f2f2f2` | `#2d2e2e`; `#222323` |
| Control outline | `#959393` | `#757778` |
| Green (actions) | `#1daa61`, near-black text on it; links `#197f50` | `#21c063`; text `#21c063` |
| Pale green (your bubbles, selected chip) | `#d9fdd3` | `#144d37` bubbles, `#103529` chips |
| Signature green (logo, unread counts) | `#25d366` | `#25d366` |
| Read ticks | blue `#007bfc` | `#53bdeb` |
| Hover and current rows | warm grey `#f6f5f4`, current `#f0eeec` | `#2d2e2e`, current `#343535` |

- **Radius.** 8px for bubbles, tooltips and small tiles; 12px for fields, list rows and media; 16px
  for menus and banners; 24px for dialogs and cards. Buttons, chips, search, unread counts and
  avatars are fully round.
- **Shadow.** Almost none. Bubbles carry a one-pixel drop (`0 1px 0.5px`); menus a short double
  shadow; dialogs and toasts a long soft one. Panels never float: they are white on warm grey.
- **Motion.** 150, 200 and 450 ms. Panels and drawers ease out on `cubic-bezier(0.1, 0.82, 0.25, 1)`;
  fades take 200 ms. Nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 4px between bubbles in a run, 8–12px between runs;
  - 12px inside list rows, with 49px avatars;
  - 16–24px of padding in panels and settings groups;
  - 8px between white groups stacked on the warm grey.
- **Layout.**
  - A 64px rail of icons on the warm off-white.
  - The list column at about 30% (26.5rem), white, with a 22px title, a pill search and chips.
  - The main pane fills the rest: a white header bar over the wallpaper, the thread padded about 6%
    each side, the composer floating at the bottom.
  - Settings and details are white groups stacked on the warm grey, at most 45rem wide.
- **Density.** 1 by default. For dense lists, set `--m-density: 0.85`; controls and padding shrink
  together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Roboto (variable) for everything, at 400 for text and 500 for names, titles and
  buttons; panel titles ("Messages") at 600. Load `@fontsource-variable/roboto`. On a Mac the
  reference falls back to Helvetica Neue; the stack does the same after Roboto.
- **Mono.** Roboto Mono for codes and the small error codes; rarely seen.
- **Sizes:**
  - message text and rows 15px; names in rows 17px;
  - previews, labels and hints 13–15px in the muted grey;
  - timestamps inside bubbles 11px; times in rows 12px;
  - panel titles 22px at 600; dialog titles 22px medium;
  - large titles on empty panes 34px at 400; public pages 48px at 400.
- **Case.** Sentence case everywhere, including buttons, chips and the date pills ("Today").
- **Figures.** Times are 24-hour or short local times ("09:21", "Yesterday", "Tuesday"); unread counts
  are small figures in a green pill.

## Icons

- Lucide, outlined, **2px stroke**, round caps: 24px in the rail and headers, 20px in buttons, rows
  and settings, 16px beside small text (ticks, the lock, pins). Icons are muted grey; the current
  rail item and active controls are ink.
- Every settings row and rail item has an icon; list rows don't (the avatar leads).
- Read ticks are a double check: blue when read, grey when delivered; a single grey check when sent.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis-vertical` (vertical, in a round ghost button), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `send-horizontal`, refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Messengers rarely chart. When needed (a team's response times, storage), one series is the green
  as a 2px line or rounded bars; more series step through green, cobalt, purple, orange, teal and
  pink (the avatar hues).
- No gridlines; labels in muted 13px. Tooltips use the popover treatment.

## States (every control)

- **Hover.** Rows, menu items and ghost buttons take the warm grey (`#f6f5f4`, dark `#2d2e2e`). The
  primary pill darkens one step (`#1a9957`). Nothing lifts.
- **Focus.** A 2px green ring outside the control on keyboard focus only; inputs and the composer turn
  their outline green while typing. Never remove it.
- **Pressed.** One step darker again (`#199152`); rows `#ebe9e7`.
- **Disabled.** Half opacity; the cursor stays default. Say why nearby.
- **Error.**
  - The field's outline turns red (`#ea0038` family) and the message replaces the hint below it in
    red 13px.
  - A message that didn't send shows a red alert icon and "Not sent" under the bubble, with a retry.
- **Loading.**
  - A button keeps its width and label; `aria-busy="true"` swaps the label for a small green spinner.
  - Lists show round avatar skeletons with two text bars; a thread shows a centred green spinner
    only while it first loads.
- **Selected and current.** The current conversation and settings section take the warm grey with
  12px corners; the current rail icon sits in a round warm-grey disc; the selected chip is pale green
  with green text; checked controls are green.

## Components

All 36 of the library's components, as Harbor draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, nested for the window: a 64px rail beside a split of the 26.5rem list column and the
  main pane;
- `m-container`, for public pages (75rem) and settings (45rem);
- `m-grid`, for plan cards and media tiles, 16–24px gaps;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** Always a pill, weight 500, 40px by default, 32px (`sm`) in banners, 48px (`lg`) on
  public pages.
  - **Primary:** solid green, near-black text, one per view ("Continue", "Create group").
  - **Secondary** (the default): white with a grey outline and green text ("Cancel", "See
    everything"); on public pages the outline and text are ink.
  - **Ghost:** no fill, ink text or an icon; used for header and row actions.
  - **Danger:** solid red, white text, only to confirm something destructive.
  - **Icon-only:** a round ghost button, 40px, with an `aria-label`.
- **Input, textarea.** 40px, 12px corners, a grey outline (`#959393`) that turns green while typing.
  The search field is different: a pill on the warm off-white with no outline and a search icon.
- **Select.** The same box as an input, with a chevron.
- **Field.** The label above in muted 13px, the control, then the hint or the error below. Fields
  stack 20px apart.
- **Checkbox, radio.** 18px checkboxes with 4px corners and a 2px grey outline, green when checked
  with a dark tick; 20px radios, a green disc with a light dot when checked.
- **Switch.** A small pill: green with a white thumb when on (a dark thumb in dark mode), grey when
  off. It takes effect at once.

**Navigation**
- **Sidebar.** Two uses.
  - The **rail**: 64px on the warm off-white, icons only, 40px round hit areas; the current one on a
    warm-grey disc; an unread count as a small green pill on the corner. Settings and your avatar sit
    at the bottom.
  - The **list column**: 26.5rem, white, a hairline edge. A 22px title at 600 with icon buttons, the
    pill search, chips, then rows: 17px label, 12px corners, the current row in warm grey, unread
    counts as green pills. In settings, rows lead with a 22px icon; sign-out comes last in red.
- **Navbar** (public pages). White, 72px, ink links at 15px weight 500, an outlined ink pill ("Sign
  in") and the signature-green pill with an ink outline ("Get the app") at the right.
- **Top bar** (in the app). The conversation header: white, a hairline below, the avatar, the name
  and a muted line (members or "online"), then round ghost icon buttons (video, call, search, more).
- **Tabs.**
  - **Pill** (the filter chips): 32px pills 8px apart, outlined in the hairline grey; the selected one
    pale green with green text.
  - **Underline:** green text and a 3px green line for the current tab (media, links, files).
- **Breadcrumb.** Rarely used; muted links with "›" between. Prefer a back arrow in the header.
- **Pagination.** Round pills, the current one pale green. Lists prefer endless scroll.

**Data and content**
- **Table.** Lists, not grids: no frame, no header fill, sentence-case muted headers, hairlines
  between rows, the warm hover. Lead each row with a round avatar when it's a person.
- **Card.** White, 24px corners, a hairline, no shadow. The outline variant draws a 1px ink line
  (the public pages' cards); the sunken one is the warm off-white. Plan cards add the soft long
  shadow.
- **Badge.** A 22px pill at 12px weight 500: faint grey for labels, pale green for good news, red
  tint for problems. Unread counts are the sidebar's green pill, not badges.
- **Avatar.** Round. 28px in the rail, 40px in headers, 49px in list rows, 200px on a profile.
  Without a photo: initials in dark green on the pale green.
- **Divider.** A hairline; in lists it starts after the avatar.
- **Accordion.** A white box with 16px corners and hairlines between rows, the question at 17px,
  a chevron on the right, the warm hover.
- **Code, kbd.** Roboto Mono 13px on the warm off-white with 12px corners; keys are small rounded
  boxes with a hairline.
- **Prose.** 15px with a 1.5 line height, links in the green text colour.
- **Progress.** A thin 4px bar, green on a grey track; the start page's loading bar.
- **Meter.** The same bar; it turns red past the "high" mark.
- **Usage.** A label and amount over a thin bar (storage used).

**Feedback and overlays**
- **Alert.** A banner at the top of the list: a pale tint, 16px corners, no border, a 20px icon, a
  medium title and one line. "You're offline" is the warning tint; a failed form is the red tint.
- **Toast.** The snackbar: dark ink (`#242626`), white text, 12px corners, bottom left, one action in
  the signature green ("Undo", "Choose another").
- **Dialog.** White, 24px corners, no border, the long soft shadow over black at 32%. Title 22px
  medium, body muted, pills at the bottom right: the primary last, Cancel as secondary.
- **Popover and menu.** White, 16px corners, the menu shadow, 8px inner padding; 40px rows at 15px
  that take the warm grey on hover; a destructive item in red at the bottom.
- **Tooltip.** Dark ink with white 13px text, 8px corners, after 300ms.
- **Spinner.** A 3px green ring.
- **Skeleton.** Round avatar blocks and text bars in `#f2f2f2` with a soft shimmer.

**AI and chat**
- **Chat.** The thread.
  - Bubbles with 8px corners and a 1px drop, 6px by 9px padding, at most 65% wide.
  - Yours on the right in pale green (`#d9fdd3`, dark `#144d37`); theirs on the left in white (dark
    `#242626`). The first bubble in a run has a tail at its top outer corner, and that corner is
    square.
  - In groups, the sender's name tops their first bubble in green 13px.
  - The time (11px muted) and ticks sit inside the bubble at the bottom right.
  - Date pills ("Today") and notices sit centred in small white or pale-yellow pills.
  - A quoted reply sits inside the bubble: a warm grey box with a 4px green bar and the original
    sender in green.
- **Composer.** A white pill-ended box (24px corners) floating over the wallpaper, a grey outline
  that turns green while typing; attach and emoji as round ghost icons on the left, the microphone
  on the right, which becomes a round green send button once there is text.
- **Thinking.** A muted "typing…" line under the header name, or three soft dots in a white bubble.
- **Tool call.** A bordered row with 12px corners, the name and a status badge.
- **Citation.** A small round grey pill with a number; the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the outline turns red and the message replaces the hint. Validate on blur and on
  submit, never while someone is typing.
- **In a form:** a red-tint banner above the form says what wasn't done ("The group wasn't created")
  and how many things to fix. Each field shows its own message.
- **A message that didn't send:** a red alert icon and "Not sent" under the bubble, with "Tap to try
  again". Never drop the message.
- **Connection:** a warning-tint banner at the top of the list ("You're offline") with a retry link;
  messages queue with a clock instead of ticks.
- **Somewhere else:** a snackbar with what happened and one action.
- **A whole page:** centred on a white panel: a round grey disc with a 36px outline icon, the code in
  small mono, a 27px title at 400, one sentence and one or two pills.
  - **404:** "This chat isn't here" with Back to messages.
  - **500:** "Something went wrong on our side" and "Your messages are safe", with Try again.
  - **403:** "You can't open this group" with Ask to join.
- **Words.** Say what happened, whether anything was lost, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard (the home screen).**
  - The rail, then the list column: "Messages" in 22px at 600 with new-message and menu buttons, the
    pill search, chips (the selected one pale green), conversation rows with 49px avatars, the time,
    a preview with ticks, and green unread counts.
  - The open conversation: the white header, the warm wallpaper with date pills, a notice pill and
    runs of tailed bubbles, then the floating composer.
- **List and detail.** People grouped under green letters in the list column; the person's details as
  white groups on the warm grey: a 200px avatar, the name and number, call tiles, about, files,
  settings rows with chevrons, then red block, report and delete rows.
- **Onboarding.** The public start page: warm off-white, an app card and a setup card, both white with
  an ink outline and 24px corners; numbered steps in outlined circles joined by a line, the form
  beside them, and underlined links with a green underline.
- **Settings.** Sections with 22px icons in the list column (profile row on top); the open section as
  white groups with green group titles, switch rows with a muted hint, a select, radios, and a red
  reset last.
- **Empty state.** An empty filter in the list column (a round icon, a medium line, one sentence, a
  secondary pill), and the main pane at rest: a large round pale-green icon, a 34px title at 400,
  one sentence, two pills, and the privacy line at the bottom.
- **Pricing.** The public site: the white navbar with pills, a pale green band with a 48px title, white
  plan cards on the warm grey with the popular one outlined in ink, full-width pills, questions
  below.
- **Errors.** The field, form, banner, unsent message, snackbar and full-page errors above, as one
  page.

## Words

- Short, warm and plain; sentence case: "New message", "Write a message", "Search names and
  messages".
- Times short and local ("09:21", "Yesterday"); no seconds.

## Do and don't

| Do | Don't |
| --- | --- |
| Put the list beside the conversation | Hide the list behind a menu on desktop |
| Keep panels flat: white on warm grey | Draw borders or shadows around panels |
| Make buttons, chips, search and counts pills | Square buttons or square chips |
| Give the first bubble in a run a tail | Tail every bubble, or none |
| Keep the time and ticks inside the bubble | Put timestamps outside bubbles |
| Use blue only for read ticks | Use blue for links or actions |
| Use near-black text on the green | Put white text on the light green |
| Use the same icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
