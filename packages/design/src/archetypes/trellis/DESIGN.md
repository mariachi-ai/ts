# Trellis

Category: social. Work messaging: a deep aubergine frame (the top bar and the icon rail) around a
white conversation panel with rounded corners; a plum channel list with Bold unread rows, red
mention counts and a blue current row; flat message rows beside rounded-square faces; reactions as
small chips; replies under a message; a composer with a formatting bar and one green send. For apps
where teams talk in channels and threads: team chat, operations rooms, support desks and any
workplace tool built around conversations.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `trellis` preset of `@mariachi/design` (`data-theme="trellis"`,
`themes/trellis.css`). Light is the home mode; dark keeps the same aubergine frame around a
charcoal panel.

## Principles

- **A coloured frame, a white page.** The aubergine wraps the app: the top bar with search, the icon
  rail and, a step lighter, the channel list. Everything people read and write sits on one white
  panel with 8px corners, inset 4px from the frame's right and bottom edges.
- **Three colours with three jobs.** Green (`#007a5a`) is for sending and the one primary action.
  Blue (`#1264a3`) is for links, the current row, checked controls, your own reactions and
  selection. Red (`#e01e5a`) is for mentions, the new-messages line and danger. Nothing else is
  coloured.
- **Bold means unread.** In the channel list a room with something new turns white and Bold; a red
  pill counts mentions. Names and titles are Lato Black; what people say is regular.
- **Flat rows, not bubbles.** A message is a row: a 36px rounded-square face, the name and a muted
  time on one line, the text under it with no gap. Rows take a faint grey on hover; a message that
  mentions you sits on yellow with a yellow bar.
- **People are rounded squares.** Faces have corners about a fifth of their size (8px at 36px, 4px
  at 20px). Only presence dots and reaction chips are round.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Frame: top bar and icon rail (brand) | `#3f0e40` | `#3f0e40` |
| Channel list | `#4a154b` | `#2c0f2e` |
| Conversation panel (canvas) | `#ffffff` | `#1a1d21` |
| Dialogs, thread pane, menus (surface, raised) | `#ffffff` | `#222529` |
| Row hover, add-reaction chip, wells (sunken) | `#f8f8f8` | `#16181b` |
| Text: default, muted, subtle | `#1d1c1d`, `#616061`, `#737273` | `#d1d2d3`, `#ababad`, `#9a9b9e` |
| Channel rows at rest | `#d6c9d6` on the plum | `#cbbdcc` |
| Hairlines | the ink at 13%: `#dddddd` | `#35373b` |
| Control edges | `#868686` | `#7c7e82` |
| Send and primary (accent) | `#007a5a`, hover `#148567` | `#00845f`, hover `#148567` |
| Highlight blue (links, current row, checked) | `#1264a3`; tint `#e8f5fa` | `#1d9bd1`; tint `#14293a` |
| Mention count, new-messages line | `#cd2553`, `#e01e5a` | the same |
| Mention of you | yellow `#fef7e0` with a `#ecb22e` bar | `#332a14` with the same bar |
| Presence | active `#007a5a` dot; away a hollow ring | `#007a5a` |

- **Radius.** 4px for badges, code and checkboxes; 6px for channel rows and tooltips; 8px for
  buttons, inputs, the composer, menus and the main panel; 12px for dialogs, attachment cards and
  large faces. Reaction chips and presence dots are round.
- **Shadow.** Floating things carry a 1px ink ring at 13% plus a short drop: `0 4px 12px` at 12% for
  menus and toasts, `0 18px 48px` at 35% for dialogs. Cards inside messages have a hairline and no
  shadow.
- **Motion.** Quick: 80ms for hover, 150ms for opening, 250ms for panes, on one ease-out curve. No
  bounce.
- **Spacing.** A 4px unit. The usual gaps are:
  - 0 between channel rows (each row is 28px), 4px between reaction chips;
  - 8px between a face and its name, and above and below each message row;
  - 20px of side padding in the conversation and the panes;
  - 24px between settings sections.
- **Layout.**
  - A 44px top bar with back, forward, recent and a centred search on a light veil of white.
  - A 72px icon rail: the workspace tile, then tabs as a 36px icon tile with a 12px label under it;
    the current tab's tile takes a white veil; a round "+" and your face at the foot.
  - A 260px channel list, the conversation, and a 350–400px thread or profile pane, all on the
    white panel.
  - A room header: the `#` and name in Black 18px with a chevron, a member stack button and a
    kebab on the right, and icon tabs under it on a hairline.
