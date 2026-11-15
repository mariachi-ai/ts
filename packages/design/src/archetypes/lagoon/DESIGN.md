# Lagoon

Category: social and messaging. A system messenger on the desktop: near-black text on white, a light
grey sidebar of round faces, the thread in rounded bubbles (yours in the system blue with white
text, theirs in light grey) with a small tail on the last bubble of each run, centred timestamps, a
quiet "Delivered" or "Read" under the last message you sent, reactions perched on a bubble's top
corner, capsule buttons, round glass icon buttons and a capsule composer. Dark mode is a true dark:
a near-black thread, a dark grey sidebar and the same blue. For messaging, social and group apps
that should feel as native and familiar as the phone in your pocket.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the nine page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `lagoon` preset of `@mariachi/design` (`data-theme="lagoon"`,
`themes/lagoon.css`).

## Principles

- **Two panes, nothing else.** A sidebar of conversations beside the open one. No rail, no header
  bar across the window: controls float as round glass buttons at the thread's top corners.
- **The conversation is the colour.** The window is white and light grey; the blue belongs to your
  own bubbles, the one primary action and the current row. Their bubbles are a flat light grey.
- **Round everything you touch.** Buttons, search, the composer and segmented controls are capsules;
  avatars and icon buttons are circles; bubbles are rounded to 18px with a tail. Lists and settings
  are grouped cards with 20px corners on the grouped grey.
- **Quiet chrome.** Timestamps, receipts, sender names and previews are small and grey. Panels never
  carry borders; separators are inset hairlines that start where the text starts.
- **Glass, drawn opaque.** Where the reference uses translucent glass (the sidebar, toolbars, round
  buttons, the name capsule, menus), Lagoon draws a solid fill with a hairline ring and a soft
  shadow. Never blur.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Thread, page | white `#ffffff` | `#1e1e1e` |
| Sidebar (glass, opaque) | `#efeff0` | `#262628` |
| Grouped background (settings, details) | `#f2f2f7` | `#141415` |
| Raised (menus, round buttons, cards in dark) | white | `#2c2c2e` |
| Text: default, muted, subtle | `#191919`, `#646469`, `#737378` | `#ffffff`, `#a1a1a6`, `#9a9a9f` |
| Separators | `#e5e5e5`; lighter `#f0f0f0` | `#3a3a3c`; `#2c2c2e` |
| Control edges | the system grey `#8e8e93` | `#7c7c80` |
| Blue (your bubbles, primary, current row) | `#0076de`, white text | `#0077d6`, white text |
| Blue text (links) | `#0069c9` | `#5cb8ff` |
| Their bubbles | `#e9e9eb` | `#3a3a3c` |
| Green (switches, success) | switch `#248a3d`; solid `#34c759` with black text | `#1f9a43`; `#30d158` |
| Red (failed, destructive) | `#e9152d` solid; `#d1001c` text | `#e9152d`; `#ff6165` |

- **Radius.** 6px small, 10px for rows and fields, 12px menus, 14px notices, 18px bubbles and the
  composer, 20px grouped cards, 24px sheets. Buttons, search fields, segmented controls and badges
  are capsules; avatars and icon buttons are circles.
- **Shadow.** Round glass buttons, the name capsule and the selected segment carry a hairline ring
  and a 3px drop (`0 0 0 0.5px` black at 6%, `0 1px 3px` at 10%). Menus and sheets carry a longer
  soft shadow. Bubbles and panels carry none.
- **Motion.** 150, 250 and 400 ms on `cubic-bezier(0.25, 0.1, 0.25, 1)`; sheets and menus open on
  `cubic-bezier(0.32, 0.72, 0, 1)`, quick out and soft in. Nothing bounces on the web.
- **Spacing.** A 4px unit. The usual gaps are:
  - 2px between bubbles in a run, 8px before a new sender, 16px around a timestamp;
  - 8–12px of padding in the sidebar, 10px rounded rows;
  - 16px inside grouped cards, 44px minimum row height, 24px between groups.
- **Layout.**
  - The sidebar is 19rem: the wordmark and two round buttons, the capsule search, a segmented
    control, a three-column grid of pinned circles, then the conversation rows.
  - The thread fills the rest: round glass buttons at the top corners and the person's circle over
    a name capsule in the middle; bubbles padded about 4% each side; the composer at the bottom.
  - Settings and details sit on the grouped grey, 30–40rem wide, centred.