- **Density.** 1 by default. For compact lists set `--m-density: 0.85`; controls and padding shrink
  together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. On the
aubergine, draw lighter tiles with a white layer at 15–22% opacity rather than a new colour. The
exact scales are in the reference at the end.

## Type

- **Families.** Lato for everything in the app (regular 400, Bold 700, Black 900). Red Hat Display
  (variable) at 700 for marketing headlines only.
- **Mono.** Fira Mono for code blocks and inline code.
- **Sizes:**
  - messages, buttons, rows and body 15px with a 22px line (1.46668);
  - secondary text, tabs and hints 13px;
  - timestamps, badges and rail labels 12px (badges 11px capitals);
  - room titles and pane titles 18px Black; dialog titles 22px Black;
  - onboarding questions 50px Black; full-page errors 32px Black with a small negative track;
  - marketing headlines 50px and section titles 32px in the display face.
- **Case.** Sentence case everywhere in the app. Capitals only for small tags ("NEW", "APP") and
  for marketing buttons, which are tracked out.
- **Names.** A person's name in a message is 15px Black at full strength; the time beside it is 12px
  muted.

## Icons

- Lucide, outlined, **1.5px stroke**, rounded ends: 18px in the channel list, room header and
  panes; 16px in buttons, the composer and menus; 20px in the rail; 44px in empty states.
- Every channel row starts with its type: `#` for an open room, a lock for a private one, a face for
  a person.
- Icon buttons are ghost buttons: they gain a faint ink fill on hover.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis-vertical`, close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send-horizontal`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** the aubergine, as bars with 4px top corners or a 2px line.
- **More series** step through aubergine, sky blue, green, yellow and red: the brand's bright notes.
- Gridlines are hairlines; labels are 12px muted. Tooltips are the black tooltip.

## States (every control)

- **Hover.** Message rows and list rows take `#f8f8f8`; ghost buttons a faint ink fill; secondary
  buttons a grey fill and a soft drop shadow. Channel rows go to the darker plum (`#350d36`) with
  white text. Menu rows fill blue with white text. Nothing moves.
- **Focus.** A blue ring outside the control (`--m-color-border-focus`), and a blue edge on an active
  text field. Never remove either.
- **Pressed.** One step darker: the primary `#006e51`, secondary a stronger grey.
- **Disabled.** Lower opacity, no pointer events. Say why nearby when it isn't obvious.
- **Selected and current.** The current channel or preferences row is filled blue (`#1164a3` /
  `#1264a3`) with white text. A chosen option card gets a 2px blue edge. Selected table rows take
  the blue tint.
- **Unread.** The row turns white and Black; mentions add the red count pill. The new-messages line
  is red with a red "New" tag at its end.
- **Error.** The field's edge turns red and the message sits under it in red 13px after an alert
  icon. A message that failed to send sits on the red tint with Try again and delete links.
- **Loading.** A button keeps its size and shows a spinner (`aria-busy="true"`). Lists show skeleton
  rows: a rounded square and two bars in faint ink.

## Components

All 36 of the library's components, as Trellis draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split` for a list beside a page (260px);
- `m-container`, the content column: 75rem, 45rem for forms and settings;
- `m-grid` for cards and fields, 16px gaps;
- `m-stack` and `m-cluster` for everything inside.

**Actions and forms**
- **Button.** 8px corners, Lato Bold 15px, 36px by default and 28px (`sm`) in bars and rows.
  - **Primary:** green with white text: Send, Next, Create. One per view.
  - **Secondary** (the default): white with a 30% ink edge and near-black text; a grey fill and a
    soft drop on hover. Message, Invite and Cancel are secondary.
  - **Ghost:** no fill until hover; for icon buttons in bars, the composer tools and quiet links.
  - **Danger:** solid red with white text, for the destructive confirm.
  - **Split send:** the primary send icon joined to a narrow chevron for scheduling.
  - **Marketing:** capitals, tracked out, 4px corners, in the brand colour (filled or outlined).
- **Input, textarea.** 40px, 8px corners, white, 15px text, a control-strength grey edge that turns
  blue with a blue ring when active.
- **Select.** The same box as an input with a chevron.
- **Field.** The label above in 15px Bold; help in 13px muted below; the error replaces the help in
  red with an alert icon.
- **Checkbox, radio.** 18px; checkboxes have 4px corners. A grey edge at rest, blue with a white
  mark when checked.
- **Switch.** 36 × 20, a white knob; green when on, grey when off. Takes effect at once.

**Navigation**
- **Sidebar.** The channel list.
  - On the plum, 260px, 8px padding; the workspace name in 18px Black with a chevron and two ghost
    icons on its row.
  - Rows are 28px, 15px regular, with an 18px icon and 6px corners. At rest they are a dimmed
    white; hover darkens the plum; the current row is filled blue with white text.
  - Section headings are the same 15px dimmed white, sentence case, with a chevron before them, and
    end with an "Add …" row behind a small veiled plus.
  - Mention counts are red pills with a white Black number pushed to the end.
  - In preferences the same list sits on white: near-black rows, a grey hover, the blue current row.
- **Navbar** (public pages). White with a hairline: the wordmark on the left, links in 15px, then
  "Sign in" and two capitals buttons in the brand colour.
- **Top bar** (in the app). The 44px aubergine bar: back, forward and recent as white ghost icons,
  the search field (13px white text on a veil) centred and as wide as 38rem, help on the right.
- **Tabs.**
  - **Underline:** the room tabs; 13px Bold with an icon, muted; the current tab at full strength
    over a 2px plum line, on a hairline.
  - **Pill:** filters in a view's bar ("For you", "Sent"); the current one takes the blue tint and a
    blue edge.
- **Breadcrumb.** Rare; a back arrow in the top bar does the job. When used, muted links with a
  chevron between and the current page at full strength.
- **Pagination.** Lists prefer "Show more" in blue or endless scroll; numbered pages are 28px ghost
  squares with the current one filled blue.

**Data and content**
- **Table.** For directories and admin lists.
  - Inside a hairline frame with 8px corners; no header fill.
  - Headers 13px Bold, muted, sentence case. Cells 15px with muted secondary columns.
  - Rows separated by hairlines, `#f8f8f8` on hover, the blue tint when selected.
  - People get a 36px rounded-square face with presence, the name in Black and the role under it.
- **Card.** Attachments and app cards: white, a hairline, 12px corners, no shadow, 12–16px padding.
  A file card is a coloured icon tile, the name in Black and the kind in muted text.