- **Density.** 1 by default. For dense lists, set `--m-density: 0.85`; controls and padding shrink
  together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** The reference uses its platform's system face. Lagoon uses **Inter** (variable,
  `@fontsource-variable/inter`) as the open stand-in, then falls back to `system-ui`. Text tracks a
  little tight, as the system face does (−0.01em for text, −0.022em for titles).
- **Mono.** JetBrains Mono (`@fontsource-variable/jetbrains-mono`) for codes; rarely seen.
- **Sizes** (the phone's text styles, which the desktop window shares at its larger setting):
  - message text 15px; names and previews in rows 13px; times, sender names and receipts 11px;
  - section titles 17px bold; empty-state titles 22px bold; details names 28px bold;
  - large page titles 34px bold, tight.
- **Weights.** 400 for text; 600 for the first word of a receipt and the day in a timestamp; 700
  for names in rows and for titles. Buttons are 500.
- **Case.** Sentence case everywhere. Timestamps read "**Today** 9:40 AM"; receipts read
  "**Delivered**" or "**Read** 9:42 AM".

## Icons

- Lucide, outlined, **1.75px stroke**, round caps (the reference's regular-weight symbols): 18px in
  the round glass, grey and pale blue buttons, 16px beside small text and in the composer's send
  arrow, 15px inside settings tiles, 22px for the red not-sent mark, 44–64px for empty and error
  states (at 1.25–1.5px). No 24–40px feature glyphs.
- Icons are ink in round glass and grey buttons, blue in the pale blue round buttons and in checks,
  grey for empty states.
- Settings sections lead with a white glyph on a small coloured rounded-square tile (red, blue,
  orange, green or grey).
- **The same icon for the same action, every time:**
  - add `plus`, edit `square-pen` (also "new chat"), delete `trash`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis`, close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `arrow-down-to-line`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up` (in a blue circle), refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Messengers rarely chart. When needed (storage, activity), one series is the system blue as a 2px
  line or rounded bars; more series step through blue, green, orange, purple, cyan and pink, the
  system colours in their usual order.
- No gridlines; labels in muted 11–13px. Tooltips use the popover treatment.

## States (every control)

- **Hover.** Sidebar rows take a slightly darker grey (`#e4e4e6`); menu rows fill with the blue and
  turn white; secondary capsules darken one step. Nothing lifts.
- **Focus.** A 3px blue ring just outside the control on keyboard focus only. Never remove it.
- **Pressed.** One step darker again (primary `#0060b6`).
- **Disabled.** Half opacity; the cursor stays default. Say why nearby.
- **Error.**
  - The field's edge turns red and the message replaces the hint below it in red 13px.
  - A message that didn't send shows a red circled exclamation beside the bubble and "Not sent."
    under it, with a way to try again.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a small spinner.
  - Lists show round avatar skeletons with two bars; someone typing shows three grey dots in a grey
    bubble with a tail.
- **Selected and current.** The current conversation row and the current pinned circle sit in solid
  blue with white text; the current settings section is the same. The selected segment is a raised
  white capsule on the grey track. Checked controls are blue; switches are green.

## Components

All 36 of the library's components, as Lagoon draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split` for the window: the 19rem sidebar beside the main pane, no gap;
- `m-container` for public pages (68rem) and narrow centred columns (30–40rem) for settings and
  details;
- `m-grid` for plan cards and member circles;
- `m-stack` and `m-cluster` for everything inside.

**Actions and forms**
- **Button.** Always a capsule, weight 500, 34px by default, 28px (`sm`), 44px (`lg`) for the one
  big action on a sheet.
  - **Primary:** solid blue, white text, one per view ("Continue", "Make group").
  - **Secondary** (the default): a light grey capsule (`#ececee`) with ink text ("Cancel").
  - **Ghost:** no fill, blue text ("Sign in", "Set up later").
  - **Danger:** solid red, white text, only to confirm something destructive.
  - **Icon-only:** a 36px round glass button: white, a hairline ring and a soft drop.
- **Input, textarea.** 34px, 10px corners, a grey edge that turns blue on focus. Search is
  different: a capsule on the raised white, no edge, a soft drop and a search glyph.
- **Select.** The same box as an input, with a chevron.
- **Field.** The label above in muted 13px, the control, then the hint or the error below. In
  grouped cards the label sits on the left of the row and the control on the right.
- **Checkbox, radio.** 16px; checkboxes with 5px corners; blue when checked with a white tick or
  dot.
- **Switch.** The long capsule: green with a white thumb when on, grey when off. It takes effect at
  once.

**Navigation**
- **Sidebar.** The conversation list on the grey glass (opaque).
  - Top: the wordmark, then round glass buttons (filter, new chat); the capsule search; a
    segmented control for the app's own sections.
  - Pinned circles: three to a row, 64px avatars with a soft drop and the name in 11px below; the
    current one sits in a blue rounded square with white text.
  - Rows: an unread blue dot in the margin, a 40px avatar, the name in 13px bold with the time
    at the right in 11px grey, then a two-line grey preview; inset hairlines between rows; the
    current row solid blue with white text, 10px corners.
  - In settings, rows lead with a coloured 24px tile.
- **Navbar** (public pages). The toolbar drawn opaque on the page colour, no rule below: the
  wordmark, grey links that take a grey capsule when current, a ghost "Sign in" and a blue capsule.
- **Top bar** (in the app). Not a bar: round glass buttons float at the thread's top corners, and
  the person's circle sits over a raised name capsule with a small chevron in the middle.
- **Tabs.**
  - **Pill** (the segmented control): a grey capsule track, 2px inset, the current segment a raised
    white capsule with a soft drop; text 13px medium.
  - **Underline:** rare; a 2px blue line under the current tab.
- **Breadcrumb.** Rare; grey links with "›". Prefer back and forward round buttons.
- **Pagination.** Capsules with blue text; the current page solid blue.

**Data and content**
- **Table.** A list, not a grid: no frame, no header fill, 13px semibold grey headers, hairlines
  between rows, a faint grey hover. Put it in a grouped card.
- **Card.** The grouped card: white on the grouped grey (`#2c2c2e` in dark), 20px corners, no
  border, a faint ring so it holds on white. Rows inside are 44px with inset separators; a small
  grey title sits above the card and a muted 11px footnote below. Menus inside rows are
  borderless: the grey value and a chevron at the right.
- **Badge.** A 20px capsule at 11px semibold: light grey for labels, tints for status.
- **Avatar.** A circle. 32px beside bubbles, 40px in rows, 56–64px pinned and in member grids, 88px
  on a details page. Without a photo: initials on a soft tint, or white on the system grey.
- **Divider.** An inset hairline that starts where the text starts.
- **Accordion.** A grouped card: white, 20px corners, the question at 17px, a chevron on the
  right, hairlines between rows.
- **Code, kbd.** JetBrains Mono 13px on the grouped grey with 10px corners; keys are small rounded
  boxes in the system face.
- **Prose.** 15px with a 1.47 line height, links in the blue text colour.
- **Progress.** A thin 4px capsule, blue on a light grey track.
- **Meter.** The same bar; orange then red near the limit.
- **Usage.** A label and amount over a 6px bar (storage used).

**Feedback and overlays**
- **Alert.** An inline notice: a pale tint, 14px corners, no border, an 18px icon, a semibold title
  and one line ("You're offline" in the orange tint, a failed form in the red tint).
- **Toast.** The notification banner: raised white, 20px corners, the long soft shadow; a semibold
  title, a grey line, one capsule action and a small close. It arrives at the top right of the
  window, under the round buttons, as the system's notifications do.
- **Dialog.** The sheet: the grouped grey, 24px corners, no border; the title 17px bold, fields in
  white, capsules at the bottom right with the primary last.
- **Popover and menu.** Raised white, 12px corners, the long soft shadow, 5px inside; 28px rows at
  15px with 7px corners that fill blue with white text on hover; hairline separators; a
  destructive item in red last.
- **Tooltip.** A small light label with a soft drop, 11px, after 600 ms.
- **Spinner.** A thin grey ring.
- **Skeleton.** Round avatar blocks and text bars in light grey with a soft shimmer.

**AI and chat**
- **Chat.** The thread.
  - Bubbles: 18px corners, 7px by 12px padding, at most 70% wide, no border, no shadow.
  - Yours on the right in the blue with white text; theirs on the left in light grey with ink.
  - Bubbles in a run sit 2px apart; only the last has a tail, a small hook at its bottom outer
    corner.
  - In groups, the sender's name sits above their first bubble in 11px grey, and a 32px avatar sits
    beside their last bubble.
  - Timestamps between runs, centred: "**Today** 9:40 AM" in 11px grey.
  - Receipts under the last message you sent, right-aligned: "**Delivered**", or "**Read** 9:42 AM".
  - Reactions: a 28px round bubble on the top outer corner (blue if yours, grey if theirs) with a
    trail of two dots, ringed in the page colour.
  - Someone typing: three grey dots in a grey bubble with a tail.
- **Composer.** A round glass add button, then the capsule field (18px corners, a grey edge, a
  short placeholder, a voice glyph at the right that becomes a blue round send arrow once there is
  text), then a round emoji button.
- **Thinking.** The typing bubble, or a muted line.
- **Tool call.** A grouped card row with 14px corners, the name and a status badge.
- **Citation.** A small round grey capsule with a number; the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns red and the message replaces the hint. Validate on blur and on
  submit, never while someone is typing.
- **In a form or sheet:** a red-tint notice above the fields says what wasn't done ("The group
  wasn't made") and how many things to fix.
- **A message that didn't send:** a red circled exclamation beside the bubble and "Not sent." under
  it, with a way to try again. Never drop the message.
- **Connection:** an orange-tint notice ("You're offline"); messages wait and send on reconnect.
- **Somewhere else:** a notification banner at the top right with what happened and one action.
- **A whole page:** a white grouped card, centred: a large grey outline glyph, the code in small
  mono, a 20px bold title, one grey sentence and one or two capsules.
  - **404:** "This chat isn't here" with Back to chats.
  - **500:** the service isn't responding and "your messages are safe", with Try again.
  - **403:** "You're not in this group" with Ask to join.
- **Words.** Say what happened, whether anything was lost, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

### The families

| | The window (dashboard, list and detail, settings, empty state, errors) | Sheets and flows (onboarding, sign-in) | Public pages (pricing, reading) |
| --- | --- | --- | --- |
| Frame | The 19rem grey sidebar beside the pane; no header bar: round glass buttons float at the pane's top corners, the person's circle over the name capsule in the middle. Empty and error pages keep it | No sidebar, no bar: the mark (sign-in) or the wordmark and the step (onboarding) above one column on the grouped grey | The opaque site bar on the page colour: the wordmark, four grey links (the current one in a grey capsule), a blue text "Sign in" and the one blue capsule |
| Column | The thread fills the pane, padded about 4%; details and settings are 30–40rem, centred on the grouped grey | 24–30rem, centred | Pricing to 68rem; an article 40rem under a 46rem help bar |
| Titles | 17px bold in a pane's header; 28px bold for a person or group; 22px bold for an empty state; 20px bold on a full-page error | 28px bold | 34px bold for an article (on 17px text, as the phone's large title over its body); a 36–48px headline for marketing |
| Text | Messages and settings rows 15px, conversation rows 13px, times and receipts 11px | 15px, footnotes 11px | 17px in an article; 15px on pricing |
| Buttons | Capsules; the one blue capsule or the current row is the only blue to press | One blue capsule: full width (sign-in) or last at the right (onboarding) | Capsules; the site bar's blue capsule and the suggested plan's |
| On a phone | A page reached from the list (details, a settings section, a thread with an error) comes first and the list follows below, as the phone pushes it; the home and empty search show the list | The column fills the width | The site bar keeps the wordmark and its two buttons; plans and the article stack to one column |

### Signature moves

1. **Blue is yours.** Your bubbles, the one blue capsule, the current row or pin, checks and links; their bubbles are a flat light grey, and nothing else is coloured but status and settings tiles.
2. **Tailed bubbles in runs.** 2px apart, a tail on the last of each run, the sender's name above the first and their circle beside the last, a centred "**Today** 9:40 AM" between runs and a quiet "**Delivered**" under your last.
3. **Round glass, no bar.** Controls float as 36px round buttons with a hairline ring and a soft drop; the pane never has a header bar with a rule.
4. **Circles for people.** Initials on soft tints: 40px in rows, 64px pinned, 88px on a details page or the setup sheet; the chosen one ringed in blue.
5. **Grouped cards on the grouped grey.** White, 20px corners, no border, 44px rows with hairlines inset to the text, a small grey title above and a muted 11px footnote below.
6. **Capsules for everything you press,** circles for icon buttons, with 18px glyphs in the glass, grey and pale blue ones.

### How a screen is assembled

- **It opens with** the frame: the sidebar (wordmark and two round buttons, the capsule search, then circles and rows) and the pane's floating round buttons. Sheets open with the large circle or the mark; public pages with the site bar.
- **Reading order:** the person or the title in the middle, then what they said or what you can set: bubbles top to bottom, or grouped cards in sections, each with its small grey title.
- **How much one screen does:** one conversation, one person or group, or one settings section. A details page is one centred column; settings never show two sections at once.
- **When narrow:** the sidebar narrows and the pane keeps its padding; at phone width the window becomes two screens (the list, and the page reached from it) and shows the one the recipe is about first.
- **Too much content:** the list scrolls under the pinned circles; long settings sections stay one column of grouped cards; a long thread scrolls with the composer fixed at the bottom.
- **None:** the frame stays; the pane or the list shows a large grey outline glyph, a 22px bold title and one sentence, with at most a blue capsule and a grey one.
- **Two families, one type system:** public pages keep the app's face, weights and capsules; only the site bar, the larger titles and the 17px article text change.

### The recipes

- **Dashboard (the window).** The sidebar (wordmark and round buttons, capsule search, segmented
  sections, pinned circles with the current one in blue, conversation rows with unread dots), and
  the thread: round glass buttons in the corners, the circle over the name capsule, timestamps,
  runs of grey and blue bubbles with tails, sender names and avatars, reactions, "Delivered", the
  typing bubble and the capsule composer.
- **List and detail.** The conversation list with the current row in solid blue, and the group's
  details on the grouped grey: a round close button and an "Edit" capsule, an 88px circle, a 28px
  bold name, round grey actions with ink glyphs, a segmented control, member circles with "Add",
  blue link rows, switch rows and a red "Leave" row in grouped cards. On a phone the details come
  first.
- **Onboarding.** The first step, your name and picture, as a raised sheet on the grouped grey: the
  wordmark and "Step 1 of 2" above it; an 88px circle, the 28px bold name, one muted line, three
  pale blue round buttons (photo, emoji, edit); a row of looks to choose, the chosen one ringed in
  blue, with a blue "More looks"; who to share them with as a grouped card of two rows with a blue
  check; then "Set up later" (grey) and "Continue" (blue) at the bottom right.
- **Settings.** The sidebar with a capsule search, the account row and sections with coloured tiles
  (the current one in blue); the open section as grouped cards with switch rows, menus and chevron
  rows, small grey titles above and footnotes below, and a red reset row. On a phone the section
  comes first.
- **Empty state.** A search with no results in the sidebar and the thread pane at rest, both drawn
  the same way: a large grey glyph, a 22px bold title, one sentence; the pane adds two capsules.
- **Pricing.** An invented product's plans: the site bar, a bold centred headline, a segmented
  control, three white cards on the grouped grey (the suggested one ringed in blue) with their
  features as 44px rows between inset hairlines, a comparison table in a grouped card and grouped
  questions.
- **Errors.** In the window: the offline notice at the top of the thread, the message that didn't
  send with its red mark and "Not sent.", and a banner at the top right; below the window, on the
  grouped grey, a sheet with field errors and the full-page errors (404, 500, no access).
- **Reading.** A public help article: the site bar; the help name and a capsule search over a
  hairline; a breadcrumb, a 34px bold title and 17px text; a sample thread in a grouped-grey card;
  numbered steps; sections between full hairlines with 22px bold headings; a tinted tip; "Was this
  page helpful?" with two capsules; a small grey footer.
- **Sign-in.** On the grouped grey: the blue mark, a 28px bold title and one muted line, one grouped
  card with the email and password rows (the label at the left, the field at the right), a footnote,
  a full-width blue capsule, and two blue text links.

## Words

- Short, friendly and plain; sentence case: "New chat", "Search", "Mute until tomorrow".
- Times short and local ("9:41 AM", "Yesterday", "Tuesday"); no seconds.

## Do and don't

| Do | Don't |
| --- | --- |
| Put the list beside the conversation | Hide the list behind a menu on desktop |
| Float round glass buttons at the thread's corners | Draw a header bar with a rule across the thread |
| Blue for your bubbles, grey for theirs | Tint their bubbles or add a second bubble colour for decoration |
| Tail only the last bubble in a run | Tail every bubble, or none |
| Put timestamps between runs and the receipt under your last message | Put a time inside every bubble |
| Make buttons, search, segments and the composer capsules | Square buttons or square fields |
| Draw glass as an opaque fill with a hairline ring | Blur, frost or make panels translucent |
| Use initials on tints for people | Use photos, illustrations or app-icon artwork |