- **Badge.** 11px Bold capitals with 4px corners: neutral grey ("APP" beside an app's name), the
  blue tint ("NEW"), tones for status, the brand colour solid.
- **Avatar.** Rounded squares, initials in white on a colour: 20px in the channel list, 24px in
  reply stacks, 36px beside messages and in tables, 240px on a profile. Presence is a 10px dot at
  the lower right: green when active, a hollow grey ring when away, with a ring of the background.
- **Divider.** A hairline. The date divider is a hairline with a white pill on it: the day in 13px
  Black and a chevron. The new-messages divider is red with "New".
- **Accordion.** Rows with hairlines in an 8px frame, the question in Bold, a chevron on the right.
- **Code, kbd.** Fira Mono. Blocks on `#f8f8f8` with a 13% hairline and 4px corners; inline code is
  red on a faint grey with 3px corners. Keys are white chips with an edge and a 1px bottom shadow.
- **Prose.** 15px with a 22px line. Links are the blue; quotes have a 4px grey bar.
- **Progress.** An 8px round bar: blue on a light grey track.
- **Meter.** The same bar; red past the high mark.
- **Usage.** A label and amount over the same bar.

**Feedback and overlays**
- **Alert.** A banner: the tone's tint, no edge, 8px corners, 12 × 16px padding, a 20px tone icon,
  the title in Bold. The yellow banner says who is outside your workspace or that you are offline.
- **Toast.** White with the menu shadow, 8px corners, 22rem wide; a tone icon before the Bold
  title, one action, and a close button.
- **Dialog.** White, 12px corners, the deep shadow over a 50% black scrim (70% in dark). The title
  22px Black on a row with the close button and a hairline under it; actions at the bottom right,
  secondary first and the green primary last.
- **Popover and menu.** White, 8px corners, the ring-and-drop shadow, 12px top and bottom padding,
  no side padding. Rows are 28px, 15px, padded 24px; under the pointer they fill blue edge to edge
  with white text. Destructive rows are red, last, after a hairline.
- **Tooltip.** Black with white Bold 13px, 6px corners, 4 × 8px padding.
- **Spinner.** The send green, in buttons and small areas only.
- **Skeleton.** Faint ink rounded squares and bars at text sizes.

**AI and chat**
- **Chat.** The message list.
  - No bubbles. A row is a 36px rounded-square face, then the name (15px Black) and the time
    (12px muted) on one line, then the text (15px, 22px line) directly under it.
  - Rows have 8px above and below and 20px at the sides; they take `#f8f8f8` on hover.
  - Mentions are blue on the blue tint with 4px corners; a mention of you is on the yellow, and
    the whole row takes the yellow with a 3px yellow bar on the left.
  - Reactions are 24px round chips under the message: the emoji and a count on `#f8f8f8`; yours is
    on the blue tint with a blue edge; a last chip adds a reaction.
  - Replies sit under the message: the repliers' faces at 24px, the count in blue Black and the
    time of the last reply in muted text.
  - An app's message carries an "APP" tag and lays its content out in blocks: a Bold title, fields
    in two columns, and buttons (the primary green).
- **Composer.** An 8px box with a control-strength edge. A formatting bar on `#f8f8f8` along its top
  (Bold, italic, strikethrough, link, lists, quote, code); the text; then a round "+", the
  formatting, emoji and mention tools, clip and audio, a shortcut tool, and the green split send on
  the right. The thread pane's composer adds "Also send to the room" under it.
- **Thinking.** A muted line ("Hollis is typing…") with three pulsing dots, under the composer.
- **Tool call.** A hairline row with a 16px icon, the name in Bold and a status badge.
- **Citation.** A small grey chip with a number; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns red and the message replaces the help under the field, after an
  alert icon. Validate on blur and on submit.
- **In a form:** a red banner above the form saying what didn't happen ("The route wasn't added").
  Each field shows its own message.
- **A message:** a failed message stays in the list on the red tint with "Not sent. Try again or
  delete it".
- **Somewhere else:** a toast with a red icon, what failed and what to do. Success toasts close
  themselves after a few seconds. Connection problems are a yellow banner over the conversation.
- **A whole page:** a small white card on the page, a warning icon in red before a 32px Black title
  that ends in an ellipsis or a plain phrase, then one or two sentences at 18px with an underlined
  blue link.
  - **404:** "We've lost the chart…", back to your rooms.
  - **500:** "Rough water on our side": nothing was lost, try again.
  - **403:** "Skippers only": the room is private, ask its owner.
- **Words.** Plain and calm. Say what happened, whether anything was lost, and what to do next. A
  little warmth is fine; blame and jargon are not.

## Page shapes (recipes)

- **Dashboard.** The app's home: the frame with search and the rail, the channel list, a room with
  its header, member stack and icon tabs, a date pill, message rows with reactions, a mention of you
  on the yellow, replies under a message, a shared file, the red new-messages line, an app message
  in blocks, the composer, and the thread pane on the right.
- **List and detail.** A directory of people: a search well, filter selects and a count; a framed
  table with faces, presence, roles and a Message button; the selected row on the blue tint; the
  profile pane on the right with a large face, name, title, status, local time, three buttons and
  label-over-value groups.
- **Onboarding.** Setting up a workspace: a live preview of the channel list on the plum on the left;
  on the white panel the step, a very large Black question, one sentence, a large input with a
  character count, a short checklist, Next and a quiet Skip.
- **Settings.** The preferences panel over the frame: the title and close over a hairline; the
  section list with the blue current row; choice cards with a blue edge when chosen, checkboxes
  with hints, selects and a switch.
- **Empty state.** The view's bar with pill filters, then a centred rounded-square icon tile on the
  pale brand tint, a Black title, a sentence or two, a primary and a secondary button.
- **Pricing.** The marketing face: a white navbar, a centred geometric headline, four plans joined in
  one hairline frame with the featured plan edged in the brand colour under a capitals label tab,
  capitals buttons, tick lists in the brand colour, a comparison table and questions.
- **Errors.** The field, form, message, banner, toast and full-page errors above, as one page.

## Words

- Plain, short and in sentence case: "No handovers waiting", "Invite crew", "Also send to
  #north-crossing".
- Name things by what people do: rooms, threads, replies, people.
- Times are clock times today ("08:03"), then "Yesterday at 17:40", then dates.

## Do and don't

| Do | Don't |
| --- | --- |
| Wrap the app in the aubergine frame and keep the page white | Put content on the aubergine, or tint the conversation panel |
| Keep green for sending and the one primary action | Use green for links, selection or decoration |
| Use the blue for links, the current row, checked controls and your own reactions | Mix the blue and the green on the same job |
| Show unread as Bold white rows and mentions as red counts | Show unread with dots alone, or colour channel names |
| Keep message rows flat beside rounded-square faces | Use chat bubbles or round faces |
| Put the formatting bar inside the composer, on top | Hide formatting behind a menu by default |
| Use the same icon for the same action | Mix icon sets or stroke weights |
